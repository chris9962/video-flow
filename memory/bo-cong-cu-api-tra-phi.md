---
name: bo-cong-cu-api-tra-phi
description: "Khi đề xuất công cụ dựng video, không bỏ ngay công cụ cần API trả phí; kiểm tra phần trả phí có thay được bằng voice-clone, gpt-image.mjs, flow.mjs, Whisper local không"
metadata:
  node_type: memory
  type: feedback
  originSessionId: c84b75cb-6f27-45d8-977c-d74d4be1e65d
  modified: 2026-11-07T04:21:55.888Z
---

Người dùng không muốn dùng API trả phí. Khi một công cụ cần API trả phí, bạn đọc code để tìm chỗ gọi API. Sau đó, bạn đánh giá phần đó có thay được bằng công cụ người dùng đã có không:

- Giọng đọc: voice-clone (`~/voice-clone`), thay ElevenLabs và các TTS trả phí.
- Ảnh: `gpt-image.mjs`, điều khiển ChatGPT web qua Chrome CDP.
- Clip Veo: `flow.mjs`, điều khiển Google Flow web qua Chrome CDP.
- Giọng thành chữ: WhisperX hoặc mlx-whisper local, thay ElevenLabs Scribe.
- Nhạc, tiếng động: ACE-Step local; Pixabay, Freesound với key miễn phí.

Bạn chỉ bỏ hẳn công cụ khi phần trả phí không thay được, hoặc khi công cụ không hợp mục tiêu. Bạn không giữ dòng "Không hợp" trong bảng.

**Why:** Ngày 2026-11-07, người dùng yêu cầu bỏ công cụ cần API trả phí khỏi artifact research. Sau đó người dùng sửa lại: phần voice của ElevenLabs thay được bằng voice-clone, và người dùng đã có GPT Image và Veo. Vì vậy, người dùng muốn đánh giá khả năng viết lại trước khi bỏ.

**How to apply:** Áp cho mọi bảng so sánh và đề xuất công cụ, nhất là cho [[video-giai-thich-nhieu-chu-de]]. Mỗi công cụ cần ghi: chỗ gọi API trả phí, thay bằng gì, phần phải viết, công sức.
