---
name: muse-ai
description: Nhờ Muse (muse.ai, agent AI của Meta) tạo video ngắn có tiếng, tạo ảnh hoặc trả lời, chạy qua Chrome CDP ở profile Oliver hoặc My, rồi tải video/ảnh về máy. Dùng khi người dùng nhắc "muse", "muse.ai", "nhờ muse làm video", "tạo video bằng muse", "tải video muse", hoặc cần 1 clip 10 giây có nhạc/âm thanh mà không muốn tốn credit Flow. Không dùng cho chuỗi clip nối tiếp trên Google Flow (flow-chain-video) hay ảnh ChatGPT (gpt-image.mjs).
---

# Muse AI

Muse là agent AI của Meta ở https://muse.ai. Đo ngày 2026-11-09:

- Mỗi video dài 10 giây, có âm thanh do Muse tạo theo mô tả. Muse ghép tối đa 6 clip cho mỗi tin nhắn.
- Khổ ảnh theo prompt: ghi "khổ dọc 9:16" thì ra 720×1280, không ghi thì ra 1280×720.
- Muse nhận ảnh đính kèm làm điểm bắt đầu cho video. Muse không nhận file nhạc có sẵn.
- Mỗi tài khoản chỉ có 1 luồng chat. Người dùng có thể đang chat cùng lúc trong luồng đó.

## Không gọi được bằng cookie + request

Tin chat đi qua WebSocket `wss://hatch.metaaivm.com/v1/noise`. Trình duyệt mã hoá tin bằng giao thức Noise trước khi gửi. Các API REST của muse.ai (`/api/session`, `/api/hatch/vm/wake`, ...) chỉ đánh thức máy ảo và kiểm tra đăng nhập, không gửi tin chat. Vì vậy script điều khiển 1 tab muse.ai chạy nền qua Chrome CDP, giống `gpt-image.mjs`.

## Chọn profile

Cả 2 profile Chrome CDP đã đăng nhập Muse. Chọn profile theo người yêu cầu, giống quy tắc trong `CLAUDE.md`:

- nntruong96 hoặc chủ máy: `--profile oliver`.
- Diễm My (Telegram 9060990194): `--profile my`.

Chrome CDP phải đang chạy (`npm run chrome`) và profile cần dùng phải có ít nhất 1 cửa sổ đang mở. Nếu thiếu cửa sổ Profile 2, mở bằng lệnh:

```bash
"/c/Program Files/Google/Chrome/Application/chrome.exe" --user-data-dir="$(cygpath -w ~/chrome-cdp-profile)" --profile-directory="Profile 2" https://muse.ai/
```

## Lệnh

```bash
S=~/video-flow/.claude/skills/muse-ai/scripts/muse.mjs

# Tạo video, chờ Muse làm xong, tải về <thư mục>/<prefix>-01.mp4, -02.mp4, ...
node $S --profile my --prompt "Tạo 1 video khổ dọc 9:16: ... Làm luôn, không cần hỏi lại." --out <thư mục> --prefix canh1

# Dùng ảnh làm điểm bắt đầu (lặp --ref nếu có nhiều ảnh)
node $S --profile my --prompt "Làm video 9:16 từ ảnh này: ..." --ref anh.png --out <thư mục>

# Chỉ hỏi, không cần media
node $S --profile oliver --prompt "..." --expect text

# Tải lại video/ảnh của lượt trả lời gần nhất có media, không gửi tin
node $S --profile my --save-last --out <thư mục>
```

- `--expect video|image|text`: mặc định `video`. Script chờ tới khi Muse gửi ít nhất 1 media và im lặng 25 giây.
- `--timeout <phút>`: mặc định 15. Mỗi video thường mất khoảng 1,5 phút.
- Script in câu trả lời chữ của Muse. Nếu hết giờ mà chưa có media thì Muse có thể đang hỏi lại: đọc câu trả lời, gửi tin tiếp, hoặc chờ rồi chạy `--save-last`.
- Gặp lỗi thì script giữ tab để xem. Chạy xong thì script đóng tab.

## Viết prompt

- Ghi rõ khổ ảnh, nội dung, âm thanh mong muốn.
- Thêm "Làm luôn, không cần hỏi lại." để Muse không hỏi thêm.
- Muse hiểu tiếng Việt.

## Kiểm tra video tải về

```bash
ffprobe -v error -show_entries format=duration:stream=codec_type,width,height -of compact <file.mp4>
```

Lấy 1 khung hình bằng `ffmpeg -ss 5 -i <file> -frames:v 1 khung.jpg`, rồi xem khung đó trước khi gửi video cho người dùng.

## Thử ảnh đầu + ảnh cuối (2026-11-09)

Đã thử gửi K02 và K03 của `dong-vat/rua-bien` (rùa nằm trên cát → rùa đã đào hố), dặn rõ ảnh 1 là khung đầu và ảnh 2 là khung cuối. Muse chạy khoảng 2 phút. Kết quả:

- Khung đầu gần giống hệt ảnh 1.
- Khung cuối chỉ giống ảnh 2 về ý: rùa nằm trong hố. Mai rùa mất màu, rùa lún sâu hơn ảnh 2. Muse không ép khung cuối khớp ảnh thật như "Frames to Video" của Flow.
- Video ra 768×1152 (2:3) theo tỉ lệ ảnh gửi vào, dù prompt ghi 9:16. Muốn 9:16 thì phải gửi ảnh 9:16.

Kết luận: Muse làm tốt kiểu "ảnh → video" (1 ảnh đầu). Không dùng Muse cho chuỗi clip nối tiếp cần điểm nối khớp nhau; việc đó vẫn dùng Flow.

## Việc chưa thử

Tạo ảnh (`--expect image`) đã chạy được ngày 2026-11-09: ảnh đại diện robot cho kênh AI Xàm Xí, khoảng 85 giây, ra file PNG 1600×1600 khi prompt ghi "ảnh vuông 1:1".
