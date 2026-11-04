# Tự động Google Flow qua Chrome CDP

Đọc file này khi chuẩn bị chạy `gen` lần đầu, hoặc khi `flow.mjs` báo lỗi.

## 0. Trạng thái 2026-10-18

`flow.mjs` đã viết lại theo giao diện `flow.google.com`. Lần chạy thật cuối ngày 2026-10-18 đạt trọn từ đầu tới cuối trong 88 giây:

| Bước | Thời điểm |
|---|---|
| Tạo project, chọn cấu hình | giây 8 |
| Gắn ảnh start, ảnh end | giây 19, giây 30 |
| Gửi lệnh tạo | giây 37 |
| Video xong | giây 58 |
| Tải bản tăng độ phân giải xong | giây 88 |

Clip B của video muỗi tạo bằng script có SSIM 0,931 với khung cuối clip A. Nếu script dừng giữa chừng mà video đã xong, dùng `--project <url>` để tải.

Chrome CDP phải đăng nhập tài khoản có gói Flow. Profile `~/chrome-cdp-profile` đã đăng nhập lại ngày 2026-10-18 bằng Gmail ovliver, gói PRO.

Flow gọi RPC nội bộ qua `flow.google.com/_/AiSandboxAngularFrontend/data/batchexecute?rpcids=<mã>`:

| Mã RPC | Việc | Token reCAPTCHA Enterprise | Script dùng thế nào |
|---|---|---|---|
| `maseQ` | Tải ảnh lên. `data[0][0]` là mã ảnh. | Có | Bấm giao diện, đọc mã ảnh |
| `nprQif` | Tạo video. `data[3][0][0]` là mã video. Request chứa mã model, mã ảnh start, mã ảnh end, prompt. | Có | Bấm giao diện, kiểm tra request |
| `jwpduf` | Hỏi trạng thái, 5 giây một lần. `data[2][0][5][8][0]`: 2 = đang tạo, 3 = xong. Response `nprQif` ghi 6 = vừa nhận lệnh. | Không | Đọc trạng thái |
| `p0UkFb` | Tạo bản tăng độ phân giải, ví dụ 1080p | Có | Bấm menu "Tải xuống" |
| `as29s` | Đọc media theo mã, trả về đường dẫn có chữ ký `flow-content.google/video/<mã>` | Không | Trang tự gọi khi tải |

Script không tự gửi RPC có token reCAPTCHA. Tự tạo token ngoài thao tác giao diện là vượt qua lớp kiểm tra bot của Google.

## 1. Chuẩn bị

1. Cài thư viện, chỉ cần một lần:
   ```bash
   [ -d <skill>/scripts/node_modules/playwright-core ] || npm install --prefix <skill>/scripts --no-audit --no-fund
   ```
   Thư viện là `playwright-core`. Thư viện này không tải trình duyệt riêng. Script dùng Chrome của người dùng.
2. Kiểm tra Chrome CDP đã chạy chưa:
   ```bash
   curl -s http://127.0.0.1:9222/json/version | head -3
   ```
3. Nếu chưa chạy, mở Chrome CDP:
   ```bash
   node <skill>/scripts/launch-chrome.mjs
   ```
   Chạy lệnh này ở chế độ nền. Lệnh mở Chrome với profile `~/chrome-cdp-profile`, cổng 9222.
4. Người dùng phải tự đăng nhập Google trong cửa sổ Chrome đó, một lần. Claude không đăng nhập thay người dùng.

Profile `~/chrome-cdp-profile` dùng chung với `~/video-flow` và skill `scroll-world`. Nếu người dùng đã đăng nhập ở đó, không cần đăng nhập lại.

## 2. Cách `flow.mjs` tạo một clip

1. Kết nối Chrome qua CDP. Mở tab mới.
2. Mở `flow.google.com`, tạo **project mới**. Mỗi clip một project, để thư viện ảnh và lưới kết quả chỉ có dữ liệu của clip đó.
3. Tắt "Tác nhân" nếu đang bật. Mở chip cấu hình, chọn: Video → Khung hình → tỉ lệ → model → độ phân giải và độ dài (chỉ Omni) → x1. In số tín dụng Flow báo.
4. Gắn ảnh start, rồi ảnh end: bấm ô → "Tải nội dung nghe nhìn lên" → chọn file → chờ `maseQ` trả mã ảnh → bấm ảnh có mã đó → bấm "Thêm vào câu lệnh" → kiểm tra ô đã có ảnh.
5. Nhập prompt bằng `insertText`, rồi bấm "Bắt đầu tạo".
6. Đọc request `nprQif`: in mã model, kiểm tra request chứa mã ảnh start và mã ảnh end.
7. Chờ video xong. Script coi video xong khi một RPC báo trạng thái 3, hoặc lưới có ô `flow-video-tile` với ảnh thu nhỏ thật. Thời gian chờ tối đa 12 phút.
8. Mở menu của ô video → "Tải xuống" → độ phân giải trong plan, mặc định 1080p. Lưu file từ sự kiện tải của trang.
9. Đóng tab. Khi lỗi, script để tab mở cho người dùng xem. Không gọi `browser.close()`: lệnh này đóng luôn Chrome đã đăng nhập của người dùng.

Tải lại video từ project đã tạo xong, khi script dừng giữa chừng:

```bash
node <skill>/scripts/flow.mjs --project <url project> --out clips/<clipId>.mp4 --download 1080p
```

## 3. Dry run

```bash
node <skill>/scripts/chain.mjs gen plan.json <clipId> --dry-run
```

Script làm bước 1–6 nhưng không bấm gửi. Tab Flow để mở để người dùng xem ảnh, prompt và cấu hình. Dry run không tốn credit.

Dùng dry run cho:
- Lần chạy đầu tiên trên máy.
- Xem chi phí credit trước khi tạo thật.
- Sau khi Flow đổi giao diện.

Dry run vẫn tạo một project rỗng trong tài khoản Flow của người dùng.

## 4. Model, độ dài, chi phí

Đo ngày 2026-10-18, tỉ lệ 9:16, 1 video:

| Model trong plan | Nhãn trong Flow | Độ dài | Tín dụng |
|---|---|---|---|
| `omni-flash` | Omni 1.1 Flash. Mặc định. | 4 / 6 / 8 / 10 giây | 7 / 10 / 12 / 15 ở 720p. 4 giây 360p: 4. |
| `veo-3.1-lite` | Veo 3.1 - Lite | Cố định 8 giây | 10 |
| `veo-3.1-fast` | Veo 3.1 - Fast | Cố định 8 giây | 20 |
| `veo-3.1-quality` | Veo 3.1 - Quality | Cố định 8 giây | 100 |

- Chỉ Omni có lựa chọn độ phân giải tạo: 360p hoặc 720p. Trường `quality` trong plan, mặc định 720p.
- Menu "Tải xuống" của video 720p có: 270p GIF, 720p gốc, 1080p tăng độ phân giải, 4K tăng độ phân giải. Trường `download` trong plan, mặc định 1080p.
- Lần đầu tải 1080p, Flow tạo bản tăng độ phân giải trước. Clip 6 giây mất khoảng 57 giây. Lần sau mất khoảng 3 giây. Flow không báo tốn tín dụng cho bước này.
- Thời gian tạo đo được: Omni 4 giây 360p xong sau khoảng 20 giây.
- Video 360p tăng lên 720p cho SSIM khung đầu thấp hơn, khoảng 0,90, vì ảnh bị nội suy. Clip dùng thật nên tạo ở 720p.

## 5. Kiến thức giao diện Flow

Đo ngày 2026-10-18. Khi Flow đổi giao diện, soi DOM thật qua CDP rồi mới sửa selector. Không đoán selector.

- Flow hiển thị theo ngôn ngữ tài khoản Google. Selector phải khớp cả hai ngôn ngữ:

  | Tiếng Anh | Tiếng Việt |
  |---|---|
  | New project | Dự án mới |
  | Agent | Tác nhân |
  | Frames | Khung hình |
  | Upload media | Tải nội dung nghe nhìn lên |
  | Add to prompt | Thêm vào câu lệnh |
  | Start / End | Bắt đầu / Kết thúc |
  | Download | Tải xuống |

- Ô prompt là `div[role="textbox"][contenteditable="true"]`. Ô tên project là `input`.
- Chip cấu hình có aria-label "Điều kiện kích hoạt cài đặt", không chứa tên model. Script tìm chip theo chữ `crop_9_16` hoặc `crop_16_9` bên trong.
- Các lựa chọn trong bảng cấu hình là nút `role="radio"`. Danh sách model mở bằng nút "Chọn nhóm mô hình", mỗi model là `menuitem`.
- Flow lưu cấu hình dùng lần cuối cho cả tài khoản. Cấu hình script chọn sẽ hiện lại khi người dùng tạo tay.
- Ô "Bắt đầu" và "Kết thúc" là `button` 56×56 phía trên ô prompt.
- Hộp thoại "Chọn một hình ảnh khung": danh sách ảnh bên trái, ảnh xem trước và nút "Thêm vào câu lệnh" bên phải. Khi project có từ 2 ảnh trở lên, bấm ảnh chỉ mở xem trước.
- Ô kết quả là `flow-video-tile`, ô ảnh là `flow-image-tile`. Trong tab vừa tạo video, ảnh thu nhỏ dùng `flow.google.com/asb/…` và không chứa mã video. Khi mở lại project, ảnh dùng `flow-content.google/image/<mã>`.
- Mỗi ô có nút "Tuỳ chọn khác" ẩn. Script leo từ ô video lên để lấy đúng nút của ô đó.
- Flow coi ký tự xuống dòng trong prompt là Enter = gửi. Script dùng `insertText`. Prompt trong plan vẫn nên viết một dòng.

## 6. Xử lý lỗi

| Thông báo | Nguyên nhân | Cách sửa |
|---|---|---|
| Không kết nối được Chrome tại http://127.0.0.1:9222 | Chrome CDP chưa chạy | Chạy `launch-chrome.mjs` |
| Không vào được Flow | Chưa đăng nhập Google, hoặc Flow tải chậm | Người dùng đăng nhập trong cửa sổ Chrome CDP, rồi chạy lại |
| Không thấy slot Start/End | Chưa vào tab Frames, hoặc Flow đổi giao diện | Chạy dry run, xem tab. Soi DOM qua CDP rồi sửa `flow.mjs`. |
| Không chọn được model | Nhãn model trong Flow đổi | Xem dropdown trong dry run, sửa `FLOW_MODEL_LABELS` |
| Không thấy tab Ns | Model không hỗ trợ độ dài đó | Đổi `duration` trong plan |
| Browser context management is not supported | Chrome CDP mở nhiều profile, hoặc Chrome CDP không còn tab nào | `flow.mjs` tự mở 1 tab trống rồi kết nối lại. Nếu vẫn lỗi: tắt Chrome CDP, mở lại bằng `launch-chrome.mjs`. Không thêm profile. |
| Flow chưa render xong sau 12 phút | Hết credit, hoặc Flow lỗi | Người dùng xem tab Chrome |
| Flow báo "Oops, something went wrong" khi tải ảnh | Ảnh quá nhỏ hoặc ảnh một màu | Dùng ảnh có nội dung, cạnh ngắn ≥ 720 px |

## 7. Làm tay khi tự động lỗi

Cách làm tay nằm ở SKILL.md mục 6.1. Lệnh chính là `node chain.mjs upload plan.json <clipId>`. Không dùng `gen --dry-run` để lấy ảnh: lệnh đó mở Chrome CDP và tạo project rỗng trong Flow.
