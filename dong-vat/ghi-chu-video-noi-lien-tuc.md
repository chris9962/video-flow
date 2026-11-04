# Ghi chú: video AI nối liên tục bằng GPT và Google Flow

Ngày tổng hợp: 2026-10-16.

Nguồn:
- Phân tích 2 video mẫu trong thư mục này.
- Skill `scroll-world` ở `~/.agents/skills/scroll-world/`.

---

## 1. Video mẫu

| File | Độ dài | Nội dung | Cấu trúc |
|---|---|---|---|
| `Screen Recording 2026-10-16 at 10.19.10.mov` | 11,08 giây | Bướm đêm Luna: sâu → kén → bướm | 1 cảnh liền mạch. Camera đứng yên. Không có điểm cắt. |
| `Screen Recording 2026-10-16 at 10.19.59.mov` | 18,2 giây | Bướm phượng hổ vằn: trứng → sâu → nhộng → bướm | 5 clip, 4 điểm cắt cứng. Clip 2 có 2 bước nhảy. |

Hai file là bản quay màn hình của trình phát video:
- Khung 1554×786, 60 fps.
- Âm thanh ở mức -91 dB, tức là không có tiếng.
- Video gốc quay dọc, nằm giữa khung. Hai bên trình phát lấp nền mờ.

### 1.1. Video 1: diễn biến

| Giây | Nội dung |
|---|---|
| 0–2 | Sâu xanh sọc vàng treo dưới cành phủ địa y. Thân sâu cong hình chữ J. |
| 2–3 | Sâu nhả tơ trắng quấn quanh thân. |
| 3–5 | Tơ bọc kín sâu thành kén trắng. |
| 5–7 | Kén đổi màu: trắng → be → nâu. |
| 7–9 | Đáy kén nứt. Bướm chui ra, cánh còn gập. |
| 9–11 | Bướm treo dưới vỏ kén và xoè cánh. |

Số đo: score cao nhất bên trong video 1 là 0,065, ở giây 9,1–9,3, lúc bướm xoè cánh.

### 1.2. Video 2: điểm cắt

| Clip | Thời gian | Độ dài | Nội dung | Score ở điểm cắt |
|---|---|---|---|---|
| 1 | 0–2,48 giây | 2,5 giây | Bướm đẻ trứng rồi bay đi | — |
| 2 | 2,48–9,78 giây | 7,3 giây | Trứng → sâu nở → lột xác → sâu lớn | 0,22 |
| 3 | 9,78–11,82 giây | 2,0 giây | Sâu bò trên cành | 0,38 |
| 4 | 11,82–16,42 giây | 4,6 giây | Sâu treo → nhộng → bướm chui ra | 0,33 |
| 5 | 16,42–18,2 giây | 1,8 giây | Bướm đậu trên hoa tím | 0,29 |

Clip 2 có 2 bước nhảy ở giây 5,38 và 5,48, score 0,15. Khung hình giữ nguyên, nhưng lá bị khuyết đột ngột.

### 1.3. Lỗi sinh học trong 2 video

Nếu làm video giáo dục, người làm phải kiểm tra các lỗi này:

| Video | Lỗi | Thực tế |
|---|---|---|
| 1 | Sâu Luna treo hình chữ J, kén treo trơn trên cành | Sâu Luna làm kén trong lá khô dưới đất |
| 2 | Bướm phượng đẻ trứng thành cụm | Bướm phượng đẻ từng trứng riêng lẻ |
| 2 | Sâu sọc đen chấm cam | Đây là hoa văn của sâu bướm phượng đuôi nheo. Sâu bướm phượng hổ vằn màu xanh trơn, có 2 đốm mắt giả. |
| 2 | Nhộng treo ngược | Nhộng bướm phượng dựng đứng, có 1 sợi tơ quấn ngang thân |

---

## 2. Đo điểm cắt bằng scene score

Scene score của ffmpeg đo mức thay đổi giữa 2 khung hình liền kề. Giá trị từ 0 tới 1.

```bash
ffmpeg -v error -i input.mp4 \
  -vf "select='gt(scene,0.07)',metadata=print:file=-" -an -f null - 2>&1 \
  | grep -oE "pts_time:[0-9.]+|scene_score=[0-9.]+" | paste - -
```

Với bản quay màn hình cùng bố cục như 2 video mẫu, bạn thêm `crop=476:770:546:12,` vào đầu chuỗi `-vf`. Lệnh crop bỏ phần nền mờ hai bên.

| Score | Ý nghĩa |
|---|---|
| < 0,07 | Chuyển động bình thường bên trong clip |
| 0,15 | Bước nhảy ở điểm nối, mắt thấy được |
| ≥ 0,2 | Cắt cứng sang cảnh khác |

Ngưỡng 0,07 lấy từ bản quay màn hình. Bạn nên chỉnh lại ngưỡng sau lần đo đầu tiên trên video gốc.

---

## 3. Kiến trúc chuỗi clip

Google Flow có chế độ **Frames** (Khung hình). Chế độ này nhận ảnh start và ảnh end.

**K** là viết tắt của keyframe, nghĩa là ảnh khung. K1, K2, K3… là ảnh tĩnh do GPT tạo, mỗi ảnh là một giai đoạn của chủ thể. File ảnh đặt tên `K01.png`, `K02.png`…

| Clip | Ảnh start | Ảnh end |
|---|---|---|
| 1 | K1 | K2 |
| 2 | Khung cuối thật của clip 1 | K3 |
| n | Khung cuối thật của clip n-1 | Kn+1 |

- K1, K2, K3… là ảnh tĩnh do GPT tạo. Mỗi ảnh là một giai đoạn.
- Chuỗi n clip cần n+1 ảnh tĩnh.
- Ảnh start của clip sau **phải** là khung cuối thật của clip trước, không phải ảnh tĩnh gốc.

Lý do: Flow không tạo khung cuối giống 100% ảnh end. Nếu clip sau bắt đầu từ ảnh tĩnh gốc, phần chênh lệch hiện ra thành bước nhảy. Video 2 có lỗi này ở giây 5,38.

Lệnh trích khung cuối thật:

```bash
ffmpeg -sseof -0.2 -i clip1.mp4 -update 1 -q:v 2 last1.png
```

---

## 4. Chọn 1 clip hay nhiều clip

Độ dài tối đa của một clip quyết định số clip. Bạn phải viết kịch bản trước, rồi mới chọn số clip.

Độ dài clip trong Flow: `generate-flow.mjs` liệt kê 4, 6, 8 và 10 giây. Chưa kiểm tra model nào hỗ trợ 10 giây.

### 4.1. Các bước chọn

1. Bạn liệt kê các thay đổi chính của chủ thể. Ví dụ: sâu → kén, kén → bướm.
2. Bạn gán số giây hiển thị cho từng thay đổi.
3. Bạn cộng tổng số giây.
4. Bạn chọn theo bảng dưới.

| Điều kiện | Chọn |
|---|---|
| Tổng ≤ độ dài clip tối đa, và có ≤ 2 thay đổi chính | 1 clip |
| Tổng > độ dài clip tối đa | Nhiều clip |
| Có > 2 thay đổi chính | Nhiều clip, mỗi clip 1–2 thay đổi |
| Đổi bối cảnh | Clip mới. Muốn liền mạch thì thêm clip nối có camera di chuyển. |

### 4.2. Hệ số tăng tốc

Hệ số tăng tốc = tổng số giây render ÷ số giây của video cuối.

Ví dụ video 1: 2 clip × 8 giây = 16 giây render. Video cuối dài 11 giây. Hệ số là 1,45.

Đề xuất, chưa kiểm chứng: bạn nên giữ hệ số trong khoảng 1–2. Hệ số lớn hơn làm chuyển động giật.

### 4.3. Ví dụ áp dụng

| Video | Thay đổi chính | Bối cảnh | Kết quả |
|---|---|---|---|
| 1 | 2: sâu → kén, kén → bướm | 1 | 2 clip × 8 giây, điểm nối ở lúc kén nâu treo yên |
| 2 | 5: đẻ trứng, nở, lớn, hoá nhộng, ra bướm | 3 | Tối thiểu 5 clip. Thêm clip nối nếu không muốn cắt cứng. |

---

## 5. Kịch bản trước prompt

Người viết prompt cho Flow phải hình dung từng giây của clip trước khi viết. Flow chỉ tạo đúng nội dung khi prompt mô tả đúng thứ tự sự kiện.

### 5.1. Bảng phân cảnh

Bạn điền bảng này cho mỗi clip trước khi viết prompt:

| Mục | Nội dung cần ghi |
|---|---|
| Clip | Số thứ tự, độ dài render |
| Khung giây 0 | Người xem thấy gì. Đây là ảnh start. |
| Diễn biến | Các sự kiện theo thứ tự, mỗi sự kiện chiếm khoảng bao nhiêu giây |
| Khung giây cuối | Người xem thấy gì. Đây là ảnh end. |
| Thứ chuyển động | Chủ thể, bộ phận nào của chủ thể |
| Thứ đứng yên | Cành, nền, ánh sáng, camera |
| Camera | Đứng yên, hoặc kiểu chuyển động cụ thể |
| Trạng thái ở điểm nối | Chủ thể phải đứng yên hoặc chuyển động đều |

### 5.2. Danh sách kiểm tra trước khi gửi prompt

- Khung giây 0 và khung giây cuối khác nhau đúng 1–2 thay đổi chính.
- Bối cảnh của ảnh start và ảnh end giống nhau. Nếu khác, Flow thường cắt cứng giữa clip.
- Prompt kể sự kiện theo đúng thứ tự thời gian.
- Prompt ghi rõ thứ đứng yên.
- Prompt có câu mô tả trạng thái ở giây cuối.
- Clip sau có câu mô tả trạng thái ở giây đầu, giống hệt trạng thái ở giây cuối của clip trước.

### 5.3. Cấu trúc prompt cho Flow

```
[Câu camera] Static locked-off camera, no camera movement, no zoom.
[Diễn biến] Time-lapse: <sự kiện 1>. <sự kiện 2>. <sự kiện 3>.
[Thứ đứng yên] The <branch, background...> do not move.
[Giây cuối] In the final second, <chủ thể> <trạng thái đứng yên>.
```

Prompt viết bằng tiếng Anh. Mỗi câu một sự kiện.

---

## 6. Quy tắc nối clip

Các quy tắc lấy từ skill `scroll-world`, áp dụng cho video động vật.

1. **Điểm nối dùng khung hình thật.** Ảnh start của clip sau là khung cuối trích từ clip trước.
2. **Tạo chuỗi tuần tự.** Bạn phải xem khung cuối của mỗi clip trước khi tạo clip tiếp. Một khung cuối lỗi làm hỏng mọi clip sau nó.
3. **Chuyển động ở hai phía điểm nối giống nhau.** Với camera đứng yên, bạn đặt điểm nối vào lúc chủ thể đứng yên. Bên trong clip, chuyển động tự do.
4. **Crossfade ngắn chỉ che lệch nhỏ.** Bạn dùng `xfade` khoảng 0,1 giây. Crossfade không che được bước nhảy lớn.
5. **Một model cho cả chuỗi.** Đổi model giữa chuỗi làm lệch màu, hạt nhiễu và kiểu chuyển động.
6. **Một nguồn cho mọi ảnh tĩnh.** Bạn tạo mọi ảnh trong cùng một công cụ GPT.
7. **Chỉ dùng chế độ nhận ảnh start và ảnh end.** Trong Flow, bạn dùng tab Frames.
8. **Đổi bối cảnh cần clip nối có camera di chuyển.** Ví dụ: camera đi theo con sâu bò từ lá sang cành.
9. **Chạy bản nháp bằng model rẻ trước.** Bạn dùng Veo 3.1 Lite hoặc Fast cho bản nháp, Veo 3.1 Quality cho bản cuối. Khi render lại, bạn phải trích lại khung cuối cho từng điểm nối.

Điểm khác với `scroll-world`: skill đó di chuyển camera và không dùng ảnh end ở kiến trúc A. Video động vật kiểu video 1 có camera đứng yên và chủ thể biến đổi. Vì vậy, video động vật phải dùng ảnh end để điều khiển từng giai đoạn.

---

## 7. Quy trình mẫu: dựng lại video 1

### 7.1. Trạng thái ngày 2026-10-16

| Ảnh | File | Trạng thái |
|---|---|---|
| K1 | `Sâu xanh treo mình dưới cành địa y.png`, 1024×1536 | Đã có |
| K2 | — | Chưa làm |
| K3 | — | Chưa làm |

Flow cắt ảnh 2:3 về 9:16. Với K1, Flow bỏ khoảng 80 px mỗi bên. Mép phải của lá khô có thể bị cắt.

### 7.2. Ảnh tĩnh trong GPT

Cảnh báo: bạn phải tạo K2 và K3 bằng cách sửa ảnh trước trong cùng cuộc chat. Nếu tạo ảnh mới, cành và nền sẽ lệch.

**K1** (prompt mới):
```
Vertical 2:3 macro nature photo. A thick tree branch covered in pale green lichen runs diagonally from the upper right to the middle left. A plump bright green luna moth caterpillar with thin yellow stripes hangs from the underside of the branch in a J shape. One dry brown leaf hangs next to the caterpillar. Background: dark out-of-focus forest with vertical tree trunks. Soft overcast light, muted green tones, shallow depth of field. Keep the caterpillar in the center with empty space above and below. No text, no watermark.
```

**K2** (sửa K1):
```
Edit this image. Keep the branch, lichen, background, lighting and camera angle exactly the same. Replace the caterpillar with a closed oval light-brown silk cocoon hanging from the same spot under the branch. Remove the dry leaf.
```

**K3** (sửa K2):
```
Edit this image. Keep the branch, lichen, background, lighting, camera angle and the cocoon position exactly the same. The cocoon is now empty and open at the bottom. A luna moth hangs just below the cocoon, facing the camera, wings fully spread: pale green wings with pink-purple front edges, small eyespots, and two long curved tails. The whole moth fits inside the frame.
```

### 7.3. Clip trong Flow

Cài đặt: tab Frames, khổ 9:16, 8 giây, một model Veo cho cả 2 clip.

**Clip A**: start K1, end K2.
```
Static locked-off camera, no camera movement, no zoom. Time-lapse: the green caterpillar spins white silk around its body. The silk thickens into a white cocoon. The cocoon slowly changes color from white to beige to light brown. The branch, lichen and background do not move. In the final second, the cocoon hangs completely still.
```

**Clip B**: start `lastA.png`, end K3.
```
Static locked-off camera, no camera movement, no zoom. The cocoon hangs completely still at first. Time-lapse: the bottom of the brown cocoon splits open. A luna moth crawls out with crumpled wings and hangs below the cocoon. The moth slowly unfolds and spreads its pale green wings with long tails. The branch, lichen and background do not move.
```

### 7.4. Lệnh

```bash
# Trích khung cuối thật của clip A
ffmpeg -sseof -0.2 -i clipA.mp4 -update 1 -q:v 2 lastA.png

# Ghép: crossfade 0,1 giây, tăng tốc 1,45 lần, bỏ âm thanh.
# offset = độ dài clip A - 0,1
ffmpeg -i clipA.mp4 -i clipB.mp4 -filter_complex \
  "[0:v][1:v]xfade=transition=fade:duration=0.1:offset=7.9,setpts=PTS/1.45[v]" \
  -map "[v]" -an luna.mp4

# Đo điểm nối. Không in dòng nào nghĩa là không có bước nhảy trên 0,07.
ffmpeg -i luna.mp4 -vf "select='gt(scene,0.07)',metadata=print:file=-" -an -f null - 2>&1 \
  | grep -oE "pts_time:[0-9.]+|scene_score=[0-9.]+"
```

---

## 8. Tài nguyên trong máy

| Đường dẫn | Nội dung |
|---|---|
| `~/.agents/skills/scroll-world/SKILL.md` | Skill dựng website cuộn trang từ chuỗi clip nối liền |
| `~/.agents/skills/scroll-world/references/generate-flow.mjs` | Script Playwright điều khiển Google Flow. Nhận `--image`, `--end-image`, `--model`, `--duration`, `--aspect`. |
| `~/.agents/skills/scroll-world/references/launch-chrome.mjs` | Mở Chrome với cổng CDP 9222, profile `~/chrome-cdp-profile` |
| `~/.agents/skills/scroll-world/references/pipeline.md` | Lệnh bash cho cả chuỗi: tạo ảnh, tạo clip, trích khung, encode |
| `~/video-flow` | App workflow kéo-thả. Block "Video (Flow)" nhận ảnh Start và End. |
| `~/mino-house` | Website dựng bằng `scroll-world`, 5 clip 8 giây, 1280×720 |
| `~/luxury-home` | Website dựng bằng `scroll-world`, 3 clip nối raw 8 giây, 720×1280 |

Model trong `generate-flow.mjs`: `omni-flash`, `veo-3.1-lite`, `veo-3.1-fast`, `veo-3.1-quality`.

---

## 9. Skill `flow-chain-video`

Ngày 2026-10-16, kiến thức trong file này được đóng gói thành skill `flow-chain-video` ở `~/.claude/skills/flow-chain-video/`.

| Lệnh | Việc |
|---|---|
| `node scripts/chain.mjs scenes <video> [--crop w:h:x:y]` | Tìm điểm cắt trong video mẫu |
| `node scripts/chain.mjs status <plan.json>` | Xem clip nào đã tạo |
| `node scripts/chain.mjs gen <plan.json> <clipId> [--dry-run] [--force]` | Tạo 1 clip trên Flow, trích khung đầu và khung cuối |
| `node scripts/chain.mjs join <plan.json>` | Ghép clip, crossfade, tăng tốc, bỏ âm thanh |
| `node scripts/chain.mjs check <plan.json>` | Đo scene score ở điểm nối |

Lệnh `check` dùng giới hạn max(0,07; 3 × p90) thay cho ngưỡng cố định 0,07. Lý do: clip có camera di chuyển, tăng tốc 1,45×, có p90 = 0,082. Ngưỡng cố định báo nhầm chuyển động camera là bước nhảy.

---

## 10. Chưa kiểm chứng

- Model nào trong Flow hỗ trợ clip 10 giây.
- Ngưỡng scene score 0,07 trên video gốc. Ngưỡng hiện tại đo trên bản quay màn hình.
- Hệ số tăng tốc tối đa trước khi chuyển động bị giật.
- Flow có tự thêm âm thanh với mọi model hay không. Lệnh ghép dùng `-an` để bỏ âm thanh.
