---
name: chrome-cdp-context-gotcha
description: Chrome CDP đóng cửa sổ nhưng process còn nền → 0 context → gãy connectOverCDP + mất auto-download (bị hỏi confirm)
metadata: 
  node_type: memory
  type: project
  originSessionId: 1addf5e1-9895-4c14-aac6-61171ebf7704
---

Triệu chứng lặp lại: block "Ảnh GPT 2 bước" (và mọi thứ dùng browser pilot) báo **"Chưa kết nối được Chrome"**, đôi khi kèm **tải ảnh bị hỏi confirm**.

**Gốc rễ (1 chỗ):** cửa sổ Chrome CDP (`~/chrome-cdp-profile`, PID nghe `:9222`) bị đóng hết nhưng process vẫn sống nền → Chrome ở trạng thái 0 window/0 context. Khi đó:
- `connectOverCDP` ném `Protocol error (Browser.setDownloadBehavior): Browser context management is not supported` → server hiện lỗi chung chung "Chưa kết nối Chrome" (che lỗi thật).
- Vì `setDownloadBehavior` không set được → Chrome mất chế độ tự-nhận-file → **hỏi confirm khi tải**.

**Chẩn đoán nhanh:** `curl -s http://127.0.0.1:9222/json/list` → **0 target** = dính lỗi này (port vẫn listen nên check port là chưa đủ). Máy này thường có 2 Chrome: `~/chrome-cdp-profile` (CDP, đúng) và Chrome cá nhân profile mặc định (KHÔNG đụng).

**Fix đúng:** relaunch sạch — `pkill -f chrome-cdp-profile; rm -f ~/chrome-cdp-profile/SingletonLock; cd apps/server && npm run chrome`. Login ChatGPT/Gemini vẫn còn (profile lưu trên đĩa). Xem quy trình đầy đủ ở [[startup-procedure]].
