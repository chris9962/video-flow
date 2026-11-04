# Vòng đời nhện nước — kịch bản

Ngày viết: 2026-11-01. Skill dùng: `flow-chain-video`. Loài: nhện nước, tên tiếng Anh diving bell spider, *Argyroneta aquatica*.

K là viết tắt của keyframe (ảnh khung). K01–K07 là 7 ảnh tĩnh do GPT tạo.

## 1. Thông số

| Mục | Giá trị |
|---|---|
| Số clip Flow | 6: A–F, mỗi clip 6 giây, `omni-flash` |
| Cách tạo clip | Song song, mỗi clip dùng 2 ảnh K làm ảnh start và ảnh end |
| Hệ số tăng tốc | 1,4 |
| Crossfade | 0,25 giây |
| Video cuối | khoảng 24,5 giây |
| Góc máy | Dưới nước, nhìn ngang, trong ao nước trong. Mặt nước nằm ngang ở 85% chiều cao khung, tính từ dưới lên. |
| Bố cục | Thân cây thuỷ sinh ở giữa khung. Chuông khí bạc bám giữa các thân cây, ở giữa khung. Nhện ở trong chuông từ K02 tới K07. |

Clip F là cảnh nhện bắt mồi, để đoạn cuối có hành động, giống clip F của video ốc bươu vàng.

## 2. Bảng phân cảnh

| Clip | Ảnh start → ảnh end | Diễn biến |
|---|---|---|
| A | K01 → K02 | Nhện mẹ ở sát mặt nước, bụng có lớp khí bạc. Nhện bò xuống theo thân cây vào chuông khí. Chuông khí lớn lên. |
| B | K02 → K03 | Nhện mẹ nhả tơ làm túi trứng trắng ở phần trên chuông khí. |
| C | K03 → K04 | Nhện con nở ra khỏi túi trứng, bò trên tơ trong chuông khí. Nhện mẹ ở yên. |
| D | K04 → K05 | Nhện mẹ và các nhện con khác rời chuông khí, ra khỏi khung. Một nhện con ở lại và lớn lên một chút. |
| E | K05 → K06 | Nhện con lớn thành nhện trưởng thành tại chỗ trong chuông khí. |
| F | K06 → K07 | Một lăng quăng bơi tới gần chuông khí. Nhện thò chân ra, bắt lăng quăng và ăn. |

Cỡ nhện qua các ảnh K, tính theo chiều ngang khung, kể cả chân: nhện con 1/40 ở K04, nhện nhỡ 1/14 ở K05, nhện lớn 1/6 ở K06. Mỗi clip cho nhện lớn tối đa khoảng 3 lần, vì video ốc bươu vàng cho thấy Flow đổi cỡ trong 1 khung hình khi chủ thể lớn khoảng 5 lần trong 1 clip.

## 3. Chi tiết hình ảnh theo tài liệu

- Nhện làm chuông khí bằng tơ, bám giữa các cây thuỷ sinh. Miệng chuông quay xuống dưới.
- Nhện mang khí từ mặt nước xuống chuông. Lông trên bụng và chân giữ một lớp khí, nên bụng nhện dưới nước có màu bạc.
- Nhện cái làm 1 túi trứng trong chuông khí và canh túi trứng tới khi trứng nở.
- Nhện con ở trong chuông với nhện mẹ một thời gian, rồi rời đi và làm chuông khí nhỏ của riêng mình.
- Nhện ăn côn trùng và giáp xác sống dưới nước, ví dụ lăng quăng và rận nước.

Nguồn:
- https://en.wikipedia.org/wiki/Diving_bell_spider
- https://animaldiversity.org/accounts/Argyroneta_aquatica
- https://britishspiders.org.uk/node/26498

## 4. Chỗ dễ sai khi tạo

- Chuông khí phải giữ cùng chỗ và cùng cỡ từ K02 tới K07. GPT có thể vẽ lại chuông khác hình.
- Nhện phải thấy được qua chuông khí. GPT có thể vẽ chuông bạc che mất nhện.
- Clip A: nhện đi qua nước và chuông lớn lên. Flow có thể tạo thêm bọt khí.
- Clip D: nhiều nhện con rời chuông cùng lúc. Flow có thể làm nhện con mờ dần thay cho bò ra.
- Clip F: lăng quăng vào khung từ bên phải. Flow có thể bỏ qua cảnh bắt mồi.

## 5. Kết quả

- Ngày tạo: 2026-11-01. Cách tạo: song song, mỗi clip dùng K(n) làm ảnh start và K(n+1) làm ảnh end.
- Video cuối: `nhen-nuoc.mp4`, 24,63 giây, 26,0 MB, tăng tốc 1,4×, crossfade 0,25 giây.
- Chi phí: 6 clip × 10 tín dụng = 60 tín dụng. Cả 6 clip đạt ở lần tạo đầu.
- Điểm nối: 5/5 đạt, score 0,013–0,022.
- Clip A: nhện bò xuống thân cây vào chuông khí, chuông lớn dần.
- Clip D: nhện mẹ và nhện con bơi xuống, ra khỏi khung. Bụng các nhện có lớp khí bạc.
- Clip E: nhện lớn khoảng 2,5 lần, lớn dần đều, không đổi cỡ trong 1 khung hình.
- Clip F: lăng quăng bơi vào ở giây 1,5. Nhện bắt mồi ở giây 3,5.
- Lỗi tải: clip A–E gặp lỗi `ENOENT`. `gen-all.sh` tải lại được cả 5 clip.
- Lỗi script ảnh: `chain.mjs images` không nhận ra K06 và K07 sau bước "Tải lại trang ChatGPT để cập nhật ảnh". Claude lưu 2 ảnh bằng `gpt-image.mjs --save-last`. K05 cũng qua bước tải lại trang, nhưng script tự lưu được.
