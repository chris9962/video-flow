---
name: chia-viec-kich-ban-thuyet-minh
description: "Chia việc cho video có thuyết minh (2026-11-08): Claude thu thập tài liệu; GPT (Codex) viết lời thuyết minh và bản dịch tiếng Việt; Claude không tự dịch, không sửa bản dịch của GPT; giọng cuối bằng tiếng Anh"
metadata:
  node_type: memory
  type: feedback
  originSessionId: bb5dc709-7408-40b0-8196-ab2da87f58e3
  modified: 2026-11-08T02:41:54.447Z
---

Người dùng chia việc ngày 2026-11-08:

| Việc | Ai làm |
|---|---|
| Thu thập tài liệu: sự thật về loài, nguồn, ảnh thật | Claude |
| Viết lời thuyết minh tiếng Anh | GPT, gọi qua Codex CLI |
| Viết bản dịch tiếng Việt để người dùng duyệt | GPT, gọi qua Codex CLI |
| Tạo giọng đọc bằng công cụ text-to-voice có sẵn | Claude |

Giọng đọc trong video cuối bằng tiếng Anh. Facebook tự tạo bản chép lời từ giọng đọc và tự dịch cho người xem.

**Why:** Claude sửa ngắn bản dịch của Codex và làm câu khó hiểu hơn. Ví dụ, Claude bỏ chữ "lượng" trong câu "trong lượng khí do cá bố mang xuống". Người dùng chê bản dịch của Claude rất nặng.

**How to apply:** Claude gửi người dùng bản dịch đúng nguyên văn của GPT. Claude không tự dịch, không rút gọn, không viết lại bản dịch. Nếu bản dịch có lỗi, Claude ghi lỗi đó vào yêu cầu gửi GPT và để GPT viết lại. Khi gọi Codex, Claude dùng reasoning effort medium theo [[codex-reasoning-medium]]. Liên quan: [[kich-ban-du-quy-trinh-cuon-hut]].
