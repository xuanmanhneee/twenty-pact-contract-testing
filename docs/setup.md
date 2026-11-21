# Cài đặt môi trường

Lệnh chạy nhanh nằm trong [`README.md`](../README.md). Tài liệu này giải thích đầy đủ hơn.

## Yêu cầu
| Công cụ | Phiên bản | Ghi chú |
|---|---|---|
| Docker + Docker Compose | bản mới | Dựng Twenty |
| Node.js | ≥ 22 | Chạy test (đã thử với Node 26 trên Windows) |
| npm | đi kèm Node | `npm install` |
| Hệ điều hành | Windows, macOS, Linux | Nhóm dùng Windows 11 (+ WSL2) |

Phiên bản chính xác của Twenty, PostgreSQL, Redis (kèm digest): [`VERSIONS.md`](../VERSIONS.md).
Phụ thuộc test: `@pact-foundation/pact` 16.x, `vitest` 3.x, khóa bằng `package-lock.json`.

## 1. Dựng Twenty
```bash
cd docker
cp .env.example .env          # Windows: copy .env.example .env
# điền các giá trị CHANGE_ME trong .env (xem bảng dưới)
docker compose up -d
curl http://localhost:3000/healthz
```
Mở http://localhost:3000, tạo tài khoản và workspace.

### Biến môi trường (`docker/.env`)
| Biến | Giá trị | Ghi chú |
|---|---|---|
| `TAG` | `v2.46.0@sha256:...` | Đã pin sẵn trong `.env.example`, không đổi |
| `PG_DATABASE_PASSWORD` | tự đặt | Mật khẩu PostgreSQL |
| `PG_DATABASE_USER/HOST/PORT/NAME` | `postgres` / `db` / `5432` / `default` | Mặc định |
| `SERVER_URL` | `http://localhost:3000` | Phải khớp `Origin` dùng trong test |
| `REDIS_URL` | `redis://redis:6379` | Mặc định |
| `ENCRYPTION_KEY`, `FALLBACK_ENCRYPTION_KEY`, `APP_SECRET` | tự sinh | Chuỗi ngẫu nhiên riêng cho máy bạn |
| `STORAGE_TYPE` | `local` | Không cần S3 |

Sinh khóa ngẫu nhiên: `openssl rand -base64 32`. `docker/.env` đã nằm trong `.gitignore`, không commit.

## 2. Dữ liệu mẫu
**Quy ước chung (chốt 21/11/2026):**
- Mỗi người tự chạy Docker riêng, nên mỗi người có DB và workspace riêng. Không có dữ liệu dùng chung giữa các máy.
- Tên workspace đề nghị là **`dlu-qa`** nhưng **không bắt buộc**: trong hợp đồng I-05, `displayName` là matcher kiểu chuỗi (`string('dlu-qa')`), nên tên nào cũng pass. Bằng chứng: workspace `phuoc` của Phước đã pass I-05 khi verify (`logs/provider-run-i03.log`).
- Dữ liệu tối thiểu: **ít nhất 1 Person, 1 Company, 1 Opportunity** (workspace của Mạnh hiện có 5/5/6). Thiếu thì state handler báo lỗi rõ ràng (`Precondition không thỏa: workspace không có people ...`) trước khi verify.
- Cách nạp: dùng dữ liệu mẫu có sẵn khi tạo workspace mới (Twenty seed sẵn People, Companies, Opportunities); nếu workspace trống, tạo tay mỗi loại 1 bản ghi trong giao diện (trang People, Companies, Opportunities, nút **+ New**), rồi chạy `npm run test:provider`.
- Verify I-03 tạo và xóa một Person fixture (UUID cố định) nên không làm đổi số bản ghi sau mỗi lượt.

## 3. Lấy phiên đăng nhập cho verifier
Twenty v2.46.0 xác thực bằng cookie. Verifier cần một phiên thật:
1. Đăng nhập trên trình duyệt, mở trang People.
2. DevTools (F12) → Network → chọn request `graphql` (`FindManyPeople`) → Request Headers → `cookie`.
3. Chép giá trị sau `twenty-session=` (bắt đầu bằng `sess_`, dừng trước dấu `;`).
4. Dán vào `token.txt` ở thư mục gốc, hoặc đặt biến `TWENTY_SESSION`.

Phiên hết hạn nhanh: nếu verify báo `UNAUTHENTICATED` ở I-01, lấy lại giá trị mới. `token.txt` đã nằm trong `.gitignore`.

## 4. Cài phụ thuộc test
```bash
npm install
```

## 5. Biến môi trường của test
| Biến | Mặc định | Tác dụng |
|---|---|---|
| `TWENTY_SESSION` | đọc từ `token.txt` | Phiên thật cho verifier |
| `TWENTY_URL` | `http://localhost:3000` | Địa chỉ provider mà verifier gọi (đặt `http://localhost:4002` để đi qua auth-proxy) |
| `TWENTY_ORIGIN` | `http://localhost:3000` | Origin gán cho request |
| `TARGET` | `http://localhost:3000` | Đích của auth-proxy |
| `PROXY_PORT` | `4002` | Cổng của auth-proxy |
| `BREAK` | không đặt | Bật thí nghiệm đổi `jobTitle` → `jobTitleName` |
| `DEBUG_PACT` | không đặt | In thêm log request filter |

## 6. Lưu ý
- **Proxy hệ thống:** Verifier bỏ qua `NO_PROXY` và có thể bị 403 khi có `HTTP_PROXY`. Gỡ trước khi chạy:
  - PowerShell: `Remove-Item Env:HTTP_PROXY,Env:HTTPS_PROXY -ErrorAction SilentlyContinue`
  - Bash: `unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy`
- **Máy Windows + WSL2:** đặt repo trong hệ tệp Linux nếu chạy trong WSL, tránh `/mnt/d` (chậm, dễ lỗi I/O).
- **Gỡ dữ liệu:** `docker compose down -v` xóa cả volume, workspace và dữ liệu mẫu sẽ mất.
