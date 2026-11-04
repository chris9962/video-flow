# Vòng đời đuông dừa — kịch bản

Ngày viết: 2026-11-03. Skill dùng: `flow-chain-video`. Loài: mọt đỏ hại dừa, tên tiếng Anh red palm weevil, *Rhynchophorus ferrugineus*. Đuông dừa là ấu trùng của loài này.

K là viết tắt của keyframe (ảnh khung). K01–K09 là 9 ảnh tĩnh do GPT tạo.

Người dùng gọi con trưởng thành là "con bọ hay kiến vương gì đó". Ảnh Google cho thấy kiến vương là loài khác: bọ cánh cứng tê giác *Oryctes rhinoceros*, màu đen, có sừng. Video dùng con trưởng thành đúng của đuông dừa: mọt màu nâu đỏ, có vòi dài.

## 1. Thông số

| Mục | Giá trị |
|---|---|
| Số clip Flow | 8: A–H, mỗi clip 6 giây, `omni-flash` |
| Cách tạo clip | Song song, mỗi clip dùng 2 ảnh K làm ảnh start và ảnh end |
| Hệ số tăng tốc | 1,9 |
| Crossfade | 0,25 giây |
| Video cuối | Khoảng 23,5 giây |
| Góc máy | Nhìn thẳng vào mặt cắt dọc của ngọn dừa, chụp cận cảnh |
| Bố cục | 15% trên của khung là dải xơ bẹ dừa màu nâu sẫm. 85% dưới là củ hủ dừa màu kem. Đuông và kén ở giữa khung, đầu hướng lên. |

## 2. Bảng phân cảnh

| Clip | Ảnh start → ảnh end | Diễn biến |
|---|---|---|
| A | K01 → K02 | Mọt cái rút vòi khỏi lỗ, quay người, bò ra khỏi khung. Trứng ở lại trong các lỗ nhỏ. |
| B | K02 → K03 | Trứng nở. Mỗi lỗ có 1 đuông non trắng, đầu nâu đỏ. |
| C | K03 → K04 | Các đuông non khác đục vào mô và biến mất. Con ở giữa ở lại, gặm mô và lớn lên một chút. |
| D | K04 → K05 | Đuông lớn dần tại chỗ. Rãnh gặm rộng ra. |
| E | K05 → K06 | Đuông lớn hết cỡ. Xơ nâu đã gặm chất quanh người. |
| F | K06 → K07 | Đuông kéo xơ nâu quấn quanh nửa sau thân. |
| G | K07 → K08 | Đuông quấn xơ kín người thành kén bầu dục. |
| H | K08 → K09 | Đầu trên của kén mở ra. Mọt trưởng thành chui ra và đứng trên mô phía trên kén. |

Cỡ đuông qua các ảnh K, tính theo chiều cao khung: 1/40 ở K03, 1/14 ở K04, 1/7 ở K05, 1/3,5 ở K06. Mỗi clip cho đuông lớn tối đa khoảng 3 lần. Kén dài khoảng 1/3 chiều cao khung. Mọt dài khoảng 1/5 chiều cao khung ở K01 và K09.

Giai đoạn nhộng nằm trong kén, nên video không cho thấy nhộng.

## 3. Chi tiết hình ảnh

Từ khoá Google đã xem, ảnh chụp lưu ở `google/`:
`Rhynchophorus ferrugineus eggs in palm`, `Rhynchophorus ferrugineus larva newly hatched`, `Rhynchophorus ferrugineus larva inside palm trunk`, `đuông dừa`, `Rhynchophorus ferrugineus cocoon fiber`, `Rhynchophorus ferrugineus pupa`, `red palm weevil emerging from cocoon`, `Rhynchophorus ferrugineus adult coconut`, `kiến vương dừa`, `red palm weevil female laying eggs coconut tree`.

- Trứng màu trắng kem, hình bầu dục dài. Mọt cái đẻ từng trứng vào lỗ nhỏ trên mô mềm.
- Đuông không có chân, thân màu kem đến vàng cam, có nếp nhăn ngang sâu. Thân phình to ở giữa, thon ở đuôi. Đầu to, nâu đỏ sẫm bóng, hàm đen.
- Đuông non vừa nở màu trắng, đầu nâu.
- Đuông sống trong ngọn và thân dừa. Mô xung quanh màu kem, có nhiều xơ. Chỗ đuông gặm đầy xơ nâu ướt.
- Kén hình bầu dục, làm bằng xơ dừa thô màu nâu, dài hơn đuông một chút.
- Nhộng màu kem đến nâu, vòi gập dưới thân. Nhộng nằm trong kén.
- Mọt trưởng thành màu nâu đỏ cam. Ngực màu cam, có vài chấm đen tròn. Cánh cứng nâu đỏ, có rãnh dọc sẫm. Vòi đen dài, hơi cong. Râu gập khuỷu, mọc gần gốc vòi. Chân đen.
- Mọt chui ra từ một đầu của kén.

## 4. Chỗ dễ sai khi tạo

- K01: GPT có thể vẽ kiến vương màu đen có sừng, hoặc vẽ mọt quá to.
- Clip C: nhiều đuông non đục vào mô cùng lúc. Flow có thể làm các con mờ dần.
- Clip D, E: đuông lớn dần. Flow có thể đổi cỡ trong 1 khung hình.
- Clip F, G: đuông quấn xơ thành kén. Flow có thể cho kén hiện ra bằng hoà hình.
- Clip H: mọt là chủ thể mới. Flow có thể cho mọt hiện ra bằng hoà hình thay cho chui ra khỏi kén.

## 5. Kết quả

- Ngày tạo: 2026-11-03. Cách tạo: song song, mỗi clip dùng K(n) làm ảnh start và K(n+1) làm ảnh end. `gen-all.sh` chỉ mở 1 clip khi Claude đã duyệt ảnh end của clip đó, bằng file `ok/Kxx`.
- Thời gian: K01 xong lúc 16:06, clip A mở lúc 16:07:35, clip H mở lúc 16:22:06, bản ghép xong lúc 16:34.
- Chi phí: 8 clip × 10 tín dụng + 1 lần tạo lại clip E = 90 tín dụng.
- Video cuối: `duong-dua.mp4`, 24,17 giây, 1080×1920, 37,6 MB, tăng tốc 1,9×. Điểm nối: 7/7 đạt. Ảnh `seam_*.png` không có hình chồng.
- Cỡ thật trong ảnh K, theo chiều cao khung: mọt dài 0,38 tính cả vòi ở K01, thân không vòi dài 0,27. Đuông dài 0,13 ở K04, 0,28 ở K05, 0,53 ở K06. Kén dài 0,6 ở K08.
- GPT vẽ mọt ở K01 to hơn prompt, 0,27 thay cho 0,2. Claude tăng cỡ đuông ở K06 và kén ở K08 để đuông và kén vẫn lớn hơn mọt.
- Clip A: mọt rút vòi, quay người, rồi bò ra bên trái khung.
- Clip B: trứng nở, đuông non trắng ngọ nguậy ở miệng lỗ.
- Clip C: các đuông non chui vào lỗ ở giây 1,5. Con ở giữa trồi lên ở giây 2,5 rồi lớn dần.
- Clip D: đuông lớn dần đều trong 6 giây, score cao nhất 0,046.
- Clip E, lần 1: không đạt. Đuông giữ nguyên cỡ tới giây 4,375, rồi to gấp 1,9 lần trong 1 khung hình. Đuông lớn 1,9 lần giữa K05 và K06, và đầu đổi hình: K06 có hàm đen to.
- Clip E, lần 2: thêm "The larva grows smoothly and evenly from the first second to the last second, never suddenly. Its head grows together with its body." Đuông lớn dần trong giây 0–4,25, rồi vẫn đổi cỡ khoảng 1,3 lần ở giây 4,5, score 0,170. Lỗi nhỏ hơn lần 1, Claude giữ lại.
- Clip F: xơ nâu quấn dần lên nửa dưới thân đuông.
- Clip G: xơ quấn nhanh lên ở giây 1,5, score 0,122. Đầu đuông khuất vào kén ở giây 4,5–5.
- Clip H: đầu trên của kén mở ra. Mọt chui ra với đầu hướng xuống ở giây 1,5–3,5, rồi quay đầu lên trong khoảng 0,5 giây. Lỗi nhỏ, giữ lại.
- Lỗi tải: clip A, B, C, E, F, G gặp lỗi `ENOENT`. `flow.mjs --project` tải lại được cả 6 clip, mỗi clip khoảng 9 giây.
- Lỗi script ảnh: `chain.mjs images` không nhận ra K06, K07, K08, K09 sau bước "Tải lại trang ChatGPT để cập nhật ảnh". Claude dừng script, lưu ảnh cuối của cuộc chat qua CDP của tab, rồi chạy lại script cho ảnh sau.
- `gpt-image.mjs --save-last` chạy ngay sau khi gửi prompt K05 lưu nhầm K04, vì ChatGPT chưa tạo xong K05. Claude so mã băm với ảnh trước để phát hiện.
