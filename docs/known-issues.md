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

### KI-2. Thiếu provider state handler
`provider.verify.test.js` chỉ có 2 handler (`workspace có ít nhất 1 Person`, `token không hợp lệ`). Verifier chỉ cảnh báo rồi chạy tiếp.
Cần thêm 5 handler:
1. `workspace có ít nhất 1 Company` (I-02)
2. `workspace có ít nhất 1 Opportunity` (I-04)
3. `người dùng đã đăng nhập vào workspace` (I-05)
4. `phiên hợp lệ nhưng request thiếu Origin` (I-07)
5. `workspace sẵn sàng tạo Person I-03` (I-03, kèm teardown ở KI-3)

### KI-3. I-03 chưa có teardown tự động
Fixture UUID `d05b3c0b-1da6-4a73-852b-6ad2b77f7d9e` phải được xóa trước và sau mỗi lượt verify (`DeleteOnePerson` rồi `DestroyOnePerson`).
Hiện chỉ dọn tay; lượt verify kế tiếp có thể fail I-03 vì trùng UUID.

### KI-4. Verifier gọi thẳng Twenty bị 403
Khi không qua proxy, request bị 403 dù hợp đồng có Origin. Nguyên nhân gốc chưa xác định, hiện tránh bằng auth-proxy. Cần phân tích header (cookie, Origin, `x-app-version`) để kết luận.

## Giới hạn đã biết
- **Phiên bản:** image `v2.46.0` đã pin, nhưng source đối chiếu `a61e47d` chưa khớp tuyệt đối. Kết quả không phụ thuộc source.
- **Workspace:** hợp đồng quy ước `dlu-qa`, workspace Docker hiện có tên `phuoc`. Chưa có cách nạp dữ liệu mẫu chung cho cả nhóm.
- **Phiên đăng nhập:** lấy thủ công, hết hạn nhanh.
- **Thí nghiệm phá hợp đồng:** mới có M-1 (phía consumer); chưa có M-2 đến M-4 ở provider.
- **Phạm vi:** chỉ kiểm hình dạng dữ liệu, không kiểm nghiệp vụ hay hiệu năng.

## Việc còn lại
Thứ tự đề xuất, theo mức ảnh hưởng đến tiêu chí "100% pass" trong [contract-testing.md](contract-testing.md):
- [x] KI-1: verify 7/7 sau khi sửa Origin (21/11/2026).
- [ ] Thêm 5 provider state và teardown I-03 (KI-2, KI-3).
- [ ] Viết lại `rename-proxy` theo cookie (v2.46.0), chạy M-2, M-3, M-4 qua proxy, ghi log.
- [ ] Điều tra KI-4 và ghi nguyên nhân gốc.
- [ ] Thống nhất workspace `dlu-qa` và cách nạp dữ liệu mẫu.
- [ ] Kiểm tra chạy lại từ máy sạch theo README, ghi kết quả.
- [ ] Tạo tag cho phiên bản nộp và ghi vào `VERSIONS.md`.
