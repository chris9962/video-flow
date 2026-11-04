# Ví dụ đã làm

Đọc file này khi cần mẫu đầy đủ: bảng phân cảnh, prompt ảnh, prompt Flow, `plan.json`.

## Ví dụ 1: bướm đêm Luna, 1 bối cảnh, 2 clip

Video mẫu: 11,08 giây, 9:16, camera đứng yên, không có điểm cắt. Sâu treo dưới cành → nhả tơ → kén trắng → kén nâu → bướm chui ra → bướm xoè cánh.

### Chọn số clip

- Thay đổi chính: 2. Sâu → kén. Kén → bướm. Kén đổi màu trắng → nâu là thay đổi phụ.
- Video cuối dài 11 giây, lớn hơn 10 giây. Phải dùng ≥ 2 clip.
- 2 clip × 8 giây = 16 giây render. Hệ số tăng tốc 16 ÷ 11 ≈ 1,45.
- Điểm nối: lúc kén nâu treo yên. Đây là lúc chủ thể đứng yên.

### Bảng phân cảnh

| Mục | Clip A | Clip B |
|---|---|---|
| Độ dài render | 8 giây | 8 giây |
| Khung giây 0 | K01: sâu xanh treo chữ J dưới cành địa y, lá khô bên cạnh | Khung cuối thật của clip A: kén nâu treo yên |
| Diễn biến | 0–3: sâu nhả tơ quấn thân. 3–5: tơ dày thành kén trắng. 5–8: kén đổi màu sang nâu, rồi đứng yên. | 0–1: kén treo yên. 1–3: đáy kén nứt. 3–5: bướm chui ra, cánh gập. 5–8: bướm xoè cánh. |
| Khung giây cuối | K02: kén nâu ở cùng vị trí, không còn lá khô | K03: bướm xoè cánh dưới vỏ kén |
| Thứ chuyển động | Sâu, tơ, kén | Vỏ kén, bướm |
| Thứ đứng yên | Cành, địa y, nền rừng, ánh sáng | Cành, địa y, nền rừng, ánh sáng |
| Camera | Đứng yên | Đứng yên |
| Trạng thái ở điểm nối | Kén nâu treo yên | Kén nâu treo yên |

### Prompt ảnh GPT

K01, prompt mới:
```
Vertical 2:3 macro nature photo. A thick tree branch covered in pale green lichen runs diagonally from the upper right to the middle left. A plump bright green luna moth caterpillar with thin yellow stripes hangs from the underside of the branch in a J shape. One dry brown leaf hangs next to the caterpillar. Background: dark out-of-focus forest with vertical tree trunks. Soft overcast light, muted green tones, shallow depth of field. Keep the caterpillar in the center with empty space above and below, and keep everything important away from the left and right edges. No text, no watermark.
```

K02, sửa K01 trong cùng cuộc chat:
```
Edit this image. Keep the branch, lichen, background, lighting and camera angle exactly the same. Replace the caterpillar with a closed oval light-brown silk cocoon hanging from the same spot under the branch. Remove the dry leaf.
```

K03, sửa K02 trong cùng cuộc chat:
```
Edit this image. Keep the branch, lichen, background, lighting, camera angle and the cocoon position exactly the same. The cocoon is now empty and open at the bottom. A luna moth hangs just below the cocoon, facing the camera, wings fully spread: pale green wings with pink-purple front edges, small eyespots, and two long curved tails. The whole moth fits inside the frame.
```

### plan.json

Prompt viết theo quy tắc ở SKILL.md bước 4: 1 hành động, khoảng 25 từ. Ví dụ này chưa chạy thật.

```json
{
  "aspect": "9:16",
  "model": "veo-3.1-fast",
  "duration": 8,
  "clips": [
    {
      "id": "A",
      "start": "K01.png",
      "end": "K02.png",
      "prompt": "Static camera. Time-lapse. The green caterpillar slowly wraps itself in silk and becomes a light-brown cocoon. The branch and background stay still. Nothing else changes."
    },
    {
      "id": "B",
      "start": "@prev",
      "end": "K03.png",
      "prompt": "Static camera. Time-lapse. A luna moth slowly crawls out of the cocoon and spreads its wings. The branch and background stay still. Nothing else changes."
    }
  ],
  "output": { "file": "luna.mp4", "speed": 1.45, "crossfade": 0.1 }
}
```

Kết quả dự kiến: (8 + 8 − 0,1) ÷ 1,45 ≈ 10,97 giây. Điểm nối ở giây ≈ 5,48.

### Nếu clip B không đạt

Clip B có 2 thay đổi lớn: bướm chui ra và bướm xoè cánh. Nếu Flow không tạo đúng, tách clip B thành 2 clip:

| Clip | Start | End |
|---|---|---|
| B1 | `@prev` | K02b: bướm cánh gập treo dưới vỏ kén |
| B2 | `@prev` | K03 |

3 clip × 8 giây = 24 giây render. Để giữ khoảng 11 giây, bạn phải tăng tốc 2,2×, lớn hơn mức đề xuất 2×. Cách khác: đặt `duration` 6 giây cho B1 và B2. Khi đó 8 + 6 + 6 = 20 giây render, tăng tốc khoảng 1,8×.

## Ví dụ 2: bướm phượng hổ vằn, nhiều bối cảnh

Video mẫu: 18,2 giây, 5 clip, 4 điểm cắt cứng. Clip 2 có bước nhảy ở giây 5,38 vì người làm nối bằng ảnh tĩnh.

### Chọn số clip

- Thay đổi chính: 5. Đẻ trứng. Trứng nở. Sâu lớn. Hoá nhộng. Bướm ra.
- Bối cảnh: 3. Mặt lá. Cành cây. Chùm hoa tím.
- Mỗi clip 1–2 thay đổi, nên cần ≥ 3 clip. Mỗi lần đổi bối cảnh cần một clip mới. Kết quả: 5 clip, giống video mẫu.

### Hai cách đổi bối cảnh

| Cách | Làm thế nào | Kết quả |
|---|---|---|
| Cắt cứng | Clip mới bắt đầu từ ảnh khung của bối cảnh mới | Đơn giản. Người xem thấy điểm cắt. Video mẫu dùng cách này. |
| Clip nối | Thêm 1 clip có camera di chuyển giữa 2 bối cảnh. Start là khung cuối thật của clip trước. End là ảnh khung của bối cảnh mới. | Liền mạch. Tốn thêm 1 clip cho mỗi lần đổi bối cảnh. |

Prompt clip nối mẫu, từ mặt lá sang cành cây:
```
Single continuous camera move, no cuts. The camera slowly follows the large caterpillar as it crawls off the edge of the leaf and onto a thin woody stem nearby. The camera glides smoothly to keep the caterpillar centered. In the final second, the caterpillar rests still on the stem and the camera stops moving.
```

Với clip nối, camera di chuyển bên trong clip. Ở hai đầu clip, camera phải đứng yên, để khớp với clip trước và clip sau có camera đứng yên.

## Ví dụ 3: vòng đời muỗi nhà Culex, đã làm thật 2026-10-17

Thư mục: `~/video-flow/dong-vat/muoi/`. Video cuối 14,83 giây, 3 clip, 2 điểm nối đều đạt khi đo và khi xem từng khung.

### Bối cảnh

Camera ngang mặt nước, nhìn qua thành kính bể nước mưa. Mặt nước nằm ngang ở giữa khung. Muỗi Culex đẻ bè trứng nổi, nên cả 4 giai đoạn diễn ra ở mặt nước và video không đổi bối cảnh.

### Ảnh khung

4 ảnh GPT, cùng một cuộc chat. K02–K04 bắt đầu bằng "Edit this image." Cả 4 ảnh giữ đúng mặt nước, nền và góc máy.

| Ảnh | Nội dung |
|---|---|
| K01 | Bè trứng nâu sẫm nổi ở giữa |
| K02 | 3 lăng quăng treo đầu xuống, con giữa rõ nét |
| K03 | Con giữa thành cung quăng hình dấu phẩy |
| K04 | Muỗi đứng trên mặt nước, ngay trên vỏ cung quăng rỗng |

### Clip đã dùng

| Clip | Độ dài | Số lần tạo | Prompt |
|---|---|---|---|
| A | 8 giây, `trimStart` 1,25 | 1 | Prompt dài 95 từ: bè nở, bè trôi đi, lăng quăng lớn dần, treo yên |
| B | 6 giây | 4 | `Static camera. Time-lapse. The middle larva slowly curls up and turns into a pupa. The other two larvae stay still. Nothing else changes.` |
| C | 6 giây | 1 | `Static camera. Time-lapse. An adult mosquito slowly climbs out of the pupa and stands on the water. The other two larvae stay still. Nothing else changes.` |

Ghép: crossfade 0,1 giây, tăng tốc 1,25×.

### Các lần tạo clip B không đạt

| Lần | Lỗi | Nguyên nhân |
|---|---|---|
| 1 | Viền đen 5,8 giây đầu. Cung quăng thẳng như nhộng bọ cánh cứng. Côn trùng lạ bay ở giây 6. Cung quăng đổi hình ở 0,8 giây cuối. | Ảnh start là K02 bản 2:3. Prompt 6 sự kiện. |
| 2 | Viền đen thu nhỏ dần. Lớp da hình chữ V bọc khối tròn đen. Nước bắn. | Ảnh start là K02 bản 2:3. Prompt 125 từ, 6 sự kiện. |
| 3 | Nội dung đạt. Ở điểm nối, 2 lăng quăng lệch 8% chiều rộng khung, hiện 2 hình chồng. | Ảnh start là K02 bản 9:16, chọn từ thư viện Flow. SSIM 0,84. `check` vẫn báo đạt với score 0,043. |
| 4 | Đạt | Project Flow mới, ảnh start là khung cuối clip A, SSIM 0,93. Prompt 22 từ. |
