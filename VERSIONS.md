# Phiên bản đã chốt (13/10/2026)

- Twenty server/worker: twentycrm/twenty:v2.46.0@sha256:bb4e94f0215cbd14c7356b0324d9b7ac10ccd077042cd6d5058ad02ef2080605 (image build 09/10/2026)
- PostgreSQL: postgres:16@sha256:ca0bd484cb98bf4b24eb1010e73fb3fcbd6714d240fbc1a10eea5b7dbecb641d
- Redis: redis@sha256:2c2dff791878316e3b083188be0d578423b24813cdda5de0e80ea4f7b3e6bfd6
- Source đối chiếu (chỉ để đọc code): tag `sdk/v2.46.0` của twentyhq/twenty, commit 9070979232c4f37165108a2eb5a4042e0cfdc3d6 (ngày 09/10/2026, trùng ngày build image; upstream đặt tag phát hành dạng `sdk/vX.Y.Z`, không có tag `v2.46.0`). Image không công bố commit nên chưa chứng minh được khớp tuyệt đối từng byte. Commit `a61e47d` dùng trước đó nằm sau tag này 79 commit nên không dùng nữa.
- Pact: @pact-foundation/pact 16.x, Node ≥ 22