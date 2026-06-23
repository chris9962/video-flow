---
name: fashion-tryon-video
description: >
  Workflow fashion try-on: nhận 2 ảnh (người mẫu + đồ), tự động tách đồ ra nền
  trắng, ghép đồ vào người, rồi tạo 5 video chuyển động (spin, breathe, walk,
  selfie x2) bằng Google Flow omni-flash. Dùng browser-pilot tại
  ~/hermes_workspace/browser-pilot/.
triggers:
  - fashion video
  - try-on
  - ghép đồ tạo video
  - workflow thời trang
  - tạo video người mẫu
---

# Fashion Try-On Video Workflow

## Tổng quan

Input: 2 ảnh
- **person_image**: ảnh người mẫu gốc (webp/png/jpg)
- **clothing_image**: ảnh món đồ muốn mặc thử (png/jpg)

Output: 5 video Google Flow omni-flash
- video_spin.mp4 — xoay 360 độ
- video_breathe.mp4 — đứng thở nhẹ
- video_walk.mp4 — bước về phía camera
- video_selfie.mp4 — quay selfie
- video_selfie2.mp4 — selfie đổi dáng

## Luồng xử lý

```
[person_image] ──→ Gemini (tách đồ) ──→ [extracted_clothing.png]
                                                  │
[clothing_image] ─────────────────────────────────┤
                                                  ▼
                              Gemini (try-on) ──→ [person_with_outfit.png]
                                                  │
                    ┌─────────────────────────────┼──────────────────────┐
                    ▼           ▼                 ▼            ▼         ▼
               Flow(spin)  Flow(breathe)    Flow(walk)   Flow(selfie) Flow(selfie2)
```

## Các bước thực thi

### Bước 1 — Tách đồ ra nền trắng (Gemini)

Tool: `geminiGenerateImage(PROMPT_EXTRACT, [person_image], outFile)`

**PROMPT_EXTRACT** (cố định):
```
Analyze the attached image in extreme detail and extract ALL visible clothing items and accessories worn or present in the image.

For each detected item:
- Isolate it completely from the original subject and background.
- Recreate it as a standalone product image.
- Preserve exact color, fabric texture, stitching, seams, folds, logos (if any), material thickness, proportions, and structural details.
- Maintain accurate scale and garment construction.
- Do not redesign or reinterpret the item.

Each clothing item and accessory must be:
- Fully visible
- Properly shaped as it would appear naturally laid flat or positioned cleanly
- Free of distortion
- Photorealistic
- High resolution
- Studio-quality product photography

BACKGROUND:
Pure solid white background (#FFFFFF).
No shadows unless soft natural grounding shadow directly beneath the item.
No reflections.
No gradients.
No environmental elements.

LIGHTING:
Soft studio lighting.
Even exposure.
No dramatic shadows.
Accurate color reproduction.
True-to-life material rendering.

STRICT RULES:
- Do NOT include the model or body parts.
- Do NOT merge multiple items into one object.
- Separate each item individually.
- Maintain 99% visual accuracy compared to the original image.
- Do NOT stylize.
- No CGI look.
- No artistic reinterpretation.
- No texture smoothing.

NEGATIVE PROMPT:
blurry, distorted shape, warped fabric, incorrect color, missing details, artificial shine, over-smoothing, CGI, illustration, cartoon, rendering artifacts, merged objects, incomplete garment, cut-off edges.
```

### Bước 2 — Ghép đồ vào người (Gemini)

Tool: `geminiGenerateImage(PROMPT_TRYON, [extracted_clothing, clothing_image], outFile)`

**PROMPT_TRYON** (cố định):
```
Image 1 is a person. Image 2 is a clothing item.
Dress the person in Image 1 with the exact garment from Image 2.
Preserve the garment's pattern, color, texture and shape faithfully.
Keep the person's face, hair, body, pose, lighting and background unchanged.
Photorealistic, natural fabric folds, correct proportions.
```

### Bước 3 — Tạo 5 video (Google Flow omni-flash, song song)

Tool: `flowGenerateVideo({ prompt, imagePath, model:'omni-flash', durationSeconds:4, aspectRatio:'9:16', outFile })`

**PROMPT_SPIN** (cố định):
```
Static locked-off camera, framing unchanged. The woman performs a graceful, slow full 360-degree spin in place — rotating smoothly to reveal the outfit from every angle: front, left side, back, right side, then returning to face the camera. One complete rotation, fluid and elegant, no stepping forward or backward.
```

**PROMPT_BREATHE** (cố định):
```
Static locked-off camera, framing unchanged. The woman stands poised and confident, her outfit fully visible. She takes a slow, natural breath — the fabric of her clothing shifts and drapes elegantly with the movement. She gently smooths the outfit with one hand in a calm, graceful gesture, then lowers her arm back to her side. The clothing's texture, cut, and silhouette are showcased clearly throughout. Soft even studio lighting, neutral background.
```

**PROMPT_WALK** (cố định):
```
Static locked-off camera, framing unchanged. The woman walks purposefully toward the camera at a brisk but still graceful pace — starting from a full-body wide shot, she strides forward with confidence and comes very close to the camera, ending in a tight mid-body close-up where her torso and outfit fill the frame. She stops right in front of the camera without stepping back. The movement is fluid and direct, the outfit clearly visible and flowing with every step.
```

**PROMPT_SELFIE** (cố định):
```
Static locked-off camera, framing unchanged; she keeps the phone up covering her face the whole time. From the exact pose in the photo, her free hand sweeps up to push her long hair back behind her shoulder, then gives a small relaxed wave near the phone with a light bounce to a slow rhythm, and finally lowers the hand back down to return to the original neutral pose by the end. Hair resettles; the dress and sheer shirt shimmer with the small movements. Keep the outfit, gray wall, white sneakers and soft lighting identical. Photorealistic, smooth, 8 seconds, ends exactly at the starting pose.
```

**PROMPT_SELFIE2** (cố định):
```
A fictional young woman, holding a phone up near her face with her right hand as if filming a mirror selfie. She keeps the phone in the same right hand the entire time and never switches hands; the phone stays steadily near her face throughout. She shifts her weight from one leg to the other, slowly turning her hips side to side to show her outfit. With her free left hand she lightly touches her waist, then rests it on her hip. She lifts her free left hand toward her shoulder, tilts her head slightly, and turns her body gently from side to side. She lowers her left hand and returns to standing upright. Slow, graceful, natural movements. Soft even indoor lighting, vertical portrait framing, static camera, cinematic and realistic.
```

## Files

- `references/fashion-tryon-workflow.json` — workflow JSON (config model/duration/aspect cho từng node)
- `references/workflow-schema.md` — schema định nghĩa node types + edges
- `references/prompt-extract-asymmetric-skirt.md` — prompt template tách đồ khi váy có gấu xiên (asymmetric/high-low hem)
- `scripts/run-workflow.ts` — engine đọc JSON và execute (video chạy song song)
- `scripts/run-fashion.ts` — script cũ (hardcode, dự phòng)

## Cách chạy

```bash
cd ~/hermes_workspace/browser-pilot

# Chạy bằng workflow JSON (khuyên dùng — config linh hoạt)
npx tsx ~/.hermes/skills/creative/fashion-tryon-video/scripts/run-workflow.ts \
  ~/.hermes/skills/creative/fashion-tryon-video/references/fashion-tryon-workflow.json \
  /path/to/person.png \
  /path/to/clothing.png

# Chỉnh config: sửa fashion-tryon-workflow.json
# Đổi model: "omni-flash" → "veo-3.1-fast"
# Đổi duration: 4 → 6
# Đổi aspect: "9:16" → "16:9"
# Thêm/bớt video node tùy ý
```

## 🚦 Quality Gate — CHẶN trước phase video để khỏi đốt credit Flow (QUAN TRỌNG)

Vấn đề: video Flow là phần ĐẮT NHẤT. Nếu ảnh try-on (Gemini bước 2) ra không khớp
đồ gốc mà engine vẫn chạy tiếp 5 video → tốn credit oan. Engine có "gate" chạy
1 lần ngay trước video đầu tiên, 3 chế độ:

- **MẶC ĐỊNH (HALT) — dùng khi workflow chạy QUA agent (luôn luôn, theo ý user):**
  engine làm xong phần ẢNH rồi DỪNG, in path ảnh đồ gốc + img_tryon_1 + img_tryon_2.
  AGENT dùng `vision_analyze`/`mcp__vision_analyze` soi trực tiếp các ảnh đó (chính xác
  hơn Gemini, suy luận trên pixel), so với ảnh đồ gốc → quyết:
    - Ảnh OK → resume video: `--from video_spin --force-video`
    - Ảnh xấu → sửa prompt/ảnh, gen lại: `--node img_tryon_1`
  KHÔNG gọi browser ở bước gate, KHÔNG tốn credit. Đây là đường mặc định.
- **`--gate` (MANUAL):** dừng hỏi stdin Enter/q trong terminal (người ngồi tại máy duyệt).
- **`--auto-qc` (AUTO):** Gemini tự chấm điểm khớp đồ 0-100, dưới `--qc-threshold`
  (mặc định 72) thì dừng. CHỈ dùng khi chạy nền không người coi — chậm hơn (mở thêm
  tab Gemini, dễ crash) và Gemini hay chấm dễ tính. Bình thường KHÔNG cần.
- **`--force-video`:** bỏ qua gate, ép tạo video (resume sau khi ảnh đã ưng).

### Tự động xoay account khi hết credit (multi-account Flow)

User có 4 account Google Flow, CÙNG đăng nhập trong 1 Chrome (đa tài khoản Google).
`flowGenerateVideo` giờ là WRAPPER tự xoay: thử lần lượt `authuser=0,1,2,3`, account
nào throw "HẾT CREDIT" thì nhảy sang cái kế; hết cả 4 mới throw "TẤT CẢ account hết credit".
- Đổi account = đổi URL: `labs.google/fx/tools/flow?authuser=N` (N = thứ tự account
  trong Chrome, 0 = account chính). Hàm tạo-1-video thật là `flowGenerateVideoOnce({...,authuser})`.
- Cấu hình danh sách: env `FLOW_AUTHUSERS=0,1,2,3` hoặc truyền `req.authusers=[...]`.
  Mặc định `[0,1,2,3]`.
- CHỈ xoay khi gặp lỗi credit (regex: HẾT CREDIT|out of credit|nâng cấp để tạo|quota exceeded).
  Lỗi khác (policy, mạng, UI) → throw NGAY, không xoay phí (đã test: case policy chỉ gọi 1 lần).
- Engine `run-workflow.ts` gọi `flowGenerateVideo` nên tự động hưởng — KHÔNG cần sửa engine.
- Cấu hình danh sách email: env `FLOW_ACCOUNTS=email1@gmail.com,email2@gmail.com,...`
  hoặc truyền `req.accounts=[...]`. Nếu không set → dùng account đang login, không switch.
- Avatar selector (Flow UI June 2026): `img[alt="User profile image"]` (EN mới).
  Cũ: "Hình ảnh hồ sơ người dùng" (VI) / "User profile photo". switchFlowAccount handle cả 3.
- Đã test thật: switch 2 account liên tiếp OK (mỗi lần ~40s).
- `?authuser=N` KHÔNG hoạt động với Flow — bỏ qua, dùng switchFlowAccount.

### Gửi ảnh cho user review (kênh chat: Telegram/Discord/Slack...)

Khi gate HALT dừng, gửi ảnh try-on TRỰC TIẾP cho user xem trước khi tạo video:
- Trên kênh chat: dùng tag `MEDIA:<đường_dẫn_tuyệt_đối>` cho TỪNG ảnh (kênh tự render
  thành hình). Trên CLI: không có kênh đính kèm → chỉ in path text.
- MỖI ảnh PHẢI ghi rõ node-id + TÊN FILE để user nhắc lại được khi muốn sửa/gen lại
  đúng ảnh đó. Map node → file (theo workflow JSON `output`):
    - `img_clothing`  → `step1_clothing_white_bg.png`  (đồ tách nền trắng)
    - `img_tryon_1`   → `step2_tryon_person1.png`       (người 1 mặc đồ)
    - `img_tryon_2`   → `step2_tryon_person2.png`       (người 2 mặc đồ)
  Format gửi gợi ý:
    ```
    MEDIA:/.../images/step2_tryon_person1.png
    img_tryon_1 (step2_tryon_person1.png) — người 1 mặc đồ
    ```
- User nhắc tên file/node → biết gen lại ảnh nào: `--node img_tryon_1`
  (engine ghi đè đúng file `output` của node đó trong cùng outDir, state.json cập nhật).
- Ảnh tất cả OK → tạo video: `--from video_spin --force-video`.

Luồng tiết kiệm credit khi gate FAIL:
```bash
# 1) Chạy auto — gate tự QC, fail thì dừng (chỉ tốn credit ảnh Gemini, KHÔNG tốn Flow)
npx tsx run-workflow.ts <wf> <person> <clothing>
# 2) Sửa ảnh try-on: đổi prompt_tryon / đổi ảnh người, gen lại đúng node ảnh
npx tsx run-workflow.ts <wf> <person> <clothing> --node img_tryon_1
# 3) Ảnh OK rồi → resume thẳng vào video, bỏ qua gate
npx tsx run-workflow.ts <wf> <person> <clothing> --from video_spin --force-video
```

### Pitfalls đã fix (engine run-workflow.ts)
- **scripts/package.json `{"type":"module"}`** BẮT BUỘC — nếu thiếu, tsx coi là CJS →
  top-level await fail. Đã thêm sẵn.
- **Import pilot:** engine dùng dynamic `import(PILOT_PATH)` trỏ tuyệt đối tới
  `~/hermes_workspace/browser-pilot/pilot.ts` (override bằng env `PILOT_PATH`). KHÔNG
  dùng `../../pilot.js` (resolve sai khi chạy từ path skill).
- **Bug arg parse (đã fix):** `args.indexOf('--node')` trả -1 khi không có cờ → +1 = 0 →
  vô tình lấy `args[0]` (= path workflow) làm nodeArg/fromArg → skip sạch mọi node ở
  AUTO mode. Phải guard `idx >= 0` trước khi `+1`.
- **outDirArg** phải loại trừ giá trị của `--qc-threshold` để số ngưỡng không bị nhầm
  là thư mục output.
- Engine luôn chạy từ trong `~/hermes_workspace/browser-pilot/` (cwd) để Playwright/CDP
  và node_modules resolve đúng.

## Flow đúng — đọc kỹ trước khi sửa JSON

```
[src_shop] ảnh shop/mannequin trưng bày đồ
    + prompt_extract
    → Gemini → [img_clothing] ĐỒ NỀN TRẮNG

[img_clothing] + [src_person_1] người mẫu 1 + prompt_tryon
    → Gemini → [img_tryon_1] người 1 mặc đồ

[img_clothing] + [src_person_2] người mẫu 2 + prompt_tryon
    → Gemini → [img_tryon_2] người 2 mặc đồ

[img_tryon_1] → video_spin    (start=người1)
[img_tryon_1] → video_breathe (start=người1)
[img_tryon_1] → video_walk    (start=người1, END=img_tryon_2) ← chuyển cảnh người1→người2
[img_tryon_1] → video_selfie  (start=người1)
[img_tryon_2] → video_selfie2 (start=người2)
```

**Pitfall quan trọng:** `video_walk` dùng người 1 làm `start` và người 2 làm `end`
→ đây là video CHUYỂN CẢNH từ người 1 sang người 2, KHÔNG phải 2 video riêng.

## Assets tham chiếu (trong skill, chỉ dùng làm mẫu)

- `assets/shop.webp` — ảnh shop mannequin đồ hồng (nguồn tách đồ mẫu)
- `assets/shop_new.jpg` — ảnh sản phẩm bộ đồ ngủ gấu (test session June 2026)
- `assets/person_1.png` — người mẫu 1 (cardigan len móc kem + jeans, selfie gương)
- `assets/person_2.png` — người mẫu 2 (áo hai dây trắng + quần short đen)

**Lưu ý:** Ảnh sản phẩm mới từ user → tải về `~/hermes_workspace/tmp/`, KHÔNG lưu vào skill.
Người mẫu mới → update path trong `references/fashion-tryon-workflow.json`.
Assets trong skill chỉ là mẫu tham chiếu — không dùng lại khi user cung cấp ảnh mới.

## Workflow Data Convention (QUAN TRỌNG)

Skills chỉ chứa ĐỊNH NGHĨA — KHÔNG chứa data/assets. Mỗi lần chạy tạo folder riêng:

```
~/hermes_workspace/
  tmp/                      ← ảnh input user gửi URL → tải về đây
  workflows/<run-id>/
    images/                 ← ảnh trung gian (tách đồ, try-on)
    videos/                 ← video output
    state.json              ← resume state
```

Lý do: nhiều agent dùng cùng skill không conflict data.

## Flow đúng

```
[src_shop] ảnh shop/mannequin
  + [prompt_extract] → ChatGPT generateImage → [img_clothing] ảnh đồ nền trắng

[img_clothing] + [src_person_1] + [prompt_tryon]
  → Gemini generateImage → [img_tryon_1]

[img_clothing] + [src_person_2] + [prompt_tryon]
  → Gemini generateImage → [img_tryon_2]

[img_tryon_1] → Flow → spin(4s), breathe(4s), selfie(4s)
[img_tryon_1 start] + [img_tryon_2 end] → Flow → walk(6s)  ← chuyển cảnh người 1→2
[img_tryon_2] → Flow → selfie2(8s)
```

KEY: video walk = 1 video chuyển cảnh start→end, KHÔNG phải 2 video riêng.

## Prompt tách đồ — mô tả chi tiết kiểu dáng (QUAN TRỌNG)

Khi tách đồ (bước 1 ChatGPT), PHẢI liệt kê từng món đồ với chi tiết kiểu dáng cụ thể — đặc biệt:
- **Gấu váy xiên/xéo (asymmetric hem)**: nói rõ "ASYMMETRIC HEM: the hemline is diagonal/slanted — one side is noticeably longer/lower than the other (high-low hem / handkerchief-style diagonal cut). The hem is NOT straight and NOT even."
- **Váy xòe**: nói rõ "flared/circle skirt, voluminous, billowy"
- **Giày**: liệt kê đầy đủ kiểu (Mary Jane flat, perforated toe, ankle strap)
- **Texture vải**: voan/chiffon, ren, v.v.

Nếu chỉ ghi chung chung "extract all clothing", AI sẽ recreate theo mặc định của nó (gấu thẳng, hình dạng generic) — mất đặc điểm quan trọng của thiết kế.

## Resume pattern khi step fail

Khi bước 1 (tách đồ) thành công nhưng bước 2 (ghép đồ) fail:
- Đặt tên versioned: `step1_clothing_v2.png` thay vì ghi đè file cũ
- Viết script nhỏ riêng chỉ cho bước cần chạy lại (vd: `redo-tryon-person1.ts`)
- Không chạy toàn bộ pipeline lại — tiết kiệm credit ChatGPT/Gemini

## Pitfalls

- Chrome phải chạy `--remote-debugging-port=9222` profile `~/chrome-cdp-profile`
- **ChatGPT generateImage + ảnh đính kèm: PHẢI click `[data-testid="send-button"]`, KHÔNG dùng Enter** — Enter không gửi khi có ảnh
- **ChatGPT upload: dùng `#upload-photos`, KHÔNG dùng `input[type="file"]` đầu tiên** (`#upload-files` là ẩn, không hoạt động)
- **Gemini song song 2 tab dễ crash**: lỗi `page.waitForTimeout: Target page, context or browser has been closed` xảy ra khi chạy 2 geminiGenerateImage song song (Promise.all). Nếu gặp lỗi này, chạy tuần tự (1 sau 1) thay vì song song — hoặc retry từng cái riêng lẻ với script nhỏ.
- **ChatGPT có thể hiện 2 option sau khi tạo ảnh** (kiểu chọn style/variation) — script cần detect và click option phù hợp trước khi tìm ảnh để download; nếu không handle case này sẽ throw "Không tải được ảnh ChatGPT sau vài lần thử"
- Gemini try-on thứ tự ảnh: [người mẫu, đồ nền trắng] — Image 1 = người, Image 2 = đồ
- Tách đồ dùng ChatGPT (tốt hơn cho product isolation); ghép đồ dùng Gemini (ChatGPT chặn try-on người thật)
- process.exit(0) bắt buộc sau script — Playwright giữ CDP khiến terminal treo nếu không exit
- **Google Flow đã đổi UI hoàn toàn (June 2026)**: Giờ là Storyboard editor, không còn simple composer. Sau "New project" vào trang `/project/<id>` với sidebar "Xem các cảnh / Nhân vật / Công cụ". Composer mới là `div[role="textbox"]` class băm. Không còn nút `arrow_forward` — cần soi DOM thật trước khi fix. Chạy `inspect-flow.ts` để xem DOM hiện tại.
- **Output workflow**: lưu vào `~/hermes_workspace/workflows/<run-id>/images/` và `videos/` — KHÔNG lưu vào skill assets
- **Google Flow hết credit — detect ngay**: Flow không báo lỗi rõ khi hết credit, chỉ hiện UI "Nâng cấp để tạo" hoặc không gen gì. Script detect pattern tiếng Việt: `hết.*credit|hết.*lượt|nâng cấp để tạo`. Nếu không detect được sẽ treo 12 phút timeout.
  - **(June 2026) UI MỚI khi hết credit — KHÔNG có text báo lỗi**: nút Send biến thành `<div>` chứa `<img src="/fx/icons/flow_alert_sphere.svg">` + `<i class="google-symbols">info</i>`. Icon `arrow_forward` (nút gửi bình thường) BIẾN MẤT. Quét text vô dụng. `flowGenerateVideo` giờ check TRƯỚC khi gửi: `document.querySelector('img[src*="flow_alert_sphere"]')` có → throw "HẾT CREDIT" ngay; HOẶC không còn `<i>` nào chứa text `arrow_forward` → cũng throw. KHÔNG fallback Enter (vô tác dụng khi hết credit). Đã verify bằng linkedom trên DOM thật: hết credit `{alert:true,hasArrow:false}`→throw, bình thường `{alert:false,hasArrow:true}`→chạy. Vòng poll sau khi gửi cũng check `creditAlert` để bắt trường hợp credit cạn giữa chừng.
- **Resume từng step**: khi 1 bước fail (vd Flow hết credit), ảnh trung gian đã có thể dùng lại. Chạy script riêng chỉ cho bước đó:
  ```bash
  # Đã có step1 (clothing) + step2 (tryon), chỉ cần gen video
  npx tsx run-flow-spin.ts  # script riêng import flowGenerateVideo với imagePath đúng
  ```
  Không cần chạy lại toàn bộ test-fashion.ts từ đầu — mất thêm credit Gemini + ChatGPT.
- **cli.ts flow-video không có imagePath**: lệnh `npx tsx cli.ts flow-video` chỉ gõ prompt, không upload ảnh start frame. Phải viết script riêng khi cần `imagePath`.
- **Flow error detection**: check UI text sau mỗi poll — `unable to generate`, `violates policy`, `out of credit`, `something went wrong` → throw ngay, không chờ timeout 12 phút
- **Output convention**: `~/hermes_workspace/workflows/<run-id>/images/` và `videos/` — KHÔNG lưu vào skill assets; skills chỉ chứa định nghĩa
- Ảnh input từ user (URL): tải về `~/hermes_workspace/tmp/`, không lưu vào skill
- Gemini lỗi upload nếu file >10MB — resize trước
- Script test nhanh: `~/hermes_workspace/browser-pilot/test-fashion.ts` (chạy 3 bước: tách → ghép → 1 video spin)
