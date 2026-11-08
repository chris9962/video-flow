#!/usr/bin/env node
// Tải video kết quả của job aidancing.net theo mã job, bằng cookie đăng nhập của Chrome CDP. Không mở tab, không tốn credit.
// aidancing.net tự xoá dữ liệu sau 3 ngày.
//
// CLI:
//   node tai-job.mjs <mã job> [<mã job> ...] [--out <thư mục>]
//     Mặc định lưu vào <repo>/videos/aidancing/aidancing-<mã job>.mp4. Git bỏ qua thư mục videos/.

import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright-core';

const BASE = 'https://aidancing.net';
const CDP = process.env.CHROME_CDP_URL || 'http://127.0.0.1:9222';

const args = process.argv.slice(2);
let outDir = path.resolve(import.meta.dirname, '..', '..', '..', '..', 'videos', 'aidancing');
const ids = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--out') outDir = args[++i];
  else if (/^\d+$/.test(args[i])) ids.push(Number(args[i]));
  else throw new Error(`Không hiểu tham số: ${args[i]}`);
}
if (!ids.length) {
  console.error('Cách dùng: node tai-job.mjs <mã job> [<mã job> ...] [--out <thư mục>]');
  process.exit(1);
}

const browser = await chromium.connectOverCDP(CDP, { timeout: 5_000 }).catch(() => {
  throw new Error(`Không kết nối được Chrome CDP tại ${CDP}. Chạy: node ~/.claude/skills/flow-chain-video/scripts/launch-chrome.mjs`);
});
const api = browser.contexts()[0].request;

// Danh sách job phân trang, job mới nhất ở đầu. Đọc tối đa 10 trang × 50 job.
const want = new Set(ids);
const found = new Map();
for (let page = 0; page < 10 && found.size < want.size; page++) {
  const res = await api.get(`${BASE}/api/proxy/jobs?page=${page}&size=50`, { timeout: 30_000 });
  if (res.status() === 401 || res.status() === 403) throw new Error('Chưa đăng nhập aidancing.net trong Chrome CDP.');
  if (!res.ok()) throw new Error(`aidancing.net trả HTTP ${res.status()} khi đọc danh sách job`);
  const items = (await res.json()).items ?? [];
  if (!items.length) break;
  for (const j of items) if (want.has(j.id)) found.set(j.id, j);
}

await fs.mkdir(outDir, { recursive: true });
let failed = 0;
for (const id of ids) {
  const j = found.get(id);
  if (!j) { console.log(`${id}: không thấy trong danh sách job`); failed++; continue; }
  if (j.status !== 'COMPLETED' || !j.outputFileId) { console.log(`${id}: ${j.status}, chưa có file`); failed++; continue; }
  const r = await api.get(`${BASE}/api/proxy/files/${j.outputFileId}`, { timeout: 10 * 60_000 });
  if (!r.ok()) { console.log(`${id}: tải lỗi HTTP ${r.status()}`); failed++; continue; }
  const out = path.join(outDir, `aidancing-${id}.mp4`);
  await fs.writeFile(out, await r.body());
  console.log(`${id}: ✓ ${out}`);
}
// Không gọi browser.close(): lệnh này đóng luôn Chrome của người dùng.
process.exit(failed ? 1 : 0);
