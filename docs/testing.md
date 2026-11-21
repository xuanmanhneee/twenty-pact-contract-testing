# Chạy test và kết quả

## Lệnh
Cần Twenty đang chạy và `token.txt` (xem [setup.md](setup.md)). Dùng hai terminal.

```bash
npm run test:consumer         # xóa pacts/, sinh lại hợp đồng
npm run test:provider         # verify hợp đồng gọi thẳng Twenty thật (:3000)
```

| Script | Việc làm |
|---|---|
| `test:consumer` | `rimraf pacts` rồi chạy `tests/consumer.test.js` |
| `test:provider` | Chạy `tests/provider.verify.test.js` (mặc định gọi thẳng `:3000`) |
| `auth-proxy` | Proxy thay cookie giả bằng phiên thật, đặt Origin, in log |
| `break:rename-field` | Sinh hợp đồng với `BREAK=1` rồi verify |
| `mutate-proxy` | Proxy `:4001` sửa JSON response; cấu hình bằng `MUTATION`, `FIELD`, `TO` (xem đầu `tests/mutate-proxy.mjs`) |
| `experiments` | Chạy tự động các thí nghiệm provider (M-0, M-2, M-3, M-4, M-6), ghi `logs/experiments/` |

## Thí nghiệm phá hợp đồng (negative control)
Mục đích: chứng minh hợp đồng bắt được breaking change mà không gây báo động giả.

| Mã | Thay đổi mô phỏng | Phía | Interaction phải fail | Kết quả (21/11/2026) |
|---|---|---|---|---|
| M-0 | Đối chứng: proxy chuyển tiếp nguyên vẹn | Provider | (không) | 7/7 OK, khớp |
| M-1 | Đổi `jobTitle` → `jobTitleName` trong hợp đồng | Consumer | I-01 | Đã chạy 16/11, I-01 fail, còn lại pass |
| M-2 | Provider đổi tên `jobTitle` → `jobTitleName` | Provider | I-01, I-03 | Khớp: đúng I-01 và I-03 fail |
| M-3 | Provider xóa field `amount` | Provider | I-04 | Khớp: chỉ I-04 fail |
| M-4 | Provider đổi kiểu `totalCount` từ số sang chuỗi | Provider | I-01, I-02, I-04 | Khớp: đúng 3 interaction đó fail |
| M-5 | Thiếu Origin | Consumer | I-07 phải trả 403 | Có trong hợp đồng, pass 7/7 từ 21/11 |
| M-6 | Provider thêm field mới `jobTitleExtra` (tương thích ngược) | Provider | (không) | Khớp: 7/7 OK, không báo động giả |

Chạy M-1:
```bash
BREAK=1 npm run test:consumer         # PowerShell: $env:BREAK=1; npm run test:consumer
npm run test:provider                 # kỳ vọng I-01 FAILED
npm run test:consumer && npm run test:provider   # khôi phục (nhớ bỏ BREAK)
```

Chạy M-0, M-2, M-3, M-4, M-6 (cần Twenty, `auth-proxy` `:4002`, `token.txt`, hợp đồng đã sinh):
```bash
npm run test:consumer
npm run experiments               # tất cả; hoặc: npm run experiments -- M-2 M-4
```
Server Twenty thật **không bị sửa**: `mutate-proxy` chỉ biến đổi JSON trên đường về Verifier. Chuỗi: Verifier → `:4001` → `auth-proxy :4002` → Twenty `:3000`.

### Bằng chứng (thông báo lỗi nguyên văn của Pact Verifier)
| Mã | Thông báo | Ý nghĩa |
|---|---|---|
| M-2 | `$.data.people.edges[0].node -> Actual map is missing the following keys: jobTitle` (lặp cho edges[0..4]); `$.data.createPerson -> Actual map is missing the following keys: jobTitle` | Field bị đổi tên làm vỡ cả truy vấn đọc (I-01) lẫn mutation (I-03), vì cả hai dùng `jobTitle` |
| M-3 | `$.data.opportunities.edges[0].node -> Actual map is missing the following keys: amount` (lặp cho 6 node) | Chỉ I-04 dùng `amount` nên chỉ I-04 fail |
| M-4 | `$.data.people.totalCount -> Expected '5' (String) to be an integer`; tương tự `companies` ('5') và `opportunities` ('6') | Đổi kiểu dữ liệu bị bắt dù giá trị vẫn "đúng" khi đọc bằng mắt |

Bảng tổng hợp: `logs/experiments/summary.md` (và `summary.json`). Log đầy đủ từng lượt: `logs/experiments/M-0.log`, `M-2.log`, `M-3.log`, `M-4.log`, `M-6.log` (gồm log của `mutate-proxy` cho thấy số chỗ đã sửa).

| | I-01 | I-02 | I-03 | I-04 | I-05 | I-06 | I-07 |
|---|---|---|---|---|---|---|---|
| M-0 | OK | OK | OK | OK | OK | OK | OK |
| M-2 | **FAILED** | OK | **FAILED** | OK | OK | OK | OK |
| M-3 | OK | OK | OK | **FAILED** | OK | OK | OK |
| M-4 | **FAILED** | **FAILED** | OK | **FAILED** | OK | OK | OK |
| M-6 | OK | OK | OK | OK | OK | OK | OK |

**Nhận xét:** mỗi thay đổi phá vỡ chỉ làm fail đúng các interaction có dùng field đó (không báo động giả), thay đổi chỉ thêm field (M-6) không làm fail interaction nào. Điều này khớp tiêu chí D.6 trong [contract-testing.md](contract-testing.md): mỗi loại thay đổi (đổi tên, xóa, đổi kiểu) làm ít nhất 1 interaction fail, và báo động giả bằng 0.

Lưu ý trung thực: các thay đổi được mô phỏng ở lớp proxy, không phải do lập trình viên Twenty thật sự sửa mã server. Mỗi lượt chạy một lần (thời gian ~2,7 đến 3,3 s), chưa lặp nhiều lần để đo độ ổn định.

## Kết quả đo (16/11/2026, Windows 11, Node v26.13.0, Pact 16.5.0, Twenty v2.46.0)
| Lượt chạy | Interaction | Pass | Fail | Thời gian vitest |
|---|---|---|---|---|
| Consumer, 7 interaction | 7 | 7 | 0 | 1,26 s |
| Provider qua `:4002`, 7 interaction (trước khi sửa Origin, 16/11) | 7 | 6 | 1 (I-07, do proxy) | 1,82 s |
| Provider qua `:4002`, 7 interaction (sau khi sửa Origin, 21/11) | 7 | **7** | 0 | 1,58 s |
| Consumer, 7 interaction (21/11) | 7 | 7 | 0 | 1,11 s |
| Provider qua proxy điều kiện `:4003`, 6 interaction (trước I-03) | 6 | 6 | 0 | 1,3 s (đo tường) |
| M-1, provider qua `:4003` | 6 | 5 | 1 (I-01) | 1,6 s (đo tường) |

Thời gian verify từng interaction (lượt provider cuối): I-01 131 ms, I-02 41 ms, I-03 92 ms, I-04 52 ms, I-05 128 ms, I-06 40 ms, I-07 59 ms.

Nguồn: `logs/metrics.md` (bảng đầy đủ), `logs/consumer-run-*.log`, `logs/provider-run-*.log`.
Ảnh bằng chứng: `logs/people.png`, `logs/f3-companies.png`, `logs/opportunities.png`, `logs/f4-current-user.png`.

Lượt `:4003` chỉ là chẩn đoán trên bộ 6 interaction trước I-03. Lượt verify 7/7 thật là lượt ngày 21/11 qua `:4002`. Từ cùng ngày, fixture I-03 được dọn tự động bởi state handler nên không cần dọn tay (KI-3).

## Phân tích nguyên nhân (RCA) đã có
- **I-07 fail qua `:4002` (đã sửa):** hợp đồng đúng (thiếu Origin thì 403), nhưng `auth-proxy.mjs` và `requestFilter` trong `provider.verify.test.js` đặt Origin cho mọi request, nên server nhận 200. Chi tiết và cách sửa: [known-issues.md](known-issues.md).
- **M-1:** I-01 fail vì field `jobTitleName` không tồn tại trong response thật; status 200 và header vẫn khớp. Chỉ kiểm status code sẽ bỏ sót lỗi này.
