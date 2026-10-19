# twenty-pact-i01

Contract test (Pact): consumer = twenty-front, provider = twenty-server.
Phiên bản Twenty đã chốt: xem `VERSIONS.md`. Chạy được trên Windows, macOS, Linux.

## 1. Dựng Twenty
```
cd docker
cp .env.example .env      # Windows: copy .env.example .env, rồi điền ENCRYPTION_KEY
docker compose up -d
curl http://localhost:3000/healthz
```
Mở http://localhost:3000, tạo workspace/đăng nhập (dữ liệu mẫu nếu có).

## 2. Lấy phiên đăng nhập
Twenty v2.46.0 xác thực bằng cookie, không có header Authorization.
Đăng nhập trên trình duyệt → trang People → DevTools (F12) → Network → request `graphql` (FindManyPeople)
→ Request Headers → `cookie` → chép giá trị sau `twenty-session=` (bắt đầu bằng `sess_`, dừng trước dấu `;`).
Dán vào file `token.txt` (cùng cấp package.json), hoặc đặt biến `TWENTY_SESSION`. Không commit, không chia sẻ.
Nếu verify báo UNAUTHENTICATED ở I-01, lấy lại giá trị mới.

## 3. Tránh biến proxy
PowerShell: `Remove-Item Env:HTTP_PROXY,Env:HTTPS_PROXY -ErrorAction SilentlyContinue`
Bash: `unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy`

## 4. Chạy test
Cần hai terminal. Terminal 1 giữ `auth-proxy` chạy (cổng 4002 → Twenty cổng 3000):
```
npm install
npm run auth-proxy
```
Terminal 2:
```
npm run test:consumer          # sinh pacts/twenty-front-twenty-server.json
npm run test:provider          # verify qua auth-proxy vào Twenty thật
```
Lý do có auth-proxy: Twenty v2.46.0 trả 403 CSRF_ORIGIN_MISMATCH nếu request dùng cookie mà thiếu Origin hợp lệ.
Khi Verifier gọi thẳng, request tới server bị 403 dù hợp đồng có Origin (nguyên nhân chưa xác định); proxy đặt Origin,
thay cookie giả `valid-session` bằng phiên thật và in log request/response để đối chiếu.

### Thí nghiệm phá hợp đồng (hợp đồng đòi jobTitleName, server chỉ có jobTitle)
```
rm -rf pacts && BREAK=1 npx vitest run tests/consumer.test.js
npm run test:provider          # kỳ vọng I-01 FAILED
npm run test:consumer && npm run test:provider   # khôi phục xanh
```
(Trên PowerShell đặt `$env:BREAK=1` thay cho `BREAK=1`.)