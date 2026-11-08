#!/usr/bin/env node
// Ghép N clip aidancing cùng động tác, cùng nhạc, khác bộ đồ thành 1 video biến hình: đổi đồ N−1 lần.
// Script chỉ đo và dựng. Claude xem ảnh kiểm tra rồi quyết định thứ tự bộ đồ và điểm đổi (người dùng yêu cầu ngày 2026-11-07).
// Chỉ dùng ffmpeg và Node, chạy được trên Windows và macOS.
//
// CLI:
//   node bien-hinh.mjs phan-tich <clip1> <clip2> ... [--out <thư mục>]
//     Kiểm tra các clip khớp động tác, đo nhịp nhạc, khoảng lặng, động tác mạnh, gợi ý N−1 điểm đổi đồ.
//     Ghi ảnh kiểm tra vào <thư mục>. Mặc định: <thư mục video>/phan-tich/ khi clip nằm trong <thư mục video>/clip/.
//   Thư mục làm việc quy ước: <repo>/videos/bien-hinh-<tên>/ gồm clip/, phan-tich/ và video kết quả.
//   node bien-hinh.mjs dung --cat <giây,giây,...> --out <video.mp4> <clip1> <clip2> ...
//        [--hieu-ung chop|hoa-hinh] [--hoa 0.25] [--flash 0.55] [--flash-cat 1,2,3] [--zoom 0.08]
//     Dựng video: clip1 từ giây 0, đổi sang clip2 ở điểm cắt 1, … Nhạc liền lấy từ clip1.
//     --hieu-ung chop (mặc định): cắt cứng ở mốc. hoa-hinh: hoà 2 clip trong --hoa giây quanh mốc. Các clip khớp động tác,
//       nên hoà hình trông như bộ đồ biến dần trên người.
//     --flash: độ chớp sáng, 0 = tắt. --flash-cat: chỉ chớp ở các điểm cắt này (đánh số từ 1), mặc định mọi điểm.
//     --zoom: mức phóng to ở điểm cắt. --zoom-cat: chỉ phóng to ở các điểm này. --zoom-tg: số giây phóng to giảm dần,
//       mặc định 0,25. Cả 2 nhận 1 số hoặc danh sách theo điểm cắt. Zoom giật ở điểm 1, giữ điểm khác:
//       --zoom 0.18,0.08,0.08 --zoom-tg 0.12,0.25,0.25.
//     Ghi ảnh khung quanh từng điểm cắt vào <video>-kiem-tra/.
//     --bat-dau <giây,giây,...> --nhac <clip mẫu gốc>: dựng từ các đoạn ngắn của lệnh cat-mau. Mốc i là giây trên clip mẫu gốc
//       ứng với khung 0 của clip i. Nhạc lấy từ --nhac. Mốc --cat vẫn tính trên clip mẫu gốc.
//
//   node bien-hinh.mjs cat-mau <clip mẫu> --cat <giây,...> [--som 1.5] [--bat-dau <giây,...>] [--du 0.3] [--out <thư mục>]
//     Cắt clip mẫu thành N đoạn để chạy aidancing riêng từng đoạn, thay cho N clip full (người dùng đồng ý ngày 2026-11-08).
//     Đoạn 1 bắt đầu ở giây 0. Đoạn i bắt đầu sớm hơn mốc đổi đồ i−1 khoảng --som giây, để ảnh ghép lấy khung mặt đẹp
//     và khung mặt bị che ở mốc vẫn có video. Đoạn i kết thúc sau mốc i thêm --du giây (để hoà hình).
//     Lần đầu chạy không có --bat-dau: script ghi ảnh khung trước mỗi mốc, Claude chọn khung mặt nhìn thẳng, mắt mở, rồi
//     chạy lại với --bat-dau. In số giây tính tiền của từng đoạn (gói 10/15/20/25) và lệnh dung để ghép.

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
  const opts = { clips: [], flash: 0.55, hieuUng: 'chop', hoa: 0.25 };
  opts.cmd = argv[0];
  for (let i = 1; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out') opts.out = argv[++i];
    else if (a === '--cat') opts.cat = argv[++i].split(',').map(Number);
    else if (a === '--flash-cat') opts.flashCat = argv[++i].split(',').map(Number);
    else if (a === '--zoom-cat') opts.zoomCat = argv[++i].split(',').map(Number);
    else if (a === '--hieu-ung') opts.hieuUng = argv[++i];
    else if (a === '--bat-dau') opts.batDau = argv[++i].split(',').map(Number);
    else if (a === '--nhac') opts.nhac = argv[++i];
    else if (a === '--zoom') opts.zoom = argv[++i].split(',').map(Number);
    else if (a === '--zoom-tg') opts['zoom-tg'] = argv[++i].split(',').map(Number);
    else if (['--flash', '--hoa', '--som', '--du'].includes(a)) opts[a.slice(2)] = Number(argv[++i]);
    else opts.clips.push(a);
  }
  if (!['phan-tich', 'dung', 'cat-mau'].includes(opts.cmd)) die('Lệnh phải là phan-tich, dung hoặc cat-mau. Xem đầu file để biết cách dùng.');
  if (!['chop', 'hoa-hinh'].includes(opts.hieuUng)) die('--hieu-ung phải là chop hoặc hoa-hinh.');
  if (opts.cmd === 'cat-mau') {
    if (opts.clips.length !== 1) die('cat-mau nhận đúng 1 clip mẫu.');
  } else if (opts.clips.length < 2) die('Cần ít nhất 2 clip.');
  if (opts.nhac && !fs.existsSync(opts.nhac)) die(`Không thấy clip nhạc: ${opts.nhac}`);
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
  // Mặc định: clip nằm trong <thư mục video>/clip/ thì ghi vào <thư mục video>/phan-tich/, không thì phan-tich/ cạnh clip1.
  const clipDir = path.dirname(path.resolve(clips[0]));
  const outDir = opts.out ?? path.join(path.basename(clipDir) === 'clip' ? path.dirname(clipDir) : clipDir, 'phan-tich');
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

  // Lệch khung của từng clip so với clip mẫu gốc: khung F của video ra = khung F − lech[i] của clip i.
  if (opts.batDau && (opts.batDau.length !== clips.length || !opts.nhac)) die(`--bat-dau cần đúng ${clips.length} mốc và cần --nhac <clip mẫu gốc>.`);
  const lech = clips.map((_, i) => (opts.batDau ? Math.round(opts.batDau[i] * fps) : 0));
  const frames = clips.map((c) => Math.floor(probe(c).duration * fps));

  // Hoà hình: h khung trước và h khung sau mốc là clip cũ hoà dần sang clip mới, lấy cùng khung của 2 clip.
  const h = opts.hieuUng === 'hoa-hinh' ? Math.max(1, Math.round((opts.hoa * fps) / 2)) : 0;
  for (let j = 0; j < cuts.length; j++) {
    const prev = j ? cuts[j - 1] : 0;
    if (cuts[j] - h <= prev + h) die('Các mốc quá gần nhau so với --hoa.');
    // Clip j phải có tới khung cuts[j]+h, clip j+1 phải bắt đầu trước khung cuts[j]−h.
    if (cuts[j] + h > lech[j] + frames[j]) die(`Clip ${j + 1} hết trước mốc ${fmt(cuts[j] / fps)} s (+hoà). Cắt đoạn dài hơn (--du).`);
    if (cuts[j] - h < lech[j + 1]) die(`Clip ${j + 2} bắt đầu sau mốc ${fmt(cuts[j] / fps)} s (−hoà). Đặt --bat-dau sớm hơn.`);
  }

  // Hiệu ứng ở mỗi điểm cắt c: chớp sáng giảm dần trong 0,15 s, phóng to giảm dần trong 0,25 s.
  // Với hoà hình, phóng to bắt đầu từ đầu đoạn hoà; chớp vẫn ở đúng mốc.
  const pulse = (c, d) => `if(between(t,${c},${c}+${d}),1-(t-${c})/${d},0)`;
  // --zoom-cat: chỉ phóng to ở các điểm cắt này. --zoom-tg: thời gian phóng to giảm dần (nhỏ = giật mạnh hơn).
  // --zoom và --zoom-tg nhận 1 giá trị cho mọi điểm, hoặc danh sách theo từng điểm cắt.
  const per = (arr, j, def) => (arr ? (arr.length > 1 ? arr[j] ?? def : arr[0]) : def);
  const zoomTerms = cuts
    .map((f, j) => ({ c: ((f - h) / fps).toFixed(4), z: per(opts.zoom, j, 0.08), d: per(opts['zoom-tg'], j, 0.25) }))
    .filter((x, j) => x.z > 0 && (!opts.zoomCat || opts.zoomCat.includes(j + 1)));
  const Z = zoomTerms.length ? `1+${zoomTerms.map((x) => `${x.z}*${pulse(x.c, x.d + h / fps)}`).join('+')}` : '1';
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
    const start = (i === 0 ? 0 : cuts[i - 1] + h) - lech[i];
    const end = i < cuts.length ? `:end_frame=${cuts[i] - h - lech[i]}` : '';
    parts.push(`[s${i}_0]trim=start_frame=${start}${end},setpts=PTS-STARTPTS[v${i}]`);
    seg.push(`[v${i}]`);
    if (h && i < cuts.length) {
      const a = `[s${i}_${i > 0 ? 2 : 1}]`;
      const b = `[s${i + 1}_1]`;
      const range = (k) => `trim=start_frame=${cuts[i] - h - lech[k]}:end_frame=${cuts[i] + h - lech[k]},setpts=PTS-STARTPTS`;
      const D = ((2 * h) / fps).toFixed(4);
      parts.push(`${a}${range(i)}[ha${i}]`, `${b}${range(i + 1)}[hb${i}]`);
      parts.push(`[ha${i}][hb${i}]blend=all_expr='A*(1-T/${D})+B*(T/${D})'[x${i}]`);
      seg.push(`[x${i}]`);
    }
  });
  parts.push(`${seg.join('')}concat=n=${seg.length}:v=1:a=0[c]`);
  parts.push(`[c]scale=w='trunc(iw*(${Z})/2)*2':h='trunc(ih*(${Z})/2)*2':eval=frame,crop=${width}:${height},eq=brightness='${B}':eval=frame,format=yuv420p[v]`);
  const audio = opts.nhac ? ['-i', opts.nhac] : [];
  ffmpeg([
    ...clips.flatMap((c) => ['-i', c]),
    ...audio,
    '-filter_complex', parts.join(';'),
    '-map', '[v]', '-map', opts.nhac ? `${clips.length}:a?` : '0:a?', '-shortest',
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

// Gói aidancing nhỏ nhất đủ dài cho đoạn: 10, 15, 20, 25 giây.
const goi = (d) => [10, 15, 20, 25].find((g) => g >= d - 0.01);

function catMau(opts) {
  const src = opts.clips[0];
  if (!opts.cat?.length) die('Thiếu --cat <giây,...>: N−1 mốc đổi đồ trên clip mẫu.');
  const { fps, duration } = probe(src);
  const som = opts.som ?? 1.5;
  const du = opts.du ?? 0.3;
  const cuts = opts.cat;
  const n = cuts.length + 1;
  const outDir = opts.out || path.join(path.dirname(src), path.basename(src, path.extname(src)) + '-doan');
  fs.mkdirSync(outDir, { recursive: true });
  const fr = (t) => Math.round(t * fps) / fps; // làm tròn về khung

  if (!opts.batDau) {
    // Ảnh khung trước mỗi mốc: 12 khung trong [mốc − som − 0,5; mốc − som + 0,5], Claude chọn khung mặt đẹp.
    console.log(`Chưa có --bat-dau. Ảnh khung quanh (mốc − ${som} s), chọn khung mặt nhìn thẳng, mắt mở, không bị che:`);
    cuts.forEach((c, j) => {
      const a = Math.max(0, c - som - 0.5);
      const file = path.join(outDir, `truoc-moc-${j + 1}.jpg`);
      ffmpeg(['-ss', String(a), '-t', '1', '-i', src, '-vf', 'fps=12,scale=200:-1,tile=6x2', '-frames:v', '1', file]);
      const moc = Array.from({ length: 12 }, (_, k) => (a + k / 12).toFixed(3)).join(' ');
      console.log(`  mốc ${j + 1} (${c} s): ${file}\n    ô 1–12, trái sang phải, trên xuống dưới: ${moc}`);
    });
    console.log(`Gợi ý: --bat-dau 0,${cuts.map((c) => fr(Math.max(0, c - som)).toFixed(3)).join(',')}`);
    return;
  }
  if (opts.batDau.length !== n) die(`--bat-dau cần đúng ${n} mốc (đoạn 1 thường là 0).`);
  // Làm tròn về đúng thời điểm của khung, giống cách dung tính lệch khung. Không làm tròn thì -ss có thể bỏ qua khung
  // (lỗi gặp ngày 2026-11-08: 8,37 s ở 30 fps là khung 251 = 8,3667 s, -ss 8.369 bắt đầu từ khung 252).
  const starts = opts.batDau.map((t) => +fr(t).toFixed(4));
  for (let i = 1; i < n; i++) {
    if (!(starts[i] < cuts[i - 1])) die(`Đoạn ${i + 1} phải bắt đầu trước mốc ${cuts[i - 1]} s.`);
    if (cuts[i - 1] - starts[i] > 2.5) console.log(`  Lưu ý: đoạn ${i + 1} bắt đầu sớm ${(cuts[i - 1] - starts[i]).toFixed(2)} s, hơn 2,5 s.`);
  }
  let tong = 0;
  const files = [];
  for (let i = 0; i < n; i++) {
    const a = starts[i];
    const b = i < cuts.length ? Math.min(duration, cuts[i] + du) : duration;
    const d = b - a;
    if (d > 25) die(`Đoạn ${i + 1} dài ${d.toFixed(2)} s, quá gói 25 s.`);
    const file = path.join(outDir, `doan-${i + 1}.mp4`);
    // -ss trước -i, trừ 1 ms để không bỏ qua khung đã chọn (như khung-dau.mjs).
    ffmpeg(['-ss', String(Math.max(0, a - 0.5 / fps)), '-i', src, '-t', d.toFixed(3), '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', file]);
    const g = goi(d);
    tong += g;
    files.push(file);
    console.log(`  Đoạn ${i + 1}: ${a.toFixed(3)} → ${b.toFixed(3)} s (${d.toFixed(2)} s, gói ${g} s) → ${file}`);
  }
  const full = n * goi(duration);
  console.log(`Tính tiền: ${tong} giây (${(tong * 0.15).toFixed(2)} credit fast, ${(tong * 0.29).toFixed(2)} quality).`);
  console.log(`So với ${n} clip full: ${full} giây (${(full * 0.15).toFixed(2)} fast, ${(full * 0.29).toFixed(2)} quality).`);
  console.log(`\nSau khi có video aidancing của từng đoạn (theo thứ tự đoạn), ghép bằng:`);
  console.log(`  node bien-hinh.mjs dung --cat ${cuts.join(',')} --bat-dau ${starts.join(',')} --nhac "${src}" --out <video.mp4> <video đoạn 1> ... <video đoạn ${n}>`);
}

const opts = parseArgs(process.argv.slice(2));
if (opts.cmd === 'phan-tich') phanTich(opts);
else if (opts.cmd === 'cat-mau') catMau(opts);
else dung(opts);
