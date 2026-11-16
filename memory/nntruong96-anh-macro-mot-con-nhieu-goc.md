---
name: nntruong96-anh-macro-mot-con-nhieu-goc
description: "nntruong96 muốn ảnh macro cho bài viết là 1 con chụp nhiều góc, không tạo biến thể màu hay pha khác"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 3220473c-f337-40db-b960-77ee31007943
  modified: 2026-11-14T13:13:17.002Z
---

Khi nntruong96 nhờ tạo ảnh cận (macro) cho một loài để đăng bài, họ muốn 1 cá thể chụp nhiều góc: toàn thân, đầu, chi tiết chân hay cánh. Không tạo thêm ảnh biến thể màu hay pha khác.

**Why:** Ngày 2026-11-14, bài châu chấu sa mạc trên FB Life Cycle Lab có 4 ảnh, trong đó 1 ảnh pha bầy đàn màu hồng. nntruong96 nhắn "1 con mà nhiều góc chứ tạo còn màu đỏ làm gì". Claude phải xóa ảnh hồng khỏi bài đã đăng.

**How to apply:** Với skill `animal-macro-photo`, chỉ tạo các góc của cùng 1 con có màu như ảnh thật phổ biến nhất. Muốn thêm pha khác thì hỏi nntruong96 trước. Đăng bằng `dang-anh-fb.mjs --dry-run` rồi gửi ảnh cho nntruong96 xem trước khi đăng thật. Liên quan: [[nntruong96-noi-dung-copy]], [[chrome-profile-tai-khoan]].
