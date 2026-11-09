#!/usr/bin/env node
// Sửa mô tả 1 bài TikTok đã đăng qua TikTok Studio (trang /tiktokstudio/upload/post/<id>), để hashtag thành link bấm được.
// Đo thật ngày 2026-11-08 với @t.ht.n.mm: trang sửa có ô Caption, nút "Hashtags", "Save", "Cancel".
//
// CLI:
//   node sua-mo-ta-tiktok.mjs <mã video> --caption "Mô tả #hashtag" --profile <oliver|my> [--dry-run]
//   --dry-run gõ mô tả nhưng không bấm Save, tab để mở.

import { chromium } from 'playwright-core';
import { typeCaption, normalizeCaption } from './tiktok-caption.mjs';
import { profileInfo, newPageInProfile } from '../../flow-chain-video/scripts/chrome-profile.mjs';

const t0 = Date.now();
const step = (m) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s] ${m}`);

const argv = process.argv.slice(2);
const opts = { dryRun: false };
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--caption') opts.caption = argv[++i];
  else if (a === '--profile') opts.profile = argv[++i];
  else if (a === '--dry-run') opts.dryRun = true;
  else opts.id = a;
}
if (!opts.id || !/^\d+$/.test(opts.id)) throw new Error('Thiếu mã video (số trong link /video/<mã>)');
if (!opts.caption) throw new Error('Thiếu --caption');
const prof = profileInfo(opts.profile);

const browser = await chromium.connectOverCDP(process.env.CHROME_CDP_URL || 'http://127.0.0.1:9222', { timeout: 5_000 });
const page = await newPageInProfile(browser, prof.key, `https://www.tiktok.com/tiktokstudio/upload/post/${opts.id}?from=creator_center`);
const html = await page.content();
if (prof.tiktok && !html.includes(prof.tiktok.replace(/^@/, ''))) {
  throw new Error(`Trang không chứa tài khoản ${prof.tiktok}. Không sửa.`);
}
const editor = page.locator('[contenteditable="true"]').first();
await editor.waitFor({ timeout: 30_000 });
await page.waitForTimeout(3_000);
step(`Mô tả cũ: ${normalizeCaption(await editor.innerText()).slice(0, 80)}`);

let caption = '';
for (let attempt = 1; attempt <= 3; attempt++) {
  await editor.click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.press('Backspace');
  await page.keyboard.press('End');
  const info = await typeCaption(page, opts.caption);
  await page.waitForTimeout(1_000);
  caption = await editor.innerText();
  const links = await editor.locator('.mention').count();
  step(`Lần ${attempt}: hashtag thành link ${info.linked}/${info.total}, trong ô có ${links} link`);
  if (normalizeCaption(caption) === normalizeCaption(opts.caption)) break;
  step(`Mô tả lần ${attempt} sai: ${normalizeCaption(caption).slice(0, 80)}`);
}
if (normalizeCaption(caption) !== normalizeCaption(opts.caption)) {
  throw new Error(`Mô tả trên trang khác mô tả cần sửa: ${JSON.stringify(caption)}. Tab để mở, không bấm Save.`);
}
if (opts.dryRun) {
  step('Dry run: đã gõ mô tả, không bấm Save.');
  process.exit(0);
}
await page.getByRole('button', { name: 'Save', exact: true }).click();
await page.waitForURL(/tiktokstudio\/content/, { timeout: 60_000 }).catch(() => {});
await page.waitForTimeout(2_000);
step(`✓ Đã lưu mô tả. Trang hiện tại: ${page.url()}`);
await page.close();
process.exit(0);
