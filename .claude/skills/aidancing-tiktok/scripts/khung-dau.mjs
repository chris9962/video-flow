#!/usr/bin/env node
// Chọn khung đầu cho ảnh dáng. aidancing mở video bằng ảnh ghép rồi chạy clip từ giây 0,
// nên chọn khung ở giây t thì phải cắt clip từ giây t, không chỉ đổi frameTime của block Ghép mẫu.
// Chỉ dùng ffmpeg (≥ 6.0, cần filter blurdetect) và Node để chạy được cả trên Windows (người dùng yêu cầu ngày 2026-11-05).
//
// CLI:
//   node khung-dau.mjs <clip.mp4> [--giay 3] [--fps 5]
//     Lưới các ô trong N giây đầu. Mỗi ô là khung nét nhất trong 1/fps giây. In mốc --tu và độ mờ của từng ô.
//   node khung-dau.mjs <clip.mp4> --quanh <giây>
//     Lưới mọi khung trong ±0,1 giây quanh mốc đó, để tìm khung mắt mở khi khung nét nhất đang chớp mắt.
//   node khung-dau.mjs <clip.mp4> --tu <giây>
//     Cắt clip từ giây đó, ghi <tên>-tu-<giây>s.mp4 cạnh clip gốc.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

const COLS = 5;

function parseArgs(argv) {
  const opts = { giay: 3, fps: 5 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (['--giay', '--fps', '--tu', '--quanh'].includes(a)) opts[a.slice(2)] = Number(argv[++i]);
    else if (!opts.clip) opts.clip = a;
    else throw new Error(`Không hiểu tham số: ${a}`);
  }
  if (!opts.clip || !fs.existsSync(opts.clip)) throw new Error(`Không thấy clip: ${opts.clip}`);
  for (const k of ['giay', 'fps', 'tu', 'quanh']) {
    if (opts[k] !== undefined && !(opts[k] >= 0)) throw new Error(`--${k} phải là số ≥ 0`);
  }
  return opts;
}

const ffmpeg = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: ['ignore', 'ignore', 'inherit'] });
const duration = (file) =>
  Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim());

// buoc = 0: mỗi khung là 1 ô.
function luoiKhung({ clip, dir, tu, den, buoc }) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  // Clip nhảy quay đêm mờ do chuyển động ở nhiều khung, nên mỗi ô lấy khung có blur nhỏ nhất. Khung lẻ giữ độ phân giải gốc để soi mắt.
  const out = spawnSync('ffmpeg', [
    '-v', 'error', '-i', clip, '-t', String(den),
    '-vf', 'blurdetect=block_width=32:block_height=32,metadata=print:key=lavfi.blur:file=-', '-f', 'null', '-',
  ], { encoding: 'utf8' });
  // -t vẫn cho khung ở đúng mốc den đi qua filter.
  const frames = [...`${out.stdout}${out.stderr}`.matchAll(/frame:(\d+)\s+pts:\S+\s+pts_time:([\d.]+)\s+lavfi\.blur=([\d.]+)/g)]
    .map((m) => ({ n: Number(m[1]), t: Number(m[2]), blur: Number(m[3]) }))
    .filter((f) => f.t >= tu - 0.001 && f.t < den);
  if (frames.length === 0) throw new Error(`blurdetect không trả số liệu (ffmpeg phải ≥ 6.0)\n${out.stderr.slice(-800)}`);
  const best = new Map();
  for (const f of frames) {
    const o = buoc ? Math.floor(f.t / buoc + 1e-6) : f.n;
    if (!best.has(o) || f.blur < best.get(o).blur) best.set(o, f);
  }
  const chon = [...best.values()].sort((a, b) => a.t - b.t);
  ffmpeg(['-i', clip, '-t', String(den), '-vf', `select='${chon.map((f) => `eq(n\\,${f.n})`).join('+')}'`,
    '-fps_mode', 'vfr', '-q:v', '2', path.join(dir, 'k%02d.jpg')]);
  const n = fs.readdirSync(dir).filter((f) => /^k\d+\.jpg$/.test(f)).length;
  if (n !== chon.length) throw new Error(`Trích được ${n} khung, cần ${chon.length}`);
  const luoi = path.join(dir, 'luoi.jpg');
  ffmpeg(['-i', path.join(dir, 'k%02d.jpg'), '-vf', `scale=-2:480,tile=${COLS}x${Math.ceil(n / COLS)}`, '-frames:v', '1', luoi]);
  console.log(`Ảnh lưới: ${luoi}`);
  const moiO = buoc ? `Mỗi ô là khung nét nhất trong ${buoc.toFixed(2)} giây` : 'Mỗi ô là 1 khung';
  console.log(`${n} ô, ${COLS} cột, đọc từ trái sang phải, từ trên xuống dưới. ${moiO}; mờ càng nhỏ càng nét:`);
  chon.forEach((f, i) => {
    console.log(`  ô ${i + 1} (hàng ${Math.floor(i / COLS) + 1}, cột ${(i % COLS) + 1}): --tu ${f.t.toFixed(3)} · mờ ${f.blur.toFixed(2)} → ${path.join(dir, `k${String(i + 1).padStart(2, '0')}.jpg`)}`);
  });
}

function catClip({ clip, tu }) {
  if (tu === 0) {
    console.log(`Giây 0: dùng clip gốc ${clip}`);
    return;
  }
  const { dir, name } = path.parse(clip);
  const out = path.join(dir, `${name}-tu-${tu}s.mp4`);
  // -ss đặt trước -i kèm mã hoá lại cho khung đầu đúng giây đã chọn, không lùi về keyframe gần nhất.
  // Trừ 1 ms vì mốc in ra đã làm tròn 3 chữ số: 0.46667 in thành 0.467 thì -ss bỏ mất chính khung đó.
  ffmpeg(['-ss', String(Math.max(0, tu - 0.001)), '-i', clip, '-c:v', 'libx264', '-preset', 'fast', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out]);
  console.log(`Clip đã cắt: ${out}`);
  console.log(`Độ dài: ${duration(clip).toFixed(2)} → ${duration(out).toFixed(2)} giây`);
}

const opts = parseArgs(process.argv.slice(2));
const { dir: thuMuc, name } = path.parse(opts.clip);
if (opts.tu !== undefined) catClip(opts);
else if (opts.quanh !== undefined) {
  luoiKhung({ clip: opts.clip, dir: path.join(thuMuc, `${name}-quanh-${opts.quanh}s`), tu: Math.max(0, opts.quanh - 0.1), den: opts.quanh + 0.101, buoc: 0 });
} else {
  luoiKhung({ clip: opts.clip, dir: path.join(thuMuc, `${name}-khung-dau`), tu: 0, den: opts.giay, buoc: 1 / opts.fps });
}
