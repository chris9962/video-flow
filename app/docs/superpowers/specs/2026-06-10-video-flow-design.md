# VideoFlow — Thiết kế hệ thống

**Ngày:** 2026-06-10
**Trạng thái:** Đã duyệt qua brainstorming

## 1. Tổng quan

Local web app (single-user, chạy trên máy cá nhân, hỗ trợ macOS + Windows) gồm hai tính năng:

1. **Workflow editor tạo video** — canvas kéo thả node (text, ảnh, video), nối các node bằng edge có kiểu dữ liệu. Node AI (LLM, tạo ảnh) chạy qua **browser automation** trên web UI của ChatGPT/Claude để tiết kiệm chi phí; node tạo video dùng **API** (fal.ai) để ổn định và config đầy đủ.
2. **Automation video → shorts** — dán link YouTube → phân tích "DNA" video → sinh kịch bản + prompt cho từng short → tạo ảnh/video cho từng short → ghép thành video hoàn chỉnh. Tính năng này là **template workflow** dựng từ các node của tính năng 1, không phải code riêng.

### Quyết định nền tảng (đã chốt với user)

| Quyết định | Lựa chọn |
| --- | --- |
| Đối tượng | Chỉ một user, chạy local |
| LLM | Browser automation: ChatGPT (chatgpt.com) + Claude (claude.ai) |
| Tạo ảnh | ChatGPT web (Claude không tạo ảnh) |
| Tạo video | API qua fal.ai (aggregator: Kling, Veo, Hailuo, Wan...) |
| Nguồn video Feature 2 | YouTube (video dài + Shorts) |
| Stack | TypeScript full-stack |
| Kiến trúc | Phương án A: local web app + Playwright persistent profile, browser headful |

**Lưu ý ToS:** automation web UI của ChatGPT/Claude là vùng xám ToS. Chấp nhận rủi ro ở mức dùng cá nhân, tần suất thấp. Kiến trúc adapter cho phép chuyển từng provider sang API key sau này mà không đụng engine.

## 2. Kiến trúc tổng thể

Monorepo TypeScript:

```
video-flow/
├── apps/web        → React + Vite + React Flow (node editor UI)
├── apps/server     → Node.js + Fastify (chạy local)
└── packages/shared → Types dùng chung (workflow schema, node definitions, WS messages)
```

- `apps/web`: canvas React Flow, panel cấu hình node, panel kết quả. Giao tiếp với server qua REST (CRUD workflow/template) + WebSocket (trạng thái execution realtime).
- `apps/server`: 5 module tách biệt:

| Module | Nhiệm vụ |
| --- | --- |
| Execution Engine | Chạy workflow graph theo thứ tự dependency, phát tiến độ qua WebSocket |
| Node Registry | Danh mục loại node: schema input/output port + hàm `execute()` |
| Browser Pilot | Playwright persistent profile + adapter ChatGPT/Claude, queue tuần tự per-provider |
| Video Gen Client | Gọi fal.ai, polling đến khi xong, tải video về |
| Media Tools | Bọc `yt-dlp` (tải YouTube) và `ffmpeg` (keyframes, concat, audio) |

### Lưu trữ — không dùng database

- Toàn bộ dữ liệu nằm trong thư mục `data/` ở root repo, đã gitignore
- Workflow: file JSON tại `data/workflows/`
- Run: mỗi lần chạy tạo `data/runs/<run-id>/` chứa toàn bộ output từng node (text, ảnh, video) — vừa là cache cho resume, vừa là nơi lấy thành phẩm
- Browser profile: `data/browser-profile`
- Mọi đường dẫn qua `path.join` (đa nền tảng)
- Binary đa nền tảng: `ffmpeg-static`, `yt-dlp-wrap` (tự tải đúng binary cho OS)

## 3. Data model

```typescript
// packages/shared
interface Workflow {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  edges: Edge[];
}

interface WorkflowNode {
  id: string;
  type: 'text' | 'image' | 'video';
  position: { x: number; y: number };
  config: Record<string, unknown>;  // content + cấu hình agent (provider, model…)
}

interface Edge {
  id: string;
  source: { nodeId: string };       // mỗi block 1 output ("nội dung của block")
  target: { nodeId: string };       // mỗi block 1 input nhận nhiều kết nối
}
```

- **Execution:** sắp xếp topo; các nhánh độc lập chạy song song; output mỗi block ghi vào run folder và truyền qua edge.
- **Resume:** chạy lại một run thì block đã có kết quả sẽ skip; "Retry from here" chạy lại từ block lỗi trở đi. (chưa làm — để giai đoạn sau)

## 4. Hệ thống block (MÔ HÌNH ĐÃ PIVOT — 2026-06-10)

> Quyết định của user: KHÔNG có node chức năng riêng (llm-agent, image-gen, video-analyze, split-list, video-stitch…). Chỉ có **3 block nội dung**, block tự suy ra hành vi từ input nối vào — "block vừa là input vừa là output". Kết quả generate **đè trực tiếp vào content của block**.

| Block | Không có input (= nguồn) | Có input (= generate khi Run) |
| --- | --- | --- |
| `text` | Phát ra text user gõ | Gọi LLM (ChatGPT/Claude qua browser): text của block là prompt, input là context. Video đổ vào sẽ được tách keyframes + transcript trước. Kết quả đè vào content. Nếu kết quả là JSON array → phát ra mảng (fan-out) |
| `image` | Phát ra ảnh user upload | Tạo ảnh (ChatGPT browser) từ text input (prompt) + ảnh input (tham chiếu). Ảnh kết quả đè vào content |
| `video` | Phát ra video user upload hoặc tải từ URL YouTube (yt-dlp) | ≥2 video input → **tự ghép** (ffmpeg concat). Text/ảnh input → tạo video qua fal.ai (ảnh = frame đầu). Video kết quả đè vào content |

**Các "tính năng" chỉ là cách dùng block:**
- *Phân tích DNA* = text block với prompt phân tích, nhận video input
- *Tách danh sách* = text block với prompt "trả về JSON array" → mảng fan-out
- *Tạo ảnh/video, ghép video* = hành vi tự động của image/video block

**Fan-out:** giá trị mảng trên một edge → block sau chạy lặp từng phần tử (zip các mảng cùng độ dài, broadcast giá trị đơn), content thành mảng kết quả. Riêng video đổ vào video block thì flatten và tiêu thụ nguyên danh sách (để ghép).

**Nối nhiều edge cùng loại** vào 1 block = gom thành danh sách trong cùng một lần generate (vd 2 ảnh tham chiếu cho image block).

**Validation kết nối:** image block không nhận video input; còn lại tự do.

**Apply-back:** sau khi block generate xong, server lưu content mới vào workflow JSON và broadcast qua WebSocket — canvas hiển thị kết quả ngay trong block.

## 5. Browser Pilot

```
BrowserPilot
├── ProfileManager → 1 Chrome persistent profile (~/.videoflow/browser-profile),
│                    đăng nhập ChatGPT/Claude một lần lúc setup
├── Queue          → node AI xếp hàng tuần tự per-provider (1 tab/provider)
└── Adapters       → ChatGPTAdapter, ClaudeAdapter
                     chung interface: sendPrompt({text, images}) → {text, images?}
```

Quyết định chốt:

1. **Headful** — cửa sổ Chrome hiện thật trên màn hình; giảm bot detection, user can thiệp tay được khi cần.
2. **Selector bám semantic** (`role`, `aria-label`, `placeholder`, `contenteditable`) thay vì CSS class; UI đổi thì chỉ sửa 1 file adapter.
3. **Phát hiện trả lời xong:** chờ nút "Stop generating" biến mất / nút gửi enable lại.
4. **Adapter cùng interface** — thêm Gemini hoặc chuyển provider sang API key chỉ là thêm/thay 1 adapter.

## 6. Feature 2 = template workflow

Template "Video → Shorts" ship kèm app (thư mục `templates/` chứa JSON + nút "New from template"):

```
video block (dán link YouTube)
   │
text block "Phân tích DNA video này…"          ← LLM + keyframes/transcript
   │
text block "Lên kịch bản N short, trả JSON array"  ← kết quả là mảng → fan-out
   │
image block (tạo keyframe cho từng short)       ← chạy lặp N lần
   │
video block (tạo video từng short qua fal.ai)   ← chạy lặp N lần
   │
video block (nhận N video → tự ghép thành 1)
```

User mở template, dán link, chỉnh prompt tùy ý, Run. Save lại thành template riêng được.

## 7. Error handling

- Node lỗi → nhánh sau dừng, nhánh độc lập chạy tiếp; node hiện trạng thái đỏ + log đầy đủ.
- Resume/"Retry from here" dựa trên kết quả đã lưu trong run folder (tối quan trọng vì video-gen tốn tiền).
- Trạng thái `waiting-for-human` khi browser cần thao tác tay (captcha, verify, hết hạn đăng nhập): UI hiện banner, user xử lý trong Chrome rồi bấm Continue.
- Timeout mặc định per-loại-node (LLM 5 phút, video-gen 30 phút); retry có giới hạn cho lỗi tạm thời (mạng, rate limit).

## 8. Lộ trình build

Mỗi giai đoạn kết thúc bằng một workflow demo chạy end-to-end thật:

1. **Skeleton + Editor** — monorepo, React Flow canvas (kéo thả/nối/save), execution engine chạy `text` → `output`, trạng thái realtime qua WebSocket.
2. **Browser Pilot** — ProfileManager + adapter ChatGPT/Claude, node `llm-agent`, `image-gen`. Demo: "ảnh + prompt → agent → kết quả".
3. **Video** — node `video-gen` (fal.ai), `video-link` (yt-dlp), `video-stitch` (ffmpeg). Feature 1 hoàn chỉnh.
4. **Feature 2** — node `video-analyze`, `split-list`, hệ template + template "Video → Shorts".

## 9. Testing

- Unit test: execution engine (topo sort, fan-out của `split-list`, resume) — phần thuần logic.
- Adapter: script chạy tay (phụ thuộc web bên thứ ba, không đưa vào CI).
- Mỗi giai đoạn: một workflow demo end-to-end thật làm tiêu chí hoàn thành.
