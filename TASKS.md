# Danh sách task chung đến khi hoàn thành (nhóm 12)

Hợp nhất từ `TASK_MANH.md`, `TASK_PHUOC.md` và yêu cầu đề bài (`docs/archive/context-de-tai-kiem-thu.md`).
Cập nhật lần cuối: 21/11/2026. Hạn nộp báo cáo và mã nguồn: trước buổi bảo vệ 1 tuần (khoảng đầu tháng 12/2026; hỏi giảng viên ngày chính xác).
Mỗi mục có tiêu chí xong; làm xong thì tick và commit (push thì hỏi trước). `TASK_PHUOC.md` là nhật ký của Phước, không sửa; các mục "chờ Mạnh" trong đó đã xong (xem mục 0).

Người phụ trách theo phân công đề xuất: **M** = Mạnh (môi trường, provider), **L** = Luyến (kiến trúc, sơ đồ, onboarding), **P** = Phước (scenario, consumer, log/metrics). Phân công chính thức cần cả nhóm xác nhận (mục 7).

Context để viết báo cáo (yêu cầu của thầy, nguồn bằng chứng từng phần A đến H, số liệu, giới hạn): [`docs/report-context.md`](docs/report-context.md).

## 0. Đã xong (tham chiếu)
- [x] Consumer 7/7 (I-01 đến I-07), hợp đồng `pacts/twenty-front-twenty-server.json` (P)
- [x] Provider verify gọi thẳng `:3000` 7/7; KI-1 Origin, KI-4 Host, state handler đủ 7, teardown I-03 (M)
- [x] Thí nghiệm phá hợp đồng phía provider M-0, M-2, M-3, M-4, M-6, bằng chứng `logs/experiments/` (M)
- [x] Thí nghiệm `BREAK=1` phía consumer (jobTitle đổi tên), log `logs/` (P)
- [x] Chuẩn hóa `docs/`, dọn `probe.mjs`, đổi tên state `phiên không hợp lệ` (M)
- [x] Các blocker trong `TASK_PHUOC.md` mục 4 (Origin, state handler, teardown I-03): đã giải quyết ở phía Mạnh

## 1. Chốt kỹ thuật còn lại (làm trước vì báo cáo dựa vào đây)
- [ ] **1.1 Workspace `dlu-qa` và dữ liệu mẫu** (M + P). Quyết định: đổi tên workspace Docker `phuoc` thành `dlu-qa` hay giữ tên và sửa quy ước. Ghi cách nạp dữ liệu mẫu tối thiểu (1 Person, 1 Company, 1 Opportunity; hiện có 5/5/6) vào `docs/setup.md` mục 2. *Xong khi:* người khác làm theo setup.md có workspace đủ dữ liệu để verify 7/7; tên thống nhất trong hợp đồng, docs, README.
- [ ] **1.2 Verify lại toàn bộ sau các thay đổi** (M). Chạy `test:consumer`, `test:provider` (mặc định, gọi thẳng), `experiments` (5/5). Lưu log mới vào `logs/` (không ghi phiên). *Xong khi:* số liệu trong `docs/testing.md` và `logs/metrics.md` khớp lượt chạy mới nhất.
- [ ] **1.3 Thí nghiệm phía consumer cho bộ 7 interaction** (P). `BREAK=1` hiện chỉ có bằng chứng trên bộ 6 interaction cũ. Chạy lại trên bộ 7 và ghi kết quả. *Xong khi:* có log mới và dòng trong `docs/testing.md`.
- [ ] **1.4 Quyết định có thêm thí nghiệm thay đổi thật trên mã nguồn Twenty không** (M). Hiện M-2, M-3, M-4 chỉ mô phỏng ở lớp proxy. Tùy chọn; nếu không làm thì giữ nguyên mục "Giới hạn đã biết" trong `docs/known-issues.md`.
- [ ] **1.5 Dọn nốt:** `docs/architecture.md` còn vẽ Verifier đi qua auth-proxy `:4002` (sửa theo luồng gọi thẳng; auth-proxy chỉ cho thí nghiệm); kiểm tra không còn chỗ nhắc "token" sai nghĩa trong test và tài liệu mới (M).

## 2. Phần A: mô tả hệ thống (L)
- [ ] **2.1** Mục tiêu hệ thống, actor và use case chính của Twenty (A.1, A.2).
- [ ] **2.2** Cây thư mục `tree -L 2` của repo mã nguồn (A.3) và danh sách dependency chính kèm phiên bản (A.3, nguồn `VERSIONS.md`, `package.json`).
- [ ] **2.3** Luồng dữ liệu của các nghiệp vụ trọng tâm (A.4): xem People, xem Companies, tạo Person, người dùng hiện tại.
- *Nguồn:* `docs/architecture.md`, `docs/archive/bao_cao_giua_ky_milestone_2.md` mục A. *Xong khi:* nội dung viết sẵn ở dạng dùng được cho báo cáo, có sơ đồ luồng.

## 3. Phần B: kiến trúc (L)
- [ ] **3.1** Sơ đồ kiến trúc mức container/component dạng **ảnh** (xuất từ Mermaid trong `docs/architecture.md` hoặc vẽ lại), thể hiện cả vị trí Pact (consumer test, hợp đồng, Verifier, provider).
- [ ] **3.2** Giải thích 3 đến 5 module liên quan trực tiếp tới kiểm thử (twenty-front, twenty-server GraphQL `/graphql` và `/metadata`, xác thực cookie/CSRF, Postgres/Redis).

## 4. Phần C: môi trường và bằng chứng (M + L)
- [ ] **4.1** Tài liệu môi trường: phiên bản, lệnh build/run, DB/service, seed data (M, từ `docs/setup.md`, `VERSIONS.md`).
- [ ] **4.2** Bằng chứng hệ thống chạy: ảnh `/healthz`, đăng nhập, **ít nhất 3 luồng nghiệp vụ** (đã có F1, F3, F4 và ảnh `people.png`, `opportunities.png` trong `logs/`; bổ sung nếu thiếu F2) (P + M).
- [ ] **4.3** **Chạy lại trên máy sạch** theo README bởi Luyến hoặc Phước, ghi từng bước, lỗi gặp và thời gian vào `docs/testing.md` hoặc `docs/clean-run.md`; sửa README/setup theo lỗi gặp (L hoặc P chạy, M sửa tài liệu). Đây là bằng chứng cho D.6 và phần H.

## 5. Phần D và E: lý thuyết và thiết kế test (P + L, rà bởi M)
- [ ] **5.1** Phần D (nguyên lý, lý do chọn phạm vi, giả định, rủi ro, tiêu chí pass/fail): cập nhật từ `docs/contract-testing.md`, bỏ rủi ro đã xử lý (KI-1, KI-4), thêm kết quả thực tế (L).
- [ ] **5.2** Phần E: bảng I-01 đến I-07 đủ precondition, input, expected, dữ liệu test, provider state (đã có trong `docs/interactions.md` và `TASK_PHUOC.md` mục 1) (P).
- [ ] **5.3** Kỹ thuật thiết kế test được áp dụng (phân vùng tương đương, giá trị biên, thử âm: phiên sai I-06, thiếu Origin I-07) và kịch bản phá hợp đồng M-0 đến M-6 (P).

## 6. Phần F, G, H: mã nguồn, log, tái lập (M + P)
- [ ] **6.0 Tiêu chí A của thầy** (đối chiếu từng gạch trong `docs/report-context.md` mục 1.1): sơ đồ dễ hiểu, hướng dẫn cài đặt giảng viên tự làm theo được (kể cả lấy phiên `twenty-session` có ảnh), giải thích vì sao áp dụng Pact, scenario cụ thể, một lệnh chạy toàn bộ và sinh kết quả, giải thích ý nghĩa log, phân biệt lỗi harness với lỗi Twenty. Rà lại trước khi nộp (cả nhóm).
- [ ] **6.1 F:** README gốc đủ lệnh chạy và dependency; script chạy lại tự động (`test:consumer`, `test:provider`, `experiments`). Kiểm tra cuối cùng cùng với 4.3 (M).
- [ ] **6.2 G:** bảng log/metrics: số interaction pass/fail mỗi lượt, thời gian, lượt bình thường và lượt phá hợp đồng; danh sách defect và hành vi bất thường (CSRF Host/Origin, 403 vs 200 của phiên sai, response không có `extensions.code`) kèm phân tích nguyên nhân gốc (P viết, M cung cấp số liệu `logs/experiments/`).
- [ ] **6.3 H, pin phiên bản:** tạo git tag cho bản nộp (ví dụ `v1.0-final`), ghi tag, commit SHA, digest image vào `VERSIONS.md`; thử tìm tag source khớp image `v2.46.0` để thay `a61e47d` (M). *Tag tạo sau cùng, khi code và log đã đóng băng.*
- [ ] **6.4** Làm sạch repo trước khi nộp: không có `token.txt`, `docker/.env`, phiên `sess_...` trong lịch sử/log (`git log -p` và grep `sess_`); quyết định cách xử lý `logs/auth-proxy-run.log` (không commit bản tăng dần) và `docs/archive/` (commit hay để ngoài).

## 7. Quản trị dự án (cả nhóm)
- [ ] **7.1** Phân công thật 3 thành viên và đóng góp cụ thể kèm bằng chứng commit (báo cáo giữa kỳ còn `[CẦN ĐIỀN]`). Đổi MSSV của Phước thành 2312716 trong mọi tài liệu (báo cáo cũ ghi 2312714).
- [ ] **7.2** Tạo link Trello, Jira hoặc GitHub Projects, đưa các mục của file này lên đó, ghi link vào README và báo cáo.
- [ ] **7.3** Lịch sử commit đều: mỗi thành viên có commit thật bằng danh tính của mình (Luyến, Phước chưa có việc nào trong danh sách này nếu chỉ Mạnh làm). Chia mục 2 đến 5 cho Luyến và Phước commit trực tiếp.
- [ ] **7.4** **Bản phân chia công việc và đóng góp cá nhân qua peer review** (hồ sơ nộp LMS, thầy yêu cầu thêm 21/11): mỗi người liệt kê đóng góp cụ thể kèm bằng chứng commit, đánh giá chéo hai người còn lại; một người tổng hợp thành một file nộp riêng.
- [ ] **7.5** Chuẩn bị phần trình bày **lịch sử công việc và commit Git** cho buổi bảo vệ (thầy yêu cầu): bảng commit theo người và ngày, giải thích trung thực. Số liệu và cảnh báo ở `docs/report-context.md` mục 7.

## 8. Báo cáo cuối kỳ, slide, demo
- [ ] **8.1** Báo cáo tổng kết 8 phần A đến H (gộp từ mục 2 đến 6), một người tổng biên tập (đề xuất M), cả nhóm rà soát. Nguồn: `docs/`, `logs/`, `docs/archive/bao_cao_giua_ky_milestone_2.md`.
- [ ] **8.2** Slide thuyết trình gọn: bài toán, kiến trúc, Pact là gì, 7 interaction, demo, kết quả thí nghiệm phá hợp đồng, bài học (KI-1, KI-4), giới hạn.
- [ ] **8.3** Kịch bản demo chạy trực tiếp: `test:consumer` rồi `test:provider` (7/7), sau đó `experiments` hoặc một lượt phá hợp đồng thấy fail đúng chỗ. Có phương án dự phòng (log/ảnh) nếu Docker hoặc phiên đăng nhập hỏng. Tập demo trên máy thật, nhớ lấy phiên mới trước buổi demo.
- [ ] **8.4** Danh sách câu hỏi có thể bị hỏi và câu trả lời (vì sao Pact, vì sao Origin/Host, giới hạn của contract test, khác biệt so với integration test).
- [ ] **8.5** Nộp lên LMS trước hạn (1 tuần trước bảo vệ): (1) báo cáo cuối kỳ, (2) bản phân chia công việc và đóng góp qua peer review (mục 7.4), kèm mã nguồn. Xác nhận định dạng, ngày chính xác với giảng viên; đối chiếu "mục A phần 6 trong file hướng dẫn" mà thầy nhắc.

## 9. Thứ tự đề xuất
1. Mục 1 (1.1, 1.2, 1.5), vì mọi phần sau cần số liệu và tên workspace chốt.
2. Mục 2, 3, 5.1, 5.2 chạy song song (Luyến, Phước), cùng lúc Mạnh làm 1.3 đến 1.4, 4.1.
3. Mục 4.2, 4.3, 6.2 sau khi mục 1 xong.
4. Mục 6.4, 6.3 (tag) khi mã nguồn đóng băng, rồi 7.x ghi nhận đóng góp.
5. Mục 8 tổng hợp; đặt mốc nội bộ: báo cáo bản nháp đủ A đến H trước hạn nộp ít nhất 3 ngày, slide và demo tập xong trước hạn nộp.

## 10. Quy tắc chung
- Xong mỗi mục: chạy kiểm chứng thật, cập nhật tài liệu cùng commit, commit bằng danh tính của người làm. Push hỏi trước.
- Không ghi phiên `sess_...`, khóa mã hóa vào tài liệu, log, commit. Không `docker compose down -v`.
- Số liệu trong báo cáo phải có nguồn trong `logs/`.
