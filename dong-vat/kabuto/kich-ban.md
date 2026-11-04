# Vòng đời bọ cánh cứng tê giác Nhật Bản — kịch bản và prompt

Ngày viết: 2026-10-24. Skill dùng: `flow-chain-video`.

K là viết tắt của keyframe (ảnh khung). K01–K07 là 7 ảnh tĩnh do GPT tạo.

## 1. Thông số

| Mục | Giá trị |
|---|---|
| Loài | Bọ cánh cứng tê giác Nhật Bản, *Trypoxylus dichotomus*, tiếng Nhật カブトムシ (kabutomushi) |
| Tỉ lệ | 9:16 |
| Số clip Flow | 6: A–F |
| Số ảnh GPT | 7: K01–K07 |
| Model | `omni-flash` |
| Độ dài mỗi clip | 6 giây |
| Hệ số tăng tốc | 1,45 |
| Video cuối | khoảng 24,5 giây, trong khoảng 20–26 giây |

Người dùng duyệt phương án 6 clip ngày 2026-10-24. Phương án 7 clip có thêm cảnh con trưởng thành bò lên thân cây. Người dùng không chọn phương án này.

## 2. Góc máy

Camera đặt ngang mặt đất và đứng yên suốt video. Khung chia đôi: phần trên là gốc cây sồi kunugi và lớp lá rụng, phần dưới là mặt cắt lớp mùn lá. Mặt đất nằm ở khoảng 1/3 chiều cao khung tính từ trên xuống. Chủ thể nằm ở giữa phần đất, khoảng 60% chiều cao khung tính từ trên xuống. Vỏ trứng là vật mốc cố định từ K02 tới K04. Khoang hoá nhộng là vật mốc cố định từ K04 tới K07.

## 3. Bảng phân cảnh

| Clip | Ảnh start | Diễn biến | Ảnh end | Trạng thái ở điểm nối |
|---|---|---|---|---|
| A | K01: 3 trứng trắng trong hốc mùn | Trứng nở, 1 ấu trùng nhỏ bò ra | K02: ấu trùng nhỏ cong hình chữ C cạnh vỏ trứng | Ấu trùng nằm yên |
| B | Khung cuối của A | Ấu trùng lớn dần tại chỗ | K03: ấu trùng tuổi 3 rất lớn, đầu nâu cam | Ấu trùng nằm yên |
| C | Khung cuối của B | Ấu trùng nén đất thành khoang đứng, rồi duỗi thẳng | K04: tiền nhộng vàng, da nhăn, đứng trong khoang | Tiền nhộng nằm yên |
| D | Khung cuối của C | Da tiền nhộng nứt và tuột xuống, nhộng hiện ra | K05: nhộng đực nâu cam, có sừng dài | Nhộng nằm yên |
| E | Khung cuối của D | Da nhộng nứt, con trưởng thành chui ra, cánh màng duỗi ra | K06: con trưởng thành có cánh cứng trắng sữa, cánh màng buông xuống | Con trưởng thành đứng yên |
| F | Khung cuối của E | Cánh màng gập lại, cánh cứng sẫm dần | K07: con trưởng thành nâu đỏ sẫm, gần đen | Kết thúc video |

## 4. Độ đúng sinh học

Phần đúng với tài liệu:
- Trứng dài 2–3 mm, hình bầu dục, nở sau khoảng 2 tuần. Ấu trùng mới nở dài 8–10 mm.
- Ấu trùng sống trong mùn lá, lột xác 2 lần rồi qua đông ở tuổi 3.
- Khoảng tháng 6, ấu trùng làm khoang hoá nhộng trong đất. Da nhăn lại, rồi ấu trùng nằm yên khoảng 5,5 ngày.
- Nhộng mới hoá màu trắng, sau đó đổi sang nâu vàng. Con đực có sừng ở nhộng. Giai đoạn nhộng kéo dài khoảng 3 tuần.
- Con trưởng thành mới hoá có cánh cứng màu trắng sữa. Cánh màng duỗi ra trong khoảng 2 giờ rồi gập lại. Thân sẫm dần, sau 1 ngày gần như đen.

Hai điểm chưa có nguồn xác nhận: khoang hoá nhộng đứng thẳng, ấu trùng tuổi 3 dài khoảng 10 cm.

Phần lệch so với thực tế:

| Video | Thực tế | Lý do giữ |
|---|---|---|
| 3 trứng, 1 ấu trùng | Con cái đẻ 20–30 trứng | Nhiều chủ thể nhỏ dễ lệch ở điểm nối |
| Ấu trùng lớn dần liên tục | Ấu trùng lột xác 2 lần | Lột xác có nhiều bước nhỏ, model dễ tạo hình khó hiểu |
| Ấu trùng tuổi 3 chỉ dài hơn ấu trùng mới nở khoảng 3,2 lần | Ấu trùng tăng gần 1.000 lần khối lượng | Thay đổi kích thước nhỏ hơn giảm nguy cơ hoà hình |
| Video kết thúc trong khoang hoá nhộng | Con trưởng thành ở dưới đất 7–17 ngày, rồi chui lên | Người dùng chọn phương án 6 clip |

## 5. Rủi ro

| Clip | Rủi ro | Cách xử lý |
|---|---|---|
| B | Cỡ tăng 3,2 lần. Clip A của video ve sầu bị cắt cảnh ở giây 1 khi prompt chưa ghi "stays in the same spot". | Prompt dùng câu đã đạt ở lần tạo thứ 2 của clip đó |
| D, E | Đổi hình chủ thể. Video chuồn chuồn và ve sầu có hoà hình 0,25 giây ở clip lột xác. | Chấp nhận nếu hoà hình ngắn hơn 0,5 giây |

## 6. Prompt

Prompt ảnh GPT và prompt Flow nằm trong `plan.json`. Prompt Flow dùng mẫu đầy đủ của skill.

## 7. Kết quả 2026-10-24

Video cuối: `kabuto.mp4`, 28,54 giây, 1080×1920, giữ tiếng gốc của Flow. Sáu điểm nối ở giây 4,10 · 8,17 · 12,24 · 16,31 · 20,38 · 24,45 đều đạt, với score 0,040–0,073. Ngày 2026-10-24, người dùng yêu cầu thêm clip G: con trưởng thành bò lên mặt đất. Người dùng chấp nhận video dài hơn khoảng 20–26 giây. Claude xem các ảnh `frames/seam_*.png`, và không điểm nối nào có hình chồng. Lệnh `check` báo 1 bước nhảy ở giây 6,04, score 0,107. Đó là lúc ấu trùng lớn dần, không có cắt cảnh.

| Clip | Số lần tạo | Ghi chú |
|---|---|---|
| A | 1 | Đạt. Trứng phồng to trước khi nở, đúng với tài liệu. Ấu trùng chui ra ở giây 1,75. |
| B | 1 | Đạt. Ấu trùng lớn dần đều trong 6 giây, score cao nhất 0,089. |
| C | 1 | Đạt. Khoang hoá nhộng hiện ra dần trong khoảng 1 giây. Ấu trùng xoay người rồi duỗi thẳng. |
| D | 1 | Đạt. Da tiền nhộng nứt ở đầu rồi tuột xuống, không hoà hình. |
| E | 1 | Đạt. Cánh cứng trắng sữa hiện ra ở giây 1,75–2,5. Không có da nhộng cũ ở đáy khoang. |
| F | 1 | Đạt. Cánh màng xoè ra rồi gập lại. Cánh cứng sẫm dần sang nâu đỏ. |
| G | 1 | Đạt. Con trưởng thành xoay người, bò lên. Đường hầm hiện ra dần phía trên. Con bọ dừng trên lớp lá ở gốc sồi. |

Chi phí: 70 tín dụng, gồm 7 lần tạo × 10 tín dụng. Clip G thêm 10 tín dụng, đúng số đã báo khi đề xuất phương án 7 clip.

Độ to gốc của 7 clip: −29,2 tới −35,5 LUFS, lệch 6,3 dB.

Ảnh K:
- K01 lần 1 có trứng dài 1/18 chiều cao khung, prompt yêu cầu 1/40. Claude thu nhỏ trứng còn một nửa trong cùng cuộc chat. Bản cũ là `K01_lan1.png`.
- K04 lần 1 cho tiền nhộng quay mặt bụng ra trước. Claude đổi sang góc nhìn ngang, đầu hướng sang trái, để con trưởng thành ở K06–K07 thấy rõ cánh cứng. Bản cũ là `K04_lan1.png`.
- K05 nới đỉnh khoang lên khoảng 90 px để có chỗ cho sừng nhộng.
- K08 lần 1 có con bọ nhỏ hơn K07 khoảng 35%. Lần 2 đúng cỡ nhưng đuôi con bọ sát mép phải vùng cắt 9:16. Lần 3 dịch con bọ sang trái. Bản cũ là `K08_lan1.png`, `K08_lan2.png`.
- `gpt-image.mjs` không nhận ra ảnh K04 lần 2, K05, K06, K07, K08. Claude chụp trang ChatGPT sau khoảng 75 giây, thấy ảnh đã xong, rồi lưu bằng `--save-last`.

Bài học:
- Prompt "stays in the same spot ... during the whole clip" cho ấu trùng lớn dần đều ở lần tạo đầu, với cỡ tăng 3,5 lần. Video ve sầu 2026-10-23 cũng đạt với prompt này.
- Góc nhìn của chủ thể phải giữ nguyên từ ảnh K đầu tiên có chủ thể đó. Đổi góc nhìn ở giữa chuỗi làm clip phải xoay chủ thể.
