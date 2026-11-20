# Danh mục interaction

Hợp đồng: `pacts/twenty-front-twenty-server.json` (consumer `twenty-front`, provider `twenty-server`), sinh từ `tests/consumer.test.js`.
Truy vấn và biến của từng interaction nằm trong `tests/queries.js`.

Request chung (trừ I-07): header `Content-Type: application/json`, `Cookie: twenty-session=valid-session`,
`Origin: http://localhost:3000`, `x-app-version: v2.46.0`.

| ID | Provider state | Endpoint | Operation |
|---|---|---|---|
| I-01 | `workspace có ít nhất 1 Person` | `/graphql` | `FindManyPeople` |
| I-02 | `workspace có ít nhất 1 Company` | `/graphql` | `FindManyCompanies` |
| I-03 | `workspace sẵn sàng tạo Person I-03` | `/graphql` | `CreateOnePerson` (mutation) |
| I-04 | `workspace có ít nhất 1 Opportunity` | `/graphql` | `FindManyOpportunities` |
| I-05 | `người dùng đã đăng nhập vào workspace` | `/metadata` | `GetCurrentUser` |
| I-06 | `token không hợp lệ` | `/graphql` | `FindManyPeople` |
| I-07 | `phiên hợp lệ nhưng request thiếu Origin` | `/graphql` | `FindManyPeople` |

## Chi tiết
| ID | Precondition | Input | Expected |
|---|---|---|---|
| I-01 | Có ≥ 1 Person; phiên hợp lệ | `variables: {filter: {}, limit: 60, orderBy: [{position: AscNullsFirst}]}` | 200; `data.people.edges[].node` có `id`, `name`, `emails`, `jobTitle`; có `pageInfo`, `totalCount` |
| I-02 | Có ≥ 1 Company; phiên hợp lệ | Biến như I-01 | 200; `data.companies.edges[].node` có `id`, `name`, `domainName.primaryLinkUrl`; có `pageInfo`, `totalCount` |
| I-03 | Fixture UUID chưa tồn tại; phiên hợp lệ | `variables: {input: {id: "d05b3c0b-1da6-4a73-852b-6ad2b77f7d9e", position: "first"}}` | 200; `data.createPerson` có `id` đúng fixture, `name`, `emails`, `jobTitle`, `position`, `createdAt`, `createdBy`. Response thật có tên/email/jobTitle rỗng, `position = -1` |
| I-04 | Có ≥ 1 Opportunity; phiên hợp lệ | Biến như I-01 | 200; node có `id`, `name`, `amount.amountMicros`, `amount.currencyCode`, `closeDate`, `company.id/name` |
| I-05 | Đã đăng nhập | `variables: {}` | 200; `data.currentUser` có `id`, `email`, `onboardingStatus`, `currentWorkspace.id/displayName`, `workspaceMember.id/name` |
| I-06 | Phiên sai (`session-sai`) | Như I-01 | 200 (Twenty không đổi status); `errors[].message` là lỗi validate schema |
| I-07 | Phiên hợp lệ, **không gửi Origin** | Như I-01 | 403; body chính xác `{statusCode: 403, messages: ["Request origin is not allowed for cookie-authenticated requests"], error: "CSRF_ORIGIN_MISMATCH"}` (không có `extensions`) |

## Ghi chú theo từng interaction
- **I-03** là mutation duy nhất. Verify tạo bản ghi thật, nên state handler tự xóa fixture trước (`setup`) và sau (`teardown`) mỗi lượt:
  `DeleteOnePerson` rồi `DestroyOnePerson` (xóa vĩnh viễn, không chỉ soft-delete). Chứng cứ dọn tay trước khi có teardown tự động: `logs/provider-run-i03-cleanup.json`.
- **I-05** đi qua `/metadata`, khác 6 interaction còn lại.
- **I-06** mô tả đúng hành vi thật: lỗi xác thực của GraphQL trả HTTP 200, không phải 401.
- **I-07** khóa giá trị thật. Twenty v2.46.0 không trả `extensions.code`; bằng chứng: `logs/probe-i07-body.json`.
- Truy vấn mẫu thật của I-03: `logs/probe-i03-query.graphql`, `logs/probe-i03-mutation.json`.

## Thêm interaction mới
1. Bắt request thật từ `twenty-front` bằng DevTools (tab Network), lưu vào `logs/`.
2. Đặt `*_QUERY` và `*_VARIABLES` vào `tests/queries.js`, đối chiếu byte với request thật.
3. Viết test trong `tests/consumer.test.js` bằng `postJson`; đặt tên `I-xx <Operation> <điều kiện>`.
4. Thêm provider state tương ứng trong `tests/provider.verify.test.js`.
5. Chạy `npm run test:consumer` rồi `npm run test:provider`, cập nhật bảng này.
