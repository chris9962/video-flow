---
name: clip-mo-dau-camera-tien-vao
description: Video động vật mở đầu bằng clip M 4 giây — toàn cảnh nơi sống, camera tiến nhanh vào chủ thể; Flow tạo clip nguồn 4 giây; người dùng rất thích ở video gián 2026-11-05
metadata:
  type: feedback
---

Ngày 2026-11-05, người dùng rất thích video gián nhà. Video mở đầu bằng toàn cảnh căn bếp ban đêm. Camera tiến qua cửa tủ dưới bồn rửa, tới cận cảnh gián cái. Người dùng yêu cầu ghi nhớ cách làm này.

Người dùng yêu cầu thêm cùng ngày:
- Đoạn mở đầu dài khoảng 4 giây, camera tiến nhanh hơn bản 6 giây.
- Flow phải tạo clip nguồn ngắn nhất, 4 giây, để AI tạo camera tiến nhanh ngay trong clip. Tăng tốc khi ghép chỉ là cách bổ sung.
- Video gián dùng clip 6 giây tăng tốc 1,5 lần. Người dùng chấp nhận cách này cho riêng video gián.

**Why:** Người dùng thấy cảnh mở đầu có camera tiến vào làm video sinh động hơn. Người dùng lấy ý tưởng từ video đuông dừa: cảnh đầu quay rộng cả ngọn dừa, rồi camera tiến vào cảnh 1.

**How to apply:** Khi làm video động vật mới, Claude đưa clip M vào bảng phân cảnh. K00 là toàn cảnh, K01 là cận cảnh, và clip M đặt `"duration": 4` trong `plan.json`. Cách làm chi tiết nằm ở mục 2.4 của skill `flow-chain-video`. Liên quan: [[thoi-luong-video-xu-huong]], [[video-tiep-theo]].
