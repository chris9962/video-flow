---
name: script-dung-thi-chup-man-hinh
description: "Script web (Facebook, TikTok, Flow...) dừng vì giao diện khác mong đợi thì chụp màn hình xem ngay, không chạy lại mù"
metadata:
  type: feedback
---

Khi script Playwright dừng vì giao diện web khác mong đợi (sai trang, không thấy nút, trạng thái lạ), việc đầu tiên là chụp màn hình và đọc text của trang, rồi sửa một lần. Không chạy lại script y nguyên, không viết script sửa tạm khi chưa nhìn trang.

**Why:** Ngày 2026-11-13, đăng clip lên Facebook Derpy AI: `dang-bai.mjs` báo sai tên trang. Tôi chạy lại 1 lần, viết script bấm "Chuyển" nhưng 2 lần không kết nối CDP, bấm được rồi vẫn hỏng vì Facebook thêm hộp thoại xác nhận mới. Mất 6 lượt chạy và để lại 3 tab Chrome, chủ máy hỏi "tại sao mở tới 3 tab" và "tại sao tốn nhiều thời gian cho việc xác định kênh".

**How to apply:** Thứ tự: đọc lỗi → chụp màn hình + innerText → sửa đúng chỗ → chạy lại 1 lần. Script tạm nối CDP phải dùng lại `connect()` có bước mở tab nền của `dang-bai.mjs`. Script lỗi thì đóng tab của nó, xem [[dong-tab-sau-khi-xong]].
