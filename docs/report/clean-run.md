# Chạy lại trên máy sạch (TASKS 4.3)

Mục đích: kiểm tra giảng viên hoặc người mới có làm theo [`README.md`](../../README.md) và [`docs/setup.md`](../setup.md) để ra kết quả 7/7 được không.
Người thực hiện: Luyến (2312682). Làm đúng từng bước theo tài liệu, **không hỏi nhóm trước**, ghi mọi chỗ vướng.
Không ghi giá trị phiên `sess_...` hay khóa mã hóa vào file này; che cookie trong ảnh chụp.

## 1. Môi trường
| Mục | Giá trị |
|---|---|
| Ngày thực hiện | `[ĐIỀN]` |
| Máy / CPU / RAM | `[ĐIỀN]` |
| Hệ điều hành | `[ĐIỀN]` (ví dụ Windows 11) |
| Docker (`docker --version`) | `[ĐIỀN]` |
| Docker Compose (`docker compose version`) | `[ĐIỀN]` |
| Node.js (`node -v`) | `[ĐIỀN]` |
| Commit của repo (`git rev-parse --short HEAD`) | `[ĐIỀN]` |
| Máy "sạch" theo nghĩa nào | `[ĐIỀN]` (ví dụ: chưa từng chạy Twenty, DB và volume mới) |

## 2. Các bước đã làm
Ghi thời gian thực tế của mỗi bước.

| # | Bước (theo tài liệu) | Lệnh / thao tác | Thời gian | Kết quả | Ghi chú |
|---|---|---|---|---|---|
| 1 | Clone repo, `npm install` | `[ĐIỀN]` | `[ĐIỀN]` | `[ĐIỀN]` | |
| 2 | Tạo `docker/.env` từ `.env.example`, điền khóa | `[ĐIỀN]` | `[ĐIỀN]` | `[ĐIỀN]` | |
| 3 | Dựng Twenty bằng Docker | `docker compose up -d` | `[ĐIỀN]` | `[ĐIỀN]` | |
| 4 | Kiểm tra `/healthz` | `curl http://localhost:3000/healthz` | `[ĐIỀN]` | `[ĐIỀN]` | |
| 5 | Tạo tài khoản và workspace | giao diện :3000 | `[ĐIỀN]` | `[ĐIỀN]` | |
| 6 | Nạp dữ liệu mẫu (≥ 1 Person, 1 Company, 1 Opportunity) | giao diện | `[ĐIỀN]` | `[ĐIỀN]` | |
| 7 | Lấy phiên `twenty-session` vào `token.txt` | DevTools > Application > Cookies | `[ĐIỀN]` | `[ĐIỀN]` | |
| 8 | Chạy consumer | `npm run test:consumer` | `[ĐIỀN]` | `[ĐIỀN]` (kỳ vọng 7 passed) | |
| 9 | Chạy provider | `npm run test:provider` | `[ĐIỀN]` | `[ĐIỀN]` (kỳ vọng 7/7) | |

## 3. Lỗi gặp và cách khắc phục
| # | Bước | Triệu chứng (thông báo nguyên văn, ngắn) | Nguyên nhân | Cách khắc phục | Tài liệu cần sửa |
|---|---|---|---|---|---|
| 1 | Bước 3 | Container `twenty-server-1` lặp restart, log `psql: error: could not translate host name "db" to address: Try again` | Server không phân giải được tên `db` trong mạng Docker, trong khi worker, db, redis vẫn bình thường; nguyên nhân gốc `[CHƯA XÁC ĐỊNH]` | Tạo lại riêng container server: `docker compose -f docker/docker-compose.yml --env-file docker/.env up -d --force-recreate --no-deps server`, rồi chờ `/healthz` trả `ok` | `[ĐIỀN: có cần thêm vào bảng lỗi ở docs/setup.md mục 7 không]` |
| 2 | Bước 9 | `UNAUTHENTICATED` ở các state handler | `token.txt` chứa phiên cũ không hợp lệ với Docker hiện tại | Đăng nhập lại và lấy lại cookie `twenty-session` | `[ĐIỀN]` |
| 3 | `[ĐIỀN]` | | | | |

## 4. Kết quả cuối
| Lượt chạy | Kết quả | Thời gian | Ảnh |
|---|---|---|---|
| `npm run test:consumer` | `[ĐIỀN]` (kỳ vọng 7/7) | `[ĐIỀN]` | `logs/clean-run/consumer.png` |
| `npm run test:provider` | 7/7 (lượt chạy 24/11/2026 trên Docker của Luyến) `[XÁC NHẬN LẠI]` | `[ĐIỀN]` | `logs/clean-run/provider.png` |

## 5. Ảnh bằng chứng (lưu vào `logs/clean-run/`)
- [ ] Bước lấy phiên (DevTools, **che giá trị cookie**).
- [ ] Kết quả `test:consumer` 7/7.
- [ ] Kết quả `test:provider` 7/7.

## 6. Chỗ hướng dẫn thiếu hoặc sai
Liệt kê để sửa `README.md` và `docs/setup.md` (lỗi chính tả hoặc thiếu bước rõ ràng thì tự sửa và commit riêng; còn lại gửi Mạnh).

| # | Vị trí (file, mục) | Vấn đề | Đề xuất sửa | Đã sửa? |
|---|---|---|---|---|
| 1 | `[ĐIỀN]` | | | |

## 7. Kết luận
`[ĐIỀN]` Làm theo tài liệu có ra 7/7 mà không cần hỏi thêm không? Tổng thời gian từ đầu đến 7/7? Những chỗ cần cải thiện?
