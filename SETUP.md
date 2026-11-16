# Cài video-flow trên máy mới

Hướng dẫn này dành cho cả người và Claude Code. Trên máy mới, mở Claude Code tại thư mục repo và nói: **"đọc SETUP.md rồi cài máy này"**. Claude làm các bước tự động được, rồi liệt kê các bước phải làm tay.

## 1. Lấy repo

```
git clone git@github.com:chris9962/video-flow.git
```

Repo đặt ở đâu cũng được, nhưng `~/video-flow` phải trỏ vào repo, vì `.claude/settings.json` ghi memory vào `~/video-flow/memory` và Claude Code không nhận đường dẫn tương đối.

- Mac/Linux: clone thẳng vào `~/video-flow`, hoặc `ln -s /đường/dẫn/repo ~/video-flow`.
- Windows, nếu repo ở `D:\Github\video-flow`:

```
cmd /c mklink /J %USERPROFILE%\video-flow D:\Github\video-flow
```

Kiểm tra: `ls ~/video-flow/memory/MEMORY.md` phải thấy file.

## 2. Công cụ cần có

| Công cụ | Dùng cho | Windows | Mac |
|---|---|---|---|
| Node 22 | app, script skill | `winget install OpenJS.NodeJS.LTS` hoặc nvm-windows | `nvm install 22` |
| ffmpeg + ffprobe | ghép clip, chèn chữ | `winget install Gyan.FFmpeg` | `brew install ffmpeg` |
| yt-dlp | tải video | `winget install yt-dlp.yt-dlp` | `brew install yt-dlp` |
| Python 3.11+ với Pillow | ảnh, rembg | `winget install Python.Python.3.13` rồi `pip install pillow` | `brew install python pillow` |
| jq | hook văn phong, setup.sh | `winget install jqlang.jq` | `brew install jq` |
| uv | venv Voice Studio | `winget install astral-sh.uv` | `brew install uv` |
| Google Chrome | Chrome CDP | cài thường | cài vào /Applications |
| Git Bash | chạy setup.sh và script .sh | có sẵn khi cài Git for Windows | có sẵn |

Trên Windows, Claude Code chạy script `.sh` bằng Git Bash. Chạy `./setup.sh` trong Git Bash, không dùng PowerShell.

## 3. Chạy setup.sh

```
cd ~/video-flow && ./setup.sh
```

Script làm: kiểm tra công cụ, `npm install` cho `app/` và các skill có `package.json`, symlink skill vào `~/.claude/skills/`, chép `claude-config/` sang `~/.claude/` (CLAUDE.md chung, quy tắc văn phong, hook văn phong), chép allowlist Telegram, symlink `~/voice-studio`, tạo `voice-studio/.venv`. Chạy lại nhiều lần vẫn an toàn.

Trên Windows, phần Voice Studio trong `setup.sh` kiểm tra `.venv/bin/python` (đường dẫn Mac). Nếu bị báo lỗi, tạo venv tay:

```
cd ~/video-flow/voice-studio
uv venv --python 3.11 .venv
uv pip install --python .venv/Scripts/python.exe -r requirements.txt
```

Voice Studio trên Windows cần torch bản CUDA và model ở `D:\hf-cache`, xem `voice-studio/` và `CLAUDE.md`.

## 4. Claude Code

1. Mở Claude Code tại `~/video-flow`. Khi được hỏi, chọn **trust folder** để `.claude/settings.json` có hiệu lực.
2. Kiểm tra memory: gõ `/memory`, đường dẫn phải là `~/video-flow/memory`. Nếu đúng, Claude đã nhớ toàn bộ quy tắc về Diễm My, nntruong96, Muse, các kênh.
3. Cài plugin Telegram: `/plugin`, chọn `telegram@claude-plugins-official`.
4. Token bot Telegram: chép `~/.claude/channels/telegram/.env` từ máy cũ, hoặc chạy `/telegram:configure` và dán token. Allowlist đã được `setup.sh` chép từ `claude-config/telegram/access.json`.
5. **Chỉ 1 máy chạy bot Telegram tại 1 thời điểm.** Hai máy cùng mở Claude Code với plugin Telegram sẽ giành tin nhắn (lỗi 409 Conflict). Máy cũ phải tắt plugin hoặc đóng Claude Code.

## 5. Chrome CDP và đăng nhập

```
cd ~/video-flow/app && npm run chrome
```

Chrome mở với profile `~/chrome-cdp-profile`, cổng 9222. Lần đầu profile trống, phải tạo 2 profile Chrome và đăng nhập đúng tài khoản. Chi tiết tài khoản và kênh ở `CLAUDE.md` mục "Profile Chrome CDP và kênh đăng video".

| Profile Chrome | Tài khoản Google | Đăng nhập thêm |
|---|---|---|
| Profile 1 "Oliver" | oliver1990ax@gmail.com | ChatGPT, Google Flow, YouTube Life Cycle Lab, Facebook Life Cycle Lab + Aurevella, TikTok @linh_dan_20x, aidancing.net, muse.ai |
| Profile 2 "My" | mi.nguyen97mi@gmail.com | ChatGPT, Google Flow, YouTube + Facebook + TikTok Từ Hạt Đến Mâm, TikTok @khoai.kai, Derpy AI, muse.ai |

Thứ tự tạo profile quan trọng, vì script `chrome-profile.mjs` nhận diện qua "Profile Path". Kiểm tra bằng `chrome://version`. Trên Windows mở Chrome CDP bằng Git Bash, không dùng PowerShell `Start-Process` (xem memory `chrome-cdp-mo-tay`).

## 6. File không có trong git, chép tay nếu cần

| Gì | Từ đâu | Khi nào cần |
|---|---|---|
| `app/data/settings.json` | máy cũ | dùng Claude chat trong app. Chứa `claudeToken`, không bao giờ commit. |
| `app/data/` còn lại | máy cũ, 1,2 GB | xem lại kết quả run cũ |
| Ảnh, video, log trong `dong-vat/`, `mon-an/`, `ai-loi/`, `em-be/`, `phim-ngan/`, `toc-dep/` | máy cũ | làm tiếp clip cũ. Ghi chú, kịch bản, script, ảnh nhân vật mẫu đã có trong git. |
| `~/Desktop/Mẫu/` | máy cũ | skill aidancing, video tải về |
| `~/voice-clone/voices/` | máy cũ, 1,8 MB | đọc thuyết minh bằng giọng đã clone |
| `voice-studio/outputs/` | máy cũ | bản đọc cũ |
| `~/.claude/channels/telegram/.env` | máy cũ | bot Telegram |
| `~/chrome-cdp-profile` | đăng nhập lại | luôn |

## 7. Kiểm tra xong

- `node .claude/skills/flow-chain-video/scripts/flow-tai-khoan.mjs --so` in được sổ credit Flow.
- `cd app && npm run dev:server` chạy ở `127.0.0.1:3001`, `npm run dev:web` ở `localhost:5173`.
- Gửi 1 tin Telegram từ tài khoản trong allowlist, Claude trả lời.
- Hỏi Claude "Diễm My quản kênh nào?" để chắc memory đã nạp.

## 8. Cho Claude: khi được yêu cầu cài máy này

1. Kiểm tra `~/video-flow` trỏ vào repo. Nếu chưa, tạo junction/symlink như mục 1.
2. Kiểm tra công cụ ở mục 2, báo cái nào thiếu kèm lệnh cài. Không tự cài phần mềm hệ thống khi chưa được đồng ý.
3. Chạy `./setup.sh` bằng bash, đọc cảnh báo, sửa phần sửa được.
4. Báo cho người dùng danh sách việc tay còn lại: plugin Telegram, token, đăng nhập Chrome, chép file ở mục 6.
5. Không commit gì trong lúc cài. Không chạy bot Telegram nếu máy cũ còn đang chạy.
