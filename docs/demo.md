# Kịch bản demo và câu hỏi dự kiến

Dùng cho buổi bảo vệ (thời lượng demo khoảng 5 phút). Hệ thống: Twenty v2.46.0 chạy bằng Docker. Lệnh chạy: xem [testing.md](testing.md).

## 1. Chuẩn bị trước buổi bảo vệ (làm trước 1 ngày và 30 phút trước giờ)
- [ ] Mở Docker Desktop, `docker compose up -d`, `curl localhost:3000/healthz` trả ok. **Không** `docker compose down -v`.
- [ ] Đăng nhập Twenty trên trình duyệt, lấy cookie `twenty-session` mới vào `token.txt` (phiên có thời hạn chưa rõ; lấy lại sát giờ demo cho chắc).
- [ ] Gỡ biến proxy: `unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy`.
- [ ] Chạy thử `npm run all` một lần, kỳ vọng "TẤT CẢ ĐẠT" (khoảng 20 giây).
- [ ] Mở sẵn 3 cửa sổ: terminal ở thư mục dự án, trình duyệt ở trang People của Twenty, file `logs/experiments/summary.md`.
- [ ] Đặt phương án dự phòng (mục 4) sẵn trong máy.

## 2. Kịch bản demo
| Bước | Việc làm | Lệnh hoặc thao tác | Điều cần nói | Kết quả mong đợi |
|---|---|---|---|---|
| 1 | Cho thấy hệ thống thật | Mở trang People, Companies của Twenty | Đây là sản phẩm thật chạy bằng Docker; giao diện gọi máy chủ qua GraphQL | Thấy danh sách dữ liệu |
| 2 | Sinh hợp đồng | `npm run test:consumer` | Consumer test mô tả 7 request giao diện gửi và phản hồi mong nhận, Pact lưu thành `pacts/*.json` | `7 passed` |
| 3 | Verify vào máy chủ thật | `npm run test:provider` | Verifier phát lại từng request vào Twenty thật và so sánh với hợp đồng | Danh sách I-01 đến I-07 đều `OK` |
| 4 | Phá hợp đồng | `npm run auth-proxy` ở terminal khác, rồi `npm run experiments -- M-2` | Mô phỏng máy chủ đổi tên `jobTitle`; giao diện sẽ vỡ nếu không phát hiện | I-01 và I-03 `FAILED`: `Actual map is missing the following keys: jobTitle` |
| 5 | Không báo động giả | `npm run experiments -- M-6` | Thêm field mới là tương thích ngược nên không được fail | 7/7 `OK` |
| 6 | Tổng kết | Mở `logs/experiments/summary.md` | Mỗi loại thay đổi chỉ làm fail đúng các interaction dùng field đó | Bảng M-0 đến M-6 khớp kỳ vọng |

Phương án chạy gọn: `npm run all` thay cho bước 2 đến 6 (khoảng 20 giây), rồi mở `logs/run-all-summary.md`.

## 3. Điều không được nói quá
- Chưa phát hiện lỗi của Twenty; chất lượng bộ test được chứng minh bằng thí nghiệm phá hợp đồng.
- Thay đổi ở M-2, M-3, M-4, M-6 là mô phỏng ở lớp proxy, không sửa mã máy chủ thật.
- Chỉ kiểm hình dạng dữ liệu của 7 interaction, không kiểm nghiệp vụ hay hiệu năng.

## 4. Phương án dự phòng nếu demo trực tiếp hỏng
| Sự cố | Xử lý |
|---|---|
| Docker hoặc Twenty không lên | Mở `logs/provider-run-direct-21-11.log`, `logs/experiments-run-21-11.log` và ảnh `logs/people.png`, `logs/f3-companies.png`; nói rõ đây là kết quả đã chạy ngày 21/11/2026 |
| Phiên hết hạn (`UNAUTHENTICATED`) | Lấy lại cookie `twenty-session` (mục 3 của `setup.md`), dán vào `token.txt` |
| Consumer chạy nhưng provider 403 | Kiểm tra biến proxy hệ thống và `SERVER_URL` (xem bảng lỗi trong `setup.md` mục 7) |
| Cổng 4001 hoặc 4002 bận | Tắt chương trình đang dùng cổng, hoặc đặt `PROXY_PORT` khác |

## 5. Câu hỏi dự kiến và gợi ý trả lời
**Contract testing khác integration test và E2E thế nào?**
Contract test chỉ kiểm hai bên có hiểu nhau về hình dạng dữ liệu hay không, chạy nhanh (vài giây) và cô lập từng cặp consumer và provider. Integration và E2E kiểm cả luồng nghiệp vụ nhưng chậm, khó chỉ ra bên nào gây lỗi.

**Vì sao chọn cặp twenty-front và twenty-server?**
Hai khối tách rời và giao tiếp qua GraphQL; đổi tên hay xóa một field ở máy chủ có thể làm vỡ giao diện mà test từng khối không thấy.

**Hợp đồng lấy từ đâu, có bịa không?**
Từ request thật của twenty-front v2.46.0, bắt bằng Chromium và đối chiếu từng byte với `tests/queries.js` (xem `logs/probe-i03-*`).

**Provider state là gì, vì sao cần?**
Là bước đưa máy chủ về trạng thái mà interaction cần (ví dụ "có ít nhất 1 Person"). I-03 tạo bản ghi thật nên có `setup` và `teardown` xóa fixture để chạy lặp được.

**Có phát hiện lỗi của Twenty không?**
Chưa. Bốn vấn đề nhóm gặp (KI-1 đến KI-4) đều nằm ở môi trường test của nhóm. Chất lượng bộ test được chứng minh bằng thí nghiệm: M-2, M-3, M-4 fail đúng chỗ, M-0 và M-6 không báo động giả.

**KI-4 là gì?**
Gọi thẳng Twenty thì 5 interaction bị 403 CSRF. Nguyên nhân gốc: Verifier gửi `Host: 127.0.0.1:<cổng ngẫu nhiên>` và Twenty đối chiếu Origin với Host. Nhóm bắt request thực tế, thử các giá trị Host khác nhau để xác nhận, rồi đặt lại Host trong `requestFilter`.

**Vì sao phiên sai vẫn trả HTTP 200 (I-06)?**
Quan sát hành vi thật của Twenty v2.46.0: request chưa đăng nhập không thấy được `people` nên GraphQL trả lỗi validate schema trong `errors[]` với HTTP 200, không phải 401. Hợp đồng mô tả đúng hành vi này.

**Hạn chế lớn nhất?**
Thay đổi chỉ mô phỏng ở lớp proxy, chưa sửa mã máy chủ thật; phiên đăng nhập lấy thủ công, có thời hạn; không có Pact Broker và CI.

**Nếu mở rộng thì làm gì?**
Thêm interaction cho các thao tác khác (cập nhật, xóa, bộ lọc), dùng Pact Broker và CI, tự động hóa đăng nhập để lấy phiên.

**Ai làm gì?**
Xem bảng phân công và lịch sử commit: `docs/report/phan-cong-cong-viec.md` và `git shortlog -sn`.
