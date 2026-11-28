# Kết quả thí nghiệm phá hợp đồng phía provider

Sinh tự động bởi `npm run experiments` lúc 2026-11-28T04:16:52.297Z. Pact 16.5.0, Node v22.18.0.
Server Twenty thật không bị sửa: `tests/mutate-proxy.mjs` chỉ biến đổi JSON response trên đường về Verifier.

| Mã | Thay đổi | I-01 | I-02 | I-03 | I-04 | I-05 | I-06 | I-07 | Khớp kỳ vọng | Thời gian |
|---|---|---|---|---|---|---|---|---|---|---|
| M-0 | Đối chứng: proxy chuyển tiếp nguyên vẹn | OK | OK | OK | OK | OK | OK | OK | có | 7.76 s |
| M-2 | Đổi tên field jobTitle → jobTitleName | FAILED | OK | FAILED | OK | OK | OK | OK | có | 7.26 s |
| M-3 | Xóa field amount (Opportunity) | OK | OK | OK | FAILED | OK | OK | OK | có | 6.92 s |
| M-4 | Đổi kiểu totalCount từ số sang chuỗi | FAILED | FAILED | OK | FAILED | OK | OK | OK | có | 6.82 s |
| M-6 | Thêm field mới jobTitleExtra (tương thích ngược) | OK | OK | OK | OK | OK | OK | OK | có | 7.61 s |

Log chi tiết từng lượt: `logs/experiments/<mã>.log`.
