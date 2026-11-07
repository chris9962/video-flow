---
name: clip-mo-dau-camera-tien-vao
description: "Mỗi video động vật mở đầu bằng clip M: toàn cảnh → camera tiến nhanh vào chủ thể. Flow tạo 4 giây, video cuối chỉ giữ 1–1,5 giây, không được dài hơn (2026-11-07)"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 80995ab5-c9f1-4b80-bc0d-39dca9529cde
  modified: 2026-11-06T07:46:25.013Z
---

Ngày 2026-11-05, người dùng rất thích video gián nhà. Video mở đầu bằng toàn cảnh căn bếp ban đêm. Camera tiến qua cửa tủ dưới bồn rửa, tới cận cảnh gián cái. Người dùng yêu cầu ghi nhớ cách làm này.

Người dùng yêu cầu thêm cùng ngày:
- Đoạn mở đầu dài khoảng 4 giây, camera tiến nhanh hơn bản 6 giây.
- Flow phải tạo clip nguồn ngắn nhất, 4 giây, để AI tạo camera tiến nhanh ngay trong clip. Tăng tốc khi ghép chỉ là cách bổ sung.
- Video gián dùng clip 6 giây tăng tốc 1,5 lần. Người dùng chấp nhận cách này cho riêng video gián.

Ngày 2026-11-06, video kiến lửa: người dùng yêu cầu đoạn mở đầu ngắn hơn nữa. Flow tạo clip M 4 giây, rồi Claude tua còn 1,5 giây khi ghép. Clip M 4 giây có 1 giây đứng yên ở đầu, nên Claude bỏ giây đó bằng `trimStart`.

Ngày 2026-11-07, video cá thòi lòi: người dùng chốt quy tắc. Trong video cuối, đoạn zoom mở đầu M chỉ dài 1–1,5 giây. Claude không được làm đoạn M dài hơn 1,5 giây.

**Why:** Người dùng thấy cảnh mở đầu có camera tiến vào làm video sinh động hơn. Người dùng lấy ý tưởng từ video đuông dừa: cảnh đầu quay rộng cả ngọn dừa, rồi camera tiến vào cảnh 1.

**How to apply:** Khi làm video động vật mới, Claude đưa clip M vào bảng phân cảnh. K00 là toàn cảnh, K01 là cận cảnh, và clip M đặt `"duration": 4` trong `plan.json`. Claude đặt `trimStart` và `speed` của clip M để đoạn M trong video cuối dài 1–1,5 giây. Sau khi ghép, Claude đọc `seams.json`: điểm nối đầu tiên phải ≤ 1,5 giây. Cách làm chi tiết nằm ở mục 2.4 của skill `flow-chain-video`. Liên quan: [[thoi-luong-video-xu-huong]], [[video-tiep-theo]].
