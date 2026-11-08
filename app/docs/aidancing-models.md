# aidancing.net: danh sách model (jobTypeId) và tham số

Quét ngày 2026-11-08 từ `https://aidancing.net/create/general?id=<jobTypeId>` bằng cookie đăng nhập của Chrome CDP, chỉ gửi GET, không tạo job. Dữ liệu thô: `aidancing-models.json` cùng thư mục.

## Cách gửi job

Mọi model dùng chung 1 form: `POST https://aidancing.net/create/general`, `multipart/form-data`, không CSRF. Thành công trả 302 về `/dashboard`.

Trường chung (ô ẩn của form):

| Trường | Giá trị |
|---|---|
| `jobTypeId` | id model, cột đầu của bảng dưới |
| `aspectRatio` | `9:16` hoặc `16:9` |
| `qualityMode` | `1` = Chất lượng (CL), `2` = Nhanh. Model không có giá Nhanh thì chỉ gửi `1`; model chỉ có giá Nhanh thì chỉ gửi `2`. |
| `actualTime` | số giây, chỉ với model có cột "Thời lượng". Giá = đơn giá × `actualTime`. |
| `voiceId` | rỗng, trừ model "Bài viết thành video" (168–178) |
| `title` | tên job tự đặt, tối đa 100 ký tự. Service của app đặt `vf-xxxxxxxx` để tìm job. |

Các trường riêng của từng model nằm ở cột "Tham số". `image`/`video`/`audio` là file. `text_N`, `userPrompt`, `prompt`, `style`, `brand` là chữ.

Theo dõi và tải: `GET /api/proxy/jobs?page=0&size=20`, `GET /api/proxy/files/{outputFileId}`, xem `app/CLAUDE.md` mục "AI Dancing".

Giá đọc từ biến `costHD`, `costFast` trong trang, đơn vị credit. Trang kiểm tra số dư trước khi gửi.

## Model hiện hành (124 model)

| id | Tên | jobName | Tham số | Thời lượng (giây) | Giá |
|---|---|---|---|---|---|
| 70 | AI Cover Bài Hát Theo Mọi Phong Cách | `KIE_SUNO` | `prompt` (chữ: Lời bài hát / Mô tả bài nhạc)<br>`style` (chữ: Thể loại nhạc)<br>`audio` (audio, .mp3, .wav: Tải audio lên) | cố định | CL 2.6/job |
| 71 | AI Tạo Nhạc Theo Lời Bài Hát | `KIE_SUNO_TXT2MUSIC` | `prompt` (chữ: Lời bài hát)<br>`style` (chữ: Thể loại nhạc) | cố định | CL 2.6/job |
| 72 | AI Cover Lại Bài Hát Theo Phong Cách Remix | `KIE_SUNO_REMIX_V2` | `prompt` (chữ: Lời bài hát (không bắt buộc))<br>`audio` (audio, .mp3, .wav: Tải audio lên) | cố định | CL 2.6/job |
| 73 | AI Cover Lại Bài Hát Theo Phong Cách Lãng Mạn | `KIE_SUNO_ROMANTIC_V2` | `prompt` (chữ: Lời bài hát (không bắt buộc))<br>`audio` (audio, .mp3, .wav: Tải audio lên) | cố định | CL 2.6/job |
| 74 | AI Cover Lại Bài Hát Theo Phong Cách Lo-fi | `KIE_SUNO_LOFI_V2` | `prompt` (chữ: Lời bài hát (không bắt buộc))<br>`audio` (audio, .mp3, .wav: Tải audio lên) | cố định | CL 2.6/job |
| 75 | AI Cover Lại Bài Hát Theo Phong Cách Drill | `KIE_SUNO_DRILL_V2` | `prompt` (chữ: Lời bài hát (không bắt buộc))<br>`audio` (audio, .mp3, .wav: Tải audio lên) | cố định | CL 2.6/job |
| 76 | AI Cover Lại Bài Hát Theo Phong Cách Rock | `KIE_SUNO_ROCK_V2` | `prompt` (chữ: Lời bài hát (không bắt buộc))<br>`audio` (audio, .mp3, .wav: Tải audio lên) | cố định | CL 2.6/job |
| 77 | AI Cover Lại Bài Hát Theo Phong Cách EDM | `KIE_SUNO_EDM_V2` | `prompt` (chữ: Lời bài hát (không bắt buộc))<br>`audio` (audio, .mp3, .wav: Tải audio lên) | cố định | CL 2.6/job |
| 78 | AI Cover Lại Bài Hát Theo Phong Cách Hip Hop | `KIE_SUNO_HIPHOP_V2` | `prompt` (chữ: Lời bài hát (không bắt buộc))<br>`audio` (audio, .mp3, .wav: Tải audio lên) | cố định | CL 2.6/job |
| 79 | AI Cover Lại Bài Hát Theo Phong Cách Chill | `KIE_SUNO_CHILL_V2` | `prompt` (chữ: Lời bài hát (không bắt buộc))<br>`audio` (audio, .mp3, .wav: Tải audio lên) | cố định | CL 2.6/job |
| 80 | AI Cover Lại Bài Hát Theo Phong Cách K-POP | `KIE_SUNO_KPOP_V2` | `prompt` (chữ: Lời bài hát (không bắt buộc))<br>`audio` (audio, .mp3, .wav: Tải audio lên) | cố định | CL 2.6/job |
| 81 | AI Cover Lại Bài Hát Theo Phong Cách Nhạc Sad | `KIE_SUNO_SAD` | `prompt` (chữ: Lời bài hát (không bắt buộc))<br>`audio` (audio, .mp3, .wav: Tải audio lên) | cố định | CL 2.6/job |
| 82 | AI Cover Lại Bài Hát Theo Phong Cách Thất Tình | `KIE_SUNO_HEARTBREAK` | `prompt` (chữ: Lời bài hát (không bắt buộc))<br>`audio` (audio, .mp3, .wav: Tải audio lên) | cố định | CL 2.6/job |
| 83 | AI Cover Lại Bài Hát Theo Phong Cách Cô Đơn | `KIE_SUNO_LONELY` | `prompt` (chữ: Lời bài hát (không bắt buộc))<br>`audio` (audio, .mp3, .wav: Tải audio lên) | cố định | CL 2.6/job |
| 84 | AI Cover Lại Bài Hát Theo Phong Cách Cảm Xúc | `KIE_SUNO_DEEP_EMOTIONAL` | `prompt` (chữ: Lời bài hát (không bắt buộc))<br>`audio` (audio, .mp3, .wav: Tải audio lên) | cố định | CL 2.6/job |
| 85 | AI Cover Lại Bài Hát Theo Phong Cách Piano Ballad | `KIE_SUNO_PIANO_BALLAD` | `prompt` (chữ: Lời bài hát (không bắt buộc))<br>`audio` (audio, .mp3, .wav: Tải audio lên) | cố định | CL 2.6/job |
| 86 | AI Cover Lại Bài Hát Theo Phong Cách Acoustic | `KIE_SUNO_ACOUSTIC` | `prompt` (chữ: Lời bài hát (không bắt buộc))<br>`audio` (audio, .mp3, .wav: Tải audio lên) | cố định | CL 2.6/job |
| 87 | AI Cover Lại Bài Hát Theo Phong Cách Nhạc Cafe | `KIE_SUNO_CAFE` | `prompt` (chữ: Lời bài hát (không bắt buộc))<br>`audio` (audio, .mp3, .wav: Tải audio lên) | cố định | CL 2.6/job |
| 88 | AI Cover Lại Bài Hát Theo Phong Cách Nhạc Học Tập | `KIE_SUNO_STUDY` | `prompt` (chữ: Lời bài hát (không bắt buộc))<br>`audio` (audio, .mp3, .wav: Tải audio lên) | cố định | CL 2.6/job |
| 89 | AI Cover Lại Bài Hát Theo Phong Cách Nhạc Ngủ | `KIE_SUNO_SLEEP` | `prompt` (chữ: Lời bài hát (không bắt buộc))<br>`audio` (audio, .mp3, .wav: Tải audio lên) | cố định | CL 2.6/job |
| 90 | AI Cover Lại Bài Hát Theo Phong Cách Nhạc Thiền | `KIE_SUNO_RELAX` | `prompt` (chữ: Lời bài hát (không bắt buộc))<br>`audio` (audio, .mp3, .wav: Tải audio lên) | cố định | CL 2.6/job |
| 91 | AI Cover Lại Bài Hát Theo Phong Cách TikTok Viral | `KIE_SUNO_TIKTOK` | `prompt` (chữ: Lời bài hát (không bắt buộc))<br>`audio` (audio, .mp3, .wav: Tải audio lên) | cố định | CL 2.6/job |
| 92 | AI Cover Lại Bài Hát Theo Phong Cách Phonk | `KIE_SUNO_PHONK` | `prompt` (chữ: Lời bài hát (không bắt buộc))<br>`audio` (audio, .mp3, .wav: Tải audio lên) | cố định | CL 2.6/job |
| 93 | AI Cover Lại Bài Hát Theo Phong Cách Latin | `KIE_SUNO_REGGAETON` | `prompt` (chữ: Lời bài hát (không bắt buộc))<br>`audio` (audio, .mp3, .wav: Tải audio lên) | cố định | CL 2.6/job |
| 94 | AI Cover Lại Bài Hát Theo Phong Cách Cyberpunk | `KIE_SUNO_CYBERPUNK` | `prompt` (chữ: Lời bài hát (không bắt buộc))<br>`audio` (audio, .mp3, .wav: Tải audio lên) | cố định | CL 2.6/job |
| 95 | AI Cover Lại Bài Hát Theo Phong Cách Giao Hưởng Opera | `KIE_SUNO_ORCHESTRA` | `prompt` (chữ: Lời bài hát (không bắt buộc))<br>`audio` (audio, .mp3, .wav: Tải audio lên) | cố định | CL 2.6/job |
| 96 | AI Cover Lại Bài Hát Theo Phong Cách Điện Ảnh | `KIE_SUNO_CINEMATIC` | `prompt` (chữ: Lời bài hát (không bắt buộc))<br>`audio` (audio, .mp3, .wav: Tải audio lên) | cố định | CL 2.6/job |
| 97 | AI Cover Lại Bài Hát Theo Phong Cách Jazz | `KIE_SUNO_JAZZ` | `prompt` (chữ: Lời bài hát (không bắt buộc))<br>`audio` (audio, .mp3, .wav: Tải audio lên) | cố định | CL 2.6/job |
| 98 | AI Cover Lại Bài Hát Theo Phong Cách Ấn Độ | `KIE_SUNO_INDIA` | `prompt` (chữ: Lời bài hát (không bắt buộc))<br>`audio` (audio, .mp3, .wav: Tải audio lên) | cố định | CL 2.6/job |
| 101 | AI Tự Động Tạo Dáng & Chuyển Động Từ Ảnh ( 1 ảnh - 5s ) | `AI_I2V_5S_AUTO_1` | `image_1` (image: Ảnh 1) | cố định | CL 2.21/job<br>Nhanh 1.17/job |
| 102 | AI Tự Động Tạo Dáng & Chuyển Động Từ Ảnh ( 2 ảnh - 10s ) | `AI_I2V_5S_AUTO_2` | `image_1` (image: Ảnh 1)<br>`image_2` (image: Ảnh 2) | cố định | CL 4.42/job<br>Nhanh 2.21/job |
| 103 | AI Tự Động Tạo Dáng & Chuyển Động Từ Ảnh ( 4 ảnh - 20s ) | `AI_I2V_5S_AUTO_4` | `image_1` (image: Ảnh 1)<br>`image_2` (image: Ảnh 2)<br>`image_3` (image: Ảnh 3)<br>`image_4` (image: Ảnh 4) | cố định | CL 8.84/job<br>Nhanh 4.42/job |
| 104 | AI Tự Động Tạo Dáng & Chuyển Động Từ Ảnh ( 6 ảnh - 30s ) | `AI_I2V_5S_AUTO_6` | `image_1` (image: Ảnh 1)<br>`image_2` (image: Ảnh 2)<br>`image_3` (image: Ảnh 3)<br>`image_4` (image: Ảnh 4)<br>`image_5` (image: Ảnh 5)<br>`image_6` (image: Ảnh 6) | cố định | CL 13.26/job<br>Nhanh 6.63/job |
| 106 | AI Tự Động Tạo Dáng & Chuyển Động Từ Ảnh + Thuyết Minh ( 2 ảnh - 10s ) | `AI_I2V_5S_AUTO_2_AUDIO` | `image_1` (image: Ảnh 1)<br>`image_2` (image: Ảnh 2)<br>`userPrompt` (chữ: Lời thoại)<br>`audio` (audio, .mp3, .wav: Giọng nói mẫu) | cố định | CL 4.42/job<br>Nhanh 2.21/job |
| 107 | AI Tự Động Tạo Dáng & Chuyển Động Từ Ảnh + Thuyết Minh ( 4 ảnh - 20s ) | `AI_I2V_5S_AUTO_4_AUDIO` | `image_1` (image: Ảnh 1)<br>`image_2` (image: Ảnh 2)<br>`image_3` (image: Ảnh 3)<br>`image_4` (image: Ảnh 4)<br>`userPrompt` (chữ: Lời thoại)<br>`audio` (audio, .mp3, .wav: Giọng nói mẫu) | cố định | CL 8.84/job<br>Nhanh 4.42/job |
| 108 | AI Tự Động Tạo Dáng & Chuyển Động Từ Ảnh + Thuyết Minh ( 6 ảnh - 30s ) | `AI_I2V_5S_AUTO_6_AUDIO` | `image_1` (image: Ảnh 1)<br>`image_2` (image: Ảnh 2)<br>`image_3` (image: Ảnh 3)<br>`image_4` (image: Ảnh 4)<br>`image_5` (image: Ảnh 5)<br>`image_6` (image: Ảnh 6)<br>`userPrompt` (chữ: Lời thoại)<br>`audio` (audio, .mp3, .wav: Giọng nói mẫu) | cố định | CL 13.26/job<br>Nhanh 6.63/job |
| 109 | AI Nhép Miệng Theo Âm Thanh Cho Video + Clone Voice (30s) | `INFI_VIDEO_TALKING_AUDIO` | `video` (video: Video gốc)<br>`userPrompt` (chữ: Lời thoại)<br>`audio` (audio, .mp3, .wav: Giọng nói mẫu) | cố định | CL 8.84/job |
| 110 | AI Nhép Miệng Theo Âm Thanh Cho Video + Clone Voice (20s) | `INFI_VIDEO_TALKING_20_AUDIO` | `video` (video: Video gốc)<br>`userPrompt` (chữ: Lời thoại)<br>`audio` (audio, .mp3, .wav: Giọng nói mẫu) | cố định | CL 5.33/job |
| 111 | AI Nhép Miệng Theo Âm Thanh Cho Video + Clone Voice (10s) | `INFI_VIDEO_TALKING_10_AUDIO` | `video` (video: Video gốc)<br>`userPrompt` (chữ: Lời thoại)<br>`audio` (audio, .mp3, .wav: Giọng nói mẫu) | cố định | CL 3.12/job |
| 112 | AI Nhép Miệng Theo Âm Thanh Cho Ảnh + Clone Voice (30s) | `INFI-TALK-720-CHANGE-BG_AUDIO` | `image_1` (image: Ảnh nhân vật)<br>`userPrompt` (chữ: Lời thoại)<br>`audio` (audio, .mp3, .wav: Giọng nói mẫu) | cố định | CL 8.84/job |
| 113 | AI Nhép Miệng Theo Âm Thanh Cho Ảnh + Clone Voice (20s) | `INFI-TALK-720-CHANGE-BG_20_AUDIO` | `image_1` (image: Ảnh nhân vật)<br>`userPrompt` (chữ: Lời thoại)<br>`audio` (audio, .mp3, .wav: Giọng nói mẫu) | cố định | CL 5.33/job |
| 114 | AI Nhép Miệng Theo Âm Thanh Cho Ảnh + Clone Voice (10s) | `INFI-TALK-720-CHANGE-BG_10_AUDIO` | `image_1` (image: Ảnh nhân vật)<br>`userPrompt` (chữ: Lời thoại)<br>`audio` (audio, .mp3, .wav: Giọng nói mẫu) | cố định | CL 3.12/job |
| 115 | Nhân Bản Giọng Nói AI - Clone Voice V2 | `CLONE_VOICE_V2` | `userPrompt` (chữ: Nội dung cần đọc)<br>`audio` (audio, .mp3, .wav: Audio giọng mẫu (6-60 giây)) | cố định | CL 1.3/job |
| 119 | AI Copy Chuyển Động Nhóm – Dùng Nền Ảnh v8.0 (10s) | `ANIMATE_IV2V_SCAIL_V2_MULTI_10` | `image_1` (image: Ảnh mẫu)<br>`video` (video: Video mẫu)<br>`text_1` (chữ: Số nhân vật trong ảnh) | cố định | CL 2.6/job<br>Nhanh 1.3/job |
| 120 | AI Copy Chuyển Động Nhóm – Dùng Nền Ảnh v8.0 (20s) | `ANIMATE_IV2V_SCAIL_V2_MULTI_20` | `image_1` (image: Ảnh mẫu)<br>`video` (video: Video mẫu)<br>`text_1` (chữ: Số nhân vật trong ảnh) | cố định | CL 5.2/job<br>Nhanh 2.6/job |
| 141 | AI Thay Đổi Nền Cho Ảnh | `CHANGE-BG-IMAGE` | `image_1` (image: Ảnh nhân vật)<br>`image_2` (image: Ảnh phông nền mới) | cố định | CL 0.91/job |
| 142 | AI Thay Thế Nhân Vật Trong Ảnh | `REPLACE_CHARACTER_IMAGE` | `image_1` (image: Nhân vật mới)<br>`image_2` (image: Ảnh gốc) | cố định | CL 0.91/job |
| 145 | AI Copy Chuyển Động 3 Ảnh Tham Chiếu v6.0 (10s) | `ANIMATE_IV2V_720_1280_CHANGE_BG_V6_3IMAGE_10` | `image_1` (image: Ảnh tham chiếu 1)<br>`image_2` (image: Ảnh tham chiếu 2)<br>`image_3` (image: Ảnh tham chiếu 3)<br>`video` (video: Video mẫu) | cố định | Nhanh 2.34/job |
| 146 | AI Copy Chuyển Động 3 Ảnh Tham Chiếu v6.0 (20s) | `ANIMATE_IV2V_720_1280_CHANGE_BG_V6_3IMAGE_20` | `image_1` (image: Ảnh tham chiếu 1)<br>`image_2` (image: Ảnh tham chiếu 2)<br>`image_3` (image: Ảnh tham chiếu 3)<br>`video` (video: Video mẫu) | cố định | Nhanh 4.68/job |
| 147 | AI Copy Chuyển Động 3 Ảnh Tham Chiếu v6.0 (30s) | `ANIMATE_IV2V_720_1280_CHANGE_BG_V6_3IMAGE_30` | `image_1` (image: Ảnh tham chiếu 1)<br>`image_2` (image: Ảnh tham chiếu 2)<br>`image_3` (image: Ảnh tham chiếu 3)<br>`video` (video: Video mẫu) | cố định | Nhanh 7.02/job |
| 156 | AI Copy Chuyển Động + Biến Hình 2 Ảnh v7.0 (10s) | `ANIMATE_IV2V_720_1280_CHANGE_BG_V7_2IMAGE_10` | `image_1` (image: Ảnh 1)<br>`text_1` (chữ: Mốc thời gian chuyển sang dùng ảnh 2 (giây))<br>`image_2` (image: Ảnh 2)<br>`video` (video: Video mẫu) | cố định | CL 2.6/job<br>Nhanh 1.3/job |
| 157 | AI Copy Chuyển Động + Biến Hình 4 Ảnh v7.0 (20s) | `ANIMATE_IV2V_720_1280_CHANGE_BG_V7_4IMAGE_20` | `image_1` (image: Ảnh 1)<br>`text_1` (chữ: Mốc thời gian chuyển sang dùng ảnh 2 (giây))<br>`image_2` (image: Ảnh 2)<br>`text_2` (chữ: Mốc thời gian chuyển sang dùng ảnh 3 (giây))<br>`image_3` (image: Ảnh 3)<br>`text_3` (chữ: Mốc thời gian chuyển sang dùng ảnh 4 (giây))<br>`image_4` (image: Ảnh 4)<br>`video` (video: Video mẫu) | cố định | CL 5.2/job<br>Nhanh 2.6/job |
| 158 | AI Copy Chuyển Động + Biến Hình 6 Ảnh v7.0 (30s) | `ANIMATE_IV2V_720_1280_CHANGE_BG_V7_6IMAGE_30` | `image_1` (image: Ảnh 1)<br>`text_1` (chữ: Mốc thời gian chuyển sang dùng ảnh 2 (giây))<br>`image_2` (image: Ảnh 2)<br>`text_2` (chữ: Mốc thời gian chuyển sang dùng ảnh 3 (giây))<br>`image_3` (image: Ảnh 3)<br>`text_3` (chữ: Mốc thời gian chuyển sang dùng ảnh 4 (giây))<br>`image_4` (image: Ảnh 4)<br>`text_4` (chữ: Mốc thời gian chuyển sang dùng ảnh 5 (giây))<br>`image_5` (image: Ảnh 5)<br>`text_5` (chữ: Mốc thời gian chuyển sang dùng ảnh 6 (giây))<br>`image_6` (image: Ảnh 6)<br>`video` (video: Video mẫu) | cố định | CL 7.8/job<br>Nhanh 3.9/job |
| 165 | AI Thay Thế Nhiều Nhân Vật Trong Video v8.0 (10s) | `ANIMATE_IV2V_SCAIL_V2_MULTI_REPLACE_10` | `image_1` (image: Ảnh mẫu)<br>`video` (video: Video mẫu)<br>`text_1` (chữ: Số nhân vật trong ảnh) | cố định | CL 2.6/job<br>Nhanh 1.3/job |
| 166 | AI Thay Thế Nhiều Nhân Vật Trong Video v8.0 (20s) | `ANIMATE_IV2V_SCAIL_V2_MULTI_REPLACE_20` | `image_1` (image: Ảnh mẫu)<br>`video` (video: Video mẫu)<br>`text_1` (chữ: Số nhân vật trong ảnh) | cố định | CL 5.2/job<br>Nhanh 2.6/job |
| 179 | AI Tạo Video Từ Prompt | `TEXT_TO_VIDEO_TIME` | `userPrompt` (chữ: Mô tả video) | 10, 15, 20, 25 | CL 0.16/giây |
| 180 | AI Tạo Video Chuyển Động Ảnh Đầu Và Ảnh Cuối | `FIRST_LAST_FRAME_CHUYEN_DONG_VIDEO_TIME` | `image_1` (image: Ảnh đầu (khung hình đầu tiên))<br>`image_2` (image: Ảnh cuối (khung hình cuối cùng))<br>`userPrompt` (chữ: Mô tả chuyển động) | 10, 15, 20, 25 | CL 0.16/giây |
| 181 | AI Tạo Video Biến Hình Từ Ảnh Đầu Và Ảnh Cuối | `FIRST_LAST_FRAME_BIEN_HINH_VIDEO_TIME` | `image_1` (image: Ảnh đầu (khung hình đầu tiên))<br>`image_2` (image: Ảnh cuối (khung hình cuối cùng))<br>`userPrompt` (chữ: Mô tả cách biến hình) | 10, 15, 20, 25 | CL 0.16/giây |
| 182 | AI Nhảy Theo Nhạc | `AI_NHAY_THEO_NHAC_VIDEO_TIME` | `image_1` (image: Ảnh nhân vật)<br>`audio` (audio, .mp3, .wav: Nhạc nền (file audio))<br>`userPrompt` (chữ: Mô tả điệu nhảy) | 10, 15, 20, 25 | CL 0.16/giây |
| 183 | AI Tạo Video Từ Ảnh + Prompt | `IMAGE_PROMPT_TO_VIDEO_TIME` | `image_1` (image: Ảnh gốc)<br>`userPrompt` (chữ: Mô tả chuyển động) | 10, 15, 20, 25 | CL 0.16/giây |
| 184 | Tạo video Ca Hát từ Ảnh + Âm Thanh v3.0 | `IMAGE_AUDIO_PROMPT_TO_VIDEO_TIME` | `image_1` (image: Ảnh nhân vật)<br>`audio` (audio, .mp3, .wav: Nhạc nền (file audio))<br>`userPrompt` (chữ: Mô tả cách hát) | 10, 15, 20, 25 | CL 0.16/giây |
| 185 | AI Chơi Nhạc Cụ + Hát Theo Nhạc | `IMAGE_AUDIO_PROMPT_TO_VIDEO_TIME` | `image_1` (image: Ảnh nhân vật)<br>`audio` (audio, .mp3, .wav: Nhạc nền (file audio))<br>`userPrompt` (chữ: Mô tả cách chơi nhạc cụ và hát) | 10, 15, 20, 25 | CL 0.16/giây |
| 186 | Tạo video Bán Hàng, Podcast từ Ảnh + Âm Thanh v3.0 | `IMAGE_AUDIO_PROMPT_TO_VIDEO_TIME` | `image_1` (image: Ảnh nhân vật)<br>`audio` (audio, .mp3, .wav: File âm thanh (lời nói))<br>`userPrompt` (chữ: Mô tả cách nói) | 10, 15, 20, 25 | CL 0.16/giây |
| 187 | AI Nói + Hành Động Theo Prompt | `IMAGE_PROMPT_TO_VIDEO_TIME` | `image_1` (image: Ảnh gốc)<br>`userPrompt` (chữ: Lời nhân vật nói) | 10, 15, 20, 25 | CL 0.16/giây |
| 188 | AI Copy Chuyển Động Dùng Nền Ảnh v8.1 - Cân Mọi Nhân Vật | `ANIMATE_IV2V_SCAIL_V2_TIME` | `image_1` (image: Ảnh mẫu)<br>`video` (video: Video mẫu) | 10, 15, 20 | CL 0.26/giây<br>Nhanh 0.13/giây |
| 189 | AI Copy Chuyển Động Nhóm – Dùng Nền Ảnh v8.1 | `ANIMATE_IV2V_SCAIL_V2_TIME` | `image_1` (image: Ảnh mẫu)<br>`video` (video: Video mẫu)<br>`text_1` (chữ: Số nhân vật trong ảnh) | 10, 15, 20 | CL 0.26/giây<br>Nhanh 0.13/giây |
| 190 | AI Thay Nhân Vật + Copy Video Quảng Cáo v3.1 | `ANIMATE_IV2V_SCAIL_V2_REPLACE_TIME` | `image_1` (image: Ảnh mẫu)<br>`video` (video: Video mẫu) | 10, 15, 20 | CL 0.26/giây<br>Nhanh 0.13/giây |
| 191 | AI Thay Thế Nhiều Nhân Vật Trong Video v8.1 | `ANIMATE_IV2V_SCAIL_V2_REPLACE_TIME` | `image_1` (image: Ảnh mẫu)<br>`video` (video: Video mẫu)<br>`text_1` (chữ: Số nhân vật trong ảnh) | 10, 15, 20 | CL 0.26/giây<br>Nhanh 0.13/giây |
| 192 | AI Copy Chuyển Động Dùng Nền Ảnh v5.1 | `ANIMATE_IV2V_720_1280_CHANGE_BG_V5_TIME` | `image_1` (image: Ảnh mẫu)<br>`video` (video: Video mẫu) | 10, 15, 20, 25 | CL 0.29/giây<br>Nhanh 0.15/giây |
| 193 | AI Copy Chuyển Động 3 Ảnh Tham Chiếu v6.1 | `ANIMATE_IV2V_720_1280_CHANGE_BG_V6_3IMAGE_TIME` | `image_1` (image: Ảnh tham chiếu 1)<br>`image_2` (image: Ảnh tham chiếu 2)<br>`image_3` (image: Ảnh tham chiếu 3)<br>`video` (video: Video mẫu) | 10, 15, 20, 25 | Nhanh 0.24/giây |
| 194 | AI Nhảy Nền Ảnh Cho Nhân Vật Đeo Khẩu Trang, Kính Râm... v5.1 | `ANIMATE_IV2V_720_1280_CHANGE_BG_V5_MASK_TIME` | `image_1` (image: Ảnh mẫu)<br>`video` (video: Video mẫu) | 10, 15, 20, 25 | CL 0.29/giây<br>Nhanh 0.15/giây |
| 195 | AI Copy Chuyển Động Dùng Nền Ảnh v4.1 | `ANIMATE_IV2V_720_1280_CHANGE_BG_V4_TIME` | `image_1` (image: Ảnh mẫu)<br>`video` (video: Video mẫu) | 10, 15, 20, 25 | CL 0.46/giây<br>Nhanh 0.23/giây |
| 196 | AI Nhảy Với Nền Từ Ảnh v1.1 | `ANIMATE_IV2V_720_1280_CHANGE_BG_TIME` | `image_1` (image: Ảnh mẫu)<br>`video` (video: Video mẫu) | 10, 15, 20, 25 | CL 0.29/giây<br>Nhanh 0.15/giây |
| 197 | AI Nhảy Với Nền Từ Video v1.1 | `ANIMATE_IV2V_720_1280_KEEP_BG_TIME` | `image_1` (image: Ảnh mẫu)<br>`video` (video: Video mẫu) | 10, 15, 20, 25 | CL 0.29/giây<br>Nhanh 0.15/giây |
| 198 | AI Copy Chuyển Động Dùng Nền Ảnh v2.1 | `ANIMATE_IV2V_720_1280_CHANGE_BG_V2_TIME` | `image_1` (image: Ảnh mẫu)<br>`video` (video: Video mẫu) | 10, 15, 20, 25 | CL 0.29/giây<br>Nhanh 0.15/giây |
| 199 | AI Copy Chuyển Động Dùng Nền Video V2.1 | `ANIMATE_IV2V_720_1280_KEEP_BG_V2_TIME` | `image_1` (image: Ảnh mẫu)<br>`video` (video: Video mẫu) | 10, 15, 20, 25 | CL 0.29/giây<br>Nhanh 0.15/giây |
| 200 | AI Copy Chuyển Động Dùng Nền Ảnh Mới v3.1 | `ANIMATE_IV2V_720_1280_REPLACE_BG_V3_TIME` | `image_1` (image: Ảnh mẫu)<br>`video` (video: Video mẫu)<br>`image_2` (image: Ảnh phông nền) | 10, 15, 20, 25 | CL 0.29/giây<br>Nhanh 0.15/giây |
| 201 | AI Copy Chuyển Động Video Review Thời Trang v1.1 | `ANIMATE_IV2V_720_1280_CHANGE_BG_TIME` | `image_1` (image: Ảnh mẫu)<br>`video` (video: Video mẫu) | 10, 15, 20, 25 | CL 0.29/giây<br>Nhanh 0.15/giây |
| 202 | AI Thay Nhân Vật + Copy Video Quảng Cáo v2.1 | `ANIMATE_IV2V_720_1280_KEEP_BG_SALE_V2_TIME` | `image_1` (image: Ảnh mẫu)<br>`video` (video: Video mẫu) | 10, 15, 20, 25 | CL 0.32/giây<br>Nhanh 0.16/giây |
| 203 | AI Thay Đổi Gương Mặt Cho Video v2.1 | `ANIMATE_CHANGE_HEAD_V2_TIME` | `image_1` (image: Ảnh mẫu)<br>`video` (video: Video mẫu) | 10, 15, 20, 25 | CL 0.32/giây<br>Nhanh 0.16/giây |
| 204 | AI Thay Đổi Trang Phục Cho Video v2.1 | `ANIMATE_CHANGE_OUTFIT_V2_TIME` | `image_1` (image: Ảnh mẫu)<br>`video` (video: Video mẫu) | 10, 15, 20, 25 | CL 0.32/giây<br>Nhanh 0.16/giây |
| 205 | AI Nhép Miệng + Biểu Cảm Theo Video Gốc V1.1 | `ANIMATE_IV2V_720_1280_CHANGE_BG_TIME` | `image_1` (image: Ảnh mẫu)<br>`video` (video: Video mẫu) | 10, 15, 20, 25 | CL 0.29/giây<br>Nhanh 0.15/giây |
| 206 | AI Bán Hàng - Mọi Sản Phẩm (No Prompt) | `AI_QC_TOTAL_PRODUCT` | `image_1` (image: Ảnh nhân vật)<br>`image_2` (image: Ảnh sản phẩm)<br>`userPrompt` (chữ: Tên sản phẩm)<br>`text_1` (chọn: Ngôn ngữ thoại:) | 15, 20, 25 | CL 0.16/giây |
| 207 | AI Bán Hàng - Thời Trang (No Prompt) | `AI_QC_FASHION` | `image_1` (image: Ảnh nhân vật)<br>`image_2` (image: Ảnh sản phẩm)<br>`userPrompt` (chữ: Tên sản phẩm)<br>`text_1` (chọn: Ngôn ngữ thoại:) | 15, 20, 25 | CL 0.16/giây |
| 208 | AI Bán Hàng - Mỹ Phẩm (No Prompt) | `AI_QC_TOTAL_PRODUCT` | `image_1` (image: Ảnh nhân vật)<br>`image_2` (image: Ảnh sản phẩm)<br>`userPrompt` (chữ: Tên sản phẩm)<br>`text_1` (chọn: Ngôn ngữ thoại:) | 15, 20, 25 | CL 0.16/giây |
| 209 | AI Bán Hàng - Gia Dụng (No Prompt) | `AI_QC_TOTAL_PRODUCT` | `image_1` (image: Ảnh nhân vật)<br>`image_2` (image: Ảnh sản phẩm)<br>`userPrompt` (chữ: Tên sản phẩm)<br>`text_1` (chọn: Ngôn ngữ thoại:) | 15, 20, 25 | CL 0.16/giây |
| 210 | AI Bán Hàng - Hàng Tiêu Dùng (No Prompt) | `AI_QC_TOTAL_PRODUCT` | `image_1` (image: Ảnh nhân vật)<br>`image_2` (image: Ảnh sản phẩm)<br>`userPrompt` (chữ: Tên sản phẩm)<br>`text_1` (chọn: Ngôn ngữ thoại:) | 15, 20, 25 | CL 0.16/giây |
| 211 | AI Bán Hàng - Đồ Công Nghệ (No Prompt) | `AI_QC_TOTAL_PRODUCT` | `image_1` (image: Ảnh nhân vật)<br>`image_2` (image: Ảnh sản phẩm)<br>`userPrompt` (chữ: Tên sản phẩm)<br>`text_1` (chọn: Ngôn ngữ thoại:) | 15, 20, 25 | CL 0.16/giây |
| 212 | AI Bán Hàng - Sản Phẩm Mẹ & Bé (No Prompt) | `AI_QC_TOTAL_PRODUCT` | `image_1` (image: Ảnh nhân vật)<br>`image_2` (image: Ảnh sản phẩm)<br>`userPrompt` (chữ: Tên sản phẩm)<br>`text_1` (chọn: Ngôn ngữ thoại:) | 15, 20, 25 | CL 0.16/giây |
| 213 | AI Bán Hàng - Phụ Kiện Thời Trang (No Prompt) | `AI_QC_FASHION` | `image_1` (image: Ảnh nhân vật)<br>`image_2` (image: Ảnh sản phẩm)<br>`userPrompt` (chữ: Tên sản phẩm)<br>`text_1` (chọn: Ngôn ngữ thoại:) | 15, 20, 25 | CL 0.16/giây |
| 214 | AI Bán Hàng - Thực Phẩm Chức Năng (No Prompt) | `AI_QC_TOTAL_PRODUCT` | `image_1` (image: Ảnh nhân vật)<br>`image_2` (image: Ảnh sản phẩm)<br>`userPrompt` (chữ: Tên sản phẩm)<br>`text_1` (chọn: Ngôn ngữ thoại:) | 15, 20, 25 | CL 0.16/giây |
| 215 | AI Bán Hàng - Giày Dép (No Prompt) | `AI_QC_FASHION` | `image_1` (image: Ảnh nhân vật)<br>`image_2` (image: Ảnh sản phẩm)<br>`userPrompt` (chữ: Tên sản phẩm)<br>`text_1` (chọn: Ngôn ngữ thoại:) | 15, 20, 25 | CL 0.16/giây |
| 216 | AI Bán Hàng - Xe Cộ (No Prompt) | `AI_QC_VEHICLE` | `image_1` (image: Ảnh nhân vật)<br>`image_2` (image: Ảnh sản phẩm)<br>`userPrompt` (chữ: Tên sản phẩm)<br>`text_1` (chọn: Ngôn ngữ thoại:) | 15, 20, 25 | CL 0.16/giây |
| 217 | AI Bán Hàng - Đồ Ăn Vặt (No Prompt) | `AI_QC_TOTAL_PRODUCT` | `image_1` (image: Ảnh nhân vật)<br>`image_2` (image: Ảnh sản phẩm)<br>`userPrompt` (chữ: Tên sản phẩm)<br>`text_1` (chọn: Ngôn ngữ thoại:) | 15, 20, 25 | CL 0.16/giây |
| 218 | AI Bán Hàng - Đồ Trang Trí - Decor (No Prompt) | `AI_QC_TOTAL_PRODUCT` | `image_1` (image: Ảnh nhân vật)<br>`image_2` (image: Ảnh sản phẩm)<br>`userPrompt` (chữ: Tên sản phẩm)<br>`text_1` (chọn: Ngôn ngữ thoại:) | 15, 20, 25 | CL 0.16/giây |
| 219 | AI Bán Hàng - Đồ Chơi (No Prompt) | `AI_QC_TOTAL_PRODUCT` | `image_1` (image: Ảnh nhân vật)<br>`image_2` (image: Ảnh sản phẩm)<br>`userPrompt` (chữ: Tên sản phẩm)<br>`text_1` (chọn: Ngôn ngữ thoại:) | 15, 20, 25 | CL 0.16/giây |
| 220 | AI Bán Hàng - Đồ Dùng Học Tập (No Prompt) | `AI_QC_TOTAL_PRODUCT` | `image_1` (image: Ảnh nhân vật)<br>`image_2` (image: Ảnh sản phẩm)<br>`userPrompt` (chữ: Tên sản phẩm)<br>`text_1` (chọn: Ngôn ngữ thoại:) | 15, 20, 25 | CL 0.16/giây |
| 221 | AI Bán Hàng - Phụ Kiện Thú Cưng (No Prompt) | `AI_QC_TOTAL_PRODUCT` | `image_1` (image: Ảnh nhân vật)<br>`image_2` (image: Ảnh sản phẩm)<br>`userPrompt` (chữ: Tên sản phẩm)<br>`text_1` (chọn: Ngôn ngữ thoại:) | 15, 20, 25 | CL 0.16/giây |
| 223 | AI Thay Nhân Vật + Copy Video Quảng Cáo v9.1 | `ANIMATE_IV2V_V4` | `image_1` (image: Ảnh mẫu)<br>`video` (video: Video mẫu) | 10, 15 | Nhanh 0.16/giây |
| 224 | AI Thay Thế Nhân Vật Mọi Video v9.1 | `ANIMATE_IV2V_V4` | `image_1` (image: Ảnh mẫu)<br>`video` (video: Video mẫu) | 10, 15 | Nhanh 0.16/giây |
| 225 | Trend 1 Người Với 2 Vạn Kỵ Binh | `ANIMATE_IV2V_V4` | `image_1` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu) | 10 | Nhanh 0.16/giây |
| 226 | Trend Haru Haru TikTok | `ANIMATE_IV2V_V4` | `image_1` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu) | 10, 15 | Nhanh 0.16/giây |
| 227 | Trend Biến Hình 24 Trend Car Neymar | `ANIMATE_IV2V_V4` | `image_1` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu) | 10, 15 | Nhanh 0.16/giây |
| 228 | Trend Biến Hình Vắt Chân | `ANIMATE_IV2V_V4` | `image_1` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu) | 10 | Nhanh 0.16/giây |
| 229 | Trend Biến Hình Exo Mama | `ANIMATE_IV2V_V4` | `image_1` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu) | 10 | Nhanh 0.16/giây |
| 230 | Trend Vô Tình Gặp Lại | `ANIMATE_IV2V_V4` | `image_1` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu) | 15 | Nhanh 0.16/giây |
| 231 | Trend Nàng Thơ | `ANIMATE_IV2V_V4` | `image_1` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu) | 10 | Nhanh 0.16/giây |
| 232 | Trend Nhảy Mấy Thằng Tuất Bá Dơ | `ANIMATE_IV2V_V4` | `image_1` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu) | 10 | Nhanh 0.16/giây |
| 233 | Trend Gái Xinh Đi Tàu Điện | `ANIMATE_IV2V_V4` | `image_1` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu) | 10 | Nhanh 0.16/giây |
| 234 | Trend Xé Giấy Biến Hình | `ANIMATE_IV2V_V4` | `image_1` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu) | 10 | Nhanh 0.16/giây |
| 235 | Trend Lùi Xe Tải | `ANIMATE_IV2V_V4` | `image_1` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu) | 15 | Nhanh 0.16/giây |
| 236 | Trend Gái Xinh Xem Bóng Đá | `ANIMATE_IV2V_V4` | `image_1` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu) | 10 | Nhanh 0.16/giây |
| 237 | Trend Thang Cuốn Sang Chảnh | `ANIMATE_IV2V_V4` | `image_1` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu) | 10 | Nhanh 0.16/giây |
| 238 | Trend Vô Tình Lọt Camera | `ANIMATE_IV2V_V4` | `image_1` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu) | 10 | Nhanh 0.16/giây |
| 239 | Trend Bị Cảnh Sát Mỹ Bắt | `ANIMATE_IV2V_V4` | `image_1` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu) | 10 | Nhanh 0.16/giây |
| 240 | Trend Nhảy Trên Sân Khấu | `ANIMATE_IV2V_V4` | `image_1` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu) | 15 | Nhanh 0.16/giây |
| 241 | Trend Gái Xinh Nhảy Cận Camera | `ANIMATE_IV2V_V4` | `image_1` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu) | 15 | Nhanh 0.16/giây |
| 242 | Trend Bật Nhảy Sút Bóng | `ANIMATE_IV2V_V4` | `image_1` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu) | 10 | Nhanh 0.16/giây |
| 243 | Trend Bắt Tay Cực Ngầu | `ANIMATE_IV2V_V4` | `image_1` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu) | 5 | Nhanh 0.16/giây |
| 244 | Trend Biến Hình Thảm Đỏ | `ANIMATE_IV2V_V4` | `image_1` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu) | 10 | Nhanh 0.16/giây |
| 245 | Trend What's up Beijing | `ANIMATE_IV2V_V4` | `image_1` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu) | 10 | Nhanh 0.16/giây |
| 246 | Trend Biến Hình 24 Trend Car Neymar | `ANIMATE_IV2V_V4` | `image_1` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu) | 10 | Nhanh 0.16/giây |
| 247 | Trend Iphone Cupid | `ANIMATE_IV2V_V4` | `image_1` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu) | 10 | Nhanh 0.16/giây |
| 248 | AI Copy Chuyển Động Dùng Nền Ảnh v8.2 - Siêu Nhanh | `ANIMATE_IV2V_SCAIL_V9_TIME` | `image_1` (image: Ảnh mẫu)<br>`video` (video: Video mẫu) | 10, 15, 20, 25, 30 | CL 0.18/giây<br>Nhanh 0.09/giây |

## Model bản cũ (92 model)

Trang của các model này dùng form cũ: file tên `image`, `video`, `audio`, `garment`, không có `actualTime`, thời lượng ghi trong tên. Trang không có biến `costHD`/`costFast`, nên bảng không có giá. Phần lớn đã có bản mới đuôi `_TIME` ở bảng trên.

| id | Tên | Tham số |
|---|---|---|
| 1 | AI Nhảy Với Nền Từ Ảnh | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 2 | AI Nhảy Với Nền Từ Video | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 3 | AI Copy Chuyển Động Dùng Nền Ảnh (v2.0) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 4 | AI Copy Chuyển Động Dùng Nền Video (v2.0) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 5 | AI Copy Chuyển Động Dùng Nền Ảnh Mới (v3.0) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video))<br>`garment` (image: Phông Nền Mới Cho Video) |
| 8 | AI Tăng Độ Nét Video Lên Full HD + Tái Tạo Các Chi Tiết Mờ | `video` (video: Video mẫu (Video)) |
| 9 | AI Tạo MV Ca Hát Chuẩn Nhịp Từ Video | `video` (video: Video mẫu (Video))<br>`audio` (audio, .mp3, .wav, .m4a: Lời Thoại (Âm Thanh)) |
| 10 | AI nhép miệng theo âm thanh mới cho video bán hàng | `video` (video: Video mẫu (Video))<br>`audio` (audio, .mp3, .wav, .m4a: Lời Thoại (Âm Thanh)) |
| 11 | AI Thay Nhân Vật + Copy Video Review Thời Trang | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 12 | AI Thay Nhân Vật + Copy Video Quảng Cáo v1.0 (30s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 13 | AI Thay Đổi Gương Mặt Cho Video v1.0 (30s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 14 | AI Thay Đổi Trang Phục Cho Video v1.0 (30s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 15 | AI Tạo Video Bán Hàng Chuyển Động Theo Prompt (8s) | `image` (image: Ảnh nhân vật)<br>`userPrompt` (chữ: Mô tả yêu cầu chỉnh sửa (Promt)) |
| 16 | AI Nhép Miệng + Biểu Cảm Theo Video Gốc | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 17 | AI Hát Theo Nhạc Chuẩn Giai Điệu | `image` (image: Ảnh nhân vật)<br>`audio` (audio, .mp3, .wav, .m4a: Lời Thoại (Âm Thanh)) |
| 18 | AI Giới Thiệu Sản Phẩm - Nói Theo Mọi Âm Thanh | `image` (image: Ảnh nhân vật)<br>`audio` (audio, .mp3, .wav, .m4a: Lời Thoại (Âm Thanh)) |
| 21 | AI Thay Đổi Nền Cho Video (30s) | `image` (image: Phông Nền Mới Cho Video)<br>`video` (video: Video mẫu (Video)) |
| 22 | AI Hoán Đổi Gương mặt + Tóc Cho Ảnh v2.0 | `image` (image: Ảnh nhân vật)<br>`garment` (image: Ảnh Gương Mặt Mới) |
| 23 | AI Thay Trang Phục – Tự Động Fit Chuẩn Dáng | `image` (image: Ảnh nhân vật)<br>`garment` (image: Ảnh sản phẩm / trang phục) |
| 24 | AI Tạo Ảnh Người Mẫu Giới Thiệu Sản Phẩm | `image` (image: Ảnh nhân vật)<br>`garment` (image: Ảnh sản phẩm / trang phục) |
| 25 | AI Nâng Ngực To Và Căng Tự Nhiên | `image` (image: Ảnh nhân vật) |
| 26 | AI Chỉnh Sửa Ảnh Bằng Câu Lệnh | `image` (image: Ảnh nhân vật)<br>`userPrompt` (chữ: Mô tả yêu cầu chỉnh sửa (Promt)) |
| 28 | AI Làm Nét Ảnh - Nâng Chất Lượng Ảnh Lên 2K | `image` (image: Ảnh nhân vật) |
| 29 | AI Fix Ảnh Da Nhựa Cực Mạnh - Chỉ Dành Cho Da Cực Nhựa | `image` (image: Ảnh nhân vật) |
| 30 | AI Chỉnh Sửa Ảnh Trở Lên Siêu Thực - Fix Da Nhựa | `image` (image: Ảnh nhân vật) |
| 31 | Tạo ảnh nhân vật bằng câu lệnh theo ý muốn | `userPrompt` (chữ: Mô tả yêu cầu chỉnh sửa (Promt)) |
| 32 | AI Nhảy Với Nền Từ Ảnh v1 (20s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 33 | AI Nhảy Với Nền Từ Video v1 (20s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 34 | AI Copy Chuyển Động Dùng Nền Ảnh v2.0 (20s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 35 | AI Copy Chuyển Động Dùng Nền Video v2.0 (20s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 36 | AI Copy Chuyển Động Dùng Nền Ảnh Mới v3.0 (20s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video))<br>`garment` (image: Phông Nền Mới Cho Video) |
| 37 | AI Thay Đổi Gương Mặt Cho Video v1.0 (20s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 38 | AI Thay Đổi Trang Phục Cho Video (20s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 39 | AI Thay Nhân Vật + Copy Video Review Thời Trang (20s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 40 | AI Thay Nhân Vật + Copy Video Quảng Cáo v1.0 (20s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 41 | AI Hát Theo Nhạc Chuẩn Giai Điệu (20s) | `image` (image: Ảnh nhân vật)<br>`audio` (audio, .mp3, .wav, .m4a: Lời Thoại (Âm Thanh)) |
| 42 | AI Giới Thiệu Sản Phẩm - Nói Theo Mọi Âm Thanh (20s) | `image` (image: Ảnh nhân vật)<br>`audio` (audio, .mp3, .wav, .m4a: Lời Thoại (Âm Thanh)) |
| 43 | AI Tạo MV Ca Hát Chuẩn Nhịp Từ Video (20s) | `video` (video: Video mẫu (Video))<br>`audio` (audio, .mp3, .wav, .m4a: Lời Thoại (Âm Thanh)) |
| 44 | AI nhép miệng theo âm thanh mới cho video bán hàng (20s) | `video` (video: Video mẫu (Video))<br>`audio` (audio, .mp3, .wav, .m4a: Lời Thoại (Âm Thanh)) |
| 45 | AI Nhép Miệng + Biểu Cảm Theo Video Gốc (20s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 46 | AI Nhảy Với Nền Từ Ảnh v1 (10s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 47 | AI Nhảy Với Nền Từ Video v1 (10s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 48 | AI Copy Chuyển Động Dùng Nền Ảnh v2.0 (10s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 49 | AI Copy Chuyển Động Dùng Nền Video v2.0 (10s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 50 | AI Copy Chuyển Động Dùng Nền Ảnh Mới v3.0 (10s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video))<br>`garment` (image: Phông Nền Mới Cho Video) |
| 51 | AI Thay Đổi Gương Mặt Cho Video v1.0 (10s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 52 | AI Thay Đổi Trang Phục Cho Video (10s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 53 | AI Thay Nhân Vật + Copy Video Review Thời Trang (10s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 54 | AI Thay Nhân Vật + Copy Video Quảng Cáo v1.0 (10s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 55 | AI Hát Theo Nhạc Chuẩn Giai Điệu (10s) | `image` (image: Ảnh nhân vật)<br>`audio` (audio, .mp3, .wav, .m4a: Lời Thoại (Âm Thanh)) |
| 56 | AI Giới Thiệu Sản Phẩm - Nói Theo Mọi Âm Thanh (10s) | `image` (image: Ảnh nhân vật)<br>`audio` (audio, .mp3, .wav, .m4a: Lời Thoại (Âm Thanh)) |
| 57 | AI Tạo MV Ca Hát Chuẩn Nhịp Từ Video (10s) | `video` (video: Video mẫu (Video))<br>`audio` (audio, .mp3, .wav, .m4a: Lời Thoại (Âm Thanh)) |
| 58 | AI nhép miệng theo âm thanh mới cho video bán hàng (10s) | `video` (video: Video mẫu (Video))<br>`audio` (audio, .mp3, .wav, .m4a: Lời Thoại (Âm Thanh)) |
| 59 | AI Nhép Miệng + Biểu Cảm Theo Video Gốc (10s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 99 | AI Thay Đổi Chất Giọng Cho Video Theo Chất Giọng Mẫu | `video` (video: Video mẫu (Video))<br>`audio` (audio, .mp3, .wav, .m4a: Lời Thoại (Âm Thanh)) |
| 116 | AI Copy Chuyển Động Dùng Nền Ảnh v4.0 (30s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 117 | AI Copy Chuyển Động Dùng Nền Ảnh v4.0 (20s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 118 | AI Copy Chuyển Động Dùng Nền Ảnh v4.0 (10s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 122 | AI làm nét x2 + tăng độ phân giải video lên tới 2K | `video` (video: Video mẫu (Video)) |
| 123 | AI Copy Chuyển Động Dùng Nền Ảnh v5.0 (30s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 124 | AI Copy Chuyển Động Dùng Nền Ảnh v5.0 (20s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 125 | AI Copy Chuyển Động Dùng Nền Ảnh v5.0 (10s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 126 | AI Nhảy Nền Ảnh Cho Nhân Vật Đeo Khẩu Trang, Kính Râm... v5.0 (30s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 127 | AI Nhảy Nền Ảnh Cho Nhân Vật Đeo Khẩu Trang, Kính Râm... v5.0 (20s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 128 | AI Nhảy Nền Ảnh Cho Nhân Vật Đeo Khẩu Trang, Kính Râm... v5.0 (10s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 132 | AI Thay Đổi Gương Mặt Cho Video v2.0 (10s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 133 | AI Thay Đổi Gương Mặt Cho Video v2.0 (20s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 134 | AI Thay Đổi Gương Mặt Cho Video v2.0 (30s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 135 | AI Thay Đổi Trang Phục Cho Video v2.0 (10s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 136 | AI Thay Đổi Trang Phục Cho Video v2.0 (20s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 137 | AI Thay Đổi Trang Phục Cho Video v2.0 (30s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 138 | AI Thay Nhân Vật + Copy Video Quảng Cáo v2.0 (10s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 139 | AI Thay Nhân Vật + Copy Video Quảng Cáo v2.0 (20s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 140 | AI Thay Nhân Vật + Copy Video Quảng Cáo v2.0 (30s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 143 | AI Thay Đổi Nền Cho Video (20s) | `image` (image: Phông Nền Mới Cho Video)<br>`video` (video: Video mẫu (Video)) |
| 144 | AI Thay Đổi Nền Cho Video (10s) | `image` (image: Phông Nền Mới Cho Video)<br>`video` (video: Video mẫu (Video)) |
| 148 | AI Hoán Đổi Gương Mặt Cho Ảnh v2.0 | `image` (image: Ảnh nhân vật)<br>`garment` (image: Ảnh Gương Mặt Mới) |
| 159 | AI Copy Chuyển Động Dùng Nền Ảnh v8.0 (10s) - Cân Mọi Nhân Vật | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 160 | AI Copy Chuyển Động Dùng Nền Ảnh v8.0 (20s) - Cân Mọi Nhân Vật | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 162 | AI Thay Nhân Vật + Copy Video Quảng Cáo v3.0 (10s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 163 | AI Thay Nhân Vật + Copy Video Quảng Cáo v3.0 (20s) | `image` (image: Ảnh nhân vật)<br>`video` (video: Video mẫu (Video)) |
| 168 | AI Biến Mọi Bài Viết Thành Video (60s) | `text_1` (chữ: Tiêu đề video *)<br>`brand` (chữ: Tên Kênh Hoặc Thương Hiệu của bạn)<br>`voiceId` (chữ: Giọng đọc *)<br>`audio` (.mp3,audio/mpeg: Giọng đọc *)<br>`sfx` (chữ: SFX)<br>`music` (chữ: SFX) |
| 169 | AI Biến Mọi Bài Viết Thành Video - Ngách Tài Chính (60s) | `text_1` (chữ: Tiêu đề video *)<br>`brand` (chữ: Tên Kênh Hoặc Thương Hiệu của bạn)<br>`voiceId` (chữ: Giọng đọc *)<br>`audio` (.mp3,audio/mpeg: Giọng đọc *)<br>`sfx` (chữ: SFX)<br>`music` (chữ: SFX) |
| 170 | AI Biến Mọi Bài Viết Thành Video - Ngách Tin Tức (60s) | `text_1` (chữ: Tiêu đề video *)<br>`brand` (chữ: Tên Kênh Hoặc Thương Hiệu của bạn)<br>`voiceId` (chữ: Giọng đọc *)<br>`audio` (.mp3,audio/mpeg: Giọng đọc *)<br>`sfx` (chữ: SFX)<br>`music` (chữ: SFX) |
| 171 | AI Biến Mọi Bài Viết Thành Video - Ngách Sức Khỏe (60s) | `text_1` (chữ: Tiêu đề video *)<br>`brand` (chữ: Tên Kênh Hoặc Thương Hiệu của bạn)<br>`voiceId` (chữ: Giọng đọc *)<br>`audio` (.mp3,audio/mpeg: Giọng đọc *)<br>`sfx` (chữ: SFX)<br>`music` (chữ: SFX) |
| 172 | AI Biến Mọi Bài Viết Thành Video - Ngách Truyền Cảm Hứng (60s) | `text_1` (chữ: Tiêu đề video *)<br>`brand` (chữ: Tên Kênh Hoặc Thương Hiệu của bạn)<br>`voiceId` (chữ: Giọng đọc *)<br>`audio` (.mp3,audio/mpeg: Giọng đọc *)<br>`sfx` (chữ: SFX)<br>`music` (chữ: SFX) |
| 173 | AI Biến Mọi Bài Viết Thành Video - Ngách Giải Trí - Drama (60s) | `text_1` (chữ: Tiêu đề video *)<br>`brand` (chữ: Tên Kênh Hoặc Thương Hiệu của bạn)<br>`voiceId` (chữ: Giọng đọc *)<br>`audio` (.mp3,audio/mpeg: Giọng đọc *)<br>`sfx` (chữ: SFX)<br>`music` (chữ: SFX) |
| 174 | AI Biến Mọi Bài Viết Thành Video - Ngách Giáo Dục (60s) | `text_1` (chữ: Tiêu đề video *)<br>`brand` (chữ: Tên Kênh Hoặc Thương Hiệu của bạn)<br>`voiceId` (chữ: Giọng đọc *)<br>`audio` (.mp3,audio/mpeg: Giọng đọc *)<br>`sfx` (chữ: SFX)<br>`music` (chữ: SFX) |
| 175 | AI Biến Mọi Bài Viết Thành Video - Ngách Công Nghệ (60s) | `text_1` (chữ: Tiêu đề video *)<br>`brand` (chữ: Tên Kênh Hoặc Thương Hiệu của bạn)<br>`voiceId` (chữ: Giọng đọc *)<br>`audio` (.mp3,audio/mpeg: Giọng đọc *)<br>`sfx` (chữ: SFX)<br>`music` (chữ: SFX) |
| 176 | AI Biến Mọi Bài Viết Thành Video - Ngách Ẩm Thực (60s) | `text_1` (chữ: Tiêu đề video *)<br>`brand` (chữ: Tên Kênh Hoặc Thương Hiệu của bạn)<br>`voiceId` (chữ: Giọng đọc *)<br>`audio` (.mp3,audio/mpeg: Giọng đọc *)<br>`sfx` (chữ: SFX)<br>`music` (chữ: SFX) |
| 177 | AI Biến Mọi Bài Viết Thành Video - Ngách Du Lịch (60s) | `text_1` (chữ: Tiêu đề video *)<br>`brand` (chữ: Tên Kênh Hoặc Thương Hiệu của bạn)<br>`voiceId` (chữ: Giọng đọc *)<br>`audio` (.mp3,audio/mpeg: Giọng đọc *)<br>`sfx` (chữ: SFX)<br>`music` (chữ: SFX) |
| 178 | AI Biến Mọi Bài Viết Thành Video - Ngách Tâm Linh (60s) | `text_1` (chữ: Tiêu đề video *)<br>`brand` (chữ: Tên Kênh Hoặc Thương Hiệu của bạn)<br>`voiceId` (chữ: Giọng đọc *)<br>`audio` (.mp3,audio/mpeg: Giọng đọc *)<br>`sfx` (chữ: SFX)<br>`music` (chữ: SFX) |
