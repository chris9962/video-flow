---
name: diem-my-em-be-va-cho-con
description: "Diễm My: nhân vật cố định em bé bụ bẫm + chó con lông trắng, ảnh tham chiếu và mô tả ở em-be/mau/, dùng cho các clip sau"
metadata:
  node_type: memory
  type: project
  originSessionId: 74138c59-e35f-4f14-b3ee-4f5cc63d1ab9
  modified: 2026-11-12T13:37:50.444Z
---

Tên em bé: **Khoai Kai** (Diễm My đặt 2026-11-12); chó con chưa có tên.

Ngày 2026-11-12, Diễm My (Telegram 9060990194) duyệt clip em bé ôm chó con trắng nằm võng (`em-be/clip-01/clip-01.mp4`, Muse, profile my) và dặn: "Ghi nhớ hình ảnh em bé và con chó này nha, tôi muốn dùng nó cho những clip sau luôn".

Ảnh tham chiếu và mô tả chi tiết: `em-be/mau/` (`em-be-cho-01.png`, `-02`, `-03`, `mo-ta.md`). Tóm tắt: em bé khoảng 1 tuổi, bụ bẫm, má hồng, tóc nâu đen xoăn nhẹ, đồ thun xanh nhạt in mây và gấu; chó con lông trắng kem xù, tai cụp ngả kem.

**Why:** Diễm My muốn giữ cùng 1 em bé và 1 con chó xuyên suốt các clip sau.

**How to apply:** Khi Diễm My đặt clip có em bé và/hoặc chó con, gửi Muse kèm `--ref em-be/mau/em-be-cho-01.png` và tả lại nhân vật theo `mo-ta.md`; xem khung hình so với ảnh tham chiếu trước khi gửi. Clip mới lưu ở `em-be/clip-NN/`. Kênh: TikTok @khoai.kai (Diễm My tạo 2026-11-12), đăng nhập bằng QR ở Chrome Profile 4, khoá `khoaikai` trong `kenh.json`: `dang-tiktok.mjs --profile khoaikai` (phải mở cửa sổ Profile 4 trước). Chưa có Facebook/YouTube cho kênh này. Mọi lần đăng vẫn chờ Diễm My xác nhận ([[diem-my-xac-nhan-truoc-khi-dang]], [[diem-my-kenh-va-cong-cu]]). Bối cảnh miền Nam: [[diem-my-boi-canh-mien-nam]]. Cùng kiểu ghi nhớ với [[tui-moc-len-vang-diem-my]].

Kỹ thuật (2026-11-12): tài khoản TikTok mới mặc định giao diện tiếng Việt, `dang-tiktok.mjs` chỉ nhận chữ tiếng Anh ("Uploaded", "Post") nên treo 10 phút ở bước tải lên. Đổi ngôn ngữ: tiktok.com → menu "Thêm" → "Tiếng Việt" → "English (US)". Đã đổi cho @khoai.kai. Clip đầu đã đăng: `em-be/clip-01/dang-bai.md`.

**Hướng clip sau (Diễm My dặn 2026-11-13, sau clip-02 chơi dừa khô):** "Clip Khoai Kai hay đó, giữ nguyên em bé như vậy nhé, nhớ đổi quần áo cho bé, quần áo đẹp và sạch sẽ như vậy nha, bối cảnh cũng ok, những clip sau cứ thay đổi theo những hoạt động thường ngày của 1 em bé thôi". Áp dụng: mặt và dáng bé giữ nguyên theo ảnh mẫu; mỗi clip đổi 1 bộ đồ khác, đẹp, sạch, kiểu đồ thun trẻ em màu nhạt; bối cảnh sân nhà quê miền Tây kiểu clip-02 là đạt; nội dung xoay quanh sinh hoạt hằng ngày của bé 1 tuổi (ăn, tắm, ngủ, tập đi, chơi với cún, đi chợ với mẹ, tưới cây...), không cần ý tưởng lạ. Ghi bộ đồ đã dùng vào `dang-bai.md` của mỗi clip để không lặp: clip-01 và clip-02 đồ thun xanh nhạt in mây và gấu.

**Nhạc trend (Diễm My dặn 2026-11-12):** "Mai mốt đăng kênh Khoai Kai nhớ dùng nhạc đang trend nhe". Mỗi lần đăng lên @khoai.kai phải gắn nhạc đang thịnh hành của TikTok. `dang-tiktok.mjs` chưa có bước chọn nhạc; TikTok Studio web có nút sửa video/thêm âm thanh ở trang tải lên, chưa thử qua CDP. Nếu không gắn được nhạc bằng web thì báo Diễm My trước khi đăng, không đăng im lặng với tiếng gốc Muse.

**Cách gắn nhạc đã làm được (2026-11-13, clip-02):** chạy `dang-tiktok.mjs --profile khoaikai --dry-run` để tải video và điền caption, tab để mở. Rồi bằng Playwright nối vào tab `tiktokstudio/upload`: bấm nút "Sounds" (cột phải, cạnh "Edit"), đóng tip "Got it", tab "For You" là nhạc TikTok gợi ý cho tài khoản; bấm dấu "+" cạnh bài muốn chọn (nhạc thành track thứ 2 dưới timeline, tiếng gốc vẫn giữ), bấm "Save" góc trên phải, chờ khoảng 10 giây, rồi bấm "Post". Dòng xem trước vẫn ghi "Original sound - Khoai Kai" sau khi Save, nhưng mở lại "Edit" thấy track nhạc còn, đăng vẫn có nhạc. Clip-02 dùng bài "đôi mắt long lanh như là bồ câu". Đã viết thành script `aidancing-tiktok/scripts/tiktok-nhac.mjs` (2026-11-13): `--list` in nhạc gợi ý, `--pick "<tên>"` thêm nhạc, Save, Post. Chạy sau `dang-tiktok.mjs --dry-run`. Script có thể in nhầm link bài cũ: lấy link mới nhất ở trang @khoai.kai. Clip-03 dùng "Gọi Cho Bạn Luôn".

**Muse từ chối bé cởi trần (2026-11-14):** Diễm My đặt clip-06 "Khoai Kai ngồi trong thau nước tắm với chó con, mặc quần đùi, cởi trần". Muse trả lời không làm được như mô tả và đề nghị bản bé mặc áo thun ngắn tay mỏng + quần đùi chơi nước trong thau. Claude nhận bản đó và báo Diễm My. Áp dụng: prompt Khoai Kai luôn cho bé mặc áo, kể cả cảnh tắm; cảnh tắm viết thành "chơi nước trong thau".

**Nhạc (2026-11-14, clip-06):** Diễm My nhắn "Khỏi nhạc, dùng âm thanh gốc" cho clip tắm thau. Từ nay khi gửi clip duyệt thì hỏi 1 câu "gắn nhạc trend hay giữ tiếng gốc?", không mặc định gắn nhạc.

**Bối cảnh mặc định (2026-11-14, clip-07):** Diễm My gửi ảnh nhà sàn gỗ mái lá bên ao sen, sân gạch tàu (`em-be/mau/nha-san-mai-la.jpg`) và dặn "Dùng bối cảnh này cho Khoai Kai luôn nhe". Mọi clip Khoai Kai sau gửi Muse 2 ảnh `--ref` (nhân vật + bối cảnh), ghi rõ ảnh nào là gì; Muse giữ bối cảnh tốt. Cùng lần này Diễm My sửa: bé ngồi ăn tự xúc, không đút cún, cún không liếm mặt, bé không cười to; nhạc clip-07 là "Anh Thanh Niên". Chi tiết trong `em-be/mau/mo-ta.md`.
