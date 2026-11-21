# BÁO CÁO GIỮA KỲ (MILESTONE 2)

**Contract Testing với Pact cho Twenty CRM (R10 × K04)**

Môn Kiểm thử Phần mềm · Đại học Đà Lạt – Khoa Công nghệ Thông tin · GV: Nguyễn Thế Lâm

**Nhóm 12:** Phan Lê Xuân Mạnh (2312686) · Liêng Hót Ha Luyến (2312682) · Mai Quý Phước (2312714)

> Các mục đánh dấu **\[CẦN ĐIỀN\]** là chỗ nhóm phải bổ sung số liệu, ảnh chụp hoặc link thật trước khi xuất PDF.

## 0. Tóm tắt và đề xuất xin duyệt

Nhóm kiểm thử **Twenty** (CRM mã nguồn mở, monorepo TypeScript) bằng **Contract Testing với Pact**. Consumer là `twenty-front` (React), provider là `twenty-server` (NestJS), hai bên giao tiếp qua GraphQL tại `/graphql` và `/metadata`.

Nhóm đề xuất kế hoạch được duyệt vì ba lý do:

1. **Hệ thống đã chạy thật**: Twenty v2.46.0 chạy bằng Docker (khóa digest), có workspace và dữ liệu mẫu.
2. **Kỹ thuật đã chứng minh được giá trị**: bộ contract hiện có đã phát hiện được việc đổi tên field `jobTitle` thành `jobTitleName` (I-01 FAILED), trong khi interaction không liên quan (I-06) vẫn pass, tức không có báo động giả.
3. **Khoảng cách tới yêu cầu K04 nhỏ và có lộ trình**: hiện có 2 interaction, kế hoạch mở rộng lên 7 (yêu cầu tối thiểu 5) kèm thí nghiệm phá hợp đồng ở phía provider.

Các rủi ro còn tồn đọng (mục 6) được nêu rõ cùng phương án xử lý.

## 1. Phân công và đóng góp thành viên

| Thành viên | MSSV | Nhiệm vụ chính | Đóng góp đến 18/10 | Bằng chứng (commit/issue) |
| --- | --- | --- | --- | --- |
| Phan Lê Xuân Mạnh | 2312686 | **\[CẦN ĐIỀN\]** (đề xuất: dựng môi trường Docker, auth-proxy, provider verification) | **\[CẦN ĐIỀN\]** | **\[CẦN ĐIỀN\]** |
| Liêng Hót Ha Luyến | 2312682 | **\[CẦN ĐIỀN\]** (đề xuất: phân tích kiến trúc, vẽ sơ đồ, data flow, tài liệu on-boarding) | **\[CẦN ĐIỀN\]** | **\[CẦN ĐIỀN\]** |
| Mai Quý Phước | 2312714 | **\[CẦN ĐIỀN\]** (đề xuất: thiết kế scenario, viết consumer test, thu thập log/metrics) | **\[CẦN ĐIỀN\]** | **\[CẦN ĐIỀN\]** |
|  |  |  |  |  |

Quản lý công việc: **\[CẦN ĐIỀN: link Trello/Jira/GitHub Projects\]**. Repo nhóm: **\[CẦN ĐIỀN: link GitHub\]**. Cột "Đóng góp" nên viết bằng việc cụ thể và kiểm chứng được (ví dụ "viết I-01, I-06; sửa lỗi cookie phiên"), không viết chung chung.

---

# PHẦN I – PHÂN TÍCH HỆ THỐNG VÀ THIẾT LẬP (Phần A, B, C)

## A. Mô tả hệ thống

### A.1 Mục tiêu hệ thống

Twenty là phần mềm CRM mã nguồn mở, được xem là phương án thay thế Salesforce. Hệ thống quản lý khách hàng (People), công ty (Companies), cơ hội kinh doanh (Opportunities/deals), ghi chú, tác vụ, và cho phép tùy biến đối tượng dữ liệu theo từng workspace.

### A.2 Actor và use case chính

| Actor | Use case |
| --- | --- |
| Người dùng workspace (sales/CRM user) | Đăng nhập, xem và lọc danh sách People/Companies, tạo và cập nhật bản ghi, theo dõi deal |
| Quản trị workspace | Quản lý thành viên, cấu hình đối tượng và field tùy biến |
| Hệ thống ngoài | Gọi API, webhook (ngoài phạm vi kiểm thử của nhóm) |

### A.3 Cấu trúc monorepo và module

Source đọc code: nhánh `qa-contract-testing`, commit `a61e47d`. Các package chính liên quan tới đề tài (nhóm cần đối chiếu lại tên thư mục thực tế trong commit đã pin):

| Package | Vai trò | Liên quan tới kiểm thử |
| --- | --- | --- |
| `twenty-front` | Ứng dụng React, gửi truy vấn GraphQL | **Consumer** |
| `twenty-server` | NestJS, cung cấp `/graphql` (dữ liệu) và `/metadata` (schema/metadata), xác thực, kết nối PostgreSQL và Redis | **Provider** |
| `twenty-shared` (và các thư viện dùng chung) | Kiểu dữ liệu, tiện ích dùng chung | Hiểu quy ước tên field |
| PostgreSQL 16, Redis | Lưu dữ liệu và cache/hàng đợi | Hạ tầng cho provider state |

**\[CẦN ĐIỀN\]** cây thư mục rút gọn (ảnh `tree -L 2`) và danh sách dependency chính (từ `package.json`).

### A.4 Luồng dữ liệu của các nghiệp vụ trọng tâm

Nhóm chọn 4 nghiệp vụ, ưu tiên những luồng có tương tác front–server rõ ràng:

| # | Nghiệp vụ | Luồng dữ liệu (rút gọn) | Trạng thái |
| --- | --- | --- | --- |
| F1 | Xem danh sách People | Trình duyệt → `twenty-front` → truy vấn `FindManyPeople` (kèm cookie phiên, Origin, `x-appversion`) → `POST /graphql` → server kiểm tra phiên và CSRF → PostgreSQL → danh sách `people` (id, name, emails, jobTitle) | Đã có contract (I-01) |
| F2 | Phiên không hợp lệ | Cùng truy vấn F1 với cookie sai → server trả HTTP 200 kèm `errors[]` | Đã có contract (I-06) |
| F3 | Xem danh sách Companies | `FindManyCompanies` → `/graphql` → PostgreSQL | Kế hoạch (I-02) |
| F4 | Lấy thông tin người dùng hiện tại | `GetCurrentUser` → `/graphql` | Kế hoạch (I-05) |
| F5 | Tạo Person hoặc xem Opportunities (deal) | Mutation/Query tương ứng | Đề xuất bổ sung (I-03, I-04), **\[CẦN ĐIỀN\]** sau khi dò truy vấn thật bằng DevTools |

## B. Kiến trúc hệ thống

**\[CẦN ĐIỀN: chèn hình sơ đồ component/container vẽ bằng draw.io hoặc Mermaid\]**. Nội dung sơ đồ đề xuất:

```
[Trình duyệt]
     │ HTTP (cookie twenty-session, Origin, x-appversion)
     ▼
[twenty-front: React]  ── GraphQL query ──►  [twenty-server: NestJS]
   (CONSUMER)                                   │   /graphql   (dữ liệu)
                                                │   /metadata  (schema)
                                                ▼
                                  [PostgreSQL 16]   [Redis]

Vị trí của Pact:
  consumer test (vitest + @pact-foundation/pact)  →  file contract (JSON)
  Pact Verifier  ──(auth-proxy :4002)──►  twenty-server thật
```

### Giải thích các module liên quan trực tiếp tới kiểm thử

| Module | Giải thích | Lý do liên quan |
| --- | --- | --- |
| GraphQL core API (`/graphql`) | Điểm vào cho truy vấn dữ liệu People/Companies | Nơi hợp đồng được kiểm chứng |
| Metadata API (`/metadata`) | Cung cấp schema, field của workspace | Schema sinh động theo workspace nên dễ phát sinh breaking change |
| Xác thực và phiên | Cookie `twenty-session`, kiểm tra Origin (CSRF) | Quyết định HTTP 200 hay 403, cần mô tả đúng trong contract |
| Lớp truy vấn của front | Các truy vấn như `FindManyPeople` | Định nghĩa field mà consumer thực sự dùng |
| Dữ liệu mẫu workspace `dlu-qa` | People, Companies cố định | Làm provider state ổn định |

## C. Môi trường và bằng chứng chạy thành công

### C.1 Môi trường thực tế của nhóm

| Thành phần | Chi tiết |
| --- | --- |
| Máy | Windows + WSL2 Ubuntu, Docker Desktop |
| Twenty | Image chính thức `twentycrm/twenty:v2.46.0`, khóa digest `sha256:bb4e94f0…` (**\[CẦN ĐIỀN: digest đầy đủ\]**); Node 24.19.0 trong container |
| Hạ tầng | PostgreSQL 16, Redis; workspace `dlu-qa` có dữ liệu mẫu People, Companies |
| Công cụ test | Node 22+ (qua nvm), vitest 3.x, `@pact-foundation/pact` 16.x |
| Source đọc code | Nhánh `qa-contract-testing`, commit `a61e47d` |

**Lưu ý trung thực về phiên bản:** source đọc code chưa khớp tuyệt đối với image v2.46.0. Nhóm xử lý bằng cách coi **image đã khóa digest là hệ thống được kiểm thử (SUT)**; source chỉ dùng để đọc hiểu. Contract được verify trực tiếp với server đang chạy trong image nên kết quả không phụ thuộc source. Nhóm sẽ cố gắng tìm tag/commit khớp với v2.46.0 để loại bỏ sai lệch này.

### C.2 Hướng dẫn dựng hệ thống (on-boarding)

**\[CẦN ĐIỀN: chép đúng các lệnh nhóm đã chạy\]**. Khung nội dung:

1. Yêu cầu: Windows 10/11 + WSL2 Ubuntu, Docker Desktop (bật tích hợp WSL), Node 22+ qua nvm.
2. Lấy cấu hình: tạo thư mục, tải `docker-compose` và `.env` theo hướng dẫn chính thức; ghim image `twentycrm/twenty:v2.46.0@sha256:…`.
3. Biến môi trường chính: cổng server, chuỗi kết nối PostgreSQL, Redis, secret ứng dụng **\[CẦN ĐIỀN: liệt kê tên biến, không đưa giá trị bí mật\]**.
4. Khởi chạy: `docker compose up -d`, kiểm tra container healthy, truy cập giao diện web.
5. Seed dữ liệu: tạo workspace `dlu-qa`, nhập People và Companies mẫu **\[CẦN ĐIỀN: số lượng bản ghi, cách nạp\]**.
6. Cài công cụ test: `nvm use 22`, `npm install`, lệnh chạy consumer và verifier **\[CẦN ĐIỀN\]**.

### C.3 Bằng chứng hệ thống chạy được

| Luồng | Bằng chứng | Trạng thái |
| --- | --- | --- |
| F1 – Xem People | Contract I-01 pass, log chạy 12:31 | Có |
| F2 – Phiên sai | Contract I-06 pass, trả `errors[]` | Có |
| F3 – Xem Companies | **\[CẦN ĐIỀN: ảnh chụp giao diện hoặc log\]** | Cần bổ sung |
| F4 – Người dùng hiện tại | **\[CẦN ĐIỀN\]** | Cần bổ sung |

Yêu cầu của giảng viên là ít nhất 3 luồng chạy được, nên nhóm cần có tối thiểu ảnh chụp cho F1, F3 và một luồng thứ ba trước ngày demo. **\[CẦN ĐIỀN: ảnh chụp Docker Desktop, trang Twenty, kết quả test\]**

---

# PHẦN II – KẾ HOẠCH ÁP DỤNG CONTRACT TESTING (Phần D, E và kế hoạch F, G, H)

## D. Cơ sở lý thuyết, phạm vi, giả định, rủi ro, tiêu chí

### D.1 Nguyên lý Contract Testing

Consumer-driven contract testing hoạt động theo hai pha:

1. **Pha consumer:** consumer test chạy với một mock provider do Pact dựng. Pact ghi lại các request và response mà consumer mong đợi thành file contract (JSON).
2. **Pha provider:** Pact Verifier phát lại từng request trong contract lên provider thật và so sánh response với kỳ vọng.

Lợi ích: phát hiện breaking change sớm, không cần chạy end-to-end toàn hệ thống. Contract chỉ chứa phần consumer **thực sự dùng**, nên provider vẫn được tự do thay đổi những phần không ai dùng.

### D.2 Vì sao phù hợp với Twenty

Twenty có ranh giới rõ giữa `twenty-front` và `twenty-server` qua GraphQL, đúng đối tượng mà K04 nhắm tới (frontend–backend). Rủi ro thật: server đổi tên hoặc bỏ field thì front hỏng mà không có test nào báo trước.

### D.3 Phạm vi

- **Trong phạm vi:** `POST /graphql` cho nhóm đối tượng People và Companies, truy vấn hiện tại của người dùng, và hành vi xác thực/CSRF của các truy vấn đó.
- **Ngoài phạm vi:** `/metadata` ở mức đầy đủ, worker/hàng đợi, email, tích hợp bên thứ ba, hiệu năng, giao diện.
- Lý do giới hạn: theo khuyến nghị của giảng viên, chỉ phân rã 3–5 module liên quan trực tiếp tới kiểm thử.

### D.4 Giả định

1. Image `v2.46.0` đã khóa digest là phiên bản cố định trong suốt học kỳ.
2. Dữ liệu workspace `dlu-qa` được giữ ổn định, dùng làm provider state.
3. Truy vấn của consumer được lấy từ truy vấn thật mà `twenty-front` gửi (dò bằng DevTools), không tự bịa.
4. Phiên đăng nhập hợp lệ có thể tái tạo cho verifier thông qua auth-proxy.

### D.5 Rủi ro và cách xử lý

| Rủi ro | Mức độ | Xử lý |
| --- | --- | --- |
| Verifier gọi thẳng Twenty vẫn bị 403, chưa rõ nguyên nhân | Cao | Hiện dùng auth-proxy (cổng 4002); sẽ phân tích header (cookie, Origin, `x-appversion`) để tìm nguyên nhân gốc và ghi vào báo cáo |
| Source không khớp tuyệt đối với image | Trung bình | Coi image là SUT; tìm tag khớp; ghi rõ giới hạn |
| Schema GraphQL sinh động theo workspace | Trung bình | Chỉ dùng workspace cố định `dlu-qa`; ghi nhận đây là giới hạn của contract |
| Phá hợp đồng mới mô phỏng ở phía consumer | Trung bình | Làm thí nghiệm provider đổi tên field qua proxy (mục E.3) |
| GraphQL lỗi vẫn trả HTTP 200 nên dễ bỏ sót | Thấp | Đưa `errors[]` vào contract (đã làm ở I-06) |
| Thời gian còn lại đến bảo vệ cuối kỳ | Trung bình | Chia sprint, ưu tiên đạt 5 interaction trước, mở rộng sau |

### D.6 Tiêu chí pass/fail

| Tiêu chí | Ngưỡng đạt |
| --- | --- |
| Số interaction trong contract | ≥ 5 (mục tiêu 7) |
| Verification trên server nguyên bản | 100% interaction pass |
| Phát hiện breaking change | Mỗi loại thay đổi thử nghiệm (đổi tên, xóa field, đổi kiểu dữ liệu, thiếu Origin/phiên) phải làm **ít nhất 1 interaction liên quan fail** |
| Báo động giả | 0: interaction không liên quan không được fail |
| Tái chạy | Người khác chạy lại trên máy mới theo README ra cùng kết quả |

## E. Thiết kế Test Scenario và Test Case

### E.1 Danh sách interaction

| ID | Interaction | Precondition | Input | Expected | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| I-01 | FindManyPeople, phiên hợp lệ | Workspace `dlu-qa` có People; cookie `twenty-session` hợp lệ | Biến `limit` = 60, `orderBy` theo position; header Origin, `x-appversion` v2.46.0 | HTTP 200; `data.people.edges[].node` có id, name, emails, jobTitle | **Đã chạy, pass** |
| I-02 | FindManyCompanies | Workspace có Companies | Truy vấn lấy danh sách công ty | HTTP 200; danh sách công ty với các field consumer dùng | Kế hoạch |
| I-03 | Tạo Person (mutation) | Phiên hợp lệ | Dữ liệu người mới | HTTP 200; trả bản ghi vừa tạo | Đề xuất, **\[CẦN ĐIỀN\]** sau khi dò truy vấn thật |
| I-04 | Xem Opportunities (deal) | Có dữ liệu deal | Truy vấn danh sách | HTTP 200; danh sách deal | Đề xuất, **\[CẦN ĐIỀN\]** |
| I-05 | GetCurrentUser | Phiên hợp lệ | Truy vấn người dùng hiện tại | HTTP 200; thông tin user | Kế hoạch |
| I-06 | FindManyPeople, phiên sai | Cookie không hợp lệ | Cùng truy vấn I-01 | HTTP 200 kèm `errors[].message`; thực tế quan sát được 3 lỗi validate (Unknown type, Cannot query field), không có `extensions` | **Đã chạy, pass** |
| I-07 | Thiếu Origin | Cookie hợp lệ, không gửi Origin | Truy vấn I-01 | HTTP 403 `CSRF_ORIGIN_MISMATCH` | Đã dò bằng probe, chưa đưa vào contract |

Với 7 interaction, nhóm có dư 2 so với yêu cầu tối thiểu 5, phòng khi một interaction gặp khó (ví dụ mutation I-03 cần xử lý dữ liệu sinh ra).

### E.2 Dữ liệu test và provider state

- Dữ liệu cố định trong `dlu-qa` (People, Companies mẫu).
- Với mutation, dùng dữ liệu có tiền tố riêng và dọn sau khi chạy để test lặp lại được. **\[CẦN ĐIỀN\]**
- Matcher: dùng `like`/`eachLike` cho cấu trúc, tránh khóa cứng giá trị dễ đổi; chỉ khóa cứng những gì thuộc về hợp đồng (tên field, kiểu, status).

### E.3 Kịch bản phá hợp đồng (negative control)

| Mã | Thay đổi mô phỏng | Phía thực hiện | Kết quả mong đợi |
| --- | --- | --- | --- |
| M-1 | Đổi tên `jobTitle` thành `jobTitleName` | Consumer (đã làm) | I-01 FAILED, I-06 pass |
| M-2 | Provider đổi tên field qua proxy | Provider (kế hoạch) | Verifier báo thiếu field |
| M-3 | Provider xóa field | Provider (kế hoạch) | Verifier báo thiếu field |
| M-4 | Provider đổi kiểu dữ liệu | Provider (kế hoạch) | Verifier báo sai kiểu |
| M-5 | Gửi thiếu Origin | Consumer | Khớp I-07 (403) |

Thí nghiệm M-2 đến M-4 sửa response ở lớp proxy để **không phải sửa mã nguồn server thật**.

## F. Mã nguồn test và cách chạy lại (kế hoạch)

- Cấu trúc đề xuất: `consumer/` (vitest + Pact), `provider/` (verifier), `pacts/` (file contract), `proxy/` (auth-proxy), `README.md`.
- README ghi rõ phiên bản Node, lệnh cài đặt, lệnh chạy consumer, lệnh chạy verifier, biến môi trường cần thiết.
- Mục tiêu: một lệnh chạy lại toàn bộ chuỗi consumer → contract → verify.
- Mã nguồn hiện có: **\[CẦN ĐIỀN: link repo nhóm\]** (repo GitHub nhóm chưa tạo tại thời điểm báo cáo tiến độ 13/10).

## G. Log, metrics và phân tích (kế hoạch thu thập)

### G.1 Kết quả sơ bộ đã có

| Lượt chạy | Consumer | I-01 | I-06 |
| --- | --- | --- | --- |
| Bình thường (12:31) | 2/2 pass | OK | OK |
| Đổi `jobTitle` thành `jobTitleName` (12:22) | 2/2 pass | **FAILED** | OK |

Thông báo lỗi: `$.data.people.edges[0].node -> Actual map is missing the following keys: jobTitleName`, lặp lại ở 5 node (`edges[0]` đến `edges[4]`). Status 200 và header vẫn khớp, chỉ có field bị đổi tên làm vỡ hợp đồng, và I-06 không bị ảnh hưởng.

**Diễn giải (Root Cause Analysis ban đầu):** lỗi do kỳ vọng field `jobTitleName` không tồn tại trong response thật, đúng cơ chế phát hiện breaking change. Điều này cho thấy chỉ kiểm tra status code là không đủ vì GraphQL trả 200 cả khi dữ liệu thay đổi.

Lưu ý trung thực: phá hợp đồng ở trên được mô phỏng bằng cách đổi kỳ vọng của consumer, server thật không bị sửa.

### G.2 Metrics sẽ thu thập

Số interaction pass/fail, thời gian chạy consumer và verifier, số breaking change phát hiện theo từng loại (M-1 đến M-5), số báo động giả, số lần chạy lại thành công trên máy mới.

## H. Pin phiên bản và tái lập

- Image: `twentycrm/twenty:v2.46.0`, digest `sha256:bb4e94f0…` **\[CẦN ĐIỀN: digest đầy đủ\]**.
- Source: nhánh `qa-contract-testing`, commit `a61e47d`; repo test sẽ gắn tag **\[CẦN ĐIỀN\]** khi nộp.
- Công cụ: Node 22+, vitest 3.x, `@pact-foundation/pact` 16.x, khóa bằng lockfile.
- Kiểm tra tái lập: một thành viên chưa tham gia dựng môi trường chạy lại theo README trên máy sạch và ghi kết quả.

---

## 2. Hạn chế hiện tại

1. Mới có 2 interaction trong contract, yêu cầu K04 là từ 5 trở lên.
2. Verifier đang chạy qua auth-proxy (cổng 4002); gọi thẳng Twenty vẫn bị 403, chưa rõ nguyên nhân.
3. Phá hợp đồng mới được mô phỏng ở phía consumer, server thật chưa bị sửa.
4. Source đọc code không khớp tuyệt đối với image v2.46.0.

## 3. Kế hoạch đến bảo vệ cuối kỳ

| Giai đoạn | Công việc | Kết quả |
| --- | --- | --- |
| Hết 20/10 (Milestone 2) | Hoàn thiện sơ đồ kiến trúc, tài liệu on-boarding, kế hoạch này; tạo repo GitHub, phân công 3 thành viên | Báo cáo giữa kỳ, demo hệ thống |
| Sprint 1 | Thêm I-07, I-02, I-05 để đạt 5 interaction; điều tra lỗi 403 khi gọi thẳng | ≥ 5 interaction pass |
| Sprint 2 | Thêm I-03, I-04 (nếu khả thi); thí nghiệm M-2 đến M-4 qua proxy | Bằng chứng breaking change phía provider |
| Sprint 3 | Gom log/metrics, viết RCA, hoàn thiện README, kiểm tra tái chạy trên máy sạch | Mã nguồn và báo cáo hoàn chỉnh |
| Trước bảo vệ 1 tuần | Nộp báo cáo tổng kết và mã nguồn; chuẩn bị slide, demo script | Hồ sơ nộp |

## 4. Kết luận

Nhóm đã dựng được hệ thống, xác định rõ consumer/provider, và có bằng chứng ban đầu rằng Pact phát hiện được breaking change trên luồng FindManyPeople mà không gây báo động giả. Các hạn chế được xác định rõ, có kế hoạch xử lý và tiêu chí đánh giá cụ thể. Nhóm đề nghị giảng viên duyệt kế hoạch kiểm thử để tiếp tục triển khai.
