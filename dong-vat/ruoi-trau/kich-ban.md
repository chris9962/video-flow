# Vòng đời ruồi trâu — kịch bản

Ngày viết: 2026-11-03. Skill dùng: `flow-chain-video`. Loài: ruồi trâu, tên tiếng Anh horse fly, chi *Tabanus*, họ Tabanidae.

Người dùng gõ "con rùi châu bự". Google sửa thành "con ruồi trâu bự".

K là viết tắt của keyframe (ảnh khung). K01–K10 là 10 ảnh tĩnh do GPT tạo.

## 1. Thông số

| Mục | Giá trị |
|---|---|
| Số clip Flow | 9: A–I, mỗi clip 6 giây, `omni-flash` |
| Cách tạo clip | Song song, mỗi clip dùng 2 ảnh K làm ảnh start và ảnh end |
| Hệ số tăng tốc | 2,0 |
| Crossfade | 0,25 giây |
| Video cuối | Khoảng 25 giây |
| Góc máy | Bờ ao ruộng lúa, nhìn ngang. 40% dưới của khung là mặt cắt bùn. |
| Bố cục | 2 lá lác mọc từ bùn ở bên trái. Lá cao uốn ngang qua giữa khung ở 70% chiều cao. Ấu trùng nằm trong bùn ở 22% chiều cao, giữa khung. |

## 2. Bảng phân cảnh

| Clip | Ảnh start → ảnh end | Diễn biến |
|---|---|---|
| A | K01 → K02 | Ruồi cái đẻ khối trứng trắng trên lá lác, rồi bay lên ra khỏi khung. |
| B | K02 → K03 | Trứng nở. Ấu trùng nhỏ màu trắng rơi xuống mặt bùn. |
| C | K03 → K04 | Ấu trùng đào xuống bùn. 1 con hiện ra trong mặt cắt bùn và lớn lên một chút. |
| D | K04 → K05 | Ấu trùng lớn dần tại chỗ. |
| E | K05 → K06 | 1 con giun đỏ bò tới. Ấu trùng ngoạm con giun. |
| F | K06 → K07 | Ấu trùng ăn con giun rồi lớn hết cỡ. |
| G | K07 → K08 | Ấu trùng bò lên, đứng thẳng, đầu sát mặt bùn. |
| H | K08 → K09 | Ấu trùng co lại, sẫm màu thành nhộng nâu tại chỗ. |
| I | K09 → K10 | Nhộng nhô nửa trên ra khỏi mặt bùn. Vỏ nhộng nứt, ruồi trưởng thành chui ra và đứng trên bùn. |

Cỡ qua các ảnh K, tính theo chiều cao khung: ruồi 1/6 ở K01 và K10. Khối trứng 1/10. Ấu trùng 1/40 ở K03, 1/16 ở K04, 1/7 ở K05, 1/3 ở K07. Nhộng 1/5 ở K09.

## 3. Chi tiết hình ảnh

Từ khoá Google đã xem, ảnh chụp lưu ở `google/`:
`Tabanus egg mass on leaf`, `horse fly eggs hatching`, `Tabanus larva in mud`, `horse fly larva`, `Tabanus pupa`, `horse fly pupa in soil`, `horse fly emerging from pupa`, `Tabanus female adult`, `ruồi trâu`, `horse fly laying eggs on plant`.

- Ruồi cái đẻ trứng thành 1 khối dài hình thoi, xếp nhiều lớp, trên lá cỏ hoặc lá lác ở bờ nước. Trứng mới đẻ màu trắng, sau đó sẫm dần thành xám đen.
- Ấu trùng thân hình thoi, thon ở 2 đầu. Thân màu kem đến vàng nhạt, có vòng nâu xám giữa các đốt. Mỗi đốt có 1 vòng u thịt nhỏ. Đầu nhỏ, nhọn, màu sẫm.
- Ấu trùng sống trong bùn ướt hoặc nước nông ở bờ ao, và ăn giun, ấu trùng côn trùng khác.
- Nhộng màu nâu, dài, thấy rõ bao chân và bao cánh. Bụng nhộng có các vòng gai nhỏ. Nhộng nằm trong đất ẩm gần mặt đất.
- Khi ruồi chui ra, vỏ nhộng nhô lên khỏi mặt đất.
- Ruồi trưởng thành to, thân xám nâu. Mắt kép rất lớn, nhiều loài có sọc ánh xanh và tím. Bụng có hàng tam giác nhạt ở giữa. Cánh trong.

## 4. Chỗ dễ sai khi tạo

- K01: GPT có thể vẽ ruồi nhà hoặc ruồi xanh thay cho ruồi trâu.
- Clip B: ấu trùng rơi từ lá xuống bùn. Flow có thể cho ấu trùng hiện ra bằng hoà hình.
- Clip C: ấu trùng chuyển từ mặt bùn vào mặt cắt bùn. Flow có thể làm ấu trùng mờ dần.
- Clip D, F: ấu trùng lớn dần. Flow có thể đổi cỡ trong 1 khung hình.
- Clip E: con giun là chủ thể mới, bò vào từ mép phải.
- Clip G: ấu trùng đổi từ nằm ngang sang đứng thẳng.
- Clip I: ruồi là chủ thể mới. Flow có thể cho ruồi hiện ra bằng hoà hình.

## 5. Kết quả

- Ngày tạo: 2026-11-03. Cách tạo: song song. `auto-images.sh` tạo 10 ảnh K và tự lưu ảnh qua CDP khi `chain.mjs images` không nhận ra ảnh mới. `gen-all.sh` mở 1 clip khi Claude đã duyệt ảnh end của clip đó.
- Thời gian: clip A mở lúc 16:50:21, ảnh K10 xong lúc 17:03:18, clip I xong lúc 17:06:11, bản ghép xong khoảng 17:15.
- Chi phí: 9 clip × 10 tín dụng + 1 lần tạo lại clip F = 100 tín dụng.
- Video cuối: `ruoi-trau.mp4`, 25,79 giây, 1080×1920, 33,5 MB, tăng tốc 2×. Điểm nối: 8/8 đạt, score 0,008–0,048. Ảnh `seam_*.png` không có hình chồng.
- `auto-images.sh` lưu đúng 5 ảnh K06–K10 qua CDP. Claude không phải lưu ảnh bằng tay.
- Clip A: ruồi đứng trên lá, rồi bay lên ra khỏi khung ở giây 3,5.
- Clip B: ấu trùng chui ra khỏi khối trứng và rơi xuống mặt bùn.
- Clip C: ấu trùng đào xuống bùn. 1 con hiện ra trong mặt cắt bùn ở giây 3, rồi bò tới giữa khung.
- Clip D: ấu trùng lớn dần đều trong 6 giây.
- Clip E: giun đỏ bò vào từ mép phải ở giây 1,5, ấu trùng ngoạm giun ở giây 4.
- Clip F, lần 1: không đạt. Prompt kể 2 sự kiện không có mốc thời gian. Ấu trùng to gấp 1,9 lần trong 1 khung hình ở giây 3,75.
- Clip F, lần 2: đạt. Prompt có mốc thời gian `[0-2s]` nuốt giun, `[2-6s]` lớn dần. Ấu trùng nuốt giun trong giây 0–2,75, rồi lớn dần đều tới cuối clip. Score cao nhất 0,045.
- Clip G: ấu trùng uốn người, bò lên rồi đứng thẳng.
- Clip H: ấu trùng sẫm màu dần thành nhộng nâu tại chỗ.
- Clip I: nhộng nhô lên khỏi bùn, ruồi chui ra ở giây 3,5, rồi đứng trên bùn cạnh vỏ nhộng.
- Lỗi tải: clip A–H gặp lỗi `ENOENT`. `flow.mjs --project` tải lại được cả 8 clip.
