#!/usr/bin/env node
// Google Images qua Chrome CDP: tìm ảnh thật của loài, chụp trang kết quả để Claude xem trước khi viết kịch bản.
//
// CLI:
//   node anh-google.mjs <thư mục lưu> "<từ khoá 1>" ["<từ khoá 2>" ...]
//   Mỗi từ khoá lưu 1 ảnh google-01.png, google-02.png... Script mở tab nền và đóng tab sau khi chụp.

import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright-core';

const CHROME_CDP_URL = process.env.CHROME_CDP_URL || 'http://127.0.0.1:9222';

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

async function main() {
  const [outDir, ...queries] = process.argv.slice(2);
  if (!outDir || !queries.length) {
    console.error('Cách dùng: node anh-google.mjs <thư mục lưu> "<từ khoá 1>" ["<từ khoá 2>" ...]');
    process.exit(1);
  }
  await fs.mkdir(outDir, { recursive: true });
  const browser = await connect();
  const page = await newBackgroundPage(browser.contexts()[0]);
  try {
    await page.setViewportSize({ width: 1280, height: 1600 });
    for (const [i, q] of queries.entries()) {
      // udm=2 là tab Hình ảnh của Google.
      await page.goto(`https://www.google.com/search?udm=2&q=${encodeURIComponent(q)}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3_000);
      const out = path.join(outDir, `google-${String(i + 1).padStart(2, '0')}.png`);
      await page.screenshot({ path: out });
      console.log(`${out}  ←  ${q}`);
    }
  } finally {
    // Không gọi browser.close(): với Chrome của người dùng, lệnh này đóng luôn cửa sổ đã đăng nhập.
    await page.close().catch(() => {});
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
