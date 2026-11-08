---
name: kich-ban-du-quy-trinh-cuon-hut
description: "Tiêu chí kịch bản video động vật (2026-11-08): đủ quy trình sống và có hành động cuốn hút (chui ra khỏi hang, ăn mồi, lớn dần qua nhiều bước, nhảy, di chuyển); chi tiết hình nhỏ như cỡ vây là lỗi nhỏ"
metadata:
  node_type: memory
  type: feedback
  originSessionId: bb5dc709-7408-40b0-8196-ab2da87f58e3
  modified: 2026-11-08T02:20:38.447Z
---

Khi đánh giá kịch bản, người dùng xét 2 điều: video đã đi đủ quy trình sống của con vật chưa, và video có cuốn hút không. Người dùng nói ngày 2026-11-08, khi xem kịch bản cá thòi lòi.

Ví dụ của người dùng cho cá thòi lòi: trứng trong hang → lớn dần → bơi hoặc nhảy lên miệng hang → ăn mồi → lớn dần, lớn dần → nhảy, di chuyển một đoạn nhỏ.

Chi tiết hình nhỏ là lỗi nhỏ. Ví dụ: vây lưng ở ảnh K07 lớn hơn vây thật. Người dùng không muốn tốn tín dụng để sửa loại lỗi này.

**Why:** Kịch bản cá thòi lòi ngày 2026-11-07 có 3 clip đầu ít chuyển động: trứng đổi màu, nước dâng, trứng nở. Video không có cảnh cá ăn mồi, chui ra khỏi hang hay di chuyển. Claude và Codex đã đánh giá kịch bản theo độ đúng của hình, còn người dùng đánh giá theo quy trình và hành động.

**How to apply:** Ở bước 2 của skill `flow-chain-video`, Claude liệt kê hành động của từng giai đoạn trước khi chọn clip: nở, rời tổ hoặc hang, ăn mồi, lớn lên, di chuyển, sinh sản. Kịch bản nên có ít nhất 1 clip ăn mồi và 1 clip di chuyển. Clip chỉ đổi màu hoặc đổi cỡ thì nên xen giữa các clip có hành động. Liên quan: [[research-chi-lay-chi-tiet-hinh-anh]], [[khong-can-hoan-hao]], [[thoi-luong-video-xu-huong]].
