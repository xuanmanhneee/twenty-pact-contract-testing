# Task của Luyến (2312682)

Nhiệm vụ theo báo cáo giữa kỳ: **phân tích kiến trúc, vẽ sơ đồ, data flow, tài liệu on-boarding**.
Giao ngày 21/11/2026. Danh sách chung của nhóm: [`TASKS.md`](../TASKS.md). Bối cảnh, yêu cầu của thầy và nguồn bằng chứng: [`docs/report-context.md`](report-context.md) (đọc mục 1, 2, 3 trước).

## Cách làm việc (quan trọng, thầy sẽ xem lịch sử commit)
- Clone repo, `git config user.name` và `user.email` là **tài khoản GitHub của chính bạn**, rồi commit và push bằng tài khoản đó. Mạnh sẽ cấp quyền ghi nếu chưa có.
- **Mỗi mục nhỏ một commit**, commit ngay khi xong, không dồn một lần. Tên commit rõ việc, ví dụ `docs(report): viết phần A.1 mục tiêu hệ thống`.
- Chỉ ghi việc bạn thật sự làm. Khi xong mỗi mục, tick vào file này (`[x]`) rồi commit cùng.
- Mỗi mục viết vào **file riêng** trong `docs/report/` để không đụng file của người khác. Không sửa `tests/`, `pacts/`, `docker/`.
- Không đưa phiên `sess_...`, khóa mã hóa, `docker/.env` vào tài liệu hay ảnh chụp. Che cookie trong ảnh DevTools.
- Gặp vướng thì ghi vào mục "Ghi chú" cuối file và nhắn nhóm; đừng tự đoán số liệu.

## 0. Chuẩn bị (làm trước)
- [ ] Clone repo, đọc `README.md`, `docs/README.md`, `docs/architecture.md`, `docs/report-context.md`.
- [x] Dựng Twenty bằng Docker theo `docs/setup.md` (cũng là mục 2 bên dưới). Xem được trang People trên http://localhost:3000.

## 1. Chạy lại trên máy sạch (TASKS 4.3) — ưu tiên cao
Đây là phép thử "giảng viên làm theo được không". Làm **đúng từng bước theo `README.md` và `docs/setup.md`, không hỏi Mạnh trước**, ghi lại mọi chỗ vướng.
- [x] Thực hiện từ đầu: Docker lên, tạo tài khoản và workspace, lấy phiên `twenty-session` vào `token.txt`, `npm install`, `npm run test:consumer`, `npm run test:provider`.
- [x] Ghi vào `docs/report/clean-run.md`: máy và hệ điều hành, phiên bản Docker/Node, từng bước đã làm, thời gian mỗi bước, lỗi gặp và cách khắc phục, kết quả cuối (kỳ vọng consumer 7/7, provider 7/7).
- [x] Chụp ảnh bước lấy phiên (che giá trị cookie) và kết quả 7/7, lưu vào `logs/clean-run/`.
- [x] Liệt kê chỗ hướng dẫn thiếu hoặc sai; gửi Mạnh (hoặc tự sửa `docs/setup.md` và `README.md` nếu là lỗi chính tả hay thiếu bước rõ ràng, commit riêng).
- *Xong khi:* có `clean-run.md` đầy đủ và test chạy 7/7 trên máy của bạn.

## 2. Phần A: mô tả hệ thống → `docs/report/A-he-thong.md` (TASKS 2.1 đến 2.3)
Viết ngắn gọn, dễ hiểu cho người không chuyên (thầy chấm "luồng dữ liệu cơ bản ở mức dễ hiểu").
- [x] **A.1 Mục tiêu hệ thống:** Twenty CRM là gì, giải quyết bài toán nào (quản lý khách hàng, công ty, cơ hội bán hàng).
- [x] **A.2 Actor và use case chính:** ai dùng (người dùng, quản trị workspace), làm gì (xem People/Companies/Opportunities, tạo Person, xem thông tin tài khoản).
- [x] **A.3 Cấu trúc thư mục và dependency:** `tree -L 2` của repo mã nguồn Twenty (source đối chiếu ở `VERSIONS.md`) và của repo nhóm; bảng dependency chính kèm phiên bản (Node, PostgreSQL 16, Redis, Pact 16.5.0, vitest 3.x; xem `VERSIONS.md`, `package.json`, `docker/docker-compose.yml`).
- [x] **A.4 Luồng dữ liệu:** vẽ từng bước cho "xem danh sách People" và "tạo Person" (người dùng, twenty-front, `/graphql`, twenty-server, PostgreSQL) và cho "lấy người dùng hiện tại" (`/metadata`).
- *Nguồn:* `docs/architecture.md`, `docs/archive/bao_cao_giua_ky_milestone_2.md` mục A, `docs/interactions.md`.

## 3. Phần B: kiến trúc → `docs/report/B-kien-truc.md` (TASKS 3.1, 3.2)
- [x] **B.1 Sơ đồ ảnh:** sơ đồ container/component gồm trình duyệt, twenty-front, twenty-server, PostgreSQL, Redis, và **vị trí của Pact** (consumer test, file hợp đồng, Verifier gọi thẳng `:3000`). Xuất PNG hoặc SVG vào `docs/report/img/`. Có thể dựa trên Mermaid trong `docs/architecture.md` (hiện còn vẽ Verifier đi qua auth-proxy `:4002`, **đã lỗi thời**: Verifier gọi thẳng; auth-proxy chỉ dùng cho thí nghiệm. Sửa sơ đồ trong `docs/architecture.md` luôn, commit riêng).
- [x] **B.2 Giải thích 3 đến 5 module liên quan trực tiếp tới kiểm thử:** twenty-front (consumer), twenty-server GraphQL `/graphql` và `/metadata`, xác thực bằng cookie và chặn CSRF (Origin/Host), PostgreSQL và dữ liệu mẫu, Pact (consumer test, Verifier, provider state).

## 4. Phần D: cơ sở lý thuyết → `docs/report/D-ly-thuyet.md` (TASKS 5.1)
Viết bằng lời của bạn, dựa trên `docs/contract-testing.md`:
- [x] **D.1 Nguyên lý Contract Testing** (consumer-driven, hợp đồng, Verifier, provider state; khác integration/E2E).
- [x] **D.2 Vì sao phù hợp với Twenty** (front và back tách rời, giao tiếp qua GraphQL).
- [x] **D.3 Phạm vi** (7 interaction, chỉ kiểm hình dạng dữ liệu).
- [x] **D.4 Giả định và D.5 Rủi ro:** cập nhật theo thực tế. KI-1 (Origin) và KI-4 (Host) đã xử lý, ghi là rủi ro đã gặp và cách xử lý; xem `docs/known-issues.md`.
- [x] **D.6 Tiêu chí pass/fail** (xem `docs/contract-testing.md`, đối chiếu kết quả thật ở `docs/testing.md`).

## 5. Đóng góp cá nhân (cho peer review, TASKS 7.4)
- [ ] Cuối mỗi tuần, thêm vào `docs/report/dong-gop-luyen.md` danh sách việc bạn đã làm kèm mã commit, ví dụ: "Viết phần A.4, commit `abc1234`". Chỉ ghi việc thật, kiểm chứng được.

## Thứ tự đề xuất
1. Mục 0, rồi mục 1 (máy sạch) vì kết quả ảnh hưởng tài liệu của cả nhóm.
2. Mục 2 và 3 (A, B), commit từng mục nhỏ.
3. Mục 4 (D).
4. Mục 5 cập nhật liên tục.
Hạn: bản nháp A, B, D xong trước hạn nộp (khoảng đầu tháng 12/2026) ít nhất 4 ngày để Mạnh gộp báo cáo.

## Ghi chú tiến độ
- 24/11/2026: viết A, B, D, dựng `clean-run.md` kèm ảnh. Lượt chạy này chạy lại trên môi trường có sẵn từ 19/10 (volume Docker, `.env`, `node_modules`), chưa phải máy sạch. Sau đó (cùng ngày) chạy lượt máy sạch thật (clone mới, project Docker `twenty-clean`), do Claude Code chạy theo yêu cầu của Luyến, kết quả 7/7, xem `docs/report/clean-run.md`.
