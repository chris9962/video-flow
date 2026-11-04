---
name: video-flow-ghep-mau-aidancing
description: "Mục tiêu quy trình ghép mẫu + aidancing trong repo ~/video-flow; ràng buộc tỉ lệ 9:16, khung đầu clip, chỉ đổi mặt và quần áo"
metadata:
  node_type: memory
  type: project
  originSessionId: 6b5a03f4-0b5f-4adf-9623-ad9e393f112b
  modified: 2026-11-03T07:15:33.095Z
---

Người dùng xây quy trình trong repo `~/video-flow`, bắt đầu ngày 2026-11-02:
1. Input: 1 clip nhảy mẫu, 1 ảnh sản phẩm quần áo, 1 ảnh mặt mẫu cố định.
2. Block "Ghép mẫu" (`tryon`): lấy 1 khung hình của clip, thay mặt bằng mặt mẫu và thay quần áo, giữ nguyên tư thế.
3. Block "AI Dancing" (`aidancing`): đưa ảnh ghép + clip lên aidancing.net, model id=192, rồi tải video kết quả về.

Ràng buộc người dùng nêu ngày 2026-11-03:
- Ảnh ghép phải có tỉ lệ 9:16. Tỉ lệ nhân vật trong ảnh phải khớp tỉ lệ nhân vật trong video.
- Ảnh dáng phải là 1 khung của clip, thường là khung đầu tiên, để video mở màn bằng đúng ảnh đó.
- Chỉ đổi mặt và quần áo. Tạm thời không nối background mới, dùng background của clip.
- Người dùng chọn prompt giảm ánh sáng trên da, bỏ da nhựa. Prompt "thêm lỗ chân lông, màu da không đều" làm ra mụn và tàn nhang, người dùng không chấp nhận.

**Why:** người dùng làm video quảng cáo quần áo bằng mẫu cố định nhảy theo clip có sẵn.

**How to apply:** khi sửa block `tryon` hoặc `aidancing`, giữ đúng các ràng buộc trên. Mỗi lần tạo job aidancing tốn credit, nên Claude chỉ gọi khi người dùng cho phép và nói rõ số lần. Tài liệu API aidancing nằm trong `~/video-flow/app/CLAUDE.md`, mục "AI Dancing". Liên quan: [[research-chi-lay-chi-tiet-hinh-anh]].

Ngày 2026-11-03, Claude viết skill `aidancing-tiktok` (`~/video-flow/.claude/skills/aidancing-tiktok`). Skill chạy cả chuỗi bằng `chay-workflow.mjs` và đăng TikTok @linh_dan_20x bằng `dang-tiktok.mjs`. Video đầu tiên đăng ngày 2026-11-03. Liên quan: [[tiktok-khong-bat-nhan-ai]].

Bản mở rộng, người dùng nêu ngày 2026-11-03 (chưa làm):
- Input: 1 link TikTok (clip nhảy) + N link Shopee (ví dụ 5). Claude tách sản phẩm trong ảnh Shopee thành ảnh trang phục riêng. Output: N clip, mỗi clip 1 bộ đồ.
- Phần chính là tạo clip. Đăng TikTok là phần phụ.
- Bộ mặt mẫu cố định: 4 node ảnh bên trái nhất của workflow `ecbec438-a333-4357-a3a1-2bd10e02e4f5` ("Trường"). 2 node chứa cùng 1 file, nên chỉ có 3 ảnh: nhìn thẳng cười, quay 3/4 sang phải khung, quay sang phải khung nhiều hơn. Claude đã chép 3 ảnh vào `~/.claude/skills/aidancing-tiktok/assets/mat-mau/`. Claude chọn ảnh có góc mặt gần nhất với khung đầu của clip.
- Kiểu tóc: chỉ gợi ý cho GPT tạo kiểu hợp trang phục, GPT tự chọn. Giữ độ dài tóc (tóc dài không cắt ngắn). Prompt phải yêu cầu giữ nguyên nhận diện khuôn mặt.
- Điểm duyệt: không cần báo credit. Sau khi ghép xong N ảnh, Claude dừng trước AI Dancing và mở workflow trên FE video-flow (http://localhost:5173/editor/<id>) cho người dùng xem ảnh ghép.
- N block AI Dancing chạy song song (engine chạy các nhánh độc lập bằng Promise.all). Ngày 2026-11-03 Claude nối các lần ghi `aidancing-pending.json` để job song song không ghi đè mã job của nhau.
- Lần thử đầu xong ngày 2026-11-03 lúc 22:08: 1 link Shopee (đầm lụa đuôi cá) + clip @irenebbyy_ cắt 24,9 giây → `~/Desktop/Mẫu/Videos/aidancing-shopee-dam-lua-duoi-ca-irenebbyy-bo1-2026-11-032208.mp4`. Workflow `2dcc7f81-a35b-46fc-9619-359371dc1fd3`. Đăng TikTok ngày 2026-11-03: https://www.tiktok.com/@linh_dan_20x/video/7703964835565899016, nhãn AI tắt. Quy trình nằm ở mục "Bước 3b" của skill aidancing-tiktok.
- Lần chạy thứ 2 xong ngày 2026-11-03 lúc 23:04: 2 bộ Shopee (đầm body 755240872/40456287660, set corset 605598629/43570663072) trên cùng clip @irenebbyy_ → `~/Desktop/Mẫu/Videos/aidancing-shopee-2-bo-irenebbyy-bo1/bo2-2026-11-032304.mp4`. Workflow `9519a449-95ae-4bcb-8c82-81201e92ea71`. aidancing.net chạy song song 2 job. Chưa đăng TikTok.
- Clip đồ bộ xong ngày 2026-11-04 lúc 00:10: ảnh đồ bộ Google (kenh14, khung giữa) trên cùng clip @irenebbyy_ → `~/Desktop/Mẫu/Videos/aidancing-do-bo-google-irenebbyy-do-bo-2026-11-040010.mp4`. Workflow `480687a0-87cb-49bc-ab1f-c86d8b8dee38`. Cùng clip với 3 video đầm (đầm lụa, đầm body, set corset) để dựng biến hình. Chưa đăng TikTok.
