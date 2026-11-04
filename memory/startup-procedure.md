---
name: startup-procedure
description: "Quy trình chuẩn khi user nói \"start\" — start server/web + kiểm tra Chrome CDP đúng cách (context sống, không phải chỉ port)"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 1addf5e1-9895-4c14-aac6-61171ebf7704
---

Khi user yêu cầu "start các sv" (hoặc tương tự), làm theo checklist này để mọi thứ trơn tru, không lỗi:

0. **⚠️ LUÔN start server từ `~/video-flow/app`, KHÔNG từ git worktree.** Từ ngày 2026-11-04, app nằm trong thư mục `app/` của repo `~/video-flow`. Server đọc `data/` theo cwd; worktree có `data/` RỖNG riêng → start ở worktree = app hiển thị mất hết workflow (data thật vẫn an toàn ở `data/` repo gốc, chỉ là đọc nhầm chỗ). Đã dính lỗi này 1 lần.
1. **Server :3001** và **Web :5173** — kiểm tra `lsof -iTCP:<port> -sTCP:LISTEN`. Chưa chạy thì start từ `~/video-flow/app` (`npm run dev:server`, `npm run dev:web`). Đang chạy thì thôi. (Web chạy đâu cũng được vì chỉ proxy; server BẮT BUỘC `~/video-flow/app`.)
2. **Chrome CDP :9222 — KHÔNG chỉ check port listen.** Phải check có **context/page sống**:
   - `curl -s http://127.0.0.1:9222/json/list` → nếu **0 page target** = session hỏng (cửa sổ đã đóng nhưng process còn nền).
   - Cách chắc: chạy thử `chromium.connectOverCDP('http://127.0.0.1:9222')` trong apps/server. Nếu ném `Browser context management is not supported` = hỏng.
3. **Nếu Chrome CDP hỏng hoặc chưa lên:** tắt HẲN rồi mở lại sạch — `pkill -f chrome-cdp-profile; rm -f ~/chrome-cdp-profile/SingletonLock; (cd apps/server && npm run chrome &)`. Chờ ~10s tới khi `/json/version` trả về.
   - KHÔNG vá bằng cách mở window tay (AppleScript) — chỉ vá được connect, download-behavior vẫn bẩn → còn bị hỏi confirm khi tải ảnh.
4. **Verify cuối:** connectOverCDP OK + tab chatgpt.com có `#prompt-textarea` (đã login). Báo user gọn: 3 service + trạng thái login.

**Why:** "Tải ảnh im lặng không confirm" phụ thuộc Playwright gọi `setDownloadBehavior` lúc connect trên **session CDP sạch (1 context)**. Đóng cửa sổ Chrome mà không tắt hẳn → 0 context → vừa gãy connect vừa mất download-behavior (Chrome quay lại hỏi confirm). Gốc rễ 1 chỗ, đẻ ra cả 2 lỗi. Xem [[chrome-cdp-context-gotcha]].

**How to apply:** ưu tiên relaunch Chrome sạch bằng `npm run chrome` thay vì vá tay. Nhắc user: đừng chỉ bấm X đóng cửa sổ Chrome CDP; muốn dừng thì tắt hẳn / đóng terminal chạy npm run chrome.
