#!/usr/bin/env node
// Đăng video lên YouTube Shorts và Thước phim của fanpage Facebook qua Chrome CDP.
// Tiêu đề và mô tả lấy từ dang-bai.md trong thư mục video. Giao diện tiếng Việt, đo thật ngày 2026-10-21.
// Không chạy khi flow.mjs đang tải video: kết nối Playwright mới đổi thư mục tải của Chrome và làm hỏng file tải.
//
// CLI:
//   node dang-bai.mjs <thư mục video> [--youtube] [--facebook] [--video file.mp4] [--dry-run]
//   Không ghi --youtube, --facebook thì đăng cả hai. --dry-run điền mọi trường nhưng không bấm Xuất bản / Đăng.

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const CHROME_CDP_URL = process.env.CHROME_CDP_URL || 'http://127.0.0.1:9222';
const YT_CHANNEL = 'UCyVJDSNhxgezvgYuf82wi6Q';
const FB_PAGE_ID = '61595556214345';
const FB_PAGE_NAME = 'Life Cycle Lab';

const t0 = Date.now();
const step = (s) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s] ${s}`);

async function connect() {
  try {
    return await chromium.connectOverCDP(CHROME_CDP_URL, { timeout: 5_000 });
  } catch (err) {
    // Trên macOS, người dùng đóng hết cửa sổ thì Chrome vẫn chạy với 0 tab, và Playwright không kết nối được.
    if (!/context management is not supported/i.test(err.message)) {
      throw new Error(`Không kết nối được Chrome tại ${CHROME_CDP_URL}. Chạy: node scripts/launch-chrome.mjs`);
    }
    await openBackgroundWindow().catch(() => {});
    return chromium.connectOverCDP(CHROME_CDP_URL, { timeout: 5_000 });
  }
}

// /json/new, ctx.newPage() và page.bringToFront() làm macOS chuyển focus sang Chrome, Target.createTarget với background: true thì không.
// Đo ngày 2026-10-30: tab nền vẫn chạy timer và requestAnimationFrame đủ tốc độ.
async function openBackgroundWindow() {
  const { webSocketDebuggerUrl } = await (await fetch(`${CHROME_CDP_URL}/json/version`)).json();
  const ws = new WebSocket(webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  await new Promise((resolve) => {
    ws.onmessage = resolve;
    ws.send(JSON.stringify({ id: 1, method: 'Target.createTarget', params: { url: 'about:blank', newWindow: true, background: true } }));
  });
  ws.close();
}

async function newBackgroundPage(ctx) {
  // Nhiều script có thể mở tab cùng lúc, nên tìm tab theo URL riêng thay vì chờ sự kiện 'page'.
  const mark = `about:blank#${process.pid}-${Date.now()}`;
  const cdp = await ctx.browser().newBrowserCDPSession();
  await cdp.send('Target.createTarget', { url: mark, background: true });
  await cdp.detach();
  for (let i = 0; i < 50; i++) {
    const page = ctx.pages().find((p) => p.url() === mark);
    if (page) return page;
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('Chrome không mở được tab mới.');
}

function parseArgs(argv) {
  const opts = { dir: null, youtube: false, facebook: false, video: null, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--youtube') opts.youtube = true;
    else if (a === '--facebook') opts.facebook = true;
    else if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--video') opts.video = argv[++i];
    else if (!opts.dir) opts.dir = a;
  }
  if (!opts.youtube && !opts.facebook) opts.youtube = opts.facebook = true;
  return opts;
}

function readSection(md, heading) {
  const lines = md.split('\n');
  const start = lines.findIndex((l) => l.trim() === `## ${heading}`);
  if (start < 0) throw new Error(`dang-bai.md thiếu mục "## ${heading}"`);
  const end = lines.findIndex((l, i) => i > start && l.startsWith('## '));
  const body = lines.slice(start + 1, end < 0 ? undefined : end);
  while (body.length && !body[0].trim()) body.shift();
  while (body.length && !body.at(-1).trim()) body.pop();
  return body;
}

function findVideo(dir) {
  const planFile = path.join(dir, 'plan.json');
  if (fs.existsSync(planFile)) {
    const out = JSON.parse(fs.readFileSync(planFile, 'utf8')).output?.file;
    if (out && fs.existsSync(path.join(dir, out))) return path.join(dir, out);
  }
  return path.join(dir, `${path.basename(dir)}.mp4`);
}

function recordPost(dir, platform, link) {
  const file = path.join(dir, 'dang-bai.md');
  let md = fs.readFileSync(file, 'utf8').replace(/\n*$/, '\n');
  if (!md.includes('\n## Đã đăng\n')) md += '\n## Đã đăng\n\n';
  const d = new Date();
  const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  fs.writeFileSync(file, `${md}- ${platform} ${day}: ${link}\n`);
}

async function typeLines(page, lines, newline) {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i]) await page.keyboard.insertText(lines[i]);
    if (i < lines.length - 1) await page.keyboard.press(newline);
  }
}

async function youtube(ctx, video, title, desc, dryRun) {
  const page = await newBackgroundPage(ctx);
  await page.goto(`https://studio.youtube.com/channel/${YT_CHANNEL}/videos/upload?d=ud`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  const input = page.locator('input[type="file"]').first();
  await input.waitFor({ state: 'attached', timeout: 30_000 });
  await page.waitForTimeout(2_000);
  await input.setInputFiles(video);
  step('YouTube: đã chọn file');
  const titleBox = page.locator('#title-textarea #textbox').first();
  await titleBox.waitFor({ timeout: 60_000 });
  await page.waitForTimeout(2_000);
  await titleBox.click();
  await page.keyboard.press('Meta+A');
  await page.keyboard.insertText(title);
  await page.locator('#description-textarea #textbox').first().click();
  await page.keyboard.press('Meta+A');
  await page.keyboard.press('Backspace');
  await typeLines(page, desc, 'Enter');
  await page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first().click();
  // Ô "nội dung chỉnh sửa / tạo bằng AI" nằm trong phần "Hiện thêm", phải mở phần này trước.
  const altered = page.locator('tp-yt-paper-radio-button[name="VIDEO_HAS_ALTERED_CONTENT_YES"]').first();
  if (!(await altered.isVisible().catch(() => false))) {
    await page.locator('#toggle-button').first().click().catch(() => {});
    await page.waitForTimeout(1_500);
  }
  await altered.scrollIntoViewIfNeeded().catch(() => {});
  await altered.click({ timeout: 10_000 });
  await page.waitForTimeout(1_000);
  const vals = await page.evaluate(() => ({
    title: document.querySelector('#title-textarea #textbox')?.innerText,
    notForKids: document.querySelector('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]')?.getAttribute('aria-checked'),
    ai: document.querySelector('tp-yt-paper-radio-button[name="VIDEO_HAS_ALTERED_CONTENT_YES"]')?.getAttribute('aria-checked'),
    link: document.querySelector('.video-url-fadeable a, a.ytcp-video-info')?.href,
  }));
  if (vals.title !== title || vals.notForKids !== 'true' || vals.ai !== 'true') {
    throw new Error(`YouTube: trường chi tiết sai, chưa xuất bản: ${JSON.stringify(vals)}`);
  }
  step('YouTube: đã điền tiêu đề, mô tả, không dành cho trẻ em, AI = Có');
  if (dryRun) {
    step('YouTube: --dry-run, dừng trước bước xuất bản. Video nằm trong Studio dạng bản nháp.');
    return null;
  }
  for (let i = 0; i < 3; i++) {
    await page.locator('#next-button').first().click();
    await page.waitForTimeout(1_500);
  }
  const pub = page.locator('tp-yt-paper-radio-button[name="PUBLIC"]').first();
  await pub.waitFor({ timeout: 15_000 });
  await pub.click();
  if ((await pub.getAttribute('aria-checked')) !== 'true') throw new Error('YouTube: chưa chọn được Công khai');
  for (let i = 0; i < 60; i++) {
    const p = await page.locator('.progress-label').first().innerText().catch(() => '');
    if (!/Đang tải|Uploading|\d+\s*%/i.test(p)) break;
    if (i % 3 === 0) step(`YouTube: ${p.trim()}`);
    await page.waitForTimeout(5_000);
  }
  await page.locator('#done-button').first().click();
  await page.waitForTimeout(6_000);
  const link = (await page.evaluate(() => [...document.querySelectorAll('a')].map((a) => a.href).find((h) => /youtube\.com\/shorts\/|youtu\.be\//.test(h)))) || vals.link;
  step(`YouTube: đã xuất bản ${link}`);
  await page.close().catch(() => {});
  return link;
}

async function fbReelIds(page) {
  await page.goto(`https://www.facebook.com/profile.php?id=${FB_PAGE_ID}&sk=reels_tab`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8_000);
  return page.locator('a[href*="/reel/"]').evaluateAll((els) => [...new Set(els.map((a) => a.href.match(/\/reel\/(\d+)/)?.[1]).filter(Boolean))]);
}

async function facebook(ctx, video, caption, dryRun) {
  const page = await newBackgroundPage(ctx);
  const before = await fbReelIds(page);
  await page.goto('https://www.facebook.com/reels/create/', { waitUntil: 'domcontentloaded' });
  const add = page.getByRole('button', { name: /Thêm video|Add video/ }).first();
  await add.waitFor({ timeout: 30_000 });
  // reels/create đăng dưới tên đang dùng. Nếu Facebook đang ở trang cá nhân, video lên trang cá nhân thay vì fanpage.
  const actor = await page.evaluate((name) => document.body.innerText.includes(`${name} ơi`) || document.body.innerText.includes(`, ${name}?`), FB_PAGE_NAME);
  if (!actor) {
    throw new Error(`Facebook đang không dùng tên trang "${FB_PAGE_NAME}". Mở https://www.facebook.com/profile.php?id=${FB_PAGE_ID} và chuyển sang trang, rồi chạy lại.`);
  }
  const chooser = page.waitForEvent('filechooser', { timeout: 15_000 });
  await add.click();
  await (await chooser).setFiles(video);
  step('Facebook: đã chọn file');
  const editor = page.locator('[contenteditable="true"][role="textbox"]').first();
  await editor.waitFor({ timeout: 30_000 });
  await editor.click();
  // Enter trong ô này có thể gửi bài; Shift+Enter chỉ xuống dòng.
  await typeLines(page, caption, 'Shift+Enter');
  await page.keyboard.press('Escape');
  const typed = (await editor.innerText()).replace(/\s+/g, ' ').trim();
  if (typed !== caption.join(' ').replace(/\s+/g, ' ').trim()) throw new Error(`Facebook: nội dung trong ô khác dang-bai.md, chưa đăng:\n${typed}`);
  // Nút Tiếp bật ngay khi chọn file, trước khi bản xem trước tải xong. Chờ thẻ video có dữ liệu.
  await page.waitForFunction(() => [...document.querySelectorAll('video')].some((v) => v.readyState >= 1), null, { timeout: 120_000 });
  step('Facebook: đã điền nội dung, bản xem trước đã tải');
  await page.getByRole('button', { name: /^(Tiếp|Next)$/ }).first().click();
  await page.waitForTimeout(3_000);
  const aiSwitch = page
    .locator('div')
    .filter({ has: page.getByText(/^(Thêm nhãn AI|Add AI label)$/) })
    .filter({ has: page.locator('input[type="checkbox"]') })
    .last()
    .locator('input[type="checkbox"]')
    .first();
  if (!(await aiSwitch.isChecked())) await aiSwitch.click({ force: true });
  await page.waitForTimeout(1_500);
  const audience = await page.getByRole('button', { name: /Đối tượng của bài viết|Post audience/ }).first().innerText().catch(() => '');
  if (!(await aiSwitch.isChecked()) || !/Công khai|Public/.test(audience)) {
    throw new Error(`Facebook: nhãn AI hoặc đối tượng sai, chưa đăng. Đối tượng: "${audience.replace(/\s+/g, ' ')}"`);
  }
  step('Facebook: nhãn AI bật, đối tượng Công khai');
  if (dryRun) {
    step('Facebook: --dry-run, dừng trước nút Đăng. Tab Tạo thước phim để mở.');
    return null;
  }
  await page.getByRole('button', { name: /^(Đăng|Post|Share)$/ }).first().click();
  await page.waitForURL((u) => !u.href.includes('/reels/create'), { timeout: 120_000 });
  step('Facebook: đã bấm Đăng');
  for (let i = 0; i < 3; i++) {
    const id = (await fbReelIds(page)).find((x) => !before.includes(x));
    if (id) {
      const link = `https://www.facebook.com/reel/${id}/`;
      step(`Facebook: đã đăng ${link}`);
      await page.close().catch(() => {});
      return link;
    }
    await page.waitForTimeout(10_000);
  }
  step('Facebook: đã đăng, nhưng tab Reels chưa hiện thước phim mới. Xem lại trang sau vài phút.');
  await page.close().catch(() => {});
  return `https://www.facebook.com/profile.php?id=${FB_PAGE_ID}&sk=reels_tab`;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.dir) {
    console.log('Cách dùng: node dang-bai.mjs <thư mục video> [--youtube] [--facebook] [--video file.mp4] [--dry-run]');
    process.exit(1);
  }
  const dir = path.resolve(opts.dir);
  const md = fs.readFileSync(path.join(dir, 'dang-bai.md'), 'utf8');
  const title = readSection(md, 'Tiêu đề').find((l) => l.trim()).trim();
  const desc = readSection(md, 'Mô tả');
  const video = path.resolve(opts.video || findVideo(dir));
  if (!fs.existsSync(video)) throw new Error(`Không thấy video: ${video}`);
  // Facebook không có ô tiêu đề riêng, và không có nút Subscribe như YouTube.
  const caption = [title, ...desc.map((l) => l.replace(/^Subscribe\b/, 'Follow').replace(/#shorts\b/g, '#reels'))];
  step(`Video: ${video}`);
  step(`Tiêu đề: ${title}`);

  const ctx = (await connect()).contexts()[0];
  if (opts.youtube) {
    const link = await youtube(ctx, video, title, desc, opts.dryRun);
    if (link) recordPost(dir, 'YouTube', link);
  }
  if (opts.facebook) {
    const link = await facebook(ctx, video, caption, opts.dryRun);
    if (link) recordPost(dir, 'Facebook', link);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(`✗ ${err.message}`);
  process.exit(1);
});
