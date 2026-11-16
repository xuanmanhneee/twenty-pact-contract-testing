# Task của Phước (2312716)

Nhiệm vụ theo báo cáo giữa kỳ: **thiết kế scenario, viết consumer test, thu thập log/metrics**.
Chỉ sửa: `tests/consumer.test.js`, `tests/queries.js`, file này. Không sửa auth-proxy, provider verify, docker, tài liệu kiến trúc (phần của Mạnh, Luyến).

Cập nhật lần cuối: 16/11/2026 (mã số sinh viên theo yêu cầu: 2312716; bản cũ ghi 2312714).

## 0. Môi trường (xong)
- [x] Twenty v2.46.0 chạy bằng Docker trên máy Phước (`/healthz` ok)
- [x] Tạo tài khoản/workspace, lấy phiên `sess_...` vào `token.txt`
- [x] `npm install`, `npm run test:consumer`: 6/6 pass
- [x] `npm run test:provider` (qua auth-proxy): 5/6 pass, riêng I-07 fail do proxy chèn Origin (xem mục 4)
- [ ] Workspace đặt tên `dlu-qa`, có dữ liệu mẫu People/Companies (hỏi Mạnh cách nạp, nếu chưa có)
      Quy ước hợp đồng dùng `dlu-qa`; workspace Docker hiện tên `phuoc` (cần Mạnh xác nhận cấp/đổi tên, xem mục 4),
      có 5 People, 5 Companies, 6 Opportunities.

## 1. Thiết kế scenario (bảng E.1 trong báo cáo)
Mỗi interaction cần ghi rõ: precondition, input, expected.
Nguồn query: bắt trực tiếp request/response thật của twenty-front v2.46.0 bằng Chromium
(playwright-core, cookie phiên thật, các trang `/objects/people`, `/objects/companies`,
`/objects/opportunities`, `/settings/profile`); đã đối chiếu từng byte với `tests/queries.js`.

- [x] I-01 FindManyPeople, phiên hợp lệ
- [x] I-02 FindManyCompanies
- [x] I-05 GetCurrentUser (endpoint `/metadata`, không phải `/graphql`)
- [x] I-07 Thiếu Origin, HTTP 403 `CSRF_ORIGIN_MISMATCH`
- [ ] I-03 Tạo Person (mutation): chưa làm — cần provider state tạo + dọn dữ liệu thật; xem mục 4
- [x] I-04 Xem Opportunities (làm thêm, ngoài mức tối thiểu)

| ID | Precondition | Input | Expected |
|---|---|---|---|
| I-01 | Workspace có ≥ 1 Person; phiên hợp lệ | POST `/graphql`, `FindManyPeople`, `filter={}, limit=60, orderBy=[{position:AscNullsFirst}]`, cookie `twenty-session=valid-session`, Origin `http://localhost:3000` | 200, `data.people.edges[].node` có `id`, `name`, `emails`, `jobTitle`; có `pageInfo`, `totalCount` |
| I-02 | Workspace có ≥ 1 Company; phiên hợp lệ | POST `/graphql`, `FindManyCompanies`, cùng variables như I-01 | 200, `data.companies.edges[].node` có `id`, `name`, `domainName.primaryLinkUrl`; có `pageInfo`, `totalCount` |
| I-04 | Workspace có ≥ 1 Opportunity; phiên hợp lệ | POST `/graphql`, `FindManyOpportunities`, cùng variables như I-01 | 200, node có `id`, `name`, `amount.amountMicros`, `amount.currencyCode`, `closeDate`, `company.id/name` |
| I-05 | Người dùng đã đăng nhập | POST `/metadata`, `GetCurrentUser`, `variables={}` | 200, `data.currentUser` có `id`, `email`, `onboardingStatus`, `currentWorkspace.id/displayName`, `workspaceMember.id/name` |
| I-06 | Phiên sai | POST `/graphql`, `FindManyPeople`, cookie `twenty-session=session-sai` | 200 (Twenty không đổi status), `errors[].message` là lỗi validate schema |
| I-07 | Phiên hợp lệ nhưng thiếu Origin | POST `/graphql`, `FindManyPeople`, cookie hợp lệ, **không** gửi Origin | 403, body chính xác `{statusCode:403, messages:["Request origin is not allowed for cookie-authenticated requests"], error:"CSRF_ORIGIN_MISMATCH"}` (không có `extensions`; đã probe, xem `logs/probe-i07-body.json`) |

## 2. Viết consumer test
Truy vấn phải lấy từ request thật của twenty-front (DevTools, tab Network), không tự bịa.
- [x] I-01, I-06 (giữ nguyên baseline)
- [x] I-02: `FIND_MANY_COMPANIES_QUERY`/`_VARIABLES` trong `tests/queries.js`, test trong `tests/consumer.test.js`
- [x] I-05: `GET_CURRENT_USER_QUERY`/`_VARIABLES`, test gọi `/metadata`
- [x] I-07: test không gửi Origin, kỳ vọng 403 + body CSRF thật (đã probe)
- [x] I-04: `FIND_MANY_OPPORTUNITIES_QUERY`/`_VARIABLES`, test
- [ ] I-03 (mutation CreatePerson): chưa làm, xem mục 4
- [x] `npm run test:consumer` xanh với 6 interaction, `pacts/twenty-front-twenty-server.json` được sinh lại (6 interaction)

Ghi chú kỹ thuật:
- `GetCurrentUser` của twenty-front v2.46.0 đi qua `/metadata`; 5 interaction còn lại đi `/graphql`.
- Query/response được đối chiếu `actual === network request` (cùng độ dài, từng dòng) trước khi viết test.
- Header `x-app-version: v2.46.0` giữ như front gửi.
- I-07 khóa đúng giá trị thật (không dùng matcher kiểu): `statusCode: 403`, `error: CSRF_ORIGIN_MISMATCH`,
  `messages` nguyên văn. Twenty v2.46.0 **không** trả `extensions.code`; bằng chứng probe:
  `logs/probe-i07-body.json` (403, `{"statusCode":403,"messages":[...],"error":"CSRF_ORIGIN_MISMATCH"}`).
- Đã gom 4 helper fetch trùng cấu trúc về `postJson` (review 16/11); tên cũ `postGraphql` không còn vì
  helper dùng chung cho cả `/graphql` và `/metadata`.

## 3. Thu thập log/metrics (mục G.2)
- [x] Số interaction pass/fail mỗi lượt chạy
- [x] Thời gian chạy consumer và verifier
- [x] Log lượt chạy bình thường và lượt phá hợp đồng (`BREAK=1`)
- [x] Ảnh chụp/log làm bằng chứng cho F3 (Companies), F4 (người dùng hiện tại)

Tóm tắt (chi tiết trong `logs/metrics.md`):
- Consumer bình thường: 6/6 pass, 1,49 s (vitest), 2,7 s tường.
- Provider qua 4002: 5/6 pass (I-07 fail vì proxy chèn Origin), 2,12 s.
- Provider chẩn đoán qua proxy điều kiện 4003: 6/6 pass — chứng minh hợp đồng đúng, 1,3 s.
- `BREAK=1` (jobTitle → jobTitleName): consumer 6/6 pass; verify qua 4003 chỉ I-01 fail
  ("Actual map is missing the following keys: jobTitleName") — đúng kỳ vọng.
- Log: `logs/consumer-run-*.log`, `logs/provider-run-*.log`; ảnh: `logs/f3-companies.png`,
  `logs/f4-current-user.png`, `logs/people.png`, `logs/opportunities.png`.

## 4. Cần nhờ người khác (ngoài phạm vi của Phước)
### Mạnh
- [ ] **BLOCKER I-07 (chờ Mạnh, Phước không sửa file của Mạnh):** `tests/provider.verify.test.js`
      đang đặt Origin cho **mọi** request trong `requestFilter`, nên I-07 (hợp đồng đúng: thiếu Origin
      ⇒ 403) nhận 200 và fail khi verify qua cổng 4002. `tests/auth-proxy.mjs` cũng luôn gán
      `origin`. Đề xuất: **chỉ đặt Origin khi request gốc có Origin**.
      ```js
      // provider.verify.test.js
      requestFilter: (req, _res, next) => {
        if (req.headers['origin']) req.headers['origin'] = ORIGIN;
        if (req.headers['cookie'] === 'twenty-session=valid-session') {
          req.headers['cookie'] = `twenty-session=${SESSION}`;
        }
        next();
      },
      ```
      ```js
      // auth-proxy.mjs
      const headers = { ...req.headers, host: TARGET.host };
      if (req.headers.origin) headers.origin = ORIGIN;
      ```
      Đã chứng minh bằng proxy điều kiện cổng 4003 (không sửa file repo): 6/6 OK, gồm I-07 khóa
      đúng `statusCode/error/messages`. Log: `logs/provider-run-review-fix-diagnostic.log`.
- [ ] **Provider state còn thiếu handler** trong `tests/provider.verify.test.js` (hiện chỉ có
      `workspace có ít nhất 1 Person`, `token không hợp lệ`). Verifier hiện chỉ WARN rồi chạy tiếp,
      nhưng nên thêm cho đủ (đừng để Phước tự thêm):
      1. `workspace có ít nhất 1 Company` — dùng bởi I-02 (`tests/consumer.test.js`)
      2. `workspace có ít nhất 1 Opportunity` — I-04
      3. `người dùng đã đăng nhập vào workspace` — I-05
      4. `phiên hợp lệ nhưng request thiếu Origin` — I-07
- [ ] Nếu làm I-03: cần provider state tạo Person và teardown xóa Person sau mỗi lượt verify
      (tránh rác dữ liệu + lặp lại được). Nếu không, ghi rõ I-03 ngoài phạm vi.

### Câu hỏi cho Mạnh
1. Đồng ý sửa `requestFilter` + `auth-proxy` theo hướng "chỉ đặt Origin khi request có Origin" chứ?
   Nếu không, có thể cấu hình verifier chạy I-07 trực tiếp cổng 3000 (không proxy) không?
2. Thống nhất dùng `dlu-qa` làm tên chuẩn trong hợp đồng: Mạnh đổi tên workspace Docker hiện tại
   (`phuoc`) hay cấp workspace `dlu-qa` riêng? Có cần nạp thêm People/Companies không
   (hiện 5/5, Opportunities 6)?
3. I-03 CreatePerson có nằm trong phạm vi báo cáo không? Nếu có, ai làm provider state dọn dẹp?
4. Báo cáo có cần ghi rõ I-05 dùng `/metadata` (khác `/graphql`) không? (Phước đã ghi trong scenario.)

## Ghi chú tiến độ
- 16/11: dựng xong môi trường, baseline 2 interaction pass cả consumer và provider.
- 16/11: bắt request thật bằng Chromium; thêm I-02, I-04, I-05, I-07; consumer 6/6 pass;
  provider 5/6 pass (I-07 chờ Mạnh sửa Origin/proxy); log + ảnh F3/F4 đã lưu trong `logs/`.
- 16/11: dọn nợ review trong phạm vi Phước: đổi `postGraphql` → `postJson` (dùng chung cho
  `/graphql` và `/metadata`), sửa tiêu đề I-01/I-06 từ "access token" thành "phiên" cho đúng
  cơ chế cookie `twenty-session`, thống nhất tên chuẩn `dlu-qa` trong hợp đồng/tài liệu.