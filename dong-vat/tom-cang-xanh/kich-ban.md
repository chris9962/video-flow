# Vòng đời tôm càng xanh — kịch bản

Ngày viết: 2026-10-31. Skill dùng: `flow-chain-video`. Loài: tôm càng xanh, tên tiếng Anh giant freshwater prawn, *Macrobrachium rosenbergii*.

K là viết tắt của keyframe (ảnh khung). K01–K06 là 6 ảnh tĩnh do GPT tạo.

## 1. Thông số

| Mục | Giá trị |
|---|---|
| Số clip Flow | 5: A–E, mỗi clip 6 giây, `omni-flash` |
| Cách tạo clip | Song song, mỗi clip dùng 2 ảnh K làm ảnh start và ảnh end |
| Hệ số tăng tốc | 1,3 |
| Crossfade | 0,25 giây |
| Video cuối | khoảng 22 giây |
| Góc máy | Dưới nước, sát đáy bùn của kênh rạch miền Tây. Nước hơi đục màu xanh lục. Rễ cây và lá mục ở nền. |
| Tư thế tôm | Nhìn ngang, đầu quay sang trái, thân hơi chéo |

## 2. Bảng phân cảnh

| Clip | Ảnh start → ảnh end | Diễn biến |
|---|---|---|
| A | K01 → K02 | Tôm mẹ đứng yên. Khối trứng dưới bụng đổi từ cam sáng sang xám đậm, mỗi trứng hiện chấm mắt đen. |
| B | K02 → K03 | Trứng nở. Hàng trăm ấu trùng trong suốt bơi ra khỏi bụng mẹ, bơi ngửa và đuôi đi trước. |
| C | K03 → K04 | Tôm mẹ bò ra khỏi khung. Ấu trùng trôi đi. Một ấu trùng ở giữa đáp xuống bùn và thành tôm bột. |
| D | K04 → K05 | Tôm bột lớn dần thành tôm con có sọc mờ. |
| E | K05 → K06 | Tôm con lớn thành tôm đực trưởng thành. Hai càng dài dần và chuyển xanh dương. |

## 3. Chi tiết hình ảnh theo tài liệu

- Tôm mẹ ôm trứng dưới bụng, giữa các chân bơi. Trứng hơi bầu dục.
- Trứng màu cam cho tới 2–3 ngày trước khi nở, rồi chuyển xám đen.
- Ấu trùng mới nở bơi ngửa, đuôi đi trước.
- Ấu trùng chỉ sống được trong nước lợ. Tôm mẹ đi xuống cửa sông để trứng nở.
- Tôm bột có hình một con tôm nhỏ, trong suốt, đầu có thể màu cam hồng nhạt. Tôm bột bơi lưng hướng lên.
- Tôm con dần có màu xanh dương đến nâu của tôm trưởng thành.
- Tôm đực trưởng thành có đôi càng thứ hai rất dài, màu xanh dương.

Đơn giản hoá: ngoài thực tế, ấu trùng trôi ra cửa sông nước lợ, rồi tôm bột bơi ngược về nước ngọt. Video giữ một bối cảnh duy nhất.

Nguồn:
- https://www.fao.org/fishery/docs/CDrom/aquaculture/I1129m/file/en/en_giantriverprawn.htm
- https://www.fao.org/docrep/pdf/006/ad530e/ad530e01.pdf
- https://www.srac.msstate.edu/pdfs/Fact%20Sheets/483%20Biology%20and%20Life%20History%20of%20Freshwater%20Prawns.pdf

## 4. Chỗ dễ sai khi tạo

- Trứng phải nằm dưới bụng tôm mẹ. GPT có thể vẽ trứng rời trên bùn.
- Clip C có 2 sự kiện và 1 lần đổi hình: ấu trùng thành tôm bột. Flow có thể hoà hình.
- Càng tôm đực dài hơn thân. Ảnh K06 phải giữ càng trong khung.

## 5. Kết quả

- Ngày tạo: 2026-10-31. Cách tạo: song song, mỗi clip dùng K(n) làm ảnh start và K(n+1) làm ảnh end.
- Video cuối: `tom-cang-xanh.mp4`, 22,13 giây, 25,9 MB, tăng tốc 1,3×, crossfade 0,25 giây.
- Chi phí: 5 clip × 10 tín dụng = 50 tín dụng. Không clip nào phải tạo lại.
- Thời gian: tạo ảnh từ 12:51 tới 13:00, tạo clip từ 13:07 tới 13:13:43.
- Điểm nối: 4/4 đạt, score 0,011–0,027. Score cao nhất bên trong clip là 0,057, dưới giới hạn 0,070.
- `flow.mjs` bản sửa ngày 2026-10-31 gắn ảnh đúng ở cả 5 clip. 4 clip lỗi tải `ENOENT`, và `gen-all.sh` tải lại được cả 4 clip.
- Lỗi script ảnh: ChatGPT đã tạo K06 nhưng `chain.mjs images` không nhận ra. Lỗi này lặp lại ở video cua đồng cùng ngày. Claude lưu K06 bằng `gpt-image.mjs --save-last`.
- Lỗi nhỏ, giữ lại: bản 9:16 cắt mất một phần đuôi tôm ở clip A và đầu càng trái ở cuối clip E.
- Lỗi nhỏ, giữ lại: tôm bột ở K04 to hơn mức 1/12 trong prompt.
