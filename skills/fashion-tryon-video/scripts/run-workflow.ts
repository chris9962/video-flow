/**
 * Workflow Engine — step-by-step execution
 *
 * Modes:
 *   # Chạy toàn bộ (song song video)
 *   npx tsx run-workflow.ts <workflow.json> <person> <clothing>
 *
 *   # Chạy từng node, dừng review sau mỗi node
 *   npx tsx run-workflow.ts <workflow.json> <person> <clothing> --step
 *
 *   # Chạy đúng 1 node (dùng state.json từ run trước)
 *   npx tsx run-workflow.ts <workflow.json> <person> <clothing> --node img_extracted
 *
 *   # Resume từ node bị lỗi/bỏ qua
 *   npx tsx run-workflow.ts <workflow.json> <person> <clothing> --from video_walk
 *
 * State lưu tại <outDir>/state.json — resume được sau khi tắt
 */

import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import readline from 'readline';
// pilot.ts sống ở ~/hermes_workspace/browser-pilot/ — import tuyệt đối để chạy
// được dù cwd ở đâu (script này nằm trong skill, không cùng thư mục pilot).
const PILOT_PATH = process.env.PILOT_PATH
  ?? path.join(os.homedir(), 'hermes_workspace', 'browser-pilot', 'pilot.ts');
const { geminiGenerateImage, geminiSendPrompt, flowGenerateVideo, klingGenerateVideo, grokGenerateVideo }
  = await import(PILOT_PATH);

// ─── Types ───────────────────────────────────────────────────────────────────

interface TextNode  { id: string; type: 'text'; content: string; }
interface ImageNode { id: string; type: 'image'; provider?: 'gemini'|'chatgpt'; source?: string; output?: string; }
interface VideoNode { id: string; type: 'video'; provider: 'flow'|'kling'|'grok'; output: string;
  config: { model: string; durationSeconds: number; aspectRatio: string; }; }
type WFNode = TextNode | ImageNode | VideoNode;
interface Edge { id: string; source: { nodeId: string; port: string }; target: { nodeId: string; port: string }; }
interface Workflow { id: string; name: string; inputs: Record<string,string>; nodes: WFNode[]; edges: Edge[]; }
interface State { results: Record<string, string>; completed: string[]; skipped: string[]; }

// ─── Helpers ─────────────────────────────────────────────────────────────────

function topoSort(nodes: WFNode[], edges: Edge[]): WFNode[] {
  const deg = new Map(nodes.map(n => [n.id, 0]));
  for (const e of edges) deg.set(e.target.nodeId, (deg.get(e.target.nodeId) ?? 0) + 1);
  const q = nodes.filter(n => (deg.get(n.id) ?? 0) === 0);
  const out: WFNode[] = [];
  while (q.length) {
    const n = q.shift()!; out.push(n);
    for (const e of edges.filter(e => e.source.nodeId === n.id)) {
      const d = (deg.get(e.target.nodeId) ?? 1) - 1;
      deg.set(e.target.nodeId, d);
      if (d === 0) q.push(nodes.find(x => x.id === e.target.nodeId)!);
    }
  }
  return out;
}

async function ask(q: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(res => rl.question(q, ans => { rl.close(); res(ans.trim()); }));
}

async function saveState(outDir: string, state: State) {
  await fs.writeFile(path.join(outDir, 'state.json'), JSON.stringify(state, null, 2));
}

async function loadState(outDir: string): Promise<State | null> {
  try {
    const raw = await fs.readFile(path.join(outDir, 'state.json'), 'utf8');
    return JSON.parse(raw);
  } catch { return null; }
}

// ─── Quality gate (QC ảnh try-on bằng Gemini vision trước khi tạo video) ──────

async function qcTryon(tryonImg: string, clothingRef: string, threshold: number)
  : Promise<{ score: number; reason: string; pass: boolean }> {
  const prompt = `You are a STRICT fashion QA inspector for a virtual try-on pipeline.
Image 1 = the PERSON wearing the generated outfit (try-on result).
Image 2 = the TARGET garment the person is SUPPOSED to be wearing.

Compare ruthlessly. Penalize ANY mismatch in:
- color/shade (wrong hue = major fail)
- pattern/print/logo (missing or altered = major fail)
- fabric texture & material
- cut/silhouette/length/neckline/sleeves/hem shape
- missing or extra garment pieces
Do NOT be generous. If you are unsure it matches, score lower.

Reply with ONLY one line of compact JSON, nothing else:
{"score": <integer 0-100>, "reason": "<short reason in Vietnamese, max 18 words>"}

Scale: 90-100 nearly identical · 70-89 good, minor diffs · 50-69 noticeable mismatch · <50 wrong garment.`;

  const reply = await geminiSendPrompt(prompt, [tryonImg, clothingRef]);
  let score = NaN, reason = reply.replace(/\s+/g, ' ').slice(0, 120);
  const m = reply.match(/\{[^{}]*"score"[^{}]*\}/);
  if (m) { try { const o = JSON.parse(m[0]); score = Number(o.score); reason = String(o.reason ?? reason); } catch {} }
  if (Number.isNaN(score)) { const n = reply.match(/\b(\d{1,3})\b/); if (n) score = Number(n[1]); }
  return { score, reason, pass: score >= threshold };
}

// Chạy 1 lần ngay trước video đầu tiên. true = cho phép tạo video, false = dừng.
// mode: 'halt'    = dừng & in path ảnh để AGENT soi bằng vision (MẶC ĐỊNH)
//       'auto-qc' = Gemini tự chấm điểm, tự quyết (cho chạy nền không người coi)
//       'manual'  = hỏi stdin (Enter/q) — duyệt thủ công trong terminal
async function videoGate(
  wf: Workflow, sorted: WFNode[], results: Map<string, string>,
  clothingFallback: string, threshold: number, mode: 'halt'|'auto-qc'|'manual',
): Promise<boolean> {
  const videoNodes = sorted.filter(n => n.type === 'video');
  const tryonIds = new Set<string>();
  for (const v of videoNodes)
    for (const e of wf.edges.filter(e => e.target.nodeId === v.id && (e.target.port === 'start' || e.target.port === 'end')))
      tryonIds.add(e.source.nodeId);

  const clothingNode = wf.nodes.find(n => n.type === 'image' && /clothing|extract/i.test(n.id) && results.get(n.id));
  const clothingRef = (clothingNode && results.get(clothingNode.id)) || clothingFallback;

  console.log(`\n🚦 QUALITY GATE — ${videoNodes.length} video sắp tạo (phần tốn credit Flow)`);
  console.log(`   Đồ tham chiếu: ${clothingRef}`);

  // ── MẶC ĐỊNH: dừng để agent (hoặc người) soi ảnh bằng vision ──
  if (mode === 'halt') {
    console.log(`\n   📂 Ảnh cần review (đưa cho agent soi bằng vision rồi quyết):`);
    console.log(`      Đồ gốc : ${clothingRef}`);
    for (const id of tryonIds) { const img = results.get(id); if (img) console.log(`      ${id} : ${img}`); }
    console.log(`\n   → Ảnh OK  → resume tạo video : --from ${videoNodes[0]?.id} --force-video`);
    console.log(`   → Ảnh xấu → sửa rồi gen lại  : --node img_tryon_1`);
    return false;
  }

  // ── MANUAL: hỏi trong terminal ──
  if (mode === 'manual') {
    console.log(`\n   📂 Đồ gốc: ${clothingRef}`);
    for (const id of tryonIds) { const img = results.get(id); if (img) console.log(`      ${id} : ${img}`); }
    const ans = await ask(`\n▶ Ảnh try-on OK? Tạo ${videoNodes.length} video Flow? [Enter=yes / q=dừng] `);
    return ans.toLowerCase() !== 'q';
  }

  // ── AUTO-QC: Gemini tự chấm (chạy nền) ──
  let worst = 100;
  for (const id of tryonIds) {
    const img = results.get(id);
    if (!img) continue;
    process.stdout.write(`   🔍 QC ${id} ... `);
    try {
      const r = await qcTryon(img, clothingRef, threshold);
      console.log(`${r.score}/100 ${r.pass ? '✅' : '❌'}  — ${r.reason}`);
      worst = Math.min(worst, r.score);
    } catch (e) {
      console.log(`⚠️ QC lỗi (${e instanceof Error ? e.message : e}) — bỏ qua ảnh này`);
    }
  }
  console.log(`   → Điểm khớp thấp nhất: ${worst}/100 (ngưỡng ${threshold})`);

  if (worst < threshold) {
    console.log(`\n❌ QC FAIL: ảnh try-on chưa khớp đồ gốc (${worst} < ${threshold}).`);
    console.log(`   KHÔNG tạo video để khỏi tốn credit Flow.`);
    console.log(`\n   📂 Ảnh để review (mở xem hoặc đưa cho agent soi lại bằng vision):`);
    console.log(`      Đồ gốc : ${clothingRef}`);
    for (const id of tryonIds) { const img = results.get(id); if (img) console.log(`      ${id} : ${img}`); }
    console.log(`\n   → Sửa bước try-on (đổi prompt/ảnh) rồi chạy lại: --node img_tryon_1`);
    console.log(`   → Ảnh đã ưng rồi mà vẫn muốn ép tạo: thêm cờ --force-video`);
    return false;
  }
  return true;
}

// ─── Execute 1 node ──────────────────────────────────────────────────────────

async function execNode(node: WFNode, wf: Workflow, results: Map<string, string>, outDir: string): Promise<string | null> {
  const inEdges = wf.edges.filter(e => e.target.nodeId === node.id);
  const get = (port: string) => results.get(inEdges.find(e => e.target.port === port)?.source.nodeId ?? '');

  if (node.type === 'text') {
    return (node as TextNode).content;
  }

  if (node.type === 'image') {
    const n = node as ImageNode;
    if (n.source) return results.get(node.id) ?? null; // input node, đã seed

    const prompt = get('prompt') ?? '';
    const images = inEdges.filter(e => e.target.port === 'image').map(e => results.get(e.source.nodeId)).filter(Boolean) as string[];
    const outFile = path.join(outDir, n.output ?? `${n.id}.png`);

    console.log(`\n  📷 [image/${n.provider}] ${n.id}`);
    console.log(`     prompt: "${prompt.slice(0, 80)}..."`);
    console.log(`     images: ${images.length} ảnh`);
    console.log(`     output: ${outFile}`);

    if (n.provider === 'gemini') {
      await geminiGenerateImage(prompt, images, outFile);
    }
    return outFile;
  }

  if (node.type === 'video') {
    const n = node as VideoNode;
    const prompt   = get('prompt') ?? '';
    const startImg = get('start');
    const endImg   = get('end');
    const outFile  = path.join(outDir, n.output);

    console.log(`\n  🎬 [video/${n.provider}] ${n.id}`);
    console.log(`     model   : ${n.config.model} | ${n.config.durationSeconds}s | ${n.config.aspectRatio}`);
    console.log(`     prompt  : "${prompt.slice(0, 80)}..."`);
    console.log(`     start   : ${startImg ?? 'none'}`);
    console.log(`     output  : ${outFile}`);

    if (n.provider === 'flow') {
      await flowGenerateVideo({ prompt, imagePath: startImg, endImagePath: endImg,
        model: n.config.model, durationSeconds: n.config.durationSeconds,
        aspectRatio: n.config.aspectRatio, outFile });
    } else if (n.provider === 'kling') {
      await klingGenerateVideo({ prompt, imagePath: startImg, endImagePath: endImg,
        durationSeconds: n.config.durationSeconds, aspectRatio: n.config.aspectRatio, outFile });
    } else if (n.provider === 'grok') {
      await grokGenerateVideo({ prompt, imagePath: startImg, aspectRatio: n.config.aspectRatio, outFile });
    }
    return outFile;
  }

  return null;
}

// ─── Main ────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const wfFile       = args[0];
const personImage  = args[1];
const clothingImage = args[2];
const stepMode     = args.includes('--step');
const nodeIdx      = args.indexOf('--node');
const fromIdx      = args.indexOf('--from');
const nodeArg      = nodeIdx >= 0 ? args[nodeIdx + 1] as string | undefined : undefined;
const fromArg      = fromIdx >= 0 ? args[fromIdx + 1] as string | undefined : undefined;
const qcThIdx      = args.indexOf('--qc-threshold');
const qcThVal      = qcThIdx >= 0 ? args[qcThIdx + 1] : undefined;
const outDirArg    = args.find(a => !a.startsWith('--') && a !== wfFile && a !== personImage && a !== clothingImage && a !== qcThVal);
const forceVideo   = args.includes('--force-video');  // bỏ qua gate, ép tạo video
const manualGate   = args.includes('--gate');         // dừng hỏi stdin trước video
const autoQc       = args.includes('--auto-qc');      // Gemini tự chấm (chạy nền)
const qcThreshold  = Number(qcThVal) || 72;
// Mặc định = 'halt': dừng & in path ảnh để agent soi bằng vision rồi quyết.
const gateMode: 'halt'|'auto-qc'|'manual' = manualGate ? 'manual' : autoQc ? 'auto-qc' : 'halt';

if (!wfFile || !personImage || !clothingImage) {
  console.error(`Usage:
  npx tsx run-workflow.ts <workflow.json> <person> <clothing> [options]

Options:
  --step                Hỏi review sau mỗi node
  --node <id>           Chỉ chạy 1 node
  --from <id>           Resume từ node này
  --force-video         Bỏ qua gate, ép tạo video (dùng khi ảnh đã ưng)

Quality gate (chạy 1 lần trước phase video — phần tốn credit Flow):
  (mặc định)            HALT: dừng & in path ảnh try-on để AGENT soi bằng vision
  --gate                MANUAL: hỏi stdin Enter/q ngay trong terminal
  --auto-qc             AUTO: Gemini tự chấm điểm khớp đồ, tự quyết (chạy nền)
  --qc-threshold <n>    Ngưỡng pass cho --auto-qc (mặc định 72)`);
  process.exit(1);
}

const wf: Workflow  = JSON.parse(await fs.readFile(wfFile, 'utf8'));
const sessionId     = process.env.HERMES_SESSION_ID ?? new Date().toISOString().slice(0, 10);
const outDir        = outDirArg ?? path.join(os.homedir(), 'hermes_workspace', 'videos', sessionId, `${wf.id}-${Date.now()}`);
await fs.mkdir(outDir, { recursive: true });

console.log(`\n🎬 ${wf.name}  [${stepMode ? 'STEP' : nodeArg ? `NODE:${nodeArg}` : fromArg ? `FROM:${fromArg}` : 'AUTO'}]`);
console.log(`   Person  : ${personImage}`);
console.log(`   Outfit  : ${clothingImage}`);
console.log(`   Output  : ${outDir}\n`);

// Load state cũ nếu có (resume)
const prevState = await loadState(outDir);
const state: State = prevState ?? { results: {}, completed: [], skipped: [] };
const results = new Map<string, string>(Object.entries(state.results));

// Seed inputs
for (const node of wf.nodes) {
  if (node.type === 'image' && (node as ImageNode).source === 'person')   results.set(node.id, personImage);
  if (node.type === 'image' && (node as ImageNode).source === 'clothing') results.set(node.id, clothingImage);
}

const sorted = topoSort(wf.nodes, wf.edges);
let fromReached = !fromArg; // nếu không có --from thì chạy từ đầu
let gateRun = false;        // gate chỉ chạy 1 lần trước video đầu tiên

for (const node of sorted) {
  // Skip text + input nodes (không cần review)
  if (node.type === 'text') { const v = await execNode(node, wf, results, outDir); if (v) results.set(node.id, v); continue; }
  if (node.type === 'image' && (node as ImageNode).source) continue;

  // --from: skip cho đến khi gặp node đó
  if (fromArg && !fromReached) {
    if (node.id === fromArg) fromReached = true;
    else { console.log(`  ⏭  skip ${node.id} (chờ --from ${fromArg})`); continue; }
  }

  // --node: chỉ chạy 1 node duy nhất
  if (nodeArg && node.id !== nodeArg) continue;

  // Đã completed ở lần trước → dùng lại kết quả cũ
  if (state.completed.includes(node.id) && results.get(node.id)) {
    console.log(`  ✅ ${node.id} (cached: ${results.get(node.id)})`);
    continue;
  }

  // 🚦 GATE: trước video đầu tiên, QC ảnh try-on. Fail → dừng, khỏi tốn credit.
  if (node.type === 'video' && !gateRun && !forceVideo) {
    gateRun = true;
    const ok = await videoGate(wf, sorted, results, clothingImage, qcThreshold, gateMode);
    if (!ok) {
      console.log(`\n🛑 Dừng trước phase video. Ảnh trung gian đã lưu — resume sau bằng:`);
      console.log(`   npx tsx run-workflow.ts <wf> <person> <clothing> --from ${node.id} --force-video`);
      break;
    }
    console.log(`✅ Gate PASS — tiến hành tạo video.\n`);
  }

  // Step mode: hỏi trước khi chạy
  if (stepMode) {
    const ans = await ask(`\n▶ Chạy node [${node.id}] (${node.type})? [Enter=yes / s=skip / q=quit] `);
    if (ans === 'q') { console.log('👋 Dừng.'); break; }
    if (ans === 's') {
      state.skipped.push(node.id);
      await saveState(outDir, state);
      console.log(`  ⏭  ${node.id} skipped`);
      continue;
    }
  }

  // Chạy node
  try {
    const result = await execNode(node, wf, results, outDir);
    if (result) {
      results.set(node.id, result);
      state.results[node.id] = result;
      state.completed.push(node.id);
      await saveState(outDir, state);
      console.log(`  ✅ ${node.id} → ${result}`);
    }

    // Step mode: review sau khi xong
    if (stepMode && node.type !== 'text') {
      const ans = await ask(`  👀 Review xong? [Enter=tiếp / r=retry / q=quit] `);
      if (ans === 'q') { console.log('👋 Dừng. Resume bằng --from ' + node.id); break; }
      if (ans === 'r') {
        // Retry: xóa khỏi completed, chạy lại
        state.completed = state.completed.filter(id => id !== node.id);
        delete state.results[node.id];
        results.delete(node.id);
        await saveState(outDir, state);
        console.log(`  🔄 Retry ${node.id}...`);
        const r2 = await execNode(node, wf, results, outDir);
        if (r2) { results.set(node.id, r2); state.results[node.id] = r2; state.completed.push(node.id); await saveState(outDir, state); }
      }
    }
  } catch (err) {
    console.error(`  ❌ ${node.id} lỗi: ${err instanceof Error ? err.message : err}`);
    if (stepMode) {
      const ans = await ask(`  Tiếp tục workflow? [Enter=yes / q=quit] `);
      if (ans === 'q') break;
    }
  }
}

console.log(`\n📁 State: ${path.join(outDir, 'state.json')}`);
console.log(`📁 Output: ${outDir}`);
process.exit(0);
