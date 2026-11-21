# Bảng phân công công việc và checklist hoàn thành

Nhóm 12, đề tài R10 (Twenty CRM) × K04 (Contract Testing, Pact). Cập nhật lần cuối: 21/11/2026.
Đây là bản nháp của "bản phân chia công việc và đóng góp cá nhân" nộp lên LMS; phần peer review ở cuối do cả nhóm điền.
Quy ước: `[x]` đã xong và có bằng chứng kiểm chứng được; `[ ]` chưa xong. Mỗi người tick và thêm mã commit khi xong việc của mình. Danh sách chi tiết và tiêu chí xong: [`TASKS.md`](../../TASKS.md).

## 1. Thành viên
| Họ tên | MSSV | Vai trò chính (theo báo cáo giữa kỳ) | Tài khoản Git |
|---|---|---|---|
| Phan Lê Xuân Mạnh | 2312686 | Dựng môi trường Docker, provider verification, tổng hợp báo cáo | `xuanmanhneee` |
| Liêng Hót Ha Luyến | 2312682 | Phân tích kiến trúc, sơ đồ, luồng dữ liệu, tài liệu on-boarding | (điền) |
| Mai Quý Phước | 2312716 | Thiết kế scenario, consumer test, thu thập log/metrics | `Phuocmai` |

## 2. Tóm tắt tiến độ
| Người | Việc đã xong | Việc còn lại | Commit hiện có |
|---|---|---|---|
| Mạnh | 14 | 11 | 12 |
| Luyến | 0 | 11 | 0 |
| Phước | 9 | 7 | 6 |
| Cả nhóm | 0 | 3 | 0 |

(Số cập nhật tay khi tick; kiểm tra lại bằng `git shortlog -sn --all`.)

## 3. Mạnh (2312686)
### Đã xong
| # | Công việc | TT | Bằng chứng |
|---|---|---|---|
| M1 | Dựng Twenty bằng Docker, pin phiên bản theo digest (`VERSIONS.md`) | [x] | `f52e2cc` (19/10), `docker/`, `VERSIONS.md` |
| M2 | Baseline Pact: consumer I-01, I-06 và provider verify đầu tiên | [x] | `f52e2cc` |
| M3 | Auth-proxy (cổng 4002) thay cookie, in log request/response | [x] | `f52e2cc`, `tests/auth-proxy.mjs`; mở rộng ở `835e008` (Origin), `757e3d3` (Host) |
| M4 | Sửa KI-1: chỉ đặt Origin khi request gốc có Origin, I-07 nhận đúng 403 | [x] | `835e008` |
| M5 | Provider state handler cho cả 7 interaction (KI-2) | [x] | `9b65561` |
| M6 | Teardown tự động fixture I-03: xóa mềm rồi xóa vĩnh viễn (KI-3) | [x] | `9b65561`, `84465a9` |
| M7 | Thí nghiệm phá hợp đồng phía provider M-0, M-2, M-3, M-4, M-6 qua `mutate-proxy` | [x] | `c696b6a`, `logs/experiments/` |
| M8 | Ghi kết quả và bằng chứng thí nghiệm vào tài liệu | [x] | `8dc2daf`, `docs/testing.md` |
| M9 | Chuẩn hóa tài liệu `docs/` (kiến trúc, cài đặt, interaction, test, known-issues) | [x] | `5088fd4` |
| M10 | Sửa KI-4: nguyên nhân gốc là Host, Verifier gọi thẳng `:3000` 7/7 | [x] | `757e3d3`, `docs/known-issues.md` |
| M11 | Dọn `probe.mjs`, đổi tên provider state I-06 (`phiên không hợp lệ`) | [x] | `510f3cc` |
| M12 | Chốt quy ước workspace `dlu-qa` và dữ liệu mẫu tối thiểu | [x] | `106416b`, `docs/setup.md` mục 2 |
| M13 | Chạy lại toàn bộ, ghi số liệu 21/11: consumer 7/7, provider 7/7, thí nghiệm 5/5 | [x] | `1f1de22`, `logs/*-21-11.log` |
| M14 | Lập danh sách task chung, context viết báo cáo, giao việc cho Luyến và Phước | [x] | `39cbb91`, `a980c98`, `d25d60b`, `80117dd` |

### Còn lại
| # | Công việc | TT | Mục TASKS | Bằng chứng khi xong |
|---|---|---|---|---|
| M15 | Phần C: tài liệu môi trường, lệnh build/run, seed data | [ ] | 4.1 | (commit) |
| M16 | Phần F: README đủ lệnh và dependency; một lệnh chạy toàn bộ và in tóm tắt | [ ] | 6.1 | |
| M17 | Pin phiên bản: tag bản nộp, ghi vào `VERSIONS.md`, thử tìm tag source khớp `v2.46.0` | [ ] | 6.3 | tag |
| M18 | Làm sạch repo: không `sess_`, `token.txt`, `docker/.env` trong lịch sử; xử lý `logs/auth-proxy-run.log`, `docs/archive/` | [ ] | 6.4 | |
| M19 | Rà tiêu chí A của thầy trước khi nộp | [ ] | 6.0 | |
| M20 | Link Trello/Jira/GitHub Projects, đưa task lên | [ ] | 7.2 | link |
| M21 | Báo cáo tổng kết 8 phần A đến H (gộp từ phần của cả nhóm) | [ ] | 8.1 | |
| M22 | Slide thuyết trình | [ ] | 8.2 | |
| M23 | Kịch bản demo và phương án dự phòng | [ ] | 8.3 | |
| M24 | Câu hỏi dự kiến và trả lời | [ ] | 8.4 | |
| M25 | Tổng hợp peer review và phần trình bày lịch sử Git | [ ] | 7.4, 7.5 | |

## 4. Luyến (2312682) — chi tiết ở [`TASK_LUYEN.md`](../../TASK_LUYEN.md)
| # | Công việc | TT | Mục TASKS | Sản phẩm | Bằng chứng (commit) |
|---|---|---|---|---|---|
| L1 | Clone repo, dựng Twenty bằng Docker, xem được trang People | [ ] | 4.3 | | |
| L2 | Chạy lại trên máy sạch theo README, ghi lỗi gặp và thời gian | [ ] | 4.3 | `docs/report/clean-run.md`, `logs/clean-run/` | |
| L3 | A.1 Mục tiêu hệ thống | [ ] | 2.1 | `docs/report/A-he-thong.md` | |
| L4 | A.2 Actor và use case chính | [ ] | 2.1 | `A-he-thong.md` | |
| L5 | A.3 `tree -L 2` và bảng dependency | [ ] | 2.2 | `A-he-thong.md` | |
| L6 | A.4 Luồng dữ liệu (xem People, tạo Person, người dùng hiện tại) | [ ] | 2.3 | `A-he-thong.md` | |
| L7 | B.1 Sơ đồ kiến trúc dạng ảnh có vị trí Pact; sửa sơ đồ lỗi thời trong `docs/architecture.md` | [ ] | 3.1, 1.5 | `docs/report/img/`, `B-kien-truc.md` | |
| L8 | B.2 Giải thích 3 đến 5 module liên quan kiểm thử | [ ] | 3.2 | `B-kien-truc.md` | |
| L9 | Phần D: nguyên lý, vì sao phù hợp, phạm vi, giả định, rủi ro, tiêu chí pass/fail | [ ] | 5.1 | `docs/report/D-ly-thuyet.md` | |
| L10 | File đóng góp cá nhân (kèm mã commit) | [ ] | 7.4 | `docs/report/dong-gop-luyen.md` | |
| L11 | Cập nhật tick và ghi chú tiến độ trong `TASK_LUYEN.md` | [ ] | | | |

## 5. Phước (2312716) — chi tiết ở [`TASK_PHUOC.md`](../../TASK_PHUOC.md)
### Đã xong
| # | Công việc | TT | Bằng chứng |
|---|---|---|---|
| P1 | Dựng Twenty trên máy, tạo workspace, lấy phiên, baseline pass | [x] | `TASK_PHUOC.md` mục 0 |
| P2 | Bắt request thật của twenty-front bằng Chromium, đối chiếu từng byte với `tests/queries.js` | [x] | `logs/probe-i03-*.json`, `59935b1` |
| P3 | Consumer I-02 (Companies), I-04 (Opportunities), I-05 (GetCurrentUser qua `/metadata`) | [x] | `59935b1` |
| P4 | Consumer I-07: khóa đúng body 403 `CSRF_ORIGIN_MISMATCH` | [x] | `59935b1`, `50ede89`, `logs/probe-i07-body.json` |
| P5 | Consumer I-03: mutation `CreateOnePerson` từ request thật | [x] | `f50dff1`, `d91dbf9`, `logs/probe-i03-mutation.json` |
| P6 | Gom helper `postJson`, thống nhất tên "phiên" thay "token" | [x] | `3c4d785` |
| P7 | Hợp đồng 7 interaction được sinh lại, consumer 7/7 | [x] | `1b43d3b`, `pacts/` |
| P8 | Thí nghiệm `BREAK=1` (jobTitle đổi tên) trên bộ 6 interaction | [x] | `logs/consumer-run-break.log`, `logs/provider-run-break*.log` |
| P9 | Thu log, thời gian, ảnh F3 (Companies), F4 (người dùng hiện tại) | [x] | `logs/metrics.md`, `logs/f3-companies.png`, `logs/f4-current-user.png` |

### Còn lại (chi tiết P-1 đến P-7 trong `TASK_PHUOC.md`)
| # | Công việc | TT | Mục TASKS | Sản phẩm | Bằng chứng (commit) |
|---|---|---|---|---|---|
| P10 | `BREAK=1` trên bộ 7 interaction (kỳ vọng fail I-01 và I-03) | [ ] | 1.3 | `logs/break-7-interaction-*.log` | |
| P11 | Phần E: bảng scenario, kỹ thuật thiết kế test, thử âm | [ ] | 5.2, 5.3 | `docs/report/E-scenario.md` | |
| P12 | Phần G: bảng log/metrics, giải thích ý nghĩa log, RCA, phân biệt lỗi harness và lỗi Twenty | [ ] | 6.2 | `docs/report/G-log-metrics.md` | |
| P13 | Rà bằng chứng ≥ 3 luồng nghiệp vụ, ảnh không lộ cookie | [ ] | 4.2 | `logs/` | |
| P14 | Chạy lại 7/7 trên máy của Phước sau `git pull` | [ ] | | báo Mạnh | |
| P15 | File đóng góp cá nhân (kèm mã commit) | [ ] | 7.4 | `docs/report/dong-gop-phuoc.md` | |
| P16 | Sửa MSSV 2312716 trong phần của mình, tick lại các mục đã giải quyết trong `TASK_PHUOC.md` | [ ] | | | |

## 6. Việc chung của cả nhóm
| # | Công việc | TT | Mục TASKS |
|---|---|---|---|
| C1 | Xác nhận phân công chính thức và tỷ lệ đóng góp (sau khi hoàn thành việc) | [ ] | 7.1 |
| C2 | Peer review: mỗi người đánh giá hai bạn còn lại (mục 7 bên dưới) | [ ] | 7.4 |
| C3 | Hỏi thầy: ngày nộp chính xác, biểu mẫu peer review, "mục A phần 6" trong file hướng dẫn | [ ] | 8.5 |

## 7. Peer review (cả nhóm điền sau khi xong việc)
Mỗi người điền hai dòng cho hai bạn còn lại. Nhận xét dựa trên việc cụ thể và commit, không viết chung chung. Tỷ lệ cuối cùng do cả nhóm thống nhất, tổng bằng 100%.

| Người đánh giá | Người được đánh giá | Việc đã làm (kèm bằng chứng) | Nhận xét (tốt, còn thiếu) | Tỷ lệ đóng góp đề xuất |
|---|---|---|---|---|
| Mạnh | Luyến | | | |
| Mạnh | Phước | | | |
| Luyến | Mạnh | | | |
| Luyến | Phước | | | |
| Phước | Mạnh | | | |
| Phước | Luyến | | | |

**Tỷ lệ chốt:** Mạnh ___ % · Luyến ___ % · Phước ___ % (tổng 100%).
**Xác nhận:** cả ba thành viên đồng ý (ngày ___).
