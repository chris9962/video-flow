#!/bin/bash
# Cài máy mới sau khi clone repo về ~/video-flow. Chạy lại nhiều lần vẫn an toàn: script không ghi đè file đã có.
set -u
REPO="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO"
warn() { printf '⚠ %s\n' "$*"; }

if [ "$REPO" != "$HOME/video-flow" ]; then
  warn "Repo đang ở $REPO. .claude/settings.json trỏ memory về ~/video-flow/memory, nên repo phải nằm ở ~/video-flow."
fi

echo "== 1. Công cụ =="
if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  warn "Thiếu Node. Cài nvm (https://github.com/nvm-sh/nvm), rồi chạy: nvm install 22. Sau đó chạy lại ./setup.sh"
  exit 1
fi
[ "$(node -p 'process.versions.node.split(".")[0]')" -ge 22 ] || warn "Node $(node -v) cũ hơn bản đang dùng (22). Chạy: nvm install 22"
missing=()
for t in ffmpeg ffprobe yt-dlp python3 jq; do command -v "$t" >/dev/null 2>&1 || missing+=("$t"); done
python3 -c 'import PIL' >/dev/null 2>&1 || missing+=("pillow")
if [ ${#missing[@]} -gt 0 ]; then
  warn "Thiếu: ${missing[*]}. Chạy: brew install ffmpeg yt-dlp jq python pillow"
fi
[ -d "/Applications/Google Chrome.app" ] || warn "Thiếu Google Chrome. Chrome CDP cần Chrome cài trong /Applications."

echo "== 2. npm install =="
(cd app && npm install --no-audit --no-fund) || { warn "npm install trong app/ lỗi"; exit 1; }
for d in .claude/skills/*/scripts; do
  [ -f "$d/package.json" ] && { (cd "$d" && npm install --no-audit --no-fund) || warn "npm install trong $d lỗi"; }
done

echo "== 3. Skill dùng được ở mọi thư mục =="
mkdir -p "$HOME/.claude/skills"
for d in .claude/skills/*/; do
  name="$(basename "$d")"
  link="$HOME/.claude/skills/$name"
  if [ -L "$link" ] || [ ! -e "$link" ]; then
    ln -sfn "$REPO/.claude/skills/$name" "$link"
    echo "  $link → $REPO/.claude/skills/$name"
  else
    # Claude Code ưu tiên skill trong ~/.claude/skills hơn skill trong repo khi trùng tên.
    warn "$link là thư mục riêng. Đổi tên thư mục đó rồi chạy lại, nếu không Claude Code dùng bản đó thay cho bản trong repo."
  fi
done

echo "== 4. Cấu hình Claude Code chung =="
for f in CLAUDE.md van-phong-ste.md; do
  if [ -e "$HOME/.claude/$f" ]; then
    echo "  ~/.claude/$f đã có, giữ nguyên"
  else
    cp "claude-config/$f" "$HOME/.claude/$f" && echo "  chép ~/.claude/$f"
  fi
done
settings="$HOME/.claude/settings.json"
[ -f "$settings" ] || echo '{}' > "$settings"
if grep -q 'van-phong-ste.md' "$settings"; then
  echo "  hook văn phong đã có trong $settings"
elif command -v jq >/dev/null 2>&1; then
  tmp="$(mktemp)"
  jq --slurpfile h claude-config/hook-van-phong.json '.hooks.UserPromptSubmit = ((.hooks.UserPromptSubmit // []) + $h)' "$settings" > "$tmp" \
    && mv "$tmp" "$settings" && echo "  thêm hook văn phong vào $settings"
else
  warn "Thiếu jq, chưa thêm hook văn phong. Cài jq rồi chạy lại."
fi

echo "== 4b. Telegram channel =="
tg="$HOME/.claude/channels/telegram"
mkdir -p "$tg"
if [ -f "$tg/access.json" ]; then
  echo "  $tg/access.json đã có, giữ nguyên"
else
  cp claude-config/telegram/access.json "$tg/access.json" && echo "  chép allowlist Telegram sang $tg/access.json"
fi
[ -f "$tg/.env" ] || warn "Thiếu $tg/.env (TELEGRAM_BOT_TOKEN). Chép từ máy cũ hoặc chạy /telegram:configure trong Claude Code."

echo "== 5. Thư mục ảnh và video =="
mkdir -p "$HOME/Desktop/Mẫu/Videos" "$HOME/Desktop/Mẫu/Clip mẫu" "$HOME/Desktop/Mẫu/Ảnh"
echo "  ~/Desktop/Mẫu/{Videos,Clip mẫu,Ảnh}"

echo "== 6. Voice Studio =="
# Skill voice-clone gọi ~/voice-studio/vc.py, và .venv ghi đường dẫn tuyệt đối ~/voice-studio.
link="$HOME/voice-studio"
if [ -L "$link" ] || [ ! -e "$link" ]; then
  ln -sfn "$REPO/voice-studio" "$link"
  echo "  $link → $REPO/voice-studio"
else
  warn "$link là thư mục riêng. Đổi tên thư mục đó rồi chạy lại."
fi
if [ -x voice-studio/.venv/bin/python ]; then
  echo "  voice-studio/.venv đã có, giữ nguyên"
elif command -v uv >/dev/null 2>&1; then
  (cd voice-studio && uv venv --python 3.11 .venv && uv pip install --python .venv/bin/python -r requirements.txt) \
    || warn "Cài voice-studio/.venv lỗi"
else
  warn "Thiếu uv, chưa cài voice-studio/.venv. Chạy: brew install uv. Sau đó chạy lại ./setup.sh"
fi

cat <<'EOF'

== 7. Việc bạn làm tay ==
1. Chép app/data/settings.json từ máy cũ, nếu bạn dùng Claude chat trong app. File này chứa claudeToken, không có trong git.
2. Chạy: cd ~/video-flow/app && npm run chrome
   Trong cửa sổ Chrome đó, đăng nhập ChatGPT, Google (Flow, YouTube), Facebook, TikTok Studio và aidancing.net.
3. Nếu cần ảnh và video cũ, chép dong-vat/<tên-video>/ và ~/Desktop/Mẫu từ máy cũ.
4. Nếu cần giọng mẫu, chép ~/voice-clone/voices từ máy cũ. Lần chạy Voice Studio đầu tiên tải mô hình OmniVoice 2,46 GB.
5. Mở Claude Code tại ~/video-flow. Khi Claude Code hỏi, chọn trust folder để setting memory có hiệu lực.
6. Telegram: cài plugin telegram@claude-plugins-official (/plugin), rồi chép ~/.claude/channels/telegram/.env từ máy cũ hoặc chạy /telegram:configure. Chỉ 1 máy chạy bot tại 1 thời điểm.
EOF
