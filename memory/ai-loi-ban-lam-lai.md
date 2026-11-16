---
name: ai-loi-ban-lam-lai
description: "Clip AI lỗi (ai-loi/): bản Muse làm lại nằm ở thư mục clip-NN mới; trước khi đăng phải xem muse.log của mọi clip chưa đăng"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 73a2b2bc-29bf-4746-b74b-de9de06aa3fc
  modified: 2026-11-12T05:30:19.654Z
---

Trong `ai-loi/`, khi Diễm My yêu cầu sửa 1 clip (bỏ chữ trên áo, bỏ thoại...), bản Muse làm lại được lưu thành thư mục `clip-NN` mới, không ghi đè bản cũ. Khi Diễm My bảo đăng 1 clip theo chủ đề, đọc `muse.log` và `sheet.jpg` của mọi clip chưa có `dang-bai.md`, chọn bản làm lại mới nhất, không tìm theo từ khoá.

**Why:** Ngày 2026-11-12 Diễm My bảo "đăng clip lỗi giao hàng". Claude grep từ khoá chỉ thấy `clip-08` và `clip-10`, bỏ sót `clip-11` (bản làm lại của `clip-10`: áo trơn, không thoại; log ghi "bản sạch chữ" nên không khớp từ khoá). Đăng nhầm `clip-10` lên Facebook và TikTok Derpy AI, phải gỡ rồi đăng lại.

**How to apply:** Khi gửi clip cho Diễm My chọn, gửi ảnh `sheet.jpg` (nhẹ, đến ngay) thay vì file mp4: tin kèm 2 mp4 mất hơn 2 phút mới tới và tới sai thứ tự. Liên quan [[diem-my-video-ai-loi]], [[diem-my-kenh-va-cong-cu]], [[diem-my-xac-nhan-truoc-khi-dang]].
