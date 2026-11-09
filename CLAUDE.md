# Repo video-flow

Repo chứa toàn bộ công cụ làm video của người dùng: app video-flow, skill, memory và ghi chú của project video động vật. Người dùng mở Claude Code tại `~/video-flow`. Claude trả lời bằng tiếng Việt.

## Cấu trúc

| Thư mục | Nội dung |
|---|---|
| `app/` | App video-flow: server `127.0.0.1:3001`, web `localhost:5173`. Chi tiết kỹ thuật nằm trong `app/CLAUDE.md`. |
| `.claude/skills/` | Skill của repo. `setup.sh` tạo symlink từ `~/.claude/skills/` về đây, để skill dùng được ở mọi thư mục. |
| `.claude/settings.json` | `autoMemoryDirectory` trỏ memory về `~/video-flow/memory`. |
| `memory/` | Memory của Claude. `MEMORY.md` là mục lục. |
| `dong-vat/` | Project video vòng đời động vật. Mỗi video có 1 thư mục. |
| `voice-studio/` | Voice Studio: website nhái giọng ở `localhost:8765` và script `vc.py` cho skill `voice-clone`. `setup.sh` tạo symlink `~/voice-studio` về đây. |
| `fb-cheo-follow/` | Extension Chrome follow chéo trong nhóm Facebook: theo dõi người bình luận và trả lời có tag tên. Cách cài nằm trong `fb-cheo-follow/README.md`. |
| `claude-config/` | Bản sao `~/.claude/CLAUDE.md`, quy tắc văn phong và hook văn phong. `setup.sh` chép các file này sang máy mới. |
| `setup.sh` | Script cài máy mới. |

## Yêu cầu của người dùng và skill tương ứng

| Người dùng yêu cầu | Skill | Nơi lưu file |
|---|---|---|
| Làm video vòng đời động vật, ví dụ "tạo video con ốc bươu vàng" | `flow-chain-video` | `dong-vat/<tên không dấu>/` |
| Gửi link TikTok kèm link Shopee hoặc ảnh quần áo. Nhắc aidancing, ghép mẫu, đăng TikTok. | `aidancing-tiktok` | Ảnh: `~/Desktop/Mẫu/Ảnh/`. Video: `~/Desktop/Mẫu/Videos/`. |
| Tải video TikTok, YouTube, Facebook | `video-downloader` | `~/Desktop/Mẫu/` hoặc `~/Downloads` |
| Clone giọng, đọc thuyết minh | `voice-clone` | Giọng mẫu: `~/voice-clone/voices/`. Bản đọc trên website: `voice-studio/outputs/`. |
| Tạo ảnh macro siêu thực của một loài, ảnh minh hoạ cho bài viết về một loài | `animal-macro-photo` | `dong-vat/<tên không dấu>/anh-macro/` |

`app/skills/fashion-tryon-video` là skill cũ, dùng browser-pilot của hermes. Claude Code không nạp skill này.

## Chạy app

- Server: `cd ~/video-flow/app && npm run dev:server`.
- Web: `cd ~/video-flow/app && npm run dev:web`.
- Chrome CDP: `cd ~/video-flow/app && npm run chrome`. Profile nằm ở `~/chrome-cdp-profile`, cổng 9222.
- Tại gốc repo, `npm run dev:server`, `npm run dev:web` và `npm run chrome` chuyển lệnh vào `app/`.
- Voice Studio: `~/voice-studio/start.sh`, hoặc bấm đúp `voice-studio/Mo Voice Studio.command`.

## File không có trong git

Cảnh báo: không được commit `app/data/settings.json`. File này chứa `claudeToken`.

| File | Lý do | Cách chuyển sang máy khác |
|---|---|---|
| Ảnh, video và log trong `dong-vat/` | Nặng 3,8 GB ngày 2026-11-04. `.gitignore` chỉ giữ file `.md`, `.json`, `.mjs`, `.sh`, `.txt`. | Chép riêng |
| `app/data/`, trừ node mẫu, asset của node mẫu và workflow mẫu `b45b8398` | Nặng 1,2 GB, gồm kết quả run và asset | Chép riêng |
| `~/Desktop/Mẫu/` | Clip mẫu, ảnh Shopee, video thành phẩm | Chép riêng |
| `~/chrome-cdp-profile` | Đăng nhập các trang | Đăng nhập lại |
| `~/voice-clone/voices/` | Giọng mẫu, 1,8 MB ngày 2026-11-07 | Chép riêng |
| `voice-studio/.venv`, `voice-studio/outputs/` | `.venv` nặng 1,0 GB. `outputs/` chứa bản đọc. | `setup.sh` cài lại `.venv`. Chép riêng `outputs/`. |
| Mô hình OmniVoice trong `~/.cache/huggingface/hub/` | Nặng 2,46 GB | Voice Studio tự tải ở lần chạy đầu |

Git theo dõi workflow mẫu `app/data/workflows/b45b8398-7002-47a1-86e0-5aaa4c604587.json` nhờ lệnh `git add -f`, vì `chay-workflow.mjs` đọc workflow này.

## Memory

- Claude Code ghi memory mới vào `memory/` của repo.
- Memory mới chỉ lên GitHub khi người dùng yêu cầu commit và push.

## Cài máy mới

1. `git clone git@github.com:chris9962/video-flow.git ~/video-flow`
2. `cd ~/video-flow && ./setup.sh`
3. Làm các việc tay mà `setup.sh` in ra ở cuối.
