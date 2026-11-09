---
name: animal-macro-photo
description: Tạo ảnh macro siêu thực của một loài động vật trên ChatGPT, theo mẫu prompt của người dùng. Ảnh cận cảnh, nền đen, ánh sáng studio, kiểu National Geographic. Dùng khi người dùng muốn "ảnh siêu thực", "ảnh macro", "ảnh đẹp", "ảnh cận cảnh" của một con vật, cần ảnh minh hoạ cho bài viết về một loài, hoặc gửi tên loài và muốn có ảnh chi tiết, kể cả khi không nhắc tên skill. Không dùng cho ảnh khung K của video vòng đời: việc đó thuộc skill flow-chain-video.
---

# animal-macro-photo

Skill này tạo ảnh macro siêu thực của một loài động vật bằng ChatGPT. Người dùng gửi mẫu prompt ngày 2026-11-09.

Ảnh dùng cho 2 việc:
- Ảnh đẹp để đăng riêng.
- Ảnh minh hoạ cho bài viết về một loài.

Trả lời người dùng bằng tiếng Việt. Prompt cho GPT viết bằng tiếng Anh.

## Mẫu prompt gốc

Nguyên văn của người dùng. Claude giữ mẫu này, chỉ thay các phần ở mục "Cách điền mẫu".

```
Ultra-realistic extreme macro photography of sâu xanh, captured in a dramatic side-profile close-up, showcasing extraordinary microscopic details of its anatomy. Extremely detailed exoskeleton texture, compound eyes, segmented antennae, powerful mandibles, fine body hairs, intricate body segments, and naturally jointed legs. The insect is positioned on a piece of rough, weathered tree bark.

Deep pure black background, dramatic cinematic studio lighting, subtle warm highlights, deep shadows, high contrast, razor-sharp focus on the insect's head and eyes, shallow depth of field, professional focus stacking, photorealistic biological details, natural colors and textures, dark wildlife aesthetic, National Geographic macro photography style, 8K ultra-high resolution, premium scientific macro photography, shot with a professional macro lens,  extreme detail, no text, no watermark.
```

Mẫu có 2 đoạn:

| Đoạn | Nội dung | Claude làm gì |
|---|---|---|
| 1 | Chủ thể, đặc điểm cơ thể, nơi đậu | Thay theo loài |
| 2 | Nền, ánh sáng, máy ảnh, phong cách | Giữ nguyên |

## Cách điền mẫu

1. Claude thay `sâu xanh` bằng tên tiếng Anh kèm tên khoa học. Ví dụ: `a cotton bollworm caterpillar (Helicoverpa armigera)`. Lý do: tên tiếng Việt như "sâu xanh" chỉ nhiều loài khác nhau.
2. Claude thay câu đặc điểm cơ thể bằng đặc điểm thật của loài. Câu trong mẫu chỉ đúng với côn trùng trưởng thành.
3. Claude thay chữ `insect` ở 2 chỗ bằng tên nhóm đúng, ví dụ `caterpillar`, `fish`, `snail`, `frog`.
4. Claude thay nơi đậu `rough, weathered tree bark` bằng nơi sống thật của loài, ví dụ lá cây, mặt bùn, đá ướt.
5. Claude thêm khổ ảnh vào cuối đoạn 1, theo nơi dùng ảnh. Mẫu gốc không ghi khổ ảnh.

| Nơi dùng | Câu thêm vào prompt |
|---|---|
| Reels, Shorts, Tin | `Vertical 2:3 portrait format.` |
| Bài viết, ảnh bìa | `Horizontal 3:2 landscape format.` |
| Bài đăng vuông | `Square 1:1 format.` |

### Đặc điểm cơ thể đúng loài

Trước khi viết câu đặc điểm, Claude xem ảnh thật của loài trên Google:

```bash
node ~/.claude/skills/flow-chain-video/scripts/anh-google.mjs <thư mục làm việc>/google "<tên khoa học>" "<tên khoa học> close up"
```

Claude ghi 5–7 đặc điểm thấy được trên nhiều ảnh chụp thật: màu, hoa văn, mắt, râu, chân, lông, vảy. Claude chỉ tin chi tiết lặp lại ở nhiều ảnh chụp thật, không tin hình vẽ hay ảnh AI.

Ví dụ chỗ dễ sai, chính là mẫu gốc: sâu xanh là sâu non, không phải côn trùng trưởng thành.

| Mẫu gốc ghi | Sâu non thật có |
|---|---|
| `compound eyes` | 6 mắt đơn nhỏ mỗi bên đầu (`stemmata`) |
| `segmented antennae` | Râu rất ngắn |
| `naturally jointed legs` | 3 đôi chân thật ở ngực và các chân giả mập ở bụng (`prolegs`) |
| `exoskeleton texture` | Da mềm, có lỗ thở dọc 2 bên thân (`spiracles`) |

Nếu prompt giữ câu đặc điểm của côn trùng trưởng thành, GPT có thể vẽ sâu non có mắt kép và râu dài.

## Tạo ảnh

Cảnh báo: Chrome CDP phải đang chạy, cổng 9222, và Chrome phải đăng nhập ChatGPT. Gói Free giới hạn số ảnh mỗi ngày.

Claude lưu ảnh vào thư mục của loài: `~/video-flow/dong-vat/<tên không dấu>/anh-macro/`. `.gitignore` không đưa ảnh trong `dong-vat/` lên git.

1. Claude ghi prompt đã điền vào `anh-macro/prompt-<tên ảnh>.txt`.
2. Claude tạo ảnh đầu tiên trong cuộc chat mới:
   ```bash
   node ~/.claude/skills/flow-chain-video/scripts/gpt-image.mjs --prompt "$(cat prompt-01.txt)" --out 01.png
   ```
3. Script in URL cuộc chat ở dòng `Cuộc chat: <url>`. Claude ghi URL này vào `anh-macro/gpt-chat.txt`.
4. Ảnh tiếp theo cùng loài và cùng phong cách: Claude gửi vào cùng cuộc chat bằng `--chat <url>`.
5. Mỗi ảnh mất khoảng 25–45 giây.

Nếu script dừng giữa chừng mà ChatGPT đã tạo xong ảnh, Claude lưu ảnh bằng `--save-last --chat <url> --out <file.png>`.

## Kiểm tra ảnh

Claude mở từng ảnh và so với ảnh thật đã xem:
- Đặc điểm cơ thể đúng loài: số chân, mắt, râu, màu, hoa văn.
- Ảnh không có chữ, không có watermark.
- Đầu và mắt nét.

Lỗi nhỏ thì Claude giữ ảnh, không tạo lại. Claude báo lỗi lớn cho người dùng trước khi tạo lại.

## Ảnh cho bài viết về một loài

1. Claude chia bài thành các mục, ví dụ: hình dạng, bộ phận đặc biệt, thức ăn, giai đoạn sống.
2. Mỗi mục có 1 ảnh. Ảnh tả đúng chi tiết mà mục đó nói tới.
3. Với ảnh hành vi, ví dụ ăn mồi, Claude thay câu nơi đậu bằng câu tả hành vi.
4. Claude tạo mọi ảnh của 1 bài trong cùng 1 cuộc chat, để màu và ánh sáng giống nhau.

Nếu người dùng chưa nói ai viết lời bài, Claude hỏi người dùng trước khi viết.
