---
name: aidancing-tiktok
description: Làm video nhảy quảng cáo quần áo bằng mặt mẫu cố định rồi đăng TikTok. Có bản nhiều bộ đồ: 1 link TikTok + N link Shopee → N clip. Chuỗi gồm 4 bước. (1) Lấy khung đầu của clip nhảy mẫu. (2) ChatGPT ghép mặt mẫu và trang phục vào khung đó (block "Ghép mẫu" của repo ~/video-flow). (3) aidancing.net copy chuyển động của clip lên ảnh ghép (block "AI Dancing"). (4) Đăng video lên TikTok @linh_dan_20x qua TikTok Studio. Dùng mỗi khi người dùng nhắc "flow aidancing", "aidancing", "ghép mẫu", "clip nhảy mẫu", "mặt mẫu", "thay mặt thay đồ vào clip", "AI copy chuyển động", "đăng tiktok", "up tiktok", "tiktok studio", "linh_dan_20x", hoặc gửi clip nhảy kèm ảnh quần áo hay link Shopee, kể cả khi không nhắc tên skill. Không dùng cho video vòng đời động vật (flow-chain-video) hay chỉ tải video (video-downloader).
---

# aidancing-tiktok

Skill này làm video nhảy quảng cáo quần áo. Mẫu cố định mặc trang phục mới và nhảy theo một clip có sẵn. Sau đó skill đăng video lên TikTok @linh_dan_20x.

`<skill>` là thư mục chứa file này, thường là `~/.claude/skills/aidancing-tiktok`.

Trả lời người dùng bằng tiếng Việt kỹ thuật: kết luận trước, câu ngắn, số liệu thay cho tính từ.

## Luồng

| Bước | Công cụ | Kết quả |
|---|---|---|
| 1. Lấy khung đầu của clip | ffmpeg trong block Ghép mẫu (`tryon`) | Ảnh dáng 9:16 |
| 2. Ghép mặt mẫu và trang phục vào ảnh dáng | ChatGPT, cùng 1 cuộc chat | Ảnh ghép 9:16, cùng khung với clip |
| 3. Copy chuyển động của clip lên ảnh ghép | aidancing.net, model id 192 "AI Copy Chuyển Động Dùng Nền Ảnh v5.1" | Video 720×1280, dài bằng clip, có tiếng của clip |
| 4. Đăng video | TikTok Studio | Link bài TikTok |

`scripts/chay-workflow.mjs` làm bước 1–3 qua API của server video-flow. `scripts/dang-tiktok.mjs` làm bước 4.

## Quy tắc bắt buộc

- Mỗi lần chạy bước 3 tốn credit aidancing. Claude phải báo chi phí và chờ người dùng đồng ý trước khi chạy. Ngoại lệ: người dùng đã cho phép trước một số lần cụ thể.
- Đăng TikTok là hành động công khai. Claude chỉ đăng khi người dùng yêu cầu đăng. Claude báo mô tả đã dùng trong câu trả lời.
- Claude không được bật nhãn "AI-generated content" trên TikTok. Người dùng yêu cầu ngày 2026-11-03.
- Claude không được đổi cài đặt tài khoản TikTok. Hộp thoại "Turn on automatic content checks?" phải đóng bằng Cancel.
- Claude không được xoá dữ liệu và không được gửi tin nhắn cho người khác.
- Sau khi xong việc, Claude đóng mọi tab Chrome mà Claude hoặc script đã mở. Claude không đóng tab người dùng đã mở trước.

## Ràng buộc của ảnh ghép

Người dùng đặt các ràng buộc này ngày 2026-11-03:

- Ảnh ghép có tỉ lệ 9:16. Cỡ và vị trí của người trong ảnh phải khớp với clip.
- Ảnh dáng là khung đầu của clip, vì aidancing mở video bằng đúng ảnh ghép.
- Chỉ đổi mặt và quần áo. Background giữ nguyên background của clip. Không nối cổng Background.
- Prompt bước sửa ảnh không được có câu "giữ đủ tay, chân, toàn thân". Câu đó làm ChatGPT zoom ra, và người trong ảnh nhỏ hơn người trong clip.
- Prompt làm da tự nhiên: giảm ánh sáng trên da, bỏ da nhựa. Không dùng câu "thêm lỗ chân lông, màu da không đều": câu đó làm ra mụn và tàn nhang.

Chi tiết kỹ thuật của 2 block nằm trong `~/video-flow/app/CLAUDE.md`, mục "Block Ghép mẫu (`tryon`)" và mục "AI Dancing (aidancing.net)".

## Chuẩn bị

| Thành phần | Lệnh kiểm tra | Cách mở |
|---|---|---|
| Chrome CDP, profile `~/chrome-cdp-profile` | `curl -s http://127.0.0.1:9222/json/version` | `node ~/.claude/skills/flow-chain-video/scripts/launch-chrome.mjs` |
| Server video-flow | `curl -s http://127.0.0.1:3001/health` | `cd ~/video-flow/app && npm run dev:server`, chạy nền |
| Web video-flow, để người dùng xem workflow | `curl -s -o /dev/null -w '%{http_code}' http://localhost:5173` | `cd ~/video-flow/app && npm run dev:web`, chạy nền |
| Thư viện của script | `ls <skill>/scripts/node_modules/playwright-core` | `cd <skill>/scripts && npm install` |

- Trong Chrome CDP, người dùng phải đăng nhập ChatGPT, aidancing.net và TikTok @linh_dan_20x.
- Server chỉ nghe `127.0.0.1`. Trên macOS, `localhost:3001` ra `::1`, và `curl` trả `000`.

## Bước 1 — Chuẩn bị input

| Input | Nguồn | Yêu cầu |
|---|---|---|
| Clip nhảy mẫu | Skill `video-downloader`, lưu vào `~/Desktop/Mẫu/Clip mẫu/` | Dưới 60 giây, dưới 90 MB, nên 9:16 |
| Mặt mẫu | Bộ mặt cố định trong `<skill>/assets/mat-mau/`, xem bảng dưới | Chọn 1 ảnh có góc mặt gần nhất với mặt trong khung đầu của clip |
| Trang phục | Ảnh sản phẩm người dùng gửi, hoặc ảnh Claude tìm trên mạng khi người dùng yêu cầu | Thấy toàn bộ trang phục, nền trơn. Không bắt buộc: bỏ trống thì giữ quần áo trong clip. |

Bộ mặt mẫu cố định của người dùng, xác nhận ngày 2026-11-03. Cùng 1 người, tóc đen dài uốn sóng, nền xám.

| File | Góc mặt | Cỡ |
|---|---|---|
| `01-nhin-thang-cuoi.png` | Nhìn thẳng, cười | 1126×1397 |
| `02-quay-3-4-sang-phai-cuoi-mim.png` | Quay 3/4 sang phải khung hình, cười mỉm | 1122×1402 |
| `03-quay-sang-phai-moi-khep.png` | Quay sang phải khung hình nhiều hơn ảnh 02, môi khép | 487×603 |

- Nguồn: 4 node ảnh bên trái nhất của workflow `ecbec438-a333-4357-a3a1-2bd10e02e4f5` ("Trường") trong video-flow. 2 node trong số đó chứa cùng 1 file, md5 `906ff40b…`, nên bộ mặt chỉ có 3 ảnh.
- Người dùng không gửi mặt mới thì Claude dùng bộ này, không hỏi lại.
- Không ảnh nào quay sang trái khung hình. Mặt trong clip quay sang trái thì Claude lật ngang ảnh 02 hoặc 03. Lật ngang làm đổi bên rẽ ngôi tóc.
- Khi đưa lên block ảnh của video-flow, Claude upload file từ thư mục này qua `POST /api/assets`.
- Clip TikTok thường chỉ có bản 576×1024.
- Ngày 2026-11-03, ffprobe đọc clip trên Desktop có lần quá thời gian chờ. Khi đó, Claude chép clip vào scratchpad rồi dùng bản chép.

## Bước 2 — Dry run và báo chi phí

```bash
node <skill>/scripts/chay-workflow.mjs --face <mặt.png> --outfit <trang-phục.png> --clip <clip.mp4> [--quality quality|fast] --dry-run
```

Lệnh in kích thước clip, độ dài, gói aidancing và số credit. Lệnh không gọi ChatGPT và không gọi aidancing.

| Chế độ | Giá | Gói 15 giây | Thời gian chờ đo ngày 2026-11-03 | Video ra |
|---|---|---|---|---|
| `quality`, mặc định | 0,22 credit/giây | 3,3 credit | 20–22 phút | 720×1280 |
| `fast` | 0,11 credit/giây | 1,65 credit | 10 phút | 576×1024, mờ hơn |

- Gói là số nhỏ nhất trong 10, 15, 20, 25 giây mà đủ dài cho clip. aidancing tính tiền theo gói, không theo độ dài clip.
- Claude gửi người dùng số credit, rồi chờ người dùng đồng ý.

## Bước 3 — Chạy chuỗi

```bash
node <skill>/scripts/chay-workflow.mjs --face <mặt.png> --outfit <trang-phục.png> --clip <clip.mp4> [--quality quality|fast] [--out <video.mp4>]
```

- Claude chạy lệnh ở chế độ nền và đọc log mỗi vài phút. Claude không chờ hết thời gian chờ của script.
- Script tạo 1 workflow mới từ workflow mẫu `b45b8398-7002-47a1-86e0-5aaa4c604587` ("Ghép mẫu từ clip nhảy"). Script không sửa workflow mẫu. Log có link editor của workflow mới.
- Bước ghép ảnh mất 2–4 phút. Nếu bước này quá 5 phút, Claude xem tab ChatGPT trong Chrome CDP.
- Kết quả: `~/Desktop/Mẫu/Videos/aidancing-<tên clip>-<thời điểm>.mp4`, cùng ảnh ghép `…-anh-ghep.png`.
- Cảnh báo: Claude không được sửa file trong `~/video-flow/app/apps/server` lúc chuỗi đang chạy. `tsx watch` khởi động lại server, và run đang chạy dừng theo.
- Nếu server khởi động lại, script chờ server chạy lại. Ảnh ghép đã có thì script chỉ chạy lại block AI Dancing với đúng ảnh đó. Service aidancing nhận ra cùng input và theo dõi tiếp job cũ, nên không trừ credit lần 2.
- Khi ChatGPT lỗi, tab ChatGPT để mở để Claude xem lỗi.
- Phần chạy thật của script chưa chạy lần nào. Ngày 2026-11-03, chỉ dry run đã chạy. Lần đầu chạy thật, Claude đọc log sát hơn.

## Bước 3b — Nhiều bộ đồ từ link Shopee

Người dùng gửi 1 link TikTok và N link Shopee. Kết quả là N clip trên cùng 1 clip TikTok, mỗi clip 1 bộ đồ. Người dùng yêu cầu luồng này ngày 2026-11-03. Phần chính là tạo clip. Đăng TikTok là phần phụ.

1. Claude tải clip TikTok bằng skill `video-downloader`. Clip dài hơn 25 giây: Claude hỏi người dùng, rồi cắt còn 24,9 giây bằng ffmpeg. Gói lớn nhất của aidancing là 25 giây. Ngày 2026-11-03, người dùng chọn cắt.
2. Claude mở từng link Shopee trong tab nền của Chrome CDP, dùng `Target.createTarget` với `background: true`.
   - Claude đọc tên sản phẩm, ảnh `img[src*="susercontent.com/file/"]` và tên các màu, là `button[aria-label]`.
   - Khoảng 8 ảnh đầu là ảnh gallery, các ảnh sau là icon hoặc ảnh của sản phẩm khác.
   - Claude dùng ảnh bìa, tức ảnh đầu. Ảnh bìa quyết định màu.
   - Claude lưu ảnh vào `~/Desktop/Mẫu/Ảnh/shopee/<shopId>-<itemId>/`, rồi đóng tab.
3. Claude chọn mặt trong `<skill>/assets/mat-mau/` có góc gần nhất với khung đầu của clip.
   - Mỗi lần người dùng gửi link Shopee, Claude luôn thêm 1 bộ đồ bộ miền Tây bằng `--do-bo-image <ảnh>`. Người dùng dùng clip này để dựng clip biến hình. Người dùng yêu cầu ngày 2026-11-03.
   - Claude lấy ảnh đồ bộ từ Google Hình ảnh, từ khoá "đồ bộ miền tây", trong tab nền của Chrome CDP. Claude bấm vào 1 ảnh có người mặc nguyên bộ, rồi đọc ảnh cỡ lớn trong khung xem trước: `img` có `src` http, không thuộc gstatic, `naturalWidth` ≥ 400. Ảnh ghép nhiều khung thì Claude cắt riêng 1 khung.
   - Không dùng `--do-bo`, tức ChatGPT tự vẽ đồ bộ. Ngày 2026-11-03 người dùng xem bản ChatGPT vẽ và nói "đồ bộ gpt gen ra chán quá".
4. Claude chép clip, mặt và ảnh sản phẩm vào scratchpad, rồi chạy:
   ```bash
   cd <skill>/scripts && node ghep-nhieu-bo.mjs --clip <clip.mp4> --face <mặt.png> --product <a.jpg> [--product <b.jpg> ...] --do-bo-image <đồ-bộ.jpg> --name "<tên>"
   ```
   - Script tạo 1 workflow. Mỗi sản phẩm có 3 block: ảnh Shopee gốc, block "Ảnh" tách sản phẩm qua ChatGPT, và block "Ghép mẫu".
   - Prompt Ghép mẫu là prompt mặc định, thêm 2 dòng: gợi ý kiểu tóc hợp trang phục, và giữ nguyên nhận diện gương mặt.
   - Script dừng sau Ghép mẫu.
5. Claude mở workflow trên FE bằng `open http://localhost:5173/editor/<id>`. Người dùng xem ảnh ghép trên FE. Claude không cần báo credit.
6. Người dùng duyệt xong thì Claude chạy:
   ```bash
   cd <skill>/scripts && node ghep-nhieu-bo.mjs --aidancing <workflowId> [--quality quality|fast]
   ```
   - Script thêm 1 block AI Dancing sau mỗi block Ghép mẫu. Engine chạy các nhánh song song.
   - Sau khi thêm block, script chờ 15 giây rồi đọc lại workflow. Block bị xoá thì script dừng và không gửi job.
   - Script đọc video từ `data/runs/<runId>/<nodeId>/outputs.json`, rồi chép vào `~/Desktop/Mẫu/Videos/aidancing-<tên>-bo<n>-<thời điểm>.mp4`.

Cảnh báo cho bước 6: tab FE đã mở từ trước chỉ giữ bản workflow cũ, chưa có block AI Dancing. FE tự lưu mỗi 5 giây khi không có run, và ghi đè bản của script. Ngày 2026-11-03, tab FE đã xoá block AI Dancing ngay sau khi job xong.
- Người dùng chọn cách làm ngày 2026-11-03: người dùng đóng tab FE trước bước 6 và không mở FE trong lúc Claude chạy. Claude chỉ mở FE khi script đã dừng.
- Sau khi script sửa workflow, Claude chờ 15 giây rồi đọc lại workflow. Block mới mất thì vẫn còn tab FE mở. Khi đó Claude báo người dùng, không sửa lặp lại.
- Block AI Dancing mất mà video còn trong `data/runs`: Claude thêm lại block, với `config.content` trỏ tới file video. Cách này không gửi job mới.

Số liệu lần chạy đầu, ngày 2026-11-03, với 1 bộ đầm lụa đuôi cá:
- Block tách sản phẩm mất 36 giây. Ảnh ra 1024×1536, nền trắng, giữ đủ chi tiết sản phẩm.
- Block Ghép mẫu mất 109 giây. Ảnh ra 864×1536.
- ChatGPT giữ tóc thả uốn sóng như ảnh mặt mẫu, không đổi kiểu tóc.
- Job aidancing 3235143, gói 25 giây, quality, 5,5 credit: mất 2229 giây, tức khoảng 37 phút. Gói 15 giây đo trước đó mất 22 phút.
- Video ra 720×1280, 24,83 giây, có tiếng. Mặt giữ đúng mặt mẫu ở mọi khung đã xem. Đầm dài vẫn đúng màu, đúng hoa và nếp xếp khi người nhảy, dù clip gốc là váy ngắn.

Số liệu lần chạy thứ 2, ngày 2026-11-03, với 2 bộ trên cùng clip: đầm body đen lót đỏ và set corset hồng.
- aidancing.net xử lý song song 2 job trên cùng 1 tài khoản: job 3236295 và 3236296 chuyển sang PROCESSING cùng lúc. Tổng thời gian 2166 giây, gần bằng 1 job.
- 2 block tách sản phẩm chạy song song, mất 34–36 giây. 2 block Ghép mẫu chạy song song, mất 109–112 giây.
- Ảnh bìa Shopee ghép nhiều khung, có cả màu khác: Claude cắt riêng khung lớn có màu ảnh bìa trước khi tách. Cắt tại cột sáng đều theo chiều dọc giữa các khung.
- Bước kiểm tra 15 giây trước khi gửi job đạt. Block AI Dancing giữ đủ video sau khi run xong.

## Bước 4 — Kiểm tra video

1. ffprobe: kích thước như bảng ở bước 2, độ dài bằng clip.
2. Claude trích khung ở giây 0, giữa và cuối video, rồi xem: mặt giống mặt mẫu, trang phục đúng ảnh, tay chân không méo.
3. Claude mở video cho người dùng xem: `open <video.mp4>`.

Kết quả đo ngày 2026-11-03: khung đầu của video giống ảnh ghép, SSIM 0,84. Ảnh ghép có mặt không cười, vì ChatGPT không giữ nụ cười của khung gốc. Video vẫn cười theo clip, vì aidancing copy cả biểu cảm.

## Bước 5 — Đăng TikTok

1. Claude viết mô tả: 1 câu nói vu vơ, đời thường, kèm emoji và 2–3 hashtag chung.
   - Mô tả không được ghi tên sản phẩm, loại trang phục, màu hay chất liệu. Hashtag cũng không được tả sản phẩm. Người dùng yêu cầu ngày 2026-11-03.
   - Ví dụ đúng: `Tối nay ăn gì đây mọi người 🫠 #xuhuong #fyp`, `Nhảy xong quên luôn bài 😂 #xuhuong #trend`.
   - Ví dụ sai, 2 bài đã đăng ngày 2026-11-03: `Đầm trắng tay phồng 🤍 #damtrang #ootd …`, `Đầm lụa đuôi cá đính hoa 🤍 #damlua …`.
2. Claude chạy:
   ```bash
   cd <skill>/scripts && node dang-tiktok.mjs <video.mp4> --caption "<mô tả>" [--dry-run]
   ```
3. Script mở tab nền TikTok Studio và tải video lên. Script đóng hộp thoại, gõ mô tả rồi kiểm tra lại mô tả. Script kiểm tra nhãn AI đang tắt, rồi bấm Post. Cuối cùng, script in link bài và đóng tab.
4. `--dry-run` làm mọi bước trừ bấm Post, và để tab mở cho người dùng xem. Sau đó, Claude đóng tab đó bằng `curl -s http://127.0.0.1:9222/json/close/<id>`.
5. Sau khi đăng, TikTok ghi "Content under review" và để bài ở "Only me" cho tới khi duyệt xong. Sau khi duyệt, bài theo quyền "Everyone".
6. Claude ghi link vào mục "Đã đăng" ở cuối file này.

Cảnh báo: theo hộp thoại của TikTok, TikTok có thể gỡ video AI trông như thật mà không gắn nhãn. Người dùng đã biết và chọn không gắn nhãn.

## Lỗi đã gặp

| Hiện tượng | Nguyên nhân | Cách xử lý |
|---|---|---|
| `curl localhost:3001` trả `000` | Server chỉ nghe `127.0.0.1` | Dùng `http://127.0.0.1:3001` |
| Mô tả TikTok mất 2 hashtag | `insertText` rồi `Escape` sau mỗi hashtag | Gõ từng phím bằng `keyboard.type`, có dấu cách sau hashtag cuối |
| Playwright báo `react-joyride__overlay ... intercepts pointer events` | Hướng dẫn tính năng mới của TikTok che nút | Bấm "Got it" |
| Hộp thoại "Labeling AI-generated content" | Script hoặc Claude bấm công tắc nhãn AI | Không bấm công tắc này |
| Người trong ảnh ghép nhỏ hơn người trong clip | Prompt có câu "giữ đủ toàn thân" | Đã bỏ câu đó khỏi prompt mặc định |
| ChatGPT trả ảnh lệch khung | ChatGPT luôn trả ảnh 2:3 | Block nới ảnh dáng tới 2:3, rồi cắt kết quả về 9:16 |
| Shopee chuyển tab sang `shopee.vn/verify/traffic/error`, trang ghi "Login Required" | Shopee kiểm tra lưu lượng. Ngày 2026-11-03, lần đầu bị chặn, lần sau khi Chrome khởi động lại thì mở được, không cần đăng nhập. | Mở lại link. Nếu vẫn bị chặn, người dùng đăng nhập Shopee trong Chrome CDP. Không được giả user agent của bot để vượt trang này. |
| `TypeError: fetch failed`, `The blob could not be read` khi upload | Node không đọc được file trên Desktop | Chép file vào scratchpad rồi dùng bản chép |
| `dang-tiktok.mjs` in "chưa đọc được link" dù đã đăng | Danh sách bài trên trang Content chưa tải xong khi script đọc. Gặp ngày 2026-11-03. | Mở `tiktok.com/tiktokstudio/content` trong tab nền, lấy mã video lớn nhất trong các link `/video/`, rồi đóng tab |
| yt-dlp báo `Unexpected response from webpage request` với link TikTok | Lỗi extractor TikTok của yt-dlp | Dùng tikwm, theo skill `video-downloader` |

## Đã đăng

| Ngày | Video | Link |
|---|---|---|
| 2026-11-03 | `aidancing-test3-toan-chuoi-chatluong.mp4`: đầm trắng tay phồng, clip của @chang25.02 | https://www.tiktok.com/@linh_dan_20x/video/7703744638946970900 |
| 2026-11-03 | `aidancing-shopee-dam-lua-duoi-ca-irenebbyy-bo1-2026-11-032208.mp4`: đầm lụa đuôi cá Shopee, clip của @irenebbyy_ | https://www.tiktok.com/@linh_dan_20x/video/7703964835565899016 |
