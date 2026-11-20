# Chạy test và kết quả

## Lệnh
Cần Twenty đang chạy và `token.txt` (xem [setup.md](setup.md)). Dùng hai terminal.

Terminal 1 (giữ chạy):
```bash
npm run auth-proxy            # cổng 4002 → Twenty :3000
```
Terminal 2:
```bash
npm run test:consumer         # xóa pacts/, sinh lại hợp đồng
npm run test:provider         # verify hợp đồng vào Twenty thật qua auth-proxy
```

| Script | Việc làm |
|---|---|
| `test:consumer` | `rimraf pacts` rồi chạy `tests/consumer.test.js` |
| `test:provider` | Chạy `tests/provider.verify.test.js` (mặc định qua `:4002`) |
| `auth-proxy` | Proxy thay cookie giả bằng phiên thật, đặt Origin, in log |
| `break:rename-field` | Sinh hợp đồng với `BREAK=1` rồi verify |
| `proxy` / `test:provider:proxy` | Proxy cũ đổi `city` → `cityName` (`:4001`). Lỗi thời: chỉ chuyển tiếp `authorization`, không hỗ trợ cookie của v2.46.0 |

## Thí nghiệm phá hợp đồng (negative control)
Mục đích: chứng minh hợp đồng bắt được breaking change mà không gây báo động giả.

| Mã | Thay đổi mô phỏng | Phía | Kết quả mong đợi | Trạng thái |
|---|---|---|---|---|
| M-1 | Đổi `jobTitle` → `jobTitleName` trong hợp đồng | Consumer | I-01 fail, interaction khác pass | **Đã chạy**, đúng kỳ vọng |
| M-2 | Provider đổi tên field (qua proxy, cần viết lại `rename-proxy` theo cookie) | Provider | Verifier báo thiếu field | Chưa chạy |
| M-3 | Provider xóa field | Provider | Verifier báo thiếu field | Chưa làm |
| M-4 | Provider đổi kiểu dữ liệu | Provider | Verifier báo sai kiểu | Chưa làm |
| M-5 | Thiếu Origin | Consumer | Khớp I-07 (403) | Có trong hợp đồng |

Chạy M-1:
```bash
BREAK=1 npm run test:consumer         # PowerShell: $env:BREAK=1; npm run test:consumer
npm run test:provider                 # kỳ vọng I-01 FAILED
npm run test:consumer && npm run test:provider   # khôi phục (nhớ bỏ BREAK)
```
Thông báo lỗi mẫu: `$.data.people.edges[0].node -> Actual map is missing the following keys: jobTitleName`.

> M-1 mô phỏng ở phía consumer, server thật không bị sửa. Muốn chứng minh phía provider, cần M-2 đến M-4 qua proxy (không sửa mã server).

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
