# VideoFlow — Project Context (bàn giao cho session mới)

App web cá nhân (chạy local, macOS/Windows) gồm workflow editor kéo-thả tạo/ghép ảnh-video,
dùng **browser automation** (ChatGPT/Claude/Gemini qua web) + fal.ai. Đọc kỹ trước khi sửa.

## Tài liệu gốc (đọc khi cần chi tiết)
- Thiết kế: `docs/superpowers/specs/2026-06-10-video-flow-design.md` (§4 đã PIVOT sang mô hình block)
- Plan giai đoạn 1: `docs/superpowers/plans/2026-06-10-phase1-skeleton-editor.md`
- Lịch sử quyết định: xem `git log` (commit message tiếng Việt, chi tiết)

## Kiến trúc
Monorepo npm workspaces, TypeScript, ESM:
- `packages/shared` — types dùng chung (Workflow, BLOCK_DEFINITIONS, ExecutionEvent, RunStatus…)
- `apps/server` — Fastify local (127.0.0.1:3001): engine, node registry, services (browser pilot/media/fal), routes, WS
- `apps/web` — React + Vite + @xyflow/react (React Flow v12)
Dữ liệu: `data/` ở gốc repo (gitignore) — `workflows/*.json`, `runs/<id>/`, `assets/`, `settings.json`.
Profile Chrome CDP nằm TOÀN CỤC `~/chrome-cdp-profile` (KHÔNG còn trong `data/`).
**git push:** `.gitignore` ignore cả `data/` TRỪ `data/node-templates/` + đúng ảnh chúng dùng (do `scripts/sync-template-gitignore.mjs`
tự sinh — chạy script này trước commit khi thêm node mẫu). `settings.json` (token) luôn ignored.
**TUYỆT ĐỐI không tự chạy lệnh xóa trong `data/workflows/` — đó là dữ liệu user.**

## Mô hình BLOCK (cốt lõi, đã pivot)
Chỉ 3 block: `text`, `image`, `video`. Block KHÔNG có input = nguồn (user nhập/upload). Block CÓ input
= tự generate khi Run, kết quả **đè vào content của chính block** (apply-back). Mỗi block 1 input port
('in', nhận nhiều edge) + 1 output ('out'). Fan-out: mảng đổ vào port đơn → block sau chạy lặp.
- text có input = LLM agent (provider chatgpt/claude); image có input = tạo/ghép ảnh (provider chatgpt/gemini);
  video có input = tạo video (fal.ai) hoặc ghép (≥2 video).
- UI: chọn agent/provider chỉ hiện trên block CÓ input. Image output: ChatGPT (tạo ảnh) | Gemini (ghép đồ).

### Block video theo model (mỗi model 1 block, MỖI BLOCK = 1 VIDEO — không fan-out trong block)
Tách `BlockTypeDefinition.type` (id block, là `node.type`) khỏi `emits` (loại data phát ra). 3 block tạo video
qua **fal.ai** đều `emits:'video'` nên nối được vào mọi cổng nhận video. Engine dùng `BLOCK_DEFINITIONS[type].emits`
làm srcType (không dùng `node.type`); FE `canConnect` cũng map qua emits.
- `video` (label "Video (Flow)") — Google Flow qua browser (xem mục Google Flow). Vẫn là nguồn upload/YouTube.
- `kling` — Kling text/ảnh→video: cổng start/prompt/end → `getFal().generateVideo` (`kling-video/v2.5-turbo/pro`…).
- `kling-edit` — video mẫu + prompt → đổi nền/nhân vật/style, giữ chuyển động (`kling-video/o1/video-to-video/edit`).
- `faceswap` — video + ảnh mặt → đổi mặt (`pixverse/swap`, mode person/object/background, res 360/540/720).
- Service: `services/falai-impl.ts` `createFalService()` (generateVideo/editVideo/swapFace) đăng ký ở bootstrap →
  `getFal()`. Cần **fal.ai key** trong Settings. Schema field đã verify từ OpenAPI fal (image_url/tail_image_url,
  duration "5"|"10", aspect 16:9/9:16/1:1; video_url/image_urls/keep_audio; video_url/image_url/mode/resolution).
- Muốn nhiều biến thể: nối 1 video/ảnh nguồn sang NHIỀU block (mỗi block 1 prompt) — KHÔNG dùng fan-out mảng.

## Node mẫu (node templates) & prompt mẫu ship sẵn
- User node template: sub-flow (1 node hoặc nhóm) lưu `data/node-templates/*.json` — đọc/sửa/xoá.
- **Prompt mẫu ship kèm app** (108 cái, trích sheet "Ông Chú MMO"): `apps/server/src/data/prompt-presets.json`
  → `builtin-node-templates.ts` expand thành text node NGUỒN (content=prompt). id `builtin-<key>-<NN>` (read-only:
  list gộp builtin ở cuối, get tra builtin trước, update/delete builtin → 403 / throw). Phân loại: ảnh (tách đồ,
  chân dung), video chuyển động theo loại đồ (áo dài/yoga/công sở/đầm/áo thun/đồ bộ/chống nắng/trung niên/nam/máy
  chạy bộ/seedance). FE `/nodes`: grid có ô tìm, badge "có sẵn", mở builtin → lưu = fork bản sao user.

## AI Workflow Builder (chat → AI dựng block)
Nút **✨ AI** trong editor mở panel chat. AI **không sinh ảnh/video** — nó **dựng workflow** (block+edge),
engine chạy mới ra kết quả. Backend `services/ai-builder.ts` dùng **`@anthropic-ai/claude-agent-sdk` `query()`**
(maxTurns 1, disallow tools) → route `POST /api/ai/build`. Token `CLAUDE_CODE_OAUTH_TOKEN` lưu ở
`data/settings.json` (`claudeToken`, gitignored; Settings UI có field); route set `process.env` trước khi gọi.
- System prompt mô tả block model + nhiệm vụ multi-shot (mỗi shot: text(prompt frame)→image gemini(ghép)→
  frame; text(motion)→kling video; nối start/end/prompt). AI tự viết kịch bản nếu user không đưa.
- Output JSON `{reply, ops}`; ops = addNode/addEdge/updateNode/deleteNode. `tempId`=node mới trong response,
  `id`=node có sẵn. FE (`components/AiChatPanel.tsx` + `applyOps` trong EditorView) map tempId→uuid, áp 1 lần (undo được).
- **NHẤT QUÁN (system prompt ép):** tạo ảnh gốc (SẢN PHẨM + NGƯỜI MẪU) MỘT LẦN rồi DÙNG CHUNG mọi shot
  (node ảnh mẫu gốc có out-degree = số shot). Chưa có ảnh sản phẩm → agent tự tạo (text→image chatgpt) TRƯỚC.
  KHÔNG để mỗi shot tự sinh mẫu/sản phẩm riêng (gen độc lập → lệch nhau).
- **Self-review bắt buộc:** output có field `review` — agent trace lại workflow + soi nhất quán (mẫu/sản phẩm
  có dùng chung không) TRƯỚC khi chốt ops, tự sửa nếu lệch. FE hiện review (role 'review'). Verified: "3 shot
  chưa có ảnh" → agent tạo prod_img + 1 model_img dùng chung 3 shot + review xác nhận "nhất quán 100%".
- **Session/bộ nhớ theo workflow:** chỉ tự lưu MAP `workflowId→sessionId` (`data/ai-sessions.json`); history thật
  do SDK lưu (`~/.claude/projects`). Build: `query({options:{resume:sessionId}})` → agent NHỚ hội thoại trước
  (thông minh hơn); lưu lại `session_id` từ result. History hiển thị: `getSessionMessages(sessionId)` → bóc phần
  sạch (message gốc của user + `reply` của AI). Route `GET /api/ai/chat/:workflowId`; FE nạp lúc mở editor.
  Resume hỏng → tự chạy session mới (fallback).
- **Chậm ~30–120s/request** (claude CLI + model gen + self-review). Không phải treo. Kling web pool song song
  qua `KLING_WEB_POOL_SIZE` (mặc định 3) như Gemini ảnh.

## Tip viết prompt CHUYỂN ĐỘNG (i2v — Flow/Kling/Veo & block motion)
- Dùng **từ ngữ + cấu trúc câu ĐƠN GIẢN**, tránh diễn đạt quá phức tạp.
- Chuyển động phải **tuân theo vật lý**; tốt nhất tả động tác **có khả năng xảy ra ngay trong ảnh** (bám subject/tư thế đã có).
- Mô tả **lệch nhiều so với ảnh** → dễ bị **cắt cảnh / chuyển cảnh** (camera cut/transition) ngoài ý muốn.
- Giai đoạn này **khó tạo chuyển động vật lý phức tạp** (bóng nảy, quỹ đạo ném từ trên cao…) → tránh.
- Áp cho: prompt block `motion` trích ra + prompt nối vào cổng Prompt của block video/kling (Start/End→video).

## Chạy app
- `npm run dev:server` + `npm run dev:web` (web :5173 proxy /api,/ws → :3001)
- `npm run chrome` — mở Chrome riêng với --remote-debugging-port=9222. Profile đặt ở **TOÀN CỤC `~/chrome-cdp-profile`**
  (override env `CHROME_CDP_PROFILE`) → mọi project/feature dùng CHUNG 1 Chrome đã đăng nhập, login 1 lần xài mọi nơi.
  User đăng nhập ChatGPT/Claude/Gemini trong cửa sổ này 1 lần. Server CHỈ connectOverCDP vào nó (qua :9222, độc lập path).
  Lỡ đổi/thêm profile → `connectOverCDP` gãy "Browser context management": kill hết Chrome dùng profile đó, set
  `Local State` → `profile.last_active_profiles=["Default"]` (chặn restore profile khác), dọn SingletonLock, relaunch.
- Test pilot tay: `cd apps/server && npx tsx scripts/test-pilot.ts chatgpt "..."`

## Browser Pilot — kiến thức hard-won (KHÔNG đoán selector, soi DOM thật qua CDP)
File: `apps/server/src/services/browser-pilot.ts`. Pilot **connectOverCDP** vào Chrome user tự mở (KHÔNG launch)
— vì Chrome do Playwright launch bật cờ automation → Google chặn OAuth ("This browser may not be secure").
Chrome 136+ chặn remote-debug trên profile mặc định → phải dùng profile riêng.

Mỗi `generateImage` **mở tab mới (ctx.newPage) + try/finally luôn đóng** cho cả ChatGPT lẫn Gemini.

### ChatGPT (chatgpt.com)
- Composer: `#prompt-textarea` (contenteditable). KHÔNG dùng `form textarea` (đó là textarea ẩn fallback → bug).
- Gửi: gõ bằng `fill()`/insertText rồi **Enter** (đừng tìm-click nút gửi, hay treo).
- Reply text có `[data-message-author-role="assistant"]`. Nhưng ẢNH gen thì KHÔNG có attr này.
- Ảnh gen XONG = nút hành động xuất hiện trong conversation-turn cuối:
  `[data-testid="good-image-turn-action-button"]` / aria "Chia sẻ hình ảnh này" / "Chỉnh sửa ảnh".
  (Nút Stop tắt RẤT SỚM trước khi ảnh xong → KHÔNG dùng làm tín hiệu.)
- Tải: `page.request.get(URL)` BỊ CHẶN. Phải qua UI: click ảnh → dialog toàn màn hình → nút `aria-label="Lưu"`
  → bắt `page.waitForEvent('download')` → saveAs. Retry 3 lần, Escape đóng dialog.

### Gemini (gemini.google.com/app) — dùng để GHÉP ĐỒ (ChatGPT chặn try-on người thật, policy)
- Composer: `div.ql-editor[contenteditable="true"]` (aria "Enter a prompt for Gemini").
- Đính ảnh: KHÔNG có input[type=file]. Bấm `button[aria-label="Upload & tools"]` → "Upload files" →
  `page.waitForEvent('filechooser')` → setFiles. Ảnh lên là `blob:` thumbnail.
- **Lỗi "Something went wrong (1076)"** = gửi quá sớm. Phải chờ: hết spinner `[role="progressbar"]` trong
  `uploader-file-preview` (upload backend xong) VÀ chờ 1s sau khi nhập prompt.
- Gửi: Enter = xuống dòng (mobile) → PHẢI **click `button[aria-label="Send message"]`** (chờ `.send-button` có class `has-input`).
- Ảnh gen XONG = `single-image.generated-image`/`download-generated-image-button` xuất hiện VÀ `.send-button` mất class `stop`.
- Ảnh là `blob:` (không fetch được). Tải: **HOVER vào `single-image.generated-image` trước** rồi click
  `button[aria-label="Download full size image"]` (nằm ngay khu ảnh) → `page.waitForEvent('download')` → saveAs.
  Nút có sẵn trong DOM nhưng bị overlay ảnh chặn pointer khi không hover → click trúng toạ độ mà handler không chạy
  (fail cả 3 lần). KHÔNG mở viewer (click ảnh mở lightbox sẽ lẫn nút "More options" của ảnh khác). Chờ ~2.5s sau khi
  ảnh xong (tránh "couldn't download image"). Retry 3 lần. Verified soi DOM: trước/sau hover nút đều visible nhưng
  chỉ ăn click sau hover.

### Google Flow (labs.google/fx/tools/flow) — tạo VIDEO qua Veo (provider video CHÍNH, dùng credit gói AI Pro/Plus)
**Mặc định TUẦN TỰ (`FLOW_POOL_SIZE=1`):** Flow ăn credit + fan-out video phải đợi video trước render xong
mới gen tiếp (engine bắn `Promise.all` nhưng pool=1 nối đuôi). Để song song mới set env >1.
SPA hydrate chậm: sau `goto` phải chờ element thật (textbox/`New project`) chứ đừng chờ theo thời gian — trang
chưa hydrate hiện bản marketing ("Create with Google Flow"), hydrate xong mới ra app. URL app = marketing trùng nhau.
- **Đăng nhập:** dùng chung session Google của profile CDP (có avatar `img[src*=googleusercontent]`). Login Gemini là đủ.
- **Profile Chrome:** `npm run chrome` ép `--profile-directory=Default` — KHÔNG đổi/thêm profile Chrome (nhiều profile mở
  cùng lúc → `connectOverCDP` gãy "Browser context management is not supported"). Đổi tài khoản Google = Sign out/in trong cửa sổ đó.
- **Ngôn ngữ:** Flow theo **ngôn ngữ tài khoản Google** (server-side) — `/fx/en/`, `?hl=en`, Accept-Language đều bị redirect về
  `/vi/`, KHÔNG ép EN qua URL được. → Selector làm **song ngữ EN|VI**: New project=`Dự án mới`(icon add_2), Agent=`Tác nhân`,
  Frames=`Khung hình`(icon crop_free), Upload media=`Tải nội dung nghe nhìn lên`(icon upload), Start/End slot=`Bắt đầu`/`Kết thúc`.
  Token icon (play_circle/crop_/arrow_forward/%) vốn an toàn ngôn ngữ. `FLOW_DRYRUN=1` = chạy tới trước submit (verify selector
  không tốn credit; ảnh test phải có NỘI DUNG — solid-color bị Flow từ chối).
- **Tạo project:** dashboard → nút `New project` → editor URL `…/flow/project/<uuid>`. Mỗi lần gen nên **tạo project mới**
  để chỉ có 1 video trong "All Media" → không lẫn với video cũ (poll/`<video>` đầu tiên là kết quả).
- **Composer (đáy):** ô prompt = `div[role="textbox"][contenteditable="true"]` (KHÔNG phải `input[aria-label="Editable text"]`
  ở trên cùng — đó là ô TÊN project, `getByRole('textbox').first()` bắt nhầm nó). Gõ: click rồi `keyboard.type` (fill có thể không kích React).
- **Pill "Agent"** = toggle. Bật = mode tự động (ẩn chip model). Phải TẮT để hiện chip model cấu hình. Trạng thái persist theo project → dò động (chip có thì thôi, không thì click Agent).
- **Chip cấu hình** match bằng token `crop_` (LUÔN có icon tỉ lệ `crop_9_16`/`crop_16_9` ở mọi state; KHÔNG dùng `Video ·`/tên model vì đổi tuỳ chế độ): `getByRole('button',{name:/crop_|Nano Banana|Omni|Veo|Flash/i})`.
- **Chip model → popover cấu hình:** tab `Image`/`Video` (`role=tab`). Video có sub-mode `Video` (text→video) / `Frames` (ảnh→video) / `Ingredients` (ảnh tham chiếu).
  Tỉ lệ video chỉ **9:16 & 16:9**; số lượng `1x`–`x4`; thời lượng `4s/6s/8s/10s`; model: **Omni Flash** (rẻ nhất) / **Veo 3.1 Lite/Fast/Quality**.
  Tab tên có prefix icon → match bằng regex (`name:/9:16/`), riêng `1x`/`4s` text thuần dùng `exact:true`. Dòng `Generating will use N credits` cho biết chi phí (vd Omni Flash 4s 9:16 1x = 7 credits; 8s×2 = 24).
- **Default tích hợp = Veo 3.1 - Fast** (chọn ở model dropdown trong popover). Đóng popover bằng `Escape`.
- **Submit:** nút chứa icon `arrow_forward` (`button` filter hasText `'arrow_forward'`); khi prompt rỗng nó `aria-disabled="true"`. Gõ prompt xong mới enable.
- **Gõ prompt = `keyboard.insertText` (KHÔNG `keyboard.type`):** Flow composer hiểu `\n` là **Enter=SUBMIT** → prompt nhiều dòng (108 builtin phần lớn nhiều dòng) bị submit sớm giữa chừng → ra **2 video** (1 có frame + nửa prompt, 1 chỉ prompt còn lại không ảnh). `insertText` chèn cả chuỗi 1 event, React vẫn nhận, không Enter giữa chừng. (Đã verify 3 dòng vào đủ, không submit.) Kling web cũng dùng `insertText` cùng lý do.
- **image→video (Frames):** sub-tab `Frames` có 2 slot **Start/End** (div clickable, KHÔNG phải button, class băm → tìm bằng text rồi leo lên ô vuông ~50px). Click slot → dialog chọn media → nút **"Upload media"** → `filechooser` → setFiles → asset hiện kèm spinner → **click asset tile** để tự gắn vào slot (KHÔNG cần nút "Add to Prompt"). Ảnh quá nhỏ/degenerate bị Flow từ chối ("Oops, something went wrong"). video block có 3 cổng start/prompt/end.
- **Đang render:** tile trong "All Media" hiện `\d+%`. **XONG = hết `%` trong `document.body.innerText` VÀ có `<video>`.**
- **Tải (CÁCH BỀN — đã đổi):** lấy `<video>.src` = `…/flow/api/trpc/media.getMediaUrlRedirect?name=<uuid>` (URL có cookie-auth) rồi **`page.request.get(src)` → ghi file** (trả `video/mp4` thẳng). Reload project trước để src trpc settle. BỎ cách hover→kebab→Download→"720p Original Size" cũ (UI mong manh, hay không trúng ngay sau gen). Đã verify end-to-end ra MP4 ~1.5MB.

### Kling qua WEB (kling.ai/app) — dùng credit gói SUB (không phải fal.ai API)
Block `kling` có `config.engine`: `'falai'` (mặc định, fal API trả tiền) | `'web'` (kling.ai, tiêu credit sub). Web =
`services/kling-web-impl.ts` `createKlingWebService()` (VideoGenService) → `getKlingWeb()`. connectOverCDP vào Chrome
user (đăng nhập kling.ai 1 lần — Settings có nút "Mở tab kling.ai" qua `POST /api/browser/open-site/kling`).
- Trang tạo: `https://kling.ai/app/video/new`. Composer = `div.tiptap.ProseMirror[contenteditable="true"]` (click + `keyboard.type`).
- **Frame Start:** `input[type=file][accept*=jpg]` (input đầu) có sẵn → `setInputFiles` thẳng (verified).
- **Frame End:** chỉ hiện slot "Add an end frame" SAU khi có Start **VÀ Native Audio đã TẮT**. kling.ai khoá End khi Native
  Audio bật ("End Frame is not available with Native Audio"). `ensureNativeAudioOff` PHẢI chạy TRƯỚC khi set frame (tắt
  sau khi set Start không cập nhật slot). Toggle: ON = icon `#icon-checkbox-checked-secondary`, OFF = `#icon-checkbox-unchecked`;
  click text "Native Audio" để đổi. End = click slot "Add an end frame" → `filechooser` → setFiles (verified, 2 frame gắn OK).
- Nút Generate = `button` chứa "Generate" (class `generic-button critical`; sau khi gõ prompt nó re-render → locate bằng hasText `.last()`).
- Chưa login → có popup "Sign in to Obtain/Trial Package" + nút "Sign In" → `assertLoggedIn` throw.
- **Tải (CÁCH ĐÚNG — đã verify ra MP4 6.3MB):** `<video>.src` là **`blob:`** (KHÔNG `request.get` được). Tải = hover video →
  click nút icon `#icon-download` (`<use href="#icon-download">`, leo lên `button`) → `page.waitForEvent('download')` → saveAs.
  Render-xong = `<video>` đầu có `src` KHÁC `beforeSrc` (chụp trước khi bấm Gen, tránh tải nhầm history) + `duration>0` + có nút download.
- **Config (Mode/Length/Aspect):** `applyConfig` click div summary "1080p · 5s · 16:9 · 1" để mở popover → chọn option là
  `div.inner` (vd `<div class="inner">10s</div>`; popover GIỮ MỞ khi click nhiều option). Length(5s/10s)+Aspect(16:9/9:16/1:1)
  set CHẮC; Quality(720p/1080p) best-effort (đôi khi trượt → giữ mặc định 1080p). Lưu ý option theo MODEL: VIDEO 3.0 ở
  video/new là 720p/1080p + 5s/10s (KHÔNG có 4K/slider 3-15s như model khác). Block FE web hiện Quality+Length+Aspect (bỏ
  model dropdown); fal hiện Model+Length+Aspect. Number of Outputs cố định 1 (quy tắc "1 block = 1 video").
- **`KLING_WEB_DRYRUN=1`** = chạy hết input path (audio off + Start + End + applyConfig + locate Generate) nhưng KHÔNG bấm
  Generate (verify không tốn credit — đã verify OK). **Render-detection + tải sau-Gen chưa test gen thật** (cơ chế download đã
  verify từ video có sẵn ra MP4 6.3MB).

## Media / fal.ai
- `media-impl.ts`: yt-dlp (tự tải binary vào data/bin), ffmpeg (ffmpeg-static) — keyframes/transcript, ghép 1080x1920@30fps.
- `falai-impl.ts`: `createFalService()` — generateVideo (Kling), editVideo (Kling O1 video→video), swapFace (Pixverse).
  Đã wire vào block kling/kling-edit/faceswap (xem mục "Block video theo model"). Dùng khi Flow hết credit.
- fal.ai có model try-on `fal-ai/fashn/tryon/v1.6` (chưa tích hợp — user chọn Gemini browser thay vì tốn tiền).

## WS / engine lưu ý
- `useExecution` tự reconnect WebSocket khi đứt (server restart). Nếu thiếu status khi run → kiểm tra WS.
- Auto-save 5s, **bỏ qua khi canvas rỗng** (tránh wipe). "Chạy từ đây" = startNodeId, pre-seed upstream có content.
- Nhân bản (clone) sinh **node/edge id MỚI** (cloneWithFreshIds) — bản sao độc lập.
- **Dedup edge theo (nguồn, cổng-đã-resolve):** workflow cũ có thể có CẢ cổng `in` legacy LẪN start/prompt/end mới từ
  cùng 1 nguồn (`in` resolve về đúng cổng đó) → input bị nhân đôi (vd prompt join `"TEXT\n\nTEXT"`). Engine bỏ edge trùng
  `(sourceNodeId|resolvedPort)` để mỗi nguồn→cổng chỉ tính 1 lần.

## Quy tắc làm việc (rất quan trọng với dự án này)
- Selector web bên thứ 3: **soi DOM thật qua CDP rồi mới viết**, không đoán. Script tạm `/tmp/*.mjs`,
  connectOverCDP, KHÔNG gọi `browser.close()` (đóng luôn Chrome user). Để process exit tự ngắt.
- Commit message tiếng Việt, mô tả nguyên nhân + cách sửa.
