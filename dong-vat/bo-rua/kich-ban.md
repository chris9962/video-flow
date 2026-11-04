# Vòng đời bọ rùa bảy chấm — kịch bản và prompt

Ngày viết: 2026-10-20. Skill dùng: `flow-chain-video`.

K là viết tắt của keyframe (ảnh khung). K01–K06 là 6 ảnh tĩnh do GPT tạo.

## 1. Thông số

| Mục | Giá trị |
|---|---|
| Loài | Bọ rùa bảy chấm, *Coccinella septempunctata* |
| Tỉ lệ | 9:16 |
| Số clip Flow | 5: A, B, C, D, E |
| Số ảnh GPT | 6: K01–K06 |
| Model | `omni-flash`, một model cho cả chuỗi |
| Độ dài mỗi clip | 6 giây |
| Tổng render | 30 giây |
| Hệ số tăng tốc | 1,25 |
| Crossfade | 0,1 giây ở mỗi điểm nối |
| Video cuối | khoảng 23,7 giây, giữ tiếng gốc của Flow |
| Điểm nối | giây 4,8 · 9,5 · 14,2 · 18,9 |

Thông số model, độ dài, tốc độ giống video ếch và video bướm. Ba video sẽ có cùng nhịp.

## 2. Lý do chọn

- Bọ rùa đẻ trứng, ấu trùng lớn, hoá nhộng và nở trên lá. Video giữ một bối cảnh và camera đứng yên từ đầu tới cuối.
- Video có 4 thay đổi chính: trứng → ấu trùng nhỏ, ấu trùng nhỏ → ấu trùng lớn, ấu trùng → nhộng, nhộng → bọ rùa vàng nhạt.
- Video có 1 thay đổi phụ: cánh cứng đổi từ vàng nhạt sang đỏ, 7 chấm đen hiện ra. Thay đổi này là cảnh cuối của video.
- Ấu trùng bọ rùa đen, có gai, có đốm cam. Người xem thường không biết đây là bọ rùa. Câu hỏi "Which stage did you not expect?" ở phần mô tả dựa vào điểm này.
- Hơn 2 thay đổi chính, nên video cần nhiều clip. Clip D chỉ chứa 1 thay đổi: bọ rùa chui ra khỏi nhộng. Lý do: thay đổi này có nhiều bước nhỏ, giống clip lột xác của video muỗi.

## 3. Góc máy

Camera nhìn xuống một chiếc lá xanh, góc khoảng 45 độ.

- Lá nằm gần phẳng, ngang qua giữa khung, thấy rõ gân lá.
- Nền là vườn xanh mờ.
- Cụm trứng nằm ở nửa trên của lá, phía trên tâm khung.
- Ấu trùng lớn, nhộng và bọ rùa nằm ở tâm khung, phía dưới vỏ trứng.

Vỏ trứng rỗng ở lại trên lá từ K02 tới K06. Vỏ trứng là vật mốc cố định. Vỏ trứng giúp kiểm tra góc máy không đổi giữa các ảnh.

Hai vị trí xếp theo chiều dọc. Lý do: `chain.mjs` cắt 80 px mỗi bên khi chuyển ảnh 2:3 về 9:16. Chiều dọc của khung không bị cắt.

## 4. Bảng phân cảnh

| Mục | Clip A | Clip B | Clip C | Clip D | Clip E |
|---|---|---|---|---|---|
| Độ dài render | 6 giây | 6 giây | 6 giây | 6 giây | 6 giây |
| Khung giây 0 | K01: cụm khoảng 20 trứng vàng dựng đứng | Khung cuối thật của clip A | Khung cuối thật của clip B | Khung cuối thật của clip C | Khung cuối thật của clip D |
| Diễn biến | 0–1: trứng đứng yên. 1–4: trứng nở, ấu trùng nhỏ bò ra lên vỏ trứng. 4–6: ấu trùng nằm yên trên vỏ trứng. | 0–1: ấu trùng nhỏ nằm yên. 1–3: ấu trùng nhỏ bò ra khỏi khung, 1 con bò xuống tâm lá. 3–5: con đó lớn dần thành ấu trùng đen đốm cam. 5–6: đứng yên. | 0–1: ấu trùng đứng yên. 1–4: ấu trùng gập người, bám đuôi vào lá. 4–5: thân đổi thành nhộng cam đốm đen, da cũ co lại ở đuôi. 5–6: nhộng nằm yên. | 0–1: nhộng nằm yên. 1–4: vỏ nhộng tách ở phía trước, bọ rùa vàng nhạt chui ra. 4–6: bọ rùa đứng yên trước vỏ nhộng rỗng. | 0–1: bọ rùa vàng nhạt đứng yên. 1–5: cánh cứng đậm dần sang cam rồi đỏ, 7 chấm đen hiện rõ. 5–6: đứng yên. |
| Khung giây cuối | K02: vỏ trứng rỗng màu trắng, khoảng 15 ấu trùng nhỏ màu xám đen trên vỏ | K03: 1 ấu trùng lớn đen đốm cam ở tâm khung. Vỏ trứng rỗng phía trên. | K04: 1 nhộng cam đốm đen bám vào lá, cùng vị trí | K05: bọ rùa cánh vàng nhạt, chưa có chấm, đứng trước vỏ nhộng rỗng | K06: bọ rùa cánh đỏ bóng, 7 chấm đen, cùng vị trí và tư thế |
| Thứ chuyển động | Trứng, ấu trùng nhỏ | Ấu trùng | Ấu trùng, da cũ | Vỏ nhộng, bọ rùa | Màu cánh cứng |
| Thứ đứng yên | Lá, nền, ánh sáng | Lá, vỏ trứng, nền, ánh sáng | Lá, vỏ trứng, nền, ánh sáng | Lá, vỏ trứng, nền, ánh sáng | Lá, vỏ trứng, vỏ nhộng, nền, ánh sáng, thân bọ rùa |
| Camera | Đứng yên | Đứng yên | Đứng yên | Đứng yên | Đứng yên |
| Trạng thái ở điểm nối | Ấu trùng nhỏ nằm yên | Ấu trùng lớn đứng yên | Nhộng nằm yên | Bọ rùa vàng nhạt đứng yên | Kết thúc video |

Diễn biến theo giây trong video cuối, sau khi tăng tốc 1,25:

| Giây | Nội dung |
|---|---|
| 0–4,8 | Trứng vàng nở, ấu trùng nhỏ bò ra, nằm yên trên vỏ trứng |
| 4,8–9,5 | Ấu trùng nhỏ bò đi, 1 con lớn thành ấu trùng đen đốm cam |
| 9,5–14,2 | Ấu trùng gập người, thành nhộng cam |
| 14,2–18,9 | Bọ rùa vàng nhạt chui ra khỏi nhộng |
| 18,9–23,7 | Cánh cứng chuyển đỏ, 7 chấm đen hiện ra |

## 5. Độ đúng sinh học

Phần đúng với bọ rùa bảy chấm thật:

- Trứng màu vàng, hình bầu dục dài, dựng đứng thành cụm 10–50 quả.
- Ấu trùng mới nở ở lại trên vỏ trứng khoảng 1 ngày, rồi mới bò đi.
- Ấu trùng lớn màu đen xám, có gai nhỏ và đốm cam ở hai bên thân.
- Nhộng bám đuôi vào lá. Da ấu trùng cũ co lại ở đuôi nhộng.
- Bọ rùa mới nở có cánh cứng vàng nhạt. Màu đỏ và chấm đen hiện dần trong vài giờ.
- Ấu trùng và bọ rùa mới nở đứng yên trước khi đổi giai đoạn. Điểm nối B→C và D→E dùng trạng thái này.

Phần lệch so với thực tế:

| Video | Thực tế | Lý do giữ |
|---|---|---|
| Trứng ở mặt trên lá | Bọ rùa thường đẻ ở mặt dưới lá | Camera nhìn thấy trứng rõ |
| Không có rệp | Bọ rùa đẻ trứng gần đàn rệp, ấu trùng ăn rệp | Rệp là nhiều vật nhỏ chuyển động. Veo dễ tạo vật lạ khi có nhiều vật nhỏ. |
| Ấu trùng lớn liên tục trên 1 lá | Ấu trùng lột xác 4 lần trong 2–3 tuần, đi khắp cây | Video time-lapse 23,7 giây không đủ thời gian cho 4 lần lột xác |

## 6. Prompt ảnh GPT

Bạn phải tạo cả 6 ảnh trong **cùng một cuộc chat** ChatGPT. K02–K06 là bản sửa của ảnh ngay trước.

Bạn lưu ảnh vào thư mục này với tên `K01.png` … `K06.png`. Lệnh `chain.mjs images plan.json` cũng tạo được cả 6 ảnh qua Chrome CDP.

### K01, prompt mới

```
Vertical 2:3 macro nature photo. One wide fresh green leaf lies almost flat across the middle of the frame, seen from about 45 degrees above, with clearly visible veins. Background: soft out-of-focus green garden. On the upper part of the leaf, just above the center of the frame, a small cluster of about 20 bright yellow ladybug eggs stands upright side by side. Each egg is a tiny elongated oval. The cluster is about one sixth of the frame width. The center of the leaf below the eggs is empty. Nothing else is on the leaf. Soft diffused daylight, shallow depth of field, sharp focus on the leaf surface. Keep everything important away from the left and right edges. No text, no watermark.
```

### K02, sửa K01

```
Edit this image. Keep the leaf, background, lighting and camera angle exactly the same. The eggs are now empty pale white shells, open at the top, in the same spot. About 15 tiny dark grey ladybug larvae sit on and around the empty shells. Each larva is long and thin, with six short legs.
```

### K03, sửa K02

```
Edit this image. Keep the leaf, the empty egg shells, background, lighting and camera angle exactly the same. Remove all the tiny larvae. One large seven-spot ladybug larva stands on the leaf in the center of the frame, below the empty egg shells. The larva is long and flat, dark grey-black with small spiky bumps, bright orange patches on its sides, six black legs, and a narrow tail end. Its body is about one third of the frame width long. Only one larva.
```

### K04, sửa K03

```
Edit this image. Keep the leaf, the empty egg shells, background, lighting and camera angle exactly the same. Replace the larva with one ladybug pupa attached to the leaf in the center of the frame, below the egg shells. The pupa does not look like a beetle: it has no wing cases, no legs and no visible head. It is a short hunched body, raised high at the front and low at the back, with clear ring segments across it. Its surface is matte orange with irregular black markings. The crumpled black spiky larval skin is bunched under the back end of the pupa, where it attaches to the leaf. The pupa is about one fifth of the frame width. Only one pupa.
```

Prompt K04 bản đầu tạo nhộng tròn, bóng, chấm đều, trông giống bọ rùa trưởng thành màu cam. Bản cũ lưu ở `K04_<thời điểm>.png`. Prompt trên là bản sửa ngày 2026-10-20. Bạn gửi prompt này trong một cuộc chat mới, có đính kèm K03, rồi tạo K05 và K06 trong cuộc chat mới đó.

### K05, sửa K04

```
Edit this image. Keep the leaf, the empty egg shells, background, lighting and camera angle exactly the same. The pupa is now an empty pale shell, split open at the front, in the same spot. One newly emerged ladybug stands on the leaf just in front of the empty pupa, facing the camera. Its round shiny wing cases are pale yellow with no spots. Its head and legs are black, with two white patches behind the head. The ladybug is about one fifth of the frame width.
```

### K06, sửa K05

```
Edit this image. Keep everything exactly the same, including the ladybug's position, size and pose. The ladybug's wing cases are now glossy bright red with seven round black spots: three on each wing case and one in the middle just behind the head.
```

Claude kiểm tra K06: đếm đủ 7 chấm, bọ rùa không đổi vị trí so với K05.

Bản K06 đầu tiên có 8 chấm: thừa 1 cặp chấm ở đường giữa lưng, giữa thân. Bản này lưu ở `K06_8cham.png`. Claude sửa thêm 1 lần trong cùng cuộc chat:

```
Edit this image. Keep everything exactly the same, including the leaf, egg shells, empty pupa, and the ladybug's position, size, pose, colour and all other spots. Remove only the two black spots in the middle of the ladybug's back, one on each side of the center line. After this edit the ladybug has exactly seven black spots: three on each wing case and one on the center line just above the head.
```

## 7. Prompt Flow

Prompt chuyển động của clip A–E nằm trong `plan.json`, trường `prompt`. Mỗi prompt có 1 sự kiện, khoảng 25–35 từ.

## 8. Phương án khi clip không đạt

| Clip | Lỗi dễ gặp | Cách sửa |
|---|---|---|
| B | Clip có 2 sự kiện: ấu trùng nhỏ bò đi, 1 con lớn lên. Flow có thể bỏ qua giai đoạn giữa. | Tách B thành B1 (end = K02b: 1 ấu trùng nhỏ ở tâm lá, các con khác đã đi) và B2 (lớn lên, end = K03) |
| C | Hiện cùng lúc 1 ấu trùng và 1 nhộng, rồi ấu trùng mờ dần | Giữ câu "There is only one larva." Nếu vẫn lỗi, tạo K03b: ấu trùng gập người tại chỗ, tách C thành 2 clip |
| D | Bọ rùa xuất hiện đột ngột, không có cảnh chui ra | Tách D thành D1 (end = K04b: bọ rùa chui nửa thân ra) và D2 (end = K05) |
| E | Chấm đen đổi vị trí, hoặc số chấm khác 7 | Thêm "The spots appear in place and do not move." |
| Mọi clip | Vỏ trứng đổi hình hoặc biến mất | Thêm "The empty egg shells stay still." |

## 9. Tuỳ chọn thêm

| Tuỳ chọn | Thêm gì | Chi phí thêm |
|---|---|---|
| Bọ rùa mẹ đẻ trứng ở đầu video | Clip 0: bọ rùa đỏ đứng trên lá, đẻ cụm trứng, rồi bò ra khỏi khung. Cần thêm ảnh K00. | 1 clip, 1 ảnh |
| Bọ rùa bay đi ở cuối video | Clip F, 4 giây: start = `@prev`, end = K07 (chỉ còn vỏ nhộng rỗng). Bọ rùa mở cánh cứng, xoè cánh màng, bay lên khỏi mép trên. | 1 clip, 1 ảnh |

Hai tuỳ chọn cùng dùng thì video đủ một vòng: bắt đầu bằng bọ rùa trưởng thành, kết thúc bằng bọ rùa trưởng thành.

## 10. Bước tiếp theo

1. Bạn duyệt bảng phân cảnh ở mục 4 và phần lệch sinh học ở mục 5.
2. Bạn tạo K01–K06 trong ChatGPT theo mục 6, hoặc Claude chạy `chain.mjs images`.
3. Claude kiểm tra 6 ảnh: lá, vỏ trứng, nền, góc máy, vị trí chủ thể, số chấm ở K06.
4. Claude chạy `gen plan.json A --dry-run` và báo chi phí credit.
5. Sau khi bạn đồng ý chi phí, Claude tạo clip A–E tuần tự. Claude xem khung cuối mỗi clip trước khi tạo clip sau.

## 11. Kết quả 2026-10-20

Video cuối: `bo-rua.mp4`, 23,63 giây, 1080×1920, 24 fps, giữ tiếng gốc của Flow. Bốn điểm nối ở giây 4,76 · 9,45 · 14,17 · 18,89 đều đạt khi đo, với score 0,027–0,069 và giới hạn 0,127. Claude cũng xem các ảnh `frames/seam_*.png`, và cả 4 điểm nối đều đạt khi xem bằng mắt.

| Clip | Số lần tạo | Ghi chú |
|---|---|---|
| A | 1 | Đạt |
| B | 2 | Lần 1 có nhiều dấu ✦ lấp lánh trên nền, và ấu trùng lớn hiện ra bằng chuyển cảnh mờ dần. Bản lỗi lưu ở `clips/B_20261020-071329.mp4`. Lần 2 có ấu trùng lớn dần, nhưng ấu trùng đổi tư thế đột ngột ở giây 4,2. |
| C | 1 | Đạt |
| D | 1 | Khung cuối đạt. Nhộng bật mở trong khoảng 0,2 giây. Bọ rùa có chấm ở giữa clip, rồi chấm mờ dần cho khớp với K05. |
| E | 1 | Đạt. Khung cuối có đúng 7 chấm. |

Chi phí: 60 credit, gồm 6 lần tạo × 10 credit.

Bài học:
- Khung cuối tải về từ Flow có dấu ✦ ở góc phải dưới. Khi khung này làm ảnh start, Veo vẽ thêm nhiều dấu ✦ trong clip sau. Từ 2026-10-20, `chain.mjs` xoá dấu này trước khi tải ảnh lên Flow. Phần sửa chỉ áp dụng cho khung 9:16.
- Với cảnh lá có vân nhỏ, SSIM giữa khung đầu clip sau và khung cuối clip trước chỉ đạt 0,81–0,83, dù ảnh start đúng. Ảnh start tải lên trùng với khung cuối: SSIM bằng 1,000. Flow làm nét khung đầu, nên vùng lá có SSIM 0,81, còn nền mờ có SSIM 0,97. Script vẫn báo "SAI ảnh start", nhưng đây là báo sai.
- Một clip có 2 sự kiện, ví dụ bò đi rồi lớn lên, cần prompt ghi rõ nhịp. Lần tạo lại dùng "quickly crawl away" và "slowly grows bigger and bigger", và ấu trùng lớn dần thay vì hiện ra bằng chuyển cảnh mờ dần.
- ChatGPT có ô file "Take a photo" đứng đầu trang. `gpt-image.mjs` phải gắn ảnh vào ô tải file thường, rồi chờ nút "Remove <tên file>" xuất hiện trước khi gửi prompt.
