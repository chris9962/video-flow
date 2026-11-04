#!/usr/bin/env node
// Chạy chuỗi Ghép mẫu → AI Dancing của video-flow qua API của server, rồi chép video kết quả ra thư mục Videos.
// Đo ngày 2026-11-03 trên workflow mẫu "Ghép mẫu từ clip nhảy".
// Server chỉ nghe 127.0.0.1: trên macOS, localhost ra ::1 và không kết nối được.
//
// CLI:
//   node chay-workflow.mjs --face mat.png --clip clip.mp4 [--outfit ao.png] [--quality quality|fast] [--out video.mp4] [--dry-run]
//   --dry-run kiểm tra input và in chi phí dự kiến. Lệnh không tạo workflow, không gọi ChatGPT, không gọi aidancing.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const SERVER = process.env.VIDEOFLOW_URL || 'http://127.0.0.1:3001';
// Script nằm ở <repo>/.claude/skills/aidancing-tiktok/scripts. Node đổi symlink ~/.claude/skills/... về đường dẫn thật trong repo.
const DATA_DIR = path.resolve(import.meta.dirname, '..', '..', '..', '..', 'app', 'data');
const TEMPLATE_ID = 'b45b8398-7002-47a1-86e0-5aaa4c604587';
const DURATIONS = [10, 15, 20, 25];
const CREDIT_PER_SECOND = { quality: 0.22, fast: 0.11 };
const RUN_TIMEOUT_MS = 100 * 60_000;

const t0 = Date.now();
const step = (s) => console.log(`[${((Date.now() - t0) / 1000).toFixed(0)}s] ${s}`);

function parseArgs(argv) {
  const opts = { quality: 'quality', dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') opts.dryRun = true;
    else if (['--face', '--outfit', '--clip', '--quality', '--out'].includes(a)) opts[a.slice(2)] = argv[++i];
    else throw new Error(`Không hiểu tham số: ${a}`);
  }
  if (!opts.face || !opts.clip) throw new Error('Thiếu --face hoặc --clip');
  if (!(opts.quality in CREDIT_PER_SECOND)) throw new Error('--quality chỉ nhận quality hoặc fast');
  for (const key of ['face', 'outfit', 'clip']) {
    if (opts[key] && !fs.existsSync(opts[key])) throw new Error(`Không thấy file --${key}: ${opts[key]}`);
  }
  return opts;
}

// Giống pickDuration trong apps/server/src/nodes/aidancing.ts: gói nhỏ nhất đủ dài cho clip.
function pickDuration(sec) {
  return DURATIONS.find((d) => d >= Math.ceil(sec - 0.05)) ?? 25;
}

function probeClip(file) {
  const out = execFileSync(
    'ffprobe',
    ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:format=duration', '-of', 'json', file],
    { timeout: 30_000 },
  );
  const j = JSON.parse(out);
  return { width: j.streams[0].width, height: j.streams[0].height, duration: Number(j.format.duration) };
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

async function waitHealth() {
  for (let i = 0; i < 60; i++) {
    if (await fetch(`${SERVER}/health`).then((r) => r.ok, () => false)) return;
    await new Promise((r) => setTimeout(r, 2_000));
  }
  throw new Error('Server video-flow không chạy lại sau 2 phút. Chạy: cd ~/video-flow/app && npm run dev:server');
}

function readOutput(runId, nodeId) {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'runs', runId, nodeId, 'outputs.json'), 'utf8')).out ?? null;
  } catch {
    return null;
  }
}

// Chờ qua WebSocket: server chỉ ghi run.json khi run kết thúc, và lỗi của từng block chỉ có trong sự kiện WS.
async function runAndWait(workflow, from) {
  const names = Object.fromEntries(workflow.nodes.map((n) => [n.id, n.type]));
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
      if (ev.kind === 'node-status') {
        step(`${names[ev.nodeId] ?? ev.nodeId}: ${ev.status}${ev.error ? ` — ${ev.error}` : ''}`);
        if (ev.error) errors.push(`${names[ev.nodeId]}: ${ev.error}`);
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
  step(`Run ${runId}${from ? ` (chạy từ block ${names[from]})` : ''}`);
  queued.splice(0).forEach(handle);
  const r = await finished;
  clearTimeout(timer);
  ws.close();
  return { ...r, runId, errors };
}

const opts = parseArgs(process.argv.slice(2));
if (!(await fetch(`${SERVER}/health`).then((r) => r.ok, () => false))) {
  throw new Error('Server video-flow chưa chạy. Chạy: cd ~/video-flow/app && npm run dev:server');
}

const clip = probeClip(opts.clip);
step(`Clip ${clip.width}×${clip.height}, ${clip.duration.toFixed(2)} giây`);
if (clip.duration >= 60) throw new Error('aidancing.net chỉ nhận video dưới 60 giây');
if (fs.statSync(opts.clip).size >= 90 * 1024 * 1024) throw new Error('aidancing.net chỉ nhận video dưới 90 MB');
if (clip.duration > 25) console.warn('Cảnh báo: clip dài hơn 25 giây, gói lớn nhất của aidancing là 25 giây');
if (Math.abs(clip.width / clip.height - 9 / 16) > 0.01) console.warn('Cảnh báo: clip không phải 9:16');
const seconds = pickDuration(clip.duration);
const cost = +(seconds * CREDIT_PER_SECOND[opts.quality]).toFixed(2);
step(`aidancing: gói ${seconds} giây, ${opts.quality}, ${cost} credit`);

const template = await api('GET', `/api/workflows/${TEMPLATE_ID}`);
const tryon = template.nodes.find((n) => n.type === 'tryon');
const dancing = template.nodes.find((n) => n.type === 'aidancing');
const ports = Object.fromEntries(
  template.edges.filter((e) => e.target.nodeId === tryon?.id).map((e) => [e.target.port, e.source.nodeId]),
);
if (!dancing || !ports.face || !ports.outfit || !ports.clip) {
  throw new Error(`Workflow mẫu ${TEMPLATE_ID} không còn đủ block Ghép mẫu, AI Dancing và 3 cổng face, outfit, clip`);
}

if (opts.dryRun) {
  step('Dry run: dừng trước khi tạo workflow. Lệnh chưa gọi ChatGPT, chưa gọi aidancing.');
  process.exit(0);
}

const base = path.basename(opts.clip, path.extname(opts.clip));
const stamp = new Date().toLocaleString('sv-SE').slice(0, 16);
const wf = structuredClone(template);
wf.id = randomUUID();
wf.name = `TikTok · ${base} · ${stamp}`;
const setContent = (nodeId, ref) => {
  const node = wf.nodes.find((n) => n.id === nodeId);
  node.config = { ...node.config, content: ref };
};
setContent(ports.face, await uploadAsset(opts.face));
setContent(ports.clip, await uploadAsset(opts.clip));
if (opts.outfit) setContent(ports.outfit, await uploadAsset(opts.outfit));
else {
  wf.nodes = wf.nodes.filter((n) => n.id !== ports.outfit);
  wf.edges = wf.edges.filter((e) => e.source.nodeId !== ports.outfit);
}
const dancingNode = wf.nodes.find((n) => n.id === dancing.id);
dancingNode.config = { ...dancingNode.config, quality: opts.quality };
await api('PUT', `/api/workflows/${wf.id}`, wf);
step(`Workflow "${wf.name}": http://localhost:5173/editor/${wf.id}`);

let r = await runAndWait(wf);
let tryonRunId = r.runId;
for (let attempt = 0; r.status === 'disconnected' && attempt < 3; attempt++) {
  // tsx watch khởi động lại server khi file server đổi, và run đang chạy dừng theo.
  // Ảnh ghép đã có thì chỉ chạy lại AI Dancing với đúng file ảnh đó: service aidancing nhận ra cùng input
  // và theo dõi tiếp job cũ, không trừ credit lần 2. Chạy lại cả chuỗi thì ChatGPT tạo ảnh khác, aidancing tạo job mới.
  step('Mất kết nối server, chờ server chạy lại');
  await waitHealth();
  if (readOutput(r.runId, dancing.id)) {
    r = { ...r, status: 'done' };
    break;
  }
  const composite = readOutput(tryonRunId, tryon.id);
  if (composite) {
    setContent(tryon.id, composite);
    await api('PUT', `/api/workflows/${wf.id}`, wf);
    r = await runAndWait(wf, dancing.id);
  } else {
    r = await runAndWait(wf);
    tryonRunId = r.runId;
  }
}
if (r.status !== 'done') {
  throw new Error(`Run ${r.runId} kết thúc với trạng thái ${r.status}${r.errors.length ? `: ${r.errors.join(' | ')}` : ''}`);
}

const video = readOutput(r.runId, dancing.id);
const composite = readOutput(tryonRunId, tryon.id);
if (!video) throw new Error(`Run ${r.runId} xong nhưng không có video của block AI Dancing`);
const out = opts.out ?? path.join(os.homedir(), 'Desktop', 'Mẫu', 'Videos', `aidancing-${base}-${stamp.replace(/[ :]/g, '')}.mp4`);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.copyFileSync(video.path, out);
if (composite) fs.copyFileSync(composite.path, out.replace(/\.mp4$/i, '-anh-ghep.png'));
step(`✓ Video: ${out}`);
