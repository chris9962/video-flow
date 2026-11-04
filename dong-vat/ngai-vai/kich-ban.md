# Vòng đời ngài vải — kịch bản

Ngày viết: 2026-11-02. Skill dùng: `flow-chain-video`. Loài: ngài vải, tên tiếng Anh household casebearer hoặc plaster bagworm, *Phereoeca uterella*.

K là viết tắt của keyframe (ảnh khung). K01–K08 là 8 ảnh tĩnh do GPT tạo.

Người dùng gửi 2 ảnh mẫu, lưu trong thư mục này:
- `anh-mau-vong-doi.webp`: sơ đồ vòng đời của Kenh14, gồm ngài, trứng, sâu, nhộng.
- `anh-mau-sau-va-to.webp`: ảnh chụp thật 1 sâu ngoài tổ và 1 sâu trong tổ màu xám.

## 1. Thông số

| Mục | Giá trị |
|---|---|
| Số clip Flow | 8: A, B, B2, C–G, mỗi clip 6 giây, `omni-flash` |
| Cách tạo clip | Song song, mỗi clip dùng 2 ảnh K làm ảnh start và ảnh end |
| Hệ số tăng tốc | 1,8 |
| Crossfade | 0,25 giây |
| Video cuối | 25,5 giây |
| Góc máy | Nhìn thẳng vào tường vữa sơn trắng ngà trong nhà, chụp cận cảnh |
| Bố cục | Một vết nứt nhỏ ngang tường ở 30% chiều cao khung. Vài sợi tơ nhện cũ ngang tường ở 70% chiều cao khung. Sâu ở giữa khung, đầu hướng lên, đầu dưới của tổ ở 40% chiều cao khung. |

## 2. Bảng phân cảnh

| Clip | Ảnh start → ảnh end | Diễn biến |
|---|---|---|
| A | K01 → K02 | Ngài cái đẻ trứng vào vết nứt, rồi bò sang trái ra khỏi khung. Trứng ở lại trong vết nứt. |
| B | K02 → K02b | Trứng nở. Sâu non trần màu trắng chui ra và bò tản ra trên tường. |
| B2 | K02b → K03 | Mỗi sâu non ở yên tại chỗ, phủ bụi tường lên người thành tổ xám nhỏ. |
| C | K03 → K04 | Các con khác kéo tổ bò ra khỏi khung. Một con ở giữa ở lại và lớn lên một chút. |
| D | K04 → K05 | Sâu lớn dần tại chỗ. Tổ dài ra và phình ở giữa thành hình hạt bí. |
| E | K05 → K06 | Sâu vươn đầu ra khỏi tổ, giữ sợi tơ nhện bằng chân trước và ăn sợi tơ. |
| F | K06 → K07 | Sâu nhả tơ buộc 2 đầu tổ vào tường, rồi rút đầu vào trong tổ để hoá nhộng. |
| G | K07 → K08 | Ngài trưởng thành chui ra từ đầu dưới của tổ, đậu trên tường cạnh tổ. Xác nhộng thò ra ở đầu tổ. |

Cỡ tổ qua các ảnh K, tính theo chiều cao khung: 1/25 ở K03, 1/9 ở K04, 1/4 ở K05. Mỗi clip cho tổ lớn tối đa khoảng 3 lần. Ngài dài khoảng 1/5 chiều cao khung ở K01 và K08.

Clip E là cảnh ăn, để video có hành động trước giai đoạn nhộng. Video kết thúc bằng ngài trưởng thành, giống sơ đồ vòng đời người dùng gửi.

## 3. Chi tiết hình ảnh theo tài liệu

- Trứng rất nhỏ, màu xanh nhạt.
- Sâu tự làm tổ bằng tơ, phủ ngoài bằng cát, đất, phân côn trùng và sợi vụn. Tổ có màu xám tối.
- Tổ của sâu đã lớn dài 8–14 mm, rộng 3–5 mm. Tổ phình ở giữa giống hạt bí, thu nhỏ thành ống ở 2 đầu. Cả 2 đầu đều mở, nên sâu quay đầu được bên trong tổ.
- Sâu có đầu nâu sẫm bóng, các mảng nâu sẫm sau đầu, thân trắng ngà có đốt. Ảnh mẫu của người dùng cho thấy các chi tiết này.
- Sâu ăn tơ nhện, lông, tóc rụng, len.
- Trước khi hoá nhộng, sâu buộc tổ vào mặt tường đứng bằng tơ, ở cả 2 đầu tổ.
- Khi ngài chui ra, xác nhộng thường thò ra một phần ở một đầu tổ.
- Ngài cái có sải cánh tới 13 mm. Cánh trước màu xám, có các chấm sẫm rõ. Cánh sau có tua lông xám dài. Khi đậu, ngài xếp cánh thành hình mái nhà trên lưng. Râu dạng sợi, dài bằng cánh, ngả ra sau.

Nguồn:
- https://ask.ifas.ufl.edu/in129
- https://en.wikipedia.org/wiki/Phereoeca_uterella
- https://www.jungledragon.com/image/61854/phereoeca_uterella_-_household_casebearer_moth_plaster_bagworm_traa-de-parede_walsingham_1897.html

## 4. Chỗ dễ sai khi tạo

- K01: GPT có thể vẽ ngài to hơn 1/5 khung, hoặc vẽ ngài kiểu ngài quần áo màu vàng như sơ đồ Kenh14.
- Clip B: sâu non tự phủ bụi thành tổ là quá trình nhỏ. Flow có thể cho tổ hiện ra bằng hoà hình.
- Clip C: nhiều con bò đi cùng lúc. Flow có thể làm các con mờ dần.
- Clip D: tổ đổi từ dạng thon sang dạng hạt bí. Flow có thể đổi cỡ trong 1 khung hình.
- Clip E: Flow có thể làm sợi tơ mờ dần thay cho bị ăn.
- Clip G: ngài là chủ thể mới. Flow có thể cho ngài hiện ra bằng hoà hình thay cho chui ra khỏi tổ.

## 5. Kết quả

- Ngày tạo: 2026-11-02. Cách tạo: song song, mỗi clip dùng K(n) làm ảnh start và K(n+1) làm ảnh end.
- Thời gian: K01 xong lúc 15:04:20, clip A mở lúc 15:05:02, bản ghép đầu xong lúc 15:29, bản cuối xong lúc 15:34.
- Chi phí: 8 clip × 10 tín dụng + 1 lần tạo lại clip F + 1 lần tạo lại clip B = 100 tín dụng.
- Video cuối: `ngai-vai.mp4`, 25,50 giây, 36,3 MB, tăng tốc 1,8×. Điểm nối: 7/7 đạt, score 0,011–0,019. Bản cuối xong lúc 15:42.
- Cỡ thật trong ảnh K, theo chiều cao khung: ngài 1/2,7 ở K01. Tổ 1/17 ở K03, 1/5,6 ở K04, 1/3,1 ở K05. Mỗi ảnh lớn tối đa 3 lần so với ảnh trước.
- Clip A: ngài nhấc bụng khỏi vết nứt, xoay người, rồi bò ra khỏi khung.
- Clip B, lần 1: K02 → K03. Sâu non vừa chui ra đã có tổ xám, không có bước sâu trần tự làm tổ. Người dùng phát hiện lỗi này. Claude thêm ảnh K02b, tạo từ K03 bằng `gpt-image.mjs --ref K03.png`: các sâu trần nằm đúng chỗ các tổ trong K03. Clip B tách thành B và B2.
- Clip B, lần 2: trứng sẫm dần ở giây 1,5, sâu trần chui ra ở giây 2–3, rồi bò tản ra.
- Clip B2: sâu ở yên tại chỗ, bụi xám bám dần lên người trong giây 0,5–2, rồi thành tổ.
- Clip C: các sâu khác bò ra khỏi khung, sâu ở giữa ở lại.
- Clip D: tổ lớn dần trong giây 0–1,5, score cao nhất 0,058 ở giây 1,5. Thân trắng của sâu thò ra dần ở giây 3–6.
- Clip E: sâu vươn đầu lên sợi tơ, quay đầu sang 2 bên và gặm.
- Clip F, lần 1: không đạt. Ở giây 1,5–5, sâu chui hẳn ra khỏi tổ và bò quanh tổ, rồi biến mất trong 1 khung hình ở giây 5. Prompt lần 1 kể 2 sự kiện: sâu nhả tơ buộc 2 đầu tổ, rồi rút đầu vào tổ. Lần 2 bỏ câu nhả tơ, ghi "The larva never comes out of the case. There is only one larva."
- Clip F, lần 2: đạt. Sâu rút đầu vào tổ ở giây 0–2,5, tơ trắng hiện ra ở đầu trên. Ở giây 4,5–5,5, đầu sâu thò ra rồi rút vào lại. Lỗi nhỏ, giữ lại.
- Clip G: xác nhộng nâu thò ra ở đầu dưới tổ ở giây 0,5–1,5. Ngài xoè cánh chui ra ở giây 1,5–2, bò sang trái tổ, rồi xếp cánh ở giây 4.
- Lỗi tải: clip A, B, C, F gặp lỗi `ENOENT`. `gen-all.sh` tải lại được cả 4 clip.
- Lỗi script ảnh: `chain.mjs images` không nhận ra K06, K07 và K08 sau bước "Tải lại trang ChatGPT để cập nhật ảnh". Claude lưu 3 ảnh bằng `gpt-image.mjs --save-last`. Script tự lưu được K05 sau bước này.
- Bộ theo dõi của Claude chỉ đọc `images.log`. Khi Claude chạy lại script và ghi log ra `images3.log`, bộ theo dõi không báo dòng "Tải lại trang" của K08. K08 nằm sẵn trong ChatGPT khoảng 5 phút mà Claude không lưu.
