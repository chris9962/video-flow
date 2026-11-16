---
name: doi-nen-anh-nguoi-that
description: "Đổi bối cảnh ảnh người thật (Diễm My gửi ảnh cậu bé, 2026-11-13): 2 cách đã làm, Muse --ref vẽ lại và rembg cắt người ghép nền Muse"
metadata:
  type: project
---

Ngày 2026-11-13 Diễm My (Telegram 9060990194) gửi ảnh một cậu bé khoảng 4 tuổi đứng trước cửa (áo denim, short xám, giày trắng) và yêu cầu "Thay đổi bối cảnh là đường phố, cậu bé trong ảnh giữ nguyên 100%". File ở `em-be/cau-be-duong-pho/`: `goc.jpg` ảnh gốc, `muse-01.png` bản Muse, `ghep-01.jpg` bản ghép.

Hai cách đã làm, cả hai gửi Diễm My chọn:
1. **Muse `--expect image --ref goc.jpg`** (profile my), prompt "giữ nguyên 100% cậu bé... chỉ thay bối cảnh": Muse vẽ lại cả bé, mặt và đồ rất giống nhưng không phải pixel thật. Mất khoảng 90 giây, nền đẹp, bóng đổ tự nhiên.
2. **rembg + ghép**: `pip install rembg` (đã cài, model `isnet-general-use` ở `~/.rembg/models/`), cắt người bằng `rembg.remove(..., alpha_matting=True)`; Muse tạo nền vỉa hè trống cùng góc nhìn ("không có người"); PIL ghép, thêm bóng nghiêng mờ + bóng tiếp xúc dưới chân, làm ấm nhẹ. Bé giữ 100% nhưng ánh sáng hơi lệch nền.

**How to apply:** yêu cầu "giữ nguyên 100%" người thật thì làm cả 2 bản và cho người yêu cầu chọn. Không dùng ChatGPT khi `chain.mjs images` đang chạy trong cùng profile. Diễm My chọn **bản 1 (Muse)** lúc 2026-11-13 17:00 và gửi tiếp ảnh thứ 2 của cùng cậu bé, dặn "giữ nguyên cảnh đường phố đó": Muse với 2 `--ref` (ảnh mới + `muse-01.png` làm bối cảnh) ra `muse2-01.png` cùng con phố, bé dựa cột quán cà phê. Ảnh sau của cậu bé này: làm bằng Muse, đính kèm ảnh phố cũ để giữ bối cảnh. Liên quan [[diem-my-em-be-va-cho-con]].
