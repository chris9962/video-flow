---
name: chrome-khong-lay-focus
description: Script điều khiển Chrome CDP không được kéo cửa sổ Chrome lên trước; mở tab nền bằng Target.createTarget background:true
metadata:
  node_type: memory
  type: feedback
  originSessionId: b06fc468-5e62-4526-87d0-4727ef4adee3
  modified: 2026-10-30T01:32:00.957Z
---

Người dùng không muốn Chrome CDP lấy focus khi script chạy. Ngày 2026-10-30, người dùng báo máy liên tục chuyển focus sang Chrome.

Ngày 2026-10-30, Claude sửa `dang-bai.mjs`, `flow.mjs`, `gpt-image.mjs` trong skill `flow-chain-video`. Script mở tab bằng `newBackgroundPage()`, không gọi `ctx.newPage()`, `page.bringToFront()` hay `/json/new`. Bản cũ nằm ở scratchpad của phiên b06fc468, thư mục `backup-scripts-2026-10-30`.

Kết quả đo ngày 2026-10-30: `/json/new`, `ctx.newPage()`, `page.bringToFront()` đều lấy focus. `Target.createTarget` với `background: true` không lấy focus. Tab nền vẫn chạy timer và requestAnimationFrame đủ tốc độ. `gpt-image.mjs --save-last` chạy đạt, focus giữ ở Cursor.

**Why:** Focus chuyển sang Chrome làm gián đoạn việc người dùng đang gõ trong ứng dụng khác.

**How to apply:** Khi viết hoặc sửa script dùng Chrome CDP, Claude không gọi lệnh nào kéo Chrome lên trước. Claude chỉ đưa Chrome lên trước khi người dùng yêu cầu, ví dụ "mở profile chrome". Nếu tab nền làm một trang web chạy sai, Claude báo người dùng trước khi thêm lại `bringToFront()`. Liên quan: [[kenh-dang-video]].
