# Voice Studio

Website nhái giọng và đọc văn bản, chạy trên máy này bằng mô hình [OmniVoice](https://github.com/k2-fsa/OmniVoice). Dựng ngày 2026-09-24.

Website chạy qua GPU của Mac M1 (MPS). Website không gọi dịch vụ trả phí và không gửi file ra ngoài máy.

## Mở website

- Cách 1: bấm đúp file `Mo Voice Studio.command` trong Finder. File này tự bật máy chủ nếu chưa chạy, rồi mở trình duyệt.
- Cách 2: chạy `./start.sh` trong Terminal, rồi mở `http://localhost:8765`.

Lần đầu bật, máy nạp mô hình mất khoảng 10 đến 80 giây. Góc phải trên cùng hiện "Sẵn sàng (MPS)" khi dùng được.

Để tắt máy chủ, bạn chạy `pkill -f "uvicorn app.main:app"`.

## Cài trên máy mới

Thư mục này nằm trong repo `video-flow`, ở `~/video-flow/voice-studio`. `setup.sh` của repo tạo symlink `~/voice-studio` trỏ về đây và cài `.venv`. Skill `voice-clone` gọi `~/voice-studio/vc.py`.

Nếu bạn cài tay, bạn chạy:

```
cd ~/video-flow/voice-studio
uv venv --python 3.11 .venv
uv pip install --python .venv/bin/python -r requirements.txt
ln -sfn ~/video-flow/voice-studio ~/voice-studio
```

- Lần chạy đầu, máy tải mô hình OmniVoice 2,46 GB vào `~/.cache/huggingface/hub/`.
- Giọng mẫu không nằm trong git. Bạn chép `~/voice-clone/voices/` từ máy cũ.
- `vc.py` chỉ dùng GPU Apple (MPS). Máy không có MPS thì chạy CPU, chậm hơn nhiều.

## Dùng từ dòng lệnh

`vc.py` chép từ `~/voice-clone/vc.py` ngày 2026-11-07 và dùng cùng thư viện giọng với website. Skill `voice-clone` của Claude gọi script này.

```
.venv/bin/python vc.py list
.venv/bin/python vc.py add <tên-giọng> <file-ghi-âm> [--text "lời trong đoạn"] [--note "ghi chú"]
.venv/bin/python vc.py say --voice <tên-giọng> --text "..." --out out.wav [--steps 32]
.venv/bin/python vc.py batch --voice <tên-giọng> --jobs jobs.json
```

`jobs.json` là danh sách `[{"text": "...", "out": "/đường/dẫn/tuyệt/đối.wav"}]`. Lệnh `batch` nạp mô hình 1 lần cho cả danh sách.

Đo ngày 2026-11-07: lần nạp mô hình đầu tiên sau khi bật máy mất 75 giây. Một câu dài 3,6 giây mất 10 giây xử lý với `--steps 16`.

OpenMontage vẫn gọi bản cũ `~/voice-clone/vc.py` với `.venv` riêng của bản đó.

## Tính năng

### Giọng mẫu

1. Bạn nhập tên giọng và chọn file ghi âm: MP3, MP4, M4A, WAV, MOV, WEBM, OGG hoặc FLAC.
2. Nếu bạn nhập lời trong đoạn ghi âm, máy dùng nguyên file. File phải dài tối đa 15 giây.
3. Nếu bạn để trống phần lời, máy tự cắt đoạn 3 đến 10 giây ở chỗ ngừng nói, rồi Whisper tự nghe lời.
4. Nếu muốn tự chọn đoạn, bạn nhập giây bắt đầu và giây kết thúc.

Mỗi giọng có đoạn mẫu và một câu đọc thử để nghe lại. Trong thư viện, bạn đổi được tên giọng và xoá được giọng.

Chỉ nhái giọng của bạn, hoặc của người đã đồng ý cho dùng.

### Đọc văn bản

Website có 3 cách chọn giọng:

| Cách | Mô tả |
|---|---|
| Giọng mẫu | Đọc bằng một giọng trong thư viện |
| Thiết kế giọng | Tạo giọng theo giới tính, độ tuổi, cao độ, giọng vùng, kiểu thì thầm |
| Tự động | Mô hình tự chọn giọng |

Các tham số chỉnh được:

| Tham số | Mặc định | Tác dụng |
|---|---|---|
| Ngôn ngữ | Tiếng Việt | Chọn đúng ngôn ngữ thì đọc chuẩn hơn |
| Tốc độ | 1.0 | Lớn hơn 1 thì đọc nhanh hơn |
| Độ dài cố định | Trống | Ép bản đọc dài đúng số giây, bỏ qua tốc độ |
| Chất lượng | 32 bước | 16 bước nhanh gấp đôi, dùng để nghe thử |
| Độ bám lời | 2.0 | Classifier-free guidance |
| Dịch lịch nhiễu | 0.1 | t_shift |
| Nhiệt độ chọn token | 0 | class_temperature, lớn hơn 0 thì bản đọc thay đổi mỗi lần |
| Nhiệt độ chọn vị trí | 5 | position_temperature |
| Phạt lớp sâu | 5 | layer_penalty_factor |
| Độ dài mỗi đoạn | 15 giây | Văn bản dài được chia thành đoạn cỡ này |
| Ngưỡng chia đoạn | 30 giây | Bản đọc dài hơn ngưỡng này thì bắt đầu chia đoạn |
| Khử nhiễu, Hậu xử lý | Bật | denoise, postprocess_output |
| Chuẩn hoá số và ngày | Tắt | normalize_text |

Mỗi bản đọc lưu file WAV 24 kHz ở `outputs/`, kèm file JSON ghi văn bản và tham số. Tab "Đọc văn bản" có danh sách lịch sử để nghe lại, tải về hoặc dùng lại văn bản.

## Tốc độ trên Mac M1

Đo ngày 2026-09-24: một câu dài 3,6 giây mất khoảng 10 giây xử lý với 16 bước. Với 32 bước, thời gian xử lý khoảng gấp đôi. Mỗi lần máy chỉ chạy một việc, các việc khác xếp hàng chờ.

## Thư mục và dữ liệu

| Đường dẫn | Nội dung |
|---|---|
| `app/engine.py` | Nạp mô hình, thêm giọng, đọc văn bản |
| `app/main.py` | Máy chủ FastAPI, hàng đợi việc |
| `static/` | Giao diện HTML, CSS, JS |
| `vc.py` | Script dòng lệnh cho agent |
| `requirements.txt` | Thư viện Python cài vào `.venv` |
| `outputs/` | Các bản đọc, không có trong git |
| `~/voice-clone/voices/` | Thư viện giọng, dùng chung với công cụ `~/voice-clone` và các clip OpenMontage |

Đổi thư mục giọng bằng biến `VOICES_DIR`, đổi thư mục bản đọc bằng biến `OUTPUTS_DIR`, đổi cổng bằng biến `PORT`.

Máy chủ chỉ nghe ở `127.0.0.1`, nên máy khác trong mạng không vào được.
