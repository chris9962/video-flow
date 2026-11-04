import { query, getSessionMessages } from '@anthropic-ai/claude-agent-sdk';
import { readSettings } from '../settings';
import { getSession, setSession } from '../chat-store';

// AI Workflow Builder: chat → Claude trả về OPS để FE dựng/sửa block trên canvas.
// AI KHÔNG sinh ảnh/video — nó DỰNG WORKFLOW (block + edge); engine chạy mới ra kết quả.

const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6';
// Chặn build treo vô hạn (CLI stall vì rate-limit/yêu cầu nặng) — quá hạn thì abort + báo lỗi rõ.
const AGENT_TIMEOUT_MS = Number(process.env.AI_BUILD_TIMEOUT_MS) || 180_000;

const SYSTEM_PROMPT = `
Bạn là trợ lý dựng workflow cho VideoFlow — app kéo-thả tạo video sản phẩm nhiều shot.
Người dùng chat (tiếng Việt); bạn KHÔNG tự sinh ảnh/video, bạn TRẢ VỀ CÁC THAO TÁC (ops) để
app tạo/sửa block + nối dây trên canvas. Khi user bấm Run, engine mới thực thi ra kết quả.

# Mô hình BLOCK
Mỗi block vừa là nguồn vừa là output. KHÔNG nối input = nguồn (user nhập/upload). CÓ nối input =
tự generate khi Run, kết quả đè vào chính block. Các loại block (field "type"):

- text  — prompt/văn bản. config.content = chuỗi. Không input = nguồn prompt. Có input = LLM agent
          (config.provider: "chatgpt"|"claude"). Phát ra: text. 1 cổng input "in".
- image — ảnh. config.content = ref ảnh (nguồn) hoặc bỏ trống (sẽ generate). Có input = TẠO/GHÉP ảnh:
          nối text(prompt) + image(tham chiếu) vào → ra ảnh mới. config.provider: "gemini" (GHÉP đồ
          lên người mẫu — dùng cho try-on/ghép sản phẩm) | "chatgpt" (tạo ảnh mới). 1 cổng input "in".
          Phát ra: image.
- kling — TẠO VIDEO từ ảnh: 3 cổng "start"(image) + "prompt"(text) + "end"(image, tuỳ chọn) → 1 video.
          config.engine: "web" (kling.ai, dùng credit gói — NÊN DÙNG) | "falai". config.duration: 5|10,
          config.aspectRatio: "9:16"|"16:9"|"1:1", config.quality: "720p"|"1080p". Phát ra: video.
- video — TẠO VIDEO qua Google Flow: 3 cổng "start"+"prompt"+"end". config.model "veo-3.1-fast",
          config.duration, config.aspectRatio. Phát ra: video. (Dùng kling thay thế khi Flow hết credit.)

QUY TẮC: 1 block video = 1 SHOT = 1 video (KHÔNG fan-out). Muốn N shot → tạo N block video.

# Tư duy thiết kế workflow — NHẤT QUÁN là ưu tiên SỐ 1
Lỗi hay gặp: tạo ảnh mẫu/sản phẩm RIÊNG cho từng shot → mỗi shot ra người khác nhau, tất/giày/đồ khác
nhau (vì gen độc lập, "session" khác nhau). Cách tránh: tạo TÀI SẢN GỐC một lần rồi DÙNG CHUNG cho mọi shot.

Quy trình bắt buộc:
1) Xác định tài sản gốc: (a) 1 ảnh SẢN PHẨM, (b) 1 ảnh NGƯỜI MẪU/nhân vật gốc (đã mặc/đi sản phẩm).
2) Ảnh SẢN PHẨM:
   - User đã có (image block nguồn trên canvas / trong attachments) → DÙNG nó (tham chiếu id).
   - CHƯA có → tạo 1 image block (text prompt tả sản phẩm → image, provider "chatgpt") để TẠO TRƯỚC.
     Mọi shot sau dùng đúng ảnh sản phẩm này.
3) Ảnh NGƯỜI MẪU gốc: tạo DUY NHẤT 1 (image block "gemini" ghép sản phẩm lên mẫu, hoặc "chatgpt" tạo mẫu),
   rồi DÙNG LẠI cho tất cả shot. TUYỆT ĐỐI KHÔNG tạo mẫu mới mỗi shot.
4) Mỗi SHOT chỉ khác PROMPT (dáng/góc/chuyển động); ảnh nguồn DÙNG CHUNG:
   - text(prompt frame shot) + ẢNH-MẪU-GỐC [+ ảnh-sản-phẩm] → image block "gemini" → frame START của shot
   - (tuỳ chọn) tương tự → frame END
   - text(prompt chuyển động) → kling block; nối START→start, END→end, motion→prompt
5) Kết quả = N block kling (mỗi shot 1 video), CÙNG 1 nhân vật + CÙNG sản phẩm xuyên suốt.

QUY TẮC NHẤT QUÁN (tuyệt đối): mọi shot ghép từ CÙNG node ảnh mẫu gốc + CÙNG node ảnh sản phẩm. Không
nhân bản nguồn, không để mỗi shot tự sinh mẫu/sản phẩm độc lập.

# Nhiệm vụ + TỰ REVIEW (BẮT BUỘC)
- User mô tả mục tiêu (vd "video tất chân 3 shot"), có/không kèm kịch bản. Không có → BẠN tự viết, tách 2–4 shot.
- CHAT LẶP: canvas hiện tại được cung cấp; tôn trọng node đã có (id), sửa tối thiểu. "thêm shot" = thêm cụm
  shot mới (vẫn dùng ảnh gốc cũ); "đổi prompt shot 2" = updateNode.
- SAU KHI dựng xong ops, TỰ REVIEW và GHI kết quả vào field "review" — trace workflow trong đầu như đang Run:
  • Mỗi block sẽ output gì? Luồng có chạy được không (đủ input cho mỗi block sinh)?
  • Người mẫu có GIỐNG NHAU qua MỌI shot không (cùng 1 node ảnh mẫu gốc)?
  • Sản phẩm có NHẤT QUÁN không (cùng 1 node ảnh sản phẩm)? Có shot nào dùng nguồn khác → lệch không?
  • Có ảnh nào gen độc lập gây ngoại lệ (màu/kiểu/đôi giày khác) không?
  Nếu phát hiện chưa nhất quán → SỬA ops (cho nối về cùng ảnh gốc) NGAY, rồi mới trả về.

# Định dạng OUTPUT (NGHIÊM NGẶT)
Trả về DUY NHẤT 1 object JSON, KHÔNG markdown, KHÔNG văn bản ngoài JSON:
{
  "review": "<TỰ REVIEW: trace workflow + soi nhất quán (mẫu/sản phẩm có dùng chung ảnh gốc không, đã sửa gì). Bắt buộc, vài câu.>",
  "reply": "<lời nhắn tiếng Việt cho user: tóm tắt đã dựng gì + kịch bản nếu tự viết, ngắn gọn>",
  "ops": [ <thao tác> ]
}
QUAN TRỌNG: viết "review" TRƯỚC khi chốt "ops" — nếu review phát hiện chưa nhất quán thì sửa ops rồi mới trả.
Mỗi thao tác là 1 trong:
  { "op":"addNode", "tempId":"<id tạm>", "type":"text|image|kling|video",
    "config":{...}, "position":{"x":<số>,"y":<số>} }
  { "op":"addEdge", "source":"<id hoặc tempId>", "target":"<id hoặc tempId>", "targetPort":"in|start|prompt|end" }
  { "op":"updateNode", "id":"<id node đã có>", "config":{...} }   // merge vào config
  { "op":"deleteNode", "id":"<id node đã có>" }

QUY TẮC ops:
- "tempId" = node MỚI tạo trong response này (vd "s1_start", "s1_motion", "s1_vid"); các edge cùng
  response tham chiếu nó. "id" = node ĐÃ có trên canvas (lấy từ phần "Canvas hiện tại").
- source của edge luôn là cổng "out" (không cần ghi). targetPort phải hợp loại: image→start/end,
  text→prompt (với kling/video) hoặc →in (với image/text agent).
- position: bố trí trái→phải theo luồng (nguồn x nhỏ, video x lớn), mỗi shot 1 hàng (y cách ~260).
  Khoảng cách x ~280, y ~260. Cứ cho số hợp lý, user sẽ tự sắp lại.
- Tạo ảnh ghép sản phẩm → provider "gemini". Video → type "kling", engine "web", aspectRatio "9:16".
- KHÔNG nối nhiều prompt vào 1 cổng; mỗi cổng 1 nguồn.
`.trim();

export interface AiBuildOp {
  op: 'addNode' | 'addEdge' | 'updateNode' | 'deleteNode';
  tempId?: string;
  type?: string;
  config?: Record<string, unknown>;
  position?: { x: number; y: number };
  source?: string;
  target?: string;
  targetPort?: string;
  id?: string;
}
export interface AiBuildResult {
  reply: string;
  ops: AiBuildOp[];
  /** Tự review của agent: trace workflow + soi nhất quán (hiển thị cho user) */
  review?: string;
}

interface CanvasNode {
  id: string;
  type: string;
  config?: Record<string, unknown>;
  position?: { x: number; y: number };
}
interface CanvasEdge {
  source: { nodeId: string; port: string };
  target: { nodeId: string; port: string };
}
export interface AiBuildRequest {
  message: string;
  workflow: { nodes: CanvasNode[]; edges: CanvasEdge[] };
  attachments?: { ref: unknown; label: string }[];
  /** Gắn chat + session theo workflow → resume bộ nhớ hội thoại */
  workflowId?: string;
  /** Node user đang chọn trên canvas — khi user nói "node này/mấy node này" là ám chỉ chúng */
  selectedNodeIds?: string[];
}

function renderUserMessage(req: AiBuildRequest): string {
  const nodes = req.workflow.nodes
    .map((n) => {
      const c = n.config ?? {};
      const content = typeof c.content === 'string' ? ` content="${c.content.slice(0, 60).replace(/\n/g, ' ')}"` : c.content ? ' [file]' : '';
      const prov = c.provider ? ` provider=${c.provider}` : '';
      const eng = c.engine ? ` engine=${c.engine}` : '';
      return `  - id=${n.id} type=${n.type}${content}${prov}${eng}`;
    })
    .join('\n');
  const edges = req.workflow.edges
    .map((e) => `  - ${e.source.nodeId} → [${e.target.port}] ${e.target.nodeId}`)
    .join('\n');
  const atts = (req.attachments ?? [])
    .map((a, i) => `  - attachment ${i}: "${a.label}" (ref=${JSON.stringify(a.ref)})`)
    .join('\n');

  // Node user đang chọn → mô tả kèm type+content để agent biết chính xác user nhắc tới cái nào
  const selSet = new Set(req.selectedNodeIds ?? []);
  const selected = req.workflow.nodes
    .filter((n) => selSet.has(n.id))
    .map((n) => {
      const c = n.config ?? {};
      const content = typeof c.content === 'string' ? ` "${c.content.slice(0, 50).replace(/\n/g, ' ')}"` : c.content ? ' [file]' : '';
      return `  - id=${n.id} type=${n.type}${content}`;
    })
    .join('\n');
  const selectedBlock = selSet.size
    ? [
        '',
        `NODE USER ĐANG CHỌN (${selSet.size}) — khi user nói "node này / mấy node này / cái này / đám này"`,
        'là ám chỉ CHÍNH các node dưới đây. Ưu tiên thao tác đúng vào chúng (updateNode/addEdge/deleteNode theo id):',
        selected,
      ]
    : [];

  return [
    'Canvas hiện tại:',
    'Nodes:',
    nodes || '  (trống)',
    'Edges:',
    edges || '  (trống)',
    '',
    'Ảnh user vừa đính (dùng làm config.content cho image block NGUỒN nếu cần):',
    atts || '  (không có)',
    ...selectedBlock,
    '',
    `Yêu cầu của user: ${req.message.trim()}`,
    '',
    'Trả về DUY NHẤT object JSON {reply, ops}. KHÔNG markdown, KHÔNG văn bản ngoài JSON.',
  ].join('\n');
}

async function runAgent(userMessage: string, resume?: string): Promise<{ text: string; sessionId?: string }> {
  const abortController = new AbortController();
  const timer = setTimeout(() => abortController.abort(), AGENT_TIMEOUT_MS);
  try {
    const q = query({
      prompt: userMessage,
      options: {
        model: DEFAULT_MODEL,
        systemPrompt: SYSTEM_PROMPT,
        maxTurns: 1,
        ...(resume ? { resume } : {}), // resume session → agent nhớ hội thoại trước (bộ nhớ)
        abortController, // abort khi quá AGENT_TIMEOUT_MS để không treo vô hạn
        disallowedTools: ['Bash', 'Edit', 'Read', 'Write', 'Glob', 'Grep', 'WebFetch', 'WebSearch', 'Task', 'TodoWrite', 'NotebookEdit'],
      },
    });
    for await (const msg of q) {
      if (msg.type === 'result') {
        if (msg.subtype === 'success') return { text: msg.result, sessionId: (msg as { session_id?: string }).session_id };
        throw new Error(`Claude lỗi: ${msg.subtype}`);
      }
    }
    throw new Error('Claude kết thúc không có kết quả');
  } catch (err) {
    if (abortController.signal.aborted) {
      throw new Error(
        `AI quá lâu (>${Math.round(AGENT_TIMEOUT_MS / 1000)}s) — có thể bị rate-limit hoặc yêu cầu quá nặng. Thử lại, rút gọn yêu cầu, hoặc kiểm tra token Claude.`,
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

function parseJson(text: string): AiBuildResult | null {
  const tryParse = (s: string): AiBuildResult | null => {
    try {
      const o = JSON.parse(s) as Partial<AiBuildResult>;
      if (typeof o.reply === 'string' && Array.isArray(o.ops))
        return { reply: o.reply, ops: o.ops as AiBuildOp[], review: typeof o.review === 'string' ? o.review : undefined };
    } catch {}
    return null;
  };
  const fenced = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  const candidates = [text.trim(), fenced?.[1]?.trim()].filter(Boolean) as string[];
  for (const c of candidates) {
    const r = tryParse(c);
    if (r) return r;
  }
  const s = text.indexOf('{');
  const e = text.lastIndexOf('}');
  if (s !== -1 && e > s) return tryParse(text.slice(s, e + 1));
  return null;
}

async function ensureToken(): Promise<void> {
  const { claudeToken } = await readSettings();
  if (!claudeToken.trim()) throw new Error('Chưa có Claude token — vào Settings nhập CLAUDE_CODE_OAUTH_TOKEN');
  process.env.CLAUDE_CODE_OAUTH_TOKEN = claudeToken.trim(); // Agent SDK đọc token qua env khi spawn claude CLI
}

export async function aiBuild(req: AiBuildRequest): Promise<AiBuildResult> {
  await ensureToken();
  const resume = req.workflowId ? await getSession(req.workflowId) : undefined;
  let out: { text: string; sessionId?: string };
  try {
    out = await runAgent(renderUserMessage(req), resume);
  } catch (err) {
    if (resume) out = await runAgent(renderUserMessage(req)); // session cũ hỏng/hết → chạy session mới
    else throw err;
  }
  const parsed = parseJson(out.text);
  if (!parsed) throw new Error('Claude trả về không phải JSON hợp lệ');
  if (req.workflowId && out.sessionId) await setSession(req.workflowId, out.sessionId).catch(() => {});
  return parsed;
}

function extractText(message: unknown): string {
  if (typeof message === 'string') return message;
  const content = (message as { content?: unknown })?.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content.map((b) => (typeof b === 'string' ? b : ((b as { text?: string }).text ?? ''))).join('\n');
  }
  return '';
}

/** History hiển thị: SDK đã lưu session; lấy messages rồi bóc phần sạch (message gốc của user + reply của AI). */
export async function getChatHistory(workflowId: string): Promise<{ role: 'user' | 'ai'; text: string }[]> {
  const sessionId = await getSession(workflowId);
  if (!sessionId) return [];
  await ensureToken().catch(() => {});
  const msgs = await getSessionMessages(sessionId).catch(() => []);
  const out: { role: 'user' | 'ai'; text: string }[] = [];
  for (const m of msgs) {
    const content = extractText((m as { message?: unknown }).message);
    if (m.type === 'user') {
      const orig = content.match(/Yêu cầu của user:\s*([\s\S]*?)\n\nTrả về DUY NHẤT/);
      if (orig) out.push({ role: 'user', text: orig[1].trim() });
    } else if (m.type === 'assistant') {
      const parsed = parseJson(content);
      if (parsed) out.push({ role: 'ai', text: parsed.reply });
    }
  }
  return out;
}
