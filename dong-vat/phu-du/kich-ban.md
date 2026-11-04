# Vòng đời phù du — kịch bản

Ngày viết: 2026-10-30. Skill dùng: `flow-chain-video`. Loài: phù du, tên tiếng Anh mayfly, bộ Ephemeroptera.

K là viết tắt của keyframe (ảnh khung). K01–K06 là 6 ảnh tĩnh do GPT tạo.

## 1. Thông số

| Mục | Giá trị |
|---|---|
| Số clip Flow | 5: A–E, mỗi clip 6 giây, `omni-flash` |
| Cách tạo clip | Song song, mỗi clip dùng 2 ảnh K làm ảnh start và ảnh end |
| Hệ số tăng tốc | 1,3 |
| Crossfade | 0,25 giây |
| Video cuối | khoảng 22 giây |
| Góc máy | Nửa trên mặt nước, nửa dưới mặt nước, ở suối cạn lúc bình minh. Mặt nước nằm ngang ở 40% chiều cao khung, tính từ trên xuống. |

## 2. Bảng phân cảnh

| Clip | Ảnh start → ảnh end | Diễn biến |
|---|---|---|
| A | K01 → K02 | Cụm trứng vàng nhạt trên hòn đá nở, ấu trùng nhỏ có 3 đuôi bò ra |
| B | K02 → K03 | Ấu trùng nhỏ bò ra khỏi khung, một con ở giữa lớn lên thành ấu trùng nâu có mang hai bên bụng |
| C | K03 → K04 | Ấu trùng bơi lên mặt nước, á trưởng thành cánh xám đục chui ra, đứng trên mặt nước |
| D | K04 → K05 | Á trưởng thành bò lên thân cây sậy, lột xác lần cuối, thành con trưởng thành cánh trong |
| E | K05 → K06 | Con trưởng thành rơi xuống mặt nước, nằm duỗi cánh. Trứng mới chìm xuống hòn đá. |

## 3. Chi tiết hình ảnh theo tài liệu

- Phần lớn trứng chìm xuống đáy. Con cái thả trứng xuống mặt nước, hoặc đẻ trứng dưới nước giữa cây cỏ và khe đá.
- Tài liệu không tả màu trứng. Kịch bản vẽ trứng màu vàng nhạt, hình bầu dục, kết thành cụm.
- Ấu trùng sống dưới nước, phần lớn ở suối, dưới hòn đá. Thân dài, dẹt hoặc tròn. Bụng có tối đa 7 cặp mang hình mái chèo ở hai bên hoặc trên lưng. Đuôi có 2 sợi, nhiều loài có thêm sợi thứ 3 ở giữa. Mầm cánh hiện trên ngực.
- Ấu trùng nổi lên mặt nước, lột da, rồi nghỉ trên da cũ 1–2 phút trước khi bay.
- Á trưởng thành, tiếng Anh subimago hoặc dun: cánh đục một phần, màu xỉn hơn con trưởng thành. Phù du là côn trùng duy nhất lột xác thêm một lần sau khi đã có cánh.
- Con trưởng thành, tiếng Anh imago hoặc spinner: cánh màng trong, nhiều gân, dựng đứng khi nghỉ. Đuôi có 2–3 sợi dài. Con trưởng thành không ăn và chỉ sống thời gian ngắn.

Nguồn: https://en.wikipedia.org/wiki/Mayfly, https://wildaboututah.org/mayfly-life-cycle/

## 4. Kết quả

- Ngày tạo: 2026-10-30. Cách tạo: song song, mỗi clip dùng K(n) làm ảnh start và K(n+1) làm ảnh end.
- Video cuối: `phu-du.mp4`, 22,13 giây, 28,9 MB, tăng tốc 1,3×, crossfade 0,25 giây.
- Chi phí: 5 clip × 10 tín dụng = 50 tín dụng. Không clip nào phải tạo lại.
- Thời gian: lệnh chạy lúc 08:35, clip A mở lúc 08:43:33, video ghép xong lúc 08:50.
- Điểm nối: 4/4 đạt, score 0,011–0,034. Score cao nhất bên trong clip là 0,054, dưới giới hạn 0,070.
- Script Flow chạy ở tab nền lần đầu, sau khi sửa ngày 2026-10-30. Cả 5 clip tạo được. Clip A–D vẫn lỗi tải `ENOENT`, và `redl.sh` tải lại được cả 4 clip.
- Lỗi nhỏ, giữ lại: ở K03, ấu trùng dài khoảng 0,4 chiều rộng khung, to hơn mức 1/4 trong prompt. Ở K04, cánh á trưởng thành còn hơi trong, chưa đục như prompt.
- Lỗi nhỏ, giữ lại: ở giây 4,5 của clip C, một vật có hình ấu trùng hiện ra cạnh hòn đá trong vài khung hình. Ở clip D, bước lột xác lần cuối diễn ra nhanh và khó thấy.
