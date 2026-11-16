---
name: telegram-chi-gui-khi-duoc-hoi
description: "Việc nhận từ Telegram thì review/kết quả trung gian gửi qua Telegram, KHÔNG mở localhost"
metadata:
  node_type: memory
  type: feedback
  originSessionId: e6c754f1-6918-4dcf-a689-ddc3ebb352c7
  modified: 2026-11-07T16:53:13.610Z
---

Khi yêu cầu đến từ Telegram (vd flow aidancing), bỏ bước mở localhost (`http://localhost:5173/editor/<id>`) để review. Ảnh ghép, kết quả trung gian và clip cuối gửi thẳng qua Telegram cho người nhờ. Chỉ mở localhost khi yêu cầu đến từ terminal.

**Why:** Ngày 2026-11-07 người dùng nói "bỏ đoạn mở localhost lên để review đi, chỉ cần gửi telegram khi có yêu cầu từ telegram"; Claude hiểu ngược và mở localhost, người dùng sửa lại: "tôi đã nói k mở localhost khi có yêu cầu từ tele".

**How to apply:** Với [[aidancing-tiktok]] bước 5 (mở FE cho người dùng xem ảnh ghép): nếu nguồn là Telegram thì gửi ảnh qua Telegram thay vì mở FE. Credit aidancing vẫn cần chủ máy đồng ý.
