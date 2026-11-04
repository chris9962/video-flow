# Vòng đời cua đồng — kịch bản

Ngày viết: 2026-10-31. Skill dùng: `flow-chain-video`. Loài: cua đồng, tên tiếng Anh rice field crab, chi *Somanniathelphusa*.

K là viết tắt của keyframe (ảnh khung). K01–K06 là 6 ảnh tĩnh do GPT tạo.

Yêu cầu của người dùng: trứng phải nằm dưới yếm cua mẹ, đúng thực tế.

## 1. Thông số

| Mục | Giá trị |
|---|---|
| Số clip Flow | 5: A–E, mỗi clip 6 giây, `omni-flash` |
| Cách tạo clip | Song song, mỗi clip dùng 2 ảnh K làm ảnh start và ảnh end |
| Hệ số tăng tốc | 1,3 |
| Crossfade | 0,25 giây |
| Video cuối | khoảng 22 giây |
| Góc máy | Camera đặt sát mặt bùn, nhìn ngang, chếch 3/4 từ phía trước. Nước ruộng cạn, trong. Gốc lúa và bờ bùn ở nền. |
| Tư thế cua mẹ | Cua mẹ đứng cao trên các chân, trên một hòn đá dẹt. Camera thấy mặt dưới thân và mép yếm. |

## 2. Bảng phân cảnh

| Clip | Ảnh start → ảnh end | Diễn biến |
|---|---|---|
| A | K01 → K02 | Cua mẹ đứng yên. Khối trứng dưới yếm đổi từ vàng hổ phách sang xám trong, mỗi trứng hiện 2 chấm mắt đen. |
| B | K02 → K03 | Trứng nở thành cua con nhỏ, trong suốt. Cua con vẫn bám dưới yếm mẹ, giữa các vỏ trứng rỗng. |
| C | K03 → K04 | Cua con bò ra khỏi yếm, leo lên chân cua mẹ và mặt đá xung quanh. Cua mẹ đứng yên. |
| D | K04 → K05 | Cua mẹ bò ra khỏi khung. Cua con bò nhanh ra khỏi khung. Một cua con ở giữa hòn đá ở lại và lớn dần. |
| E | K05 → K06 | Cua con lớn dần thành cua trưởng thành màu nâu, cùng cỡ và cùng vị trí với cua mẹ ở K01. |

K06 giống bố cục K01 nhưng không có trứng. Khi Shorts phát lặp, khung cuối nối với khung đầu.

## 3. Chi tiết hình ảnh theo tài liệu

- Cua nước ngọt phát triển trực tiếp. Không có giai đoạn ấu trùng bơi tự do. Trứng nở ra cua con đã có hình cua.
- Mỗi lứa có vài trăm trứng. Trứng to, đường kính khoảng 1 mm. Nghiên cứu cua đồng của Đại học Cần Thơ ghi trung bình 285 trứng mỗi cua mẹ.
- Cua cái giữ trứng trên các chân bụng, bên trong yếm gập dưới thân. Khối trứng đẩy yếm hở ra khỏi thân. Trứng lộ ra ở mép yếm.
- Cua cái có yếm rộng, tròn. Cua đực có yếm hẹp.
- Trứng giai đoạn cuối trong suốt. Mắt kép của cua con hiện thành chấm đen trong trứng.
- Sau khi nở, cua con ở lại dưới yếm mẹ một thời gian, rồi mới rời mẹ sống riêng.
- Tài liệu không tả màu trứng mới đẻ của cua đồng. Kịch bản vẽ trứng màu vàng hổ phách, đục.

Nguồn:
- https://en.wikipedia.org/wiki/Freshwater_crab
- https://ctujsvn.ctu.edu.vn/index.php/ctujsvn/article/view/911
- https://agris.fao.org/search/en/records/65dff15e0f3e94b9e5dddba8
- https://baophapluat.vn/cach-chon-mua-cua-dong-ngon-chuan-cho-ba-noi-tro-post264154.html

## 4. Chỗ dễ sai khi tạo

- Trứng phải nằm dưới yếm. GPT có thể vẽ trứng thành cụm rời trên đá. Claude kiểm tra K01–K03 trước khi tạo clip.
- Clip D có 2 sự kiện: cua mẹ rời đi và cua con lớn lên. Prompt ghi nhịp độ cho từng sự kiện: "quickly", "slowly".
- Cua con lớn khoảng 10 lần qua 2 clip D và E. Video bọ cánh cứng tê giác đạt với mức lớn 3,5 lần trong 1 clip.

## 5. Kết quả

- Ngày tạo: 2026-10-31. Cách tạo: song song, mỗi clip dùng K(n) làm ảnh start và K(n+1) làm ảnh end.
- Video cuối: `cua-dong.mp4`, 22,13 giây, 23,4 MB, tăng tốc 1,3×, crossfade 0,25 giây.
- Chi phí: 5 clip × 10 tín dụng = 50 tín dụng. Không clip nào phải tạo lại.
- Điểm nối: 4/4 đạt, score 0,013–0,041. Score cao nhất bên trong clip là 0,079 ở giây 14,83, trong clip D.
- Lỗi script, đã sửa ngày 2026-10-31: Flow đổi src ảnh trong hộp thoại chọn khung sang `flow.google.com/asb/…`, không còn mã ảnh. `flow.mjs` tìm ảnh theo mã nên báo `locator.waitFor: Timeout`. Bản sửa chọn ảnh theo tên file và so src bỏ phần cỡ ảnh `=s512-rw`. Lần chạy đầu không tốn tín dụng.
- Lỗi script ảnh: ChatGPT đã tạo K06 nhưng `chain.mjs images` không nhận ra và chờ hơn 6 phút. Claude lưu K06 bằng `gpt-image.mjs --save-last`.
- Lỗi nhỏ, giữ lại: ở giây 2,5–3,5 của clip B, cua con hiện to hơn rồi nhỏ lại dưới yếm.
- Lỗi nhỏ, giữ lại: ở giây 1,0–1,5 của clip D, góc máy hơi phóng to rồi trở lại khi cua mẹ bò ra khỏi khung.
- Lỗi nhỏ, giữ lại: ở K05, cua con dài khoảng 0,4 chiều rộng khung, to hơn mức 1/8 trong prompt.
