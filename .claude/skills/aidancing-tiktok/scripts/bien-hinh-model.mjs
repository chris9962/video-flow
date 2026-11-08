#!/usr/bin/env node
// Video biến hình bằng 1 job aidancing: model "Copy Chuyển Động + Biến Hình" v7.0 tự đổi ảnh theo mốc giây.
// Cách mặc định cho video thay đồ từ ngày 2026-11-08 (người dùng: "kết quả quá sắc sảo rồi... dùng thẳng model luôn").
// Thay cho N clip aidancing rồi ghép bằng bien-hinh.mjs.
//
// CLI:
//   node bien-hinh-model.mjs --video <clip mẫu.mp4> --anh <ảnh 1> --anh <ảnh 2> ... --moc <giây,giây,...>
//        [--quality fast|quality] [--model 156|157|158] [--out <video.mp4>] [--dry-run]
//   N ảnh theo thứ tự xuất hiện, N−1 mốc đổi ảnh (giây trên clip mẫu). Ảnh 1 hiện từ giây 0.
//   Script chọn model nhỏ nhất đủ số ảnh và đủ dài cho clip:
//     156: 2 ảnh, 10 s, 1,3 / 2,6 credit   157: 4 ảnh, 20 s, 2,6 / 5,2   158: 6 ảnh, 30 s, 3,9 / 7,8  (Nhanh / Chất lượng)
//   Thiếu ảnh so với số ô của model: lặp ảnh cuối ở các ô thừa, mốc thừa đặt sau mốc cuối, nên không thấy đổi thêm.
//   Clip dài hơn mọi model (30 s): model cắt clip. Model 157 cắt clip 24,83 s còn 19,93 s (thử ngày 2026-11-08).
//   Gửi qua cookie đăng nhập aidancing của Chrome CDP (127.0.0.1:9222), không mở tab. Tốn credit: Claude báo và chờ đồng ý.

import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright-core');
const BASE = 'https://aidancing.net';
// Đọc trên trang ngày 2026-11-08: giá cố định mỗi job, không theo giây.
const MODELS = [
  { id: 156, slots: 2, seconds: 10, cost: { fast: 1.3, quality: 2.6 } },
  { id: 157, slots: 4, seconds: 20, cost: { fast: 2.6, quality: 5.2 } },
  { id: 158, slots: 6, seconds: 30, cost: { fast: 3.9, quality: 7.8 } },
];
const t0 = Date.now();
const log = (s) => console.log(`[${((Date.now() - t0) / 1000).toFixed(0)}s] ${s}`);
const die = (s) => {
  console.error(`✗ ${s}`);
  process.exit(1);
};

const opts = { anh: [], quality: 'fast' };
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--anh') opts.anh.push(argv[++i]);
  else if (a === '--moc') opts.moc = argv[++i].split(',').map(Number);
  else if (a === '--dry-run') opts.dryRun = true;
  else if (a === '--model') opts.model = Number(argv[++i]);
  else if (['--video', '--quality', '--out'].includes(a)) opts[a.slice(2)] = argv[++i];
  else die(`Không hiểu tham số: ${a}`);
}
if (!opts.video || !fs.existsSync(opts.video)) die('Thiếu --video <clip mẫu> hoặc không thấy file.');
const n = opts.anh.length;
if (n < 2) die('Cần ít nhất 2 --anh.');
for (const f of opts.anh) if (!fs.existsSync(f)) die(`Không thấy ảnh: ${f}`);
if (!opts.moc || opts.moc.length !== n - 1) die(`--moc cần đúng ${n - 1} mốc giây cho ${n} ảnh.`);
if (opts.moc.some((t, j) => !(t > (j ? opts.moc[j - 1] : 0)))) die('Các mốc phải dương và tăng dần.');
if (!['fast', 'quality'].includes(opts.quality)) die('--quality chỉ nhận fast hoặc quality.');

const duration = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', opts.video], { encoding: 'utf8' }));
const fits = MODELS.filter((m) => m.slots >= n);
if (!fits.length) die(`Tối đa 6 ảnh (model 158). Có ${n} ảnh.`);
const model = opts.model ? fits.find((m) => m.id === opts.model) : fits.find((m) => m.seconds >= duration - 0.05) ?? fits[fits.length - 1];
if (!model) die(`--model ${opts.model} không nhận ${n} ảnh. Dùng 156 (2 ảnh), 157 (4 ảnh) hoặc 158 (6 ảnh).`);
if (duration > model.seconds + 0.05) log(`Lưu ý: clip ${duration.toFixed(2)} s dài hơn ${model.seconds} s của model ${model.id}. Model sẽ cắt video ra còn khoảng ${model.seconds} s.`);
const lastMoc = opts.moc.at(-1);
if (lastMoc >= Math.min(duration, model.seconds)) die(`Mốc cuối ${lastMoc} s nằm ngoài ${Math.min(duration, model.seconds).toFixed(2)} s của video ra.`);
const gaps = [opts.moc[0], ...opts.moc.slice(1).map((t, j) => t - opts.moc[j])];
if (gaps.some((g) => g >= 10)) log('Lưu ý: trang khuyên các mốc cách nhau dưới 10 s.');

// Lấp ô thừa: lặp ảnh cuối, mốc thừa cách nhau 0,5 s sau mốc cuối.
const images = [...opts.anh];
const moc = [...opts.moc];
while (images.length < model.slots) {
  images.push(opts.anh.at(-1));
  moc.push(+(moc.at(-1) + 0.5).toFixed(2));
}
const qualityMode = opts.quality === 'quality' ? '1' : '2';
const cost = model.cost[opts.quality];
log(`Model ${model.id} (${model.slots} ảnh, ${model.seconds} s), ${opts.quality}, ${cost} credit. Ảnh dùng ${n}/${model.slots} ô. Mốc gửi: ${moc.join(', ')}`);
if (opts.dryRun) process.exit(0);

const mime = (f) => (/\.jpe?g$/i.test(f) ? 'image/jpeg' : /\.webp$/i.test(f) ? 'image/webp' : 'image/png');
const file = (f, type) => ({ name: path.basename(f), mimeType: type, buffer: fs.readFileSync(f) });
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const api = browser.contexts()[0].request;
const title = `vf-bh${model.id}-${Date.now().toString(36)}`;
const multipart = { jobTypeId: String(model.id), aspectRatio: '9:16', qualityMode, voiceId: '', title, video: file(opts.video, 'video/mp4') };
images.forEach((f, i) => {
  multipart[`image_${i + 1}`] = file(f, mime(f));
  if (i < moc.length) multipart[`text_${i + 1}`] = String(moc[i]);
});
const res = await api.post(`${BASE}/create/general`, { multipart, maxRedirects: 0, timeout: 5 * 60_000 });
log(`Gửi job ${title} → HTTP ${res.status()} ${res.headers()['location'] || ''}`);
if (res.status() !== 302) die(`Gửi job lỗi: ${(await res.text()).slice(0, 500)}`);

let job;
for (let k = 0; ; k++) {
  const j = await (await api.get(`${BASE}/api/proxy/jobs?page=0&size=20`, { timeout: 30_000 })).json();
  job = j.items.find((x) => x.title === title);
  if (job && ['COMPLETED', 'FAILED'].includes(job.status)) break;
  if (k % 4 === 0) log(job ? `Job ${job.id}: ${job.status}` : 'Chưa thấy job trong danh sách');
  if (k > 240) die('Quá 2 giờ chưa xong.');
  await new Promise((r) => setTimeout(r, 30_000));
}
if (job.status !== 'COMPLETED') die(`Job ${job.id} ${job.status}: ${job.errorMessage ?? ''} (FAILED thì trang hoàn credit)`);
const out = opts.out ?? path.resolve(import.meta.dirname, '..', '..', '..', '..', 'videos', 'aidancing', `bien-hinh-${model.id}-${job.id}.mp4`);
fs.mkdirSync(path.dirname(out), { recursive: true });
const f = await api.get(`${BASE}/api/proxy/files/${job.outputFileId}`, { timeout: 10 * 60_000 });
fs.writeFileSync(out, await f.body());
log(`✓ Job ${job.id}, ${job.actualCost} credit → ${out}`);
process.exit(0);
