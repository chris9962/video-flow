# Vòng đời con muỗi — kịch bản và prompt

Ngày viết: 2026-10-17. Skill dùng: `flow-chain-video`.

K là viết tắt của keyframe (ảnh khung). K01–K04 là 4 ảnh tĩnh do GPT tạo.

## 1. Thông số

| Mục | Giá trị |
|---|---|
| Loài | Muỗi nhà Culex |
| Tỉ lệ | 9:16 |
| Số clip Flow | 3 |
| Số ảnh GPT | 4: K01, K02, K03, K04 |
| Model | Veo 3.1 Fast, một model cho cả chuỗi |
| Độ dài mỗi clip | 8 giây |
| Tổng render | 24 giây |
| Hệ số tăng tốc | 1,5 |
| Crossfade | 0,1 giây ở mỗi điểm nối |
| Video cuối | khoảng 15,9 giây, không có âm thanh |
| Điểm nối | giây 5,3 và giây 10,6 |

## 2. Lý do chọn

- Muỗi nhà Culex đẻ trứng thành bè nổi trên mặt nước. Cả 4 giai đoạn diễn ra ở mặt nước. Vì vậy video giữ một bối cảnh và camera đứng yên từ đầu tới cuối.
- Muỗi vằn Aedes đẻ trứng rời trên thành vật chứa, phía trên mặt nước. Nếu dùng muỗi vằn, video phải đổi bối cảnh.
- Video có 3 thay đổi chính: trứng → lăng quăng, lăng quăng → cung quăng, cung quăng → muỗi. Lăng quăng (bọ gậy) là ấu trùng. Cung quăng là nhộng.
- Hơn 2 thay đổi chính, nên video cần nhiều clip. Mỗi clip chứa 1–2 thay đổi chính.

## 3. Góc máy

Camera đặt ngang mặt nước, nhìn qua thành kính của một bể nhỏ chứa nước mưa.

- Mặt nước là một đường ngang ở giữa khung.
- Nửa trên là không khí, nền lá xanh mờ.
- Nửa dưới là nước trong, nền nâu ô liu tối.

Bè trứng nằm trên đường mặt nước. Lăng quăng và cung quăng treo ngay dưới mặt nước. Muỗi chui lên nửa trên. Vì vậy mọi giai đoạn nằm ở giữa khung.

## 4. Bảng phân cảnh

| Mục | Clip A | Clip B | Clip C |
|---|---|---|---|
| Độ dài render | 8 giây | 8 giây | 8 giây |
| Khung giây 0 | K01: bè trứng nâu sẫm nổi ở giữa | Khung cuối thật của clip A | Khung cuối thật của clip B |
| Diễn biến | 0–1: bè trứng nổi yên. 1–3: lăng quăng nhỏ nở từ đáy bè, ngoe nguẩy xuống nước. 3–7: bè rỗng trôi ra mép trái. Lăng quăng lớn dần. 7–8: lăng quăng treo yên. | 0–1: lăng quăng treo yên. 1–3: con ở giữa lặn xuống rồi bơi lên. 3–6: da nứt sau đầu, cung quăng chui ra. Da cũ chìm xuống. 6–8: cung quăng nằm yên. | 0–1: cung quăng nằm yên. 1–2: cung quăng duỗi đuôi, nằm ngang dưới mặt nước. 2–5: vỏ nứt ở lưng, muỗi chui đầu và ngực lên không khí. 5–7: muỗi rút chân và thân ra, đứng trên vỏ rỗng. 7–8: muỗi đứng yên. |
| Khung giây cuối | K02: 3 lăng quăng treo đầu xuống, ống thở chạm mặt nước. Không còn bè trứng. | K03: cung quăng hình dấu phẩy ở giữa. 2 lăng quăng mờ hai bên. | K04: muỗi đứng trên mặt nước, ngay trên vỏ nhộng rỗng |
| Thứ chuyển động | Lăng quăng, bè trứng | Lăng quăng ở giữa, da cũ | Cung quăng, muỗi |
| Thứ đứng yên | Mặt nước, nền, ánh sáng | Mặt nước, nền, ánh sáng, 2 lăng quăng hai bên | Mặt nước, nền, ánh sáng, 2 lăng quăng hai bên |
| Camera | Đứng yên | Đứng yên | Đứng yên |
| Trạng thái ở điểm nối | Lăng quăng treo yên | Cung quăng nằm yên | Kết thúc video |

Diễn biến theo giây trong video cuối, sau khi tăng tốc 1,5:

| Giây | Nội dung |
|---|---|
| 0–2,0 | Bè trứng nổi yên, lăng quăng nở |
| 2,0–5,3 | Bè trôi đi, lăng quăng lớn dần, treo yên |
| 5,3–7,3 | Lăng quăng ở giữa lặn xuống, bơi lên |
| 7,3–10,6 | Lột da thành cung quăng, cung quăng nằm yên |
| 10,6–13,3 | Cung quăng duỗi đuôi, vỏ nứt, muỗi chui ra |
| 13,3–15,9 | Muỗi đứng trên vỏ rỗng, duỗi cánh, đứng yên |

## 5. Prompt ảnh GPT

Bạn phải tạo cả 4 ảnh trong **cùng một cuộc chat** ChatGPT. K02–K04 là bản sửa của ảnh ngay trước.

Bạn lưu ảnh vào thư mục này với tên `K01.png`, `K02.png`, `K03.png`, `K04.png`.

### K01, prompt mới

```
Vertical 2:3 macro photo, split-level view exactly at the water line, shot through the clear glass wall of a small tank of still rainwater. The water line runs horizontally across the middle of the frame. Upper half: air above the water, soft out-of-focus green leaves. Lower half: clear water with a dark olive-brown background and a few tiny floating particles. In the center, a small dark brown boat-shaped mosquito egg raft floats on the water surface. The raft is made of about 200 tiny upright eggs packed side by side, and it is about one quarter of the frame width. Nothing else is in the water. Soft diffused daylight from above. Sharp focus on the egg raft, shallow depth of field. Keep the raft in the center, and keep everything important away from the left and right edges. No text, no watermark.
```

### K02, sửa K01

```
Edit this image. Keep the tank, water line, background, lighting and camera angle exactly the same. Remove the egg raft. Add three mosquito larvae that hang head-down just below the water surface. Each larva has a dark rounded head, a wider hairy thorax, a thin segmented grey-brown body, and a breathing tube at the tail end. The breathing tube touches the water surface, and the body hangs down at an angle. The middle larva is in sharp focus at the center of the frame, and its body is about one third of the frame width long. The other two larvae are smaller and slightly out of focus, to the left and right of the middle larva.
```

### K03, sửa K02

```
Edit this image. Keep the tank, water line, background, lighting, camera angle and the two out-of-focus larvae exactly the same. Replace the middle larva with a mosquito pupa at the same spot, resting just below the water surface. The pupa is comma-shaped: a large rounded dark brown head-and-thorax part, with a curled segmented tail below it that ends in two small flat paddles. Two short breathing tubes on top of the pupa touch the water surface.
```

### K04, sửa K03

```
Edit this image. Keep the tank, water line, background, lighting, camera angle and the two out-of-focus larvae exactly the same. The pupa is now an empty, see-through pupal skin that floats flat at the water surface in the same spot, split open along the top. A newly emerged adult house mosquito stands on the water surface just above the empty pupal skin, in the air half of the frame. The mosquito has a slender pale brown body, six long thin legs that rest on the water surface, two clear narrow wings folded flat over its back, and thin antennae. The whole mosquito fits inside the frame, away from the left and right edges.
```

## 6. Prompt Flow

Prompt chuyển động của clip A, B, C nằm trong `plan.json`, trường `prompt`.

## 7. Phương án khi clip không đạt

| Clip | Lỗi dễ gặp | Cách sửa |
|---|---|---|
| A | Flow bỏ qua giai đoạn lăng quăng nhỏ, vì clip có 2 thay đổi chính: nở và lớn | Tách A thành A1 (nở, end = K02a: nhiều lăng quăng nhỏ) và A2 (lớn, end = K02) |
| A | Bè trứng biến mất đột ngột | Giữ câu "The empty raft slowly drifts out of the frame to the left." Nếu vẫn lỗi, giữ bè rỗng trong K02–K04 ở mép trái. |
| C | Muỗi xuất hiện đột ngột, không có cảnh chui ra | Tách C thành C1 (end = K03b: muỗi chui nửa thân ra) và C2 (end = K04) |
| Mọi clip | Mặt nước rung hoặc đổi độ cao | Thêm "The water line stays perfectly flat and at the same height." vào prompt |

## 8. Tuỳ chọn thêm

| Tuỳ chọn | Thêm gì | Chi phí thêm |
|---|---|---|
| Muỗi cái đẻ trứng ở đầu video | Clip 0: muỗi cái đứng trên mặt nước, đẻ bè trứng, rồi bay đi. Cần thêm 1 ảnh K00. | 1 clip, 1 ảnh |
| Muỗi bay đi ở cuối video | Clip D, 4 giây: start = `@prev`, không có ảnh end, muỗi bay lên khỏi mép trên | 1 clip |

Hai tuỳ chọn cùng dùng thì video đủ một vòng: bắt đầu bằng muỗi trưởng thành, kết thúc bằng muỗi trưởng thành.

## 9. Bước tiếp theo

1. Bạn duyệt bảng phân cảnh ở mục 4.
2. Bạn tạo K01–K04 trong ChatGPT theo mục 5.
3. Claude kiểm tra 4 ảnh: mặt nước, nền, góc máy, vị trí chủ thể.
4. Claude chạy `gen plan.json A --dry-run` và báo chi phí credit.
5. Sau khi bạn đồng ý chi phí, Claude tạo clip A, B, C tuần tự.

## 10. Kết quả 2026-10-17

Video cuối: `muoi.mp4`, 14,83 giây, 1080×1920, 24 fps, không có âm thanh. Hai điểm nối ở giây 5,36 và 10,08 đều đạt (score 0,010 và 0,007).

| Clip | File Flow | Độ dài dùng | Ghi chú |
|---|---|---|---|
| A | `clips/A_flow-goc.mp4` | 6,75 giây | Cắt bỏ 1,25 giây đầu có viền đen |
| B | `clips/B.mp4` | 6 giây | Lần tạo thứ 4. Ba lần lỗi nằm ở `clips/loi/`. |
| C | `clips/C.mp4` | 6 giây | Lần tạo thứ 1 |

Hệ số tăng tốc đổi từ 1,5 sang 1,25, vì clip B và clip C ngắn hơn kế hoạch ở mục 1.

Prompt clip B và clip C trong `plan.json` là bản rút gọn: 1 sự kiện, khoảng 25 từ. Prompt dài ở mục 4 cho kết quả khó hiểu.

Bài học:
- Ảnh tải lên Flow phải là bản 9:16. Ảnh 2:3 làm Flow thêm viền đen rồi cắt cảnh giữa clip.
- Mỗi clip nên tạo trong project Flow mới, để không chọn nhầm ảnh cũ trong thư viện.
- Prompt ngắn, 1 sự kiện, độ dài 6 giây cho kết quả đúng hơn prompt dài, 8 giây.
- Lệnh `check` không phát hiện chủ thể nhỏ bị lệch ở điểm nối. Phải xem khung quanh điểm nối bằng mắt.
