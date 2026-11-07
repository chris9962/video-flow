---
name: chon-khung-dau-khong-apple-vision
description: Khung đầu clip nhảy phải thấy từ đầu gối trở lên, mặt nhìn thẳng; khung đầu không đạt thì Claude tự xem lưới khung và tự chọn, cắt clip từ khung đó; không dùng Apple Vision, script phải chạy được trên Windows
metadata:
  type: feedback
---

Ngày 2026-11-05, người dùng hỏi cách xử lý khung đầu của clip nhảy không có mặt đầy đủ. Tôi đề xuất Apple Vision. Người dùng bác cách này: "claude tự xem tự chọn frame đi, cần gì apple vision tốn công vậy? khi tôi sử dụng trên window thì lấy đâu ra apple vision".

**Why:** Người dùng có thể chạy skill trên Windows. Apple Vision chỉ có trên macOS. Claude tự xem ảnh được, nên không cần công cụ nhận diện mặt riêng.

**How to apply:**
- Claude chạy `scripts/khung-dau.mjs` của skill `aidancing-tiktok`, xem `luoi.jpg`, rồi chọn ô sớm nhất có mặt gần nhìn thẳng, thấy rõ 2 mắt và 2 má. Mặt quay 3/4 không đạt, vì 1 má bị khuất. Người dùng đặt tiêu chí này ngày 2026-11-05.
- Khung phải thấy người từ đầu gối trở lên, vì clip quảng cáo quần áo. Khung cận mặt hoặc nửa người không đạt. Người dùng yêu cầu ngày 2026-11-05.
- Nếu ô đó không ở giây 0, Claude cắt clip bằng `--tu`. Lý do: aidancing chạy clip từ giây 0.
- Mọi script mới cho các skill của người dùng phải chạy được trên Windows: chỉ dùng Node và ffmpeg, không dùng Swift, AppleScript, `open`, hay đường dẫn kiểu macOS.
- Chi tiết nằm ở mục "Chọn khung đầu" của SKILL.md. Liên quan: [[video-flow-ghep-mau-aidancing]].
