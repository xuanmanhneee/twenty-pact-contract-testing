# Vấn đề đang mở và việc còn lại

Cập nhật: 21/11/2026, dựa trên `main` tại `1b43d3b` cộng bản sửa KI-1.

## Lỗi đang mở
### KI-1. I-07 fail khi verify qua auth-proxy (ĐÃ SỬA, xác nhận 21/11/2026)
- **Hiện tượng:** `npm run test:provider` pass 6/7, riêng I-07 fail.
- **Nguyên nhân:** hợp đồng I-07 không có Origin và kỳ vọng 403. `tests/auth-proxy.mjs` (`origin: ORIGIN` trong `headers`) và `requestFilter` trong `tests/provider.verify.test.js` (`req.headers['origin'] = ORIGIN`) luôn gán Origin, nên server trả 200.
- **Cách sửa đã kiểm chứng** (proxy điều kiện cổng 4003, 6/6 pass, log `logs/provider-run-review-fix-diagnostic.log`): chỉ đặt Origin khi request gốc có Origin.
  ```js
  // provider.verify.test.js
  if (req.headers['origin']) req.headers['origin'] = ORIGIN;
  ```
  ```js
  // auth-proxy.mjs
  const headers = { ...req.headers, host: TARGET.host };
  if (req.headers.origin) headers.origin = ORIGIN;
  ```
- **Trạng thái:** đã áp dụng vào `auth-proxy.mjs` và `provider.verify.test.js`. Verify thật qua `:4002`: **7/7 interaction OK**, I-07 đến server không có Origin và nhận `403 CSRF_ORIGIN_MISMATCH` (log: `logs/auth-proxy-run.log`).

### KI-2. Thiếu provider state handler (ĐÃ SỬA, 21/11/2026)
`tests/provider.verify.test.js` nay có đủ 7 handler, mỗi state của hợp đồng một handler. Handler kiểm tra precondition thật
thay vì để trống: `requireRecords` truy vấn `totalCount` của People/Companies/Opportunities, handler đăng nhập gọi `currentUser` qua `/metadata`.
Precondition không thỏa thì báo lỗi rõ ràng thay vì để verify fail khó hiểu. Các handler này gọi thẳng Twenty (`TARGET`, mặc định `:3000`) bằng phiên thật.
Chưa kiểm thử nhánh báo lỗi của các handler này (workspace rỗng hoặc phiên hết hạn).

### KI-3. I-03 chưa có teardown tự động (ĐÃ SỬA, 21/11/2026)
State `workspace sẵn sàng tạo Person I-03` có `setup` và `teardown` cùng gọi `cleanupI03` (`DeletePerson` rồi `DestroyPerson` cho fixture
`d05b3c0b-1da6-4a73-852b-6ad2b77f7d9e`), idempotent. Kiểm chứng 3 tình huống, đều 7/7 và không còn fixture sau verify:
chạy sạch, chạy lặp lại (chứng minh fixture bị xóa vĩnh viễn vì tạo lại cùng UUID không bị trùng), và chạy khi fixture còn sót từ trước.

### KI-4. Verifier gọi thẳng Twenty bị 403 (ĐÃ SỬA, xác nhận 21/11/2026)
- **Triệu chứng:** gọi thẳng `:3000`, 5 interaction dùng phiên hợp lệ (I-01 đến I-05) trả 403 `CSRF_ORIGIN_MISMATCH`; I-06, I-07 vẫn OK.
- **Nguyên nhân gốc:** Verifier phát lại request tới Twenty với `Host: 127.0.0.1:<cổng ngẫu nhiên>` (bắt bằng server giả ở `:4009`). Cookie, Origin và `x-app-version` đều đúng. Twenty đối chiếu Origin với Host: cùng cookie + Origin `http://localhost:3000`, Host `localhost:3000` cho 200, còn Host `127.0.0.1:53331` hoặc `127.0.0.1:3000` cho 403. Auth-proxy trước đây tránh được lỗi vì tự đặt `host: TARGET.host`.
- **Cách sửa:** trong `requestFilter` đặt `req.headers['host'] = new URL(ORIGIN).host`. Verify gọi thẳng: **7/7 OK**. Mặc định `TWENTY_URL` giờ là `http://localhost:3000`.

## Giới hạn đã biết
- **Phiên bản:** image `v2.46.0` đã pin theo digest; source đối chiếu là tag `sdk/v2.46.0` (commit `9070979`, trùng ngày build 09/10/2026) nhưng image không công bố commit nên chưa chứng minh khớp từng byte. Kết quả không phụ thuộc source.
- **Workspace:** tên `dlu-qa` chỉ là quy ước, không ảnh hưởng kết quả verify (matcher kiểu chuỗi). Mỗi người có dữ liệu riêng trên Docker của mình; quy ước dữ liệu tối thiểu ở [setup.md](setup.md) mục 2.
- **Phiên đăng nhập:** lấy thủ công, có thời hạn (chưa đo).
- **Thí nghiệm phá hợp đồng:** M-2, M-3, M-4 mô phỏng ở lớp proxy (không sửa server thật), mỗi lượt chạy một lần. Chưa thử thay đổi thật trên mã nguồn Twenty.
- **Phạm vi:** chỉ kiểm hình dạng dữ liệu, không kiểm nghiệp vụ hay hiệu năng.

## Việc còn lại
Thứ tự đề xuất, theo mức ảnh hưởng đến tiêu chí "100% pass" trong [contract-testing.md](contract-testing.md):
- [x] KI-1: verify 7/7 sau khi sửa Origin (21/11/2026).
- [x] KI-2, KI-3: đủ provider state và teardown tự động cho I-03 (21/11/2026).
- [x] M-2, M-3, M-4 (+ M-0 đối chứng, M-6 tương thích ngược): chạy qua `mutate-proxy`, bằng chứng ở `logs/experiments/` (21/11/2026).
- [x] KI-4: nguyên nhân gốc là Host, đã sửa (21/11/2026).
- [x] Thống nhất workspace `dlu-qa` và dữ liệu mẫu (21/11/2026), xem setup.md mục 2.
- [ ] Kiểm tra chạy lại từ máy sạch theo README, ghi kết quả.
- [ ] Tạo tag cho phiên bản nộp và ghi vào `VERSIONS.md`.
