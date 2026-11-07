---
name: video-giai-thich-nhieu-chu-de
description: "Người dùng muốn bộ công cụ làm video giải thích nhiều chủ đề có giọng đọc, chia 3 trường phái; khác project video động vật"
metadata:
  node_type: memory
  type: project
  originSessionId: c84b75cb-6f27-45d8-977c-d74d4be1e65d
  modified: 2026-11-07T04:05:15.943Z
---

Ngày 2026-11-07, người dùng nêu mục tiêu mới: làm video giải thích nhiều chủ đề, không riêng video động vật. Ví dụ: thuỷ triều dâng và rút, quy trình thanh toán bảo hiểm xe. Video phải đẹp cả hình lẫn tiếng, đi từ ý tưởng, kịch bản, effect giữa các shot, tới giọng đọc.

Người dùng chia 3 trường phái: toàn bộ đồ hoạ (HyperFrames, Remotion), clip nguồn thật, và kết hợp cả hai. Giọng đọc dùng voice-clone ở `~/voice-clone`.

Research ngày 2026-11-07 đề xuất OpenMontage (`~/OpenMontage`) làm khung điều phối. Lý do: OpenMontage có pipeline Animated Explainer, Documentary Montage và Hybrid. Báo cáo nằm ở `reports/Agent dựng video chuyên nghiệp.md`. Artifact: https://claude.ai/artifact/8Ri4YHNzABMWgRk6QrUEHd

**Why:** Research vòng 1 lấy video động vật làm tiêu chí, nên người dùng phải nói lại mục tiêu.

**How to apply:** Khi người dùng hỏi về công cụ dựng video, bạn đánh giá theo video giải thích có giọng đọc. Bạn không lấy pipeline động vật làm tiêu chí, trừ khi người dùng nói rõ. Liên quan: [[voice-clone]], [[clip-mo-dau-camera-tien-vao]].
