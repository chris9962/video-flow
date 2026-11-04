# Văn phong bắt buộc — ASD-STE100 bản tiếng Việt

Áp cho MỌI văn xuôi tiếng Việt: chat, tài liệu, README, mô tả ticket, changelog, commit message.

## Nói thẳng, không ví von — QUAN TRỌNG NHẤT

Người dùng đã yêu cầu rõ: bỏ hết chữ màu mè. Gọi đúng tên sự vật.

- KHÔNG ví von, KHÔNG ẩn dụ, KHÔNG nhân hoá, KHÔNG so sánh hình ảnh.
- KHÔNG dùng đoạn "Ví von" hay "Hình dung như" để giải thích. Chỉ dùng khi người dùng hỏi thẳng "giải thích đơn giản giúp tôi".
- KHÔNG đùa, KHÔNG chữ suồng sã, KHÔNG chữ gây kịch tính.
- Số liệu và tên kỹ thuật thay cho tính từ mạnh.

Bảng thay thế bắt buộc:

| ✗ Cấm | ✓ Viết |
|---|---|
| chưa nổ, chưa lộ | chưa xảy ra |
| tất cả xanh, ca xanh | tất cả đạt, tất cả pass |
| đỏ, ca đỏ | không đạt, fail |
| ngõ cụt | không có cách sửa |
| xáo bài, loạn | thứ tự sai, thứ tự ngẫu nhiên |
| bay sạch, biến mất sạch, mất trắng | mất |
| kẹt | không sửa được |
| ăn thua, ló ra, mọc thêm | có tác dụng, hiện ra, thêm |
| trả giá | tốn thêm chi phí |
| nuốt lỗi | bỏ qua lỗi |
| đá ra, đạp ra | từ chối |
| lọt | không bị chặn |
| im lặng | không báo gì |
| ồn ào | báo rõ |
| cạm bẫy, đặt bẫy | chỗ dễ sai |
| nhồi, dồn | đưa quá nhiều vào |
| chạy thẳng, gõ vu vơ | (bỏ hẳn, viết lại câu) |

Danh sách này chưa đủ. Gặp chữ nào cùng loại thì cũng bỏ.

### Cấm chữ xổ số, cờ bạc, trò chơi

Kết quả kỹ thuật không phải trò may rủi. Cấm: `trúng`, `hụt`, `ăn`, `thua`, `may`, `xui`, `hên`, `ván`, `cửa`, `được bạc`.

| ✗ Cấm | ✓ Viết |
|---|---|
| có ai trúng không | có khách nào đủ điều kiện không |
| trúng quà | đủ điều kiện nhận quà |
| hụt | không đạt, thiếu điều kiện |
| ăn điểm | được tính điểm |

### Tiêu đề phải mô tả, không được là câu hỏi bông đùa

Tiêu đề mục là **danh từ** hoặc **mệnh đề mô tả**. Không dùng câu hỏi tu từ, không dùng câu gợi tò mò.

| ✗ Cấm | ✓ Viết |
|---|---|
| Hôm nay có ai trúng không | Khách đủ điều kiện nhận quà |
| Ai là thủ phạm | Nguyên nhân |
| Chuyện gì đã xảy ra | Diễn biến lỗi |
| Và rồi sao nữa | Bước tiếp theo |
| Tin xấu · Tin tốt | Vấn đề · Kết quả |

## Dịch theo NGHĨA, không dịch theo từ

Một từ tiếng Anh có nhiều nghĩa. Mỗi nghĩa ứng với một từ tiếng Việt khác nhau. Chọn theo ngữ cảnh, không chọn theo mặt chữ.

`target` là lỗi hay gặp nhất. **Cấm dịch `target` thành `đích`.** Trong tiếng Việt, `đích` chỉ điểm đến khi di chuyển.

| Ngữ cảnh | ✗ Cấm | ✓ Viết |
|---|---|---|
| target của kế hoạch, KPI | đích | mục tiêu |
| target file, target branch | file đích, nhánh đích | file cần sửa, nhánh nhận |
| target audience | đích | đối tượng |
| build target | đích dựng | bản dựng |

Các từ khác cùng lỗi:

| ✗ Cấm | ✓ Viết |
|---|---|
| rơi về (fall back) | chuyển sang, dùng thay |
| bắn sự kiện (fire) | chạy, kích hoạt |
| giết tiến trình (kill) | dừng, kết thúc |
| đụng database (hit) | truy vấn, gọi tới |
| thả, rơi (drop) | bỏ, xoá |
| lọt dữ liệu (leak) | lộ dữ liệu |
| chốt chặn (guard) | điều kiện kiểm tra |
| cờ (flag) | trường đánh dấu |

## Thời gian: viết ngày tuyệt đối, cấm từ tương đối

Từ chỉ thời gian tương đối đúng lúc viết và sai lúc đọc lại. Tài liệu viết `hôm nay` thì tháng sau đọc ra sai.

**Cấm hoàn toàn** trong tài liệu, comment code, commit message, mô tả ticket, changelog:

`hôm nay` · `hôm qua` · `ngày mai` · `tuần này` · `tuần trước` · `tháng này` · `tháng sau` · `năm nay` · `gần đây` · `sắp tới` · `vừa rồi` · `lúc nãy` · `bây giờ` · `hiện giờ` · `dạo này`

| ✗ Cấm | ✓ Viết |
|---|---|
| chốt hôm nay | chốt 2026-08-13 |
| chốt 07/08 | chốt 2026-08-07 |
| sửa gần đây | sửa ở migration 0018 |
| sắp tới sẽ làm | chưa làm, nằm ở mục X |
| bây giờ code chạy đúng | sau commit `c61325b`, code chạy đúng |

Ngày phải đủ **năm-tháng-ngày**, dạng `YYYY-MM-DD`. `07/08` không đọc được: không rõ ngày 7 tháng 8 hay tháng 7 ngày 8, cũng không rõ năm nào.

**Trong chat** thì nói được về trạng thái code — `code hiện tại`, `bản trước`, `sau khi sửa`. Nhưng vẫn KHÔNG được dùng `hôm nay` để chỉ ngày.

**Không tự đoán ngày.** Claude không biết chắc hôm nay là ngày mấy. Cần ngày thật thì đọc từ hệ thống (`date`, git log, ngữ cảnh phiên), không viết theo trí nhớ.

## Từ ngữ

- Một khái niệm = MỘT cách gọi. Chọn rồi giữ nguyên suốt bài. Đã viết "đăng nhập" thì không đổi sang "log in" hay "truy cập".
- Một từ = MỘT nghĩa. Không dùng cùng một từ cho hai nghĩa khác nhau.
- Không dùng từ đồng nghĩa để tránh lặp. Lặp lại đúng từ cũ.
- Không viết tắt nếu chưa định nghĩa. Định nghĩa ngay lần dùng đầu.
- Không thành ngữ, tiếng lóng, ẩn dụ, nói giảm nói tránh. Xem mục đầu.
- Cắt từ đệm rỗng: `tiến hành`, `thực hiện việc`, `mang tính`, `một cách`, `sự`, `việc`. ✗ "tiến hành kiểm tra cấu hình" ✓ "kiểm tra cấu hình".
- Không quá 3 danh từ liên tiếp. Tách bằng `của` / `cho`.
- Modal có nghĩa cố định: `phải` = bắt buộc · `không được` = cấm · `nên` = khuyến nghị · `có thể` = được phép. Không viết "cần phải nên".

## Câu

- Câu hướng dẫn ≤ 20 từ. Câu mô tả ≤ 25 từ. Dài hơn thì tách.
- Một câu = MỘT hành động. Hai việc thì hai câu.
- Chủ động, không bị động. ✗ "File được tạo bởi script." ✓ "Script tạo file."
- Không cắt chủ ngữ. Nói rõ ai làm. ✗ "Sau khi cài, khởi động lại." ✓ "Sau khi cài xong, bạn khởi động lại máy."
- Thì đơn giản. Đánh dấu thời gian một lần, không chồng "đã đang sẽ".
- Đoạn văn ≤ 6 câu. Một đoạn = một ý.

## Bố cục

- Kết luận trước, giải thích sau. Câu đầu trả lời thẳng câu hỏi.
- Các bước viết đúng thứ tự phải làm.
- Cảnh báo đặt TRƯỚC bước thao tác, không đặt sau.
- Thông tin phức tạp cho vào bảng hoặc danh sách, không nhồi vào câu văn.
- Không nhét thông tin thiết yếu vào dấu ngoặc đơn.

## Ngoại lệ

- Trích dẫn nguyên văn, tên riêng, thông báo lỗi, code: giữ đúng bản gốc.
- Thuật ngữ kỹ thuật không có bản dịch tốt thì giữ tiếng Anh. Đừng ép dịch.
- Comment trong code theo quy tắc riêng ở `CLAUDE.md`.

## Phạm vi

ASD-STE100 có hai phần. Phần 1 là quy tắc viết — chuyển sang tiếng Việt được, nằm trọn ở trên. Phần 2 là từ điển ~900 từ tiếng Anh được duyệt — **không** chuyển sang tiếng Việt được, nên bỏ.
