# Contract testing cho Twenty

## Nguyên lý
Consumer-driven contract testing gồm hai pha:
1. **Consumer:** test của consumer chạy với mock provider do Pact dựng, ghi lại request và response mong đợi thành hợp đồng JSON.
2. **Provider:** Pact Verifier phát lại từng request trong hợp đồng lên provider thật và so khớp response.

Hợp đồng chỉ chứa phần consumer **thực sự dùng**, nên provider vẫn tự do đổi phần không ai dùng. Không cần chạy end-to-end cả hệ thống,
và khi fail thì chỉ rõ bên nào vi phạm.

## Vì sao phù hợp
Twenty tách rõ `twenty-front` và `twenty-server` qua GraphQL. Rủi ro thật: server đổi tên hoặc bỏ field thì front hỏng mà không test nào báo trước.
Theo đặc tả GraphQL, truy vấn field không có trong schema bị lỗi validate (`Cannot query field ...`); lỗi này có thể đi kèm HTTP 200 và `errors[]` (đã quan sát ở I-06), nên chỉ kiểm status code sẽ không phát hiện.

## Phạm vi
**Trong phạm vi**
- `POST /graphql`: People, Companies, Opportunities (đọc), tạo Person (ghi).
- `POST /metadata`: `GetCurrentUser`.
- Hành vi xác thực và CSRF của các truy vấn trên (phiên sai, thiếu Origin).

**Ngoài phạm vi:** `/metadata` ở mức đầy đủ, REST `/rest/...`, worker và hàng đợi, email, tích hợp bên thứ ba, hiệu năng, giao diện.

## Quy ước viết hợp đồng
- **Truy vấn lấy từ request thật** của `twenty-front` (Chromium/DevTools), đối chiếu từng byte với `tests/queries.js`. Không tự viết.
- Chỉ đưa field consumer dùng. So khớp theo **kiểu** bằng matcher (`like`, `eachLike`, `regex`), không khóa cứng giá trị dễ đổi.
- Khóa cứng phần thuộc về hợp đồng: tên field, kiểu, status code, `operationName`.
- Riêng lỗi CSRF (I-07) khóa nguyên văn `statusCode`, `error`, `messages` vì đó là hành vi thật của server.
- Regex trong Pact phải neo `^…$`, nếu không mock server báo không khớp.
- Phiên và Origin trong hợp đồng là giá trị giả (`valid-session`); verifier thay bằng giá trị thật lúc chạy.

## Giả định
1. Image Twenty `v2.46.0` (đã pin digest) giữ nguyên suốt dự án.
2. Dữ liệu workspace `dlu-qa` ổn định, đóng vai trò provider state.
3. Verifier lấy được phiên đăng nhập hợp lệ (thủ công qua `token.txt`).
4. Source đối chiếu là tag `sdk/v2.46.0` (commit `9070979`) chỉ để đọc hiểu; kết quả không phụ thuộc source vì hợp đồng verify trực tiếp vào image.

## Rủi ro
| Rủi ro | Mức | Xử lý |
|---|---|---|
| Verifier gọi thẳng Twenty bị 403 (KI-4, ĐÃ SỬA 21/11/2026) | Đã xử lý | Nguyên nhân: Host của Verifier không khớp Origin; `requestFilter` đặt lại Host |
| Schema động theo workspace | Trung bình | Chỉ dùng workspace cố định `dlu-qa` |
| Phiên có thời hạn (đã thấy dùng được qua đêm, chưa đo hạn thật) | Trung bình | Lấy phiên mới khi verify báo UNAUTHENTICATED |
| Mutation (I-03) để lại dữ liệu | Trung bình | Fixture UUID cố định, dọn trước/sau verify |
| Lỗi GraphQL vẫn trả HTTP 200 nên dễ bỏ sót | Thấp | Đưa `errors[]` vào hợp đồng (I-06) |

## Tiêu chí pass/fail
| Tiêu chí | Ngưỡng đạt |
|---|---|
| Số interaction | ≥ 5 (hiện có 7) |
| Verify trên server nguyên bản | 100% interaction pass |
| Phát hiện breaking change | Mỗi loại thay đổi (đổi tên, xóa field, đổi kiểu, thiếu Origin/phiên) làm ít nhất 1 interaction liên quan fail |
| Báo động giả | 0: interaction không liên quan không fail |
| Tái chạy | Người khác chạy lại theo README trên máy mới ra cùng kết quả |

## Giới hạn của kỹ thuật
- Hợp đồng chỉ kiểm **hình dạng** dữ liệu, không kiểm nghiệp vụ hay hiệu năng.
- Không thay thế E2E; chỉ phủ điểm nối consumer–provider.
- Provider state hiện chưa tự động hóa (xem [known-issues.md](known-issues.md)).
