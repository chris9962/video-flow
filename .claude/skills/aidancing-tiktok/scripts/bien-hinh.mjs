#!/usr/bin/env node
// Ghép N clip aidancing cùng động tác, cùng nhạc, khác bộ đồ thành 1 video biến hình: đổi đồ N−1 lần.
// Script chỉ đo và dựng. Claude xem ảnh kiểm tra rồi quyết định thứ tự bộ đồ và điểm đổi (người dùng yêu cầu ngày 2026-11-07).
// Chỉ dùng ffmpeg và Node, chạy được trên Windows và macOS.
//
// CLI:
//   node bien-hinh.mjs phan-tich <clip1> <clip2> ... [--out <thư mục>]
//     Kiểm tra các clip khớp động tác, đo nhịp nhạc, khoảng lặng, động tác mạnh, gợi ý N−1 điểm đổi đồ.
//     Ghi ảnh kiểm tra vào <thư mục> (mặc định: thư mục bien-hinh cạnh clip1).
//   node bien-hinh.mjs dung --cat <giây,giây,...> --out <video.mp4> <clip1> <clip2> ...
//        [--hieu-ung chop|hoa-hinh] [--hoa 0.25] [--flash 0.55] [--flash-cat 1,2,3] [--zoom 0.08]
//     Dựng video: clip1 từ giây 0, đổi sang clip2 ở điểm cắt 1, … Nhạc liền lấy từ clip1.
//     --hieu-ung chop (mặc định): cắt cứng ở mốc. hoa-hinh: hoà 2 clip trong --hoa giây quanh mốc. Các clip khớp động tác,
//       nên hoà hình trông như bộ đồ biến dần trên người.
//     --flash: độ chớp sáng, 0 = tắt. --flash-cat: chỉ chớp ở các điểm cắt này (đánh số từ 1), mặc định mọi điểm.
//     Ghi ảnh khung quanh từng điểm cắt vào <video>-kiem-tra/.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const SR = 22050; // tần số mẫu âm thanh khi phân tích
const HOP = 512; // 1 khung âm thanh = 512 mẫu ≈ 23 ms
const GW = 72; // ảnh xám nhỏ để đo chuyển động
const GH = 128;

function die(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

function parseArgs(argv) {
  const opts = { clips: [], flash: 0.55, zoom: 0.08, hieuUng: 'chop', hoa: 0.25 };
  opts.cmd = argv[0];
  for (let i = 1; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out') opts.out = argv[++i];
    else if (a === '--cat') opts.cat = argv[++i].split(',').map(Number);
    else if (a === '--flash-cat') opts.flashCat = argv[++i].split(',').map(Number);
    else if (a === '--hieu-ung') opts.hieuUng = argv[++i];
    else if (['--flash', '--zoom', '--hoa'].includes(a)) opts[a.slice(2)] = Number(argv[++i]);
    else opts.clips.push(a);
  }
  if (!['phan-tich', 'dung'].includes(opts.cmd)) die('Lệnh phải là phan-tich hoặc dung. Xem đầu file để biết cách dùng.');
  if (!['chop', 'hoa-hinh'].includes(opts.hieuUng)) die('--hieu-ung phải là chop hoặc hoa-hinh.');
  if (opts.clips.length < 2) die('Cần ít nhất 2 clip.');
  for (const c of opts.clips) if (!fs.existsSync(c)) die(`Không thấy clip: ${c}`);
  return opts;
}

function probe(file) {
  const out = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate,nb_frames:format=duration', '-of', 'json', file], { encoding: 'utf8' });
  const j = JSON.parse(out);
  const s = j.streams[0];
  const [a, b] = s.r_frame_rate.split('/').map(Number);
  return { width: s.width, height: s.height, fps: a / b, frames: Number(s.nb_frames), duration: Number(j.format.duration) };
}

function ffmpegBuffer(args) {
  return execFileSync('ffmpeg', ['-v', 'error', ...args, '-'], { maxBuffer: 1 << 30 });
}

function ffmpeg(args) {
  execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: ['ignore', 'ignore', 'inherit'] });
}

// Năng lượng log theo khung âm thanh, và onset = phần năng lượng tăng so với khung trước.
function audioFeatures(file) {
  const buf = ffmpegBuffer(['-i', file, '-ac', '1', '-ar', String(SR), '-f', 'f32le']);
  const a = new Float32Array(buf.buffer, buf.byteOffset, Math.floor(buf.length / 4));
  const n = Math.floor(a.length / HOP);
  const energy = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (let k = 0; k < HOP; k++) s += a[i * HOP + k] ** 2;
    energy[i] = Math.log1p((1000 * s) / HOP);
  }
  const onset = new Float64Array(n);
  for (let i = 1; i < n; i++) onset[i] = Math.max(0, energy[i] - energy[i - 1]);
  return { energy, onset, rate: SR / HOP };
}

// Chỗ ngắt giữa 2 câu hát: năng lượng dải giọng người (300–3000 Hz) theo khung 20 ms, làm mượt ±0,1 s,
// tụt dưới 62% trung vị ±2 s trong ≥ 0,1 s. Ngưỡng đo trên clip @irenebbyy_ ngày 2026-11-07: ra các chỗ ngắt
// cách nhau 3–4 s, khớp câu 2 ô nhịp ở 136 BPM. Nhạc cụ cùng dải tần làm lệch kết quả, nên Claude xem thêm ảnh phổ giọng.
function vocalGaps(file) {
  const buf = ffmpegBuffer(['-i', file, '-af', 'highpass=f=300,lowpass=f=3000', '-ac', '1', '-ar', String(SR), '-f', 'f32le']);
  const x = new Float32Array(buf.buffer, buf.byteOffset, Math.floor(buf.length / 4));
  const W = Math.round(SR * 0.02);
  const n = Math.floor(x.length / W);
  const env = [];
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (let k = 0; k < W; k++) s += x[i * W + k] ** 2;
    env.push(Math.sqrt(s / W));
  }
  const sm = env.map((_, i) => {
    const w = env.slice(Math.max(0, i - 5), i + 6);
    return w.reduce((a, b) => a + b, 0) / w.length;
  });
  const gaps = [];
  let run = null;
  for (let i = 0; i < n; i++) {
    const local = median(sm.slice(Math.max(0, i - 100), i + 101));
    const low = sm[i] < 0.62 * local;
    if (low && !run) run = { from: i, min: sm[i] / local };
    else if (low) run.min = Math.min(run.min, sm[i] / local);
    if ((!low || i === n - 1) && run) {
      if (i - run.from >= 5) gaps.push({ from: run.from * 0.02, to: i * 0.02, depth: 1 - run.min });
      run = null;
    }
  }
  return gaps;
}

// Độ chênh trung bình giữa 2 khung xám liền nhau, làm mượt 5 khung.
function motionCurve(file, fps) {
  const g = ffmpegBuffer(['-i', file, '-vf', `fps=${fps},scale=${GW}:${GH},format=gray`, '-f', 'rawvideo']);
  const F = GW * GH;
  const m = Math.floor(g.length / F);
  const raw = [0];
  for (let f = 1; f < m; f++) {
    let s = 0;
    for (let k = 0; k < F; k++) s += Math.abs(g[f * F + k] - g[(f - 1) * F + k]);
    raw.push(s / F);
  }
  return raw.map((_, i) => {
    const w = raw.slice(Math.max(0, i - 2), i + 3);
    return w.reduce((x, y) => x + y, 0) / w.length;
  });
}

function pearson(x, y) {
  const n = Math.min(x.length, y.length);
  const mx = x.slice(0, n).reduce((a, b) => a + b, 0) / n;
  const my = y.slice(0, n).reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (x[i] - mx) * (y[i] - my);
    sxx += (x[i] - mx) ** 2;
    syy += (y[i] - my) ** 2;
  }
  return sxy / Math.sqrt(sxx * syy || 1);
}

// Độ lệch (khung) làm 2 đường chuyển động khớp nhất, trong ±maxLag khung.
function bestLag(ref, other, maxLag) {
  let best = { lag: 0, r: -2 };
  for (let lag = -maxLag; lag <= maxLag; lag++) {
    const a = lag >= 0 ? ref.slice(lag) : ref;
    const b = lag >= 0 ? other : other.slice(-lag);
    const r = pearson(a, b);
    if (r > best.r) best = { lag, r };
  }
  return best;
}

const median = (arr) => [...arr].sort((x, y) => x - y)[Math.floor(arr.length / 2)];
const fmt = (t) => t.toFixed(2);

function phanTich(opts) {
  const clips = opts.clips;
  const info = clips.map(probe);
  const { fps } = info[0];
  const dur = Math.min(...info.map((i) => i.duration));
  const outDir = opts.out ?? path.join(path.dirname(clips[0]), 'bien-hinh');
  fs.mkdirSync(outDir, { recursive: true });

  console.log('== Clip');
  clips.forEach((c, i) => console.log(`${i + 1}. ${path.basename(c)}: ${info[i].width}×${info[i].height}, ${fmt(info[i].duration)} s, ${info[i].frames} khung, ${info[i].fps} fps`));
  if (info.some((i) => i.fps !== fps || i.width !== info[0].width || i.height !== info[0].height)) {
    console.log('⚠ Các clip khác fps hoặc kích thước. Script dựng theo clip1.');
  }

  // 1. Các clip khớp động tác: đường chuyển động của mỗi clip so với clip1.
  console.log('\n== Khớp động tác (so với clip 1)');
  const motions = clips.map((c) => motionCurve(c, fps));
  for (let i = 1; i < clips.length; i++) {
    const { lag, r } = bestLag(motions[0], motions[i], 15);
    const ok = lag === 0 && r > 0.6;
    console.log(`clip ${i + 1}: lệch ${lag} khung, tương quan ${r.toFixed(2)} → ${ok ? 'khớp' : 'CẦN XEM: clip lệch hoặc khác động tác'}`);
  }

  // 2. Nhạc: tempo, khoảng lặng, onset mạnh.
  const { energy, onset, rate } = audioFeatures(clips[0]);
  let bestAc = 0, beatLag = 0;
  for (let lag = Math.round((rate * 60) / 180); lag <= Math.round((rate * 60) / 70); lag++) {
    let s = 0;
    for (let i = lag; i < onset.length; i++) s += onset[i] * onset[i - lag];
    if (s > bestAc) { bestAc = s; beatLag = lag; }
  }
  const bpm = (60 * rate) / beatLag;
  const medE = median(energy);
  // Khoảng lặng: cửa sổ 0,5 s có năng lượng < 50% trung vị. Gom các cửa sổ liền nhau thành 1 đoạn lặng.
  const quiet = [];
  for (let t = 0.5; t < dur - 0.5; t += 0.25) {
    const i0 = Math.floor(t * rate), i1 = Math.floor((t + 0.5) * rate);
    const m = energy.slice(i0, i1).reduce((a, b) => a + b, 0) / (i1 - i0);
    if (m < 0.5 * medE) quiet.push(t);
  }
  const quietRuns = [];
  for (const q of quiet) {
    const last = quietRuns.at(-1);
    if (last && q - last.to <= 0.26) last.to = q;
    else quietRuns.push({ from: q, to: q });
  }
  // Nhạc trở lại quanh giữa cửa sổ lặng cuối cùng của đoạn: drop nằm trong [cuối đoạn − 0,3 s, cuối đoạn + 1 s].
  const dropWindows = quietRuns.map((r) => [r.to + 0.25 - 0.3, r.to + 0.25 + 1.0]);
  const onsetThr = [...onset].sort((x, y) => y - x)[Math.floor(onset.length * 0.04)];
  const peaks = [];
  for (let i = 4; i < onset.length - 4; i++) {
    if (onset[i] >= onsetThr && onset[i] === Math.max(...onset.slice(i - 4, i + 5))) peaks.push(i);
  }
  const maxOn = Math.max(...peaks.map((i) => onset[i]));
  const motion = motions[0];
  const maxMo = Math.max(...motion);
  console.log(`\n== Nhạc: ${bpm.toFixed(1)} BPM, 1 nhịp = ${(60 / bpm).toFixed(3)} s`);
  console.log(`Đoạn lặng: ${quietRuns.length ? quietRuns.map((r) => `${fmt(r.from)}–${fmt(r.to + 0.5)}`).join(', ') : 'không có'}`);

  // Chỗ ngắt câu hát. Người dùng ngày 2026-11-07: đổi đồ lúc hết câu hát và có động tác thì hay, đổi giữa câu thì không.
  const gaps = vocalGaps(clips[0]).filter((g) => g.from > 1 && g.from < dur - 1);
  console.log(`Chỗ ngắt câu hát (giây, độ sâu): ${gaps.length ? gaps.map((g) => `${fmt(g.from)}–${fmt(g.to)} (${g.depth.toFixed(2)})`).join(', ') : 'không thấy'}`);

  // 3. Ứng viên điểm đổi đồ = onset mạnh, chấm điểm theo onset + chuyển động + drop + hết câu.
  //    Hết câu: onset nằm trong chỗ ngắt, nới 0,2 s mỗi bên.
  const cands = peaks.map((i) => {
    const t = i / rate;
    const frame = Math.round(t * fps);
    const mo = Math.max(...motion.slice(Math.max(0, frame - 3), frame + 4));
    const drop = dropWindows.some(([lo, hi]) => t >= lo && t <= hi);
    const cau = gaps.some((g) => t >= g.from - 0.2 && t <= g.to + 0.2);
    const score = onset[i] / maxOn + mo / maxMo + (drop ? 0.8 : 0) + (cau ? 0.6 : 0);
    return { t: frame / fps, frame, onset: onset[i] / maxOn, motion: mo / maxMo, drop, cau, score };
  }).filter((c) => c.t > 1.5 && c.t < dur - 1.5);
  console.log('\n== Ứng viên (giây | onset | chuyển động | drop | hết câu | điểm)');
  for (const c of cands) console.log(`${fmt(c.t)} | ${c.onset.toFixed(2)} | ${c.motion.toFixed(2)} | ${c.drop ? 'DROP' : '-'} | ${c.cau ? 'HẾT CÂU' : '-'} | ${c.score.toFixed(2)}`);

  // 4. Gợi ý N−1 điểm.
  //  - Điểm 1: phách đầu tiên của drop sớm nhất (onset ≥ 0,5) nếu drop nằm trong 45% đầu video. Clip 1 kéo tới đó để tạo chờ đợi.
  //  - Các điểm sau: chia đều phần còn lại cho các bộ đồ. Mỗi mốc lấy ứng viên trong ±40% đoạn, cách điểm trước ≥ 60% đoạn,
  //    xếp theo điểm trừ phần lệch khỏi mốc (lệch hết 40% đoạn thì trừ 0,5). Không có ứng viên thì lấy đúng mốc.
  //    Lần đầu chỉ chọn điểm cao nhất, nhạc không có drop: 2 bộ đồ cách nhau 2,2 s (2026-11-07).
  const k = clips.length - 1;
  const pick = [];
  const firstDrop = cands.filter((c) => c.drop && c.onset >= 0.5 && c.t <= dur * 0.45).sort((a, b) => a.t - b.t)[0];
  let from = 0;
  if (firstDrop) {
    pick.push(firstDrop);
    from = firstDrop.t;
  }
  const remain = k - pick.length;
  const seg = (dur - from) / (remain + 1);
  for (let j = 1; j <= remain; j++) {
    const target = from + j * seg;
    const prev = pick.length ? pick.at(-1).t : 0;
    const rank = (c) => c.score - (0.5 * Math.abs(c.t - target)) / (0.4 * seg);
    const ok = (c) => Math.abs(c.t - target) <= 0.4 * seg && c.t - prev >= 0.6 * seg;
    // Ưu tiên ứng viên hết câu. Không có thì lấy ứng viên bất kỳ.
    const near = (cands.some((c) => ok(c) && c.cau) ? cands.filter((c) => ok(c) && c.cau) : cands.filter(ok))
      .sort((a, b) => rank(b) - rank(a));
    pick.push(near[0] ?? { t: Math.round(target * fps) / fps, score: 0, note: 'không có ứng viên gần mốc, lấy đúng mốc' });
  }
  console.log(`\n== Gợi ý ${k} điểm đổi đồ: --cat ${pick.map((p) => fmt(p.t)).join(',')}`);
  pick.forEach((p, j) => console.log(`${j + 1}. ${fmt(p.t)} s${p.drop ? ' (drop)' : ''}${p.cau ? ' (hết câu)' : p.note ? '' : ' (giữa câu)'}${p.note ? ` (${p.note})` : ''}`));

  // 5. Ảnh kiểm tra cho Claude xem.
  //  - toan-bo.png: clip1, 2 khung/giây, mỗi hàng 10 khung = 5 giây (hàng r, cột c = r×5 + c×0,5 giây).
  //  - cung-luc.png: các clip cạnh nhau ở từng điểm gợi ý, để so tư thế và bộ đồ.
  const rows = Math.ceil(dur / 5);
  ffmpeg(['-i', clips[0], '-vf', `fps=2,scale=140:-1,tile=10x${rows}`, '-frames:v', '1', path.join(outDir, 'toan-bo.png')]);
  const inputs = clips.flatMap((c) => ['-i', c]);
  const parts = [];
  pick.forEach((p, j) => {
    clips.forEach((_, i) => parts.push(`[${i}:v]trim=start=${p.t}:duration=0.04,setpts=PTS-STARTPTS,scale=160:-1[p${j}c${i}]`));
    parts.push(`${clips.map((_, i) => `[p${j}c${i}]`).join('')}hstack=${clips.length}[r${j}]`);
  });
  parts.push(pick.length > 1 ? `${pick.map((_, j) => `[r${j}]`).join('')}vstack=${pick.length}[out]` : '[r0]copy[out]');
  ffmpeg([...inputs, '-filter_complex', parts.join(';'), '-map', '[out]', '-frames:v', '1', path.join(outDir, 'cung-luc.png')]);
  // Ảnh phổ dải giọng người: vệt ngang nhiều tầng là giọng hát, khoảng hở giữa các cụm vệt là chỗ ngắt câu.
  ffmpeg(['-i', clips[0], '-lavfi', 'highpass=f=300,lowpass=f=3400,showspectrumpic=s=1600x300:legend=1:scale=log:stop=4000', path.join(outDir, 'giong-hat.png')]);
  console.log(`              ${path.join(outDir, 'giong-hat.png')} (phổ dải giọng người, trục ngang là giây)`);
  console.log(`\nẢnh kiểm tra: ${path.join(outDir, 'toan-bo.png')} (mỗi hàng 5 giây, 10 khung/hàng, cách nhau 0,5 giây)`);
  console.log(`              ${path.join(outDir, 'cung-luc.png')} (mỗi hàng 1 điểm gợi ý, cột = clip 1…${clips.length})`);
}

function dung(opts) {
  const clips = opts.clips;
  if (!opts.out) die('Thiếu --out <video.mp4>.');
  if (!opts.cat || opts.cat.length !== clips.length - 1 || opts.cat.some((t) => !(t > 0))) {
    die(`--cat phải có đúng ${clips.length - 1} mốc giây, cách nhau bằng dấu phẩy.`);
  }
  const { fps, width, height } = probe(clips[0]);
  const cuts = opts.cat.map((t) => Math.round(t * fps));
  for (let j = 1; j < cuts.length; j++) if (cuts[j] <= cuts[j - 1]) die('Các mốc --cat phải tăng dần.');
  const ts = cuts.map((f) => (f / fps).toFixed(4));

  // Hoà hình: h khung trước và h khung sau mốc là clip cũ hoà dần sang clip mới, lấy cùng khung của 2 clip.
  const h = opts.hieuUng === 'hoa-hinh' ? Math.max(1, Math.round((opts.hoa * fps) / 2)) : 0;
  for (let j = 0; j < cuts.length; j++) {
    const prev = j ? cuts[j - 1] : 0;
    if (cuts[j] - h <= prev + h) die('Các mốc quá gần nhau so với --hoa.');
  }

  // Hiệu ứng ở mỗi điểm cắt c: chớp sáng giảm dần trong 0,15 s, phóng to giảm dần trong 0,25 s.
  // Với hoà hình, phóng to bắt đầu từ đầu đoạn hoà; chớp vẫn ở đúng mốc.
  const pulse = (c, d) => `if(between(t,${c},${c}+${d}),1-(t-${c})/${d},0)`;
  const zoomStart = cuts.map((f) => ((f - h) / fps).toFixed(4));
  const Z = `1+${opts.zoom}*(${zoomStart.map((c) => pulse(c, 0.25 + h / fps)).join('+')})`;
  const flashTs = ts.filter((_, j) => !opts.flashCat || opts.flashCat.includes(j + 1));
  const B = flashTs.length ? `${opts.flash}*(${flashTs.map((c) => pulse(c, 0.15)).join('+')})` : '0';

  const parts = [];
  const seg = []; // các đoạn theo thứ tự thời gian
  // Mỗi clip dùng: 1 đoạn riêng, + 1 lần làm B của đoạn hoà trước, + 1 lần làm A của đoạn hoà sau.
  clips.forEach((_, i) => {
    const uses = 1 + (h && i > 0 ? 1 : 0) + (h && i < cuts.length ? 1 : 0);
    parts.push(`[${i}:v]scale=${width}:${height},format=yuv420p${uses > 1 ? `,split=${uses}` : ''}${Array.from({ length: uses }, (_, u) => `[s${i}_${u}]`).join('')}`);
  });
  clips.forEach((_, i) => {
    const start = i === 0 ? 0 : cuts[i - 1] + h;
    const end = i < cuts.length ? `:end_frame=${cuts[i] - h}` : '';
    parts.push(`[s${i}_0]trim=start_frame=${start}${end},setpts=PTS-STARTPTS[v${i}]`);
    seg.push(`[v${i}]`);
    if (h && i < cuts.length) {
      const a = `[s${i}_${i > 0 ? 2 : 1}]`;
      const b = `[s${i + 1}_1]`;
      const range = `trim=start_frame=${cuts[i] - h}:end_frame=${cuts[i] + h},setpts=PTS-STARTPTS`;
      const D = ((2 * h) / fps).toFixed(4);
      parts.push(`${a}${range}[ha${i}]`, `${b}${range}[hb${i}]`);
      parts.push(`[ha${i}][hb${i}]blend=all_expr='A*(1-T/${D})+B*(T/${D})'[x${i}]`);
      seg.push(`[x${i}]`);
    }
  });
  parts.push(`${seg.join('')}concat=n=${seg.length}:v=1:a=0[c]`);
  parts.push(`[c]scale=w='trunc(iw*(${Z})/2)*2':h='trunc(ih*(${Z})/2)*2':eval=frame,crop=${width}:${height},eq=brightness='${B}':eval=frame,format=yuv420p[v]`);
  ffmpeg([
    ...clips.flatMap((c) => ['-i', c]),
    '-filter_complex', parts.join(';'),
    '-map', '[v]', '-map', '0:a?',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart',
    opts.out,
  ]);
  const o = probe(opts.out);
  console.log(`✓ ${opts.out}: ${o.width}×${o.height}, ${fmt(o.duration)} s`);
  cuts.forEach((f, j) => console.log(`  Đổi sang clip ${j + 2} ở khung ${f} = ${fmt(f / fps)} s`));

  // Ảnh kiểm tra: 9 khung trong ±0,3 s quanh mỗi điểm cắt.
  const dir = opts.out.replace(/\.mp4$/i, '') + '-kiem-tra';
  fs.mkdirSync(dir, { recursive: true });
  cuts.forEach((f, j) => {
    const start = Math.max(0, f / fps - 0.3);
    ffmpeg(['-ss', String(start), '-t', '0.6', '-i', opts.out, '-vf', 'fps=15,scale=140:-1,tile=9x1', '-frames:v', '1', path.join(dir, `cat-${j + 1}.png`)]);
  });
  console.log(`Ảnh kiểm tra quanh điểm cắt: ${dir}`);
}

const opts = parseArgs(process.argv.slice(2));
if (opts.cmd === 'phan-tich') phanTich(opts);
else dung(opts);
