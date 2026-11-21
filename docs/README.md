# Tài liệu dự án

Contract testing (Pact) cho Twenty CRM: consumer `twenty-front`, provider `twenty-server`.

| Tài liệu | Nội dung | Đọc khi |
|---|---|---|
| [architecture.md](architecture.md) | Hệ thống Twenty, vị trí của Pact, luồng dữ liệu | Mới vào dự án |
| [setup.md](setup.md) | Dựng môi trường, biến môi trường, dữ liệu mẫu, lấy phiên | Dựng máy mới |
| [contract-testing.md](contract-testing.md) | Nguyên lý, phạm vi, giả định, tiêu chí pass/fail | Cần hiểu vì sao test như vậy |
| [interactions.md](interactions.md) | Danh mục I-01 → I-07: precondition, input, expected | Thêm hoặc sửa interaction |
| [testing.md](testing.md) | Cách chạy, thí nghiệm phá hợp đồng, kết quả đo | Chạy test, đọc kết quả |
| [report-context.md](report-context.md) | Yêu cầu nộp, nguồn bằng chứng cho phần A đến H, số liệu, giới hạn, đóng góp | Viết báo cáo và slide |
| [report/phan-cong-cong-viec.md](report/phan-cong-cong-viec.md) | Bảng phân công, checklist đã xong theo từng người, mẫu peer review | Theo dõi tiến độ, nộp phân công |
| [known-issues.md](known-issues.md) | Lỗi đang mở, giới hạn, việc còn lại | Trước khi bắt đầu việc mới |
| [archive/](archive/) | Báo cáo gốc và đề bài của giảng viên (chỉ để tham khảo) | Cần nguồn gốc yêu cầu |

Các tệp liên quan ở thư mục gốc: `README.md` (lệnh chạy nhanh), `VERSIONS.md` (phiên bản đã pin),
`TASK_PHUOC.md` (nhật ký công việc consumer test), `TASKS.md` (danh sách task chung đến khi hoàn thành).

## Quy ước
- Tài liệu mô tả **trạng thái hiện tại** của mã. Số liệu đo được ghi kèm nguồn trong `logs/`.
- Khi đổi hành vi của test hoặc hạ tầng, cập nhật tài liệu tương ứng trong cùng commit.
- Không ghi phiên đăng nhập (`sess_...`), khóa mã hóa hay bí mật vào tài liệu và log.
