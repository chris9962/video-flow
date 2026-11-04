# Vòng đời tằm dâu — kịch bản và prompt

Ngày viết: 2026-10-22. Skill dùng: `flow-chain-video`.

K là viết tắt của keyframe (ảnh khung). K01, K02, K02b, K03–K06 là 7 ảnh tĩnh do GPT tạo.

## 1. Thông số

| Mục | Giá trị |
|---|---|
| Loài | Tằm dâu, *Bombyx mori* |
| Tỉ lệ | 9:16 |
| Số clip Flow | 6: A, B1, B2, C, D, E |
| Số ảnh GPT | 7: K01, K02, K02b, K03–K06 |
| Model | `omni-flash` |
| Độ dài mỗi clip | 6 giây |
| Hệ số tăng tốc | 1,4 |
| Video cuối | 25,33 giây, trong khoảng 20–26 giây |

Kế hoạch đầu có 5 clip và hệ số 1,25. Clip B được tách thành B1 và B2, xem mục 7.

## 2. Góc máy

Camera nhìn xuống một lá dâu lớn, góc khoảng 45 độ, và đứng yên suốt video. Cuống lá ở trên, chóp lá ở dưới. Trứng nằm ở nửa trên của lá, gần mép phải. Tằm lớn, kén và ngài nằm ở tâm khung, phía dưới vỏ trứng. Vỏ trứng là vật mốc cố định từ K02 tới K06. Phần lá bị ăn mất là vật mốc cố định từ K03 tới K06. Người dùng yêu cầu ngày 2026-10-22: lá phải mất đi rõ khi tằm ăn.

## 3. Bảng phân cảnh

| Clip | Ảnh start | Diễn biến | Ảnh end | Trạng thái ở điểm nối |
|---|---|---|---|---|
| A | K01: cụm khoảng 12 trứng xám | Trứng nở, 1 tằm non đen bò ra | K02: tằm non đen có lông cạnh vỏ trứng trắng | Tằm non nằm yên |
| B1 | Khung cuối của A | Tằm ăn một vết nhỏ ở mép lá, lớn dần, đổi từ đen sang xám nhạt | K02b: tằm xám cỡ vừa cạnh vết ăn nhỏ | Tằm nằm yên |
| B2 | Khung cuối của B1 | Tằm ăn lá, nửa phải của lá mất dần, tằm lớn dần và đổi sang trắng ngà | K03: nửa phải của lá đã mất, tằm lớn trắng ngà nằm dọc vết ăn | Tằm nằm yên |
| C | Khung cuối của B | Tằm nhả tơ quanh mình, kén vàng hình thành dần | K04: kén vàng có lớp tơ xốp bám vào lá | Kén đứng yên |
| D | Khung cuối của C | Ngài chui ra ở đầu kén, bò sang lá | K05: ngài trắng đậu cạnh kén thủng 1 lỗ | Ngài đứng yên |
| E | Khung cuối của D | Ngài đẻ trứng, cụm trứng lớn dần | K06: ngài cạnh cụm khoảng 30 trứng vàng nhạt | Kết thúc video |

Clip E kết thúc bằng trứng mới, nên video quay về giai đoạn đầu của vòng đời.

## 4. Độ đúng sinh học

Phần đúng với tằm dâu thật:
- Trứng sắp nở màu xám. Trứng mới đẻ màu vàng nhạt.
- Tằm mới nở màu đen, có lông. Tằm lớn màu trắng ngà, có sừng nhỏ ở đuôi.
- Tằm ăn lá dâu từ mép lá.
- Tằm nhả tơ làm kén quanh mình. Giống tằm Việt Nam thường cho kén vàng.
- Ngài màu trắng, cánh ngắn, râu hình lông chim, không bay được.

Phần lệch so với thực tế:

| Video | Thực tế | Lý do giữ |
|---|---|---|
| Cả vòng đời trên 1 lá dâu ngoài trời | Tằm là loài nuôi. Người nuôi cho ngài đẻ trên giấy, nuôi tằm trên nong và cho tằm làm kén trên né. | Giữ 1 bối cảnh và camera đứng yên |
| 1 tằm non bò ra | Cả ổ trứng nở trong 1–2 ngày | Nhiều chủ thể nhỏ dễ lệch ở điểm nối |
| Tằm lớn dần liên tục | Tằm lột xác 4 lần trong khoảng 20–25 ngày | Lột xác có nhiều bước nhỏ, model dễ tạo hình khó hiểu |
| Ngài đẻ ngay sau khi chui ra | Ngài cái giao phối rồi mới đẻ khoảng 300–500 trứng | Giữ 1 chủ thể |
| Trứng to, nhìn rõ | Trứng dài khoảng 1 mm | Người xem phải thấy trứng |

## 5. Rủi ro

| Clip | Rủi ro | Cách xử lý |
|---|---|---|
| B | 3 thay đổi cùng lúc: ăn lá, lớn lên, đổi màu. Video bướm phượng có hoà hình 0,5 giây khi sâu đổi màu. | Nếu clip B không đạt, Claude bỏ vết ăn lá. Khi đó K03–K06 phải tạo lại. |
| C | Tằm đổi thành kén, đổi cả hình lẫn màu | Prompt chỉ có 1 hành động: nhả tơ, kén hình thành dần |
| E | Flow có thể cho cụm trứng hiện ra bằng hoà hình | Chấp nhận nếu hoà hình ngắn hơn 0,5 giây |

## 6. Prompt

Prompt ảnh GPT và prompt Flow nằm trong `plan.json`. Prompt Flow dùng mẫu đầy đủ của skill, gồm câu "In a single continuous shot, no scene cuts." và câu âm thanh "Quiet natural ambience, no music, no dialogue."

## 7. Kết quả 2026-10-22

Video cuối: `tam.mp4`, 25,33 giây, 1080×1920, giữ tiếng gốc của Flow. Năm điểm nối ở giây 4,25 · 8,46 · 12,68 · 16,89 · 21,11 đều đạt, với score 0,044–0,147. Claude xem các ảnh `frames/seam_*.png`, và không điểm nối nào có hình chồng.

| Clip | Số lần tạo | Ghi chú |
|---|---|---|
| A | 1 | Đạt. Đuôi tằm non chạm mép phải khung ở cuối clip, giống K02. |
| B | 2 | Không dùng. Lần 1: tằm đen đổi ngay thành tằm trắng lớn ở giây 1,4. Lần 2: tằm đen đổi ngay thành tằm xám ở giây 1,4, rồi tằm xám và tằm trắng chồng nhau 0,5 giây. Bản lỗi ở `clips/loi/`. |
| B1 | 1 | Dùng được. Tằm lớn dần đều. Ở giây 4,3, tằm đổi từ xám sẫm sang xám nhạt trong 2 khung hình. |
| B2 | 1 | Người dùng chọn giữ. Hoà hình 0,6 giây ở giây 2,9–3,5: tằm trắng lớn và nửa phải của lá mờ dần thay cho cảnh ăn lá. |
| C | 1 | Đạt. Tằm nhả lưới tơ vàng rồi cuộn trong lưới. Kén đặc hiện ra bằng hoà hình 0,25 giây ở giây 5,5. |
| D | 1 | Đạt. Ngài chui ra ở đầu kén, bò xuống lá, không hoà hình. |
| E | 1 | Đạt. Cụm trứng vàng nhạt hiện ra dần dưới đuôi ngài từ giây 3. |

Chi phí: 80 tín dụng, gồm 8 lần tạo × 10 tín dụng.

Bài học:
- Một clip không đổi được tằm đen 3 mm thành tằm trắng lớn gấp 5 lần, kèm ăn nửa lá. Cả 2 prompt cho tằm đổi ngay trong 1 khung hình. Thêm ảnh trung gian K02b giảm lỗi ở B1, nhưng B2 vẫn hoà hình.
- Flow 1080p làm khung đầu của clip sau nét hơn khung cuối của clip trước. `chain.mjs` báo SSIM 0,67–0,71 và "SAI ảnh start", dù ảnh start đúng. Sau khi thu nhỏ về 270×480 và làm mờ, SSIM là 0,975–0,980.
- `gpt-image.mjs` không nhận ra ảnh K05 và K06 trên trang. Script tự tải lại trang và lưu được K05. Với K06, Claude dừng script và dùng `--save-last`.
