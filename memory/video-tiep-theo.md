---
name: video-tiep-theo
description: "Danh sách loài người dùng chọn làm video tiếp theo, theo thứ tự, ghi ngày 2026-10-26"
metadata:
  node_type: memory
  type: project
  originSessionId: b06fc468-5e62-4526-87d0-4727ef4adee3
  modified: 2026-11-01T01:10:45.942Z
---

Ngày 2026-10-26, người dùng chọn các loài sau cho video tiếp theo, theo thứ tự. Video dế mèn đăng ngày 2026-10-27. Video cá lau kiếng và video dế cơm đăng ngày 2026-10-29. Video phù du đăng ngày 2026-10-30. Video cua đồng và video tôm càng xanh đăng ngày 2026-10-31. Video ốc bươu vàng và video nhện nước đăng ngày 2026-11-01. Video châu chấu lúa và video ngài vải đăng ngày 2026-11-02. Video ruồi trâu và video đuông dừa đăng ngày 2026-11-03. Các loài đã đăng không còn trong danh sách.

Đã làm video, chưa đăng:
1. Cá lóc: `ca-loc/ca-loc.mp4`, làm ngày 2026-10-29.
- Sâu tre: `sau-tre/sau-tre.mp4`, làm ngày 2026-10-24. Loài này không nằm trong danh sách ngày 2026-10-26.

Chưa làm video: hết loài trong danh sách. Khi người dùng hỏi loài tiếp theo, Claude hỏi người dùng chọn loài mới.

**Why:** Người dùng muốn có sẵn danh sách để không phải chọn lại mỗi lần.

**How to apply:** Khi người dùng hỏi "làm con gì tiếp theo" hoặc "làm tiếp đi", Claude đề xuất loài đầu tiên trong nhóm "Chưa làm video". Khi người dùng bảo đăng video, Claude nhắc các video trong nhóm "Đã làm video, chưa đăng". Sau khi một video đã đăng, Claude xoá loài đó khỏi danh sách. Cách làm video nằm ở [[kenh-dang-video]] và skill `flow-chain-video`.
