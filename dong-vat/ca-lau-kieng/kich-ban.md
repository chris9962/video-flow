# Vòng đời cá lau kiếng — kịch bản

Ngày viết: 2026-10-29. Skill dùng: `flow-chain-video`. Loài: cá lau kiếng, còn gọi là cá chùi kính. Kịch bản vẽ theo hình dạng của *Pterygoplichthys pardalis*, tên tiếng Anh Amazon sailfin catfish.

K là viết tắt của keyframe (ảnh khung). K01–K06 là 6 ảnh tĩnh do GPT tạo.

## 1. Thông số

| Mục | Giá trị |
|---|---|
| Số clip Flow | 5: A–E, mỗi clip 6 giây, `omni-flash` |
| Cách tạo clip | Song song, mỗi clip dùng 2 ảnh K làm ảnh start và ảnh end |
| Hệ số tăng tốc | 1,3 |
| Crossfade | 0,25 giây |
| Video cuối | khoảng 22 giây |
| Góc máy | Dưới nước, nhìn thẳng vào miệng hang ở bờ bùn của sông |

## 2. Bảng phân cảnh

| Clip | Ảnh start → ảnh end | Diễn biến |
|---|---|---|
| A | K01 → K02 | Cụm trứng cam vàng trong miệng hang nở, cá bột có túi noãn hoàng lớn |
| B | K02 → K03 | Cá bột lớn lên, chuyển màu nâu đen, bơi ra bám quanh miệng hang |
| C | K03 → K04 | Đàn cá con bơi ra khỏi khung, một con xuống đáy, lớn lên |
| D | K04 → K05 | Cá con lớn dần thành cá trưởng thành có đốm báo |
| E | K05 → K06 | Cá trưởng thành nằm yên, cụm trứng mới hiện ra trong miệng hang |

## 3. Chi tiết hình ảnh theo tài liệu

- Cá đực đào hang nằm ngang vào bờ sông. Cá cái đẻ trứng trong hang, hoặc trong khe đá.
- Cá đực canh hang tới khi cá bột tự bơi được và rời hang.
- Cá bột mới nở có túi noãn hoàng lớn màu vàng, thân chưa có sắc tố.
- Cá trưởng thành có hoa văn đốm. Vây lưng có 11–13 tia, cao như cánh buồm.
- Có dạng bạch tạng và dạng màu nâu sô-cô-la.
- Tài liệu về chi *Pterygoplichthys* không tả màu trứng. Kịch bản vẽ trứng màu cam vàng, kết thành cụm, theo trứng của cá cùng họ *Ancistrus*.

Nguồn: https://en.wikipedia.org/wiki/Pterygoplichthys_pardalis, https://www.iucngisd.org/gisd/species.php?sc=1659, https://www.threatenedtaxa.org/index.php/JoTT/article/download/7164/7889?inline=1, https://gensou.sg/?p=30532

## 4. Kết quả

- Ngày tạo: 2026-10-29. Cách tạo: song song, mỗi clip dùng K(n) làm ảnh start và K(n+1) làm ảnh end.
- Video cuối: `ca-lau-kieng.mp4`, 22,12 giây, 34,7 MB, tăng tốc 1,3×, crossfade 0,25 giây.
- Chi phí: 5 clip × 10 tín dụng = 50 tín dụng. Không clip nào phải tạo lại.
- Thời gian: lệnh chạy lúc 15:02, clip A mở lúc 15:09:56, video ghép xong lúc 15:16.
- Điểm nối: 4/4 đạt, score 0,017–0,049.
- Lỗi nhỏ, giữ lại: 2 bước nhảy bên trong clip, score 0,072 ở giây 4,08 và 0,075 ở giây 8,46, chỉ cao hơn giới hạn 0,070 một chút.
- Lỗi nhỏ, giữ lại: ở K04, cá con dài khoảng 0,6 chiều rộng khung, to hơn mức 1/4 trong prompt. Ở K05 và K06, khung 9:16 cắt mất chóp mõm và chóp đuôi.
