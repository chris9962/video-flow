# Vòng đời bướm phượng chanh — kịch bản và prompt

Ngày viết: 2026-10-21. Skill dùng: `flow-chain-video`.

K là viết tắt của keyframe (ảnh khung). K01–K06 là 6 ảnh tĩnh do GPT tạo.

## 1. Thông số

| Mục | Giá trị |
|---|---|
| Loài | Bướm phượng chanh, *Papilio demoleus* |
| Tỉ lệ | 9:16 |
| Số clip Flow | 5: A, B, C, D, E |
| Số ảnh GPT | 6: K01–K06, tạo mới, không dùng ảnh của video bướm vua |
| Model | `omni-flash` |
| Độ dài mỗi clip | 6 giây |
| Hệ số tăng tốc | 1,25 |
| Video cuối | khoảng 23,7 giây |

## 2. Góc máy

Camera nhìn xuống một lá chanh, góc khoảng 45 độ, và đứng yên suốt video. Trứng nằm ở nửa trên của lá, phía trên tâm khung. Sâu lớn, nhộng và bướm nằm ở tâm khung, phía dưới vỏ trứng. Vỏ trứng là vật mốc cố định từ K02 tới K06.

## 3. Bảng phân cảnh

| Clip | Ảnh start | Diễn biến | Ảnh end | Trạng thái ở điểm nối |
|---|---|---|---|---|
| A | K01: 1 trứng vàng nhạt | Trứng nở, sâu non bò ra | K02: sâu non nâu trắng giống phân chim, cạnh vỏ trứng | Sâu non nằm yên |
| B | Khung cuối của A | Sâu bò xuống tâm lá, lớn dần, đổi sang xanh | K03: sâu lớn xanh lá, có đốm mắt giả | Sâu nằm yên |
| C | Khung cuối của B | Sâu co lại thành nhộng tại chỗ | K04: nhộng xanh, có đai tơ | Nhộng đứng yên |
| D | Khung cuối của C | Vỏ nhộng tách, bướm chui ra | K05: bướm cánh nhăn bám vào vỏ nhộng | Bướm đứng yên |
| E | Khung cuối của D | Cánh bướm nở ra, phẳng dần | K06: bướm xoè cánh đen vàng | Kết thúc video |

## 4. Độ đúng sinh học

Phần đúng với bướm phượng chanh thật:
- Bướm đẻ từng trứng riêng lẻ trên lá cây họ cam chanh.
- Sâu tuổi nhỏ màu nâu có vệt trắng, giống phân chim. Sâu tuổi cuối màu xanh, có đốm mắt giả.
- Nhộng có đai tơ quanh thân, màu xanh hoặc nâu.
- Bướm phượng chanh không có đuôi ở cánh sau.

Phần lệch so với thực tế:

| Video | Thực tế | Lý do giữ |
|---|---|---|
| Sâu lớn và hoá nhộng trên cùng 1 lá | Sâu ăn hết nhiều lá, thường hoá nhộng trên cành | Giữ 1 bối cảnh và camera đứng yên |
| Sâu đổi màu dần | Sâu đổi màu sau 1 lần lột xác | Lột xác có nhiều bước nhỏ, model dễ tạo hình khó hiểu |

## 5. Prompt

Prompt ảnh GPT và prompt Flow nằm trong `plan.json`. Prompt Flow dùng mẫu ngày 2026-10-21 trong skill, gồm 2 câu chưa kiểm chứng:
- "In a single continuous shot, no scene cuts."
- "Quiet natural ambience, no music, no dialogue."

Video này là lần thử đầu của 2 câu đó.

## 6. Kết quả 2026-10-21

Video cuối: `buom-phuong.mp4`, 23,63 giây, 1080×1920, giữ tiếng gốc của Flow. Bốn điểm nối ở giây 4,76 · 9,48 · 14,2 · 18,92 đều đạt, với score 0,019–0,064. Claude xem các ảnh `frames/seam_*.png`, và không điểm nối nào có hình chồng.

| Clip | Số lần tạo | Ghi chú |
|---|---|---|
| A | 1 | Đạt |
| B | 1 | Sâu nâu chuyển sang sâu xanh bằng hoà hình khoảng 0,5 giây ở giây 3,5–4 của clip |
| C | 1 | Sâu cong người rồi thành nhộng, hoà hình khoảng 0,3 giây |
| D | 1 | Đạt. 2 lần chạy trước dừng ở bước tải ảnh start, chưa tạo video, không tốn credit. |
| E | 1 | Cánh có đuôi nhỏ ở giữa clip, đuôi biến mất ở giây 4,5–4,75 để khớp K06 |

Chi phí: 50 credit, gồm 5 lần tạo × 10 credit.

Bài học:
- ChatGPT trả 2 ảnh và hỏi "Which image do you like more?" ở K01. Từ 2026-10-21, `gpt-image.mjs` tự chọn ảnh 1.
- K06 lần đầu có đầu cánh phải chạm mép sau khi cắt 9:16. Claude tạo lại K06 với sải cánh bằng nửa chiều rộng khung.
- `flow.mjs` từ 2026-10-21 lấy mã ảnh từ hộp thoại khi Flow không trả response tải ảnh.
