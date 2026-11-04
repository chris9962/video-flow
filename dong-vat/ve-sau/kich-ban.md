# Vòng đời ve sầu 17 năm — kịch bản và prompt

Ngày viết: 2026-10-23. Skill dùng: `flow-chain-video`.

K là viết tắt của keyframe (ảnh khung). K01–K06 là 6 ảnh tĩnh do GPT tạo.

## 1. Thông số

| Mục | Giá trị |
|---|---|
| Loài | Ve sầu 17 năm, *Magicicada septendecim* |
| Tỉ lệ | 9:16 |
| Số clip Flow | 5: A, B, C, D, E |
| Số ảnh GPT | 6: K01–K06 |
| Model | `omni-flash` |
| Độ dài mỗi clip | 6 giây |
| Hệ số tăng tốc | 1,25 |
| Video cuối | khoảng 23,7 giây, trong khoảng 20–26 giây |

## 2. Góc máy

Camera đặt ngang mặt đất và đứng yên suốt video. Khung chia đôi: nửa trên là gốc cây trên mặt đất, nửa dưới là mặt cắt đất. Mặt đất nằm hơi thấp hơn giữa khung. Thân cây đứng thẳng ở giữa khung. Một rễ lớn đi thẳng từ gốc cây xuống đất. Ấu trùng nằm trong một hốc đất cạnh rễ, ở nửa dưới khung. Đường hầm và lỗ thoát trên mặt đất là vật mốc cố định từ K03 tới K06.

Cách bố trí này giống video chuồn chuồn ngày 2026-10-21. Video đó có 5 clip, và cả 5 clip dùng được ở lần tạo đầu.

## 3. Bảng phân cảnh

| Clip | Ảnh start | Diễn biến | Ảnh end | Trạng thái ở điểm nối |
|---|---|---|---|---|
| A | K01: ấu trùng nhỏ màu kem bám rễ trong hốc đất | Ấu trùng lớn dần tại chỗ | K02: ấu trùng lớn màu nâu vàng, mắt đỏ, trong cùng hốc | Ấu trùng bám yên |
| B | Khung cuối của A | Ấu trùng đào hầm lên, chui ra khỏi lỗ cạnh gốc cây | K03: ấu trùng đứng trên mặt đất cạnh lỗ thoát, chân trước chạm vỏ cây | Ấu trùng đứng yên |
| C | Khung cuối của B | Ấu trùng bò thẳng lên thân cây | K04: ấu trùng bám thân cây ở khoảng 30% chiều cao khung tính từ trên xuống | Ấu trùng bám yên |
| D | Khung cuối của C | Lưng ấu trùng nứt ra, ve trắng mắt đỏ chui ra | K05: ve trắng cánh nhăn bám trên xác lột | Ve bám yên |
| E | Khung cuối của D | Cánh nở dài, thân sẫm dần sang đen | K06: ve đen mắt đỏ, cánh trong có gân cam | Kết thúc video |

## 4. Độ đúng sinh học

Phần đúng với ve sầu 17 năm thật:
- Ấu trùng sống dưới đất 17 năm và hút nhựa rễ cây.
- Ấu trùng có chân trước to để đào đất. Ấu trùng tuổi cuối có mắt đỏ.
- Ấu trùng đào hầm lên mặt đất, bò lên thân cây, rồi lột xác lần cuối.
- Ve mới lột có thân trắng ngà, mắt đỏ, cánh nhăn. Cánh nở ra trong khoảng 1 giờ. Thân sẫm sang đen trong vài giờ.
- Ve trưởng thành có thân đen, mắt đỏ, gân cánh màu cam. Khi đậu, ve xếp cánh hình mái trên lưng.

Phần lệch so với thực tế:

| Video | Thực tế | Lý do giữ |
|---|---|---|
| Video bắt đầu bằng ấu trùng nhỏ, không có trứng | Ve cái đẻ trứng trong cành cây cao. Ấu trùng nở ra rồi rơi xuống đất. | Giữ 1 bối cảnh và camera đứng yên |
| Ấu trùng lớn dần liên tục | Ấu trùng lột xác 4 lần dưới đất trong 17 năm | Lột xác có nhiều bước nhỏ, model dễ tạo hình khó hiểu |
| Ấu trùng nhỏ chỉ ngắn hơn ấu trùng lớn khoảng 2,3 lần | Ấu trùng tuổi 1 dài khoảng 2 mm, tuổi cuối dài khoảng 25 mm | Thay đổi kích thước nhỏ hơn giảm nguy cơ hoà hình. Video tằm bị hoà hình khi tằm lớn gấp 5 lần trong 1 clip. |
| Ánh sáng chiều tối | Ve thường chui lên và lột xác sau khi trời tối | Ảnh tối làm Flow tạo clip kém rõ |

## 5. Rủi ro

| Clip | Rủi ro | Cách xử lý |
|---|---|---|
| B | Ấu trùng đi qua mặt đất. Flow có thể cho ấu trùng hiện ra trên mặt đất bằng hoà hình. | Video chuồn chuồn có clip ấu trùng bò qua mặt nước. Clip đó đạt ở lần tạo đầu. |
| D | Lột xác, đổi cả hình lẫn màu | Video chuồn chuồn có hoà hình 0,25 giây ở clip lột xác. Chấp nhận nếu hoà hình ngắn hơn 0,5 giây. |
| E | Thân đổi từ trắng sang đen. Độ chênh màu lớn hơn video chuồn chuồn. | Nếu clip E không đạt, Claude báo người dùng trước khi tách clip. |

## 6. Prompt

Prompt ảnh GPT và prompt Flow nằm trong `plan.json`. Prompt Flow dùng mẫu đầy đủ của skill, gồm câu "In a single continuous shot, no scene cuts." và câu âm thanh "Quiet natural ambience, no music, no dialogue."

## 7. Kết quả 2026-10-23

Video cuối: `ve-sau.mp4`, 23,67 giây, 1080×1920, giữ tiếng gốc của Flow. Bốn điểm nối ở giây 4,76 · 9,48 · 14,2 · 18,92 đều đạt, với score 0,039–0,094. Claude xem các ảnh `frames/seam_*.png`, và không điểm nối nào có hình chồng. Lệnh `check` báo 1 bước nhảy ở giây 11,71, score 0,118. Đó là lúc ấu trùng bò nhanh lên thân cây, không có cắt cảnh.

| Clip | Số lần tạo | Ghi chú |
|---|---|---|
| A | 2 | Lần 1 không đạt: Flow cắt cảnh ở giây 1,0, score 0,373. Bản lỗi ở `clips/loi/`. Lần 2 đạt, sau khi prompt thêm "stays in the same spot" và "during the whole clip". |
| B | 1 | Đạt. Ấu trùng bò lên trên mặt cắt đất, không bò trong hầm. Đường hầm hiện ra dần phía sau ấu trùng. |
| C | 1 | Đạt. Ấu trùng quay người rồi bò lên thân cây. |
| D | 1 | Đạt. Ve trắng hiện ra từ lưng ấu trùng bằng hoà hình khoảng 0,25 giây ở giây 1,4–1,6. |
| E | 1 | Đạt. Cánh xoè ra rồi xếp hình mái. Thân sẫm dần sang đen, không hoà hình. |

Chi phí: 60 tín dụng, gồm 6 lần tạo × 10 tín dụng. Số đã báo người dùng là 50 tín dụng, cộng khoảng 30% nếu phải tạo lại.

Độ to gốc của 5 clip: −30,8 tới −35,4 LUFS, lệch 4,6 dB.

Ảnh K:
- K01 lần 1 có ấu trùng dài 1/9 chiều cao khung, prompt yêu cầu 1/16. Claude sửa K01 trong cuộc chat mới có đính kèm bản cũ. Bản cũ là `K01_lan1.png`.
- K03 lần 1 có ấu trùng nhỏ hơn K02 khoảng 28%. Claude sửa cỡ trong cùng cuộc chat.
- Bản K03 đã sửa cho ấu trùng bám sẵn trên thân cây. Bản này để lại quá ít chỗ cho clip C và K05. Claude tạo K05, K06 từ bản này.
- K05 đặt xác lột cao hơn ấu trùng của bản đó khoảng 70–110 px. Claude tạo K04 từ K05 trong cuộc chat mới: bỏ ve trắng, đổi xác lột thành ấu trùng nguyên vẹn. Sau đó Claude tạo K03 từ K04: ấu trùng đứng trên mặt đất cạnh lỗ thoát.
- `gpt-image.mjs` không nhận ra ảnh K06 và chờ hết 10 phút. Claude lưu K06 bằng `--save-last`.

Bài học:
- Clip "lớn dần tại chỗ" có thể bị cắt cảnh ở giây 1, dù đã có câu "no scene cuts". Prompt ghi rõ chủ thể ở yên một chỗ, lớn dần suốt cả clip, và bối cảnh không đổi, thì clip đạt.
- Khi tạo ảnh K theo thứ tự K01→K06, vị trí chủ thể ở ảnh giữa có thể lệch so với ảnh sau. Tạo ảnh sau trước, rồi sửa ngược về ảnh trước, giữ được vị trí khớp nhau.
