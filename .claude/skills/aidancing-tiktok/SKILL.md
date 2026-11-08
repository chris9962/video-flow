---
name: aidancing-tiktok
description: Làm video nhảy quảng cáo quần áo bằng mặt mẫu cố định rồi đăng TikTok. Có bản nhiều bộ đồ: 1 link TikTok + N link Shopee → N clip. Chuỗi gồm 4 bước. (1) Lấy khung đầu của clip nhảy mẫu. (2) ChatGPT ghép mặt mẫu và trang phục vào khung đó (block "Ghép mẫu" của repo ~/video-flow). (3) aidancing.net copy chuyển động của clip lên ảnh ghép (block "AI Dancing"). (4) Đăng video lên TikTok @linh_dan_20x qua TikTok Studio. Dùng mỗi khi người dùng nhắc "flow aidancing", "aidancing", "ghép mẫu", "clip nhảy mẫu", "mặt mẫu", "thay mặt thay đồ vào clip", "AI copy chuyển động", "đăng tiktok", "up tiktok", "tiktok studio", "linh_dan_20x", "biến hình", "ghép clip thay đồ", "đổi đồ theo nhạc", "tải job aidancing", hoặc gửi clip nhảy kèm ảnh quần áo hay link Shopee, kể cả khi không nhắc tên skill. Không dùng cho video vòng đời động vật (flow-chain-video) hay chỉ tải video (video-downloader).
---

# aidancing-tiktok

Skill này làm video nhảy quảng cáo quần áo. Mẫu cố định mặc trang phục mới và nhảy theo một clip có sẵn. Sau đó skill đăng video lên TikTok @linh_dan_20x.

`<skill>` là thư mục chứa file này, thường là `~/.claude/skills/aidancing-tiktok`.

Trả lời người dùng bằng tiếng Việt kỹ thuật: kết luận trước, câu ngắn, số liệu thay cho tính từ.

## Luồng

| Bước | Công cụ | Kết quả |
|---|---|---|
| 1. Chọn và lấy khung đầu của clip | `scripts/khung-dau.mjs` cắt clip khi cần, rồi ffmpeg trong block Ghép mẫu (`tryon`) | Ảnh dáng 9:16 |
| 2. Ghép mặt mẫu và trang phục vào ảnh dáng | ChatGPT, cùng 1 cuộc chat | Ảnh ghép 9:16, cùng khung với clip |
| 3. Copy chuyển động của clip lên ảnh ghép | aidancing.net, model id 192 "AI Copy Chuyển Động Dùng Nền Ảnh v5.1" | Video 720×1280, dài bằng clip, có tiếng của clip |
| 4. Đăng video | TikTok Studio | Link bài TikTok |
| Từ 2 bộ đồ: video biến hình | `scripts/bien-hinh-model.mjs`: 1 job model 156/157/158 tự đổi ảnh theo mốc. Claude chọn mốc. | 1 video đổi đồ N−1 lần theo nhạc |

`scripts/chay-workflow.mjs` làm bước 1–3 qua API của server video-flow. `scripts/dang-tiktok.mjs` làm bước 4. `scripts/tai-job.mjs` tải video của job aidancing theo mã job. Bước 3c mô tả cách ghép video biến hình.

## Câu hỏi đầu tiên

Khi người dùng gửi ảnh hoặc link sản phẩm, Claude hỏi ngắn gọn, 1 câu:

> Làm clip đơn (1 bộ) hay video biến hình 2, 4 hay 6 bộ?

| Lựa chọn | Cách làm |
|---|---|
| Clip đơn | 1 clip AI Dancing, model 192 |
| Biến hình 2 bộ | Model 156, video 10 s |
| Biến hình 4 bộ | Model 157, video 20 s |
| Biến hình 6 bộ | Model 158, video 30 s |

Biến hình: bộ đầu là đồ bộ, mặt mộc. Cùng lúc, hỏi có đổi nền không. Người dùng yêu cầu ngày 2026-11-08: hỏi rõ nhưng ngắn, không viết dài.

Mặt mẫu mặc định: `assets/mat-mau/mau-2-02-mac-dinh-nhin-thang-cuoi-mim.png` (mẫu 2, nhìn thẳng, cười mỉm, 1199×1312). Người dùng không nói gì thì dùng ảnh này, không hỏi chọn mẫu. Người dùng đặt ngày 2026-11-08.

## Quy tắc bắt buộc

- Mỗi lần chạy bước 3 tốn credit aidancing. Claude phải báo chi phí và chờ người dùng đồng ý trước khi chạy. Ngoại lệ: người dùng đã cho phép trước một số lần cụ thể.
- Đăng TikTok là hành động công khai. Claude chỉ đăng khi người dùng yêu cầu đăng. Claude báo mô tả đã dùng trong câu trả lời.
- Claude không được bật nhãn "AI-generated content" trên TikTok. Người dùng yêu cầu ngày 2026-11-03.
- Claude không được đổi cài đặt tài khoản TikTok. Hộp thoại "Turn on automatic content checks?" phải đóng bằng Cancel.
- Claude không được xoá dữ liệu và không được gửi tin nhắn cho người khác.
- Sau khi xong việc, Claude đóng mọi tab Chrome mà Claude hoặc script đã mở. Claude không đóng tab người dùng đã mở trước.
- Video biến hình (bước 3c): Claude phải xem ảnh kiểm tra và chốt thứ tự bộ đồ, mốc đổi đồ trước khi chạy `bien-hinh.mjs dung`. Claude không được dựng thẳng từ gợi ý của script. Người dùng yêu cầu ngày 2026-11-07.

## Ràng buộc của ảnh ghép

Người dùng đặt các ràng buộc này ngày 2026-11-03:

- Ảnh ghép có tỉ lệ 9:16. Cỡ và vị trí của người trong ảnh phải khớp với clip.
- Ảnh dáng là khung đầu của clip, vì aidancing mở video bằng đúng ảnh ghép. Nếu khung đầu không có mặt đầy đủ, Claude cắt clip theo mục "Chọn khung đầu" ở bước 1.
- Bước ghép chỉ đổi mặt và quần áo.
- Ngày 2026-11-03, người dùng yêu cầu giữ nền của clip. Ngày 2026-11-05, người dùng đổi yêu cầu: sau bước ghép, block Ghép mẫu đưa người vào ảnh nền của người dùng. Chi tiết nằm ở mục "Ảnh nền" của bước 1. `--giu-nen` giữ cách cũ.
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
| Mặt mẫu | Ảnh trong `<skill>/assets/mat-mau/`, xem bảng dưới | Người dùng chọn mẫu. Trong mẫu đó, Claude chọn ảnh có góc mặt gần nhất với mặt trong khung đầu của clip. |
| Trang phục | Ảnh sản phẩm người dùng gửi, hoặc ảnh Claude tìm trên mạng khi người dùng yêu cầu | Thấy toàn bộ trang phục, nền trơn. Không bắt buộc: bỏ trống thì giữ quần áo trong clip. |

Thư mục có 2 mẫu, là 2 người khác nhau. Từ 2026-11-08, mặc định dùng ảnh mặc định của mẫu 2 (mục "Câu hỏi đầu tiên"), không hỏi. Chỉ đổi khi người dùng nói rõ mẫu khác.

| Mẫu | File | Góc mặt | Cỡ |
|---|---|---|---|
| 1 | `01-nhin-thang-cuoi.png` | Nhìn thẳng, cười | 1126×1397 |
| 1 | `02-quay-3-4-sang-phai-cuoi-mim.png` | Quay 3/4 sang phải khung hình, cười mỉm | 1122×1402 |
| 1 | `03-quay-sang-phai-moi-khep.png` | Quay sang phải khung hình nhiều hơn ảnh 02, môi khép | 487×603 |
| 2 | `mau-2-01-nhin-thang-cuoi-mim.png` | Nhìn thẳng, cười mỉm, đầu hơi nghiêng | 1254×1254 |
| 2, **mặc định** | `mau-2-02-mac-dinh-nhin-thang-cuoi-mim.png` | Nhìn thẳng, cười mỉm, nền hoa trắng, váy lụa kem | 1199×1312 |

- Mẫu 1: tóc đen dài uốn sóng, nền xám. Người dùng xác nhận ngày 2026-11-03.
- Nguồn của mẫu 1: 4 node ảnh bên trái nhất của workflow `ecbec438-a333-4357-a3a1-2bd10e02e4f5` ("Trường") trong video-flow. 2 node trong số đó chứa cùng 1 file, md5 `906ff40b…`, nên mẫu 1 chỉ có 3 ảnh.
- Mẫu 2: tóc đen dài thả, nền vườn có hoa giấy hồng, áo hồng hoa nhí, khuyên tai hình nơ. Người dùng gửi ngày 2026-11-05.
- Mẫu 2 chưa dùng lần nào. Lần đầu dùng, Claude kiểm tra ảnh ghép không lấy áo hoặc khuyên tai của ảnh mặt.
- Mẫu 1 không có ảnh quay sang trái khung hình. Mặt trong clip quay sang trái thì Claude lật ngang ảnh 02 hoặc 03. Lật ngang làm đổi bên rẽ ngôi tóc.
- Mẫu 2 chỉ có 1 ảnh nhìn thẳng.
- Khi đưa lên block ảnh của video-flow, Claude upload file từ thư mục này qua `POST /api/assets`.
- Link `play` của tikwm chỉ có bản 576×1024. Claude phải gọi tikwm với tham số `hd=1` và tải link `hdplay`. Ngày 2026-11-05, link `hdplay` cho bản 1080×1920, mã HEVC. Bản 576×1024 làm ảnh dáng bị nhoè.
- Clip HEVC chưa qua aidancing lần nào. `khung-dau.mjs --tu` mã hoá lại sang H.264. Nếu Claude dùng clip HEVC gốc, Claude phải mã hoá lại sang H.264 trước khi dùng.
- Ngày 2026-11-03, ffprobe đọc clip trên Desktop có lần quá thời gian chờ. Khi đó, Claude chép clip vào scratchpad rồi dùng bản chép.

### Ảnh nền

Ảnh nền nằm trong `<skill>/assets/background/`. Ngày 2026-11-05, người dùng gửi ảnh này và yêu cầu chỉ dùng ảnh này.

| File | Nội dung | Cỡ |
|---|---|---|
| `nen-01-phong-khach-sofa-be.png` | Phòng khách: sofa chữ L màu be, bàn trà mặt đá chân vàng, bình hoa hồng, sàn gỗ nâu, cửa gỗ nâu | 962×1635 |

- Người dùng không dùng các ảnh nền cũ trong `~/video-flow/app/data/assets/`: phòng khách có bếp `2cfdaf80…png`, phòng sofa cam `d9eba5a2…png`, phòng trắng `d97a9eac…png`.

Trước khi chạy Ghép mẫu, Claude phải hỏi người dùng có đổi nền hay không. Người dùng yêu cầu ngày 2026-11-07. Có đổi nền: dùng ảnh nền mặc định hoặc `--background`. Không đổi nền: thêm `--giu-nen`. Claude hỏi cùng lúc với câu hỏi chọn mẫu 1 hay mẫu 2.

Cách flow dùng ảnh nền, theo yêu cầu của người dùng ngày 2026-11-05:
- `ghep-nhieu-bo.mjs` nối ảnh nền vào cổng Background của mọi block Ghép mẫu, kể cả nhánh đồ bộ. Mọi clip có cùng nền, nên clip biến hình liền nền.
- Block Ghép mẫu gửi thêm 1 message trong cùng cuộc chat ChatGPT, sau bước ghép mặt và trang phục. Block lưu ảnh trước khi đổi nền thành `tryon-<i>-ghep.png` trong thư mục run. Ảnh sau khi đổi nền là kết quả của block.
- Khung hình phải giữ đúng ảnh trước khi đổi nền: tỉ lệ, cỡ người, vị trí người, chỗ khung cắt ngang người. Căn phòng trong ảnh nền được đổi góc nhìn cho khớp góc máy của ảnh trước khi đổi nền. Người dùng đặt yêu cầu này ngày 2026-11-05.
- Script đặt prompt riêng `BG_PROMPT` vào `config.bgPrompt` của block. Lý do: lần chạy ngày 2026-11-02 dùng prompt mặc định `TRYON_DEFAULT_BG`. ChatGPT giữ góc máy của ảnh nền, dời người từ bên trái ra giữa khung và làm người nhỏ đi.
- `BG_PROMPT` cũng yêu cầu bỏ chữ và khung bình luận TikTok của clip.
- Model aidancing 192 dùng nền của ảnh ghép, nên video ra có nền mới.
- `chay-workflow.mjs` ở bước 3 chưa nối ảnh nền.

Số liệu lần thử ngày 2026-11-05, workflow `fa420941-697b-45d1-9b48-5853827ebab9`: clip luulee cắt từ giây 0,2, mẫu 2, đầm lụa bộ 1, prompt `BG_PROMPT`.
- Block Ghép mẫu chạy 140 giây, gồm cả bước đổi nền.
- Căn phòng có đủ sofa chữ L màu be, bàn trà, bình hoa, cửa gỗ và sàn gỗ. Góc nhìn căn phòng đổi theo ảnh cũ.
- Khung bình luận TikTok và chữ trên tường của clip không còn.
- Người lệch khoảng 6% chiều ngang và 2% chiều dọc so với ảnh trước khi đổi nền. Cỡ người gần như giữ nguyên. Claude đo bằng cách chồng 2 ảnh. Lần chạy ngày 2026-11-02 với prompt mặc định lệch nhiều hơn: người dời từ bên trái ra giữa khung và nhỏ đi.

### Chọn khung đầu

aidancing mở video bằng ảnh ghép, rồi chạy clip từ giây 0. Vì vậy, ảnh dáng phải là khung đầu của clip. Ở một số clip, khung đầu có mặt quay nghiêng, bị che hoặc bị mờ. Khi đó, ChatGPT ghép mặt kém.

Người dùng yêu cầu ngày 2026-11-05: Claude tự xem khung và tự chọn khung. Script chỉ dùng Node và ffmpeg, vì người dùng có thể chạy skill trên Windows. Claude không được dùng Apple Vision hoặc công cụ chỉ có trên macOS.

Cảnh báo: Claude không được chỉ đổi `frameTime` của block Ghép mẫu. aidancing vẫn chạy clip gốc từ giây 0, nên khung đầu của video sẽ lệch với ảnh ghép.

1. Claude chạy:
   ```bash
   node <skill>/scripts/khung-dau.mjs <clip.mp4> [--giay 3] [--fps 5]
   ```
   - Script chia 3 giây đầu thành 15 khoảng, mỗi khoảng 0,2 giây.
   - Mỗi ô là khung nét nhất trong khoảng của ô, đo bằng filter `blurdetect`.
   - Script ghi `luoi.jpg` 5 cột vào thư mục `<tên clip>-khung-dau/` cạnh clip.
   - Script in mốc `--tu` và mức mờ của từng ô. Mức mờ càng nhỏ, khung càng nét.
2. Claude xem `luoi.jpg`, rồi mở khung lẻ `kNN.jpg` của các ô ứng viên. Trong lưới, mặt chỉ cao khoảng 30 px. Khung lẻ giữ độ phân giải gốc.
3. Claude chọn ô sớm nhất đạt cả 5 điều kiện:
   - Khung phải thấy người từ đầu gối trở lên. Thấy toàn thân thì càng tốt. Clip quảng cáo quần áo, nên ảnh dáng phải thấy trang phục. Người dùng đặt điều kiện này ngày 2026-11-05. Khung cận mặt hoặc nửa người không đạt.
   - Mặt gần nhìn thẳng, thấy rõ 2 mắt và 2 má. Người dùng đặt tiêu chí này ngày 2026-11-05. Mặt quay 3/4 vẫn thấy 2 mắt, nhưng có 1 má bị khuất, nên không đạt.
   - Tay, tóc hoặc điện thoại không che mặt.
   - Mắt mở. Khung nét nhất có thể là khung đang chớp mắt.
   - Mặt nét. Ở clip ninhanh, khung nét có mức mờ 5,5–6. Khung mờ do chuyển động có mức mờ 7–11.
4. Nếu ô gần đạt nhưng đang chớp mắt hoặc hơi mờ, Claude xem mọi khung quanh ô đó:
   ```bash
   node <skill>/scripts/khung-dau.mjs <clip.mp4> --quanh <mốc của ô>
   ```
   Script ghi lưới mọi khung trong ±0,1 giây vào thư mục `<tên clip>-quanh-<giây>s/`.
5. Nếu ô 1 đạt, Claude dùng clip gốc. Nếu khung khác đạt, Claude chạy:
   ```bash
   node <skill>/scripts/khung-dau.mjs <clip.mp4> --tu <mốc của ô>
   ```
   Script ghi `<tên clip>-tu-<giây>s.mp4` cạnh clip gốc. Claude dùng clip này cho cả block Ghép mẫu và block AI Dancing.
6. Nếu 3 giây đầu không có ô đạt, Claude mở `luoi.jpg` cho người dùng xem và hỏi người dùng chọn giây nào.

Ghi chú kỹ thuật:
- Script cần ffmpeg ≥ 6.0, vì filter `blurdetect` có từ bản 6.0.
- Script đọc mốc giây thật của từng khung từ kết quả của `blurdetect`, rồi lấy khung bằng filter `select`. Không dùng filter `fps`: filter này lấy khung cuối của mỗi khoảng, nên mốc lệch tới 0,067 giây ở clip 30 fps.
- Script cắt bằng `-ss` đặt trước `-i` và mã hoá lại bằng libx264. Script trừ 1 ms khỏi mốc `--tu`. Lý do: mốc in ra có 3 chữ số thập phân. Ví dụ, khung 0,46667 giây in thành 0,467, và `-ss 0.467` bỏ qua khung đó.
- Ngày 2026-11-05, khung đầu của clip cắt khớp khung đã chọn, SSIM 0,99 ở cả 2 clip thử.
- Nếu clip dài hơn 25 giây, Claude cắt từ khung đã chọn trước, rồi mới cắt còn 24,9 giây.

Số liệu ngày 2026-11-05, clip luulee 576×1024, 30 fps, 19,4 giây:
- Ô 1, giây 0: mặt quay 3/4 sang phải, 1 má bị khuất. Người đứng nghiêng.
- Ô 2, giây 0,2: mặt gần nhìn thẳng, thấy rõ 2 mắt và 2 má. Khung thấy người từ đầu tới bắp chân. Claude chọn ô 2, người dùng xem ảnh so sánh và đồng ý.
- Clip cắt còn 19,2 giây.
- 4 video luulee làm xong ngày 2026-11-05 dùng clip gốc, chưa cắt.

Số liệu ngày 2026-11-05, clip ninhanh, quay ban đêm, 30 fps, 15,05 giây:
- Lần thử đầu dùng bản 576×1024 và khung đầu của mỗi khoảng. Claude chọn giây 0,4. Người dùng xem ảnh so sánh và nói: "ảnh bị nhoà hết rồi".
- Lần thử 2 dùng bản HD 1080×1920 tải qua tikwm với `hd=1`, và chọn khung nét nhất trong mỗi khoảng.
- Ô 3 là giây 0,533, mức mờ 5,49, nhưng mắt khép một nửa. `--quanh 0.533` cho thấy khung giây 0,467: mức mờ 5,54, mắt mở, mặt nhìn thẳng, thấy toàn thân. Claude chọn giây 0,467.
- Clip cắt còn 14,61 giây, cỡ 1080×1920, H.264, 17,9 MB.
- Tay vẫn mờ ở mọi khung quanh giây 0,5, vì người trong clip đang vẫy tay.

## Bước 2 — Dry run và báo chi phí

```bash
node <skill>/scripts/chay-workflow.mjs --face <mặt.png> --outfit <trang-phục.png> --clip <clip.mp4> [--quality fast|quality] --dry-run
```

Lệnh in kích thước clip, độ dài, gói aidancing và số credit. Lệnh không gọi ChatGPT và không gọi aidancing.

| Chế độ | Giá | Gói 15 giây | Thời gian chờ đo ngày 2026-11-03 | Video ra |
|---|---|---|---|---|
| `fast`, mặc định từ 2026-11-07 | 0,15 credit/giây | 2,25 credit | 10 phút | 576×1024, mờ hơn |
| `quality` | 0,29 credit/giây | 4,35 credit | 20–22 phút | 720×1280 |

- Ngày 2026-11-07, người dùng chọn `fast` làm mặc định. Claude chỉ dùng `quality` khi người dùng yêu cầu.

- Gói là số nhỏ nhất trong 10, 15, 20, 25 giây mà đủ dài cho clip. aidancing tính tiền theo gói, không theo độ dài clip.
- Claude gửi người dùng số credit, rồi chờ người dùng đồng ý.

## Bước 3 — Chạy chuỗi

```bash
node <skill>/scripts/chay-workflow.mjs --face <mặt.png> --outfit <trang-phục.png> --clip <clip.mp4> [--quality fast|quality] [--out <video.mp4>]
```

- Claude chạy lệnh ở chế độ nền và đọc log mỗi vài phút. Claude không chờ hết thời gian chờ của script.
- Script tạo 1 workflow mới từ workflow mẫu `b45b8398-7002-47a1-86e0-5aaa4c604587` ("Ghép mẫu từ clip nhảy"). Script không sửa workflow mẫu. Log có link editor của workflow mới.
- Bước ghép ảnh mất 2–4 phút. Nếu bước này quá 5 phút, Claude xem tab ChatGPT trong Chrome CDP.
- Kết quả: `<repo>/videos/aidancing/aidancing-<tên clip>-<thời điểm>.mp4`, cùng ảnh ghép `…-anh-ghep.png`.
- Cảnh báo: Claude không được sửa file trong `~/video-flow/app/apps/server` lúc chuỗi đang chạy. `tsx watch` khởi động lại server, và run đang chạy dừng theo.
- Nếu server khởi động lại, script chờ server chạy lại. Ảnh ghép đã có thì script chỉ chạy lại block AI Dancing với đúng ảnh đó. Service aidancing nhận ra cùng input và theo dõi tiếp job cũ, nên không trừ credit lần 2.
- Khi ChatGPT lỗi, tab ChatGPT để mở để Claude xem lỗi.
- Phần chạy thật của script chưa chạy lần nào. Ngày 2026-11-03, chỉ dry run đã chạy. Lần đầu chạy thật, Claude đọc log sát hơn.

## Bước 3b — Nhiều bộ đồ từ link Shopee

Người dùng gửi 1 link TikTok và N link Shopee. Kết quả là N clip trên cùng 1 clip TikTok, mỗi clip 1 bộ đồ. Người dùng yêu cầu luồng này ngày 2026-11-03. Phần chính là tạo clip. Đăng TikTok là phần phụ.

1. Claude tải clip TikTok bằng skill `video-downloader`. Clip dài hơn 25 giây: Claude hỏi người dùng, rồi cắt còn 24,9 giây bằng ffmpeg. Gói lớn nhất của aidancing là 25 giây. Ngày 2026-11-03, người dùng chọn cắt.
   - Sau đó, Claude chọn khung đầu theo mục "Chọn khung đầu" ở bước 1. Các bước sau dùng clip đã cắt.
2. Claude mở từng link Shopee trong tab nền của Chrome CDP, dùng `Target.createTarget` với `background: true`.
   - Claude đọc tên sản phẩm, ảnh `img[src*="susercontent.com/file/"]` và tên các màu, là `button[aria-label]`.
   - Khoảng 8 ảnh đầu là ảnh gallery, các ảnh sau là icon hoặc ảnh của sản phẩm khác.
   - Claude dùng ảnh bìa, tức ảnh đầu. Ảnh bìa quyết định màu.
   - Claude lưu ảnh vào `~/Desktop/Mẫu/Ảnh/shopee/<shopId>-<itemId>/`, rồi đóng tab.
3. Claude hỏi câu ở mục "Câu hỏi đầu tiên" (clip đơn hay biến hình mấy bộ, có đổi nền không) ngay khi nhận link. Mặt mẫu dùng ảnh mặc định, trừ khi người dùng nói mẫu khác.
   - Người dùng gửi 1 sản phẩm (1 link hoặc 1 ảnh): Claude chỉ tạo 1 clip của sản phẩm đó. Không thêm đồ bộ, không ghép biến hình. Người dùng gửi từ 2 sản phẩm trở lên: Claude thêm 1 bộ đồ bộ miền Tây bằng `--do-bo-image <ảnh>` làm clip đầu, rồi ghép video biến hình (bước 3c). Người dùng đặt quy tắc này ngày 2026-11-08, thay quy tắc "luôn thêm đồ bộ" ngày 2026-11-03.
   - Claude lấy ảnh đồ bộ từ Google Hình ảnh, từ khoá "đồ bộ miền tây", trong tab nền của Chrome CDP. Claude bấm vào 1 ảnh có người mặc nguyên bộ, rồi đọc ảnh cỡ lớn trong khung xem trước: `img` có `src` http, không thuộc gstatic, `naturalWidth` ≥ 400. Ảnh ghép nhiều khung thì Claude cắt riêng 1 khung.
   - Không dùng `--do-bo`, tức ChatGPT tự vẽ đồ bộ. Ngày 2026-11-03 người dùng xem bản ChatGPT vẽ và nói "đồ bộ gpt gen ra chán quá".
   - Clip đồ bộ là clip đầu của clip biến hình. Ở clip này, mẫu để mặt mộc, không trang điểm. Các clip Shopee phía sau giữ trang điểm như ảnh mặt mẫu. Người dùng yêu cầu ngày 2026-11-05 để người xem thấy rõ khác biệt khi biến hình.
   - Script tự thêm yêu cầu mặt mộc, hằng `MAT_MOC`, vào prompt ghép mẫu của riêng nhánh đồ bộ. Yêu cầu này chưa chạy thật lần nào. Lần đầu chạy, Claude kiểm tra ảnh ghép đồ bộ: không son, không kẻ mắt, gương mặt vẫn đúng mẫu.
4. Claude chép clip, mặt và ảnh sản phẩm vào scratchpad, rồi chạy:
   ```bash
   cd <skill>/scripts && node ghep-nhieu-bo.mjs --clip <clip.mp4> --face <mặt.png> --product <a.jpg> [--product <b.jpg> ...] --do-bo-image <đồ-bộ.jpg> --name "<tên>" [--background <nền.png> | --giu-nen]
   ```
   - Claude chỉ chạy lệnh khi người dùng đã trả lời có đổi nền hay không.
   - Mặc định, script dùng ảnh nền `assets/background/nen-01-phong-khach-sofa-be.png`. `--background` chọn ảnh nền khác. `--giu-nen` giữ nền của clip.
   - Script tạo 1 workflow. Mỗi sản phẩm có 3 block: ảnh Shopee gốc, block "Ảnh" tách sản phẩm qua ChatGPT, và block "Ghép mẫu".
   - Prompt Ghép mẫu là prompt mặc định, thêm 2 dòng: gợi ý kiểu tóc hợp trang phục, và giữ nguyên nhận diện gương mặt.
   - Script dừng sau Ghép mẫu.
   - Claude so ảnh trước và sau khi đổi nền: cỡ người, vị trí người và khung cắt phải giống nhau. Nếu người bị dời hoặc nhỏ đi, Claude báo người dùng trước bước 6.
5. Claude mở workflow trên FE bằng `open http://localhost:5173/editor/<id>`. Người dùng xem ảnh ghép trên FE. Claude không cần báo credit.
6. Người dùng duyệt xong:
   - **Từ 2 bộ trở lên (mặc định từ 2026-11-08):** không chạy N clip. Claude chọn mốc đổi đồ (bước 3c) rồi chạy 1 job model biến hình với các ảnh ghép, đồ bộ đứng đầu:
     ```bash
     cd <skill>/scripts && node bien-hinh-model.mjs --video <clip> --anh <tryon đồ bộ> --anh <tryon bo1> ... --moc <giây,...> [--quality fast|quality]
     ```
     Ảnh ghép là `config.content.path` của các block Ghép mẫu (log của lần chạy Ghép mẫu in đường dẫn). Báo credit theo dòng đầu của `--dry-run`, chờ đồng ý.
   - **1 bộ:** 1 clip AI Dancing như cũ:
   ```bash
   cd <skill>/scripts && node ghep-nhieu-bo.mjs --aidancing <workflowId> [--quality fast|quality] [--bo bo1 --bo do-bo ...]
   ```
   - Script thêm 1 block AI Dancing sau mỗi block Ghép mẫu. Engine chạy các nhánh song song.
   - Người dùng chỉ chọn một số bộ thì Claude thêm `--bo <nhãn>` cho từng bộ. Nhãn là `vfLabel` của block Ghép mẫu: `bo1`, `bo2`…, `do-bo`. Ngày 2026-11-05, người dùng chỉ chọn bộ áo dài, `--bo bo1`.
   - Sau khi thêm block, script chờ 15 giây rồi đọc lại workflow. Block bị xoá thì script dừng và không gửi job.
   - Script đọc video từ `data/runs/<runId>/<nodeId>/outputs.json`, rồi chép vào `<repo>/videos/aidancing/aidancing-<tên>-bo<n>-<thời điểm>.mp4`.

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

Số liệu lần chạy ngày 2026-11-05, clip @danggnhung cắt từ giây 3,933, áo dài cách tân dài tới mắt cá, mẫu 2, có đổi nền:
- 2 block Ghép mẫu có đổi nền chạy song song, mất 209–217 giây.
- Người dùng chỉ chọn bộ áo dài, `--bo bo1`. Tab FE vẫn mở nhưng không xoá block AI Dancing trong 15 giây kiểm tra.
- Job aidancing 3274223, gói 25 giây, quality, 5,5 credit: mất 2030 giây, tức khoảng 34 phút.
- Video ra 720×1280, 22,3 giây, có tiếng. Nền là phòng khách của ảnh ghép.
- Từ giây 18 của video, clip gốc lùi camera ra toàn thân. Ảnh ghép không có phần dưới đầu gối, nên aidancing tự vẽ phần này: áo dài ngắn lại thành váy ngang gối, mất quần, mẫu đi giày trắng. Với clip lùi camera như vậy, Claude báo người dùng trước khi chạy aidancing.

Số liệu lần chạy thứ 3, ngày 2026-11-05: 3 bộ cũ và 1 đồ bộ, mặt mẫu 2, clip @luulee.ninhhiep 19,4 giây. Workflow `5cf0dd52-75a0-4db2-abf3-848b4a8c778a`.
- Dùng lại bộ đồ cũ: Claude lấy ảnh đã tách sạch, `image-0.png` của block tách sản phẩm cũ, trong `~/video-flow/app/data/runs/`. Workflow cũ còn ghi đường dẫn `~/video-flow/data/…` của bản trước khi gom repo.
- 4 block Ghép mẫu chạy song song: 3 block đạt sau 236–257 giây. Block bộ 1 báo lỗi "ChatGPT chưa gửi prompt". Claude chạy lại riêng block đó bằng `POST /api/workflows/<id>/run` với `{"from": "<id block>"}`, và lần chạy lại đạt.
- Mặt mộc: ảnh ghép và video đồ bộ có môi nhạt, không kẻ mắt. 3 bộ Shopee có môi đỏ. Khác biệt thấy được ở giây 9,5 của video.
- Mẫu 2: ảnh ghép không lấy áo hồng của ảnh mặt. 3 trên 4 ảnh ghép lấy khuyên tai hình nơ của ảnh mặt.
- 4 job aidancing gói 20 giây chạy song song, xong sau 1617–1648 giây. Video ra 720×1280, 19,37 giây, có tiếng.
- Lỗi nhỏ trong video: chữ trên biển nền bị méo dần. Khung bình luận TikTok ở video bộ 2 có thêm 1 khung chữ méo ở giữa video. Corset của bộ 3 có thêm dây vai ở cuối video.

## Bước 3c — Ghép video biến hình từ N clip

Dùng khi người dùng có N clip aidancing cùng 1 clip nhảy mẫu, khác bộ đồ, và muốn ghép thành 1 video đổi đồ theo nhạc. Người dùng yêu cầu cách làm này ngày 2026-11-07.

Vai trò: script đo và dựng. **Claude xem ảnh kiểm tra và ra quyết định**: thứ tự bộ đồ, điểm đổi đồ, duyệt bản cuối. Người dùng yêu cầu Claude review và quyết định, không chạy tự động hoàn toàn.

Bắt buộc: Claude review **trước khi ghép**. Gợi ý `--cat` của script chỉ là điểm bắt đầu. Lý do, lần thử ngày 2026-11-07 với clip @irenebbyy_: nhạc không có drop, gợi ý của script để bộ thứ 2 hiện 2,2 s. Cú đổi đồ đẹp nhất, tay che ống kính ở 10,37 s, chỉ thấy được khi xem ảnh. Script không đo được biểu cảm và động tác che camera.

Trong câu trả lời, Claude báo bảng quyết định: mốc, bộ đồ, lý do chọn mốc. Nếu Claude không dùng gợi ý của script, Claude ghi lý do.

Quy tắc của người dùng, ngày 2026-11-07:
- N clip thì đổi đồ đúng N−1 lần. Mỗi bộ đồ xuất hiện 1 lần. Không chớp nháy qua lại nhiều bộ.
- Clip đầu là bộ đồ bộ, mặt mộc. Các bộ sau là đồ Shopee.
- Điểm đổi đồ phải có lý do trong nhạc hoặc động tác. Đổi theo số giây chia đều thì người xem thấy không có gì đặc biệt.
- Điều kiện chính: đổi đồ lúc **hết 1 câu hát và có động tác** (nháy mắt, quay đầu, tay che camera). Đổi giữa câu hát thì không hay.

Thư mục làm việc: `<repo>/videos/bien-hinh-<tên>/`, gồm `clip/` (clip đầu vào), `phan-tich/` (ảnh của lệnh `phan-tich`), video kết quả và thư mục `-kiem-tra/` của từng bản dựng. Git bỏ qua `videos/`. Người dùng yêu cầu ngày 2026-11-07: không để video kết quả trên Desktop.

### Cách mặc định: model biến hình 156/157/158, 1 job

Người dùng chọn ngày 2026-11-08 sau khi xem kết quả model 157: "kết quả quá sắc sảo rồi". Video biến hình chạy bằng 1 job `bien-hinh-model.mjs`, không tạo N clip, không ghép.
1. Claude chọn N−1 mốc đổi đồ như cũ: `bien-hinh.mjs phan-tich <clip mẫu> <clip mẫu>` (đưa clip mẫu 2 lần), xem `toan-bo.png`, theo quy tắc hết câu + động tác.
2. `bien-hinh-model.mjs --dry-run` in model, số credit. Script chọn model nhỏ nhất đủ ảnh và đủ dài cho clip: 156 (2 ảnh, 10 s), 157 (4 ảnh, 20 s), 158 (6 ảnh, 30 s). Mọi ô đều bắt buộc. Thiếu ảnh thì script lặp ảnh cuối ở ô thừa, mốc thừa đặt sau mốc cuối 0,5 s. Cách lấp này chưa thử: lần đầu Claude xem có giật ở mốc thừa không.
3. Clip 20–30 s với 4 bộ: script chọn 158 (3,9 credit) để giữ đủ độ dài. `--model 157` (2,6 credit) cắt video còn 20 s. Claude hỏi người dùng chọn.
4. Chạy thật, rồi kiểm tra như bước 6 cũ: xem khung quanh từng mốc.
5. Hiệu ứng zoom giật + chớp chưa có trên video của model. Muốn có thì Claude thêm bằng ffmpeg ở đúng các mốc (chưa viết script).

Ảnh vào: ảnh ghép của block Ghép mẫu (khung đầu của clip). Lần thử 157 dùng khung lấy từ clip cũ ở giây bắt đầu từng đoạn, nên chưa biết model có cần ảnh cùng tư thế với khung ở mốc không. Lần đầu chạy với ảnh ghép khung đầu, Claude xem điểm đổi có giật tư thế không.

### Cách dự phòng: chọn mốc trước, chạy aidancing theo đoạn

Dùng khi model biến hình lỗi hoặc cần nhiều hơn 6 bộ. Người dùng đồng ý ngày 2026-11-08. Thay vì chạy N clip full rồi ghép, Claude chọn mốc đổi đồ trên clip mẫu trước, cắt clip mẫu thành N đoạn, rồi chạy aidancing cho từng đoạn với 1 bộ đồ. Mỗi đoạn tính gói 10 s nếu ≤ 10 s.

Ví dụ clip @irenebbyy_ 24,83 s, 4 bộ: cách cũ 4 × 25 s = 100 s (15 credit fast, 29 quality). Cách mới 4 × 10 s = 40 s (6 credit fast, 11,6 quality).

1. `node <skill>/scripts/bien-hinh.mjs phan-tich <clip mẫu> <clip mẫu>` để có chỗ hết câu, nhịp, `toan-bo.png`. Lệnh cần ≥ 2 clip, nên đưa clip mẫu 2 lần. Claude chốt N−1 mốc theo quy tắc ở trên.
2. `node <skill>/scripts/bien-hinh.mjs cat-mau <clip mẫu> --cat <mốc,...>`: script ghi `truoc-moc-<n>.jpg`, 12 khung quanh (mốc − 1,5 s) và in giây của từng ô.
3. Claude xem ảnh, chọn với mỗi mốc 1 khung bắt đầu sớm hơn mốc 1–2 s, mặt nhìn thẳng, mắt mở, không bị che. Mốc đổi đồ có thể là lúc mặt bị che (tay che ống kính): đoạn sau đã bắt đầu từ trước đó, ảnh ghép lấy khung mặt đẹp.
4. `node <skill>/scripts/bien-hinh.mjs cat-mau <clip mẫu> --cat <mốc,...> --bat-dau 0,<giây>,...`: ghi `doan-<i>.mp4`. Đoạn i chạy từ mốc bắt đầu tới mốc đổi đồ kế tiếp + 0,3 s (`--du`, để hoà hình). Script in số giây tính tiền, so với cách cũ, và in lệnh `dung`.
5. Mỗi đoạn chạy 1 workflow riêng: `ghep-nhieu-bo.mjs --clip <doan-i.mp4> --product <bộ i>` (đoạn 1: `--do-bo-image`). Ảnh ghép tự lấy khung đầu của đoạn. Báo credit, chờ đồng ý, rồi `--aidancing` cho từng workflow. Các job chạy song song.
6. Ghép bằng lệnh `dung` mà script in ở bước 4, thêm `--hieu-ung`, `--flash-cat` như cách cũ. `--bat-dau` và `--nhac <clip mẫu>` báo cho `dung` biết mỗi video đoạn bắt đầu ở giây nào của clip mẫu, và lấy nhạc liền từ clip mẫu.

Kiểm chứng ngày 2026-11-08, không tốn credit: cắt 4 clip full @irenebbyy_ theo đoạn rồi ghép bằng `--bat-dau`, so với ghép từ 4 clip full bằng cách cũ: SSIM 0,99 ở cả 4 đoạn. Lỗi đã sửa: mốc bắt đầu phải làm tròn về đúng khung, nếu không đoạn lệch 1 khung (SSIM 0,88).

Chưa chạy aidancing thật theo đoạn lần nào. Lần đầu, Claude kiểm tra điểm nối: nền và ánh sáng 2 đoạn có lệch không, vì mỗi đoạn có ảnh ghép riêng.

Hiệu ứng mặc định, người dùng chọn ngày 2026-11-08: điểm đổi từ đồ bộ sang bộ 2 là zoom giật + chớp sáng. Các điểm sau hoà hình, chớp ở điểm cuối. Với 4 bộ:
`--hieu-ung hoa-hinh --hoa 0.27 --flash-cat 1,3 --zoom 0.3,0.08,0.08 --zoom-tg 0.12,0.25,0.25`. Người dùng thử zoom giật 0,2 không chớp, rồi 0,3 không chớp, và nói "Giật + flash mới hợp".

### Model 157: aidancing tự làm biến hình 4 ảnh trong 1 job

Thử ngày 2026-11-08, job 3314124. Model 157 "AI Copy Chuyển Động + Biến Hình 4 Ảnh v7.0 (20s)": `image_1..4`, `text_1..3` = mốc đổi ảnh (giây, dạng `10.37`), `video`. Giá cố định 2,6 credit Nhanh, 5,2 Chất lượng. 156 = 2 ảnh 10 s, 158 = 6 ảnh 30 s (3,9 / 7,8). Script thử: gửi multipart `POST /create/general` không có `actualTime`, xem `app/docs/aidancing-models.md`.
- Input: clip đồ bộ @irenebbyy_ 24,83 s, 4 ảnh là khung của 4 clip cũ ở giây bắt đầu đoạn, mốc 3.6 / 10.37 / 17.5, chế độ Nhanh.
- Chạy 578 giây. Video ra 576×1024, 30 fps, có tiếng, **19,93 s**: model cắt clip còn 20 s, nên bộ cuối chỉ hiện 2,4 s. Clip dài hơn 20 s thì dùng 158 hoặc cắt clip mẫu.
- Đổi ảnh đúng mốc, cắt gọn trong 1 khung, tư thế liền. Cả 4 bộ đúng trang phục ảnh.
- Video không có hiệu ứng ở điểm đổi. Muốn zoom giật + chớp thì chạy thêm hiệu ứng ở mốc bằng ffmpeg.

Cách cũ (N clip full, các bước dưới đây) vẫn dùng khi đã có sẵn N clip full, ví dụ tải lại theo mã job.

### Các bước (cách cũ: N clip full)

1. Tải clip theo mã job aidancing, không tốn credit:
   ```bash
   cd <skill>/scripts && node tai-job.mjs <mã job> [<mã job> ...]
   ```
   Script lưu `<repo>/videos/aidancing/aidancing-<mã job>.mp4`. Với video biến hình, Claude ghi `--out <repo>/videos/bien-hinh-<tên>/clip`. aidancing.net xoá dữ liệu sau 3 ngày.
2. Claude trích 1 khung của mỗi clip ở cùng mốc giây rồi xem, để biết clip nào là bộ nào. Clip đồ bộ đứng đầu danh sách.
3. Chạy phân tích:
   ```bash
   node <skill>/scripts/bien-hinh.mjs phan-tich <clip đồ bộ> <clip 2> ... [--out <thư mục>]
   ```
   Script in:
   - Độ khớp động tác của từng clip so với clip 1: độ lệch khung và tương quan của đường chuyển động. Lệch 0 khung và tương quan > 0,6 thì khớp.
   - Tempo, các đoạn lặng của nhạc.
   - Chỗ ngắt câu hát: năng lượng dải giọng người 300–3000 Hz tụt sâu ≥ 0,1 s. Ứng viên nằm trong chỗ ngắt có cờ HẾT CÂU, được cộng điểm và được ưu tiên khi gợi ý. Mốc gợi ý ghi "(giữa câu)" khi không có ứng viên hết câu ở gần.
   - Ảnh `giong-hat.png`: phổ dải giọng người. Vệt ngang nhiều tầng là giọng hát. Nhạc cụ cùng dải tần có thể làm script nhận sai chỗ ngắt, nên Claude xem ảnh này khi kết quả lạ.
   - Bảng ứng viên: onset mạnh của nhạc, độ mạnh chuyển động tại đó, cờ DROP nếu onset nằm ngay sau đoạn lặng, và điểm.
   - Gợi ý N−1 mốc `--cat`: mốc 1 là phách đầu tiên của drop sớm nhất. Các mốc sau chia đều phần còn lại. Mỗi mốc lấy ứng viên gần, cách mốc trước ≥ 60% độ dài trung bình của 1 bộ, ưu tiên ứng viên điểm cao và gần mốc.
   - Ảnh `toan-bo.png`: clip 1, 2 khung/giây, mỗi hàng 10 khung = 5 giây. Ảnh `cung-luc.png`: các clip cạnh nhau ở từng mốc gợi ý.
   - Khi cần xem kỹ 1 khoảnh khắc, Claude trích dải khung dày quanh mốc đó: `ffmpeg -ss <giây> -t 2 -i <clip 1> -vf "fps=6,scale=140:-1,tile=12x1" -frames:v 1 quanh.png`.
4. Claude xem 2 ảnh và quyết định. Mục "Claude quyết định gì" ở dưới.
5. Dựng video:
   ```bash
   node <skill>/scripts/bien-hinh.mjs dung --cat <giây,giây,...> --out <repo>/videos/bien-hinh-<tên>/bien-hinh-<tên>.mp4 <clip đồ bộ> <clip 2> ... [--flash 0.55] [--zoom 0.08]
   ```
   - Clip theo thứ tự xuất hiện. Clip 1 chạy từ giây 0, đổi sang clip 2 ở mốc 1, v.v.
   - Mốc làm tròn về khung gần nhất. Mỗi đoạn lấy đúng khung cùng thời điểm của clip đó, nên động tác nối liền.
   - Nhạc lấy liền từ clip 1, không vấp ở điểm đổi.
   - Ở mỗi điểm đổi: chớp sáng `--flash` giảm dần trong 0,15 s, phóng to `--zoom` giảm dần trong 0,25 s. `--flash 0` tắt chớp. `--flash-cat 3` chỉ chớp ở điểm đổi thứ 3.
   - `--hieu-ung hoa-hinh --hoa 0.27`: thay cắt cứng bằng hoà 2 clip trong 0,27 s quanh mốc. Các clip khớp động tác, nên bộ cũ tan dần thành bộ mới ngay trên người, mặt và tư thế giữ nguyên. Đề xuất của Claude ngày 2026-11-07: hoà hình cho mọi điểm đổi, chỉ chớp ở điểm đổi sang bộ cuối. Hiệu ứng glitch, vỡ điểm ảnh, lia nhoè không dùng, vì che hoặc làm sai màu bộ đồ đang bán.
   - Script ghi ảnh 9 khung trong ±0,3 s quanh mỗi điểm đổi vào `<video>-kiem-tra/cat-<n>.png`.
6. Claude xem từng ảnh `cat-<n>.png`: bộ đồ đổi gọn trong 1 khung, tư thế trước và sau khớp, chớp không che mặt quá lâu. Sau đó Claude mở video cho người dùng xem.

### Claude quyết định gì

| Quyết định | Căn cứ |
|---|---|
| Thứ tự các bộ sau đồ bộ | Độ ấn tượng tăng dần. Bộ mạnh nhất (màu đậm, dáng ôm, chi tiết lạ) để cuối, vì bộ cuối được giữ lâu nhất. |
| Mốc đổi đồ | Bắt đầu từ gợi ý của script. Claude dời mốc khi `toan-bo.png` cho thấy khoảnh khắc đẹp hơn ở gần đó: tay lướt qua người, xoay người, nháy mắt, cười vào camera. Script không đo được biểu cảm. |
| Có dời mốc vì đoạn quá ngắn | Mỗi bộ nên hiện ≥ 3 s để người xem nhìn rõ |
| Mức chớp, mức phóng to | Mặc định 0,55 và 0,08. Giảm khi chớp che mặt ở ảnh kiểm tra. |

Script đo nhạc bằng năng lượng âm thanh. Claude không nghe được nhạc, nên không có "cảm nhận nhạc" ngoài các con số này. Phần Claude thêm vào so với script là nhìn hình.

### Kết quả ngày 2026-11-07

- 4 clip job 3271444–3271447, 720×1280, 30 fps, 19,37 s, cùng clip nhảy mẫu. Khớp động tác: lệch 0 khung, tương quan 0,96–0,97.
- Nhạc 129 BPM. Đoạn lặng 3,00–4,25 s, rồi drop 5 phách liền từ 4,03 s. Đoạn lặng nhỏ 11,75–12,25 s.
- Thứ tự: đồ bộ hoa (3271446) → đầm lụa trắng (3271444) → đầm hồng corset (3271447) → đầm đỏ lưới (3271445).
- Mốc: 4,03 s (drop), 8,17 s (phách trùng động tác mạnh nhất, chuyển động 0,99), 12,30 s (drop nhỏ). Gợi ý của script trùng với lựa chọn của Claude.
- Video: `videos/bien-hinh-mat-moc/bien-hinh-4-bo.mp4`, 19,37 s, 23 MB.
- Mỗi clip có sẵn khung "Trả lời bình luận… Xem mặt mộc lào" của clip TikTok gốc. Khung này nằm cùng chỗ ở cả 4 clip, nên không nhảy khi đổi đồ.

Lần 2, cùng ngày, 4 clip của clip nhảy @irenebbyy_ (đồ bộ, đầm lụa trắng, corset hồng, đầm đỏ cổ yếm), 24,83 s:
- Khớp động tác: lệch 0 khung, tương quan 0,93–0,97. Nhạc 136 BPM, không có đoạn lặng, nên không có drop.
- Gợi ý đầu của script là 8,60 / 10,83 / 20,17 s: bộ trắng chỉ hiện 2,2 s. Claude không dùng gợi ý này, và sửa script để ưu tiên mốc chia đều.
- Claude chọn 5,50 s (phách 0,77 ngay sau động tác chỉ tay vào camera), 10,37 s (người mẫu xoè tay che kín ống kính, chuyển động 0,99), 17,03 s (phách 0,78, bắt đầu vẫy tay). Khoảnh khắc nháy mắt ở 8,6 s bị bỏ, vì đặt mốc ở đó thì bộ trắng chỉ hiện 1,8 s.
- Mốc tay che ống kính cho cú đổi đồ đẹp nhất: tay lớn dần, chớp sáng, tay vẫn che rồi rút ra với bộ đồ mới.
- Video: `videos/bien-hinh-irenebbyy/bien-hinh-irenebbyy-4-bo.mp4`, 24,83 s.

Lần 3, cùng clip @irenebbyy_, sau khi người dùng đặt điều kiện hết câu hát:
- Script tìm chỗ ngắt câu ở 3,30–3,60, 7,32, 10,46–10,98, 14,40, 17,54–18,12, 21,54 s, cách nhau 3–4 s, khớp câu 2 ô nhịp ở 136 BPM.
- Mốc 5,50 s và 17,03 s của lần 2 nằm giữa câu. Mốc 10,37 s (tay che ống kính) đã nằm ở chỗ hết câu.
- Claude chọn 3,60 s (hết câu, nháy mắt ở 3,5 s), 10,37 s (hết câu, tay che ống kính), 17,50 s (hết câu, ngậm miệng và quay đầu). Gợi ý của script là 7,27 / 14,37 / 18,37 s. Claude không dùng vì 7,27 và 14,37 không có động tác, và 18,37 nằm giữa câu.
- Hiệu ứng: hoà hình 0,27 s mọi điểm, chớp ở điểm 3. Video: `videos/bien-hinh-irenebbyy/bien-hinh-irenebbyy-het-cau.mp4`.

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
   cd <skill>/scripts && node dang-tiktok.mjs <video.mp4> --caption "<mô tả>" --profile <oliver|my> [--dry-run]
   ```
   - `--profile` bắt buộc, theo người yêu cầu: `oliver` = Telegram nntruong96, TikTok @linh_dan_20x; `my` = Telegram Diễm My, TikTok @t.ht.n.mm. Bảng đầy đủ: `~/.claude/skills/flow-chain-video/scripts/kenh.json`.
   - Script mở tab trong profile Chrome đó. TikTok Studio không chứa đúng handle thì script dừng, không đăng.
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
| Block Ghép mẫu báo "ChatGPT chưa gửi prompt: prompt vẫn nằm trong ô nhập" | Gặp 1 lần ngày 2026-11-05, khi 4 block Ghép mẫu chạy song song | Chạy lại riêng block lỗi: `POST /api/workflows/<id>/run` với `{"from": "<id block>"}`. Các block khác dùng kết quả đã lưu. Sau đó Claude đóng tab ChatGPT mà block để mở. |
| Shopee chuyển tab sang `shopee.vn/verify/traffic/error`, trang ghi "Login Required" | Shopee kiểm tra lưu lượng. Ngày 2026-11-03, lần đầu bị chặn, lần sau khi Chrome khởi động lại thì mở được, không cần đăng nhập. | Mở lại link. Nếu vẫn bị chặn, người dùng đăng nhập Shopee trong Chrome CDP. Không được giả user agent của bot để vượt trang này. |
| `TypeError: fetch failed`, `The blob could not be read` khi upload | Node không đọc được file trên Desktop | Chép file vào scratchpad rồi dùng bản chép |
| `dang-tiktok.mjs` in "chưa đọc được link" dù đã đăng | Danh sách bài trên trang Content chưa tải xong khi script đọc. Gặp ngày 2026-11-03. | Mở `tiktok.com/tiktokstudio/content` trong tab nền, lấy mã video lớn nhất trong các link `/video/`, rồi đóng tab |
| yt-dlp báo `Unexpected response from webpage request` với link TikTok | Lỗi extractor TikTok của yt-dlp | Dùng tikwm, theo skill `video-downloader` |

## Đã đăng

| Ngày | Video | Link |
|---|---|---|
| 2026-11-03 | `aidancing-test3-toan-chuoi-chatluong.mp4`: đầm trắng tay phồng, clip của @chang25.02 | https://www.tiktok.com/@linh_dan_20x/video/7703744638946970900 |
| 2026-11-03 | `aidancing-shopee-dam-lua-duoi-ca-irenebbyy-bo1-2026-11-032208.mp4`: đầm lụa đuôi cá Shopee, clip của @irenebbyy_ | https://www.tiktok.com/@linh_dan_20x/video/7703964835565899016 |
