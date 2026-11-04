---
name: dong-tab-sau-khi-xong
description: "Sau khi xong việc, Claude phải đóng mọi tab Chrome mà script hoặc Claude đã mở; chụp danh sách tab trước khi chạy, đóng tab mới sau khi xong"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 6b5a03f4-0b5f-4adf-9623-ad9e393f112b
  modified: 2026-10-31T15:16:59.163Z
---

Sau khi xong một việc, Claude phải đóng mọi tab Chrome CDP mà script hoặc Claude đã mở. Claude không được để tab tồn lại.

**Why:** Ngày 2026-10-31, người dùng phải tự đóng nhiều tab. Các tab đó đến từ 3 nguồn: `dang-bai.mjs` không đóng tab YouTube và Facebook sau khi đăng, `flow.mjs` giữ tab khi lỗi tải `ENOENT`, và tab của tiến trình Claude dừng giữa chừng.

**How to apply:**
- Ngày 2026-10-31, Claude sửa `dang-bai.mjs` để đóng tab sau khi đăng, và sửa `flow.mjs` để đóng tab khi lỗi tải `ENOENT`.
- Trước khi chạy script Chrome, Claude lưu danh sách tab: `curl -s http://127.0.0.1:9222/json/list > <scratchpad>/tabs-truoc.json`.
- Sau khi xong việc, kể cả tải lại clip và dry run, Claude đóng các tab có id không nằm trong danh sách cũ, bằng `curl -s http://127.0.0.1:9222/json/close/<id>`.
- Claude không đóng tab đã có trước khi chạy, vì người dùng có thể đang dùng tab đó.
- Đóng tab qua `/json/close` không kéo Chrome lên trước. Liên quan: [[chrome-khong-lay-focus]], [[kiem-tra-chu-dong-khi-chay-script]].
