// Ghép video kể chuyện: mỗi cảnh dài bằng câu đọc + 0,6 s, giọng đọc Diễm My, tiếng Flow nhỏ làm nền, phụ đề, xoá dấu Flow.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const dur = (f) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());
const lines = fs.readFileSync('loi.txt', 'utf8').split(/\r?\n/).filter(Boolean);
const VDIR = process.env.VDIR || 'voice', OUT = process.env.OUT || 'ke-chuyen-am-thuc-viet.mp4', SLOW = Number(process.env.SLOW || 1);
const L = lines.map((_, i) => dur(`${VDIR}/L${i + 1}.wav`));
const GAP = Number(process.env.GAP || 0.6), LEAD = 0.3, END_HOLD = 2.2;
// [clip, bắt đầu cắt trong clip, độ dài]
const segs = [];
segs.push(['S1', 0.4, L[0] + GAP]);
segs.push(['S2', 0.3, L[1] + GAP]);
segs.push(['S3', 0.2, L[2] + GAP]);
const d4 = (L[3] + GAP) / 3;
segs.push(['S4a', 0.8, d4], ['S4b', 0.8, d4], ['S4c', 0.8, d4]);
segs.push(['S5', 0.2, L[4] + GAP]);
segs.push(['S6', 0.2, L[5] + GAP]);
segs.push(['S7', 0.2, Math.min(L[6] + GAP + END_HOLD, 7.7)]);
// mốc bắt đầu của mỗi câu = mốc bắt đầu cảnh tương ứng
const sceneOfLine = [0, 1, 2, 3, 6, 7, 8];
const starts = []; let t = 0; for (const s of segs) { starts.push(t); t += s[2]; }
const total = t;
const wrap = (s, n = 26) => { const w = s.split(' '); const out = []; let cur = ''; for (const x of w) { if ((cur + ' ' + x).trim().length > n) { out.push(cur.trim()); cur = x; } else cur += ' ' + x; } if (cur.trim()) out.push(cur.trim()); return out.join('\n'); };
const inputs = []; const fc = [];
segs.forEach(([c, ss, d], i) => {
  // Làm chậm hình ít nhất SLOW lần; cảnh dài hơn clip thì chậm thêm cho đủ.
  const f = Math.max(SLOW, d / (dur(`clips/${c}.mp4`) - ss - 0.05));
  inputs.push('-ss', String(ss), '-i', `clips/${c}.mp4`);
  fc.push(`[${i}:v]setpts=(PTS-STARTPTS)*${f.toFixed(4)},fps=30,trim=duration=${d.toFixed(3)},setpts=PTS-STARTPTS,format=yuv420p[v${i}];[${i}:a]asetpts=PTS-STARTPTS,atempo=${(1 / f).toFixed(4)},atrim=duration=${d.toFixed(3)},asetpts=PTS-STARTPTS,aresample=48000,volume=0.22[a${i}]`);
});
const n = segs.length;
fc.push(`${segs.map((_, i) => `[v${i}][a${i}]`).join('')}concat=n=${n}:v=1:a=1[vc][bg]`);
let v = `[vc]delogo=x=852:y=1692:w=96:h=96`;
lines.forEach((s, i) => {
  fs.writeFileSync(`sub/L${i + 1}.txt`, wrap(s));
  const a = starts[sceneOfLine[i]] + LEAD, b = a + L[i] + 0.15;
  v += `,drawtext=fontfile=font.ttf:textfile=sub/L${i + 1}.txt:fontsize=58:line_spacing=12:text_align=C:fontcolor=white:borderw=3:bordercolor=black@0.6:shadowcolor=black@0.5:shadowx=2:shadowy=2:x=(w-text_w)/2:y=h*0.74:enable='between(t,${a.toFixed(2)},${b.toFixed(2)})'`;
});
fs.writeFileSync('sub/ten.txt', 'Từ Hạt Đến Mâm');
const endA = (total - END_HOLD + 0.2).toFixed(2);
v += `,drawtext=fontfile=font.ttf:textfile=sub/ten.txt:fontsize=110:fontcolor=white:borderw=4:bordercolor=black@0.5:x=(w-text_w)/2:y=h*0.40:alpha='min(1,(t-${endA})/0.6)':enable='gte(t,${endA})'`;
v += `,fade=t=in:st=0:d=0.5,fade=t=out:st=${(total - 0.6).toFixed(2)}:d=0.6[vout]`;
// giọng đọc
lines.forEach((_, i) => inputs.push('-i', `${VDIR}/L${i + 1}.wav`));
const vo = lines.map((_, i) => { const ms = Math.round((starts[sceneOfLine[i]] + LEAD) * 1000); return `[${n + i}:a]aresample=48000,adelay=${ms}|${ms},volume=1.6[n${i}]`; });
fc.push(v, ...vo, `[bg]${lines.map((_, i) => `[n${i}]`).join('')}amix=inputs=${lines.length + 1}:normalize=0:duration=first,afade=t=out:st=${(total - 0.8).toFixed(2)}:d=0.8,alimiter=limit=0.95[aout]`);
fs.writeFileSync('ghep.filter', fc.join(';\n'));
execFileSync('ffmpeg', ['-v', 'error', '-y', ...inputs, '-filter_complex_script', 'ghep.filter', '-map', '[vout]', '-map', '[aout]', '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', OUT], { stdio: 'inherit' });
console.log('total', total.toFixed(2), 'starts', starts.map((x) => x.toFixed(2)).join(' '));
