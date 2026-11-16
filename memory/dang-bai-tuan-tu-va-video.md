---
name: dang-bai-tuan-tu-va-video
description: "Đăng bài cho Diễm My: chạy các script đăng tuần tự (song song thì TikTok mất kết nối Chrome), dang-bai.mjs phải truyền --video bản nén với đường dẫn tính từ gốc repo"
metadata:
  type: feedback
---

Ngày 2026-11-15 đăng 3 video của Diễm My (bún nước lèo, clip lỗi bánh xèo, Khoai Kai #8) lần đầu thất bại cả 5 bài:

- Chạy `dang-bai.mjs` (profile my) cùng lúc với 2 `dang-tiktok.mjs` (profile derpy, khoaikai) thì 2 bài TikTok báo "Không kết nối được Chrome tại 127.0.0.1:9222" dù Chrome vẫn sống. Chạy lại tuần tự từng bài thì cả 5 qua.
- `dang-bai.mjs mon-an/bun-nuoc-leo` không có `--video` thì tự chọn `bun-nuoc-leo.mp4` (bản gốc 42 MB), YouTube `setInputFiles` quá 30 giây. Phải truyền `--video mon-an/bun-nuoc-leo/bun-nuoc-leo-dang.mp4`.
- `--video` tính đường dẫn từ thư mục đang đứng (gốc repo), không phải từ thư mục clip: `--video loi-01.mp4` báo "Không thấy video: D:\Github\video-flow\loi-01.mp4".

**Why:** mất 1 lượt chạy ~5 phút và phải chạy lại; Diễm My đang chờ link.

**How to apply:** Khi đăng nhiều bài, gom vào 1 chuỗi Bash chạy nền, bài nào xong mới tới bài sau. Luôn ghi `--video <đường dẫn từ gốc repo tới bản -dang.mp4>` và `--khong-tin` cho kênh của Diễm My. Caption TikTok ghi thẳng trong lệnh, không trích bằng sed từ `dang-bai.md`. Liên quan [[diem-my-kenh-va-cong-cu]], [[diem-my-em-be-va-cho-con]].
