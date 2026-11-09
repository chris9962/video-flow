# Follow chéo nhóm Facebook

Extension Chrome này theo dõi người bình luận trong các bài của một nhóm Facebook. Sau khi theo dõi, extension trả lời bình luận của người đó bằng câu bạn cấu hình. Facebook tự gắn tag tên người ở đầu câu trả lời.

Ví dụ câu trả lời: "Haloan Nguyen đã follow, follow lại giúp mình nha". Chữ "Haloan Nguyen" là tag.

## Cài extension

Cảnh báo: bạn không được cài extension vào Chrome CDP của video-flow, cổng 9222. Chrome CDP chạy với cờ `--disable-extensions`, nên Chrome bỏ qua mọi extension. Cờ này giữ cho Playwright kết nối được Chrome CDP. Bạn cài extension vào Chrome thường.

1. Bạn mở Chrome, vào `chrome://extensions`.
2. Bạn bật "Developer mode" ở góc trên bên phải.
3. Bạn bấm "Load unpacked" và chọn thư mục `~/video-flow/fb-cheo-follow`.
4. Bạn ghim extension lên thanh công cụ. Khi bạn bấm icon extension, Chrome mở thanh bên của extension.

Sau khi sửa code, bạn bấm nút tải lại của extension trong `chrome://extensions`. Sau đó bạn tải lại tab Facebook.

## Chạy

Cảnh báo: Facebook có thể hạn chế tài khoản khi tài khoản theo dõi và bình luận nhiều trong thời gian ngắn. Lần chạy đầu, bạn nên đặt "Số người tối đa" là 1.

1. Trên Facebook, bạn chọn trang hoặc trang cá nhân sẽ dùng, ví dụ Aurevella.
2. Bạn bấm icon extension để mở thanh bên.
3. Ở tab "Cấu hình", bạn dán link nhóm và sửa câu bình luận nếu cần.
4. Bạn bấm "Follow chéo và bình luận". Extension mở 1 tab mới ở link nhóm.
5. Bạn giữ tab này ở phía trước. Chrome làm chậm hẹn giờ của tab nền sau khoảng 5 phút.
6. Bạn xem tiến độ ở phần trên của thanh bên và ở tab "Nhật ký". Bạn bấm "Dừng" khi muốn dừng.

Phần trên của thanh bên luôn hiện, kể cả khi bạn cuộn:
- Việc đang làm, ví dụ "Đang theo dõi Phan Văn Hoàn trong bài 3/15" hoặc "Đang gửi câu trả lời cho Phan Văn Hoàn".
- Bài đang xử lý, số người đã follow trong lần chạy, tổng số người đã follow.
- Nút "Dừng".

Dưới phần trên có 4 tab. Bạn đổi tab bằng chuột, hoặc bằng phím mũi tên trái và phải. Thanh bên nhớ tab bạn chọn lần trước.

| Tab | Nội dung |
|---|---|
| Cấu hình | Các ô cấu hình, nút "Follow chéo và bình luận" |
| Nhật ký | Nhật ký của lần chạy. Dòng đã trả lời có màu xanh, dòng có lỗi có màu đỏ. |
| Bài của tôi | Bài do trang đang dùng đăng. Xem mục "Lịch sử bài". |
| Bài nhóm | Các bài khác đã quét trong nhóm. Xem mục "Lịch sử bài". |

Trên trang Facebook, extension viền xanh bình luận đang xử lý.

| Ô cấu hình | Mặc định | Ý nghĩa |
|---|---|---|
| Nhóm đã lưu | Không có | Danh sách nhóm bạn đã nhập link. Bạn chọn 1 nhóm, extension điền link vào ô "Link nhóm". Nút "Xoá nhóm" xoá nhóm đang chọn khỏi danh sách. |
| Link nhóm | Không có | Link bất kỳ của nhóm. Extension bỏ phần sau tên nhóm, ví dụ `?notif_id=...`. Dưới ô này, extension ghi tên nhóm. |
| Câu bình luận | `đã follow, follow lại giúp mình nha` | Câu đặt sau tag tên. Extension đổi xuống dòng thành dấu cách. |
| Số người tối đa | 40 | Số người extension theo dõi trong 1 lần chạy |
| Số bài tối đa | 15 | Số bài extension lấy từ feed nhóm |
| Chờ giữa 2 người | 2–4 giây | Khoảng chờ ngẫu nhiên sau mỗi người |
| Gồm người trả lời lồng trong bình luận | Bật | Extension mở các nút "Xem N câu trả lời" và "Xem N phản hồi", rồi xử lý cả người trả lời lồng |

### Nhóm đã lưu

Khi bạn nhập link nhóm hoặc bấm "Follow chéo và bình luận", extension lưu link nhóm. Extension giữ tối đa 50 nhóm. Nhóm dùng lần cuối nằm đầu danh sách.

Extension lấy tên nhóm theo 2 cách:
1. Extension tải link nhóm và đọc thẻ `<title>` trong HTML. Cách này cần trình duyệt đã đăng nhập Facebook.
2. Nếu cách 1 không có tên, extension đọc tiêu đề tab khi mở trang nhóm.

Một nhóm có 2 dạng link: mã số, ví dụ `groups/724460902584939`, hoặc tên riêng do quản trị viên đặt. Extension lưu 2 dạng link này thành 2 nhóm khác nhau.

## Cách extension làm

| Bước | Việc |
|---|---|
| 1 | Cuộn feed nhóm tối đa 30 lần và lấy link bài chưa quét xong. Bài đã quét xong không được lấy lại. |
| 2 | Mở từng bài. Bấm "Xem thêm bình luận", "Xem N câu trả lời" và "Xem N phản hồi". |
| 3 | Tìm bình luận có nút "Theo dõi" cạnh tên. |
| 4 | Bấm "Theo dõi". Bấm "Trả lời". Nhập câu bình luận sau tag tên. Bấm "Đăng bình luận". |
| 5 | Nếu không gửi được câu trả lời, bấm "Thích" bình luận của người đó. Xem mục "Khi không trả lời được". |
| 6 | Ghi kết quả vào lịch sử của bài. |
| 7 | Chờ theo ô "Chờ giữa 2 người", rồi sang người tiếp theo. |

Khi tab Facebook không có focus, Facebook không hiện nút "Đăng bình luận". Ví dụ: bạn vừa bấm trên thanh bên. Extension gửi sự kiện `focusin` vào ô trả lời để Facebook hiện nút này. Khi extension không gửi được câu trả lời, extension xoá chữ trong ô trả lời.

### Khi không trả lời được

Mỗi người được follow phải nhận 1 tương tác: câu trả lời có tag, câu trả lời không có tag, hoặc 1 lượt thích bình luận.

| Trường hợp | Extension làm |
|---|---|
| Ô trả lời mới có tag đúng tên người đó | Nhập câu bình luận sau tag và gửi. Nhật ký ghi "đã trả lời". |
| Ô trả lời mới không có tag | Xoá chữ trong ô, nhập tên người đó bằng chữ thường, nhập câu bình luận, rồi gửi. Nhật ký ghi "đã trả lời, không có tag". |
| Không có ô trả lời mới, không nhập được chữ, hoặc không gửi được | Bấm "Thích" bình luận của người đó. Nhật ký ghi "đã thích bình luận". |

Facebook mở 1 ô trả lời mới cho mỗi người. Focus có thể nằm lại ở ô của người trước. Vì vậy extension tìm ô có tag đúng tên, không dùng ô đang có focus. Extension không trả lời vào ô cũ của người khác, để không trả lời nhầm bình luận.

Nút "Thích" bật và tắt khi bấm lại. Extension không bấm "Thích" khi bình luận đã được thích. Extension cũng không bấm lại khi lịch sử bài ghi đã thích ở lần trước.

## Lịch sử bài

Sau mỗi người, extension ghi vào lịch sử của bài: người đăng, số người đã follow, số người đã trả lời, thời điểm quét, kết quả của từng người. Thanh bên chia lịch sử vào 2 tab. Số cạnh tên tab là số bài trong tab.

| Tab | Bài trong tab | Nút |
|---|---|---|
| Bài của tôi | Bài do trang đang dùng đăng. Extension so tên người đăng với tên trong ô "Bình luận dưới tên …". Bạn cũng dán được link bài vào ô "Thêm link bài của tôi". | "Follow chéo lại bài này", "Follow chéo lại tất cả bài của tôi" |
| Bài nhóm | Các bài còn lại | "Follow chéo lại bài này", "Xoá lịch sử bài đã quét" |

Nút "Follow chéo lại" mở lại bài và làm 2 việc:
- Extension follow và trả lời người bình luận mới có nút "Theo dõi".
- Extension trả lời lại người đã follow ở lần trước nhưng chưa trả lời được. Người chỉ nhận lượt thích ở lần trước cũng thuộc nhóm này.

Nút "Xoá lịch sử bài đã quét" không xoá bài trong tab "Bài của tôi". Extension giữ tối đa 300 bài trong lịch sử.

Extension dừng khi có 1 trong các điều kiện sau:
- Extension đủ "Số người tối đa".
- Extension hết bài trong danh sách.
- Facebook hiện hộp thoại có chữ "tạm thời bị chặn", "quá nhanh" hoặc "bị hạn chế".
- Bạn bấm "Dừng" hoặc đóng tab.

Extension nhớ tên người đã theo dõi và bỏ qua người đó ở lần chạy sau.

## Giới hạn

- Extension đọc chữ tiếng Việt trên giao diện Facebook, ví dụ "Theo dõi", "Trả lời", "Bình luận dưới tên". Giao diện Facebook tiếng Anh không dùng được.
- Khi Facebook đổi giao diện, extension có thể không tìm thấy nút. Khi đó nhật ký ghi "0 người có nút Theo dõi" ở mọi bài.

## File

| File | Nội dung |
|---|---|
| `manifest.json` | Khai báo extension, Manifest V3 |
| `sidepanel.html`, `sidepanel.js` | Thanh bên: phần trên có việc đang làm, số liệu, nút dừng; 4 tab Cấu hình, Nhật ký, Bài của tôi, Bài nhóm |
| `background.js` | Mở thanh bên khi bấm icon, mở tab nhóm hoặc tab bài, lưu trạng thái chạy, dừng khi tab đóng |
| `content.js` | Chạy trong tab Facebook: lấy bài, theo dõi, trả lời, ghi lịch sử bài |

Extension lưu cấu hình, trạng thái chạy, nhật ký, lịch sử bài và danh sách người đã theo dõi trong `chrome.storage.local`. Mỗi lần trang tải lại, `content.js` đọc trạng thái và làm tiếp bài đang dở.
