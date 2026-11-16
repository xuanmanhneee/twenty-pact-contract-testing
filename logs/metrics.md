# Log & metrics — phần Phước (2312716)

Môi trường: Windows 11, Node v26.13.0, @pact-foundation/pact 16.5.0, Twenty v2.46.0 (Docker),
consumer `twenty-front`, provider `twenty-server`, hợp đồng `pacts/twenty-front-twenty-server.json`.
Ngày chạy: 16/11/2026. Không ghi token/phiên vào log.

## 1. Số interaction pass/fail mỗi lượt

| Lượt chạy | Interaction | Pass | Fail | Ghi chú |
|---|---|---|---|---|
| Consumer (bình thường) | 6 | 6 | 0 | I-01, I-02, I-04, I-05, I-06, I-07 |
| Provider qua auth-proxy 4002 (bình thường) | 6 | 5 | 1 | I-07 fail: proxy luôn chèn Origin (xem mục 4) |
| Provider chẩn đoán qua proxy điều kiện 4003 | 6 | 6 | 0 | Mô phỏng đúng patch requestFilter cần cho Mạnh |
| Consumer (`BREAK=1`, đổi `jobTitle` → `jobTitleName`) | 6 | 6 | 0 | Consumer vẫn qua vì mock trả theo hợp đồng |
| Provider qua 4002 trên hợp đồng phá | 6 | 4 | 2 | I-01 fail (thiếu `jobTitleName`), I-07 fail (proxy chèn Origin) |
| Provider chẩn đoán qua proxy điều kiện 4003 trên hợp đồng phá | 6 | 5 | 1 | Chỉ I-01 fail — đúng kỳ vọng thí nghiệm phá hợp đồng |
| Consumer sau review (I-07 khóa giá trị thật, gom helper) | 6 | 6 | 0 | `logs/consumer-run-review-fix.log` |
| Provider qua 4002 sau review | 6 | 5 | 1 | Vẫn I-07 do proxy chèn Origin (blocker chờ Mạnh) |
| Provider chẩn đoán qua 4003 sau review | 6 | 6 | 0 | I-07 khớp chính xác `statusCode/error/messages` |
| Consumer sau khi thêm I-03 | 7 | 7 | 0 | I-01…I-07, gồm mutation; `logs/consumer-run-i03.log` |
| Provider qua 4002 sau khi thêm I-03 | 7 | 6 | 1 | I-03 pass (92 ms); I-07 vẫn fail do proxy chèn Origin |

Ghi chú: các lượt trước dòng "sau khi thêm I-03" chạy trên bộ 6 interaction; từ đó về sau là 7 interaction.

## 2. Thời gian chạy

| Lượt chạy | Thời gian vitest | Thời gian tường (PowerShell) |
|---|---|---|
| Consumer bình thường | 1,49 s | 2,7 s |
| Consumer `BREAK=1` | 1,41 s | 2,8 s |
| Provider qua 4002 (bình thường) | 2,12 s | 3,3 s |
| Provider chẩn đoán qua 4003 (bình thường) | — (script trực tiếp) | 1,3 s |
| Provider chẩn đoán qua 4003 (hợp đồng phá) | — (script trực tiếp) | 1,6 s |
| Provider qua 4002 (lượt cuối, hợp đồng đã khôi phục) | 3,01 s | 4,3 s |
| Consumer sau review (khóa giá trị I-07) | 6,87 s | 9,2 s |
| Provider qua 4002 sau review | 1,52 s | 2,45 s |
| Provider chẩn đoán qua 4003 sau review | — (script trực tiếp) | 1,65 s |
| Consumer sau khi thêm I-03 | 1,26 s | — |
| Provider qua 4002 sau khi thêm I-03 | 1,82 s | — |

Thời gian verify từng interaction (lượt provider cuối):

| Interaction | Thời gian |
|---|---|
| I-01 FindManyPeople | 131 ms |
| I-02 FindManyCompanies | 41 ms |
| I-03 CreateOnePerson | 92 ms |
| I-04 FindManyOpportunities | 52 ms |
| I-05 GetCurrentUser | 128 ms |
| I-06 FindManyPeople (token sai) | 40 ms |
| I-07 FindManyPeople (thiếu Origin) | 59 ms |

## 3. File log / ảnh bằng chứng

- `logs/consumer-run-normal.log` — consumer 6/6 pass.
- `logs/consumer-run-break.log` — consumer `BREAK=1` 6/6 pass.
- `logs/consumer-run-restored.log` — sinh lại hợp đồng đúng sau thí nghiệm.
- `logs/provider-run-normal.log` — verify qua 4002: 5/6.
- `logs/provider-run-final.log` — verify qua 4002 lượt cuối: 5/6 (I-07 fail do proxy).
- `logs/provider-run-allpass-diagnostic.log` — verify qua proxy điều kiện 4003: 6/6 OK.
- `logs/provider-run-break.log` — verify hợp đồng phá qua 4002: I-01, I-07 fail.
- `logs/provider-run-break-diagnostic.log` — verify hợp đồng phá qua 4003: chỉ I-01 fail.
- `logs/consumer-run-review-fix.log` — consumer sau review (khóa giá trị I-07): 6/6 pass.
- `logs/provider-run-review-fix.log` — verify qua 4002 sau review: 5/6 (I-07 chờ Mạnh).
- `logs/provider-run-review-fix-diagnostic.log` — verify qua 4003 sau review: 6/6 OK.
- `logs/consumer-run-i03.log` — consumer sau khi thêm I-03: 7/7 pass.
- `logs/provider-run-i03.log` — verify qua 4002 sau khi thêm I-03: 6/7 (I-03 pass, I-07 chờ Mạnh).
- `logs/probe-i03-mutation.json` — request/response `CreateOnePerson` thật của twenty-front v2.46.0.
- `logs/probe-i03-query.graphql` — query mutation tách từ capture để đối chiếu byte.
- `logs/probe-i03-page.json`, `logs/probe-i03-people.png` — ngữ cảnh trang People và nút Create.
- `logs/probe-i03-cleanup.json`, `logs/provider-run-i03-cleanup.json` — bằng chứng xóa vĩnh viễn fixture I-03.
- `logs/probe-i07-body.json` — body 403 thật của Twenty v2.46.0 (không có `extensions`).
- `logs/f3-companies.png` — bằng chứng F3: trang Companies thật (5 company mẫu).
- `logs/f4-current-user.png` — bằng chứng F4: trang Profile người dùng hiện tại.
- `logs/people.png`, `logs/opportunities.png` — ảnh phụ cho People/Opportunities.

## 4. Nguyên nhân I-07 fail khi verify qua auth-proxy hiện tại

- Hợp đồng I-07 đúng: không gửi Origin ⇒ Twenty trả `403 CSRF_ORIGIN_MISMATCH`.
- `tests/auth-proxy.mjs` (cổng 4002) luôn đặt `origin` cho mọi request, nên I-07 nhận 200.
- `tests/provider.verify.test.js` cũng luôn đặt `req.headers['origin']` trong `requestFilter`.
- Cần Mạnh: chỉ đặt Origin khi hợp đồng có Origin, và cho proxy tương ứng.
  Đã chứng minh bằng lượt chẩn đoán 6/6 OK (không sửa file nào của Mạnh).