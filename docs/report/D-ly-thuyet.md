# D. Cơ sở lý thuyết, phạm vi, giả định, rủi ro, tiêu chí

## D.1 Nguyên lý Contract Testing
**Hợp đồng (contract)** là bản ghi chính xác về cách hai thành phần nói chuyện với nhau: request nào được gửi, response nào được mong đợi.
Với **consumer-driven contract testing** (Pact), bên dùng dịch vụ (consumer) là bên đặt ra hợp đồng. Quy trình có hai pha:

1. **Pha consumer.** Test của consumer chạy với một *mock provider* do Pact dựng. Mỗi lần test gửi request và nhận response giả, Pact ghi cặp request/response đó vào file hợp đồng JSON.
2. **Pha provider.** *Pact Verifier* đọc file hợp đồng, phát lại từng request lên provider thật và so khớp response. Trước mỗi interaction, **provider state** đưa provider về đúng trạng thái dữ liệu mà interaction cần (ví dụ "workspace có ít nhất 1 Person").

Điểm khác với các kiểu test khác:
| Kiểu test | Cách làm | Khác với contract test |
|---|---|---|
| Integration test | Chạy cả hai bên cùng lúc và kiểm hành vi tổng | Chậm, nặng; khi fail khó biết bên nào sai |
| End-to-end (E2E) | Thao tác trên giao diện thật, đi qua mọi tầng | Chậm, dễ chập chờn; không chỉ rõ chỗ vỡ |
| Contract test | Kiểm riêng điểm nối giữa consumer và provider qua hợp đồng | Nhanh, không cần dựng cả hệ thống; fail chỉ rõ bên nào vi phạm |

Hợp đồng chỉ chứa phần consumer **thực sự dùng**, nên provider vẫn tự do đổi phần không ai dùng mà không báo động giả.

## D.2 Vì sao phù hợp với Twenty
- `twenty-front` và `twenty-server` tách rời hoàn toàn (không phụ thuộc trực tiếp vào nhau), chỉ giao tiếp qua GraphQL và cookie phiên. Đó chính là điểm nối mà Pact kiểm tra.
- Rủi ro thật: server đổi tên hoặc bỏ một field thì front hỏng mà không test nào báo trước. GraphQL còn có thể trả `null` cho field không tồn tại thay vì báo lỗi, nên việc đổi tên field có thể làm hỏng front **một cách âm thầm**.
- Hai nhóm làm việc độc lập (giao diện, máy chủ) rất cần một "hợp đồng" rõ ràng để thay đổi một bên mà biết ngay có ảnh hưởng bên kia hay không.
- Truy vấn của front được sinh từ metadata của workspace nên dễ lệch; hợp đồng chốt lại hình dạng dữ liệu mà front thật sự cần.

## D.3 Phạm vi
**Trong phạm vi** (7 interaction, [`docs/interactions.md`](../interactions.md)):
- `POST /graphql`: đọc People, Companies, Opportunities (I-01, I-02, I-04); tạo Person (I-03).
- `POST /metadata`: người dùng hiện tại (I-05).
- Hành vi xác thực và chống CSRF: phiên sai (I-06), thiếu Origin (I-07).

**Ngoài phạm vi:** `/metadata` ở mức đầy đủ, REST `/rest/...`, worker và hàng đợi, email, tích hợp bên thứ ba, hiệu năng, giao diện.
Lý do chọn: đây là các luồng front–server rõ ràng nhất, có truy vấn thật bắt được từ DevTools, đủ phủ đọc, ghi, metadata và xác thực với số lượng vừa sức (yêu cầu của đề tài là từ 5 interaction).
Hợp đồng chỉ kiểm **hình dạng** dữ liệu (tên field, kiểu, status code), không kiểm nghiệp vụ hay hiệu năng.

## D.4 Giả định
1. Image Twenty `v2.46.0` (pin theo digest) giữ nguyên suốt dự án.
2. Dữ liệu workspace ổn định, tối thiểu 1 Person, 1 Company, 1 Opportunity, đóng vai trò provider state. Tên workspace (`dlu-qa`) chỉ là quy ước, không ảnh hưởng kết quả vì hợp đồng dùng matcher kiểu chuỗi.
3. Verifier lấy được phiên đăng nhập hợp lệ (lấy thủ công, đặt vào `token.txt`).
4. Source đối chiếu (tag `sdk/v2.46.0`, commit `9070979`) chỉ để đọc hiểu; kết quả không phụ thuộc source vì hợp đồng verify trực tiếp vào image.

## D.5 Rủi ro và cách xử lý
Gồm cả rủi ro đã **thực sự gặp** trong dự án:

| Rủi ro | Trạng thái | Xử lý |
|---|---|---|
| **KI-1:** I-07 fail khi verify qua proxy vì proxy luôn đặt Origin, nên server trả 200 thay vì 403 | Đã gặp, đã sửa (21/11) | Chỉ đặt Origin khi request gốc có Origin |
| **KI-4:** Verifier gọi thẳng Twenty bị 403 `CSRF_ORIGIN_MISMATCH` ở 5 interaction dùng phiên hợp lệ. Nguyên nhân gốc: Verifier gửi `Host: 127.0.0.1:<cổng ngẫu nhiên>`, Twenty đối chiếu Origin với Host | Đã gặp, đã sửa (21/11) | `requestFilter` đặt lại Host về host của Origin; verify gọi thẳng 7/7 |
| **KI-2, KI-3:** thiếu provider state handler; I-03 để lại dữ liệu | Đã gặp, đã sửa (21/11) | Đủ 7 handler kiểm precondition thật; fixture I-03 được dọn trước và sau mỗi lượt |
| Schema động theo workspace | Còn | Dùng workspace cố định với dữ liệu tối thiểu |
| Phiên có thời hạn (đã thấy dùng được qua đêm, chưa đo hạn thật) | Còn | Lấy phiên mới khi verify báo `UNAUTHENTICATED` |
| Lỗi GraphQL trả HTTP 200 nên dễ bỏ sót | Đã xử lý | Đưa `errors[]` vào hợp đồng (I-06) |
| Thí nghiệm phá hợp đồng mới mô phỏng ở lớp proxy, chưa sửa mã Twenty thật | Còn (giới hạn) | Ghi rõ trong báo cáo; xem [`docs/known-issues.md`](../known-issues.md) |

Chi tiết nguyên nhân và cách sửa từng lỗi: [`docs/known-issues.md`](../known-issues.md).

## D.6 Tiêu chí pass/fail
Đối chiếu ngưỡng đặt ra ([`docs/contract-testing.md`](../contract-testing.md)) với kết quả thật ([`docs/testing.md`](../testing.md), `logs/`):

| Tiêu chí | Ngưỡng đạt | Kết quả thực tế |
|---|---|---|
| Số interaction | ≥ 5 | 7 |
| Verify trên server nguyên bản | 100% interaction pass | 7/7 (gọi thẳng `:3000`, 21/11/2026) |
| Phát hiện breaking change | Mỗi loại thay đổi (đổi tên, xóa field, đổi kiểu, thiếu Origin/phiên) làm ít nhất 1 interaction liên quan fail | M-2 đổi tên: I-01, I-03 fail; M-3 xóa field: I-04 fail; M-4 đổi kiểu: I-01, I-02, I-04 fail; I-07 khóa hành vi 403 khi thiếu Origin |
| Báo động giả | 0 | 0: M-0 (đối chứng) và M-6 (chỉ thêm field) đều 7/7 OK |
| Tái chạy | Người khác chạy lại theo README trên máy mới ra cùng kết quả | Đạt trên môi trường mới (clone, volume Docker, tài khoản mới, 24/11/2026): consumer 7/7, provider 7/7. Hạn chế: lượt này do công cụ AI chạy trên máy của Luyến, tạo tài khoản bằng API, chạy một lần ([`clean-run.md`](clean-run.md)) |

Một interaction được coi là **pass** khi response thật khớp hợp đồng về status code, header liên quan và hình dạng body (kiểu từng field qua matcher); **fail** khi thiếu field, sai kiểu hoặc sai status.
Kết luận chung cho bộ hợp đồng: đạt khi toàn bộ interaction pass trên server nguyên bản và mọi breaking change được mô phỏng đều làm fail đúng interaction liên quan.

## Giới hạn của kỹ thuật
- Chỉ kiểm hình dạng dữ liệu, không kiểm nghiệp vụ hay hiệu năng.
- Không thay thế E2E; chỉ phủ điểm nối consumer–provider.
- Kết quả thí nghiệm là mô phỏng, mỗi lượt chạy một lần (chưa đo độ ổn định qua nhiều lần chạy).
