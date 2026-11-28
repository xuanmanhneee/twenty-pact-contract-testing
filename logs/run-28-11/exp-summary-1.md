# Kết quả thí nghiệm phá hợp đồng phía provider

Sinh tự động bởi `npm run experiments` lúc 2026-11-28T04:14:29.359Z. Pact 16.5.0, Node v22.18.0.
Server Twenty thật không bị sửa: `tests/mutate-proxy.mjs` chỉ biến đổi JSON response trên đường về Verifier.

| Mã | Thay đổi | I-01 | I-02 | I-03 | I-04 | I-05 | I-06 | I-07 | Khớp kỳ vọng | Thời gian |
|---|---|---|---|---|---|---|---|---|---|---|
| M-0 | Đối chứng: proxy chuyển tiếp nguyên vẹn | OK | OK | OK | OK | OK | OK | OK | có | 11.99 s |
| M-2 | Đổi tên field jobTitle → jobTitleName | FAILED | OK | FAILED | OK | OK | OK | OK | có | 7.55 s |
| M-3 | Xóa field amount (Opportunity) | OK | OK | OK | FAILED | OK | OK | OK | có | 7.78 s |
| M-4 | Đổi kiểu totalCount từ số sang chuỗi | FAILED | FAILED | OK | FAILED | OK | OK | OK | có | 9.44 s |
| M-6 | Thêm field mới jobTitleExtra (tương thích ngược) | OK | OK | OK | OK | OK | OK | OK | có | 7.51 s |

Log chi tiết từng lượt: `logs/experiments/<mã>.log`.
