# Context: Đồ án môn Kiểm thử Phần mềm

## Thông tin chung
- **Môn học:** Kiểm thử Phần mềm
- **Trường:** Đại học Đà Lạt – Khoa Công nghệ Thông tin
- **Giảng viên:** Nguyễn Thế Lâm (lam.th.ngn@gmail.com)
- **Đề tài đã được giảng viên chốt duyệt:** R10 + K04

## Đề tài đã chọn

### Repo: R10 – Twenty (CRM mã nguồn mở)
- **Link:** https://github.com/twentyhq/twenty
- **Mô tả:** Phần mềm CRM (Customer Relationship Management) mã nguồn mở, thay thế Salesforce
- **Stack:** TypeScript, NestJS (backend), React (frontend), PostgreSQL
- **Kiến trúc:** Monorepo — nhiều package tách biệt (frontend, backend, shared types...)
- **Độ khó:** ⋆⋆⋆ (Khó)
- **Lý do chọn:** Stack tương đồng với đồ án cá nhân đang làm (monorepo NestJS + React), giúp học 1 lần dùng nhiều nơi. Twenty có ranh giới API rõ ràng giữa frontend/backend, phù hợp Contract Testing.

### Kỹ thuật: K04 – Contract Testing
- **Ý tưởng cốt lõi:** Sinh "hợp đồng" (contract) mô tả cách consumer (frontend) gọi API của provider (backend), sau đó replay lại tại provider để phát hiện breaking change sớm, không cần chạy toàn hệ thống end-to-end.
- **Công cụ:** Pact (https://docs.pact.io/)
- **Đối tượng phù hợp:** Hệ thống có ranh giới API rõ ràng giữa consumer – provider (frontend-backend, microservice)
- **Đầu ra yêu cầu:** Xác định rõ consumer/provider; ≥ 5 interactions được kiểm tra; có demo
- **Điều kiện không nên áp dụng:** Repo monolith không tách biệt client/provider (không áp dụng cho trường hợp này vì Twenty đã tách rõ)

## Cấu trúc nội dung thực hiện (2 phần bắt buộc)

### Phần 1: Phân tích hệ thống & Setup (System Analysis & Setup)
- Đọc hiểu cấu trúc mã nguồn, module/dependency chính của Twenty
- Vẽ kiến trúc hệ thống + luồng dữ liệu (data flow) của 3–5 nghiệp vụ trọng tâm (VD: tạo khách hàng, tạo deal, cập nhật trạng thái)
- Cài đặt hệ thống chạy thành công (Local hoặc Docker)
- Lập tài liệu hướng dẫn cài đặt (môi trường, runtime, biến môi trường, lệnh build/run, seed data)

### Phần 2: Ứng dụng Contract Testing (Advanced Testing Implementation)
- Nghiên cứu cơ sở lý thuyết, giới hạn và tiêu chí áp dụng Contract Testing
- Thiết kế Test Scenarios tập trung vào luồng nghiệp vụ cốt lõi hoặc rủi ro cao
- Viết consumer test (React gọi API) → sinh contract bằng Pact
- Viết provider verification (NestJS backend verify lại contract)
- Chạy test, thu thập log/metrics, phát hiện lỗi hoặc chứng minh coverage; phân tích nguyên nhân gốc rễ (Root Cause Analysis)

## Cấu trúc báo cáo bắt buộc (8 phần A→H)

| Phần | Nội dung |
|---|---|
| A | Mục tiêu hệ thống, actor/use case chính, cây thư mục/module, dependency, luồng dữ liệu |
| B | Sơ đồ kiến trúc mức component/container + giải thích 3–5 module liên quan trực tiếp tới kiểm thử |
| C | Tài liệu môi trường, phiên bản, lệnh build/run, DB/service, seed data; bằng chứng hệ thống chạy thành công + ≥ 3 luồng nghiệp vụ chạy được |
| D | Nguyên lý, lý do chọn phạm vi, giả định, rủi ro, tiêu chí pass/fail của Contract Testing |
| E | Test Model/Scenario/Case theo kỹ thuật; chỉ rõ input, precondition, expected result, dữ liệu test |
| F | Mã nguồn test/harness/script chạy lại tự động được; kèm README chứa lệnh chạy và dependency |
| G | Log/report/metrics, danh sách lỗi (defect) hoặc hành vi bất thường, phân tích nguyên nhân; nếu không có lỗi phải chứng minh coverage/score/threshold |
| H | Lưu commit/tag của repo, cấu hình test, mô tả cách người khác chạy lại test trên máy mới |

## Mốc thời gian (Milestones)

| Ngày | Sự kiện | Deliverables |
|---|---|---|
| 18/9 | Hạn chót đăng ký đề tài | Chốt thành viên, Repo, Kỹ thuật; chốt Commit SHA/Tag; setup Trello/Jira |
| 20/10 | Báo cáo giữa kỳ (Milestone 2) | Demo hệ thống chạy thành công; sơ đồ kiến trúc, tài liệu on-boarding; kế hoạch áp dụng Contract Testing (phạm vi, giả định, tiêu chí) |
| ~Tháng 12 (theo lịch thi) | Bảo vệ cuối kỳ | Thuyết trình toàn bộ dự án; demo automation script; nộp mã nguồn kiểm thử + báo cáo tổng kết (nộp trước 1 tuần); peer-review |

## Quy định nhóm & quy trình làm việc
- Quy mô: 3–5 sinh viên/nhóm, làm việc theo Agile/Scrum
- Mỗi nhóm đóng vai "Đội QA" tiếp nhận và kiểm thử 1 dự án mã nguồn mở
- Khuyến khích dùng Git, Trello/Jira/GitHub Projects để theo dõi tiến độ
- README cần ghi rõ hướng dẫn chạy code cho thành viên khác dễ nắm bắt
- Nên giới hạn phạm vi (scope) — VD: chỉ tập trung vào module khách hàng/deal của Twenty, không cần ôm toàn bộ hệ thống

## Tiêu chí đánh giá
1. **Báo cáo chuyên môn & mã nguồn:** mục tiêu hệ thống, luồng dữ liệu, hướng dẫn cài đặt rõ ràng (khuyến khích Docker), hiểu và vận dụng đúng Contract Testing, test scenarios cụ thể, mã nguồn gọn gàng chạy tự động
2. **Quản trị dự án & thuyết trình:** lịch sử commit đều đặn, slide gọn gàng, trình bày tự tin, trả lời đúng trọng tâm câu hỏi
3. **Đóng góp cá nhân (Peer Evaluation):** đánh giá chéo mức độ tham gia thực tế của từng thành viên

## Tài liệu tham khảo kỹ thuật
- Contract Testing – Pact: https://docs.pact.io/
- Repo Twenty: https://github.com/twentyhq/twenty

---
*File này tổng hợp từ tài liệu hướng dẫn thực hiện đề tài môn Kiểm thử Phần mềm (GV: Nguyễn Thế Lâm) và các trao đổi xác nhận đề tài R10+K04.*
