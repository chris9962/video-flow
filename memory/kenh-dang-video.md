---
name: kenh-dang-video
description: "Kênh YouTube và fanpage Facebook \"Life Cycle Lab\" nơi người dùng đăng video vòng đời động vật; đăng bằng script dang-bai.mjs của skill flow-chain-video"
metadata:
  node_type: memory
  type: reference
  originSessionId: dce8c08c-67f1-4f54-9a2e-d3e0e92af1cc
  modified: 2026-10-29T08:19:49.297Z
---

Người dùng đăng video vòng đời lên YouTube Shorts và fanpage Facebook, cùng tên "Life Cycle Lab". Fanpage: https://www.facebook.com/profile.php?id=61595556214345.

Cách đăng nằm ở skill `flow-chain-video`, bước 10 trong `SKILL.md`, lệnh `node ~/.claude/skills/flow-chain-video/scripts/dang-bai.mjs <thư mục video>`. Mỗi thư mục video có mục "## Đã đăng" trong `dang-bai.md`, ghi link đã đăng. Claude đọc mục này trước khi đăng để không đăng trùng.

Ngày 2026-10-21: cả 4 video bướm, ếch, bọ rùa, ong mật đã có trên YouTube và Facebook. Video bướm phượng đăng ngày 2026-10-21. Video chuồn chuồn đăng ngày 2026-10-22. Video tằm dâu đăng ngày 2026-10-22. Video ve sầu 17 năm đăng ngày 2026-10-23. Video bọ cánh cứng tê giác Nhật Bản đăng ngày 2026-10-24. Video muỗi nhà đăng ngày 2026-10-24. Video nhện vườn chữ thập đăng ngày 2026-10-25. Video bọ ngựa đăng ngày 2026-10-26. Video dế mèn đăng ngày 2026-10-27. Video cá lau kiếng đăng ngày 2026-10-29. Video dế cơm đăng ngày 2026-10-29. Video phù du đăng ngày 2026-10-30. Video cua đồng và video tôm càng xanh đăng ngày 2026-10-31. Video ốc bươu vàng và video nhện nước đăng ngày 2026-11-01. Video châu chấu lúa và video ngài vải đăng ngày 2026-11-02. Video ruồi trâu và video đuông dừa đăng ngày 2026-11-03. Video cá phổi châu Phi đăng ngày 2026-11-04. Video gián nhà đăng ngày 2026-11-05.

Video trên 50 MiB làm `dang-bai.mjs` báo lỗi `Cannot transfer files larger than 50Mb`. Claude nén bản đăng bằng CRF 20, rồi chạy với `--video`. Video cá phổi 2026-11-04 dài 57 giây, CRF 23 còn 46 MB. Chi tiết nằm ở bảng lỗi bước 10 của skill.

Liên quan: [[kiem-tra-chu-dong-khi-chay-script]]
