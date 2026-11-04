#!/usr/bin/env node
// Chuỗi clip nối tiếp theo plan.json: tạo từng clip trên Flow, trích khung cuối thật để nối,
// ghép crossfade + tăng tốc, đo scene score ở điểm nối.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const USAGE = `Cách dùng:
  node chain.mjs status <plan.json>
  node chain.mjs images <plan.json> [K02.png] [--force]
  node chain.mjs upload <plan.json> <clipId>
  node chain.mjs gen    <plan.json> <clipId> [--force] [--dry-run]
  node chain.mjs join   <plan.json>
  node chain.mjs check  <plan.json | video.mp4> [--threshold 0.07] [--seams 7.9,15.8] [--crop w:h:x:y]
  node chain.mjs scenes <video> [--threshold 0.15] [--crop w:h:x:y]`;

function die(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

function run(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 1 << 28 });
  if (r.error) die(`Không chạy được ${cmd}: ${r.error.message}`);
  if (r.status !== 0) die(`${cmd} lỗi: ${(r.stderr || '').trim().split('\n').slice(-3).join(' | ')}`);
  return r.stdout;
}

function parseArgs(argv) {
  const pos = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const v = argv[i];
    if (!v.startsWith('--')) {
      pos.push(v);
      continue;
    }
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith('--')) {
      flags[v.slice(2)] = next;
      i++;
    } else {
      flags[v.slice(2)] = true;
    }
  }
  return { pos, flags };
}

function loadPlan(planPath) {
  const abs = path.resolve(planPath);
  if (!fs.existsSync(abs)) die(`Không thấy plan: ${abs}`);
  let plan;
  try {
    plan = JSON.parse(fs.readFileSync(abs, 'utf8'));
  } catch (e) {
    die(`plan.json sai cú pháp JSON: ${e.message}`);
  }
  if (!Array.isArray(plan.clips) || plan.clips.length === 0) die('plan.json phải có mảng "clips" không rỗng.');
  const ids = new Set();
  plan.clips.forEach((c, i) => {
    if (!c.id) die(`Clip thứ ${i + 1} thiếu "id".`);
    if (ids.has(c.id)) die(`Trùng id clip: ${c.id}`);
    ids.add(c.id);
    if (!c.prompt) die(`Clip ${c.id} thiếu "prompt".`);
    if (i === 0 && c.start === '@prev') die('Clip đầu tiên không có clip trước — "start" phải là một ảnh khung.');
  });
  const dir = path.dirname(abs);
  return {
    plan,
    dir,
    aspect: plan.aspect || '9:16',
    model: plan.model || 'omni-flash',
    duration: plan.duration || 6,
    quality: plan.quality || '720p',
    download: plan.download || '1080p',
    clipsDir: path.join(dir, 'clips'),
    framesDir: path.join(dir, 'frames'),
    inputDir: path.join(dir, 'input'),
  };
}

const clipFile = (P, id) => path.join(P.clipsDir, `${id}.mp4`);
const firstFrame = (P, id) => path.join(P.framesDir, `${id}_first.png`);
const lastFrame = (P, id) => path.join(P.framesDir, `${id}_last.png`);

function probe(file) {
  const out = run('ffprobe', [
    '-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=duration,r_frame_rate,width,height:format=duration',
    '-of', 'json', file,
  ]);
  const j = JSON.parse(out);
  const s = j.streams?.[0] ?? {};
  const [num, den] = (s.r_frame_rate || '24/1').split('/').map(Number);
  return {
    duration: Number(s.duration || j.format?.duration || 0),
    fpsStr: s.r_frame_rate || '24/1',
    fps: num / (den || 1),
    width: s.width,
    height: s.height,
  };
}

// Tên file chứa hash nội dung: thư viện media của Flow giữ asset cũ, tìm tile theo tên
// sẽ chọn nhầm ảnh cũ nếu tên trùng mà nội dung khác.
function fitAspect(P, src, label) {
  if (!fs.existsSync(src)) die(`Không thấy ảnh: ${src}`);
  const hash = crypto.createHash('sha1').update(fs.readFileSync(src)).digest('hex').slice(0, 8);
  fs.mkdirSync(P.inputDir, { recursive: true });
  const out = path.join(P.inputDir, `${label}_${hash}.png`);
  if (fs.existsSync(out)) return out;
  cropAspect(P, src, out);
  return out;
}

// Cắt giữa về đúng tỉ lệ trước khi gửi: ảnh 2:3 tải lên Flow bị thêm viền đen, rồi Veo cắt cảnh giữa clip.
function cropAspect(P, src, out) {
  const crop = P.aspect === '16:9'
    ? "crop=w='min(iw,ih*16/9)':h='min(ih,iw*9/16)'"
    : "crop=w='min(iw,ih*9/16)':h='min(ih,iw*16/9)'";
  run('ffmpeg', ['-v', 'error', '-y', '-i', src, '-vf', crop, '-frames:v', '1', out]);
}

function ffmpegLog(args) {
  return spawnSync('ffmpeg', ['-v', 'info', ...args, '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 1 << 26 }).stderr || '';
}

function ssim(a, b) {
  const { width, height } = probe(a);
  const m = ffmpegLog(['-i', a, '-i', b, '-filter_complex', `[1]scale=${width}:${height}[r];[0][r]ssim`]).match(/All:([\d.]+)/);
  return m ? Number(m[1]) : null;
}

function barsAtStart(clip) {
  const { width, height } = probe(clip);
  const all = [...ffmpegLog(['-i', clip, '-frames:v', '6', '-vf', 'cropdetect=24:2:0']).matchAll(/crop=(\d+):(\d+):\d+:\d+/g)];
  if (!all.length) return null;
  const [w, h] = all[all.length - 1].slice(1).map(Number);
  return w < width * 0.97 || h < height * 0.97 ? `${w}×${h} trong khung ${width}×${height}` : null;
}

function startSource(P, i) {
  const clip = P.plan.clips[i];
  if (clip.start === '@prev') {
    const prev = P.plan.clips[i - 1];
    const prevClip = clipFile(P, prev.id);
    const prevLast = lastFrame(P, prev.id);
    if (!fs.existsSync(prevClip)) die(`Chưa có clip ${prev.id}. Tạo clip ${prev.id} trước.`);
    if (!fs.existsSync(prevLast) || fs.statSync(prevClip).mtimeMs > fs.statSync(prevLast).mtimeMs) extractFrames(P, prev.id);
    return P.aspect === '9:16' ? removeWatermark(prevLast) : prevLast;
  }
  return clip.start ? path.resolve(P.dir, clip.start) : null;
}

// Dấu ✦ của Flow ở góc phải dưới khung cuối làm Veo vẽ thêm nhiều dấu ✦ trong clip sau (video bọ rùa 2026-10-20).
// Vị trí mới đo ở khung 9:16; khung 16:9 chưa đo nên giữ nguyên.
function removeWatermark(src) {
  const out = src.replace(/\.png$/, '_clean.png');
  if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(src).mtimeMs) return out;
  const { width, height } = probe(src);
  const [x, y, w, h] = [0.792 * width, 0.883 * height, 0.083 * width, 0.047 * height].map(Math.round);
  run('ffmpeg', ['-v', 'error', '-y', '-i', src, '-vf', `delogo=x=${x}:y=${y}:w=${w}:h=${h}`, out]);
  return out;
}

// Đo trên video muỗi 2026-10-17: ảnh start đúng cho SSIM 0,93–0,95; ảnh cũ chọn nhầm trong thư viện Flow cho 0,84.
// check không phát hiện lỗi này khi chủ thể nhỏ, nên phải kiểm tra ngay lúc nhận clip.
function verifyStart(P, i) {
  const clip = P.plan.clips[i];
  const warns = [];
  const bars = barsAtStart(clipFile(P, clip.id));
  if (bars) warns.push(`Khung đầu có viền đen: nội dung ${bars}. Ảnh start tải lên Flow sai tỉ lệ. Tạo lại, hoặc đặt "trimStart" để cắt phần đầu.`);
  // Chỉ clip @prev cần khớp khung: clip đầu không có điểm nối phía trước.
  if (clip.start === '@prev') {
    const v = ssim(firstFrame(P, clip.id), startSource(P, i));
    if (v !== null) {
      const ok = v >= 0.9;
      console.log(`SSIM khung đầu so với khung cuối clip ${P.plan.clips[i - 1].id}: ${v.toFixed(3)} → ${ok ? 'đúng ảnh start' : 'SAI ảnh start'}`);
      if (!ok) warns.push('Khung đầu không khớp ảnh start (SSIM < 0,90). Điểm nối sẽ có bước nhảy. Tạo lại clip với đúng file trong upload-flow/.');
    }
  }
  warns.forEach((w) => console.warn(`! ${w}`));
}

// Ảnh K sau sửa trên ảnh K trước trong cùng cuộc chat ChatGPT, để giữ nguyên bối cảnh và góc máy.
async function cmdImages(P, only, flags) {
  const ks = P.plan.keyframes;
  if (!Array.isArray(ks) || !ks.length) die('plan.json chưa có mảng "keyframes": [{ "file": "K01.png", "prompt": "..." }].');
  if (only && !ks.some((k) => k.file === only)) die(`Không có ${only} trong keyframes.`);
  const stateFile = path.join(P.dir, 'gpt-chat.json');
  let state = fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, 'utf8')) : {};
  const { generateGptImage } = await import(new URL('./gpt-image.mjs', import.meta.url));
  for (let i = 0; i < ks.length; i++) {
    const k = ks[i];
    if (only && k.file !== only) continue;
    const out = path.resolve(P.dir, k.file);
    if (fs.existsSync(out) && !flags.force) {
      console.log(`${k.file} đã có. Thêm --force để tạo lại.`);
      continue;
    }
    let chatUrl;
    let refImage;
    if (i > 0) {
      const prev = path.resolve(P.dir, ks[i - 1].file);
      if (!fs.existsSync(prev)) die(`Chưa có ${ks[i - 1].file}. Tạo ảnh đó trước.`);
      // Ảnh trước không do script tạo thì không có cuộc chat: đính kèm ảnh trước vào cuộc chat mới.
      if (state.chat) chatUrl = state.chat;
      else refImage = prev;
    }
    if (fs.existsSync(out)) {
      const backup = out.replace(/(\.\w+)$/, `_${stamp()}$1`);
      fs.renameSync(out, backup);
      console.log(`Giữ bản cũ: ${backup}`);
    }
    console.log(`Tạo ${k.file}${chatUrl ? ' (sửa trong cuộc chat cũ)' : refImage ? ` (đính kèm ${path.basename(refImage)})` : ' (cuộc chat mới)'}`);
    const res = await generateGptImage({ prompt: k.prompt, outFile: out, chatUrl, refImage });
    if (!chatUrl) {
      state = { chat: res.chatUrl };
      fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
    }
    const later = ks.slice(i + 1).filter((x) => fs.existsSync(path.resolve(P.dir, x.file))).map((x) => x.file);
    if (flags.force && later.length) console.warn(`! Các ảnh sau tạo từ ảnh cũ, nên tạo lại: ${later.join(', ')}`);
  }
}

function cmdUpload(P, id) {
  const i = P.plan.clips.findIndex((c) => c.id === id);
  if (i < 0) die(`Không có clip "${id}" trong plan.`);
  const clip = P.plan.clips[i];
  const dir = path.join(P.dir, 'upload-flow');
  fs.mkdirSync(dir, { recursive: true });
  const rows = [];
  const src = startSource(P, i);
  if (src) {
    const out = path.join(dir, `${id}_start.png`);
    cropAspect(P, src, out);
    rows.push(['Bắt đầu', out]);
  }
  if (clip.end) {
    const out = path.join(dir, `${id}_end.png`);
    cropAspect(P, path.resolve(P.dir, clip.end), out);
    rows.push(['Kết thúc', out]);
  }
  rows.forEach(([slot, f]) => {
    const p = probe(f);
    console.log(`${slot}: ${f} (${p.width}×${p.height})`);
  });
  console.log(`Cấu hình: Video, ${P.aspect}, ${clip.duration || P.duration} giây, x1, model ${clip.model || P.model}`);
  console.log(`Prompt:\n${clip.prompt}`);
  console.log(`\nSau khi tải video 1080p, lưu thành ${clipFile(P, id)} rồi chạy: node chain.mjs gen <plan.json> ${id}`);
}

function extractFrames(P, id) {
  fs.mkdirSync(P.framesDir, { recursive: true });
  const clip = clipFile(P, id);
  run('ffmpeg', ['-v', 'error', '-y', '-i', clip, '-frames:v', '1', firstFrame(P, id)]);
  // -update 1 ghi đè cùng 1 file cho mỗi khung → file cuối cùng là khung cuối thật của clip.
  run('ffmpeg', ['-v', 'error', '-y', '-sseof', '-0.2', '-i', clip, '-update', '1', lastFrame(P, id)]);
}

function stamp() {
  return new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15);
}

function cmdStatus(P) {
  console.log(`Plan: ${P.dir}`);
  console.log(`Tỉ lệ ${P.aspect} · model ${P.model} · độ dài mặc định ${P.duration} giây\n`);
  let next = null;
  for (const c of P.plan.clips) {
    const has = fs.existsSync(clipFile(P, c.id));
    const hasLast = fs.existsSync(lastFrame(P, c.id));
    if (!has && !next) next = c.id;
    const info = has ? `${probe(clipFile(P, c.id)).duration.toFixed(2)} giây` : 'chưa tạo';
    console.log(`- ${c.id}: start=${c.start || '(không)'} end=${c.end || '(không)'} → ${info}${hasLast ? ', có khung cuối' : ''}`);
  }
  const out = path.resolve(P.dir, P.plan.output?.file || 'final.mp4');
  console.log(`\nVideo cuối: ${fs.existsSync(out) ? out : 'chưa ghép'}`);
  console.log(next ? `Bước tiếp: node chain.mjs gen <plan.json> ${next}` : 'Mọi clip đã có. Bước tiếp: join, rồi check.');
}

async function cmdGen(P, id, flags) {
  const i = P.plan.clips.findIndex((c) => c.id === id);
  if (i < 0) die(`Không có clip "${id}" trong plan.`);
  const clip = P.plan.clips[i];
  const out = clipFile(P, id);
  const dryRun = !!flags['dry-run'] || process.env.FLOW_DRYRUN === '1';

  if (fs.existsSync(out) && !flags.force && !dryRun) {
    // Người dùng có thể thay clip bằng bản tải tay từ Flow → trích lại nếu clip mới hơn khung đã trích.
    const lf = lastFrame(P, id);
    if (!fs.existsSync(lf) || fs.statSync(out).mtimeMs > fs.statSync(lf).mtimeMs) extractFrames(P, id);
    console.log(`Clip ${id} đã có: ${out}. Thêm --force để tạo lại.`);
    verifyStart(P, i);
    console.log(`Khung cuối: ${lastFrame(P, id)}`);
    return;
  }

  const startSrc = startSource(P, i);
  const start = startSrc ? fitAspect(P, startSrc, `${id}_start`) : undefined;
  const end = clip.end ? fitAspect(P, path.resolve(P.dir, clip.end), `${id}_end`) : undefined;

  if (fs.existsSync(out) && !dryRun) {
    const backup = path.join(P.clipsDir, `${id}_${stamp()}.mp4`);
    fs.renameSync(out, backup);
    console.log(`Giữ bản cũ: ${backup}`);
    const stale = P.plan.clips.slice(i + 1).filter((c) => fs.existsSync(clipFile(P, c.id))).map((c) => c.id);
    if (stale.length) console.warn(`! Các clip sau đã tạo từ khung cuối cũ, phải tạo lại: ${stale.join(', ')}`);
  }

  console.log(`Tạo clip ${id}: start=${start ? path.basename(start) : '(không)'} end=${end ? path.basename(end) : '(không)'}`);
  const { generateFlowVideo } = await import(new URL('./flow.mjs', import.meta.url));
  await generateFlowVideo({
    prompt: clip.prompt,
    startImage: start,
    endImage: end,
    model: clip.model || P.model,
    duration: clip.duration || P.duration,
    aspect: P.aspect,
    quality: clip.quality || P.quality,
    download: P.download,
    outFile: out,
    dryRun,
  });
  if (dryRun) return;

  extractFrames(P, id);
  const p = probe(out);
  console.log(`Clip ${id}: ${p.duration.toFixed(2)} giây, ${p.width}×${p.height}, ${p.fpsStr} fps`);
  verifyStart(P, i);
  console.log(`Khung đầu:  ${firstFrame(P, id)}`);
  console.log(`Khung cuối: ${lastFrame(P, id)}`);
  console.log('Xem khung cuối trước khi tạo clip tiếp. Khung cuối lỗi làm hỏng mọi clip sau nó.');
}

function hasAudio(file) {
  return run('ffprobe', ['-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=index', '-of', 'csv=p=0', file]).trim() !== '';
}

// atempo của ffmpeg cũ chỉ nhận 0,5–2 → tách hệ số lớn thành nhiều bước.
function atempoChain(speed) {
  const steps = [];
  let s = speed;
  while (s > 2) { steps.push('atempo=2'); s /= 2; }
  while (s < 0.5) { steps.push('atempo=0.5'); s /= 0.5; }
  steps.push(`atempo=${s.toFixed(4)}`);
  return steps.join(',');
}

function cmdJoin(P) {
  const missing = P.plan.clips.filter((c) => !fs.existsSync(clipFile(P, c.id))).map((c) => c.id);
  if (missing.length) die(`Chưa có clip: ${missing.join(', ')}`);
  const o = P.plan.output || {};
  const xf = Number(o.crossfade ?? 0.1);
  const speed = Number(o.speed ?? 1);
  if (!(speed > 0)) die('output.speed phải > 0.');
  const outFile = path.resolve(P.dir, o.file || 'final.mp4');

  const files = P.plan.clips.map((c) => clipFile(P, c.id));
  const probes = files.map(probe);
  const { fpsStr, width: W, height: H } = probes[0];
  const trims = P.plan.clips.map((c) => Number(c.trimStart || 0));
  const durs = probes.map((p, k) => p.duration - trims[k]);
  durs.forEach((d, k) => {
    if (d <= 0) die(`Clip ${P.plan.clips[k].id}: trimStart ${trims[k]} lớn hơn độ dài clip.`);
    if (xf > 0 && d <= xf) die(`Clip ${P.plan.clips[k].id} ngắn hơn crossfade ${xf} giây.`);
  });

  const parts = probes.map(
    (_, k) => `[${k}:v]${trims[k] ? `trim=start=${trims[k]},` : ''}settb=AVTB,setpts=PTS-STARTPTS,fps=${fpsStr},scale=${W}:${H},setsar=1,format=yuv420p[v${k}]`,
  );
  const rawSeams = [];
  let last = 'v0';
  if (files.length > 1 && xf > 0) {
    let acc = durs[0];
    for (let k = 1; k < files.length; k++) {
      const offset = acc - xf;
      parts.push(`[${last}][v${k}]xfade=transition=fade:duration=${xf}:offset=${offset.toFixed(3)}[x${k}]`);
      rawSeams.push(offset + xf / 2);
      acc += durs[k] - xf;
      last = `x${k}`;
    }
  } else if (files.length > 1) {
    parts.push(`${probes.map((_, k) => `[v${k}]`).join('')}concat=n=${files.length}:v=1:a=0[xc]`);
    let acc = 0;
    for (let k = 0; k < files.length - 1; k++) rawSeams.push((acc += durs[k]));
    last = 'xc';
  }
  parts.push(`[${last}]setpts=PTS/${speed},fps=${fpsStr}[out]`);

  // Tiếng gốc Flow khớp hình từng clip; người dùng chọn giữ tiếng này (2026-10-18). output.audio: "none" để bỏ.
  // Veo tạo tiếng riêng cho từng clip: âm lượng lệch 4–9 dB ở điểm nối, nên chuẩn hoá từng clip trước khi nối.
  const withAudio = (o.audio ?? 'flow') !== 'none';
  if (withAudio) {
    files.forEach((f, k) => {
      const src = hasAudio(f)
        ? `[${k}:a]${trims[k] ? `atrim=start=${trims[k]},` : ''}asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo,loudnorm=I=-16:TP=-2,aresample=48000`
        // Clip không có tiếng (tải tay, hoặc đã cắt bằng -an) → chèn lặng đúng độ dài để các điểm nối không lệch.
        : `anullsrc=r=48000:cl=stereo,atrim=duration=${durs[k]}`;
      parts.push(`${src}[a${k}]`);
    });
    let al = 'a0';
    if (files.length > 1 && xf > 0) {
      for (let k = 1; k < files.length; k++) {
        parts.push(`[${al}][a${k}]acrossfade=d=${xf}[ax${k}]`);
        al = `ax${k}`;
      }
    } else if (files.length > 1) {
      parts.push(`${files.map((_, k) => `[a${k}]`).join('')}concat=n=${files.length}:v=0:a=1[ac]`);
      al = 'ac';
    }
    const total = (durs.reduce((a, b) => a + b, 0) - (files.length > 1 ? xf * (files.length - 1) : 0)) / speed;
    parts.push(`[${al}]${atempoChain(speed)},afade=t=in:d=0.4,afade=t=out:st=${Math.max(0, total - 1.4).toFixed(3)}:d=1.4[aout]`);
  }

  const args = ['-v', 'error', '-y'];
  files.forEach((f) => args.push('-i', f));
  args.push('-filter_complex', parts.join(';'), '-map', '[out]');
  if (withAudio) args.push('-map', '[aout]', '-c:a', 'aac', '-b:a', '192k', '-shortest');
  else args.push('-an');
  args.push(
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    outFile,
  );
  run('ffmpeg', args);

  const seams = rawSeams.map((t) => Number((t / speed).toFixed(3)));
  const meta = { file: outFile, speed, crossfade: xf, clips: P.plan.clips.map((c) => c.id), durations: durs, seams };
  fs.writeFileSync(path.join(P.dir, 'seams.json'), JSON.stringify(meta, null, 2));
  console.log(`✓ Video cuối: ${outFile} (${probe(outFile).duration.toFixed(2)} giây, tăng tốc ${speed}×, crossfade ${xf} giây, ${withAudio ? 'tiếng gốc Flow' : 'không tiếng'})`);
  console.log(`Điểm nối (giây): ${seams.length ? seams.join(', ') : 'không có'}`);
}

function sceneScores(video, crop) {
  const vf = `${crop ? `crop=${crop},` : ''}select='gte(scene,0)',metadata=print:file=-`;
  const out = run('ffmpeg', ['-v', 'error', '-i', video, '-vf', vf, '-an', '-f', 'null', '-']);
  const rows = [];
  let t = null;
  for (const line of out.split('\n')) {
    const mt = line.match(/pts_time:([\d.]+)/);
    if (mt) t = Number(mt[1]);
    const ms = line.match(/lavfi\.scene_score=([\d.]+)/);
    if (ms && t !== null) rows.push({ t, s: Number(ms[1]) });
  }
  return rows;
}

function cmdCheck(target, flags) {
  const threshold = Number(flags.threshold ?? 0.07);
  let video = target;
  let seams = [];
  let P = null;
  if (target.endsWith('.json')) {
    P = loadPlan(target);
    const metaFile = path.join(P.dir, 'seams.json');
    if (!fs.existsSync(metaFile)) die('Chưa có seams.json. Chạy join trước.');
    const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
    video = meta.file;
    seams = meta.seams;
  }
  if (flags.seams) seams = String(flags.seams).split(',').map(Number);
  if (!fs.existsSync(video)) die(`Không thấy video: ${video}`);

  const rows = sceneScores(video, flags.crop);
  const W = 0.25;
  const near = (r) => seams.some((s) => Math.abs(r.t - s) <= W);
  const inside = rows.filter((r) => !near(r)).sort((a, b) => b.s - a.s);
  // Camera di chuyển hoặc tăng tốc làm score bình thường cao hơn (đo được: p90 0,02 khi camera đứng yên,
  // 0,08 khi camera bay) → giới hạn bước nhảy theo p90 của chính video. Bỏ score ~0 của khung lặp.
  const moving = inside.map((r) => r.s).filter((s) => s > 0.002).sort((a, b) => a - b);
  const p90 = moving.length ? moving[Math.min(moving.length - 1, Math.floor(0.9 * moving.length))] : 0;
  const limit = Math.max(threshold, 3 * p90);

  console.log(`Video: ${video}`);
  console.log(`Chuyển động bình thường (p90): ${p90.toFixed(3)}. Giới hạn bước nhảy = max(${threshold}, 3 × p90) = ${limit.toFixed(3)}`);
  console.log(`Score cao nhất bên trong clip: ${(inside[0]?.s ?? 0).toFixed(3)}${inside[0] ? ` ở giây ${inside[0].t.toFixed(2)}` : ''}\n`);
  let fail = 0;
  for (const s of seams) {
    const win = rows.filter((r) => Math.abs(r.t - s) <= W).sort((a, b) => b.s - a.s);
    const peak = win[0]?.s ?? 0;
    const ok = peak < limit;
    if (!ok) fail++;
    console.log(`- Điểm nối giây ${s}: score ${peak.toFixed(3)} → ${ok ? 'đạt' : 'KHÔNG ĐẠT'}`);
    if (P) {
      fs.mkdirSync(P.framesDir, { recursive: true });
      const sheet = path.join(P.framesDir, `seam_${seams.indexOf(s) + 1}.png`);
      run('ffmpeg', ['-v', 'error', '-y', '-ss', String(Math.max(0, s - 0.25)), '-t', '0.5', '-i', video,
        '-vf', 'scale=240:-1,tile=12x1', '-frames:v', '1', sheet]);
      console.log(`  Khung quanh điểm nối: ${sheet}`);
    }
  }
  // Đo trên video muỗi 2026-10-17: lăng quăng lệch 8% chiều rộng khung mà score chỉ 0,043, vì score tính trên cả khung.
  if (P && seams.length) console.log('\nScore không phát hiện chủ thể nhỏ bị lệch. Mở các ảnh seam_*.png: chủ thể hiện 2 hình chồng là bước nhảy.');
  const jumps = inside.filter((r) => r.s >= limit).slice(0, 5);
  if (jumps.length) {
    console.log('\nBước nhảy bên trong clip, không nằm ở điểm nối:');
    jumps.sort((a, b) => a.t - b.t).forEach((r) => console.log(`- giây ${r.t.toFixed(2)}: score ${r.s.toFixed(3)}`));
  }
  console.log(`\nKết luận: ${seams.length ? `${seams.length - fail}/${seams.length} điểm nối đạt` : 'không có điểm nối để đo'}${jumps.length ? `, ${jumps.length} bước nhảy bên trong clip` : ''}.`);
}

function cmdScenes(video, flags) {
  if (!fs.existsSync(video)) die(`Không thấy video: ${video}`);
  const threshold = Number(flags.threshold ?? 0.15);
  const p = probe(video);
  const rows = sceneScores(video, flags.crop);
  const hits = rows.filter((r) => r.s >= threshold);
  // Gộp các khung sát nhau (< 0,15 giây) thành 1 sự kiện: một lần chuyển cảnh thường kéo dài vài khung.
  const events = [];
  for (const r of hits) {
    const lastEv = events[events.length - 1];
    if (lastEv && r.t - lastEv.end < 0.15) {
      lastEv.end = r.t;
      if (r.s > lastEv.peak.s) lastEv.peak = r;
    } else events.push({ start: r.t, end: r.t, peak: r });
  }
  const top = [...rows].sort((a, b) => b.s - a.s)[0];
  console.log(`Video: ${video} (${p.duration.toFixed(2)} giây, ${p.width}×${p.height}, ${p.fpsStr} fps)`);
  console.log(`Ngưỡng: ${threshold}. Score cao nhất: ${top ? `${top.s.toFixed(3)} ở giây ${top.t.toFixed(2)}` : 'không có'}\n`);
  if (!events.length) console.log('Không có điểm cắt nào vượt ngưỡng.');
  events.forEach((e, k) => {
    const span = e.end > e.start ? `${e.start.toFixed(2)}–${e.end.toFixed(2)}` : e.start.toFixed(2);
    console.log(`${k + 1}. giây ${span}: score cao nhất ${e.peak.s.toFixed(3)}`);
  });
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const { pos, flags } = parseArgs(rest);
  switch (cmd) {
    case 'status':
      if (!pos[0]) die(USAGE);
      return cmdStatus(loadPlan(pos[0]));
    case 'images':
      if (!pos[0]) die(USAGE);
      return cmdImages(loadPlan(pos[0]), pos[1], flags);
    case 'upload':
      if (!pos[0] || !pos[1]) die(USAGE);
      return cmdUpload(loadPlan(pos[0]), pos[1]);
    case 'gen':
      if (!pos[0] || !pos[1]) die(USAGE);
      return cmdGen(loadPlan(pos[0]), pos[1], flags);
    case 'join':
      if (!pos[0]) die(USAGE);
      return cmdJoin(loadPlan(pos[0]));
    case 'check':
      if (!pos[0]) die(USAGE);
      return cmdCheck(pos[0], flags);
    case 'scenes':
      if (!pos[0]) die(USAGE);
      return cmdScenes(pos[0], flags);
    default:
      console.log(USAGE);
  }
}

// Kết nối CDP của lệnh gen giữ event loop sống — phải thoát chủ động.
main()
  .then(() => process.exit(0))
  .catch((err) => die(err.message));
