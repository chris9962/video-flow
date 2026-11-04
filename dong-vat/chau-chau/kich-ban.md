# Vòng đời châu chấu — kịch bản

Ngày viết: 2026-11-02. Skill dùng: `flow-chain-video`. Loài: châu chấu lúa, tên tiếng Anh Chinese rice grasshopper, *Oxya chinensis*.

K là viết tắt của keyframe (ảnh khung). K01–K07 là 7 ảnh tĩnh do GPT tạo.

## 1. Thông số

| Mục | Giá trị |
|---|---|
| Số clip Flow | 6: A–F, mỗi clip 6 giây, `omni-flash` |
| Cách tạo clip | Song song, mỗi clip dùng 2 ảnh K làm ảnh start và ảnh end |
| Hệ số tăng tốc | 1,4 |
| Crossfade | 0,25 giây |
| Video cuối | khoảng 24,8 giây |
| Góc máy | Nhìn ngang ở bờ ruộng lúa. 30% dưới của khung là mặt cắt đất, thấy được trứng trong đất. |
| Bố cục | Một thân lúa lớn ở ngay bên phải giữa khung. Châu chấu con và châu chấu lớn bám thân lúa này, đầu hướng lên, chóp bụng ở 50% chiều cao khung. |

## 2. Bảng phân cảnh

| Clip | Ảnh start → ảnh end | Diễn biến |
|---|---|---|
| A | K01 → K02 | Châu chấu cái cắm bụng xuống đất, rút bụng lên, bò ra khỏi khung. Ổ trứng bọt ở lại trong đất. |
| B | K02 → K03 | Trứng nở. Châu chấu con chui lên qua đất, ra mặt đất, vài con bò lên thân lúa. |
| C | K03 → K04 | Các con khác bò ra khỏi khung. Một con ở giữa thân lúa ở lại và lớn lên một chút. |
| D | K04 → K05 | Châu chấu con lớn dần tại chỗ, mầm cánh hiện ra trên lưng. |
| E | K05 → K06 | Lột xác lần cuối thành châu chấu cái trưởng thành có cánh. Xác lột ở lại trên thân lúa. |
| F | K06 → K07 | Châu chấu giữ mép lá lúa bằng chân trước và gặm lá. Lá có một vết khuyết. |

Cỡ châu chấu qua các ảnh K, tính theo chiều cao khung, không kể râu: con mới nở 1/30 ở K03, con non 1/12 ở K04, con non tuổi lớn 1/5 ở K05, con trưởng thành 1/4 ở K06. Mỗi clip cho châu chấu lớn tối đa khoảng 3 lần. Lý do: video ốc bươu vàng cho thấy Flow đổi cỡ trong 1 khung hình khi chủ thể lớn khoảng 5 lần trong 1 clip.

Clip F là cảnh ăn lá, để đoạn cuối có hành động, giống clip F của video nhện nước.

## 3. Chi tiết hình ảnh theo tài liệu

- Châu chấu cái cắm chóp bụng xuống đất để đẻ. Trứng nằm trong một ổ bọt keo trộn đất, ngay dưới mặt đất. *O. chinensis* đẻ ổ trứng trong đất ở bờ ruộng.
- Trứng mới đẻ hình thuôn dài, màu vàng trong, dài 3–4 mm.
- Châu chấu con mới nở không có cánh, đầu to so với thân. Châu chấu con của *O. chinensis* màu xanh lá.
- Mầm cánh bắt đầu hiện ra ở tuổi 3 và lớn dần qua mỗi lần lột xác.
- Con trưởng thành có cánh đủ dài. *O. chinensis* có thân xanh, một sọc nâu sẫm chạy từ sau mắt dọc bên ngực, cánh màu nâu nhạt.

Nguồn:
- https://www.uwyo.edu/entomology/grasshoppers/field-guide/ghcycle.html
- https://caps.ceris.purdue.edu/wp-content/uploads/2026/07/Oxya_chinensis_datasheet_v1_2026.pdf
- https://atr.vsu.edu.ph/article/view/855

## 4. Chỗ dễ sai khi tạo

- K01: GPT có thể không vẽ được bụng châu chấu cắm xuống mặt cắt đất.
- Clip A: châu chấu rút bụng rồi bò đi là 2 sự kiện. Flow có thể làm châu chấu mờ dần thay cho bò ra khỏi khung.
- Clip C: nhiều con bò đi cùng lúc. Flow có thể làm các con mờ dần.
- Clip E: con trưởng thành chui ra khỏi xác lột phải đi lên phía trước, nhưng ảnh K giữ con trưởng thành ở cùng chỗ. Flow có thể hoà hình.
- Clip F: Flow có thể làm lá mờ dần thay cho bị gặm, giống clip tằm dâu.

## 5. Kết quả

- Ngày tạo: 2026-11-02. Cách tạo: song song, mỗi clip dùng K(n) làm ảnh start và K(n+1) làm ảnh end.
- Video cuối: `chau-chau.mp4`, 24,63 giây, 31,9 MB, tăng tốc 1,4×, crossfade 0,25 giây.
- Chi phí: 6 clip × 10 tín dụng = 60 tín dụng. Cả 6 clip đạt ở lần tạo đầu.
- Thời gian: clip A mở lúc 11:31:17, video ghép xong lúc 11:48.
- Điểm nối: 5/5 đạt, score 0,011–0,052.
- Cỡ thật trong ảnh K, theo chiều cao khung: con non 1/8,5 ở K04, con non tuổi lớn 1/3,7 ở K05, con trưởng thành 1/2,8 ở K06. GPT vẽ lớn hơn số trong prompt, nhưng mỗi ảnh vẫn lớn tối đa 2,3 lần so với ảnh trước.
- Clip A: châu chấu cái rút bụng lên, ổ bọt thành ổ trứng, rồi châu chấu bò sang trái ra khỏi khung ở giây 5,5.
- Clip B: trứng trong ổ đổi thành châu chấu con màu xanh, rồi châu chấu con chui lên mặt đất.
- Clip C: lỗi nhỏ, giữ lại. Ở giây 1–2,5, vài châu chấu con hiện ra trong mặt cắt đất.
- Clip D: châu chấu con lớn dần đều trong 6 giây, không đổi cỡ trong 1 khung hình.
- Clip E: con trưởng thành màu nhạt ngả ra sau khỏi xác lột ở giây 2–3,5, rồi cánh xoè ra ở giây 3,5–5. Con trưởng thành đổi từ màu nhạt sang màu xanh ở khoảng giây 5, score 0,065, dưới giới hạn 0,07. Giữ lại.
- Clip F: châu chấu với tới lá lúa ở giây 1,3. Vết gặm trên mép lá lớn dần từ giây 2,7.
- Lỗi tải: clip A–E gặp lỗi `ENOENT`. `gen-all.sh` tải lại được cả 5 clip.
- Lỗi script ảnh: `chain.mjs images` không nhận ra K06 và K07 sau bước "Tải lại trang ChatGPT để cập nhật ảnh". Claude lưu 2 ảnh bằng `gpt-image.mjs --save-last`. Khi bắt đầu K07, script ghi "5 ảnh trong cuộc chat", trong khi cuộc chat có 6 ảnh. DOM của trang cũng chỉ có 5 thẻ `img` cỡ lớn.
