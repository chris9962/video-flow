#!/usr/bin/env node
// Đăng 1 video lên TikTok qua TikTok Studio bằng Chrome CDP. Giao diện tiếng Anh của tài khoản @linh_dan_20x, đo thật ngày 2026-11-03.
// Không chạy khi flow.mjs đang tải video: kết nối Playwright mới đổi thư mục tải của Chrome và làm hỏng file tải.
//
// CLI:
//   node dang-tiktok.mjs <video.mp4> --caption "Mô tả #hashtag" --profile <oliver|my> [--dry-run]
//   --dry-run tải video lên và điền mô tả, nhưng không bấm Post. Tab để mở cho người dùng xem.
//   --profile bắt buộc (chủ máy dặn 2026-11-08): tab mở trong profile Chrome của kênh, tài khoản TikTok lấy từ
//   flow-chain-video/scripts/kenh.json. Trang TikTok Studio không chứa đúng tài khoản thì dừng, không đăng.

import fs from 'node:fs';
import { chromium } from 'playwright-core';
import { typeCaption } from './tiktok-caption.mjs';
import { profileInfo, newPageInProfile } from '../../flow-chain-video/scripts/chrome-profile.mjs';

const CHROME_CDP_URL = process.env.CHROME_CDP_URL || 'http://127.0.0.1:9222';
const UPLOAD_URL = 'https://www.tiktok.com/tiktokstudio/upload?from=webapp&tab=video';

const t0 = Date.now();
const step = (s) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s] ${s}`);
const normalize = (s) => s.replace(/\s+/g, ' ').trim();

function parseArgs(argv) {
  const opts = { video: null, caption: null, dryRun: false, profile: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--profile') opts.profile = argv[++i];
    else if (a === '--caption') opts.caption = argv[++i];
    else if (!opts.video) opts.video = a;
    else throw new Error(`Không hiểu tham số: ${a}`);
  }
  if (!opts.video || !fs.existsSync(opts.video)) throw new Error(`Không thấy file video: ${opts.video}`);
  if (!opts.caption?.trim()) throw new Error('Thiếu --caption');
  return opts;
}

// /json/new, ctx.newPage() và page.bringToFront() làm macOS chuyển focus sang Chrome, Target.createTarget với background: true thì không.
async function newBackgroundPage(ctx, url) {
  const mark = `about:blank#${process.pid}-${Date.now()}`;
  const cdp = await ctx.browser().newBrowserCDPSession();
  await cdp.send('Target.createTarget', { url: mark, background: true });
  await cdp.detach();
  for (let i = 0; i < 50; i++) {
    const page = ctx.pages().find((p) => p.url() === mark);
    if (page) {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      return page;
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('Chrome không mở được tab mới.');
}

// Hộp thoại và hướng dẫn tính năng mới hiện ra sau khi tải video xong, không cố định thời điểm, và che nút bên dưới.
async function dismissPopups(page) {
  if (await page.getByText('Turn on automatic content checks?').isVisible().catch(() => false)) {
    // Cancel: không đổi cài đặt kiểm tra tự động của tài khoản.
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    step('Đóng hộp thoại "automatic content checks" bằng Cancel');
  }
  const gotIt = page.getByRole('button', { name: 'Got it', exact: true });
  if (await gotIt.isVisible().catch(() => false)) {
    await gotIt.click();
    step('Đóng hướng dẫn tính năng mới bằng Got it');
  }
}

async function switchState(page, label) {
  return page.evaluate((text) => {
    const el0 = [...document.querySelectorAll('*')].find((e) => e.childElementCount === 0 && e.textContent.trim() === text);
    let el = el0;
    while (el && !el.querySelector('[role="switch"], input[type="checkbox"]')) el = el.parentElement;
    if (!el) return 'không thấy';
    const sw = el.querySelector('[role="switch"], input[type="checkbox"]');
    return sw.getAttribute('aria-checked') ?? String(sw.checked);
  }, label);
}

const opts = parseArgs(process.argv.slice(2));
let browser;
try {
  browser = await chromium.connectOverCDP(CHROME_CDP_URL, { timeout: 5_000 });
} catch {
  throw new Error(`Không kết nối được Chrome tại ${CHROME_CDP_URL}. Chạy: node ~/.claude/skills/flow-chain-video/scripts/launch-chrome.mjs`);
}
const prof = profileInfo(opts.profile);
step(`Profile ${prof.key} (${prof.dir}): TikTok @${prof.tiktok}`);
const page = await newPageInProfile(browser, prof.key, UPLOAD_URL);
// HTML của TikTok Studio chứa handle của tài khoản đang đăng nhập (đo 2026-11-08 với @linh_dan_20x).
let okAccount = false;
for (let i = 0; i < 20 && !okAccount; i++) {
  okAccount = (await page.content()).includes(prof.tiktok);
  if (!okAccount) await page.waitForTimeout(1_000);
}
if (!okAccount) {
  throw new Error(`TikTok Studio trong profile ${prof.key} không phải tài khoản @${prof.tiktok}. Chưa đăng. Tab để mở: ${page.url()}`);
}
const fileInput = page.locator('input[type="file"][accept="video/*"]');
await fileInput.waitFor({ state: 'attached', timeout: 60_000 }).catch(() => {
  throw new Error(`Trang tải lên không có ô chọn video (${page.url()}). Đăng nhập TikTok trong cửa sổ Chrome CDP rồi chạy lại.`);
});

await fileInput.setInputFiles(opts.video);
const deadline = Date.now() + 10 * 60_000;
let lastPct = '';
for (;;) {
  const text = await page.evaluate(() => document.body.innerText);
  if (/Uploaded/.test(text)) break;
  const pct = text.match(/\d+%/)?.[0] ?? '';
  if (pct !== lastPct) step(`Đang tải lên ${pct}`);
  lastPct = pct;
  if (Date.now() > deadline) throw new Error('Tải video lên TikTok quá 10 phút');
  await page.waitForTimeout(3_000);
}
step('Đã tải video lên');
await page.waitForTimeout(1_500);
await dismissPopups(page);

// insertText rồi Escape sau mỗi hashtag làm mất hashtag (đo 2026-11-03). Gõ từng phím thì danh sách gợi ý hashtag tự đóng ở dấu cách.
const editor = page.locator('[contenteditable="true"]').first();
// Gõ lại tối đa 3 lần: ngày 2026-11-08 trên Windows, con trỏ nhảy về đầu ô giữa lúc gõ, mô tả bị đảo đoạn.
let caption = '';
for (let attempt = 1; attempt <= 3; attempt++) {
  await page.waitForTimeout(2_000);
  await editor.click();
  // ControlOrMeta: Meta+A trên Windows không chọn hết, ô mô tả còn tên file (đo 2026-11-08).
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.press('Backspace');
  await page.keyboard.press('End');
  const tagInfo = await typeCaption(page, opts.caption);
  step(`Hashtag thành link: ${tagInfo.linked}/${tagInfo.total}`);
  await page.waitForTimeout(1_000);
  await page.getByText('Who can see this post', { exact: true }).click();
  caption = await editor.innerText();
  if (normalize(caption) === normalize(opts.caption)) break;
  step(`Mô tả lần ${attempt} sai, gõ lại: ${normalize(caption).slice(0, 60)}`);
  await dismissPopups(page);
}
if (normalize(caption) !== normalize(opts.caption)) {
  throw new Error(`Mô tả trên trang khác mô tả cần đăng: ${JSON.stringify(caption)}. Tab để mở, không bấm Post.`);
}
step(`Mô tả: ${normalize(caption)}`);

await dismissPopups(page);
const more = page.getByText('Show more', { exact: true });
if (await more.isVisible().catch(() => false)) await more.click({ timeout: 10_000 });
// Người dùng không muốn gắn nhãn AI (2026-11-03). Script chỉ kiểm tra công tắc đang tắt, không bấm công tắc này.
const aiLabel = await switchState(page, 'AI-generated content');
if (aiLabel !== 'false') throw new Error(`Công tắc AI-generated content không ở trạng thái tắt (${aiLabel}). Tab để mở, không bấm Post.`);
step('Nhãn AI-generated content: tắt');

if (opts.dryRun) {
  step('Dry run: đã điền xong, không bấm Post. Tab TikTok Studio để mở cho người dùng xem.');
  await browser.close();
  process.exit(0);
}

await dismissPopups(page);
await page.getByRole('button', { name: 'Post', exact: true }).click();
await page.waitForURL(/tiktokstudio\/content/, { timeout: 90_000 }).catch(async () => {
  const dialogs = await page.evaluate(() => [...document.querySelectorAll('[role="dialog"]')].map((d) => d.innerText.slice(0, 200)));
  throw new Error(`Đã bấm Post nhưng trang không chuyển sang danh sách bài. Hộp thoại: ${JSON.stringify(dialogs)}`);
});
// Bài mới có mã video lớn nhất: mã video TikTok tăng theo thời gian đăng. Bài ghim nằm trên cùng nên không lấy theo thứ tự.
const head = normalize(opts.caption).slice(0, 15);
await page.waitForFunction((t) => document.body.innerText.includes(t), head, { timeout: 60_000 }).catch(() => {});
const links = await page.evaluate(() => [...new Set([...document.querySelectorAll('a[href*="/video/"]')].map((a) => a.href))]);
const link = links.sort((a, b) => (BigInt(b.split('/video/')[1].split(/[?#]/)[0]) > BigInt(a.split('/video/')[1].split(/[?#]/)[0]) ? 1 : -1))[0];
step(`✓ Đã đăng: ${link ?? 'chưa đọc được link, xem tiktok.com/tiktokstudio/content'}`);
await page.close().catch(() => {});
await browser.close();
