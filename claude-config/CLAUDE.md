# Global rules

## Văn phong trả lời (tiếng Việt kỹ thuật)

Áp cho MỌI câu trả lời và mọi văn xuôi tiếng Việt bạn viết ra: chat, tài liệu, README, mô tả ticket, changelog.

- **Kết luận trước, giải thích sau.** Câu đầu tiên trả lời thẳng câu hỏi.
- **Câu ngắn, một ý một câu.** Câu hướng dẫn ≤ 20 từ, câu mô tả ≤ 25 từ. Câu dài hơn thì tách.
- **Chủ động, không bị động.** ✗ "File được tạo bởi script." ✓ "Script tạo file."
- **Không lược chủ ngữ.** Nói rõ ai làm. ✗ "Sau khi cài, khởi động lại." ✓ "Sau khi cài xong, bạn khởi động lại máy."
- **Cắt từ đệm rỗng** khi chúng không thêm nghĩa: `tiến hành`, `thực hiện việc`, `mang tính`, `một cách`, `sự`, `việc`. ✗ "tiến hành kiểm tra cấu hình" ✓ "kiểm tra cấu hình".
- **Modal có nghĩa cố định**: `phải` = bắt buộc, `không được` = cấm, `nên` = khuyến nghị, `có thể` = được phép. Không dùng lẫn lộn, không viết "cần phải nên".
- **Một khái niệm = một cách gọi** xuyên suốt câu trả lời. Đã dùng "đăng nhập" thì không đổi sang "log in" hay "truy cập" ở đoạn sau.
- **Không ép dịch thuật ngữ.** Từ thuần Việt rõ hơn thì dùng từ thuần Việt; thuật ngữ kỹ thuật không có bản dịch tốt thì giữ nguyên tiếng Anh.
- **Tách chuỗi quá 3 danh từ liên tiếp** bằng `của` / `cho`. ✗ "hệ thống quản lý dữ liệu người dùng nội bộ" ✓ "hệ thống quản lý dữ liệu cho người dùng nội bộ".
- **Cảnh báo đặt trước bước thao tác**, không đặt sau.

Ngoại lệ: trích dẫn nguyên văn, tên riêng, thông báo lỗi giữ đúng bản gốc. Comment trong code theo mục dưới.

## Commenting / Code comments

- Comment giải thích **TẠI SAO** (lý do, ràng buộc, cạm bẫy, quyết định không hiển nhiên), KHÔNG mô tả lại **CÁI GÌ** code đang làm — code tự nói điều đó.
- TUYỆT ĐỐI không viết comment chỉ để lặp lại nội dung dòng code ngay bên dưới. Ví dụ cấm: `// return null` đặt trên `return null`.
- Code hiển nhiên thì KHÔNG comment. Một dòng đơn giản (return, gán biến, gọi hàm rõ nghĩa) không cần bất kỳ comment nào.
- Không viết comment nhiều dòng để giải thích code đơn giản. Nếu thật sự cần ghi chú, giữ trong 1 dòng ngắn gọn.
- Bám theo mật độ comment của file/hàng xóm xung quanh. File hiện tại không có comment thì đừng tự thêm.
- Không tự thêm docstring/header block cho hàm trừ khi codebase đang dùng convention đó hoặc tôi yêu cầu.
- Ưu tiên đặt tên biến/hàm rõ nghĩa thay vì viết comment để bù cho tên khó hiểu.

## Code changes

- Sửa tối thiểu, đúng phạm vi yêu cầu. Không refactor / dọn dẹp linh tinh ngoài scope nếu tôi không yêu cầu.
- Viết code khớp style, naming, idiom của code xung quanh.

## Frontend (FE)

Khi được yêu cầu code component / triển khai UI:

- Tuân thủ chuẩn **WCAG** (mục tiêu mức AA) cho khả năng tiếp cận:
  - Dùng HTML ngữ nghĩa (`button`, `nav`, `label`, `main`…), không lạm dụng `div`/`span` cho thứ vốn có element chuẩn.
  - Mọi input phải có `label` liên kết; ảnh có `alt`; icon-button có `aria-label`.
  - Đảm bảo dùng được bằng bàn phím: focus order hợp lý, focus visible, không bẫy focus.
  - Tương phản màu đạt WCAG AA; không truyền đạt thông tin chỉ bằng màu.
  - Chỉ dùng ARIA khi HTML ngữ nghĩa không đủ; ARIA sai còn tệ hơn không có.

- Với **React**, tuân thủ các tiêu chuẩn trong skill `react-effect-audit` — cốt lõi là "You Might Not Need an Effect":
  - KHÔNG dùng `useEffect` cho giá trị suy ra được (derived state) — tính thẳng khi render.
  - KHÔNG dùng `useEffect` để transform data cho việc render.
  - Xử lý tương tác người dùng trong event handler, không phải effect.
  - Reset state theo prop bằng `key`, không phải effect.
  - `useEffect` chỉ dùng để đồng bộ với hệ thống bên ngoài (network, DOM, subscription…), và phải có cleanup đúng.
  - Khi review/sửa code React nhiều effect, gọi skill `react-effect-audit`.
