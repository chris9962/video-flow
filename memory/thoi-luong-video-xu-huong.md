---
name: thoi-luong-video-xu-huong
description: "Video cuối phải dài ít nhất 30 giây (2026-11-08, thay mức 20–26 giây); tốc độ ghép mặc định 1,4, không nên vượt 1,5; video ngắn thì đề xuất thêm clip hoặc giảm tốc; áp khi lập bảng phân cảnh"
metadata:
  node_type: memory
  type: feedback
  originSessionId: b06fc468-5e62-4526-87d0-4727ef4adee3
  modified: 2026-10-22T09:55:02.654Z
---

Video cuối phải dài ít nhất 30 giây. Người dùng yêu cầu ngày 2026-11-08, lý do của người dùng: Facebook cần thời gian xem trung bình 24 giây. Video 30 giây đạt mức này khi người xem xem trung bình 80% video.

Quy tắc cũ ngày 2026-10-22: video cuối nên dài 20–26 giây, vì người dùng thấy video trong khoảng này dễ lên xu hướng. Quy tắc 30 giây thay cho quy tắc này.

**Why:** Người dùng nhận xét từ kinh nghiệm đăng kênh "Life Cycle Lab". Claude chưa có số liệu để kiểm chứng.

**How to apply:** Khi lập bảng phân cảnh ở bước 2 của skill `flow-chain-video`, Claude chọn tổng thời lượng video cuối từ 30 giây trở lên. Nếu kịch bản ngắn hơn 30 giây ở tốc độ 1,4, Claude đề xuất thêm clip hoặc giảm tốc, rồi hỏi người dùng. Sau đó Claude tính lại hệ số tăng tốc ở mục 2.3. Nếu kịch bản ra ngoài khoảng này, Claude báo người dùng trước khi tạo clip.

Thời lượng các video đã làm, đo ngày 2026-10-22: bọ rùa 23,6 giây, bướm phượng 23,6 giây, chuồn chuồn 23,7 giây, ong 23,7 giây, ếch 20,5 giây. Hai video ngoài khoảng: bướm 28,4 giây, muỗi 14,8 giây.

Ngày 2026-11-04, video cá phổi: Claude đề xuất tăng tốc 2,25 để còn 25,7 giây. Người dùng chọn giữ tốc độ gốc và nói: "tôi cho phép dai 57s". Từ video này, Claude phải hỏi người dùng trước khi tăng tốc cao để đưa video về 20–26 giây.

Ngày 2026-11-07, video cá thòi lòi: Claude đề xuất tăng tốc 1,6. Người dùng chê 1,6 hơi quá nhanh, chọn 1,4, và yêu cầu ghi chú: tốc độ không nên tăng quá 1,5. Từ ngày này, `output.speed` mặc định 1,4 và không nên vượt 1,5. Quy tắc ngày 2026-11-07 "dài hơn 26 giây thì bớt clip" không còn áp dụng từ ngày 2026-11-08. Clip M có tốc độ riêng theo [[clip-mo-dau-camera-tien-vao]].

Liên quan: [[kenh-dang-video]]
