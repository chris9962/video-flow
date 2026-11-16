# Repo video-flow

Repo chứa toàn bộ công cụ làm video của người dùng: app video-flow, skill, memory và ghi chú của project video động vật. Người dùng mở Claude Code tại `~/video-flow`. Claude trả lời bằng tiếng Việt.

## Cấu trúc

| Thư mục | Nội dung |
|---|---|
| `app/` | App video-flow: server `127.0.0.1:3001`, web `localhost:5173`. Chi tiết kỹ thuật nằm trong `app/CLAUDE.md`. |
| `.claude/skills/` | Skill của repo. `setup.sh` tạo symlink từ `~/.claude/skills/` về đây, để skill dùng được ở mọi thư mục. |
| `.claude/settings.json` | `autoMemoryDirectory` trỏ memory về `~/video-flow/memory`. Claude Code không nhận đường dẫn tương đối, nên repo phải nằm ở `~/video-flow`, hoặc `~/video-flow` là junction/symlink trỏ vào repo (Windows: `cmd /c mklink /J %USERPROFILE%\video-flow D:\Github\video-flow`). |
| `memory/` | Memory của Claude. `MEMORY.md` là mục lục. |
| `dong-vat/` | Project video vòng đời động vật. Mỗi video có 1 thư mục. |
| `voice-studio/` | Voice Studio: website nhái giọng ở `localhost:8765` và script `vc.py` cho skill `voice-clone`. `setup.sh` tạo symlink `~/voice-studio` về đây. |
| `fb-cheo-follow/` | Extension Chrome follow chéo trong nhóm Facebook: theo dõi người bình luận và trả lời có tag tên. Cách cài nằm trong `fb-cheo-follow/README.md`. |
| `claude-config/` | Bản sao `~/.claude/CLAUDE.md`, quy tắc văn phong, hook văn phong và `telegram/access.json` (allowlist Telegram). `setup.sh` chép các file này sang máy mới. Token bot Telegram không có trong git, xem `claude-config/telegram/README.md`. |
| `setup.sh` | Script cài máy mới. |

## Yêu cầu của người dùng và skill tương ứng

| Người dùng yêu cầu | Skill | Nơi lưu file |
|---|---|---|
| Làm video vòng đời động vật, ví dụ "tạo video con ốc bươu vàng" | `flow-chain-video` | `dong-vat/<tên không dấu>/` |
| Gửi link TikTok kèm link Shopee hoặc ảnh quần áo. Nhắc aidancing, ghép mẫu, đăng TikTok. | `aidancing-tiktok` | Ảnh: `~/Desktop/Mẫu/Ảnh/`. Video: `~/Desktop/Mẫu/Videos/`. |
| Tải video TikTok, YouTube, Facebook | `video-downloader` | `~/Desktop/Mẫu/` hoặc `~/Downloads` |
| Clone giọng, đọc thuyết minh | `voice-clone` | Giọng mẫu: `~/voice-clone/voices/`. Bản đọc trên website: `voice-studio/outputs/`. |
| Tạo ảnh macro siêu thực của một loài, ảnh minh hoạ cho bài viết về một loài | `animal-macro-photo` | `dong-vat/<tên không dấu>/anh-macro/` |
| Nhờ Muse (muse.ai) tạo video 10 giây có tiếng, hoặc tạo ảnh | `muse-ai` | Thư mục của video đang làm |

`app/skills/fashion-tryon-video` là skill cũ, dùng browser-pilot của hermes. Claude Code không nạp skill này.

## Chạy app

- Server: `cd ~/video-flow/app && npm run dev:server`.
- Web: `cd ~/video-flow/app && npm run dev:web`.
- Chrome CDP: `cd ~/video-flow/app && npm run chrome`. Profile nằm ở `~/chrome-cdp-profile`, cổng 9222.
- Tại gốc repo, `npm run dev:server`, `npm run dev:web` và `npm run chrome` chuyển lệnh vào `app/`.
- Voice Studio: `~/voice-studio/start.sh`, hoặc bấm đúp `voice-studio/Mo Voice Studio.command`. Trên Windows: `voice-studio\start.cmd`; venv ở `voice-studio/.venv/Scripts/`, torch bản CUDA, model ở `D:\hf-cache`.

## Profile Chrome CDP và kênh đăng video

Ghi ngày 2026-11-08. Profile nằm trong `~/chrome-cdp-profile`, cổng 9222.

| Profile | Tài khoản Google | Kênh |
|---|---|---|
| Profile 1 "Oliver" | oliver1990ax@gmail.com | TikTok Linh Đan https://www.tiktok.com/@linh_dan_20x, FB Life Cycle Lab https://www.facebook.com/profile.php?id=61595556214345, FB Aurevella https://www.facebook.com/profile.php?id=61594230160348 (sẽ đổi tên thành Life Cycle Lab), YouTube Life Cycle Lab https://www.youtube.com/@LifeCycleLabTV |
| Profile 2 "My" | mi.nguyen97mi@gmail.com | Kênh "Từ Hạt Đến Mâm": TikTok https://www.tiktok.com/@t.ht.n.mm, FB https://www.facebook.com/profile.php?id=61596364020370, YouTube https://www.youtube.com/@TừHạtĐếnMâm |

- Người giao việc và duyệt video cho 4 kênh của profile Oliver là Telegram `nntruong96` (chat 5065235131).
- Người quản lý 3 kênh của profile My là Telegram Diễm My (chat 9060990194). Diễm My cũng gửi việc video áo dài. Video kênh "Từ Hạt Đến Mâm" nằm trong `mon-an/`.
- Không đăng video của người này lên kênh của người kia.
- Diễm My có toàn quyền ra lệnh tạo clip và đăng bài (dùng credit aidancing, Flow, đăng kênh của profile My) mà không cần xin chủ máy. Chủ máy cho quyền ngày 2026-11-08. Quyền này không áp dụng cho người khác.
- Khi nhận yêu cầu up clip, Claude hỏi người yêu cầu up lên kênh nào trước khi đăng, vì nntruong96 có 2 trang Facebook (Life Cycle Lab, Aurevella). Chủ máy dặn ngày 2026-11-08.
- **Quy tắc:** khi 1 người trên Telegram yêu cầu tạo clip hoặc đăng video, Claude phải xác định trước profile của người đó: `nntruong96` → Profile 1 "Oliver"; Diễm My (9060990194) → Profile 2 "My". Mọi bước (ChatGPT, aidancing, Flow, đăng bài) chạy trong profile đó. Cả 2 profile đều đã đăng nhập ChatGPT và mạng xã hội.
- Kỹ thuật, đo ngày 2026-11-08: Chrome CDP mở cả 2 profile trong 1 tiến trình. Playwright `contexts()[0]` gộp tab của cả 2 profile. Tab mới (`newPage`, `Target.createTarget`) mở trong browser context mặc định, khi đó là Profile 2 "My". CDP không tạo được tab trong context của profile còn lại. Xác định profile của 1 context bằng trang `chrome://version`, dòng "Profile Path".
- Script: `.claude/skills/flow-chain-video/scripts/chrome-profile.mjs` mở tab đúng profile; `kenh.json` cùng thư mục ghi kênh của từng profile. `dang-bai.mjs` và `dang-tiktok.mjs` bắt buộc `--profile oliver|my`.
- Google Flow: mỗi tài khoản Google được cộng 50 credit mỗi ngày (chủ máy báo 2026-11-09). `flow.mjs` dò mọi tài khoản ở mọi profile và chọn kiểu "vừa đủ": tài khoản ít credit nhất mà còn đủ cho clip, để dùng hết credit ngày trước, để dành credit tháng. Sổ credit `app/data/flow-credits.json`; xem bằng `node .claude/skills/flow-chain-video/scripts/flow-tai-khoan.mjs --so`. Ngày 2026-11-08: oliver1990ax còn 1 credit (đặt lại 23/11), mi.nguyen97my còn 1.050 (đặt lại 8/12).

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

Hướng dẫn đầy đủ ở `SETUP.md`. Tóm tắt:

1. `git clone git@github.com:chris9962/video-flow.git ~/video-flow`
2. `cd ~/video-flow && ./setup.sh`
3. Làm các việc tay mà `setup.sh` in ra ở cuối.
