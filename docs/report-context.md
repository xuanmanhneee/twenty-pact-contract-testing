# Context để viết báo cáo cuối kỳ

Tài liệu nền cho người viết báo cáo (và slide): yêu cầu của giảng viên, sự thật đã kiểm chứng của dự án, nơi tìm bằng chứng cho từng phần, và những điểm cần nói thật. Cập nhật lần cuối: 21/11/2026. Danh sách việc: [../TASKS.md](../TASKS.md).

## 1. Yêu cầu nộp và bảo vệ
Đề tài R10 (Twenty CRM) × K04 (Contract Testing, Pact). Môn Kiểm thử Phần mềm, ĐH Đà Lạt, GV Nguyễn Thế Lâm. Nhóm 12.

**Hồ sơ nộp lên LMS** (thầy bổ sung 21/11/2026, nộp trước buổi bảo vệ 1 tuần, khoảng đầu tháng 12/2026; ngày chính xác hỏi giảng viên):
1. **Báo cáo cuối kỳ**, theo cấu trúc 8 phần A đến H (thầy nhắc "mục A phần 6 trong file hướng dẫn"; nhiều khả năng là tiêu chí đánh giá A ở mục 1.1 bên dưới, chưa xác nhận được với PDF `archive/ban_phan_cong_de_tai.pdf`).
2. **Bản phân chia công việc và đóng góp của từng cá nhân thông qua peer review.**
3. Nộp kèm mã nguồn kiểm thử (đề bài) và, theo đề bài, báo cáo tổng kết.

**Tại buổi bảo vệ:** thuyết trình toàn bộ dự án, demo script tự động, và **trình bày lịch sử công việc và commit Git** để chứng minh cả nhóm tham gia đều đặn.

**Tiêu chí chấm** (`archive/context-de-tai-kiem-thu.md`): (1) báo cáo chuyên môn và mã nguồn: hiểu và áp dụng đúng Contract Testing, scenario cụ thể, mã chạy tự động, hướng dẫn cài đặt rõ; (2) quản trị dự án và thuyết trình: commit đều, slide gọn, trả lời đúng trọng tâm; (3) peer evaluation.

### 1.1 Tiêu chí A: đánh giá báo cáo chuyên môn và mã nguồn (nguyên văn từ thầy) và đối chiếu
| Tiêu chí của thầy | Bằng chứng hiện có | Còn thiếu để đạt tốt |
|---|---|---|
| Trình bày mục tiêu hệ thống, vẽ lại luồng dữ liệu cơ bản ở mức dễ hiểu | `architecture.md` (Mermaid) | Sơ đồ ảnh đơn giản cho người không chuyên: người dùng, twenty-front, GraphQL, twenty-server, DB; luồng "xem People" và "tạo Person" từng bước (TASKS 2.1, 2.3, 3.1). Tránh thuật ngữ nội bộ |
| Hướng dẫn cài đặt rõ để giảng viên dựng lại và chạy thử (khuyến khích Docker) | `README.md`, `setup.md`, `docker/` | **Giảng viên phải làm theo được mà không cần Mạnh.** Cần: chạy lại trên máy sạch (TASKS 4.3), chốt `dlu-qa` và dữ liệu mẫu (1.1), cách lấy phiên `twenty-session` từng bước kèm ảnh, nhắc lỗi hay gặp (proxy môi trường, Docker tắt, phiên hết hạn). Điểm yếu lớn nhất hiện nay: phiên lấy thủ công, hết hạn nhanh |
| Cho thấy hiểu kỹ thuật kiểm thử và biết vận dụng vào dự án | `contract-testing.md`, thí nghiệm M-0 đến M-6 | Giải thích bằng lời của nhóm: vì sao chọn contract testing cho cặp front-back của Twenty, hợp đồng nằm ở đâu, ai sinh ai verify; so với integration/E2E; nêu ranh giới (chỉ hình dạng dữ liệu) |
| Scenario mô tả cụ thể; mã test gọn, chạy tự động, sinh kết quả | `interactions.md`, `tests/`, `npm run test:consumer`, `test:provider`, `experiments` | Một lệnh duy nhất chạy toàn bộ và in tóm tắt (cân nhắc script `npm run all`); kiểm tra mã gọn (không còn file thừa, tên rõ); nơi lưu kết quả cố định (`logs/`, `logs/experiments/summary.md`) |
| Từ kết quả chỉ ra lỗi phần mềm (nếu có) hoặc giải thích ý nghĩa log/kết quả | Bảng defect KI-1 đến KI-4 (mục 5), kết quả M-0 đến M-6 | Phân biệt rõ: lỗi do môi trường/harness của nhóm (KI-1, KI-4) khác lỗi của phần mềm Twenty. Chưa phát hiện lỗi của Twenty; phải nói thẳng và dùng mục "nếu không có lỗi phải chứng minh" (phần G): dẫn M-0 pass, M-2/3/4 fail đúng chỗ, M-6 không báo động giả. Giải thích từng loại log: dòng `OK/FAILED` của Verifier, `Actual map is missing the following keys`, `expected 200 but was 403` nghĩa là gì |

## 2. Cấu trúc báo cáo A đến H và nguồn trong repo
| Phần | Nội dung bắt buộc | Nguồn trong repo | Tình trạng |
|---|---|---|---|
| A | Mục tiêu hệ thống, actor/use case, cây thư mục/module, dependency, luồng dữ liệu | `architecture.md`, `archive/bao_cao_giua_ky_milestone_2.md` mục A, `VERSIONS.md` | Cần viết lại gọn; chưa có `tree -L 2` và danh sách dependency |
| B | Sơ đồ kiến trúc + giải thích 3 đến 5 module liên quan kiểm thử | `architecture.md` (Mermaid, còn vẽ Verifier qua auth-proxy, cần sửa) | Cần xuất ảnh |
| C | Môi trường, phiên bản, lệnh build/run, DB/service, seed data; bằng chứng chạy; ≥ 3 luồng nghiệp vụ | `setup.md`, `VERSIONS.md`, `logs/*.png` | Thiếu chạy lại trên máy sạch, chốt `dlu-qa` |
| D | Nguyên lý, phạm vi, giả định, rủi ro, tiêu chí pass/fail | `contract-testing.md` | Cập nhật rủi ro đã xử lý |
| E | Scenario/test case: input, precondition, expected, dữ liệu, kỹ thuật thiết kế | `interactions.md`, `TASK_PHUOC.md` mục 1 | Đủ nội dung, cần trình bày |
| F | Mã nguồn chạy lại tự động, README lệnh chạy + dependency | `README.md`, `tests/`, `package.json` | Có; cần kiểm trên máy sạch |
| G | Log/report/metrics, defect hoặc hành vi bất thường + nguyên nhân; nếu không có lỗi phải chứng minh coverage/score | `testing.md`, `known-issues.md`, `logs/metrics.md`, `logs/experiments/` | Có số liệu; cần gom thành bảng và RCA |
| H | Commit/tag, cấu hình test, cách người khác chạy lại trên máy mới | `VERSIONS.md`, `README.md` | Chưa có tag |

## 3. Tóm tắt dự án (dùng làm mở đầu)
- **Hệ thống:** Twenty CRM v2.46.0 chạy bằng Docker (image pin theo digest, kèm PostgreSQL 16 và Redis). Frontend `twenty-front` gọi backend `twenty-server` qua GraphQL ở `/graphql` (dữ liệu) và `/metadata` (người dùng hiện tại, metadata).
- **Kỹ thuật:** consumer-driven contract testing bằng Pact (`@pact-foundation/pact` 16.5.0, Node ≥ 22, vitest). Consumer = twenty-front, provider = twenty-server.
- **Cách làm:** Consumer test sinh hợp đồng `pacts/twenty-front-twenty-server.json` từ các request mà twenty-front thật gửi (bắt bằng Chromium, đối chiếu từng byte với `tests/queries.js`). Verifier phát lại từng request vào Twenty thật và so response với hợp đồng.
- **Phạm vi:** 7 interaction trong 4 luồng: xem People, xem Companies, xem Opportunities, tạo Person, người dùng hiện tại, và 2 trường hợp lỗi (phiên sai, thiếu Origin). Chỉ kiểm hình dạng dữ liệu (status, header, cấu trúc và kiểu body), không kiểm nghiệp vụ hay hiệu năng.

| ID | Mô tả | Endpoint |
|---|---|---|
| I-01 | FindManyPeople, phiên hợp lệ | `/graphql` |
| I-02 | FindManyCompanies | `/graphql` |
| I-03 | CreateOnePerson (mutation, fixture UUID cố định) | `/graphql` |
| I-04 | FindManyOpportunities | `/graphql` |
| I-05 | GetCurrentUser | `/metadata` |
| I-06 | Phiên sai: vẫn HTTP 200, `errors[]` lỗi validate schema | `/graphql` |
| I-07 | Thiếu Origin: 403 `CSRF_ORIGIN_MISMATCH` | `/graphql` |

## 4. Kết quả để trích (nguồn: `testing.md`, `logs/`)
- Consumer: 7/7 pass (1,11 s lượt 21/11). Provider verify: 7/7 pass, gọi thẳng `:3000` (21/11, sau khi sửa KI-1 và KI-4).
- Thời gian verify từng interaction (lượt cũ qua proxy): I-01 131 ms, I-02 41 ms, I-03 92 ms, I-04 52 ms, I-05 128 ms, I-06 40 ms, I-07 59 ms. Cần đo lại lượt gọi thẳng khi chạy mục 1.2 của TASKS.md.
- **Thí nghiệm phá hợp đồng phía provider** (proxy sửa JSON response; server thật không bị sửa; mỗi lượt chạy một lần, ~2,7 đến 3,3 s): M-0 (không đổi) 7/7 OK; M-2, M-3, M-4 làm fail đúng các interaction dùng field bị đổi; M-6 (chỉ thêm field) không làm fail interaction nào. Kết luận: không báo động giả, mỗi loại đổi tên/xóa/đổi kiểu làm ít nhất 1 interaction fail, khớp tiêu chí D.6. Bảng đầy đủ: `testing.md`; bằng chứng: `logs/experiments/`.
- **Thí nghiệm phía consumer** (`BREAK=1`, đổi `jobTitle` thành `jobTitleName`): consumer vẫn pass (nó tự sinh hợp đồng), provider chỉ I-01 fail ("Actual map is missing the following keys: jobTitleName"). Mới đo trên bộ 6 interaction cũ.
- Điểm đáng nhấn mạnh: status code vẫn 200 và header vẫn khớp nhưng body sai; chỉ kiểm status sẽ bỏ sót lỗi.

## 5. Defect và hành vi bất thường (phần G, nội dung RCA)
| Mã | Hiện tượng | Nguyên nhân gốc | Xử lý |
|---|---|---|---|
| KI-1 | I-07 fail khi verify qua auth-proxy (nhận 200, kỳ vọng 403) | Proxy và `requestFilter` đặt Origin cho mọi request, kể cả request cố ý không có Origin | Chỉ đặt Origin khi request gốc có Origin (835e008) |
| KI-2 | Verifier cảnh báo thiếu provider state | Chưa có handler cho 5 state | Đủ 7 handler (9b65561) |
| KI-3 | I-03 tạo Person thật, chạy lặp bị trùng UUID, để rác | Không có teardown | `setup`/`teardown` tự xóa mềm rồi xóa vĩnh viễn |
| KI-4 | Gọi thẳng Twenty, 5 interaction dùng phiên hợp lệ bị 403 | Verifier gửi `Host: 127.0.0.1:<cổng ngẫu nhiên>`; Twenty đối chiếu Origin với Host. Cùng cookie và Origin, Host `localhost:3000` cho 200, Host `127.0.0.1:*` cho 403 | `requestFilter` đặt lại Host (757e3d3) |

Hành vi của Twenty v2.46.0 phát hiện khi viết test (đều có bằng chứng trong `logs/`): phiên sai trả HTTP 200 chứ không 401 (lỗi validate schema, vì request chưa đăng nhập không thấy `people`); 403 CSRF không có `extensions.code` (body `{statusCode, messages, error}`); `GetCurrentUser` đi qua `/metadata`.

## 6. Giới hạn cần nói thật (báo cáo và khi bảo vệ)
- M-2, M-3, M-4 chỉ mô phỏng ở lớp proxy, chưa sửa mã nguồn Twenty thật; mỗi lượt chạy một lần, chưa đo độ ổn định.
- Image `v2.46.0` đã pin theo digest nhưng source đối chiếu (`a61e47d`) chưa khớp tuyệt đối với image; kết quả không phụ thuộc source.
- Phiên đăng nhập lấy thủ công từ cookie `twenty-session`, hết hạn nhanh; mỗi lần chạy lại cần phiên mới.
- Workspace Docker tên `phuoc`, hợp đồng quy ước `dlu-qa` (chưa thống nhất); chưa có cách nạp dữ liệu mẫu chung (hiện 5 People, 5 Companies, 6 Opportunities).
- Chưa chạy lại trên máy sạch; chưa có tag; chưa có link Trello/Jira.
- Hợp đồng sinh từ request thật của twenty-front, không phải từ một CI của chính Twenty: đây là bài tập QA bên ngoài dự án, không có broker (Pact Broker) và không tích hợp CI.

## 7. Đóng góp và lịch sử commit (dữ liệu cho peer review và phần trình bày Git)
Số commit trên toàn repo tại 21/11/2026 (`git shortlog -sn --all`): `xuanmanhneee` (Mạnh) 12, `Phuocmai` (Phước) 6, Luyến 0.

| Người | MSSV | Việc đã làm có bằng chứng |
|---|---|---|
| Phan Lê Xuân Mạnh | 2312686 | Dựng Docker, pin phiên bản, baseline Pact (f52e2cc, 19/10); auth-proxy; provider verify; sửa KI-1 đến KI-4; state handler và teardown; thí nghiệm M-0 đến M-6; chuẩn hóa `docs/` |
| Mai Quý Phước | 2312716 (báo cáo cũ ghi 2312714, sai) | Thiết kế scenario; bắt request thật bằng Chromium; consumer test I-02 đến I-07; `postJson`; log/metrics và ảnh F3, F4 (6 commit, 16/11) |
| Liêng Hót Ha Luyến | 2312682 | Chưa có commit. Phân công đề xuất: kiến trúc, sơ đồ, data flow, onboarding. Cần ghi nhận đóng góp thật hoặc giao việc ở TASKS.md mục 2, 3, 5.1 |

**Cảnh báo:** lịch sử commit hiện không đều (toàn bộ commit của Mạnh dồn vào 19/10 và 21/11, Phước dồn vào 16/11). Thầy yêu cầu trình bày lịch sử này khi bảo vệ, nên cần (a) để Luyến và Phước commit thật phần việc còn lại, (b) không sửa lịch sử git, (c) chuẩn bị giải thích trung thực nếu bị hỏi. Peer review dựa trên việc cụ thể, kiểm chứng được, không viết chung chung (như báo cáo giữa kỳ đã nhắc).

Lệnh để trích số liệu cho slide: `git shortlog -sn --all`, `git log --format='%h %an %ad %s' --date=short`, `git log --author=<tên> --stat`.

## 8. Quy ước thuật ngữ và số liệu (để báo cáo nhất quán)
- Dùng "phiên" cho cookie `twenty-session` (không gọi là token/access token).
- Provider state tên tiếng Việt, đang dùng: `workspace có ít nhất 1 Person/Company/Opportunity`, `người dùng đã đăng nhập vào workspace`, `workspace sẵn sàng tạo Person I-03`, `phiên hợp lệ nhưng request thiếu Origin`, `phiên không hợp lệ`.
- Fixture I-03: Person UUID `d05b3c0b-1da6-4a73-852b-6ad2b77f7d9e`, bị xóa vĩnh viễn sau mỗi lượt verify.
- Không đưa phiên `sess_...`, khóa mã hóa, `docker/.env` vào báo cáo, slide hay ảnh chụp (kiểm tra ảnh DevTools trước khi dùng).
- Mọi số liệu trong báo cáo phải kèm nguồn trong `logs/` hoặc `testing.md`; số cũ (qua proxy `:4002`, 6 interaction `:4003`) ghi rõ là lượt cũ.

## 9. Gợi ý mạch trình bày (slide, 8 đến 10 phút)
1. Vấn đề: frontend và backend phụ thuộc vào hình dạng dữ liệu; đổi một field âm thầm làm vỡ UI mà test đơn lẻ không thấy.
2. Contract testing và Pact: consumer viết hợp đồng, provider verify; so sánh nhanh với integration test (nhanh, cô lập, nhưng chỉ kiểm hình dạng).
3. Hệ thống Twenty và phạm vi 7 interaction (sơ đồ ở TASKS.md 3.1).
4. Demo: `npm run test:consumer`, `npm run test:provider` (7/7), rồi một thí nghiệm phá hợp đồng thấy fail đúng chỗ.
5. Bài học: KI-1 (Origin) và KI-4 (Host) là lỗi môi trường chứ không phải lỗi hợp đồng; phiên sai trả 200.
6. Giới hạn và hướng mở rộng: sửa mã thật, Pact Broker, CI.
7. Đóng góp từng người và lịch sử commit.
