# Phân tích video mẫu

Đọc file này khi người dùng gửi một video mẫu và hỏi nội dung, cách dựng, hoặc muốn làm lại video đó.

Mục tiêu: biết video có bao nhiêu clip, điểm nối nằm ở đâu, mỗi clip làm gì. Kết quả này là đầu vào cho bước kịch bản.

## 1. Thông tin cơ bản

```bash
V="<video>"
ffprobe -v error -show_entries format=duration:stream=codec_type,width,height,r_frame_rate -of default=nw=1 "$V"
ffmpeg -i "$V" -af volumedetect -vn -f null - 2>&1 | grep -E "mean_volume|max_volume"
```

- `mean_volume` khoảng -91 dB nghĩa là không có tiếng.
- Bản quay màn hình thường là 60 fps. Video gốc của Flow là 24 fps. Khi video 24 fps phát trong bản quay 60 fps, nhiều khung liền kề giống hệt nhau và có score 0.

## 2. Bản quay màn hình: tìm vùng video gốc

Bản quay màn hình trình phát thường có video dọc ở giữa, hai bên là nền mờ. Nền mờ không phải màu đen, nên `cropdetect` không tìm được vùng này.

Cách làm:
1. Trích 1 khung, mở xem.
2. Ước lượng vùng video gốc theo pixel: `w:h:x:y`.
3. Dùng `crop=w:h:x:y` cho mọi lệnh sau.

Ví dụ đã đo: bản quay 1554×786 của trình phát web có vùng video `476:770:546:12`.

## 3. Xem toàn bộ diễn biến

Trích 1 khung mỗi giây, rồi ghép thành một ảnh để xem cả video trong một lần:

```bash
S=<thư mục tạm>; mkdir -p "$S"
ffmpeg -v error -y -i "$V" -vf "fps=1,scale=1100:-1" "$S/f_%02d.jpg"
ffmpeg -v error -y -i "$S/f_%02d.jpg" -vf "crop=<w:h:x:y theo thang 1100>,scale=240:-1,tile=10x2:padding=4" -frames:v 1 "$S/sheet.jpg"
```

- Bản ffmpeg của Homebrew trên máy này không có filter `drawtext`. Không đánh số lên khung được. Thứ tự khung trong ảnh ghép là trái → phải, trên → dưới, mỗi khung 1 giây.
- Video ngắn (≤ 12 giây): ghép `tile=12x1`.

## 4. Tìm điểm cắt

```bash
node <skill>/scripts/chain.mjs scenes "$V" --crop <w:h:x:y>
```

Lệnh in các sự kiện có score ≥ 0,15, gộp các khung sát nhau. Score cuối video thường là lúc trình phát lặp lại, không phải điểm cắt.

## 5. Phân loại từng điểm cắt

Trích khung dày quanh mỗi điểm cắt (khoảng 0,3–0,7 giây), rồi xem:

```bash
ffmpeg -v error -y -ss <giây_bắt_đầu> -i "$V" -t 0.4 -vf "crop=<w:h:x:y>,fps=30,scale=170:-1,tile=12x1:padding=3" -frames:v 1 "$S/cut.jpg"
```

| Dấu hiệu trong ảnh | Loại | Nguyên nhân thường gặp |
|---|---|---|
| Bối cảnh đổi hoàn toàn giữa 2 khung | Cắt cứng | Hai clip ghép thẳng. Hoặc ảnh start và ảnh end của một clip khác bối cảnh, Flow tự cắt giữa clip. |
| Khung hình giữ nguyên, một chi tiết đổi đột ngột | Bước nhảy | Clip sau bắt đầu từ ảnh tĩnh gốc, không phải khung cuối thật của clip trước. Hoặc ảnh end có thay đổi mà prompt không mô tả quá trình. |
| Nhiều khung liên tiếp có score cao, chủ thể chuyển động nhanh | Chuyển động nhanh | Không phải điểm cắt. Ví dụ: bướm bay khỏi khung. |
| Score cao đúng ở cuối video | Trình phát lặp lại | Không phải điểm cắt. |

## 6. Mức score tham khảo

Số đo từ 2 bản quay màn hình mẫu và 2 clip Flow:

| Trường hợp | Score |
|---|---|
| Chuyển động bình thường, camera đứng yên (p90) | 0,02–0,04 |
| Chuyển động bình thường, camera bay, tăng tốc 1,45× (p90) | 0,08 |
| Bước nhảy ở điểm nối nối bằng ảnh tĩnh | 0,15 |
| Cắt cứng sang bối cảnh khác | 0,22–0,38 |

p90 là mức score mà 90% khung thấp hơn.

## 7. Mẫu kết quả gửi người dùng

Kết luận trước: video có mấy clip, dựng bằng cách nào. Sau đó:

1. Bảng diễn biến theo giây: `Giây | Nội dung`.
2. Bảng clip: `Clip | Thời gian | Độ dài | Nội dung | Score ở điểm cắt`.
3. Dấu hiệu AI và lỗi nội dung, ví dụ lỗi sinh học.
4. Giới hạn của phân tích. Ví dụ: bản quay màn hình không còn metadata gốc, nên không xác định chắc clip tạo từ ảnh hay từ text.
