# Đóng góp cá nhân: Luyến (2312682)

Tài khoản Git: `Luyen05`. Nhánh: `2312682_HaLuyen`. Dùng cho bản phân công và peer review (TASKS 7.4) và phần trình bày lịch sử commit (TASKS 7.5).
Chỉ ghi việc đã làm thật, kèm mã commit để kiểm chứng bằng `git show <mã>`. Danh sách commit lấy từ `git log origin/main..HEAD`.

## Cách làm việc, ghi nhận trung thực
Các việc dưới đây được thực hiện **có sự hỗ trợ của công cụ AI (Claude Code)** chạy trên máy của Luyến, theo yêu cầu của Luyến: soạn thảo nội dung các phần báo cáo, sơ đồ, tài liệu và chạy lại kiểm thử.
Luyến chịu trách nhiệm xem lại và nộp. Cột "Mức tham gia trực tiếp" **do Luyến tự điền** theo đúng thực tế (ví dụ: tự làm, đọc và chỉnh sửa, chỉ xem lại), không để mặc định.

Lượt chạy "máy sạch" ngày 24/11/2026 do công cụ AI chạy lệnh trên máy Luyến (xem `docs/report/clean-run.md`). Ảnh chụp ở phụ lục của file đó và việc lấy phiên bằng DevTools do Luyến tự thực hiện.

## 1. Danh sách việc đã làm

| # | Việc | Commit | Ngày | File chính | Mức tham gia trực tiếp (Luyến tự điền) |
|---|---|---|---|---|---|
| 1 | Sửa sơ đồ kiến trúc: Verifier gọi thẳng Twenty `:3000`, proxy chỉ dùng cho thí nghiệm | `bc99d54` | 24/11/2026 | `docs/architecture.md` | `[ĐIỀN]` |
| 2 | Viết phần B: kiến trúc, sơ đồ ảnh có vị trí của Pact, giải thích module | `1efad54` | 24/11/2026 | `docs/report/B-kien-truc.md`, `docs/report/img/kien-truc.svg`, `kien-truc.png` | `[ĐIỀN]` |
| 3 | Viết phần A: mục tiêu, actor, cấu trúc, dependency, luồng dữ liệu | `2b19051` | 24/11/2026 | `docs/report/A-he-thong.md`, `docs/report/img/luong-*.png` | `[ĐIỀN]` |
| 4 | Viết phần D: lý thuyết, phạm vi, giả định, rủi ro, tiêu chí pass/fail | `e4ac3bd` | 24/11/2026 | `docs/report/D-ly-thuyet.md` | `[ĐIỀN]` |
| 5 | Dựng khung báo cáo chạy máy sạch | `be1ce16` | 24/11/2026 | `docs/report/clean-run.md` | `[ĐIỀN]` |
| 6 | Chạy `test:consumer` 7/7 và ghi kết quả | `b63f9a7` | 24/11/2026 | `docs/report/clean-run.md` | `[ĐIỀN]` |
| 7 | Chụp ảnh bằng chứng (lấy phiên có che cookie, consumer, provider) và ghi số liệu | `7f30b8f` | 24/11/2026 | `logs/clean-run/*.png`, `docs/report/clean-run.md` | `[ĐIỀN]` |
| 8 | Bổ sung lỗi thường gặp vào hướng dẫn cài đặt (server không phân giải `db`, phiên cũ) | `fbec7e4` | 24/11/2026 | `docs/setup.md` | `[ĐIỀN]` |
| 9 | Điền môi trường, lỗi và kết luận cho clean-run | `8d25d1f` | 24/11/2026 | `docs/report/clean-run.md`, `docs/TASK_LUYEN.md` | `[ĐIỀN]` |
| 10 | Sửa clean-run cho đúng thực tế (môi trường sẵn có), sửa nguyên nhân phiên cũ | `e5f7007` | 24/11/2026 | `docs/report/clean-run.md`, `docs/setup.md`, `docs/TASK_LUYEN.md` | `[ĐIỀN]` |
| 11 | Chạy lượt máy sạch thật (clone mới, project Docker mới), 7/7, kèm log | `0ad3d84` | 24/11/2026 | `docs/report/clean-run.md`, `logs/clean-run/sach-*.log` | `[ĐIỀN]` |
| 12 | Bổ sung cảnh báo thời gian chờ, cổng 3000, dữ liệu mẫu vào README và setup | `760ad65` | 24/11/2026 | `README.md`, `docs/setup.md` | `[ĐIỀN]` |
| 13 | Đánh dấu đã sửa các chỗ hướng dẫn thiếu | `cb16d2f` | 24/11/2026 | `docs/report/clean-run.md` | `[ĐIỀN]` |

Ngoài commit: kéo `origin/main` về nhánh làm việc (fast-forward đến `752d346`, 24/11/2026); dựng và vận hành Docker Twenty trên máy (kể cả xử lý lỗi server lặp restart, mục 3 của `clean-run.md`).

## 2. Đối chiếu với nhiệm vụ trong `docs/TASK_LUYEN.md`
| Mục | Nội dung | Trạng thái | Bằng chứng |
|---|---|---|---|
| 0 | Clone repo, đọc tài liệu, dựng Twenty bằng Docker | Dựng Docker đã xong; mục đọc tài liệu `[ĐIỀN]` | `docs/TASK_LUYEN.md` |
| 1 | Chạy lại trên máy sạch | Xong (lượt máy sạch thật và một lượt trên môi trường sẵn có) | `docs/report/clean-run.md`, `logs/clean-run/` |
| 2 | Phần A (A.1 đến A.4) | Xong bản nháp; chưa có ảnh `tree -L 2` thật trên bản clone mã nguồn Twenty | `docs/report/A-he-thong.md` |
| 3 | Phần B (B.1, B.2) | Xong bản nháp | `docs/report/B-kien-truc.md` |
| 4 | Phần D (D.1 đến D.6) | Xong bản nháp; dòng "tái chạy" của D.6 đã cập nhật theo lượt máy sạch | `docs/report/D-ly-thuyet.md` |
| 5 | Đóng góp cá nhân | Khung này, chờ Luyến điền cột mức tham gia | file này |

## 3. Việc còn lại và ghi chú
- `[ĐIỀN]` Luyến điền cột "Mức tham gia trực tiếp" và rà từng dòng cho đúng sự thật trước khi nộp.
- Bổ sung việc mới vào bảng ở mục 1 mỗi khi có commit mới (kèm mã commit).

## 4. Cho bản peer review
Phần đánh giá chéo hai thành viên còn lại (Mạnh, Phước) do Luyến tự viết dựa trên quan sát thật; không điền ở đây.
