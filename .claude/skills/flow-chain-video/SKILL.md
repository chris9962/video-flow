---
name: flow-chain-video
description: >
  Dựng video AI liền mạch từ chuỗi clip nối tiếp trên Google Flow (Veo): GPT tạo ảnh khung, Flow tạo
  clip từ ảnh start + ảnh end, khung cuối thật của clip trước làm ảnh start của clip sau, rồi ghép
  crossfade và đo điểm nối. Skill lo kịch bản, bảng phân cảnh, chọn 1 hay nhiều clip theo thời lượng,
  prompt GPT và Flow, ảnh 9:16 để tải lên Flow, kiểm tra clip tải về, phân tích video mẫu. Dùng mỗi khi người dùng
  muốn làm hoặc làm lại video AI có chủ thể biến đổi liên tục (vòng đời côn trùng, động vật lớn lên,
  cây nảy mầm, time-lapse, biến hình), nhắc tới Google Flow, Veo, "Frames to Video", "ảnh start ảnh end",
  "first/last frame", "nối clip", "clip nối tiếp", "video liền mạch", "dựng lại video này", hoặc gửi
  video mẫu và hỏi cách làm — kể cả khi không nhắc tên skill. Dùng cả khi người dùng muốn đăng video
  đã làm lên YouTube Shorts hoặc fanpage Facebook "Life Cycle Lab". Không dùng cho website cuộn trang
  (scroll-world) hay tải video (video-downloader).
---

# flow-chain-video

Skill này tạo một video ngắn mà người xem không thấy điểm nối giữa các clip. Mỗi clip do Google Flow tạo từ một ảnh start, một ảnh end và một prompt chuyển động.

`<skill>` trong file này là thư mục chứa `SKILL.md`, thường là `~/.claude/skills/flow-chain-video`.

Trả lời người dùng bằng tiếng Việt kỹ thuật: kết luận trước, câu ngắn, số liệu thay cho tính từ. Prompt cho GPT và Flow viết bằng tiếng Anh.

## Nguyên lý chuỗi clip

**K** là viết tắt của keyframe, nghĩa là ảnh khung. K01, K02, K03… là ảnh tĩnh do GPT tạo, mỗi ảnh là một giai đoạn của chủ thể. Khi nói với người dùng, định nghĩa K ở lần dùng đầu.

| Clip | Ảnh start | Ảnh end |
|---|---|---|
| 1 | K01: ảnh khung do GPT tạo | K02 |
| 2 | Khung cuối thật của clip 1 | K03 |
| n | Khung cuối thật của clip n-1 | K(n+1) |

- Ảnh end là ảnh GPT. Ảnh end điều khiển giai đoạn tiếp theo của chủ thể.
- Ảnh start của clip sau là **khung cuối thật** trích từ clip trước, không phải ảnh GPT. Lý do: Flow không tạo khung cuối giống 100% ảnh end. Nếu clip sau bắt đầu lại từ ảnh GPT, phần chênh lệch hiện ra thành bước nhảy. Video mẫu đã phân tích có bước nhảy score 0,15, trong khi chuyển động bình thường chỉ 0,02–0,04.
- Chuỗi n clip cần n+1 ảnh GPT.

## Quy trình

0. Chuẩn bị công cụ (lần đầu).
1. Phân tích video mẫu, nếu người dùng gửi video mẫu.
2. Xem ảnh thật của loài trên Google. Viết kịch bản, chọn số clip, hỏi người dùng có làm clip mở đầu M không, lập bảng phân cảnh. Người dùng duyệt.
3. Viết prompt ảnh khung. Người dùng tạo ảnh trong GPT. Claude kiểm tra ảnh.
4. Viết prompt chuyển động cho Flow.
5. Viết `plan.json`.
6. Tạo clip tuần tự trên Flow. Kiểm tra khung cuối sau mỗi clip.
7. Ghép clip.
8. Đo điểm nối.
9. Viết tiêu đề và mô tả để đăng mạng xã hội.
10. Đăng video lên YouTube Shorts và fanpage Facebook.

Bước 2 quyết định chất lượng video. Các bước sau chỉ thực hiện điều bước 2 đã hình dung.

## Bước 0 — Chuẩn bị

- Cần `ffmpeg`, `ffprobe`, `node` ≥ 18.
- Thư mục làm việc: `<thư mục dự án>/<tên-video>/`. Thư mục chứa `plan.json`, `K01.png`, `K02.png`… Script tự tạo `input/`, `clips/`, `frames/`.
- Cách làm mặc định ở bước 6 là người dùng tạo clip trong Flow. Cách này không cần Chrome CDP.
- Phần tự động Flow cần cài thư viện và mở Chrome CDP. Chi tiết: `references/flow-tu-dong.md`.

## Bước 1 — Phân tích video mẫu

Đọc `references/phan-tich-video-mau.md`. Tóm tắt:

1. Đo độ dài, fps, âm thanh.
2. Trích 1 khung mỗi giây, ghép thành 1 ảnh, xem toàn bộ diễn biến.
3. Tìm điểm cắt: `node <skill>/scripts/chain.mjs scenes <video> [--crop w:h:x:y]`.
4. Trích khung dày quanh từng điểm cắt, phân loại: cắt cứng, bước nhảy, chuyển động nhanh, trình phát lặp lại.
5. Gửi người dùng: bảng diễn biến theo giây, bảng clip và điểm cắt, lỗi nội dung.

## Bước 2 — Kịch bản và số clip

Người viết prompt phải hình dung từng giây của mỗi clip trước khi viết. Flow chỉ tạo đúng khi prompt kể đúng thứ tự sự kiện, và khi ảnh end là kết quả hợp lý của ảnh start cộng các sự kiện đó.

### 2.0. Xem ảnh thật của loài

Khi video nói về một loài động vật, Claude phải xem ảnh thật của loài trên Google trước khi viết kịch bản. Người dùng yêu cầu bước này ngày 2026-11-02.

Lý do: tài liệu chữ không tả đủ hình dạng của từng giai đoạn. Video ngài vải 2026-11-02: kịch bản chỉ dựa trên tài liệu chữ. Kịch bản cho sâu non vừa nở đã nằm trong tổ xám, và bỏ bước sâu trần tự làm tổ. Người dùng phát hiện lỗi này, và Claude phải tạo lại clip B.

Cảnh báo: Chrome CDP phải đang chạy. Nếu ảnh chụp là trang kiểm tra "not a robot" của Google, Claude báo người dùng.

1. Claude lập danh sách từ khoá. Mỗi giai đoạn có 1 từ khoá: tên khoa học + tên tiếng Anh của giai đoạn. Thêm 1 từ khoá cho nơi sống.
   Ví dụ: `Phereoeca uterella eggs`, `Phereoeca uterella larva newly hatched`, `Phereoeca uterella case on wall`, `Phereoeca uterella pupa`, `Phereoeca uterella adult moth`.
2. Claude chạy:
   ```bash
   node <skill>/scripts/anh-google.mjs <thư mục làm việc>/google "<từ khoá 1>" "<từ khoá 2>" ...
   ```
   Script mở 1 tab nền, chụp trang Hình ảnh của từng từ khoá thành `google-01.png`, `google-02.png`…, rồi đóng tab. Mỗi từ khoá mất khoảng 4 giây.
3. Claude mở từng ảnh chụp và ghi chi tiết thấy được: màu, hình dạng, tỉ lệ kích thước, tư thế, nơi sống, số lượng, hành vi. Claude không ghi số ngày của từng giai đoạn, vì video không có thuyết minh.
4. Trang kết quả có cả hình vẽ, ảnh AI và ảnh loài khác. Claude chỉ tin chi tiết lặp lại ở nhiều ảnh chụp thật. Nguồn nên ưu tiên: iNaturalist, BugGuide, Wikipedia, trang của trường đại học.
5. Giai đoạn chuyển tiếp ít ảnh, ví dụ vừa nở, vừa lột xác, vừa chui ra. Claude tìm thêm từ khoá `hatching`, `first instar`, `molting`, `emerging`.
6. Claude ghi chi tiết vào mục "Chi tiết hình ảnh" của `kich-ban.md`, kèm danh sách từ khoá. Nếu ảnh thật khác ảnh mẫu người dùng gửi, Claude báo người dùng.

### 2.1. Chọn 1 clip hay nhiều clip

Độ dài tối đa của một clip quyết định số clip. Flow cho chọn 4, 6, 8, 10 giây. Chưa kiểm tra model nào hỗ trợ 10 giây.

1. Liệt kê các **thay đổi chính** của chủ thể. Ví dụ: sâu → kén, kén → bướm. Đổi màu, đổi tư thế nhỏ là thay đổi phụ.
2. Gán số giây hiển thị cho từng thay đổi trong video cuối.
3. Chọn số clip:

| Điều kiện | Chọn |
|---|---|
| Tổng ≤ độ dài clip tối đa, và ≤ 2 thay đổi chính | 1 clip |
| Tổng > độ dài clip tối đa | Nhiều clip |
| > 2 thay đổi chính | Nhiều clip, mỗi clip 1–2 thay đổi chính |
| Đổi bối cảnh | Clip mới. Muốn liền mạch thì thêm clip nối có camera di chuyển. |

Một clip làm quá nhiều thay đổi thì Flow dễ cắt cảnh giữa clip hoặc bỏ qua giai đoạn giữa.

Nếu một thay đổi chính có nhiều bước nhỏ, clip đó chỉ chứa thay đổi đó. Ví dụ: lột xác gồm da nứt, chủ thể chui ra, da cũ chìm. Video muỗi 2026-10-17: clip "nở + lớn" đạt ngay lần đầu, clip "lột xác" phải tạo 4 lần.

### 2.2. Đặt điểm nối

Đặt điểm nối vào lúc chủ thể đứng yên, hoặc chuyển động đều. Lý do: hai clip chỉ khớp khi trạng thái chuyển động ở cuối clip trước giống đầu clip sau. Chủ thể đứng yên là trạng thái dễ khớp nhất. Ví dụ tốt: kén nâu treo yên. Ví dụ xấu: giữa lúc sâu đang nhả tơ.

Bên trong một clip, chuyển động tự do. Chỉ hai đầu clip cần khớp.

### 2.3. Hệ số tăng tốc

Hệ số tăng tốc = tổng số giây render ÷ số giây của video cuối.

Ví dụ: 2 clip × 8 giây = 16 giây render, video cuối 11 giây → hệ số 1,45. Hệ số quá lớn: chọn `duration` ngắn hơn cho từng clip.

Giới hạn tốc độ: `output.speed` không nên vượt 1,5. Người dùng ghi chú ngày 2026-11-07: tốc độ 1,6 quá nhanh. Người dùng chọn 1,4 cho video kiến lửa và video cá thòi lòi. Video cuối phải dài ít nhất 30 giây. Người dùng yêu cầu ngày 2026-11-08, vì Facebook cần thời gian xem trung bình 24 giây. Nếu video ngắn hơn 30 giây ở tốc độ 1,4, Claude đề xuất thêm clip hoặc giảm tốc, rồi hỏi người dùng. Clip M là ngoại lệ: `clips[].speed` của clip M theo quy tắc 1–1,5 giây ở mục 2.4.

### 2.4. Clip mở đầu M: camera tiến từ toàn cảnh vào chủ thể

Clip M là tuỳ chọn. Claude phải hỏi người dùng có làm clip M không, trước khi lập bảng phân cảnh. Nếu người dùng không trả lời, Claude không làm clip M.

Ngày 2026-11-08, người dùng nhận xét: các video đã đăng có clip M ít lượt xem. Người dùng yêu cầu video tiếp theo không có clip M, để so kết quả.

Người dùng đề ra clip M ngày 2026-11-05, sau video gián nhà. Ý tưởng của người dùng: cảnh đầu quay rộng cả nơi sống, rồi camera tiến sâu vào tới cảnh 1 của vòng đời.

Quy tắc độ dài: trong video cuối, đoạn mở đầu M phải dài 1–1,5 giây. Không được để đoạn M dài hơn 1,5 giây. Người dùng yêu cầu quy tắc này ngày 2026-11-07. Quy tắc này thay cho mức khoảng 4 giây ngày 2026-11-05.

Flow phải tạo clip M ở độ dài ngắn nhất, để camera tiến nhanh ngay trong clip. Người dùng yêu cầu điều này ngày 2026-11-05. Khi ghép, Claude đưa đoạn M về 1–1,5 giây bằng `trimStart` và `speed`.

| Mục | Nội dung |
|---|---|
| Ảnh start K00 | Toàn cảnh nơi sống của loài. Chỗ camera đi vào nằm ở giữa khung: khe cửa tủ, lỗ đục trên thân cây, miệng hang. Nhìn qua chỗ đó thấy một phần bên trong. K00 không có chủ thể. |
| Ảnh end K01 | Cận cảnh đầu tiên của vòng đời. GPT sửa từ K00 trong cùng cuộc chat. |
| Diễn biến | Camera tiến đều qua chỗ đi vào, tới cận cảnh chủ thể. Chủ thể đứng yên. |
| Camera | Di chuyển trong clip, đứng yên ở giây cuối, để khớp với clip A có camera đứng yên |
| Độ dài | Flow tạo 4 giây: `plan.json` đặt `"duration": 4` cho clip M. Trong video cuối, đoạn M dài 1–1,5 giây, không được dài hơn. Claude bỏ giây đứng yên ở đầu clip bằng `"trimStart"`, rồi đặt `"speed"` = (4 − trimStart) ÷ (1,5 × `output.speed`). Sau khi ghép, Claude đọc `seams.json`: điểm nối đầu tiên phải ≤ 1,5 giây. |
| Chi phí thêm | 1 ảnh GPT, 1 clip. Clip 6 giây tốn 10 tín dụng. Clip 4 giây tốn 7 tín dụng, đo ngày 2026-11-06. |

Prompt K00 là prompt mới. Prompt kết thúc bằng "No people, no animals. No text, no watermark."

Prompt K01:
```
Edit this image. The camera has moved forward through <chỗ đi vào> into <bên trong>. Show a close-up of <góc cận cảnh>, seen at <góc nhìn>. <bối cảnh cận cảnh>. <nguồn sáng lấy từ K00>. <chủ thể giai đoạn đầu, tả như K01 thường>. No text, no watermark.
```

Prompt clip M:
```
In a single continuous shot, no scene cuts, no fade, no dissolve. One smooth camera move: the camera quickly and smoothly pushes forward across <toàn cảnh> toward <chỗ đi vào>, moves through <chỗ đi vào> into <bên trong>, and glides close to <vị trí chủ thể>, where <chủ thể> stands still. The <chủ thể> does not move. In the final second the camera stops moving. Nothing else changes. Quiet natural ambience, no music, no dialogue.
```

Video gián dùng chữ "slowly". Mẫu trên dùng "quickly and smoothly" để camera tiến nhanh, chưa kiểm chứng.

Kết quả video gián nhà 2026-11-05: clip M 6 giây đạt ở lần tạo đầu. Camera tiến thật qua cửa tủ, không hoà hình, score cao nhất 0,031. Camera tiến chậm trong 2 giây đầu, đứng yên từ giây 5. Người dùng thấy đoạn này chậm, nên Claude đặt `"speed": 1.5` khi ghép: đoạn mở đầu còn 3,97 giây. Prompt đầy đủ: `references/vi-du.md`.

Kết quả video kiến lửa 2026-11-06: clip M 4 giây, prompt có "quickly and smoothly", đạt ở lần tạo đầu. Camera đứng yên ở giây 0–1,0, tiến vào ở giây 1,0–2,5, đứng yên từ giây 2,5. Người dùng muốn đoạn mở đầu dài 1,5 giây. Claude đặt `"trimStart": 1.0` để bỏ giây đứng yên đầu, và đặt `"speed"` của clip M theo công thức: speed = (4 − trimStart) ÷ (1,5 × `output.speed`). Ảnh K00 là mặt cắt bãi cỏ có ụ đất của tổ kiến, phía dưới là đường hầm. Camera đi xuyên đường hầm xuống khoang, có nhoè chuyển động.

Chỗ dễ sai:
- Ánh sáng ở K01 phải có nguồn trong K00, ví dụ đèn bếp chiếu qua khe cửa tủ. Nếu không, Flow có thể đổi ánh sáng đột ngột.
- Sau khi GPT sửa K00 thành K01, GPT trả ảnh 1086×1448, tỉ lệ 3:4. Các ảnh K sau giữ cỡ này. `chain.mjs` cắt giữa về 9:16 và bỏ 136 px mỗi bên. Prompt K01 nên giữ chủ thể trong 70% giữa chiều rộng.
- Đặt tên: clip M, ảnh K00. Các clip vòng đời giữ tên A, B, C… và ảnh K01, K02…

### 2.5. Bảng phân cảnh

Điền bảng này cho mỗi clip:

| Mục | Nội dung |
|---|---|
| Clip | id, độ dài render |
| Khung giây 0 | Người xem thấy gì. Đây là ảnh start. |
| Diễn biến | Các sự kiện theo thứ tự, mỗi sự kiện chiếm khoảng bao nhiêu giây |
| Khung giây cuối | Người xem thấy gì. Đây là ảnh end. |
| Thứ chuyển động | Chủ thể, bộ phận của chủ thể |
| Thứ đứng yên | Cành, nền, ánh sáng, camera |
| Camera | Đứng yên, hoặc kiểu chuyển động cụ thể |
| Trạng thái ở điểm nối | Chủ thể đứng yên hoặc chuyển động đều |

Mẫu đã điền đầy đủ: `references/vi-du.md`.

### 2.6. Người dùng duyệt

Gửi người dùng: bảng phân cảnh, số clip, số ảnh GPT cần tạo, model, độ dài, hệ số tăng tốc. Ghi rõ video có clip M hay không, theo câu trả lời ở mục 2.4. Chờ người dùng duyệt trước bước 3. Ảnh GPT tốn thời gian của người dùng. Clip Flow tốn credit.

Nếu video có mục đích giáo dục, hỏi người dùng có cần đúng sinh học không. Hai video mẫu đã phân tích có lỗi: sâu bướm Luna thật làm kén trong lá khô dưới đất, không treo kén trên cành; bướm phượng thật đẻ từng trứng riêng lẻ, không đẻ thành cụm.

## Bước 3 — Ảnh khung trong GPT

Người dùng tự tạo ảnh trong ChatGPT. Claude viết prompt và kiểm tra ảnh.

Cách tự động, kiểm chứng ngày 2026-10-18: Claude khai báo `keyframes` trong `plan.json` (bước 5), rồi chạy:

```bash
node <skill>/scripts/chain.mjs images <plan.json> [K02.png] [--force]
```

- Script tạo K01 trong cuộc chat mới. Các ảnh K sau sửa trong cùng cuộc chat. Script lưu URL cuộc chat vào `gpt-chat.json`.
- Nếu K01 do người dùng tự tạo, script đính kèm K01 vào cuộc chat mới rồi sửa tiếp.
- Mỗi ảnh mất khoảng 25–45 giây. Script tải ảnh 1024×1536 về thẳng thư mục làm việc.
- Chrome CDP phải đăng nhập ChatGPT. Gói Free giới hạn số ảnh mỗi ngày; script báo lỗi khi ChatGPT trả lời là đã hết lượt.

Quy tắc cho prompt:
- **K01** là prompt mới. Mô tả bối cảnh, chủ thể, ánh sáng, độ sâu trường ảnh.
- **K02 trở đi** bắt đầu bằng "Edit this image." và người dùng gửi trong **cùng cuộc chat**, sửa trên ảnh trước. Lý do: tạo ảnh mới từ đầu làm cành, nền, góc máy lệch nhau, và video có bước nhảy dù điểm nối đúng kỹ thuật.
- Mỗi ảnh Kn+1 chỉ khác Kn 1–2 thay đổi chính, cùng bối cảnh, cùng góc máy.
- Video 9:16: dùng khổ dọc 2:3 trong GPT. Giữ chủ thể ở giữa, không đặt chi tiết quan trọng sát mép trái và phải. `chain.mjs` cắt giữa ảnh về 9:16. Với ảnh 1024×1536, script bỏ 80 px mỗi bên.
- Thêm "No text, no watermark."
- Ghi cỡ chủ thể theo tỉ lệ với ảnh trước, ví dụ "2.5 times longer than now". Không ghi theo khung hình. Video cá phổi 2026-11-04: prompt ghi "one twelfth of the frame width", GPT vẽ dài 31% chiều rộng. Prompt "reduce it to one third of its present length" và "2.5 times longer than now" đều đạt.
- Tạo mọi ảnh bằng cùng một công cụ GPT. Hai công cụ khác nhau cho màu và ánh sáng khác nhau.

Người dùng lưu ảnh thành `K01.png`, `K02.png`… trong thư mục làm việc. Sau đó Claude mở từng ảnh và so:
- Cành, nền, góc máy, ánh sáng giống nhau.
- Chủ thể ở cùng vị trí.
- Thay đổi giữa 2 ảnh liền kề đúng như bảng phân cảnh.
- Chủ thể giống ảnh thật đã xem ở mục 2.0: màu, hình dạng, tỉ lệ.

Báo người dùng mọi chỗ lệch trước khi sang bước 6.

## Bước 4 — Prompt chuyển động cho Flow

Prompt phải ngắn: 1 sự kiện, khoảng 25–40 từ, viết trên một dòng. Ảnh start và ảnh end đã cho model biết hình dạng chủ thể. Prompt chỉ nói 3 điều: chủ thể làm gì, nhanh hay chậm, và thứ gì không được đổi.

Mẫu, cập nhật ngày 2026-10-21:

```
In a single continuous shot, no scene cuts. Static locked-off camera, no camera movement, no zoom. Time-lapse. The <subject> slowly <1 hành động dẫn tới ảnh end>. The <thứ khác> stay still. Nothing else changes.
```

- Câu đầu "In a single continuous shot, no scene cuts." lấy từ tài liệu Google cho Omni Flash. Câu này chưa được kiểm chứng trên video thật.
- Phần còn lại của mẫu đã đạt ở cả 5 clip của video ong mật 2026-10-21.

### 4.1. Tài liệu của Google

Nguồn: https://ai.google.dev/gemini-api/docs/omni, đọc ngày 2026-10-21. Flow dùng cùng model: log của `flow.mjs` ghi `omni_flash_i2v_6s_first_last`.

| Điểm | Tài liệu ghi | Áp dụng trong skill |
|---|---|---|
| Mặc định nhiều cảnh | "By default Omni Flash will try to create a video with a few different shots." Muốn 1 cảnh, prompt phải ghi "In a single continuous shot" hoặc "No scene cuts". | Câu đầu của mẫu |
| Ví dụ ảnh đầu + ảnh cuối | Prompt 1 câu, khoảng 20 từ, chỉ tả quá trình chuyển đổi | Prompt ngắn, 1 sự kiện |
| Prompt sửa video | "Overly descriptive prompts can lead to unintended changes." | Không tả lại hình dạng đã có trong ảnh |
| Câu cấm | Ghi thẳng trong prompt, ví dụ "Do not …", "No …". Không có ô prompt phủ định riêng. | "no zoom", "Nothing else changes." |
| Mốc thời gian | Prompt nhận dạng `[0-3s] …` `[3-6s] …` | Mục 4.4 |
| Âm thanh | Mặc định model tự tạo tiếng. Prompt có thể tả tiếng cần có. | Mục 4.4 |
| Prompt chỉ có chữ, không có ảnh | Nên tả chi tiết nhân vật, bối cảnh, camera, ánh sáng | Không áp dụng, vì skill luôn có ảnh start |

Một bài đánh giá của bên thứ ba ghi: prompt 30–80 từ cho kết quả tốt nhất, prompt trên 100 từ cho kết quả kém hơn. Thông số máy ảnh như ISO, f-stop làm video kém mạch lạc.

### 4.2. Số liệu thực tế

Ví dụ đã đạt, video muỗi 2026-10-17:

```
Static camera. Time-lapse. The middle larva slowly curls up and turns into a pupa. The other two larvae stay still. Nothing else changes.
Static camera. Time-lapse. An adult mosquito slowly climbs out of the pupa and stands on the water. The other two larvae stay still. Nothing else changes.
```

Số liệu từ cùng clip lăng quăng → cung quăng:

| Prompt | Độ dài clip | Kết quả |
|---|---|---|
| 6 sự kiện, 125 từ, tả hình dạng cung quăng | 8 giây | Cung quăng sai hình. Côn trùng lạ bay ở giây 6. Cung quăng đổi hình đột ngột ở 0,8 giây cuối. |
| 1 sự kiện, 22 từ | 6 giây | Đạt. Lăng quăng cuộn lại thành cung quăng, cung quăng nằm yên từ giây 4,8. |

Số liệu từ các video sau:

| Video | Prompt | Kết quả |
|---|---|---|
| Bọ rùa 2026-10-20, clip B | 2 sự kiện: ấu trùng nhỏ bò đi, 1 con lớn lên. Không ghi nhịp độ. | Không đạt. Ấu trùng lớn hiện ra bằng chuyển cảnh mờ dần. |
| Bọ rùa 2026-10-20, clip B | Cùng 2 sự kiện, thêm "quickly crawl away" và "slowly grows bigger and bigger" | Đạt. Ấu trùng lớn dần. |
| Ong mật 2026-10-21, 5 clip | Mỗi prompt 30–36 từ, 1 sự kiện, theo mẫu không có câu đầu | Cả 5 clip đạt ở lần tạo đầu |
| Bướm phượng chanh 2026-10-21, 5 clip | Mẫu đầy đủ, có câu "In a single continuous shot, no scene cuts." và câu âm thanh ở mục 4.4. Mỗi prompt 40–50 từ. | Cả 5 clip dùng được ở lần tạo đầu, không clip nào cắt cảnh. 3 clip vẫn có hoà hình 0,25–0,5 giây ở lúc chủ thể đổi màu hoặc đổi hình: sâu nâu thành sâu xanh, sâu thành nhộng, cánh có đuôi thành cánh không đuôi. |
| Chuồn chuồn hoàng đế 2026-10-21, 5 clip | Mẫu đầy đủ, có câu âm thanh. Mỗi prompt 45–55 từ. | Cả 5 clip dùng được ở lần tạo đầu, không clip nào cắt cảnh. Clip lột xác có hoà hình 0,25 giây lúc thân con trưởng thành hiện ra. Clip đổi màu thân không có hoà hình. |
| Tằm dâu 2026-10-22, clip tằm non đen 3 mm → tằm trắng lớn, ăn mất nửa lá | Mẫu đầy đủ, 1 clip. Lần 2 thêm "gradually fading from black to grey to creamy white" và "There is only one silkworm." | Cả 2 lần không đạt: tằm đen đổi ngay thành tằm lớn trong 1 khung hình ở giây 1,4. Tách thành 2 clip qua ảnh trung gian tằm xám cỡ vừa: clip đầu chỉ đổi màu trong 2 khung hình, clip sau vẫn hoà hình 0,6 giây và lá mờ dần thay cho bị ăn. |
| Ve sầu 17 năm 2026-10-23, clip ấu trùng lớn dần tại chỗ, dài gấp 2,4 lần | Lần 1: mẫu đầy đủ, "slowly grows bigger and bigger". Lần 2 thêm "stays in the same spot", "little by little, during the whole clip" và "The chamber, the root, the soil and the tree trunk stay exactly the same." | Lần 1 không đạt: Flow cắt cảnh ở giây 1,0, score 0,373, ấu trùng to gấp 1,8 lần ngay ở cảnh mới. Lần 2 đạt: ấu trùng lớn dần đều trong 6 giây, score cao nhất 0,101. 4 clip sau đạt ở lần tạo đầu. |
| Bọ cánh cứng tê giác Nhật Bản 2026-10-24, 7 clip | Mẫu đầy đủ. Clip lớn dần dùng câu "stays in the same spot ... during the whole clip" của video ve sầu. | Cả 7 clip đạt ở lần tạo đầu. Ấu trùng lớn 3,5 lần không cắt cảnh. 2 clip lột xác không hoà hình rõ: da tiền nhộng tuột xuống dần, cánh cứng trắng hiện ra trong 0,75 giây. |
| Ốc bươu vàng 2026-11-01, 6 clip, ảnh nửa trên nửa dưới mặt nước | Mẫu đầy đủ. Clip lớn dần dùng câu "stays in the same spot ... during the whole clip". | 4 clip đạt ở lần tạo đầu, kể cả clip ốc con rơi từ thân lúa xuống nước. Clip ốc lớn 5 lần không đạt 2 lần: ốc đổi cỡ trong 1 khung hình ở giây 1,5. Lần 1, ảnh start và ảnh end có ốc quay đầu ngược nhau. Lần 2 sửa hướng ốc nhưng vẫn lỗi. Ốc lớn 2 lần trong clip trước cũng đổi cỡ trong 1 khung hình. |
| Nhện nước 2026-11-01, 6 clip, dưới nước, chủ thể trong chuông khí trong suốt | Mẫu đầy đủ. Mỗi ảnh K giữ nhện lớn tối đa khoảng 3 lần so với ảnh trước. | Cả 6 clip đạt ở lần tạo đầu. Clip lớn dần 2,5 lần không đổi cỡ trong 1 khung hình. Clip bắt mồi không có "Time-lapse.": con mồi bơi vào từ mép khung, nhện bắt mồi đúng như prompt. |
| Châu chấu lúa 2026-11-02, 6 clip, mặt cắt đất ở 40% dưới của khung, chủ thể bám thân lúa đứng | Mẫu đầy đủ. Mỗi ảnh K giữ châu chấu lớn tối đa 2,3 lần so với ảnh trước. | Cả 6 clip đạt ở lần tạo đầu. Clip lột xác lần cuối: con trưởng thành màu nhạt ngả ra sau khỏi xác lột, cánh xoè ra, rồi đổi sang màu xanh ở giây 5, score 0,065. Clip gặm lá không có "Time-lapse.": vết gặm trên mép lá lớn dần, lá không mờ dần. |
| Ngài vải 2026-11-02, 7 clip, tường vữa trong nhà nhìn thẳng, sâu trong tổ xám | Mẫu đầy đủ. Clip F lần 1 kể 2 sự kiện: sâu nhả tơ buộc 2 đầu tổ, rồi rút đầu vào tổ. | Lần 1 không đạt: sâu chui hẳn ra khỏi tổ, bò quanh tổ 3,5 giây, rồi biến mất trong 1 khung hình. Lần 2 bỏ câu nhả tơ, thêm "The larva never comes out of the case. There is only one larva." và đạt. Clip "trứng nở + sâu tự làm tổ" không đạt: ảnh end có sẵn tổ, nên sâu chui ra đã có tổ. Claude thêm ảnh sâu trần tạo từ ảnh end bằng `--ref`, tách thành 2 clip, cả 2 đạt ở lần tạo đầu. |
| Đuông dừa 2026-11-03, 8 clip, mặt cắt dọc ngọn dừa nhìn thẳng | Mẫu đầy đủ. Clip lớn dần dùng câu "stays in the same spot ... during the whole clip". | 7 clip dùng được ở lần tạo đầu. Clip E, đuông lớn 1,9 lần và đầu đổi hình, không đạt: đuông giữ nguyên cỡ tới giây 4,4 rồi to gấp 1,9 lần trong 1 khung hình. Lần 2 thêm "grows smoothly and evenly from the first second to the last second" và "Its head grows together with its body.": đuông lớn dần tới giây 4,25, rồi vẫn đổi cỡ 1,3 lần. Clip D, đuông lớn 2,1 lần mà đầu không đổi hình, đạt ở lần đầu. |
| Ruồi trâu 2026-11-03, 9 clip, bờ ruộng lúa nhìn ngang, 40% dưới là mặt cắt bùn | Mẫu đầy đủ. Clip F lần 1 kể 2 sự kiện không có mốc thời gian: ấu trùng ăn giun, rồi lớn 2,1 lần. | 8 clip đạt ở lần tạo đầu. Clip F lần 1 không đạt: ấu trùng to gấp 1,9 lần trong 1 khung hình ở giây 3,75. Lần 2 dùng mốc thời gian `[0-2s] The larva slowly swallows the red worm. [2-6s] The larva ... grows bigger and bigger, little by little, smoothly and evenly until the last second` và đạt: ấu trùng nuốt giun tới giây 2,75, rồi lớn dần đều, score cao nhất 0,045. |
| Cá phổi châu Phi 2026-11-04, 10 clip, vũng nước theo mùa, mặt cắt nhìn ngang, nước rút rồi dâng lại | Mẫu đầy đủ. Clip cá đổi vị trí bỏ "Time-lapse.". Clip G lần 1: "slides all the way down ... folds into a U shape". | 9 clip đạt ở lần tạo đầu, kể cả clip mực nước hạ, mực nước dâng, và clip cá trườn khỏi kén rồi bơi lên. Clip G lần 1 không đạt: cá chui ra mép dưới khung, khoang tròn hiện ra trong 1 khung hình. Lần 2 dùng mốc thời gian và câu "The whole fish always stays inside the frame and never goes below the chamber.": cá uốn cong trong khung, nhưng giây 4,75 vẫn đổi hình trong 1 khung hình. Nguyên nhân: ảnh start và ảnh end khác cả vị trí lẫn hình dạng. |
| Gián nhà 2026-11-05, 8 clip. Clip M mở đầu: camera tiến từ toàn cảnh căn bếp ban đêm vào góc trong tủ dưới bồn rửa. Các clip sau: cận cảnh sàn tủ, camera đứng yên. | Clip M: ảnh start là toàn cảnh K00, ảnh end là cận cảnh K01 do GPT sửa từ K00 bằng "The camera has moved forward through the half-open cabinet door". Prompt: "In a single continuous shot, no scene cuts, no fade, no dissolve. One smooth camera move: the camera slowly pushes forward ... In the final second the camera stops moving." | Cả 8 clip đạt ở lần tạo đầu. Clip M: camera tiến thật qua cửa tủ, không hoà hình, score cao nhất 0,031, camera đứng yên từ giây 5. Clip F lột xác: lưng gián con nứt, con trưởng thành trắng bò ra phía trước, xác lột ở lại. |

Câu "no scene cuts" không ngăn hoà hình trên chủ thể. Hoà hình xảy ra khi màu hoặc hình của chủ thể đổi lớn trong 1 clip.

### 4.3. Quy tắc

- Không kể các bước nhỏ của một quá trình, ví dụ da nứt, chui ra, da chìm. Model trộn các bước thành hình ảnh khó hiểu.
- Không tả lại hình dạng chủ thể khi ảnh end đã có hình dạng đó.
- Ghi nhịp độ bằng từ: slowly, quickly, little by little, bigger and bigger. Clip có 2 sự kiện phải ghi nhịp độ cho từng sự kiện.
- Câu "Nothing else changes." giữ lại. Thiếu câu này, model có thể thêm vật lạ vào thời gian trống.
- Clip 1 sự kiện nên dài 6 giây. Clip 8 giây cho model nhiều thời gian trống hơn.
- Tránh chuyển động vật lý phức tạp: bóng nảy, vật bị ném, chất lỏng bắn.
- Không ghi thông số máy ảnh, ví dụ ISO, f-stop, tiêu cự.
- Nếu kết quả khó hiểu, rút gọn prompt trước khi sửa ảnh.

Prompt dài có thể đạt khi quá trình đơn giản. Clip đầu của video muỗi dùng prompt 95 từ cho 2 thay đổi "nở + lớn" và vẫn đạt.

### 4.4. Cách viết chưa kiểm chứng

Hai cách viết dưới đây lấy từ tài liệu Google. Video thật chưa dùng cách nào.

| Cách viết | Dùng khi | Ví dụ |
|---|---|---|
| Mốc thời gian | Clip có 2 sự kiện nối nhau. Cách này có thể thay cho việc tách thành 2 clip. Đã thử 1 lần, video ruồi trâu 2026-11-03, clip F: đạt, xem mục 4.2. | `[0-2s] The tiny larvae quickly crawl away out of the frame. [2-6s] One larva in the center slowly grows bigger and bigger.` |
| Một câu âm thanh giống nhau ở mọi clip | Giảm lệch âm lượng 4–9 dB giữa các clip, xem bước 7 | `Quiet natural ambience, no music, no dialogue.` Đã thử 1 lần, video bướm phượng chanh 2026-10-21: độ to gốc của 5 clip lệch nhau 11 dB, từ −25,9 tới −36,9 LUFS. Video chuồn chuồn hoàng đế 2026-10-21 có câu này lệch 8,6 dB, từ −24,5 tới −33,1 LUFS. Video ve sầu 17 năm 2026-10-23 có câu này lệch 4,6 dB, từ −30,8 tới −35,4 LUFS. Video bọ cánh cứng tê giác Nhật Bản 2026-10-24 có câu này lệch 6,3 dB, từ −29,2 tới −35,5 LUFS. Video ong mật không có câu này lệch 27 dB. Cần thêm video để kết luận. |

Sau khi thử một cách viết, Claude ghi kết quả vào mục 4.2. Cách viết đạt thì Claude đưa vào mẫu.

## Bước 5 — plan.json

```json
{
  "aspect": "9:16",
  "model": "omni-flash",
  "duration": 6,
  "quality": "720p",
  "download": "1080p",
  "keyframes": [
    { "file": "K01.png", "prompt": "Vertical 2:3 macro photo ..." },
    { "file": "K02.png", "prompt": "Edit this image. ..." }
  ],
  "clips": [
    { "id": "A", "start": "K01.png", "end": "K02.png", "prompt": "...", "duration": 8, "trimStart": 1.25 },
    { "id": "B", "start": "@prev", "end": "K03.png", "prompt": "..." }
  ],
  "output": { "file": "final.mp4", "speed": 1.25, "crossfade": 0.1 }
}
```

| Trường | Ý nghĩa |
|---|---|
| `aspect` | `9:16` hoặc `16:9`. Flow chỉ có 2 tỉ lệ này. |
| `model` | `omni-flash` (mặc định), `veo-3.1-lite`, `veo-3.1-fast`, `veo-3.1-quality`. Một model cho cả chuỗi. |
| `duration` | Độ dài mặc định mỗi clip: 4, 6, 8 hoặc 10 giây. Clip có thể ghi đè. Chỉ Omni cho chọn độ dài; Veo cố định 8 giây. |
| `quality` | Độ phân giải tạo của Omni: `360p` hoặc `720p`, mặc định `720p` |
| `download` | Độ phân giải tải về: `720p`, `1080p` hoặc `4K`, mặc định `1080p`. Bản lớn hơn 720p là bản Flow tăng độ phân giải. |
| `keyframes` | Ảnh K cho lệnh `images`, theo thứ tự. Ảnh đầu dùng prompt mới, các ảnh sau bắt đầu bằng "Edit this image." |
| `clips[].start` | Đường dẫn ảnh, tính từ thư mục chứa plan. `@prev` = khung cuối thật của clip trước. Clip đầu không được dùng `@prev`. |
| `clips[].end` | Ảnh end. Bỏ trống nếu không cần, ví dụ clip camera bay tự do. |
| `clips[].model` | Chỉ dùng khi bộ lọc nội dung của Flow từ chối một clip nhiều lần. Đổi model giữa chuỗi làm lệch màu và hạt nhiễu. |
| `clips[].trimStart` | Số giây bỏ ở đầu clip khi ghép. Dùng khi đầu clip có viền đen hoặc cắt cảnh. Khung cuối không đổi, nên clip sau không phải tạo lại. |
| `clips[].speed` | Hệ số tăng tốc riêng của 1 clip khi ghép, nhân thêm với `output.speed`. Video gián 2026-11-05 đặt 1.5 cho clip M 6 giây, xem mục 2.4. |
| `output.speed` | Hệ số tăng tốc khi ghép. Không nên vượt 1,5, xem mục 2.3. Mặc định 1,4. |
| `output.crossfade` | Số giây crossfade ở mỗi điểm nối. 0 = nối thẳng. |
| `output.audio` | `flow` (mặc định): giữ tiếng gốc của Flow. `none`: bỏ tiếng. |

## Bước 6 — Tạo clip tuần tự

Có 2 cách tạo clip. Cách 6.1: người dùng tạo clip trong Flow, Claude chuẩn bị file và kiểm tra kết quả. Cách 6.2: `flow.mjs` tự tạo clip qua Chrome CDP, viết lại ngày 2026-10-18 theo giao diện `flow.google.com`. Hỏi người dùng muốn cách nào. Cách 6.2 cần Chrome CDP đăng nhập tài khoản có gói Flow.

### 6.0. Tài khoản Flow và credit

Chrome CDP có 2 profile và nhiều tài khoản Google, mỗi tài khoản có credit Flow riêng. Chủ máy yêu cầu ngày 2026-11-08: tạo clip bằng tài khoản còn credit, và ghi credit sau mỗi lần dùng.

- Mỗi tài khoản Google được cộng 50 credit Flow mỗi ngày, kể cả tài khoản đã hết credit tháng. Chủ máy báo ngày 2026-11-09 và yêu cầu tận dụng 50 credit này.
- `flow.mjs` tự dò mọi tài khoản ở mọi profile trong `scripts/kenh.json`, rồi điều phối theo kiểu "vừa đủ" (`routeAccounts` trong `flow-tai-khoan.mjs`): trong các tài khoản đủ credit cho clip, chọn tài khoản còn ít credit nhất. Tài khoản chỉ có credit ngày bị dùng trước, tài khoản credit tháng lớn để dành. Script mở tab trong profile của tài khoản đó, kể cả khi video thuộc kênh của profile khác. Không tài khoản nào đủ thì dừng trước khi tạo project. `FLOW_PICK=most` quay về cách cũ: chọn tài khoản nhiều credit nhất.
- `flow-tai-khoan.mjs --so` in thứ tự điều phối và số clip 6 giây mỗi tài khoản còn tạo được.
- Chọn tay: `chain.mjs gen ... --account <email>`, hoặc `"flowAccount": "<email>"` trong `plan.json`. `flow.mjs --flow-profile <oliver|my>` chỉ dò 1 profile.
- Sổ credit: `app/data/flow-credits.json`. Mỗi clip ghi credit trước, sau và số đã dùng.
- Xem credit: `node <skill>/scripts/flow-tai-khoan.mjs` dò lại và ghi sổ. `--so` in sổ, không mở Chrome.
- Flow chọn tài khoản theo URL `flow.google.com/u/<n>/`. Credit nằm trong menu avatar: "1.050 tín dụng Google Flow", "Đặt lại lúc 13:03 vào 8 thg 12".
- Tài khoản hết credit: Flow hiện banner "Bạn sắp dùng hết tín dụng", nút tạo thành icon cảnh báo cam, script cũ kẹt ở bước bấm tạo (bánh mì 2026-11-08).
- Profile phải có ít nhất 1 cửa sổ đang mở trong Chrome CDP thì script mới dò được. Chi tiết: `scripts/chrome-profile.mjs`.

### 6.1. Người dùng tạo clip trong Flow

Cảnh báo trước khi làm:
- Người dùng phải tải lên file trong `upload-flow/`. Ảnh 2:3 gốc của GPT làm Flow thêm viền đen trên và dưới, rồi Veo cắt cảnh giữa clip.
- Mỗi clip phải tạo trong project Flow mới. Thư viện của project cũ giữ ảnh cũ. Video muỗi có 2 lần người dùng chọn nhầm K02 thay cho khung cuối của clip trước.

Các bước:

1. Claude chạy:
   ```bash
   node <skill>/scripts/chain.mjs upload <plan.json> <clipId>
   ```
   Script cắt ảnh start và ảnh end về đúng tỉ lệ, lưu thành `upload-flow/<clipId>_start.png` và `upload-flow/<clipId>_end.png`. Với `@prev`, ảnh start là khung cuối thật của clip trước. Script in cấu hình và prompt.
2. Claude gửi người dùng: 2 đường dẫn file, cấu hình, prompt trong khối code.
3. Người dùng tạo project mới, tải 2 file lên ô "Bắt đầu" và "Kết thúc", chọn cấu hình, dán prompt, bấm tạo.
4. Người dùng tải video về. Bản 720p đủ để xem thử. Bản dùng để ghép phải là 1080p.
5. Claude chép video thành `clips/<clipId>.mp4`, rồi chạy:
   ```bash
   node <skill>/scripts/chain.mjs gen <plan.json> <clipId>
   ```
   Clip đã có, nên lệnh chỉ trích khung đầu, khung cuối và kiểm tra:
   - Viền đen ở khung đầu.
   - Với `@prev`: SSIM giữa khung đầu và khung cuối của clip trước. SSIM là chỉ số giống nhau của 2 ảnh, từ 0 đến 1. Ảnh start đúng cho 0,93–0,95. Ảnh chọn nhầm cho 0,84. Dưới 0,90, script báo sai ảnh start.
6. Claude ghép 1 ảnh từ khung mỗi 0,5 giây và xem diễn biến. Lệnh `scenes` tìm điểm cắt trong clip.
7. Clip không đạt: Claude chuyển bản lỗi vào `clips/loi/`, sửa prompt, rồi lặp lại từ bước 1.

### 6.2. Tự động qua Chrome CDP

Chuẩn bị Chrome CDP và thư viện theo `references/flow-tu-dong.md` mục 1. Trạng thái và giới hạn của script: mục 0 của file đó.

1. Chạy dry run cho clip đầu tiên:
   ```bash
   node <skill>/scripts/chain.mjs gen <plan.json> A --dry-run
   ```
   Script nạp ảnh và prompt nhưng không bấm tạo. Script in chi phí credit nếu Flow hiện. Tab Flow để mở cho người dùng xem.
2. Báo người dùng tổng chi phí dự kiến: số clip × chi phí một clip, cộng khoảng 30% cho clip phải tạo lại. Chờ người dùng đồng ý.
3. Tạo clip:
   ```bash
   node <skill>/scripts/chain.mjs gen <plan.json> A
   ```
   Script tạo project mới, chọn cấu hình, gắn ảnh, kiểm tra lệnh tạo, chờ video xong, rồi tải bản 1080p. Chạy lệnh ở chế độ nền và đọc log tiến độ. Nếu script dừng giữa chừng mà video đã xong, tải bằng `flow.mjs --project <url>`.
4. Sau khi clip xong, mở `frames/A_last.png` và xem. Nên ghép thêm vài khung giữa clip để xem diễn biến. Khung cuối đạt khi:
   - Chủ thể ở đúng giai đoạn của ảnh end.
   - Bối cảnh và góc máy không đổi.
   - Chủ thể không méo, không mờ, không có chữ.
   - Chủ thể ở trạng thái điểm nối đã định trong bảng phân cảnh.
5. Nếu khung cuối không đạt: sửa prompt hoặc ảnh end, rồi chạy lại với `--force`. Script đổi tên bản cũ thành `clips/A_<thời điểm>.mp4`, không xoá.
6. Lặp lại với clip tiếp theo. `node <skill>/scripts/chain.mjs status <plan.json>` cho biết clip nào chưa tạo.

Không chạy liền nhiều clip mà không xem. Sau mỗi clip, Claude xem khung 4 khung/giây rồi mới tạo clip sau. Video bướm 2026-10-18: chạy liền 5 clip, lỗi ở clip C chỉ thấy sau khi D, E đã tạo, nên 20 tín dụng bị bỏ. Khi chi phí sửa khác số đã báo người dùng, hỏi lại trước khi chạy.

### 6.3. Tạo song song khi người dùng yêu cầu tốc độ

Ngày 2026-10-25, video nhện: người dùng yêu cầu tạo các clip song song. Mỗi clip dùng 2 ảnh K của GPT làm ảnh start và ảnh end, không dùng `@prev`. Bước nhảy ở điểm nối được che bằng crossfade 0,25 giây. Kết quả: 4 điểm nối đạt, với score 0,010–0,089.

Cảnh báo: chỉ chạy `chain.mjs gen` khi `clips/<id>.mp4` đã có. Nếu file chưa có, lệnh tạo clip mới trên Flow và tốn 10 tín dụng. Video gián 2026-11-05: Claude tải clip M khi các tiến trình khác còn chạy, lệnh tải báo `ENOENT`, rồi lệnh `gen` nối sau tạo thêm 1 clip M. Không tải clip khi còn tiến trình `gen` đang chạy.

Cách chạy:
1. Mở mỗi clip bằng `chain.mjs gen` ngay khi có ảnh end của clip đó. Hai lần mở cách nhau 45 giây, để tiến trình trước cài xong giao diện Flow.
2. Mỗi tiến trình mở một kết nối Playwright mới, và kết nối mới đổi thư mục tải của Chrome. Vì vậy, mọi clip trừ clip mở sau cùng báo lỗi `download.saveAs: ENOENT`. Video vẫn còn trong project Flow.
3. Khi mọi tiến trình đã dừng, tải lần lượt từng clip lỗi bằng `flow.mjs --project <url> --out clips/<id>.mp4 --download 1080p`. Link project nằm ở dòng `Project:` trong log của clip. Mỗi clip tải trong khoảng 10 giây, không tốn tín dụng.
4. Chạy lại `chain.mjs gen plan.json <id>` để trích khung đầu và khung cuối.

Script cho cách chạy này nằm ở `scripts/song-song/`. Mỗi script nhận thư mục làm việc và đọc danh sách ảnh K, clip từ `plan.json`. Claude chạy 2 script đầu ở chế độ nền cùng lúc:

| Script | Việc làm |
|---|---|
| `auto-images.sh <thư mục>` | Tạo đủ ảnh K. Khi `gpt-image.mjs` không nhận ra ảnh mới sau bước "Tải lại trang", script lưu ảnh qua CDP của tab. Cần Python có Pillow. |
| `gen-all.sh <thư mục> [--dry-run]` | Chờ file `ok/<ảnh end>`, ví dụ `ok/K02`, rồi mở clip. Claude tạo file `ok/Kxx` sau khi xem và duyệt ảnh `Kxx.png`. |
| `tai-lai.sh <thư mục>` | Chạy sau khi `gen-all.sh` in "xong". Tải các clip báo `ENOENT`, rồi trích khung. Script bỏ qua clip chưa tải được, không chạy `gen` cho clip đó. |

Video gián 2026-11-05 chạy theo cách này: 9 ảnh K và 8 clip xong trong khoảng 15 phút.

`gpt-image.mjs` lưu ảnh không qua cơ chế tải của Chrome, nên tạo ảnh K song song với Flow không làm lỗi ảnh. Nhưng kết nối Playwright của `gpt-image.mjs` vẫn đổi thư mục tải của Chrome, nên `flow.mjs` báo `download.saveAs: ENOENT` (bánh xèo 2026-11-09, 4 clip). Video vẫn còn trong project: tải bằng `flow.mjs --project <url>`. Không chạy lại `chain.mjs gen` khi chưa có `clips/<id>.mp4`, vì lệnh đó tạo clip mới và tốn thêm 10 credit (bánh xèo 2026-11-09 tốn thừa 10 credit vì lỗi này). `--project` tự thử từng profile nếu project thuộc tài khoản ở profile khác.

Thời gian: 5 clip song song xong trong khoảng 6 phút. Tạo tuần tự mất khoảng 12–13 phút.

Với chuỗi `@prev`, không tạo các clip song song. Clip sau cần khung cuối thật của clip trước. Một khung cuối lỗi làm hỏng mọi clip sau nó. Khi tạo lại một clip, mọi clip sau nó phải tạo lại; script in danh sách các clip đó.

Nếu tự động Flow lỗi, đọc `references/flow-tu-dong.md` mục 6, rồi chuyển sang cách làm ở mục 6.1.

## Bước 7 — Ghép clip

```bash
node <skill>/scripts/chain.mjs join <plan.json>
```

Script chuẩn hoá fps và kích thước theo clip đầu, crossfade ở mỗi điểm nối, tăng tốc, encode H.264. Script ghi `seams.json` chứa thời điểm các điểm nối trong video cuối.

Âm thanh: script giữ tiếng gốc Veo tạo cho từng clip. Người dùng nghe bản này ngày 2026-10-18 và chọn dùng tiếng gốc, không thêm nhạc.
- Script chuẩn hoá từng clip về −16 LUFS, crossfade tiếng cùng lúc với hình, tăng tốc bằng `atempo` để giữ cao độ, rồi tăng dần 0,4 giây đầu và giảm dần 1,4 giây cuối.
- Veo tạo tiếng riêng cho từng clip, nên âm lượng vẫn lệch 4–9 dB ở vài điểm nối. Mục 4.4 có câu âm thanh chưa kiểm chứng để giảm độ lệch này.
- Clip không có tiếng được chèn đoạn lặng cùng độ dài.
- `output.audio: "none"` bỏ tiếng.

## Bước 8 — Đo điểm nối

```bash
node <skill>/scripts/chain.mjs check <plan.json>
```

- Script tính p90 của score bên trong clip. p90 là mức score mà 90% khung thấp hơn.
- Giới hạn bước nhảy = max(0,07; 3 × p90). Camera di chuyển hoặc tăng tốc làm score bình thường cao hơn, nên giới hạn tự tăng theo.
- Điểm nối đạt khi score cao nhất trong ±0,25 giây quanh điểm nối thấp hơn giới hạn.
- Script cũng liệt kê bước nhảy bên trong clip, không nằm ở điểm nối.
- Script lưu 12 khung quanh mỗi điểm nối thành `frames/seam_<n>.png`.

Số đo tham khảo: video 1 clip camera đứng yên có p90 0,02. Bước nhảy do nối bằng ảnh tĩnh có score 0,15. Cắt cứng có score 0,22–0,38.

Score đạt chưa đủ. Claude phải mở từng ảnh `seam_<n>.png` và xem. Lý do: score tính trên cả khung, nên chủ thể nhỏ bị lệch vẫn cho score thấp. Video muỗi: 2 lăng quăng lệch 8% chiều rộng khung, score chỉ 0,043 và lệnh báo đạt. Khi xem từng khung, mỗi lăng quăng hiện 2 hình chồng lên nhau. Crossfade dài hơn không sửa được lỗi này: với crossfade 0,6 giây, hình chồng vẫn hiện trong 0,3 giây. Cách sửa là tạo lại clip sau với đúng ảnh start.

## Bước 9 — Tiêu đề và mô tả cho mạng xã hội

Sau khi video đạt, Claude viết tiêu đề và mô tả cho YouTube Shorts, TikTok, Reels. Claude lưu cả hai vào `dang-bai.md` trong thư mục video. Tiêu đề và mô tả viết bằng tiếng Anh.

Tiêu đề theo mẫu người dùng đưa ngày 2026-10-18, "Remy (monarch caterpillar) variable speed time-lapse":

```
<Tên riêng> (<tên loài>) <giai đoạn đầu> to <giai đoạn cuối> time-lapse
```

- Tên riêng ngắn, 1–2 âm tiết, mỗi video một tên. Ví dụ: Pip, Milo.
- Tên loài viết thường, đúng loài trong ảnh K. Ví dụ: common frog, monarch butterfly.
- Không ghi "variable speed" khi video tăng tốc đều. `join` tăng tốc đều theo `output.speed`.
- Không dùng dạng "X Life Cycle in N Seconds".

Mô tả tối đa 3 dòng, rồi 3 hashtag. Người dùng chê mô tả liệt kê từng giai đoạn là dài và không tạo tương tác.

```
<giai đoạn 1> → <giai đoạn 2> → … → <giai đoạn cuối> <emoji>
Which stage did you not expect? Tell me in the comments 👇
Subscribe for more life cycles.

#<loài> #lifecycle #shorts
```

Không ghi dòng "AI-generated" trong mô tả. Khi đăng, người dùng chọn "Sử dụng AI = Có", và nền tảng tự gắn nhãn AI.

Ví dụ đã dùng cho video ếch:

```
Pip (common frog) frogspawn to frog time-lapse
```
```
Frogspawn → tadpole → froglet → frog 🐸
Which stage did you not expect? Tell me in the comments 👇
Subscribe for more life cycles.

#frog #lifecycle #shorts
```

## Bước 10 — Đăng lên YouTube và Facebook

Kênh đăng tuỳ người yêu cầu, ghi trong `scripts/kenh.json`. Chủ máy đặt ngày 2026-11-08: Claude xác định profile trước khi đăng.

| `--profile` | Người yêu cầu (Telegram) | YouTube | Facebook (Thước phim) |
|---|---|---|---|
| `oliver` | nntruong96 | Life Cycle Lab `UCyVJDSNhxgezvgYuf82wi6Q` | Life Cycle Lab 61595556214345 (mặc định), Aurevella 61594230160348 (`--fb-page`) |
| `my` | Diễm My (9060990194) | Từ Hạt Đến Mâm `UCc0xdhR9R-W7ksx23jvybLQ` | Từ Hạt Đến Mâm 61596364020370 |

Script mở tab trong đúng profile Chrome của kênh. Facebook đăng thước phim và Tin qua `facebook.com/reels/create`, YouTube qua YouTube Studio.

Cảnh báo trước khi chạy:
- Chỉ đăng khi người dùng yêu cầu. Bài công khai hiện ngay cho mọi người.
- Không chạy lệnh này khi `flow.mjs` đang tải video. Kết nối Playwright mới đổi thư mục tải của Chrome, và `flow.mjs` báo lỗi `download.saveAs: ENOENT`.

Lệnh:

```bash
node <skill>/scripts/dang-bai.mjs <thư mục video> --profile <oliver|my> [--youtube] [--facebook] [--fb-page <id>] [--video file.mp4] [--dry-run]
```

- `--profile` bắt buộc.

- Không ghi `--youtube`, `--facebook` thì script đăng cả hai.
- Script lấy tiêu đề và mô tả từ `dang-bai.md`, mục "## Tiêu đề" và "## Mô tả".
- Script lấy video từ `plan.json`, trường `output.file`. Thư mục không có `plan.json` thì script dùng `<tên thư mục>.mp4`.
- YouTube: script điền tiêu đề, mô tả, chọn "Không dành cho trẻ em", "Sử dụng AI = Có", chế độ Công khai, rồi bấm Xuất bản.
- Facebook: dòng đầu của bài là tiêu đề, các dòng sau là mô tả. Script đổi "Subscribe" thành "Follow" và `#shorts` thành `#reels`. Script bật "Thêm nhãn AI", kiểm tra đối tượng Công khai, rồi bấm Đăng.
- Facebook đăng thước phim lên Tin của trang cùng lúc. Trang đặt "Chia sẻ lên tin" là "Luôn chia sẻ thước phim lên tin" từ ngày 2026-11-08. Cài đặt này áp dụng cả khi người dùng đăng tay. Nếu dòng "Chia sẻ lên tin" ghi "Tắt", script chọn lại "Luôn chia sẻ". Nếu vẫn "Tắt", script báo lỗi và không đăng.
- Sau khi đăng, script ghi link vào `dang-bai.md`, mục "## Đã đăng". Trước khi đăng, Claude đọc mục này để không đăng trùng.
- `--dry-run` điền mọi trường rồi dừng trước nút Xuất bản hoặc Đăng. Với YouTube, video thử ở lại trong Studio dạng bản nháp riêng tư.

Lỗi đã gặp:

| Hiện tượng | Cách sửa |
|---|---|
| `Facebook đang không dùng tên trang "Life Cycle Lab"` | Facebook đang ở trang cá nhân. Mở fanpage, bấm chuyển sang trang, rồi chạy lại. |
| `Không kết nối được Chrome` | Chạy `node <skill>/scripts/launch-chrome.mjs` |
| Bộ phân loại của auto mode chặn bước Xuất bản | Báo người dùng. Người dùng tự bấm, hoặc thêm quyền cho lệnh. |
| `Cannot transfer files larger than 50Mb to a browser not co-located with the server` | Playwright qua CDP chỉ gửi file nhỏ hơn 50 MiB, tức 52.428.800 byte. Video kabuto 2026-10-24 dài 28,5 giây, CRF 18, nặng 57 MB. Claude nén bản đăng bằng `ffmpeg -i <video> -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -c:a copy -movflags +faststart <tên>_dang.mp4`, còn 43 MB. Sau đó Claude chạy lại với `--video <tên>_dang.mp4`. |
| `page.waitForURL: Timeout 120000ms exceeded` sau dòng "Facebook: nhãn AI bật" | Facebook tải video lên chậm hơn 120 giây. Tab vẫn tải tiếp và vẫn đăng. Không được đóng tab và không được chạy lại, vì chạy lại sẽ đăng trùng. Video nhện nước 2026-11-01, 26 MB: Facebook đăng xong sau khoảng 3 phút. Tab Reels của fanpage không hiện thước phim mới sau 6 phút. Claude lấy link như sau: lấy `content_id` trong thông báo "Đã đăng thước phim", giải mã base64 thành `S:_I<page id>:<post id>:...`, rồi mở `https://www.facebook.com/permalink.php?story_fbid=<post id>&id=<page id>`. Facebook chuyển trang về `/reel/<id>`. Claude tự thêm dòng Facebook vào mục "Đã đăng" của `dang-bai.md`. |

## Lỗi thường gặp

| Hiện tượng | Nguyên nhân | Cách sửa |
|---|---|---|
| Bước nhảy ở điểm nối | Ảnh start là ảnh GPT thay vì khung cuối thật. Hoặc khung cuối clip trước lỗi. | Dùng `@prev`. Tạo lại clip trước. |
| Cắt cứng giữa clip | Ảnh start và ảnh end khác bối cảnh, hoặc khác quá nhiều | Thêm ảnh trung gian, tách thành 2 clip |
| Chi tiết đổi đột ngột trong clip | Ảnh end có thay đổi mà prompt không mô tả quá trình | Thêm câu mô tả quá trình, hoặc thêm ảnh trung gian |
| Camera tự zoom hoặc lia | Prompt thiếu câu camera đứng yên | Đặt "Static locked-off camera, no camera movement, no zoom." đầu prompt |
| Màu hoặc hạt nhiễu lệch giữa 2 clip | Đổi model giữa chuỗi | Một model cho cả chuỗi |
| Cành, nền lệch giữa các ảnh GPT | Người dùng tạo ảnh mới thay vì sửa ảnh trước | Tạo lại bằng "Edit this image." trong cùng cuộc chat |
| Chuyển động giật sau khi ghép | Hệ số tăng tốc lớn | Giảm `speed`, hoặc giảm `duration` từng clip |
| Flow cắt mất chủ thể ở mép | Ảnh GPT đặt chủ thể sát mép | Tạo lại ảnh với chủ thể ở giữa. Kiểm tra ảnh trong `input/`. |
| Viền đen trên và dưới ở đầu clip, rồi cắt cảnh hoặc viền thu nhỏ dần | Ảnh start tải lên là bản 2:3, không phải bản 9:16 | Dùng file trong `upload-flow/`. Clip đầu chuỗi có thể giữ và đặt `trimStart`. |
| Khung đầu có SSIM < 0,90 so với khung cuối clip trước | Người dùng chọn ảnh cũ trong thư viện Flow | Tạo lại clip trong project Flow mới, tải lên `upload-flow/<id>_start.png` |
| Vật lạ xuất hiện, ví dụ côn trùng bay | Prompt nhiều sự kiện, clip có thời gian trống | Prompt 1 sự kiện, thêm "Nothing else changes.", độ dài 6 giây |
| Chủ thể đổi hình đột ngột ở giây cuối | Veo chưa tới hình dạng của ảnh end, phải khớp trong 1 giây cuối | Rút gọn prompt về 1 sự kiện. Không tả hình dạng khác với ảnh end. |
| Lớp da, mảnh vỡ hoặc hình dạng khó hiểu giữa clip | Prompt kể các bước nhỏ: da nứt, chui ra, da chìm | Thay bằng 1 hành động, ví dụ "curls up and turns into a pupa" |
| Hiện thêm 1 chủ thể thứ 2, rồi chủ thể cũ mờ dần và biến mất | Ảnh start và ảnh end khác nhau cả vị trí lẫn hình dạng. Video bướm 2026-10-18: sâu trên lá → kén dưới lá. | Thêm ảnh trung gian để tách thành 2 clip: 1 clip đổi vị trí, 1 clip đổi hình dạng tại chỗ. Tạo ảnh trung gian từ ảnh end bằng `gpt-image.mjs --ref`, để vị trí khớp. Thêm câu "There is only one <subject>." |
| Góc máy phóng to hoặc đổi hướng giữa clip dù prompt có "Static camera" | "Static camera" chưa đủ chặt | Dùng "Static locked-off camera, no camera movement, no zoom." |
| Chủ thể hiện ra bằng chuyển cảnh mờ dần, hoặc clip cắt sang cảnh khác | Omni Flash mặc định tạo nhiều cảnh. Hoặc prompt có 2 sự kiện mà không ghi nhịp độ. | Đặt "In a single continuous shot, no scene cuts." đầu prompt. Ghi nhịp độ cho từng sự kiện. Xem bước 4. |

## Tài nguyên

| File | Dùng khi |
|---|---|
| `scripts/chain.mjs` | `status`, `images`, `upload`, `gen`, `join`, `check`, `scenes`. Chạy không có tham số để xem cách dùng. |
| `scripts/gpt-image.mjs` | Tạo 1 ảnh trên ChatGPT qua Chrome CDP. `chain.mjs images` gọi file này. `--chat <url>` sửa ảnh trong cuộc chat cũ, `--ref ảnh.png` đính kèm ảnh, `--save-last --chat <url>` lưu ảnh cuối khi script dừng giữa chừng. |
| `scripts/flow.mjs` | Tạo 1 clip trên Flow và tải bản 1080p. `chain.mjs gen` gọi file này khi chưa có clip. `--project <url>` tải video từ project đã tạo xong. |
| `scripts/anh-google.mjs` | Chụp trang Hình ảnh của Google cho từng từ khoá, để xem ảnh thật của loài. Xem mục 2.0. |
| `scripts/launch-chrome.mjs` | Mở Chrome CDP, cổng 9222, profile `~/chrome-cdp-profile` |
| `scripts/dang-bai.mjs` | Đăng video lên YouTube Shorts, Thước phim và Tin của fanpage Facebook. Xem bước 10. |
| `scripts/song-song/` | Tạo ảnh K và clip song song: `auto-images.sh`, `gen-all.sh`, `tai-lai.sh`. Xem mục 6.3. |
| `references/phan-tich-video-mau.md` | Người dùng gửi video mẫu |
| `references/flow-tu-dong.md` | Chuẩn bị tự động Flow, xử lý lỗi Flow, làm tay khi tự động lỗi |
| `references/vi-du.md` | Cần mẫu bảng phân cảnh, prompt, `plan.json` đầy đủ |
