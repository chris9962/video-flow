# Vòng đời ốc bươu vàng — kịch bản

Ngày viết: 2026-11-01. Skill dùng: `flow-chain-video`. Loài: ốc bươu vàng, tên tiếng Anh golden apple snail, *Pomacea canaliculata*.

K là viết tắt của keyframe (ảnh khung). K01–K07 là 7 ảnh tĩnh do GPT tạo.

## 1. Thông số

| Mục | Giá trị |
|---|---|
| Số clip Flow | 6: A–F, mỗi clip 6 giây, `omni-flash` |
| Cách tạo clip | Song song, mỗi clip dùng 2 ảnh K làm ảnh start và ảnh end |
| Hệ số tăng tốc | 1,4 |
| Crossfade | 0,25 giây |
| Video cuối | khoảng 24,5 giây |
| Góc máy | Ảnh nửa trên, nửa dưới mặt nước (split-level) trong ruộng lúa miền Tây. Mặt nước nằm ngang ở 45% chiều cao khung, tính từ dưới lên. |
| Bố cục | Thân lúa ở giữa khung. Cụm trứng trên thân lúa, phía trên mặt nước. Ốc con và ốc lớn ở dưới nước, trên bùn. Cây lúa non ở dưới nước, 65% chiều ngang khung tính từ trái. |

Người dùng yêu cầu đoạn cuối có cảnh ốc bò tìm thức ăn. Clip F dành riêng cho cảnh này, nên video có 6 clip thay cho 5 clip.

## 2. Bảng phân cảnh

| Clip | Ảnh start → ảnh end | Diễn biến |
|---|---|---|
| A | K01 → K02 | Ốc mẹ bám trên thân lúa, dưới cụm trứng hồng. Ốc mẹ bò xuống nước và ra khỏi khung. |
| B | K02 → K03 | Cụm trứng đổi từ hồng đậm sang hồng nhạt gần trắng. |
| C | K03 → K04 | Trứng nở. Ốc con chui ra, rơi xuống nước, chìm xuống bùn. Trên thân lúa còn vỏ trứng trắng. |
| D | K04 → K05 | Ốc con khác bò ra khỏi khung. Ốc con ở giữa lớn thành ốc nhỡ. |
| E | K05 → K06 | Ốc nhỡ lớn thành ốc trưởng thành, đầu quay sang phải. |
| F | K06 → K07 | Ốc bò qua bùn tới cây lúa non, đầu và râu đưa qua lại, rồi ăn lá lúa. |

## 3. Chi tiết hình ảnh theo tài liệu

- Ốc mẹ bò lên khỏi mặt nước để đẻ. Cụm trứng nằm trên thân cây, phía trên mặt nước.
- Trứng mới đẻ màu hồng đậm hoặc cam. Trứng nhạt màu dần khi gần nở, sang hồng nhạt gần trắng.
- Ốc con nở ra rơi xuống nước bên dưới.
- Ốc trưởng thành có vỏ tròn màu nâu vàng tới nâu xanh, có sọc xoắn sẫm màu. Thân mềm màu vàng, có 2 râu dài.
- Ốc ăn mạ và cây lúa non, cây thuỷ sinh mềm.

Nguồn:
- https://en.wikipedia.org/wiki/Pomacea_canaliculata
- https://blog.plantwise.org/wp-content/uploads/sites/7/2022/08/Golden_Apple_Snail_Life_Cycle_15.46.58-1.pdf
- https://planthealthportal.defra.gov.uk/assets/factsheets/Plant_Pest_Factsheet_Pomacea_species..pdf

## 4. Chỗ dễ sai khi tạo

- Trứng phải nằm phía trên mặt nước. GPT có thể vẽ trứng dưới nước.
- Mặt nước phải giữ cùng độ cao ở cả 7 ảnh K.
- Clip A: ốc mẹ đi qua mặt nước. Flow có thể tạo tia nước.
- Clip C: ốc con rơi xuống nước. Flow có thể tạo tia nước hoặc bỏ qua cảnh rơi.
- Clip F: lá lúa có thể mờ dần thay cho bị ăn.

## 5. Kết quả

- Ngày tạo: 2026-11-01. Cách tạo: song song, mỗi clip dùng K(n) làm ảnh start và K(n+1) làm ảnh end.
- Video cuối: `oc-buou-vang.mp4`, 23,54 giây, 20,8 MB, tăng tốc 1,4×, crossfade 0,25 giây.
- Chi phí: 8 clip × 10 tín dụng = 80 tín dụng. Clip D và E tạo 2 lần.
- Điểm nối: 5/5 đạt, score 0,007–0,060.
- Clip D bản 1: ốc nhỡ bò lên thân lúa, rồi hiện lại trên bùn ở giây 5,6. Bản cũ nằm ở `clips/loi/D_v1.mp4`.
- Clip E bản 1: ốc nhỡ ở K05 quay đầu sang trái, ốc lớn ở K06 quay sang phải. Ốc đổi cỡ trong 1 khung hình ở giây 1,5. Bản cũ nằm ở `clips/loi/E_v1.mp4`.
- Cách sửa: Claude sửa K05 cho ốc quay sang phải. Bản K05 cũ là `K05_v1.png`. K05 mới cho ốc nhỏ hơn, khoảng 1/13 chiều ngang khung.
- Clip E bản 2 vẫn đổi cỡ ốc trong 1 khung hình, ở giây 1,45. Ốc lớn khoảng 5 lần trong 1 clip. Claude đặt `trimStart: 1.5`, nên điểm nối D→E thành crossfade 0,25 giây từ ốc nhỡ sang ốc lớn.
- Lỗi nhỏ, giữ lại: clip D bản 2 có ốc con to lên khoảng 2 lần trong 1 khung hình ở giây 4,5.
- Lỗi nhỏ, giữ lại: clip F có ốc bò rất ít, vì K06 đã đặt ốc sát cây lúa non. Clip vẫn có ốc ngóc đầu, đưa râu qua lại và ăn lá.
- Lỗi script ảnh: `chain.mjs images` và `gpt-image.mjs` không nhận ra ảnh mới sau bước "Tải lại trang ChatGPT để cập nhật ảnh". Lỗi xảy ra ở K06, K07 và K05 mới. Claude lưu cả 3 ảnh bằng `gpt-image.mjs --save-last`.
