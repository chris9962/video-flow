---
name: kiem-tra-chu-dong-khi-chay-script
description: "Khi chạy script nền (ChatGPT, Flow), Claude phải tự kiểm tra trạng thái thật mỗi khoảng 1 phút, không chờ script hết thời gian chờ"
metadata:
  node_type: memory
  type: feedback
  originSessionId: dce8c08c-67f1-4f54-9a2e-d3e0e92af1cc
  modified: 2026-10-21T01:57:59.160Z
---

Người dùng ưu tiên kết quả: có clip, xong nhanh. Người dùng không muốn nghe giải thích dài về lỗi script.

Khi chạy script nền như `chain.mjs images`, `chain.mjs gen` hoặc `gpt-image.mjs`, Claude phải tự kiểm tra trạng thái thật của trang khoảng mỗi 1 phút. Cách kiểm tra là đọc DOM hoặc chụp tab Chrome qua CDP. Claude không được chỉ chờ log, và không được chờ script hết thời gian chờ.

**Why:** Ngày 2026-10-20, khi làm video bọ rùa, ChatGPT trả lời "Please upload the image" vì không nhận được ảnh đính kèm. Script vẫn chờ ảnh trong 6 phút. Người dùng tự phát hiện lỗi trước Claude, và chê Claude tin script quá nhiều, làm tốn thời gian.

**How to apply:**
- Sau khi chạy lệnh nền khoảng 60 giây, Claude phải xem trang thật: trang có ảnh hay chữ, và có báo lỗi không. Claude lặp lại việc này mỗi khoảng 1 phút cho tới khi lệnh xong.
- Nếu trạng thái sai, Claude dừng script ngay rồi sửa. Claude không chờ script hết thời gian chờ.
- Claude phải thử một đường code chưa dùng lần nào trước khi dựa vào nó. Ví dụ: đính kèm ảnh `--ref`.
- Khi script Flow đang tải video, Claude không được mở kết nối Playwright thứ hai tới Chrome CDP. Kết nối mới đổi thư mục tải của Chrome, và script báo lỗi `download.saveAs: ENOENT`. Video ong mật 2026-10-21 gặp lỗi này. Với Flow, Claude chỉ đọc log, vì log in tiến độ mỗi 2 giây.
- Khi chạy lại script, Claude ghi thêm vào log cũ bằng `>>`, hoặc sửa bộ theo dõi để đọc log mới. Ngày 2026-11-02, video ngài vải: bộ theo dõi chỉ đọc `images.log`, script chạy lại ghi ra `images3.log`. K08 nằm sẵn trong ChatGPT khoảng 5 phút mà Claude không lưu. Người dùng hỏi: "lâu vậy".
- Claude báo người dùng ngắn gọn: kết quả, rồi bước tiếp theo. Claude không viết bảng phân tích lỗi dài, trừ khi người dùng hỏi.

Liên quan: [[flow-chain-video]]
