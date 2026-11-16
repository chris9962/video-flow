---
name: lenh-khong-ro-hoi-nguoi-ra-lenh
description: "Lệnh từ Telegram không rõ thì hỏi lại chính người gửi, không hỏi chủ máy"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 76d921c2-728e-492f-bfe8-7cd490c0f85a
  modified: 2026-11-09T11:58:21.992Z
---

Khi 1 người trên Telegram (Diễm My, nntruong96...) gửi yêu cầu không rõ, Claude hỏi lại chính người đó qua Telegram. Không hỏi chủ máy ở terminal.

**Why:** Ngày 2026-11-09, Diễm My hỏi "Dài 15-20 giây được không" mà không nói rõ video nào. Claude hỏi chủ máy, và chủ máy đáp: "ai ra lệnh k rõ thì hỏi họ, m hỏi t sao t biết".

**How to apply:** Lệnh từ Telegram thiếu thông tin thì nhắn 1 câu hỏi ngắn cho người gửi rồi chờ họ trả lời. Không đoán rồi làm. Xem thêm [[telegram-chi-gui-khi-duoc-hoi]], [[diem-my-xong-la-gui]].
