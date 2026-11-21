# BÁO CÁO CUỐI KỲ: CONTRACT TESTING (PACT) CHO TWENTY CRM

Môn Kiểm thử Phần mềm, ĐH Đà Lạt. GV: Nguyễn Thế Lâm. Nhóm 12. Đề tài R10 (Twenty CRM) × K04 (Contract Testing, Pact).
Thành viên: Phan Lê Xuân Mạnh (2312686), Liêng Hót Ha Luyến (2312682), Mai Quý Phước (2312716).
Repo: https://github.com/xuanmanhneee/twenty-pact-contract-testing · Tag nộp: ⏳ CHỜ (mục 6.3 TASKS)

> **Cách đọc bản nháp này.** Đây là khung báo cáo đã điền sẵn phần có số liệu thật. Quy ước đánh dấu:
> - `⏳ CHỜ [người / mục TASKS]`: chưa có kết quả hoặc chưa ai viết; không tự điền khi chưa có.
> - `📎 Nguồn:` file trong repo chứa dữ liệu gốc, dùng để đối chiếu hoặc chép số.
> - Phần do người khác phụ trách chỉ có dàn ý; khi họ viết xong (`docs/report/A-he-thong.md`...) thì dán vào đây.
> Trước khi nộp: xóa mọi dấu `⏳`, `📎`, hộp ghi chú này.

---

## 0. Tóm tắt
Nhóm áp dụng consumer-driven contract testing bằng Pact lên cặp `twenty-front` (consumer) và `twenty-server` (provider) của Twenty CRM v2.46.0. Hợp đồng gồm **7 interaction** (4 luồng đọc/ghi dữ liệu, 1 lấy người dùng hiện tại, 2 trường hợp lỗi), sinh từ request thật của twenty-front.
Kết quả ngày 21/11/2026: consumer **7/7**, Verifier gọi thẳng Twenty thật **7/7**. Năm thí nghiệm phá hợp đồng (đổi tên, xóa, đổi kiểu, thêm field, đối chứng) đều cho kết quả đúng kỳ vọng: chỉ các interaction dùng field bị đổi mới fail, không có báo động giả.
Trong quá trình làm, nhóm tìm ra và xử lý bốn vấn đề của harness (KI-1 đến KI-4); chưa phát hiện lỗi nào của chính Twenty. Phần G giải thích vì sao đây vẫn là kết quả có giá trị.
📎 Nguồn: `docs/report-context.md` mục 3, 4.

## 1. Phân công và đóng góp
⏳ CHỜ [cả nhóm, TASKS 7.1, 7.4]: dán bảng cuối cùng từ `docs/report/phan-cong-cong-viec.md` (đã có checklist việc đã xong; còn chờ tỷ lệ peer review).
Quản lý công việc (Trello/Jira/GitHub Projects): ⏳ CHỜ [Mạnh, TASKS 7.2].

---

# PHẦN I. PHÂN TÍCH HỆ THỐNG VÀ MÔI TRƯỜNG

## A. Mô tả hệ thống
⏳ CHỜ [Luyến, TASKS 2.1 đến 2.3] → `docs/report/A-he-thong.md`. Dàn ý:
- **A.1 Mục tiêu:** Twenty CRM là hệ thống quản lý khách hàng (People), công ty (Companies), cơ hội bán hàng (Opportunities).
- **A.2 Actor và use case:** người dùng trong workspace: xem danh sách, tạo Person, xem thông tin tài khoản.
- **A.3 Cấu trúc thư mục và dependency:** `tree -L 2`, bảng dependency (Node ≥ 22, PostgreSQL 16, Redis, Pact 16.5.0, vitest 3.x).
- **A.4 Luồng dữ liệu:** người dùng → twenty-front → `POST /graphql` hoặc `/metadata` → twenty-server → PostgreSQL → phản hồi JSON.
📎 Nguồn: `docs/architecture.md`, `docs/archive/bao_cao_giua_ky_milestone_2.md` mục A, `VERSIONS.md`.

## B. Kiến trúc hệ thống
⏳ CHỜ [Luyến, TASKS 3.1, 3.2] → `docs/report/B-kien-truc.md`. Cần: sơ đồ ảnh (trình duyệt, twenty-front, twenty-server, PostgreSQL, Redis, vị trí Pact), giải thích 3 đến 5 module: twenty-front, GraphQL `/graphql` và `/metadata`, xác thực cookie và CSRF (Origin/Host), PostgreSQL và dữ liệu mẫu, Pact (consumer test, Verifier, provider state).
Lưu ý: sơ đồ trong `docs/architecture.md` còn vẽ Verifier đi qua auth-proxy `:4002`, đã lỗi thời; hiện Verifier gọi thẳng `:3000`.

## C. Môi trường và bằng chứng chạy thành công
### C.1 Môi trường thực tế
| Thành phần | Phiên bản |
|---|---|
| Twenty server/worker | `twentycrm/twenty:v2.46.0` (pin digest `sha256:bb4e94f0...`, build 09/10/2026) |
| PostgreSQL | `postgres:16` (pin digest) |
| Redis | pin digest |
| Node.js | ≥ 22 (đã chạy với v26.13.0 trên Windows 11) |
| Pact | `@pact-foundation/pact` 16.5.0 |
| Test runner | vitest 3.x |
📎 Nguồn: `VERSIONS.md` (digest đầy đủ). Source tham chiếu `a61e47d` chưa khớp tuyệt đối với image; kết quả không phụ thuộc source (⏳ CHỜ: thử tìm tag source khớp, TASKS 6.3).

### C.2 Hướng dẫn dựng hệ thống
1. `cd docker && cp .env.example .env`, điền các giá trị `CHANGE_ME` (mật khẩu PostgreSQL, khóa mã hóa sinh bằng `openssl rand -base64 32`); `docker compose up -d`; kiểm tra `curl http://localhost:3000/healthz`.
2. Mở http://localhost:3000, tạo tài khoản và workspace (đề nghị tên `dlu-qa`, không bắt buộc). Dữ liệu tối thiểu: 1 Person, 1 Company, 1 Opportunity.
3. Lấy phiên: đăng nhập, F12 → Network → request `graphql` → cookie `twenty-session=sess_...`; dán giá trị vào `token.txt`.
4. Gỡ proxy hệ thống (`unset HTTP_PROXY HTTPS_PROXY`), `npm install`, chạy `npm run test:consumer`, `npm run test:provider`.
📎 Nguồn: `README.md`, `docs/setup.md`.
⏳ CHỜ [Luyến, TASKS 4.3]: kết quả chạy lại trên máy sạch theo đúng các bước trên (thời gian, lỗi gặp) → `docs/report/clean-run.md`.

### C.3 Bằng chứng hệ thống chạy được
| Luồng | Bằng chứng | Trạng thái |
|---|---|---|
| F1 Xem People | `logs/people.png`; contract I-01 pass | Có |
| F3 Xem Companies | `logs/f3-companies.png`; contract I-02 pass | Có |
| F4 Người dùng hiện tại | `logs/f4-current-user.png`; contract I-05 pass | Có |
| Xem Opportunities | `logs/opportunities.png`; contract I-04 pass | Có |
| Tạo Person | `logs/probe-i03-people.png`, `logs/probe-i03-mutation.json`; contract I-03 pass | Có |
⏳ CHỜ [Phước, TASKS 4.2]: rà ảnh không lộ cookie; ảnh `/healthz` và màn hình đăng nhập nếu cần.

---

# PHẦN II. ÁP DỤNG CONTRACT TESTING

## D. Cơ sở lý thuyết, phạm vi, giả định, rủi ro, tiêu chí
⏳ CHỜ [Luyến, TASKS 5.1] → `docs/report/D-ly-thuyet.md`. Dàn ý và dữ liệu có sẵn:
- **D.1 Nguyên lý:** consumer viết hợp đồng (request kỳ vọng, response kỳ vọng); provider chạy Verifier phát lại request và so sánh; provider state đưa dữ liệu về trạng thái tiền điều kiện.
- **D.2 Vì sao phù hợp:** front và back của Twenty tách rời, giao tiếp qua GraphQL; đổi tên hoặc xóa field ở server sẽ vỡ UI mà không test đơn lẻ nào thấy.
- **D.3 Phạm vi:** 7 interaction; chỉ kiểm hình dạng dữ liệu (status, header, cấu trúc và kiểu body), không kiểm nghiệp vụ hay hiệu năng.
- **D.4 Giả định:** request lấy từ twenty-front thật (v2.46.0); workspace có dữ liệu tối thiểu; phiên hợp lệ.
- **D.5 Rủi ro đã gặp và xử lý:** CSRF Origin (KI-1), Host (KI-4), dữ liệu rác do mutation (KI-3), thiếu state (KI-2) → xem phần G.
- **D.6 Tiêu chí pass/fail:** 7/7 interaction verify pass; mỗi loại thay đổi (đổi tên, xóa, đổi kiểu) làm ít nhất 1 interaction fail; báo động giả bằng 0.
📎 Nguồn: `docs/contract-testing.md`.

## E. Thiết kế test scenario và test case
Chi tiết (viết bởi Phước): ⏳ CHỜ [Phước, TASKS 5.2, 5.3] → `docs/report/E-scenario.md` (kỹ thuật thiết kế: ca dương, ca âm, thử phá hợp đồng; vì sao query lấy từ request thật).

### E.1 Danh sách interaction
Request chung (trừ I-07): `Content-Type: application/json`, cookie `twenty-session=valid-session` (Verifier thay bằng phiên thật), `Origin: http://localhost:3000`, `x-app-version: v2.46.0`.

| ID | Provider state | Endpoint | Operation | Precondition | Expected |
|---|---|---|---|---|---|
| I-01 | workspace có ít nhất 1 Person | `/graphql` | FindManyPeople | ≥ 1 Person; phiên hợp lệ | 200; `data.people.edges[].node` có `id`, `name`, `emails`, `jobTitle`; có `pageInfo`, `totalCount` |
| I-02 | workspace có ít nhất 1 Company | `/graphql` | FindManyCompanies | ≥ 1 Company | 200; node có `id`, `name`, `domainName.primaryLinkUrl` |
| I-03 | workspace sẵn sàng tạo Person I-03 | `/graphql` | CreateOnePerson (mutation) | fixture UUID `d05b3c0b-...` chưa tồn tại | 200; `data.createPerson` có `id` đúng fixture, `name`, `emails`, `jobTitle`, `position`, `createdAt`, `createdBy` |
| I-04 | workspace có ít nhất 1 Opportunity | `/graphql` | FindManyOpportunities | ≥ 1 Opportunity | 200; node có `id`, `name`, `amount`, `closeDate`, `company` |
| I-05 | người dùng đã đăng nhập vào workspace | `/metadata` | GetCurrentUser | đã đăng nhập | 200; `data.currentUser` có `id`, `email`, `onboardingStatus`, `currentWorkspace`, `workspaceMember` |
| I-06 | phiên không hợp lệ | `/graphql` | FindManyPeople | cookie `session-sai` | 200 (Twenty không đổi status); `errors[].message` lỗi validate schema |
| I-07 | phiên hợp lệ nhưng request thiếu Origin | `/graphql` | FindManyPeople | không gửi Origin | 403; body `{statusCode:403, messages:["Request origin is not allowed for cookie-authenticated requests"], error:"CSRF_ORIGIN_MISMATCH"}` |
📎 Nguồn: `docs/interactions.md`, `tests/queries.js`, `tests/consumer.test.js`.

### E.2 Dữ liệu test và provider state
Dữ liệu: workspace có ≥ 1 Person, 1 Company, 1 Opportunity (workspace của nhóm: 5/5/6). Fixture duy nhất tạo mới là Person của I-03, được `setup`/`teardown` xóa vĩnh viễn (xóa mềm rồi `destroyPerson`) trước và sau mỗi lượt, nên chạy lặp không để rác.

### E.3 Kịch bản phá hợp đồng (negative control)
| Mã | Thay đổi mô phỏng | Phía | Interaction phải fail |
|---|---|---|---|
| M-0 | Đối chứng: proxy chuyển tiếp nguyên vẹn | Provider | (không) |
| M-1 | Hợp đồng đổi `jobTitle` → `jobTitleName` | Consumer | I-01 |
| M-2 | Provider đổi tên `jobTitle` → `jobTitleName` | Provider | I-01, I-03 |
| M-3 | Provider xóa field `amount` | Provider | I-04 |
| M-4 | Provider đổi kiểu `totalCount` số → chuỗi | Provider | I-01, I-02, I-04 |
| M-6 | Provider thêm field `jobTitleExtra` | Provider | (không: tương thích ngược) |
Lưu ý: thay đổi được mô phỏng bằng `mutate-proxy` ở lớp mạng, server Twenty thật không bị sửa.
📎 Nguồn: `docs/testing.md`.

## F. Mã nguồn test và cách chạy lại
| Thành phần | File |
|---|---|
| Truy vấn và biến | `tests/queries.js` |
| Consumer test (sinh hợp đồng) | `tests/consumer.test.js` |
| Hợp đồng sinh ra | `pacts/twenty-front-twenty-server.json` |
| Provider verify, state handler, requestFilter | `tests/provider.verify.test.js` |
| Proxy thí nghiệm | `tests/mutate-proxy.mjs`, `tests/auth-proxy.mjs` (chỉ cho thí nghiệm) |
| Chạy thí nghiệm | `tests/experiments.mjs` |

| Lệnh | Tác dụng |
|---|---|
| `npm run test:consumer` | Sinh hợp đồng từ consumer test |
| `npm run test:provider` | Verifier gọi thẳng Twenty `:3000`, kỳ vọng 7/7 |
| `npm run experiments` | Chạy M-0, M-2, M-3, M-4, M-6, ghi `logs/experiments/` |
⏳ CHỜ [Mạnh, TASKS 6.1]: một lệnh chạy toàn bộ và in tóm tắt; kiểm tra README trên máy sạch.

## G. Log, metrics và phân tích
### G.1 Kết quả chạy (21/11/2026, Windows 11, Node v26.13.0, Pact 16.5.0, Twenty v2.46.0)
| Lượt chạy | Interaction | Pass | Fail | Thời gian vitest |
|---|---|---|---|---|
| Consumer | 7 | 7 | 0 | 1,25 s |
| Provider gọi thẳng `:3000` | 7 | 7 | 0 | 3,16 s |
| Thí nghiệm M-0 | 7 | 7 | 0 | 5,48 s |
| M-2 / M-3 / M-4 / M-6 | 7 | 5 / 6 / 4 / 7 | 2 / 1 / 3 / 0 | 2,96 / 3,10 / 3,05 / 3,00 s |

Thời gian verify từng interaction: I-01 302 ms, I-02 84 ms, I-03 1,10 s (gồm setup và teardown), I-04 81 ms, I-05 103 ms, I-06 18 ms, I-07 16 ms.
📎 Nguồn: `docs/testing.md`, `logs/consumer-run-21-11.log`, `logs/provider-run-direct-21-11.log`, `logs/experiments-run-21-11.log`, `logs/experiments/summary.md`.
⏳ CHỜ [Phước, TASKS 1.3]: `BREAK=1` trên bộ 7 interaction (kỳ vọng fail I-01 và I-03).

### G.2 Ý nghĩa các dòng log của Verifier
⏳ CHỜ [Phước, TASKS 6.2]: giải thích `OK`, `FAILED`, `Actual map is missing the following keys: <field>` (field biến mất), `Expected '5' (String) to be an integer` (đổi kiểu), `expected 200 but was 403` (sai status). Ví dụ thật nằm trong `logs/experiments/M-2.log`, `M-3.log`, `M-4.log`.

### G.3 Hành vi bất thường và nguyên nhân gốc
| Mã | Hiện tượng | Nguyên nhân gốc | Xử lý |
|---|---|---|---|
| KI-1 | I-07 nhận 200, kỳ vọng 403 | Proxy và `requestFilter` đặt Origin cho mọi request | Chỉ đặt Origin khi request gốc có Origin |
| KI-2 | Verifier cảnh báo thiếu state | Chưa có handler cho 5 state | Đủ 7 handler |
| KI-3 | I-03 tạo Person thật, chạy lặp trùng UUID | Không có teardown | `setup`/`teardown` tự xóa |
| KI-4 | Gọi thẳng Twenty, 5 interaction bị 403 | Verifier gửi `Host: 127.0.0.1:<cổng ngẫu nhiên>`, Twenty đối chiếu Origin với Host | `requestFilter` đặt lại Host |

Quan sát về hành vi của Twenty v2.46.0 (không phải lỗi): phiên sai trả HTTP 200 thay vì 401; 403 CSRF không có `extensions.code`; `GetCurrentUser` đi qua `/metadata`.

### G.4 Có phát hiện lỗi của Twenty không?
Chưa. Bốn vấn đề trên là của môi trường và harness của nhóm. Một sản phẩm mã nguồn mở đã bảo trì lâu, ở phạm vi hình dạng dữ liệu của 7 interaction, khó có lỗi nhìn thấy ngay. Thay vì tìm lỗi, nhóm chứng minh hai điều: (1) provider hiện tại thỏa hợp đồng (7/7); (2) hợp đồng **có khả năng phát hiện lỗi** khi provider thay đổi (M-2, M-3, M-4 fail đúng chỗ) và **không báo động giả** (M-0, M-6). Đây là bằng chứng chất lượng cho bộ test.
Giới hạn: thay đổi mô phỏng ở lớp proxy, mỗi lượt chạy một lần; chưa sửa mã nguồn Twenty thật.

## H. Pin phiên bản và tái lập
- Phiên bản đã pin: `VERSIONS.md`; hợp đồng được commit trong `pacts/`; `package-lock.json` khóa phụ thuộc test.
- ⏳ CHỜ [Mạnh, TASKS 6.3]: tag/commit SHA của bản nộp.
- ⏳ CHỜ [Luyến, TASKS 4.3]: chạy lại trên máy sạch (ghi nhận từng bước và kết quả).
- Cách người khác chạy lại: README và `docs/setup.md`. Điều kiện bắt buộc: Docker chạy Twenty, phiên `twenty-session` lấy thủ công (hết hạn nhanh), gỡ biến proxy hệ thống.

## 2. Hạn chế
- Mô phỏng thay đổi ở lớp proxy, chưa sửa mã server thật; chưa đo độ ổn định (lặp nhiều lần).
- Image đã pin nhưng source đối chiếu chưa khớp tuyệt đối.
- Phiên đăng nhập lấy thủ công, hết hạn nhanh; chưa tự động hóa đăng nhập.
- Không có Pact Broker và CI; hợp đồng lưu trong repo.
- Chỉ kiểm hình dạng dữ liệu của 7 interaction, không kiểm nghiệp vụ, hiệu năng hay bảo mật.

## 3. Kết luận
Contract testing bằng Pact kiểm được sự tương thích giữa twenty-front và twenty-server nhanh (vài giây), cô lập, và chạy tự động. Bộ 7 interaction pass trên Twenty thật và phát hiện đúng các thay đổi phá vỡ mô phỏng. Bài học thực tế lớn nhất là các lỗi nằm ở tương tác với cơ chế bảo mật của hệ thống (CSRF qua Origin và Host), không phải ở hình dạng dữ liệu.
⏳ CHỜ: hoàn thiện sau khi có kết quả cuối (mục 1.3, 4.3) và ý kiến của nhóm.
