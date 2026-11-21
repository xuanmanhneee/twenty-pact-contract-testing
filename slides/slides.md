---
theme: default
title: Contract Testing (Pact) cho Twenty CRM
info: |
  Nhóm 12 - Kiểm thử Phần mềm - ĐH Đà Lạt
  Số liệu lấy từ docs/testing.md và logs/ (lượt chạy 21/11/2026).
class: text-left
transition: none
mdc: true
---

# Contract Testing (Pact) cho Twenty CRM

Đề tài R10 × K04 · Môn Kiểm thử Phần mềm · ĐH Đà Lạt

Nhóm 12: Phan Lê Xuân Mạnh (2312686) · Liêng Hót Ha Luyến (2312682) · Mai Quý Phước (2312716)

GV: Nguyễn Thế Lâm

<!--
Mở đầu 20 giây: giới thiệu nhóm và đề tài. Số liệu trong slide lấy từ lượt chạy ngày 21/11/2026.
-->

---

# Vấn đề

- Twenty gồm giao diện (**twenty-front**) và máy chủ (**twenty-server**), giao tiếp qua **GraphQL**
- Máy chủ đổi tên, xóa hoặc đổi kiểu một field mà giao diện vẫn dùng → **giao diện vỡ**
- Test riêng từng khối **không thấy** lỗi này, E2E thì chậm và khó chỉ ra bên nào sai

**Câu hỏi:** làm sao phát hiện nhanh khi hai bên không còn "hiểu nhau"?

---

# Contract testing và Pact

1. **Consumer** (giao diện) khai báo: tôi gửi request này, tôi mong nhận response dạng này
2. Pact lưu thành **hợp đồng** (file JSON)
3. **Provider** (máy chủ): Verifier phát lại từng request vào máy chủ thật và so sánh với hợp đồng

| | Contract test | Integration / E2E |
|---|---|---|
| Tốc độ | vài giây | chậm |
| Phạm vi | hình dạng dữ liệu | cả luồng nghiệp vụ |
| Chỉ ra bên sai | có (consumer hay provider) | khó |

---

# Hệ thống và phạm vi

- Twenty CRM **v2.46.0**, chạy bằng **Docker** (image pin theo digest, PostgreSQL 16, Redis)
- Consumer: `twenty-front` · Provider: `twenty-server` · Pact 16.5.0, vitest
- Giao tiếp: `POST /graphql` (dữ liệu) và `POST /metadata` (người dùng hiện tại)
- **Phạm vi:** 7 interaction, chỉ kiểm hình dạng dữ liệu (status, header, cấu trúc và kiểu của body). Không kiểm nghiệp vụ, hiệu năng

<!--
Sơ đồ kiến trúc dạng ảnh do Luyến vẽ (TASKS 3.1): chèn ở slide này khi có.
-->

---

# 7 interaction

| ID | Nội dung | Endpoint |
|---|---|---|
| I-01 | Xem danh sách People | /graphql |
| I-02 | Xem danh sách Companies | /graphql |
| I-03 | Tạo Person (mutation) | /graphql |
| I-04 | Xem Opportunities | /graphql |
| I-05 | Lấy người dùng hiện tại | /metadata |
| I-06 | Phiên sai → vẫn **HTTP 200** + `errors[]` | /graphql |
| I-07 | Thiếu Origin → **403** `CSRF_ORIGIN_MISMATCH` | /graphql |

Request lấy từ **twenty-front thật**, bắt bằng Chromium, đối chiếu từng byte với `tests/queries.js`

---

# Quy trình

```text
 request thật của twenty-front
          │  (bắt bằng Chromium)
          ▼
 consumer test (npm run test:consumer)  ──►  pacts/*.json  (hợp đồng)
                                                   │
                                                   ▼
 Verifier (npm run test:provider)  ──►  Twenty thật :3000  ──►  so sánh response
          ▲
   provider state: dữ liệu mẫu, xóa fixture I-03 (setup/teardown)
```

Chạy toàn bộ bằng một lệnh: `npm run all` (khoảng 20 giây)

---

# Kết quả (21/11/2026)

| Lượt chạy | Interaction | Đạt | Thời gian |
|---|---|---|---|
| Consumer | 7 | **7** | 1,25 s |
| Provider verify (gọi thẳng :3000) | 7 | **7** | 3,16 s |

Thời gian verify từng interaction: I-01 302 ms · I-02 84 ms · I-03 1,10 s (có setup/teardown) · I-04 81 ms · I-05 103 ms · I-06 18 ms · I-07 16 ms

Nguồn: `docs/testing.md`, `logs/provider-run-direct-21-11.log`

---

# Thí nghiệm phá hợp đồng (negative control)

Proxy sửa JSON response; máy chủ Twenty thật **không bị sửa**.

| Mã | Thay đổi | Interaction fail | Kết quả |
|---|---|---|---|
| M-0 | Đối chứng (không đổi) | không | khớp |
| M-2 | Đổi tên `jobTitle` | I-01, I-03 | khớp |
| M-3 | Xóa field `amount` | I-04 | khớp |
| M-4 | `totalCount` từ số sang chuỗi | I-01, I-02, I-04 | khớp |
| M-6 | Thêm field mới | không | khớp (không báo động giả) |

→ Mỗi thay đổi phá vỡ chỉ làm fail **đúng** interaction dùng field đó

---
layout: center
---

# Demo

```bash
npm run test:consumer        # 7 passed
npm run test:provider        # I-01 ... I-07 đều OK
npm run experiments -- M-2   # I-01, I-03 FAILED: missing key jobTitle
npm run experiments -- M-6   # 7/7 OK, thêm field không làm fail
```

Dự phòng: `logs/provider-run-direct-21-11.log`, `logs/experiments/summary.md`

---

# Vấn đề gặp và nguyên nhân gốc

| Mã | Hiện tượng | Nguyên nhân gốc | Xử lý |
|---|---|---|---|
| KI-1 | I-07 nhận 200 thay vì 403 | Proxy đặt Origin cho mọi request | Chỉ đặt Origin khi request gốc có |
| KI-2 | Thiếu provider state | Chưa có handler | Đủ 7 handler |
| KI-3 | I-03 tạo Person thật, chạy lặp trùng UUID | Không có teardown | setup/teardown xóa fixture |
| KI-4 | Gọi thẳng Twenty: 5 interaction bị 403 | Verifier gửi `Host: 127.0.0.1:<cổng ngẫu nhiên>`, Twenty đối chiếu Origin với Host | `requestFilter` đặt lại Host |

---

# Có phát hiện lỗi của Twenty không?

**Chưa.** Bốn vấn đề trên thuộc môi trường test của nhóm.

Thay vào đó, nhóm chứng minh bộ test **đáng tin**:
- Provider thật thỏa hợp đồng (7/7)
- Hợp đồng **bắt được** thay đổi phá vỡ (M-2, M-3, M-4 fail đúng chỗ)
- Hợp đồng **không báo động giả** (M-0, M-6)

Quan sát hành vi Twenty v2.46.0 (không phải lỗi): phiên sai trả HTTP 200 thay vì 401; 403 CSRF không có `extensions.code`

---

# Hạn chế

- Thay đổi chỉ **mô phỏng ở lớp proxy**, chưa sửa mã máy chủ thật; mỗi lượt chạy một lần
- Phiên đăng nhập lấy thủ công, có thời hạn
- Mã nguồn đối chiếu (tag `sdk/v2.46.0`) trùng ngày build image nhưng chưa chứng minh khớp từng byte
- Không có Pact Broker và CI
- Chỉ kiểm hình dạng dữ liệu của 7 interaction

---

# Đóng góp và lịch sử commit

**CHỜ:** cập nhật sau khi cả nhóm hoàn thành phần việc và chốt peer review (`docs/report/phan-cong-cong-viec.md`).

Số commit đến 21/11/2026 (`git shortlog -sn --all`): Mạnh 12 · Phước 6 · Luyến 0

| Người | Việc chính |
|---|---|
| Mạnh | Docker, provider verify, KI-1 đến KI-4, thí nghiệm phá hợp đồng, `npm run all` |
| Phước | Scenario, consumer test I-02 đến I-07, log/metrics |
| Luyến | Kiến trúc, sơ đồ, tài liệu on-boarding (đang thực hiện) |

<!--
Trước buổi bảo vệ: thay bảng bằng số liệu thật từ git và peer review. Không nói quá những việc chưa làm.
-->

---

# Kết luận

- Contract testing kiểm tra **nhanh, cô lập, tự động** sự tương thích giữa twenty-front và twenty-server
- 7 interaction pass trên Twenty thật; thí nghiệm phá hợp đồng cho kết quả đúng kỳ vọng
- Bài học lớn nhất: lỗi nằm ở tương tác với **cơ chế bảo mật** (CSRF qua Origin và Host), không phải ở hình dạng dữ liệu
- Hướng mở rộng: thêm interaction (cập nhật, xóa, lọc), Pact Broker + CI, tự động hóa đăng nhập

**Cảm ơn thầy và các bạn. Xin nghe câu hỏi.**

<!--
Câu hỏi dự kiến và gợi ý trả lời: docs/demo.md mục 5.
-->
