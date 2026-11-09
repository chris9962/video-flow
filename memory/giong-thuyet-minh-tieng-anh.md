---
name: giong-thuyet-minh-tieng-anh
description: "Thuyết minh tiếng Anh dùng giọng clone của chính người dùng, tên giọng `giong-toi-eng` trong ~/voice-clone/voices/, tạo từ voice-mau-eng.mp3 ngày 2026-11-08"
metadata:
  node_type: memory
  type: feedback
  originSessionId: bb5dc709-7408-40b0-8196-ab2da87f58e3
  modified: 2026-11-08T02:55:36.664Z
---

Mọi bản thuyết minh tiếng Anh dùng giọng của chính người dùng. Người dùng yêu cầu ngày 2026-11-08: "các bản tiếng anh sử dụng giọng này".

| Mục | Giá trị |
|---|---|
| Tên giọng | `giong-toi-eng` |
| Thư mục | `~/voice-clone/voices/giong-toi-eng/` (máy Mac; máy Windows tạo lại ngày 2026-11-08 từ `C:SERSADMINDESKTOPOICE-MAU-ENG.MP3`) |
| File gốc | `~/video-flow/voice-mau-eng.mp3`, 16,8 giây, người dùng tự đọc câu A, B, C của thuyết minh cá thòi lòi |
| Đoạn cắt làm giọng mẫu | Giây 0–11,0, gồm câu A và câu B. Lời chép do người dùng gửi, không qua Whisper. |
| Công cụ | OmniVoice qua `~/voice-studio/vc.py`, ngôn ngữ `en` |

**Why:** Người dùng muốn kênh có giọng đọc riêng. Giọng cuối của video bằng tiếng Anh, theo [[chia-viec-kich-ban-thuyet-minh]].

**How to apply:** Khi tạo giọng tiếng Anh, Claude dùng `vc.py say --voice giong-toi-eng`, hoặc nạp `prompt.pt` của giọng này. Claude không dùng giọng Google hay giọng thiết kế cho bản tiếng Anh, trừ khi người dùng yêu cầu. Bản tiếng Việt nghe thử chưa có giọng chốt. Không được đưa `voice-mau-eng.mp3` và `~/voice-clone/voices/` lên git khi người dùng chưa xác nhận repo là private.
