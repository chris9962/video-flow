// Ghép video rùa biển có thuyết minh: mỗi cảnh dài bằng câu đọc + GAP, giọng giong-toi-eng, tiếng Flow nhỏ làm nền, xoá dấu Flow. Không chữ trên hình.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const dur = (f) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());
const lines = fs.readFileSync(process.env.LOI || 'loi.txt', 'utf8').split(/\r?\n/).filter(Boolean);
const OUT = process.env.OUT || 'rua-bien.mp4';
const L = lines.map((_, i) => dur(`${process.env.VDIR || 'voice'}/${i + 1}.wav`));
const GAP = Number(process.env.GAP || 0.6), LEAD = 0.3, END_HOLD = Number(process.env.END_HOLD || 1.0);
const ids = ['M', 'A', 'B', 'C', 'D', 'E', 'F', 'G'];
const ss = { M: 0.2, A: 0.1, B: 0.1, C: 0.1, D: 0.1, E: 0.1, F: 0.1, G: 0.1 };
const segs = ids.map((c, i) => [c, ss[c], L[i] + GAP + (i === ids.length - 1 ? END_HOLD : 0)]);
const starts = []; let t = 0; for (const s of segs) { starts.push(t); t += s[2]; }
const total = t;
const inputs = []; const fc = [];
segs.forEach(([c, s0, d], i) => {
  const fit = d / (dur(`clips/${c}.mp4`) - s0 - 0.05); const f = process.env.FIT ? Math.max(1 / 1.45, fit) : Math.max(1, fit);
  inputs.push('-ss', String(s0), '-i', `clips/${c}.mp4`);
  fc.push(`[${i}:v]setpts=(PTS-STARTPTS)*${f.toFixed(4)},fps=30,trim=duration=${d.toFixed(3)},setpts=PTS-STARTPTS,scale=1080:1920,format=yuv420p[v${i}];[${i}:a]asetpts=PTS-STARTPTS,atempo=${(1 / f).toFixed(4)},atrim=duration=${d.toFixed(3)},asetpts=PTS-STARTPTS,aresample=48000,volume=0.25[a${i}]`);
});
const n = segs.length;
fc.push(`${segs.map((_, i) => `[v${i}][a${i}]`).join('')}concat=n=${n}:v=1:a=1[vc][bg]`);
fc.push(`[vc]delogo=x=852:y=1692:w=96:h=96,fade=t=out:st=${(total - 0.6).toFixed(2)}:d=0.6[vout]`);
lines.forEach((_, i) => inputs.push('-i', `${process.env.VDIR || 'voice'}/${i + 1}.wav`));
const vo = lines.map((_, i) => { const ms = Math.round((starts[i] + LEAD) * 1000); return `[${n + i}:a]aresample=48000,adelay=${ms}|${ms},volume=1.5[n${i}]`; });
fc.push(...vo, `[bg]${lines.map((_, i) => `[n${i}]`).join('')}amix=inputs=${lines.length + 1}:normalize=0:duration=first,afade=t=out:st=${(total - 0.8).toFixed(2)}:d=0.8,loudnorm=I=-14:TP=-1.5:LRA=11[aout]`);
fs.writeFileSync('ghep.filter', fc.join(';\n'));
execFileSync('ffmpeg', ['-v', 'error', '-y', ...inputs, '-filter_complex_script', 'ghep.filter', '-map', '[vout]', '-map', '[aout]', '-c:v', 'libx264', '-crf', '21', '-preset', 'medium', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', OUT], { stdio: 'inherit' });
console.log('total', total.toFixed(2), 'starts', starts.map((x) => x.toFixed(2)).join(' '));
