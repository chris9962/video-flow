#!/usr/bin/env node
// Tạo 1 workflow video-flow cho N bộ đồ trên cùng 1 clip: tách sản phẩm từ ảnh Shopee → Ghép mẫu.
// Lệnh dừng sau Ghép mẫu, không tạo block AI Dancing: người dùng xem N ảnh ghép trên FE rồi mới chạy aidancing.
// Server chỉ nghe 127.0.0.1: trên macOS, localhost ra ::1 và không kết nối được.
//
// CLI:
//   node ghep-nhieu-bo.mjs --clip clip.mp4 --face mat.png [--product a.jpg ...] [--do-bo] [--name "..."]
//     --do-bo thêm 1 nhánh: ChatGPT tự vẽ 1 bộ đồ bộ miền Tây, không cần ảnh sản phẩm.
//     --do-bo-image anh.jpg thêm 1 nhánh đồ bộ từ ảnh thật, đi qua bước tách sản phẩm như ảnh Shopee.
//     Mặc định block Ghép mẫu đưa người vào ảnh nền assets/background/nen-01-phong-khach-sofa-be.png.
//     --background nen.png dùng ảnh nền khác. --giu-nen giữ nền của clip.
//   node ghep-nhieu-bo.mjs --aidancing <workflowId> [--quality fast|quality] [--bo bo1 --bo do-bo ...]
//     --bo chỉ chạy AI Dancing cho block Ghép mẫu có nhãn này (bo1, bo2…, do-bo). Bỏ trống thì chạy mọi block.
//     Thêm 1 block AI Dancing sau mỗi block Ghép mẫu, rồi chạy song song từ các block đó. Lệnh này tốn credit.
//   node ghep-nhieu-bo.mjs --doan <ảnh 1> <đoạn 1.mp4> --doan <ảnh 2> <đoạn 2.mp4> ... [--quality fast|quality] [--name ..] [--out <thư mục>]
//     Mỗi cặp là 1 job AI Dancing song song, ảnh dùng thẳng, không qua ChatGPT. Đoạn lấy từ bien-hinh.mjs cat-mau. Tốn credit.

import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const SERVER = process.env.VIDEOFLOW_URL || 'http://127.0.0.1:3001';
// Script nằm ở <repo>/.claude/skills/aidancing-tiktok/scripts. Node đổi symlink ~/.claude/skills/... về đường dẫn thật trong repo.
const APP_DIR = path.resolve(import.meta.dirname, '..', '..', '..', '..', 'app');
const SHARED_DEFS = path.join(APP_DIR, 'packages', 'shared', 'src', 'node-defs.ts');
const DATA_DIR = path.join(APP_DIR, 'data');
const RUN_TIMEOUT_MS = 100 * 60_000;
const ROW = 520;

const EXTRACT_PROMPT = `Tách riêng sản phẩm trang phục trong ảnh đính kèm thành 1 ảnh sản phẩm mới.
- Chỉ giữ trang phục. Bỏ người mẫu, chữ, logo, giá, khung viền, sticker và mọi đồ vật khác.
- Trang phục đặt trên ma-nơ-canh vô hình, nhìn thẳng phía trước, thấy toàn bộ sản phẩm từ trên xuống dưới.
- GIỮ NGUYÊN 100% sản phẩm: màu sắc, chất liệu, hoa văn, cổ áo, dây áo, tay áo, độ dài, độ ôm, ren, nút, khoá, đường may.
- Nền trắng trơn, ánh sáng đều, ảnh chân thực.`;

// Người dùng yêu cầu ngày 2026-11-03: mỗi lần gửi link Shopee thì có thêm 1 clip đồ bộ, để dựng clip biến hình.
const DO_BO_PROMPT = `Tạo 1 ảnh sản phẩm: 1 bộ đồ bộ mặc nhà kiểu miền Tây Việt Nam, nhìn bình dân, quê mùa.
- Gồm áo cộc tay cổ bẻ có hàng nút phía trước và quần dài ống rộng, may cùng 1 loại vải.
- Vải tole mỏng, in hoa to sặc sỡ, kiểu đồ bộ bán ở chợ quê.
- Bộ đồ đặt trên ma-nơ-canh vô hình, nhìn thẳng phía trước, thấy toàn bộ áo và quần.
- Nền trắng trơn, ánh sáng đều, ảnh chân thực. Không người mẫu, không chữ, không logo.`;

// Người dùng yêu cầu ngày 2026-11-03: kiểu tóc chỉ là gợi ý cho GPT, và phải giữ nhận diện gương mặt.
const HAIR_AND_IDENTITY = `- Gợi ý: tạo kiểu tóc hợp với trang phục này, bạn tự chọn kiểu. Giữ nguyên độ dài và màu tóc của người mẫu: tóc dài thì chỉ tạo kiểu trên mái tóc dài đó, không cắt ngắn.
- GIỮ NGUYÊN 100% nhận diện gương mặt người mẫu đã ghi nhớ: hình dáng khuôn mặt, mắt, lông mày, mũi, môi, màu da. Đổi kiểu tóc không được làm thay đổi gương mặt.`;

// Người dùng yêu cầu ngày 2026-11-05: clip đồ bộ mở đầu clip biến hình, mặt mộc để khác rõ với các clip có trang điểm phía sau.
const MAT_MOC = `- Người mẫu để mặt mộc: không trang điểm, không son môi, không kẻ mắt, không phấn mắt, không má hồng, không mi giả. Da và môi giữ màu tự nhiên.
- Chỉ bỏ lớp trang điểm. Gương mặt vẫn là gương mặt người mẫu đã ghi nhớ.`;

// Người dùng yêu cầu ngày 2026-11-05: ảnh ghép đưa vào nền của người dùng, khung hình giữ đúng ảnh cũ, căn phòng đổi góc nhìn cho khớp.
// Prompt mặc định TRYON_DEFAULT_BG (lần chạy 2026-11-02) để GPT giữ góc máy của ảnh nền: người dời ra giữa và nhỏ đi, không khớp clip.
const DEFAULT_BACKGROUND = path.resolve(import.meta.dirname, '..', 'assets', 'background', 'nen-01-phong-khach-sofa-be.png');
const BG_PROMPT = `đưa nhân vật trong ảnh vừa tạo vào căn phòng trong ảnh đính kèm này.
- GIỮ NGUYÊN 100% khung hình của ảnh vừa tạo: tỉ lệ ảnh, kích thước nhân vật, vị trí nhân vật trong khung, chỗ khung cắt ngang người. Không zoom ra, không zoom vào, không dời nhân vật.
- GIỮ NGUYÊN 100% nhân vật: gương mặt, kiểu tóc, trang phục, tư thế, vị trí tay chân, vóc dáng.
- Góc máy lấy theo ảnh vừa tạo: hướng máy, độ cao máy, độ nghiêng, khoảng cách tới nhân vật. Vẽ lại căn phòng trong ảnh đính kèm theo đúng góc máy này. Được xoay và đổi góc nhìn căn phòng cho khớp.
- Từ ảnh đính kèm chỉ lấy nội dung căn phòng: đồ đạc, tường, sàn, cửa, đèn, màu sắc, ánh sáng. Không lấy góc máy và khung hình của ảnh đính kèm.
- Thay toàn bộ background cũ. Bỏ mọi chữ, khung bình luận, sticker và logo của ảnh vừa tạo.
- Ánh sáng và bóng đổ trên nhân vật khớp với căn phòng. Chân nhân vật đứng đúng trên sàn, có bóng đổ dưới chân. Ảnh chân thực, tự nhiên.`;

const slug = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();

const t0 = Date.now();
const step = (s) => console.log(`[${((Date.now() - t0) / 1000).toFixed(0)}s] ${s}`);

function parseArgs(argv) {
  const opts = { products: [], quality: 'fast', doBo: false, background: DEFAULT_BACKGROUND };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--product') opts.products.push(argv[++i]);
    else if (a === '--do-bo') opts.doBo = true;
    else if (a === '--giu-nen') opts.background = null;
    else if (a === '--background') opts.background = argv[++i];
    else if (a === '--do-bo-image') opts.doBoImage = argv[++i];
    else if (a === '--bo') (opts.bo ??= []).push(argv[++i]);
    else if (a === '--doan') (opts.doan ??= []).push({ image: argv[++i], clip: argv[++i] });
    else if (['--clip', '--face', '--name', '--aidancing', '--quality', '--out'].includes(a)) opts[a.slice(2)] = argv[++i];
    else throw new Error(`Không hiểu tham số: ${a}`);
  }
  if (opts.doan) {
    for (const { image, clip } of opts.doan) for (const f of [image, clip]) if (!f || !fs.existsSync(f)) throw new Error(`Không thấy file: ${f}`);
    return opts;
  }
  if (opts.aidancing) return opts;
  if (!opts.clip || !opts.face) throw new Error('Thiếu --clip hoặc --face');
  if (opts.products.length === 0 && !opts.doBo && !opts.doBoImage) throw new Error('Thiếu --product, --do-bo hoặc --do-bo-image');
  for (const f of [opts.clip, opts.face, ...opts.products, ...[opts.doBoImage, opts.background].filter(Boolean)]) {
    if (!fs.existsSync(f)) throw new Error(`Không thấy file: ${f}`);
  }
  return opts;
}

// Ô genPrompt của block thay toàn bộ prompt mặc định, nên lấy prompt mặc định từ mã nguồn để không lệch bản.
function defaultTryonGen() {
  const m = fs.readFileSync(SHARED_DEFS, 'utf8').match(/export const TRYON_DEFAULT_GEN = `([\s\S]*?)`;/);
  if (!m) throw new Error(`Không đọc được TRYON_DEFAULT_GEN trong ${SHARED_DEFS}`);
  return m[1];
}

async function api(method, url, json) {
  const res = await fetch(SERVER + url, {
    method,
    headers: json ? { 'content-type': 'application/json' } : undefined,
    body: json ? JSON.stringify(json) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${url} → HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

async function uploadAsset(file) {
  const form = new FormData();
  form.append('file', await fs.openAsBlob(file), path.basename(file));
  const res = await fetch(`${SERVER}/api/assets`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(`Tải ${file} lên server lỗi HTTP ${res.status}`);
  return res.json();
}

// Chờ qua WebSocket: server chỉ ghi run.json khi run kết thúc, và lỗi của từng block chỉ có trong sự kiện WS.
async function runAndWait(workflow, from, labels) {
  const ws = new WebSocket(`${SERVER.replace(/^http/, 'ws')}/ws`);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = () => reject(new Error('Không mở được WebSocket của server'));
  });
  const errors = [];
  const queued = [];
  let runId = null;
  let timer;
  let handle;
  const finished = new Promise((resolve) => {
    handle = (ev) => {
      if (ev.runId !== runId) return;
      if (ev.kind === 'node-status' && labels[ev.nodeId]) {
        step(`${labels[ev.nodeId]}: ${ev.status}${ev.error ? ` — ${ev.error}` : ''}`);
        if (ev.error) errors.push(`${labels[ev.nodeId]}: ${ev.error}`);
      }
      if (ev.kind === 'run-finished') resolve({ status: ev.status });
    };
    ws.onmessage = (m) => {
      const ev = JSON.parse(m.data);
      if (runId) handle(ev);
      else queued.push(ev);
    };
    ws.onclose = () => resolve({ status: 'disconnected' });
    timer = setTimeout(() => resolve({ status: 'timeout' }), RUN_TIMEOUT_MS);
  });
  ({ runId } = await api('POST', `/api/workflows/${workflow.id}/run`, from ? { from } : {}));
  step(`Run ${runId}`);
  queued.splice(0).forEach(handle);
  const r = await finished;
  clearTimeout(timer);
  ws.close();
  return { ...r, runId, errors };
}

// Server ghi kết quả vào workflow sau sự kiện run-finished, nên đọc lại vài lần tới khi có đủ kết quả.
async function savedAfterRun(id, nodeIds) {
  let wf;
  for (let i = 0; i < 20; i++) {
    wf = await api('GET', `/api/workflows/${id}`);
    if (nodeIds.every((nid) => wf.nodes.find((n) => n.id === nid)?.config.content)) break;
    await new Promise((r) => setTimeout(r, 500));
  }
  return wf;
}

const node = (type, x, y, config = {}) => ({ id: randomUUID(), type, position: { x, y }, config });
const edge = (source, target, port) => ({
  id: `xy-edge__${source}out-${target}${port}`,
  source: { nodeId: source, port: 'out' },
  target: { nodeId: target, port },
});

async function buildAndRunTryon(opts) {
  const wf = {
    id: randomUUID(),
    name: opts.name ?? `Shopee · ${path.basename(opts.clip, path.extname(opts.clip))} · ${new Date().toLocaleString('sv-SE').slice(0, 16)}`,
    nodes: [],
    edges: [],
  };
  const clip = node('video', 0, 0, { content: await uploadAsset(opts.clip) });
  const face = node('image', 0, ROW, { content: await uploadAsset(opts.face) });
  wf.nodes.push(clip, face);
  const bg = opts.background ? node('image', 0, ROW * 3, { content: await uploadAsset(opts.background) }) : null;
  if (bg) wf.nodes.push(bg);
  const bgConfig = bg ? { bgPrompt: BG_PROMPT } : {};
  const bgEdge = (tryon) => (bg ? [edge(bg.id, tryon.id, 'background')] : []);
  const branches = opts.products.map((file, i) => ({ file, tag: `bo${i + 1}`, title: `Bộ ${i + 1}` }));
  if (opts.doBoImage) branches.push({ file: opts.doBoImage, tag: 'do-bo', title: 'Đồ bộ' });
  const extract = node('text', 0, ROW * 2, { content: EXTRACT_PROMPT });
  if (branches.length) wf.nodes.push(extract);
  const genPrompt = `${defaultTryonGen()}\n${HAIR_AND_IDENTITY}`;
  const doBoGenPrompt = `${genPrompt}\n${MAT_MOC}`;
  const labels = {};
  for (const [i, { file, tag, title }] of branches.entries()) {
    const raw = node('image', 520, ROW * i, { content: await uploadAsset(file) });
    const outfit = node('image', 1040, ROW * i, { provider: 'chatgpt' });
    // vfLabel đặt tên file video ở bước --aidancing.
    const tryon = node('tryon', 1560, ROW * i, {
      provider: 'chatgpt',
      frameTime: 0,
      genPrompt: tag === 'do-bo' ? doBoGenPrompt : genPrompt,
      vfLabel: tag,
      ...bgConfig,
    });
    wf.nodes.push(raw, outfit, tryon);
    wf.edges.push(
      edge(extract.id, outfit.id, 'prompt'),
      edge(raw.id, outfit.id, 'image'),
      edge(face.id, tryon.id, 'face'),
      edge(outfit.id, tryon.id, 'outfit'),
      edge(clip.id, tryon.id, 'clip'),
      ...bgEdge(tryon),
    );
    labels[outfit.id] = `${title} · tách sản phẩm`;
    labels[tryon.id] = `${title} · Ghép mẫu`;
  }
  if (opts.doBo) {
    const y = ROW * branches.length;
    const prompt = node('text', 520, y, { content: DO_BO_PROMPT });
    const outfit = node('image', 1040, y, { provider: 'chatgpt' });
    const tryon = node('tryon', 1560, y, { provider: 'chatgpt', frameTime: 0, genPrompt: doBoGenPrompt, vfLabel: 'do-bo', ...bgConfig });
    wf.nodes.push(prompt, outfit, tryon);
    wf.edges.push(
      edge(prompt.id, outfit.id, 'prompt'),
      edge(face.id, tryon.id, 'face'),
      edge(outfit.id, tryon.id, 'outfit'),
      edge(clip.id, tryon.id, 'clip'),
      ...bgEdge(tryon),
    );
    labels[outfit.id] = 'Đồ bộ · tạo ảnh';
    labels[tryon.id] = 'Đồ bộ · Ghép mẫu';
  }
  await api('PUT', `/api/workflows/${wf.id}`, wf);
  step(`Workflow "${wf.name}": http://localhost:5173/editor/${wf.id}`);

  const r = await runAndWait(wf, null, labels);
  const saved = await savedAfterRun(wf.id, Object.keys(labels));
  for (const n of saved.nodes.filter((n) => labels[n.id])) {
    step(`${labels[n.id]}: ${n.config.content?.path ?? 'chưa có ảnh'}`);
  }
  if (r.status !== 'done') {
    throw new Error(`Run ${r.runId} kết thúc với trạng thái ${r.status}${r.errors.length ? `: ${r.errors.join(' | ')}` : ''}`);
  }
}

async function addAndRunAiDancing(opts) {
  const wf = await api('GET', `/api/workflows/${opts.aidancing}`);
  const clipId = wf.nodes.find((n) => n.type === 'video')?.id;
  const allTryons = wf.nodes.filter((n) => n.type === 'tryon');
  const tryons = opts.bo ? allTryons.filter((t) => opts.bo.includes(t.config.vfLabel)) : allTryons;
  if (opts.bo && tryons.length !== opts.bo.length) {
    throw new Error(`Không thấy block Ghép mẫu có nhãn ${opts.bo.join(', ')}. Nhãn có trong workflow: ${allTryons.map((t) => t.config.vfLabel).join(', ')}`);
  }
  if (!clipId || tryons.length === 0) throw new Error(`Workflow ${wf.id} không có block Clip hoặc Ghép mẫu`);
  const missing = tryons.filter((t) => !t.config.content);
  if (missing.length) throw new Error(`${missing.length} block Ghép mẫu chưa có ảnh ghép. Chạy lại phần Ghép mẫu trước.`);
  if (wf.nodes.some((n) => n.type === 'aidancing')) throw new Error(`Workflow ${wf.id} đã có block AI Dancing`);
  const labels = {};
  const fileTags = {};
  for (const [i, t] of tryons.entries()) {
    const d = node('aidancing', t.position.x + 520, t.position.y, { quality: opts.quality });
    wf.nodes.push(d);
    wf.edges.push(edge(t.id, d.id, 'image'), edge(clipId, d.id, 'video'));
    fileTags[d.id] = t.config.vfLabel ?? `bo${i + 1}`;
    labels[d.id] = fileTags[d.id] === 'do-bo' ? 'Đồ bộ · AI Dancing' : `Bộ ${i + 1} · AI Dancing`;
  }
  await api('PUT', `/api/workflows/${wf.id}`, wf);
  // Tab FE đang mở tự lưu bản cũ mỗi 5 giây và xoá block vừa thêm. Kiểm tra trước khi gửi job để không tốn credit vô ích.
  step('Chờ 15 giây để kiểm tra không có tab FE nào ghi đè workflow');
  await new Promise((r) => setTimeout(r, 15_000));
  const check = await api('GET', `/api/workflows/${wf.id}`);
  if (Object.keys(labels).some((id) => !check.nodes.some((n) => n.id === id))) {
    throw new Error(`Tab FE của workflow ${wf.id} đang mở và đã xoá block AI Dancing. Đóng tab FE rồi chạy lại. Chưa gửi job aidancing.`);
  }
  step(`Workflow: http://localhost:5173/editor/${wf.id}`);
  const r = await runAndWait(wf, Object.keys(labels), labels);
  // Đọc video từ outputs.json của run: tab FE mở từ trước khi thêm block tự lưu bản cũ và xoá block AI Dancing khỏi workflow.
  const stamp = new Date().toLocaleString('sv-SE').slice(0, 16).replace(/[ :]/g, '');
  // Video kết quả nằm trong <repo>/videos/aidancing/, git bỏ qua thư mục này. Người dùng yêu cầu ngày 2026-11-07.
  const outDir = path.resolve(APP_DIR, '..', 'videos', 'aidancing');
  fs.mkdirSync(outDir, { recursive: true });
  for (const id of Object.keys(labels)) {
    let video = null;
    try {
      video = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'runs', r.runId, id, 'outputs.json'), 'utf8')).out;
    } catch {}
    if (!video?.path) {
      step(`${labels[id]}: chưa có video`);
      continue;
    }
    const out = path.join(outDir, `aidancing-${slug(wf.name)}-${fileTags[id]}-${stamp}.mp4`);
    fs.copyFileSync(video.path, out);
    step(`${labels[id]}: ✓ ${out}`);
  }
  if (r.status !== 'done') {
    throw new Error(`Run ${r.runId} kết thúc với trạng thái ${r.status}${r.errors.length ? `: ${r.errors.join(' | ')}` : ''}`);
  }
}

// --doan <ảnh>:<clip> ...: mỗi cặp là 1 job AI Dancing, ảnh đã sẵn (ảnh ghép, hoặc khung lấy từ clip có sẵn bộ đồ).
// Dùng cho cách chạy theo đoạn của bien-hinh.mjs cat-mau. Không qua ChatGPT. Tốn credit: Claude báo và chờ đồng ý trước.
async function runSegments(opts) {
  const wf = { id: randomUUID(), name: opts.name ?? `Đoạn · ${new Date().toLocaleString('sv-SE').slice(0, 16)}`, nodes: [], edges: [] };
  const labels = {};
  const fileTags = {};
  for (const [i, { image, clip }] of opts.doan.entries()) {
    const img = node('image', 0, ROW * i, { content: await uploadAsset(image) });
    const vid = node('video', 520, ROW * i, { content: await uploadAsset(clip) });
    const d = node('aidancing', 1040, ROW * i, { quality: opts.quality });
    wf.nodes.push(img, vid, d);
    wf.edges.push(edge(img.id, d.id, 'image'), edge(vid.id, d.id, 'video'));
    fileTags[d.id] = `doan${i + 1}`;
    labels[d.id] = `Đoạn ${i + 1} · AI Dancing`;
  }
  await api('PUT', `/api/workflows/${wf.id}`, wf);
  step(`Workflow "${wf.name}": http://localhost:5173/editor/${wf.id}`);
  const r = await runAndWait(wf, null, labels);
  const stamp = new Date().toLocaleString('sv-SE').slice(0, 16).replace(/[ :]/g, '');
  const outDir = opts.out ?? path.resolve(APP_DIR, '..', 'videos', 'aidancing');
  fs.mkdirSync(outDir, { recursive: true });
  for (const id of Object.keys(labels)) {
    let video = null;
    try {
      video = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'runs', r.runId, id, 'outputs.json'), 'utf8')).out;
    } catch {}
    if (!video?.path) {
      step(`${labels[id]}: chưa có video`);
      continue;
    }
    const out = path.join(outDir, `aidancing-${slug(wf.name)}-${fileTags[id]}-${stamp}.mp4`);
    fs.copyFileSync(video.path, out);
    step(`${labels[id]}: ✓ ${out}`);
  }
  if (r.status !== 'done') {
    throw new Error(`Run ${r.runId} kết thúc với trạng thái ${r.status}${r.errors.length ? `: ${r.errors.join(' | ')}` : ''}`);
  }
}

const opts = parseArgs(process.argv.slice(2));
if (!(await fetch(`${SERVER}/health`).then((r) => r.ok, () => false))) {
  throw new Error('Server video-flow chưa chạy. Chạy: cd ~/video-flow/app && npm run dev:server');
}
if (opts.doan) await runSegments(opts);
else if (opts.aidancing) await addAndRunAiDancing(opts);
else await buildAndRunTryon(opts);
