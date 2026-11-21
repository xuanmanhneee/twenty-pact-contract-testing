# Task của Mạnh (2312686) và bàn giao cho phiên sau

> Danh sách task chung của cả nhóm đến khi hoàn thành: [`TASKS.md`](../TASKS.md). Mục 2 bên dưới là phần việc của Mạnh.

Nhiệm vụ theo báo cáo giữa kỳ: **dựng môi trường Docker, auth-proxy, provider verification**.
Cập nhật lần cuối: 21/11/2026. Danh sách vấn đề và việc còn lại đầy đủ: [`docs/known-issues.md`](known-issues.md).

## 1. Trạng thái hiện tại
- Consumer: 7/7 pass. Provider verify gọi thẳng `:3000`: **7/7 OK** (KI-1 Origin, KI-4 Host đã sửa).
- Provider state: đủ 7 handler, I-03 có `setup`/`teardown` tự động (KI-2, KI-3 xong).
- Thí nghiệm phá hợp đồng phía provider M-0, M-2, M-3, M-4, M-6: đều khớp kỳ vọng. Bằng chứng: `logs/experiments/`.
- Tài liệu chuẩn hóa ở `docs/` (mục lục: `docs/README.md`).
- **Đã push tới `510f3cc`; commit mới hơn thì hỏi trước khi push.** Đã đăng nhập `gh` bằng `xuanmanhneee`; push cần hỏi trước.

## 2. Việc cần làm tiếp (theo thứ tự đề xuất)
- [x] Push `main` (21/11, đã push tới 510f3cc).
- [x] KI-4 xong (21/11): nguyên nhân là Host của Verifier không khớp Origin; sửa trong `requestFilter`, bỏ được auth-proxy khỏi luồng verify. Chi tiết `docs/known-issues.md`.
- [ ] **Workspace `dlu-qa`:** hợp đồng quy ước tên này, workspace Docker thực tế có thể tên khác. Thống nhất tên và cách nạp dữ liệu mẫu (tối thiểu 1 Person, 1 Company, 1 Opportunity) cho cả nhóm; ghi vào `docs/setup.md` mục 2.
- [ ] **Chạy lại trên máy sạch** theo README: một thành viên khác (Luyến hoặc Phước) làm từ đầu, ghi kết quả và lỗi gặp phải. Đây là tiêu chí "tái chạy" của D.6 và phần H của báo cáo.
- [ ] **Pin phiên bản và tag:** tạo git tag cho bản nộp, ghi vào `VERSIONS.md`. Nếu tìm được tag source khớp image `v2.46.0` thì thay commit `a61e47d`.
- [ ] **Hạ tầng cho báo cáo (phần A–C, chưa có):** sơ đồ kiến trúc dạng ảnh, cây thư mục `tree -L 2`, danh sách dependency chính, ảnh chụp 3 luồng chạy được (đã có F1, F3, F4 trong `logs/`).
- [ ] **Quản trị dự án:** link Trello/Jira/GitHub Projects (chưa có trong tài liệu nào), phân công thật của 3 thành viên (báo cáo giữa kỳ còn trống). Rubric chấm lịch sử commit đều của từng người.
- [ ] **Báo cáo cuối kỳ và slide:** chưa bắt đầu. Hạn nộp trước buổi bảo vệ 1 tuần (khoảng đầu tháng 12/2026), ngày chính xác hỏi giảng viên. Nguồn nội dung: `docs/` cộng `logs/`.
- [x] Dọn (21/11): xóa `tests/probe.mjs`; đổi provider state `token không hợp lệ` thành `phiên không hợp lệ` (consumer, provider, pact, docs). **Chưa chạy lại provider verify** (Docker tắt): khi có stack, xác nhận vẫn 7/7.

## 3. Cách chạy lại nhanh (khi vào phiên mới)
Điều kiện:
1. Docker stack cũ `twenty-*` đang chạy (`curl localhost:3000/healthz` trả ok). **Không `docker compose down -v`**: volume `twenty_db-data` giữ workspace và dữ liệu mẫu, và Mạnh không còn nhớ mật khẩu cũ.
2. `token.txt` ở thư mục gốc chứa phiên `sess_...` (Chrome: F12 → Application → Cookies → `http://localhost:3000` → `twenty-session` → Value). Phiên hết hạn nhanh: nếu thấy `UNAUTHENTICATED`, lấy lại.
3. Gỡ biến proxy: `unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy`.

```bash
npm run test:consumer             # sinh hợp đồng
npm run test:provider             # gọi thẳng :3000, kỳ vọng 7/7 OK
npm run auth-proxy                # chỉ cần cho experiments (cổng 4002)
npm run experiments               # kỳ vọng 5/5 khớp, ghi logs/experiments/
```

## 4. Lưu ý và bẫy đã gặp
- `docker/.env` hiện là bí mật ngẫu nhiên **mới, không khớp** stack đang chạy (do bị mất `.env` cũ). Đừng dùng nó để dựng lại stack cũ. Nó đã nằm trong `.gitignore`.
- Provider state handler gọi thẳng `TARGET` (mặc định `:3000`) bằng phiên thật. Nếu Twenty chạy ở địa chỉ khác, đặt `TARGET`.
- Verify I-03 tạo Person thật rồi tự xóa (xóa vĩnh viễn). Nếu một lượt bị ngắt giữa chừng, lượt sau tự dọn nhờ `setup`.
- Windows: `git` cảnh báo LF/CRLF. `pacts/twenty-front-twenty-server.json` sinh lại chỉ khác kiểu xuống dòng, đừng commit (`git checkout -- pacts`).
- `logs/auth-proxy-run.log` là stdout của auth-proxy chạy nền, tăng dần, chưa commit bản mới.
- Không ghi phiên `sess_...`, khóa mã hóa vào tài liệu, log hay commit.
- `TASK_PHUOC.md` là nhật ký của Phước: chỉ thêm mục "Việc tiếp theo" ở cuối (Mạnh cho phép 21/11), không sửa phần cũ. `TASK_LUYEN.md` là việc giao cho Luyến.
- Quy tắc làm việc: xong mỗi task thì commit (danh tính `xuanmanhneee`, repo local); **push thì hỏi trước**. Chỉ commit khi đã chạy kiểm chứng thật.

## 5. Ghi chú tiến độ
- 21/11: gộp nhánh `feat/phuoc-consumer-tests` vào `main` (7 interaction).
- 21/11: sửa KI-1 (Origin), verify 7/7. Chuẩn hóa `docs/`.
- 21/11: KI-2, KI-3 (state handler, teardown I-03).
- 21/11: thí nghiệm M-0, M-2, M-3, M-4, M-6 qua `mutate-proxy`; bằng chứng `logs/experiments/`.
