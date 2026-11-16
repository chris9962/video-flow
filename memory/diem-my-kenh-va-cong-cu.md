---
name: diem-my-kenh-va-cong-cu
description: "Diễm My: từ 2026-11-14 mọi clip (kể cả món ăn) làm bằng Muse, không dùng Flow; món ăn đăng 3 kênh Từ Hạt Đến Mâm, video lỗi đăng Derpy AI"
metadata:
  node_type: memory
  type: project
  originSessionId: 76d921c2-728e-492f-bfe8-7cd490c0f85a
  modified: 2026-11-09T15:40:32.667Z
---

Diễm My dặn ngày 2026-11-09, "nhớ kĩ":

| Loại video | Công cụ | Kênh đăng |
|---|---|---|
| Món ăn | Muse (từ 2026-11-14; trước đó Google Flow `flow-chain-video`) | 3 kênh Từ Hạt Đến Mâm: TikTok, Facebook, YouTube |
| Video AI lỗi, hài | Muse (`muse-ai`) | Derpy AI: Trang Facebook 61596086948776 và TikTok @derpy.ai (Chrome Profile 3, `--profile derpy`, đăng nhập bằng QR ngày 2026-11-09) |
| Tóc đẹp | Muse | Chưa có kênh riêng |

**Why:** Diễm My có nhiều kênh. Đăng nhầm kênh hoặc làm nhầm công cụ là lỗi.
**How to apply:** Không đăng video lỗi lên Từ Hạt Đến Mâm, không đăng món ăn lên Derpy AI. Mọi lần đăng vẫn chờ Diễm My xác nhận. Xem [[kenh-tu-hat-den-mam]], [[diem-my-video-ai-loi]], [[diem-my-kenh-toc-dep-muse]], [[diem-my-xac-nhan-truoc-khi-dang]].

**Caption Derpy AI:** ngắn gọn 1 câu + hashtag, giọng lầy lội, đời thường (Diễm My 2026-11-11: "kiểu lầy lầy á"). Diễm My chọn "Tóc em mọc nhanh hơn deadline của sếp 😭" thay vì câu tả cảnh "Đi cắt tóc ngắn mà về dài tới đất luôn". Khi gửi clip duyệt, đưa sẵn 2-3 caption lầy để Diễm My chọn, đừng chỉ 1 câu tả cảnh: lần này Diễm My bảo đăng liền rồi mới đòi đổi cap, phải sửa trên bài đã đăng.

**Chuyển trang Facebook (2026-11-11):** profile my quản lý 2 trang (Từ Hạt Đến Mâm, Derpy AI). `dang-bai.mjs` báo "Facebook đang không dùng tên trang" nếu đang ở trang kia. Cách xử lý: mở `profile.php?id=<page id>` trong profile my, bấm nút "Chuyển", rồi chạy lại. Từ 2026-11-13 `dang-bai.mjs` tự làm việc này (bấm "Chuyển" trên trang rồi "Chuyển" trong hộp thoại xác nhận); trước đó mỗi lần dừng vì sai trang script để lại 1 tab `reels/create`, chủ máy thắc mắc vì thấy 3 tab. Đăng TikTok derpy cần mở cửa sổ Chrome "Profile 3" trước.


**Đổi công cụ (2026-11-14):** Diễm My nhắn "Từ nay các clip làm bằng muse k làm flow nữa nhe", ngay sau video hủ tiếu (`mon-an/hu-tieu/`) làm bằng Muse. Áp dụng: mọi clip cho Diễm My, kể cả món ăn Từ Hạt Đến Mâm, tạo bằng Muse (`muse-ai`), không dùng Flow. Cách làm món ăn bằng Muse: kịch bản 13 cảnh như cũ, mỗi cảnh 1 clip Muse 10 giây text-to-video với đoạn mô tả phong cách chung (bàn gỗ, tô sứ viền xanh, bếp quê miền Tây, ASMR, không chữ), chạy tuần tự bằng script kiểu `mon-an/hu-tieu/muse-clips.sh` (~21 phút/13 clip, không tốn credit), chèn chữ bằng `chen-chu.sh` (font timesbd, cỡ 64/48 cho 720×1280), cắt mỗi clip 6 giây rồi nối thẳng bằng ffmpeg (không crossfade vì cảnh không nối tiếp), nén bản đăng ~24 MB. Diễm My có thể tự ghép từ 13 clip rời, nhưng app của Diễm My xuất 464×848 nên bản ghép trên máy nét hơn.
