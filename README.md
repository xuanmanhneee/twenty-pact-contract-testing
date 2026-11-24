# twenty-pact-i01

Contract test (Pact): consumer = twenty-front, provider = twenty-server.
Phiên bản Twenty đã chốt: xem `VERSIONS.md`. Chạy được trên Windows, macOS, Linux.

## 0. Bắt đầu nhanh (thành viên mới)
1. Cài Docker Desktop, Node.js >= 22, Git. Clone repo rồi `git pull` trước mỗi buổi làm.
2. Làm theo mục 1 đến 3 bên dưới (dựng Twenty, tạo tối thiểu 1 Person, 1 Company, 1 Opportunity, lấy phiên vào `token.txt`), rồi `npm install` và `npm run all`. Kỳ vọng "TẤT CẢ ĐẠT" (khoảng 20 giây). Lỗi thường gặp: `docs/setup.md` mục 7.
3. Việc cần làm: `TASKS.md` (danh sách chung), `docs/TASK_LUYEN.md`, `docs/TASK_PHUOC.md`, `docs/TASK_MANH.md`; bảng phân công và checklist: `docs/report/phan-cong-cong-viec.md`. Mỗi người commit bằng tài khoản của mình, mỗi việc nhỏ một commit.
4. Báo cáo nháp: `docs/report/bao-cao-cuoi-ky.md` (chỗ `CHỜ` là phần chưa có số liệu). Bối cảnh và yêu cầu chấm: `docs/report-context.md`.
5. Slide: `cd slides && npm install && npm run dev` (http://localhost:3030). Kịch bản demo: `docs/demo.md`.

## 1. Dựng Twenty
```
cd docker
cp .env.example .env      # Windows: copy .env.example .env, rồi điền ENCRYPTION_KEY
docker compose up -d
curl http://localhost:3000/healthz
```
`docker compose up -d` có thể chờ vài phút (khoảng 4 phút để `/healthz` trả `ok` ở lần chạy đầu); chưa lên thì chờ rồi chạy lại `curl`. Cổng 3000 phải trống (dừng stack Twenty khác nếu có).
Mở http://localhost:3000, tạo workspace/đăng nhập. Workspace mới thường tự có dữ liệu mẫu; chi tiết ở `docs/setup.md` mục 2.

## 2. Lấy phiên đăng nhập
Twenty v2.46.0 xác thực bằng cookie, không có header Authorization.
Đăng nhập trên trình duyệt → DevTools (F12) → **Application** (Firefox: Storage) → Cookies → `http://localhost:3000`
→ dòng `twenty-session` → chép cột Value (bắt đầu bằng `sess_`). Cách khác: tab Network → request `graphql` → header `cookie`.
Dán vào file `token.txt` (cùng cấp package.json), hoặc đặt biến `TWENTY_SESSION`. Không commit, không chia sẻ.
Nếu verify báo UNAUTHENTICATED ở I-01, lấy lại giá trị mới.

## 3. Tránh biến proxy
PowerShell: `Remove-Item Env:HTTP_PROXY,Env:HTTPS_PROXY -ErrorAction SilentlyContinue`
Bash: `unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy`

## 4. Chạy test
```
npm install
npm run test:consumer          # sinh pacts/twenty-front-twenty-server.json
npm run test:provider          # verify gọi thẳng Twenty thật (:3000)
```
Hoặc chạy toàn bộ bằng một lệnh (kiểm tra điều kiện, consumer, provider, thí nghiệm phá hợp đồng; in tóm tắt và ghi `logs/run-all-summary.md`):
```
npm run all
```
Verifier gọi thẳng Twenty, không cần proxy. `requestFilter` thay cookie giả `valid-session` bằng phiên thật và đặt
`Host`/`Origin` về `localhost:3000` (Twenty v2.46.0 trả 403 CSRF_ORIGIN_MISMATCH khi Host không khớp Origin, xem KI-4
trong `docs/known-issues.md`). `auth-proxy` (`npm run auth-proxy`, cổng 4002) chỉ còn dùng cho thí nghiệm và chẩn đoán.

### Thí nghiệm phá hợp đồng (hợp đồng đòi jobTitleName, server chỉ có jobTitle)
```
rm -rf pacts && BREAK=1 npx vitest run tests/consumer.test.js
npm run test:provider          # kỳ vọng I-01 FAILED
npm run test:consumer && npm run test:provider   # khôi phục xanh
```
(Trên PowerShell đặt `$env:BREAK=1` thay cho `BREAK=1`.)

## Tài liệu
Xem thư mục [`docs/`](docs/README.md): kiến trúc, cài đặt, danh mục interaction, cách chạy test và vấn đề đang mở.
