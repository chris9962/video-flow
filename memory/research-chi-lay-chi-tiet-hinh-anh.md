---
name: research-chi-lay-chi-tiet-hinh-anh
description: "Khi tìm tài liệu sinh học cho video vòng đời, chỉ lấy chi tiết hiển thị được trên hình; bỏ lịch tháng và số ngày của từng giai đoạn"
metadata:
  node_type: memory
  type: feedback
  originSessionId: b06fc468-5e62-4526-87d0-4727ef4adee3
  modified: 2026-10-24T11:39:01.801Z
---

Video vòng đời không có thuyết minh và không hiện chữ. Khi Claude tìm tài liệu cho kịch bản, Claude chỉ báo các chi tiết thấy được trên hình: màu, hình dạng, kích thước, tư thế, nơi sống, số lượng, hành vi. Claude không báo lịch theo tháng, số ngày của từng giai đoạn, hay chỗ các nguồn lệch nhau về thời gian.

**Why:** Ngày 2026-10-24, video sâu tre: Claude báo bảng tháng và số ngày cho từng giai đoạn. Người dùng nói: "ủa clip có cân thời gian gi đâu? có thuyết minh đâu mà quan tâm thời gian?"

**How to apply:** Bảng "độ đúng sinh học" trong kịch bản chỉ có cột hình ảnh. Con số thời gian duy nhất cần giữ là độ dài video cuối, xem [[thoi-luong-video-xu-huong]].

Ngày 2026-11-02, người dùng yêu cầu thêm: trước khi viết kịch bản cho một loài, Claude phải xem ảnh thật của loài trên Google. Cách làm nằm ở skill `flow-chain-video` mục 2.0, script `anh-google.mjs`.
