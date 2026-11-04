# Vòng đời chuồn chuồn hoàng đế — kịch bản và prompt

Ngày viết: 2026-10-21. Skill dùng: `flow-chain-video`.

K là viết tắt của keyframe (ảnh khung). K01–K06 là 6 ảnh tĩnh do GPT tạo.

## 1. Thông số

| Mục | Giá trị |
|---|---|
| Loài | Chuồn chuồn hoàng đế, *Anax imperator* |
| Tỉ lệ | 9:16 |
| Số clip Flow | 5: A, B, C, D, E |
| Số ảnh GPT | 6: K01–K06 |
| Model | `omni-flash` |
| Độ dài mỗi clip | 6 giây |
| Hệ số tăng tốc | 1,25 |
| Video cuối | khoảng 23,7 giây |

## 2. Góc máy

Camera đặt ngang mặt nước và đứng yên suốt video. Khung chia đôi: nửa trên là phần trên mặt nước, nửa dưới là phần dưới nước. Mép nước nằm hơi thấp hơn giữa khung. Một cọng sậy thẳng đứng ở giữa khung, xuyên qua mặt nước. Trứng nằm trên cọng sậy, ngay dưới mặt nước. Vỏ trứng là vật mốc cố định từ K02 tới K06.

## 3. Bảng phân cảnh

| Clip | Ảnh start | Diễn biến | Ảnh end | Trạng thái ở điểm nối |
|---|---|---|---|---|
| A | K01: hàng trứng vàng nhạt trên cọng sậy dưới nước | Trứng nở, 1 ấu trùng nhỏ bò ra | K02: ấu trùng nhỏ cạnh vỏ trứng | Ấu trùng bám yên |
| B | Khung cuối của A | Ấu trùng bò xuống, lớn dần | K03: ấu trùng lớn ở nửa dưới khung | Ấu trùng bám yên |
| C | Khung cuối của B | Ấu trùng bò lên cọng sậy, ra khỏi mặt nước | K04: ấu trùng bám cọng sậy trên mặt nước | Ấu trùng bám yên |
| D | Khung cuối của C | Da ấu trùng tách, chuồn chuồn chui ra | K05: chuồn chuồn cánh nhăn, bám trên xác lột | Chuồn chuồn bám yên |
| E | Khung cuối của D | Cánh nở dài, thân đổi màu | K06: chuồn chuồn cánh trong, ngực xanh lá, bụng xanh dương | Kết thúc video |

## 4. Độ đúng sinh học

Phần đúng với chuồn chuồn hoàng đế thật:
- Con cái đẻ trứng vào thân cây thuỷ sinh dưới nước.
- Ấu trùng sống dưới nước, có mầm cánh trên lưng.
- Ấu trùng tuổi cuối bò lên cọng sậy ra khỏi nước, rồi lột xác lần cuối.
- Con trưởng thành vừa ra có thân nhạt màu và cánh nhăn. Cánh nở ra trong vài giờ.

Phần lệch so với thực tế:

| Video | Thực tế | Lý do giữ |
|---|---|---|
| Ấu trùng ở trên cùng 1 cọng sậy suốt thời gian lớn | Ấu trùng sống 1–2 năm dưới nước, di chuyển khắp ao | Giữ 1 bối cảnh và camera đứng yên |
| Ấu trùng lớn dần liên tục | Ấu trùng lột xác 10–15 lần | Lột xác có nhiều bước nhỏ, model dễ tạo hình khó hiểu |
| Thân đổi sang màu đậm trong vài giây | Màu đậm hiện ra sau vài ngày | Video kết thúc ở con trưởng thành đủ màu |
| Trứng to, nhìn rõ | Trứng dài khoảng 1 mm | Người xem phải thấy trứng |

## 5. Prompt

Prompt ảnh GPT và prompt Flow nằm trong `plan.json`. Prompt Flow dùng mẫu đầy đủ của skill, gồm câu "In a single continuous shot, no scene cuts." và câu âm thanh "Quiet natural ambience, no music, no dialogue."

## 6. Kết quả 2026-10-21

Video cuối: `chuon-chuon.mp4`, 23,67 giây, 1080×1920, giữ tiếng gốc của Flow. Bốn điểm nối ở giây 4,76 · 9,48 · 14,2 · 18,92 đều đạt, với score 0,014–0,020. Claude xem các ảnh `frames/seam_*.png`, và không điểm nối nào có hình chồng.

| Clip | Số lần tạo | Ghi chú |
|---|---|---|
| A | 1 | Đạt |
| B | 1 | Đạt. Ấu trùng bò xuống và lớn dần, không hoà hình. |
| C | 1 | Đạt. Ấu trùng bò qua mặt nước, mặt nước gợn sóng. |
| D | 1 | Thân xanh của chuồn chuồn hiện ra từ cạnh ấu trùng bằng hoà hình khoảng 0,25 giây ở giây 1,5–1,75 của clip |
| E | 1 | Đạt. Cánh mở dần, bụng đổi dần sang xanh dương. |

Chi phí: 50 credit, gồm 5 lần tạo × 10 credit.

Độ to gốc của 5 clip: −24,5 tới −33,1 LUFS, lệch 8,6 dB.

Bài học:
- K01 bản đầu đặt mặt nước ở 37% chiều cao khung tính từ trên xuống. Phần trên mặt nước không đủ chỗ cho cảnh lột xác. Prompt ghi "at about 60 percent of the frame height from the top" cho mặt nước ở 46%.
- K04 đặt ấu trùng cao hơn prompt yêu cầu. Clip C vẫn khớp, vì Flow dừng ấu trùng gần vị trí xác lột của K05.
- `gpt-image.mjs` không nhận ra ảnh K05 ở lần đầu, rồi tự tải lại trang và lưu được ảnh.
