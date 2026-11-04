# Vòng đời ong mật — kịch bản và prompt

Ngày viết: 2026-10-21. Skill dùng: `flow-chain-video`.

K là viết tắt của keyframe (ảnh khung). K01–K06 là 6 ảnh tĩnh do GPT tạo.

## 1. Thông số

| Mục | Giá trị |
|---|---|
| Loài | Ong mật phương Tây, *Apis mellifera*, ong thợ |
| Tỉ lệ | 9:16 |
| Số clip Flow | 5: A, B, C, D, E |
| Số ảnh GPT | 6: K01–K06 |
| Model | `omni-flash`, một model cho cả chuỗi |
| Độ dài mỗi clip | 6 giây |
| Hệ số tăng tốc | 1,25 |
| Crossfade | 0,1 giây ở mỗi điểm nối |
| Video cuối | khoảng 23,7 giây, giữ tiếng gốc của Flow |

## 2. Góc máy

Camera nhìn thẳng vào mặt bánh tổ ong, hơi chếch từ trên xuống, và đứng yên suốt video.

- Các ô sáp lục giác màu vàng phủ kín khung.
- Ô chính nằm ở tâm khung, rộng khoảng 1/4 chiều rộng ảnh.
- Các ô xung quanh rỗng. Các ô này là vật mốc để kiểm tra góc máy giữa các ảnh.

## 3. Bảng phân cảnh

| Clip | Ảnh start | Diễn biến | Ảnh end | Trạng thái ở điểm nối |
|---|---|---|---|---|
| A | K01: 1 trứng trắng dựng đứng ở đáy ô chính | Trứng nở thành ấu trùng nhỏ | K02: ấu trùng nhỏ cong chữ C trong sữa ong chúa | Ấu trùng nằm yên |
| B | Khung cuối của A | Ấu trùng lớn dần | K03: ấu trùng lớn trắng bóng, lấp đầy đáy ô | Ấu trùng nằm yên |
| C | Khung cuối của B | Nắp sáp mọc từ mép ô vào giữa | K04: ô chính bịt nắp sáp nâu nhạt | Nắp đứng yên |
| D | Khung cuối của C | Ong non cắn thủng nắp, thò đầu ra | K05: đầu ong thò ra khỏi lỗ trên nắp | Đầu ong đứng yên |
| E | Khung cuối của D | Ong non bò ra khỏi ô | K06: ong đứng trên bánh tổ, ngay dưới ô rỗng | Kết thúc video |

Camera đứng yên ở cả 5 clip. Bánh tổ, các ô xung quanh và ánh sáng không đổi.

## 4. Độ đúng sinh học

Phần đúng với ong thợ thật:

- Ong chúa đẻ 1 trứng vào đáy mỗi ô. Trứng dựng đứng, nở sau khoảng 3 ngày.
- Ấu trùng nằm cong chữ C trong sữa ong chúa, lớn khoảng 6 ngày.
- Ong thợ bịt ô bằng nắp sáp vào khoảng ngày 9. Ấu trùng hoá nhộng dưới nắp.
- Ong non tự cắn nắp, chui ra vào khoảng ngày 21.

Phần lệch so với thực tế:

| Video | Thực tế | Lý do giữ |
|---|---|---|
| Không có ong thợ chăm ấu trùng và xây nắp | Ong thợ cho ấu trùng ăn và xây nắp sáp | Nhiều ong chuyển động làm Veo dễ tạo vật lạ |
| Các ô xung quanh rỗng | Ong chúa đẻ kín một vùng ô liền nhau | Veo giữ ổn định một chủ thể dễ hơn nhiều chủ thể |
| Không thấy nhộng | Nhộng nằm dưới nắp sáp 12 ngày | Camera nhìn từ phía trước, nắp che nhộng |

## 5. Prompt

Prompt ảnh GPT và prompt Flow nằm trong `plan.json`, trường `keyframes[].prompt` và `clips[].prompt`.

## 6. Phương án khi clip không đạt

| Clip | Lỗi dễ gặp | Cách sửa |
|---|---|---|
| C | Nắp hiện ra bằng chuyển cảnh mờ dần | Ghi rõ nhịp: "slowly grows inward from the rim, little by little" |
| D | Đầu ong hiện ra đột ngột | Tách D thành D1 (nắp có lỗ nhỏ) và D2 (đầu ong thò ra) |
| E | Ong to lên hoặc nhỏ đi khi bò ra | Thêm "The bee keeps the same size." |
| Mọi clip | Ô xung quanh có trứng hoặc ong lạ | Giữ câu "The other cells stay empty." |

## 7. Kết quả 2026-10-21

Video cuối: `ong.mp4`, 23,67 giây, 1080×1920, giữ tiếng gốc của Flow. Bốn điểm nối ở giây 4,76 · 9,48 · 14,2 · 18,92 đều đạt khi đo, với score 0,012–0,022 và giới hạn 0,070. Claude cũng xem các ảnh `frames/seam_*.png`, và không điểm nối nào có hình chồng.

| Clip | Số lần tạo | Ghi chú |
|---|---|---|
| A | 1 | Đạt. Script báo lỗi khi tải file. Claude tải lại bằng `flow.mjs --project`. |
| B | 1 | Đạt. Lần chạy đầu dừng ở bước tải ảnh start lên, trước khi Flow tạo video, nên không tốn credit. |
| C | 1 | Đạt. Nắp sáp mọc từ mép ô vào giữa. |
| D | 1 | Đạt. Râu ong xuyên qua nắp trước, rồi đầu ong thò ra. |
| E | 1 | Đạt |

Chi phí: 50 credit, gồm 5 lần tạo × 10 credit.

Bài học:
- `gpt-image.mjs` không nhận ra K06 đã xong: trang ChatGPT chỉ còn 1 nút "Edit generated image" sau khi tải lại. Claude lưu K06 thẳng từ trang.
- Một kết nối Playwright thứ hai tới Chrome CDP đổi thư mục tải của Chrome. Nếu kết nối này mở trong lúc `flow.mjs` tải video, script báo lỗi `download.saveAs: ENOENT`. Khi Flow đang chạy, Claude chỉ đọc log.
- Báo sai SSIM ở mọi điểm nối, 0,833–0,859, giống video bọ rùa.
