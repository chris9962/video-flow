# Telegram channel của Claude Code

Plugin `telegram@claude-plugins-official`. Cấu hình thật nằm ở `~/.claude/channels/telegram/`, ngoài repo.

| File | Trong git? | Nội dung |
|---|---|---|
| `access.json` | Có, bản sao ở đây | Allowlist chat được nhắn bot: nntruong96 (5065235131), Diễm My (9060990194). `setup.sh` chép sang `~/.claude/channels/telegram/` nếu máy mới chưa có. |
| `.env` | Không | `TELEGRAM_BOT_TOKEN=...`. Chép tay từ máy cũ, hoặc chạy skill `/telegram:configure` và dán token. |

Khi đổi allowlist (skill `/telegram:access`), chép lại `access.json` vào đây rồi commit.

Lưu ý: 1 bot token chỉ nên có 1 máy chạy. Hai máy cùng mở Claude Code với plugin Telegram sẽ giành nhau tin nhắn (Telegram báo lỗi 409 Conflict). Máy nào không dùng thì tắt plugin hoặc đừng mở Claude Code.
