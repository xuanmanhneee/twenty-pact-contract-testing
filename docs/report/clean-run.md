# Chạy lại trên máy sạch (TASKS 4.3)

Mục đích: kiểm tra giảng viên hoặc người mới có làm theo [`README.md`](../../README.md) và [`docs/setup.md`](../setup.md) để ra kết quả 7/7 được không.
Không ghi giá trị phiên `sess_...` hay khóa mã hóa vào file này; che cookie trong ảnh chụp.

**Cách thực hiện (nói rõ để trung thực):** lượt "máy sạch" dưới đây do **Claude Code (công cụ AI) chạy trực tiếp trên máy của Luyến, theo yêu cầu của Luyến**, ngày 24/11/2026. Người dùng không tự gõ lệnh ở lượt này. Một số bước **khác tài liệu** vì người thực hiện không dùng trình duyệt (xem bước 5, 6 và mục 6). Lượt chạy lại trước đó trên môi trường sẵn có (do Luyến tự chạy và chụp ảnh) nằm ở phần Phụ lục.

## 1. Môi trường (lượt máy sạch)
| Mục | Giá trị |
|---|---|
| Ngày thực hiện | 24/11/2026, khoảng 16:41 đến 16:49 |
| Máy / CPU / RAM | Intel Core i5-12450H, 16 GB RAM |
| Hệ điều hành | Windows 11 Home Single Language |
| Docker | 29.7.2 (build a7dcaa6), Compose v5.5.1 |
| Node.js | v22.18.0 |
| Commit của repo | `752d346` (clone mới từ `origin/main`) |
| Thế nào là "sạch" | Thư mục clone mới `clean-run-test`, `npm install` mới, `docker/.env` mới với khóa ngẫu nhiên mới, project Docker riêng `twenty-clean` (volume và DB mới), tài khoản và workspace mới. Image Twenty/PostgreSQL/Redis đã có sẵn trong cache Docker của máy nên **không đo thời gian tải image** |
| Chuẩn bị | Tạm dừng stack Twenty cũ (`docker compose -p twenty ... stop`, 6 s, không xóa dữ liệu) để nhường cổng 3000 |

## 2. Các bước đã làm
| # | Bước | Lệnh / thao tác | Thời gian | Kết quả |
|---|---|---|---|---|
| 1 | Clone repo | `git clone https://github.com/xuanmanhneee/twenty-pact-contract-testing clean-run-test` | 5 s | Commit `752d346` |
| 2 | Cài phụ thuộc test | `npm install` | 32 s | Xong (npm cảnh báo `npm audit`, không ảnh hưởng) |
| 3 | Tạo `docker/.env` | Sao chép `.env.example`, thay các giá trị `CHANGE_ME` bằng khóa ngẫu nhiên (`openssl rand -hex 24`) | 1 s | Không còn `CHANGE_ME` |
| 4 | Dựng Twenty | `docker compose -p twenty-clean up -d` | Lệnh chờ hơn 112 s (bị ngắt bằng timeout 110 s của công cụ, các container vẫn tiếp tục); `/healthz` trả `ok` lúc 16:45:58, tức **khoảng 4 phút** sau khi bắt đầu | db, redis, server healthy. Trong lúc khởi động server từng hiện `unhealthy` rồi tự chuyển `healthy` |
| 5 | Tạo tài khoản và workspace | **Khác tài liệu:** gọi API `/metadata`: `signUp`, `signIn`, `signUpInNewWorkspace(input:{displayName:"dlu-qa"})`, `getLoginTokenFromCredentials`, `getAuthTokensFromLoginToken`, `activateWorkspace` | khoảng 3 phút tính cả thời gian dò tham số API (không có tài liệu API công khai, introspection bị tắt) | Workspace `dlu-qa` ở trạng thái `ACTIVE`; Twenty tự nạp dữ liệu mẫu: 5 People, 5 Companies, 6 Opportunities |
| 6 | Lấy phiên `twenty-session` | **Khác tài liệu:** lấy từ header `Set-Cookie` của `getAuthTokensFromLoginToken` thay cho DevTools, ghi vào `token.txt` | (gộp trong bước 5) | Phiên hợp lệ, `currentUser` trả đúng workspace |
| 7 | Chạy consumer | `npm run test:consumer` | 6,10 s (vitest), tổng 11 s, bắt đầu 16:48:45 | **7 passed (7)** |
| 8 | Chạy provider | `npm run test:provider` | 6,77 s (vitest), tổng 10 s, bắt đầu 16:48:55 | **I-01 đến I-07 đều OK** (I-06 trả 200, I-07 trả 403), `Tests 1 passed (1)` |

Tổng thời gian từ lệnh clone đến 7/7: khoảng 7 đến 8 phút (16:41 đến 16:49), phần lớn là chờ Twenty khởi động và dò API tạo workspace.

## 3. Lỗi gặp và cách khắc phục
| # | Bước | Triệu chứng | Nguyên nhân | Cách khắc phục |
|---|---|---|---|---|
| 1 | 5 | `Workspace name is required` khi gọi `signUpInNewWorkspace` | Mutation cần `input:{displayName}`; tham số này không nằm trong tài liệu nhóm | Đọc mã server trong container để biết tên tham số, thêm `displayName` |
| 2 | 5 | `New workspace setup is disabled` khi gọi lại `signUpInNewWorkspace` | Workspace đầu tiên đã được tạo ở lần gọi trước (lần đó chưa lưu loginToken); cài đặt mặc định không cho tạo thêm | Đăng nhập lại bằng `getLoginTokenFromCredentials` để lấy loginToken, rồi `activateWorkspace` |
| 3 | 5 | Workspace ở trạng thái `PENDING_CREATION`, truy vấn `people`/`companies` báo `Cannot query field` | Chưa kích hoạt workspace | `activateWorkspace(data:{displayName:"dlu-qa"})`, sau đó dữ liệu mẫu có sau khoảng 20 s |

Các lỗi trên chỉ xảy ra vì tạo workspace bằng API. Nếu làm bằng giao diện đúng tài liệu thì không gặp.

## 4. Kết quả cuối
| Lượt chạy | Kết quả | Thời gian vitest | Bằng chứng |
|---|---|---|---|
| `npm run test:consumer` | 7/7 | 6,10 s | `logs/clean-run/sach-consumer.log` |
| `npm run test:provider` | 7/7 (I-01 đến I-07 OK) | 6,77 s | `logs/clean-run/sach-provider.log` |

Bằng chứng của lượt này là **log văn bản** (đã kiểm tra không chứa phiên `sess_` hay token). Lượt này không có ảnh chụp màn hình; ảnh ở `logs/clean-run/*.png` thuộc lượt phụ lục.

## 5. Kết quả so với tiêu chí D.6 "tái chạy"
Làm theo README trên môi trường mới (clone, volume, tài khoản mới) cho ra cùng kết quả: consumer 7/7, provider 7/7. Điều kiện kèm theo: Docker đã có image trong cache, và bước tạo tài khoản phải làm được (lượt này làm bằng API, tài liệu dùng giao diện).

## 6. Chỗ hướng dẫn thiếu hoặc sai
| # | Vị trí | Vấn đề | Đề xuất sửa | Đã sửa? |
|---|---|---|---|---|
| 1 | `README.md` mục 1, `docs/setup.md` mục 1 | Không cảnh báo `docker compose up -d` có thể chờ hơn 2 phút và `/healthz` chỉ lên sau khoảng 4 phút trên máy này | Ghi "chờ vài phút, kiểm tra bằng `curl /healthz`" | Đã sửa (`README.md`, `docs/setup.md`) |
| 2 | `docs/setup.md` mục 2 | Chỉ nói "tạo workspace (dữ liệu mẫu nếu có)"; quan sát thực tế: workspace mới tự có 5/5/6 bản ghi sau khoảng 20 s kể từ khi kích hoạt | Ghi rõ điều này | Đã sửa (`docs/setup.md` mục 1) |
| 3 | `docs/setup.md` mục 1 | Cổng 3000 cố định và Origin phải là `http://localhost:3000`; muốn chạy song song hai stack phải dừng stack cũ trước | Thêm lưu ý | Đã sửa (`README.md`, `docs/setup.md` mục 1) |
| 4 | `docs/setup.md` mục 7 (từ lượt trước) | Lỗi `could not translate host name "db"` và `token.txt` cũ | Đã thêm | Đã sửa |

## 7. Kết luận
- Trên môi trường mới hoàn toàn, theo README và setup.md, bộ test đạt **consumer 7/7 và provider 7/7**, thời gian chạy test mỗi lượt khoảng 6 đến 7 giây.
- Phần tốn thời gian là chờ Twenty khởi động (khoảng 4 phút), không phải chạy test.
- Hạn chế trung thực: lượt này không do người dùng tự gõ lệnh; bước tạo tài khoản và lấy phiên làm bằng API chứ không theo giao diện/DevTools như tài liệu; không đo thời gian tải image Docker; chỉ chạy một lần.
- Stack Twenty cũ đã được tạm dừng để nhường cổng 3000 (bật lại bằng `docker compose -p twenty ... start`); stack `twenty-clean` và thư mục `clean-run-test` vẫn còn trên máy.

---

## Phụ lục. Lượt chạy lại trên môi trường sẵn có (không phải máy sạch)

### P.1 Môi trường
| Mục | Giá trị |
|---|---|
| Ngày thực hiện | 24/11/2026 |
| Máy / CPU / RAM | Intel Core i5-12450H, 16 GB RAM |
| Hệ điều hành | Windows 11 Home Single Language |
| Docker (`docker --version`) | 29.7.2 (build a7dcaa6) |
| Docker Compose (`docker compose version`) | v5.5.1 |
| Node.js (`node -v`) | v22.18.0 |
| Commit của repo (`git rev-parse --short HEAD`) | `7f30b8f` (nhánh `2312682_HaLuyen`, đã kéo từ `origin/main` `752d346`) |
| Máy "sạch" theo nghĩa nào | **Không sạch.** Máy đã có sẵn từ 19/10/2026: volume Docker `twenty_db-data` và `twenty_server-local-data` (tạo 19/10/2026), `docker/.env`, `node_modules`, `token.txt`. Lượt này là chạy lại trên môi trường sẵn có, **chưa phải bằng chứng "máy sạch"** |

### P.2 Các bước đã làm
Ghi thời gian thực tế của mỗi bước.

| # | Bước (theo tài liệu) | Lệnh / thao tác | Thời gian | Kết quả | Ghi chú |
|---|---|---|---|---|---|
| 1 | Clone repo, `npm install` | không làm lại | không áp dụng | Đã có sẵn từ 19/10/2026 (`node_modules`) | Repo được kéo về `origin/main` bằng `git merge --ff-only` |
| 2 | Tạo `docker/.env` từ `.env.example`, điền khóa | không làm lại | không áp dụng | Đã có sẵn từ 19/10/2026 | |
| 3 | Dựng Twenty bằng Docker | stack đã có sẵn; tạo lại container server (mục 3) | không đo | Server lên được sau khi tạo lại lúc khoảng 15:02 ngày 24/11/2026 | Xem lỗi 1 ở mục 3 |
| 4 | Kiểm tra `/healthz` | `curl http://localhost:3000/healthz` | không đo | `{"status":"ok",...}` | |
| 5 | Tạo tài khoản và workspace | giao diện :3000 | không áp dụng | Đã có sẵn từ 19/10/2026, đăng nhập lại | |
| 6 | Nạp dữ liệu mẫu (≥ 1 Person, 1 Company, 1 Opportunity) | giao diện | không áp dụng | Dữ liệu có sẵn (ví dụ trang Công ty có 5 bản ghi, ảnh `lay_phien.png`) | |
| 7 | Lấy phiên `twenty-session` vào `token.txt` | DevTools > Application > Cookies | không đo | Lấy phiên mới, test chạy được (ảnh chụp 15:34 đến 15:54) | |
| 8 | Chạy consumer | `npm run test:consumer` | 5,69 s (vitest, 24/11/2026 15:35) | 7 passed (7) | Cả 7 interaction I-01 đến I-07 đều pass |
| 9 | Chạy provider | `npm run test:provider` | 3,92 s (vitest, 24/11/2026 15:45) | 7/7 interaction (I-01 đến I-07) đều OK, `Tests 1 passed (1)` | Một test vitest bọc cả 7 interaction |

### P.3 Lỗi gặp và cách khắc phục
| # | Bước | Triệu chứng (thông báo nguyên văn, ngắn) | Nguyên nhân | Cách khắc phục | Tài liệu cần sửa |
|---|---|---|---|---|---|
| 1 | Bước 3 | Container `twenty-server-1` lặp restart, log `psql: error: could not translate host name "db" to address: Try again` | Server không phân giải được tên `db` trong mạng Docker, trong khi worker, db, redis vẫn bình thường; nguyên nhân gốc `[CHƯA XÁC ĐỊNH]` | Tạo lại riêng container server: `docker compose -f docker/docker-compose.yml --env-file docker/.env up -d --force-recreate --no-deps server`, rồi chờ `/healthz` trả `ok` | `docs/setup.md` mục 7: đã thêm dòng lỗi này |
| 2 | Bước 9 | `UNAUTHENTICATED` ở các state handler | `token.txt` ghi từ 19/10/2026 (hơn một tháng) nên phiên không còn hợp lệ; nguyên nhân cụ thể (hết hạn theo thời gian hay lý do khác) `[CHƯA XÁC ĐỊNH]` | Đăng nhập lại và lấy lại cookie `twenty-session` | `docs/setup.md` mục 7: đã ghi trường hợp `token.txt` cũ |

### P.4 Kết quả cuối
| Lượt chạy | Kết quả | Thời gian | Ảnh |
|---|---|---|---|
| `npm run test:consumer` | 7/7 (24/11/2026 15:35) | 5,69 s | `logs/clean-run/consumer.png` |
| `npm run test:provider` | 7/7 (24/11/2026 15:45) | 3,92 s | `logs/clean-run/provider_1.png`, `logs/clean-run/provider_2.png` |

### P.5 Ảnh bằng chứng
- [x] Bước lấy phiên (DevTools, giá trị cookie đã che): `logs/clean-run/lay_phien.png`.
- [x] Kết quả `test:consumer` 7/7: `logs/clean-run/consumer.png`.
- [x] Kết quả `test:provider` 7/7: `logs/clean-run/provider_1.png` (I-01 đến I-03) và `provider_2.png` (I-04 đến I-07, tóm tắt).

### P.6 Chỗ hướng dẫn thiếu hoặc sai
Liệt kê để sửa `README.md` và `docs/setup.md` (lỗi chính tả hoặc thiếu bước rõ ràng thì tự sửa và commit riêng; còn lại gửi Mạnh).

| # | Vị trí (file, mục) | Vấn đề | Đề xuất sửa | Đã sửa? |
|---|---|---|---|---|
| 1 | `docs/setup.md` mục 7 (lỗi thường gặp) | Bảng chưa có lỗi `could not translate host name "db"` khi server lặp restart | Thêm dòng lỗi và lệnh tạo lại container server | Đã sửa |
| 2 | `docs/setup.md` mục 7, dòng `UNAUTHENTICATED` | Chưa nói `token.txt` cũ (hàng tuần) có thể hết hiệu lực | Bổ sung trường hợp này vào cột nguyên nhân | Đã sửa |

### P.7 Kết luận
- **Kết quả:** sau khi xử lý lỗi server ở mục 3 và lấy phiên mới, `test:consumer` đạt 7/7 và `test:provider` đạt 7/7 (ảnh ở mục 5). Đây là lượt **chạy lại trên môi trường sẵn có** (volume Docker, `.env`, `node_modules` từ 19/10/2026), **không phải máy sạch**.
- **Trung thực về quá trình:** lỗi `could not translate host name "db"` không có trong tài liệu nên phải tự chẩn đoán (có sự hỗ trợ của công cụ AI trong lúc chẩn đoán và dựng tài liệu); sau khi bổ sung vào `docs/setup.md`, người sau có thể tự xử lý.
- **Cải thiện đã làm:** thêm hai dòng vào bảng lỗi thường gặp (mục 6).
- **Chưa kiểm chứng:** nguyên nhân gốc của lỗi phân giải `db`; tổng thời gian từ đầu đến 7/7 (không đo). **Còn thiếu để đủ bằng chứng TASKS 4.3:** một lượt làm từ đầu trên môi trường mới (clone mới, volume Docker mới, tài khoản mới) có đo thời gian từng bước.
