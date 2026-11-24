# Chạy lại trên máy sạch (TASKS 4.3)

Mục đích: kiểm tra giảng viên hoặc người mới có làm theo [`README.md`](../../README.md) và [`docs/setup.md`](../setup.md) để ra kết quả 7/7 được không.
Người thực hiện: Luyến (2312682). Làm đúng từng bước theo tài liệu, **không hỏi nhóm trước**, ghi mọi chỗ vướng.
Không ghi giá trị phiên `sess_...` hay khóa mã hóa vào file này; che cookie trong ảnh chụp.

## 1. Môi trường
| Mục | Giá trị |
|---|---|
| Ngày thực hiện | 24/11/2026 |
| Máy / CPU / RAM | Intel Core i5-12450H, 16 GB RAM |
| Hệ điều hành | Windows 11 Home Single Language |
| Docker (`docker --version`) | 29.7.2 (build a7dcaa6) |
| Docker Compose (`docker compose version`) | v5.5.1 |
| Node.js (`node -v`) | v22.18.0 |
| Commit của repo (`git rev-parse --short HEAD`) | `7f30b8f` (nhánh `2312682_HaLuyen`, đã kéo từ `origin/main` `752d346`) |
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
| 8 | Chạy consumer | `npm run test:consumer` | 5,69 s (vitest, 24/11/2026 15:35) | 7 passed (7) | Cả 7 interaction I-01 đến I-07 đều pass |
| 9 | Chạy provider | `npm run test:provider` | 3,92 s (vitest, 24/11/2026 15:45) | 7/7 interaction (I-01 đến I-07) đều OK, `Tests 1 passed (1)` | Một test vitest bọc cả 7 interaction |

## 3. Lỗi gặp và cách khắc phục
| # | Bước | Triệu chứng (thông báo nguyên văn, ngắn) | Nguyên nhân | Cách khắc phục | Tài liệu cần sửa |
|---|---|---|---|---|---|
| 1 | Bước 3 | Container `twenty-server-1` lặp restart, log `psql: error: could not translate host name "db" to address: Try again` | Server không phân giải được tên `db` trong mạng Docker, trong khi worker, db, redis vẫn bình thường; nguyên nhân gốc `[CHƯA XÁC ĐỊNH]` | Tạo lại riêng container server: `docker compose -f docker/docker-compose.yml --env-file docker/.env up -d --force-recreate --no-deps server`, rồi chờ `/healthz` trả `ok` | `docs/setup.md` mục 7: đã thêm dòng lỗi này |
| 2 | Bước 9 | `UNAUTHENTICATED` ở các state handler | `token.txt` chứa phiên cũ không hợp lệ với Docker hiện tại | Đăng nhập lại và lấy lại cookie `twenty-session` | `docs/setup.md` mục 7: đã bổ sung trường hợp phiên của lần dựng Docker/DB cũ |

## 4. Kết quả cuối
| Lượt chạy | Kết quả | Thời gian | Ảnh |
|---|---|---|---|
| `npm run test:consumer` | 7/7 (24/11/2026 15:35) | 5,69 s | `logs/clean-run/consumer.png` |
| `npm run test:provider` | 7/7 (24/11/2026 15:45) | 3,92 s | `logs/clean-run/provider_1.png`, `logs/clean-run/provider_2.png` |

## 5. Ảnh bằng chứng (lưu vào `logs/clean-run/`)
- [x] Bước lấy phiên (DevTools, giá trị cookie đã che): `logs/clean-run/lay_phien.png`.
- [x] Kết quả `test:consumer` 7/7: `logs/clean-run/consumer.png`.
- [x] Kết quả `test:provider` 7/7: `logs/clean-run/provider_1.png` (I-01 đến I-03) và `provider_2.png` (I-04 đến I-07, tóm tắt).

## 6. Chỗ hướng dẫn thiếu hoặc sai
Liệt kê để sửa `README.md` và `docs/setup.md` (lỗi chính tả hoặc thiếu bước rõ ràng thì tự sửa và commit riêng; còn lại gửi Mạnh).

| # | Vị trí (file, mục) | Vấn đề | Đề xuất sửa | Đã sửa? |
|---|---|---|---|---|
| 1 | `docs/setup.md` mục 7 (lỗi thường gặp) | Bảng chưa có lỗi `could not translate host name "db"` khi server lặp restart | Thêm dòng lỗi và lệnh tạo lại container server | Đã sửa |
| 2 | `docs/setup.md` mục 7, dòng `UNAUTHENTICATED` | Chưa nói rõ phiên cũ mất hiệu lực khi dựng Docker/DB mới (`token.txt` có từ lần dựng trước) | Bổ sung trường hợp này vào cột nguyên nhân | Đã sửa |

## 7. Kết luận
- **Kết quả:** sau khi xử lý lỗi server ở mục 3 và lấy phiên mới, `test:consumer` đạt 7/7 và `test:provider` đạt 7/7 (ảnh ở mục 5).
- **Trung thực về quá trình:** lỗi `could not translate host name "db"` không có trong tài liệu nên phải tự chẩn đoán (có sự hỗ trợ của công cụ AI trong lúc chẩn đoán và dựng tài liệu); sau khi bổ sung vào `docs/setup.md`, người sau có thể tự xử lý.
- **Cải thiện đã làm:** thêm hai dòng vào bảng lỗi thường gặp (mục 6).
- **Chưa kiểm chứng:** nguyên nhân gốc của lỗi phân giải `db`; tổng thời gian từ đầu đến 7/7 `[ĐIỀN]`; việc máy có thực sự "sạch" (chưa từng chạy Twenty) `[ĐIỀN]`.
