# Vòng đời kiến lửa — kịch bản

Ngày viết: 2026-11-06. Skill dùng: `flow-chain-video`. Loài: kiến lửa đỏ, tên tiếng Anh red imported fire ant, *Solenopsis invicta*.

K là viết tắt của keyframe (ảnh khung). K00–K07 là 8 ảnh tĩnh do GPT tạo.

Trạng thái: người dùng duyệt ngày 2026-11-06. Video xong ngày 2026-11-06, chờ người dùng xem.

## 1. Thông số

| Mục | Giá trị |
|---|---|
| Số clip Flow | 7: M và A–F, `omni-flash` |
| Clip M | Flow tạo 4 giây. Khi ghép, clip M tua nhanh còn 1,5 giây. Người dùng yêu cầu ngày 2026-11-06. |
| Clip A–F | Mỗi clip 6 giây |
| Số ảnh GPT | 8: K00–K07 |
| Cách tạo clip | Song song, mỗi clip dùng 2 ảnh K làm ảnh start và ảnh end |
| Crossfade | 0,25 giây |
| Cảnh mở đầu | Clip M: mặt cắt bãi cỏ có ụ đất của tổ kiến. Camera tiến nhanh xuống khoang ấp dưới lòng đất. |
| Góc máy từ clip A | Cận cảnh 1 khoang trong lòng đất, mặt cắt nhìn ngang. Camera đứng yên. |

## 2. Bảng phân cảnh

| Clip | Ảnh start → ảnh end | Diễn biến |
|---|---|---|
| M | K00 → K01 | Mặt cắt bãi cỏ: phía trên là ụ đất xốp của tổ kiến, phía dưới là mạng đường hầm và khoang. Camera tiến nhanh xuống khoang lớn ở giữa, dừng ở cận cảnh kiến chúa cạnh đống trứng nhỏ. |
| A | K01 → K02 | Kiến chúa nằm yên. Đống trứng trắng cạnh bụng kiến chúa lớn dần, vì kiến chúa đẻ thêm trứng. |
| B | K02 → K03 | Trứng nở. Đống trứng chuyển thành ấu trùng nhỏ màu trắng, cong hình dấu phẩy. |
| C | K03 → K04 | Ấu trùng lớn dần tại chỗ, dài gấp 3 lần. |
| D | K04 → K05 | Ấu trùng hoá nhộng. Nhộng trắng có hình con kiến, chân và râu gập sát thân. |
| E | K05 → K06 | Nhộng sẫm dần: mắt đen trước, thân chuyển sang màu nâu nhạt. |
| F | K06 → K07 | Nhộng ở giữa duỗi chân và râu, thành kiến thợ màu nâu đỏ, đứng dậy cạnh kiến chúa. Lớp da nhộng trắng nằm lại. |

Kiến chúa nằm yên ở bên trái khoang trong mọi ảnh từ K01. Kiến chúa giữ vai trò vật cố định, giống bọc trứng rỗng trong video gián.

Cỡ qua các ảnh K, tính theo chiều dài: kiến chúa dài khoảng 1/3 chiều rộng khung. Trứng dài 1/12 kiến chúa. Ấu trùng mới nở dài 1/9 kiến chúa. Ấu trùng lớn ở K04 dài gấp 3 lần K03. Nhộng ở K05 cùng cỡ ấu trùng ở K04. Kiến thợ ở K07 dài khoảng 0,45 lần kiến chúa.

## 3. Chi tiết hình ảnh

Từ khoá Google đã xem, ảnh chụp lưu ở `google/`:
`Solenopsis invicta mound lawn`, `fire ant nest cross section underground chambers`, `Solenopsis invicta queen dealate founding chamber`, `Solenopsis invicta queen eggs brood`, `Solenopsis invicta larvae`, `Solenopsis invicta pupae`, `Solenopsis invicta callow worker`, `Solenopsis invicta worker`, `kiến lửa`.

- Ụ tổ: vòm đất tơi, vụn, màu nâu nhạt đến nâu đỏ, nằm giữa bãi cỏ nắng. Mặt ụ không có lỗ vào ở giữa.
- Dưới ụ: mạng đường hầm hẹp nối các khoang tròn dẹt. Khoang chứa đống trứng, ấu trùng, nhộng.
- Kiến chúa: to hơn kiến thợ nhiều lần. Đầu và ngực nâu đỏ sẫm, bụng to, bóng, màu nâu đen. Kiến chúa đã rụng cánh, trên ngực còn vết cánh.
- Trứng: rất nhỏ, trắng, bóng, hình bầu dục, dính thành đống cạnh kiến chúa.
- Ấu trùng: trắng sữa, hơi trong, cong hình dấu phẩy hoặc quả bầu. Đầu nhỏ ở đầu hẹp.
- Nhộng: trắng kem, có hình con kiến, chân và râu gập sát thân, không có kén. Nhộng sẫm dần: mắt đen trước, thân chuyển màu nâu.
- Kiến thợ mới: màu nhạt hơn, sẫm dần. Kiến thợ trưởng thành: đầu và ngực nâu đỏ màu đồng, bụng nâu đen bóng, râu gập khuỷu.

## 4. Chỗ dễ sai khi tạo

- K00: GPT có thể vẽ sơ đồ minh hoạ thay cho ảnh thật. Prompt ghi "realistic photo".
- K00: khoang ở giữa phải có kiến chúa và đống trứng nhỏ, để clip M không có kiến hiện ra đột ngột.
- Clip M: tỉ lệ phóng từ K00 sang K01 khoảng 15 lần, lớn hơn video gián. Flow có thể hoà hình thay cho camera tiến vào.
- Clip M tua 2,67 lần. Giây camera đứng yên ở cuối clip còn khoảng 0,4 giây.
- Clip B, D: nhiều vật đổi hình cùng lúc. Có thể hoà hình 0,25–0,5 giây.
- Clip F: kiến thợ đứng dậy là chủ thể đổi hình và đổi màu. Prompt chỉ kể 1 hành động.
- Kiến chúa đứng yên 36 giây. Flow có thể cho kiến chúa cử động râu. Lỗi này nhỏ, giữ lại.

Đơn giản hoá sinh học: tổ thật có hàng trăm trứng và kiến thợ chăm ấu trùng. Video chỉ có kiến chúa và khoảng 12 trứng, để người xem theo dõi được từng giai đoạn.

## 5. Kết quả

- Ngày tạo: 2026-11-06. Cách tạo: song song. `auto-images.sh` tạo ảnh K. `gen-all.sh` mở 1 clip khi Claude đã duyệt ảnh end. `tai-lai.sh` tải 6 clip báo `ENOENT`.
- Thời gian: ảnh K00 bắt đầu lúc 14:27, ảnh K07 xong lúc 14:39, clip F xong lúc 14:42, video cuối xong lúc 14:45.
- Chi phí: clip M 4 giây tốn 7 tín dụng. 6 clip A–F, mỗi clip 6 giây, tốn 10 tín dụng. Tổng 67 tín dụng.
- Video cuối: `kien-lua.mp4`, 25,92 giây, 1080×1920, tăng tốc 1,4 lần, −17,4 LUFS.
- Điểm nối: 5/6 đạt, score 0,013–0,024. Điểm nối M → A báo 0,103 vì 1 khung lệch độ nét ở giây 3,0–3,1 của clip M gốc. Ảnh `seam_1.png` không có hình chồng, nên Claude giữ.
- K00: GPT vẽ kiến chúa quay đầu sang phải, K01 quay đầu sang trái. Claude lật ngang K00 để 2 ảnh cùng hướng. Ảnh gốc lưu ở `K00_goc.png`.
- K01–K07: GPT trả 1024×1536, không đổi sang 3:4 như video gián. Kiến chúa dài khoảng 55% chiều rộng ảnh, prompt ghi 1/4. Đống ấu trùng ở K04 chạm mép phải vùng cắt 9:16.
- Clip M lần 1 không tạo được: Flow hiện hộp thoại "Introducing Omni 1.2!" và che nút chọn tỉ lệ. Claude bấm "Bắt đầu" để đóng hộp thoại, rồi chạy lại clip M. Lần 1 dừng trước bước tạo, nên không tốn tín dụng.
- Clip M 4 giây: camera đứng yên ở giây 0–1,0, tiến vào ở giây 1,0–2,5, đứng yên từ giây 2,5. Camera đi xuyên qua đường hầm, có nhoè chuyển động, rồi dừng ở khoang. Claude đặt `"trimStart": 1.0` và `"speed": 1.39`, nên đoạn mở đầu dài 1,5 giây trong video cuối.
- Clip A: đống trứng lớn dần. Kiến chúa đứng yên.
- Clip B: trứng chuyển thành ấu trùng nhỏ, cùng chỗ.
- Clip C: ấu trùng lớn dần đều trong 6 giây.
- Clip D: ấu trùng chuyển thành nhộng trắng.
- Clip E: nhộng sẫm dần sang nâu nhạt.
- Clip F: nhộng ở trước duỗi chân, thành kiến thợ, da nhộng nằm lại.
