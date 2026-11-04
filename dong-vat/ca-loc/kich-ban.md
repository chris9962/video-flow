# Vòng đời cá lóc — kịch bản

Ngày viết: 2026-10-29. Skill dùng: `flow-chain-video`. Loài: cá lóc, *Channa striata*, tên tiếng Anh striped snakehead.

K là viết tắt của keyframe (ảnh khung). K01–K06 là 6 ảnh tĩnh do GPT tạo.

## 1. Thông số

| Mục | Giá trị |
|---|---|
| Số clip Flow | 5: A–E, mỗi clip 6 giây, `omni-flash` |
| Cách tạo clip | Song song, mỗi clip dùng 2 ảnh K làm ảnh start và ảnh end |
| Hệ số tăng tốc | 1,3 |
| Crossfade | 0,25 giây |
| Video cuối | khoảng 22 giây |
| Góc máy | Dưới nước, nhìn ngang, mặt nước ở phía trên khung |

## 2. Bảng phân cảnh

| Clip | Ảnh start → ảnh end | Diễn biến |
|---|---|---|
| A | K01 → K02 | Mảng trứng nổi dưới mặt nước nở, cá bột trong suốt có túi noãn hoàng vàng |
| B | K02 → K03 | Cá bột lớn lên, chuyển màu cam đậm, gom thành một đàn tròn |
| C | K03 → K04 | Đàn cá cam bơi ra khỏi khung, một con ở lại, lớn lên, chuyển màu nâu vàng có sọc |
| D | K04 → K05 | Cá con lớn dần thành cá lóc trưởng thành màu sẫm |
| E | K05 → K06 | Cá trưởng thành đứng yên, mảng trứng mới nổi lên mặt nước phía trên |

## 3. Chi tiết hình ảnh theo tài liệu

- Cá bố mẹ cắn bỏ cây thuỷ sinh để dọn một chỗ trống làm tổ.
- Trứng màu hổ phách hoặc vàng nhạt, không dính, nổi lên mặt nước. Mỗi lần đẻ có từ khoảng 100 tới hơn 1.000 trứng.
- Cá bột chuyển dần sang màu cam đậm. Cả cá bố và cá mẹ canh đàn cá bột.
- Ở cỡ khoảng 15 mm, cá con chỉ còn một sọc cam dọc thân. Cá con có màu nâu vàng với các sọc nâu đậm.
- Ở cỡ khoảng 40 mm, màu cam mất hết. Cuối vây lưng có một đốm mắt giả.
- Cá trưởng thành có thân dài, lưng màu nâu đen. Hai bên thân lốm đốm đen và vàng đất, bụng trắng.
- Cá trưởng thành có đầu to giống đầu rắn, vảy lớn, miệng rộng có răng, vây lưng dài.

Nguồn: https://en.wikipedia.org/wiki/Striped_snakehead, https://animaldiversity.org/accounts/Channa_striata/, https://sportfishin.asia/snakehead-fishing/channa-striata-2/

Kịch bản không vẽ cá bố mẹ canh trứng ở K01–K03. Lý do: video chỉ theo một con cá từ trứng tới trưởng thành, và hai con cá lớn trong khung làm người xem lẫn.

## 4. Kết quả

- Ngày tạo: 2026-10-29. Cách tạo: song song, mỗi clip dùng K(n) làm ảnh start và K(n+1) làm ảnh end.
- Video cuối: `ca-loc.mp4`, 22,13 giây, 33,8 MB, tăng tốc 1,3×, crossfade 0,25 giây.
- Chi phí: 5 clip × 10 tín dụng = 50 tín dụng. Không clip nào phải tạo lại.
- Thời gian: lệnh chạy lúc 14:36, clip A mở lúc 14:43:49, video ghép xong lúc 14:50.
- Điểm nối: 4/4 đạt, score 0,023–0,043.
- Bên trong clip không có bước nhảy. Score cao nhất 0,064 ở giây 21,67, dưới giới hạn 0,117.
- Lỗi nhỏ, giữ lại: ở K04, cá con dài khoảng 1/2 chiều rộng khung, to hơn mức 1/4 trong prompt. Ở K05, khung 9:16 cắt mất chóp vây đuôi.
- Lỗi nhỏ, giữ lại: ở clip B, đàn cá cam bơi từ dưới lên, không phải cá bột đổi màu tại chỗ. Ở clip E, dòng trứng nối từ mặt nước xuống đáy.
