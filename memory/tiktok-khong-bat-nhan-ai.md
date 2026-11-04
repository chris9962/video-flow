---
name: tiktok-khong-bat-nhan-ai
description: "Khi đăng TikTok @linh_dan_20x, Claude không được bật nhãn AI-generated content và không được đổi cài đặt tài khoản"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 6b5a03f4-0b5f-4adf-9623-ad9e393f112b
  modified: 2026-11-03T07:15:36.796Z
---

Khi đăng video lên TikTok @linh_dan_20x, Claude không được bật công tắc "AI-generated content". Claude cũng không được đổi cài đặt tài khoản. Hộp thoại "Turn on automatic content checks?" phải đóng bằng Cancel.

**Why:** ngày 2026-11-03, Claude định bật nhãn AI khi đăng video aidancing đầu tiên. Người dùng nói: "đừng có bật nó".

**How to apply:** script `dang-tiktok.mjs` của skill `aidancing-tiktok` chỉ kiểm tra công tắc đang tắt và không bấm công tắc. Hộp thoại của TikTok ghi rằng TikTok có thể gỡ video AI trông như thật mà không gắn nhãn. Người dùng đã biết điều này. Liên quan: [[video-flow-ghep-mau-aidancing]].
