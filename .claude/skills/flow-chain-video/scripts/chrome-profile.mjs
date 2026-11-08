#!/usr/bin/env node
// Mở tab trong đúng profile Chrome CDP. Đo ngày 2026-11-08:
// - Chrome CDP chạy nhiều profile trong 1 tiến trình. Mỗi profile là 1 browserContextId.
// - Playwright gộp tab của mọi profile vào browser.contexts()[0].
// - Target.createTarget chỉ mở tab trong context mặc định. Truyền browserContextId của profile khác thì lỗi
//   "Failed to find browser context". Context mặc định là profile mở cửa sổ đầu tiên, không chắc là profile
//   trong cờ --profile-directory.
// - Mở tab trong profile khác: gọi window.open (userGesture) từ 1 tab có sẵn của profile đó.
// - Xác định profile của 1 tab: mở chrome://version, đọc dòng "Profile Path".
//
// CLI:
//   node chrome-profile.mjs          liệt kê profile đang mở, số tab, profile mặc định
//   node chrome-profile.mjs <oliver|my>   mở thử 1 tab trong profile đó rồi đóng

import fs from 'node:fs';
import path from 'node:path';
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const CHROME_CDP_URL = process.env.CHROME_CDP_URL || 'http://127.0.0.1:9222';
export const KENH = JSON.parse(fs.readFileSync(path.join(HERE, 'kenh.json'), 'utf8'));

export function profileInfo(key) {
  const p = KENH[key];
  if (!key || key.startsWith('_') || !p) {
    const keys = Object.keys(KENH).filter((k) => !k.startsWith('_'));
    throw new Error(`Thiếu hoặc sai --profile "${key ?? ''}". Chọn: ${keys.map((k) => `${k} (${KENH[k].telegram})`).join(', ')}.`);
  }
  return { key, ...p };
}

export async function connectCdp() {
  try {
    return await chromium.connectOverCDP(CHROME_CDP_URL, { timeout: 5_000 });
  } catch (err) {
    throw new Error(`Không kết nối được Chrome tại ${CHROME_CDP_URL} (${err.message.split(/\r?\n/)[0]}).`);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function contextIdOf(page) {
  const s = await page.context().newCDPSession(page);
  try {
    return (await s.send('Target.getTargetInfo')).targetInfo.browserContextId;
  } finally {
    await s.detach().catch(() => {});
  }
}

async function waitPage(ctx, mark) {
  for (let i = 0; i < 50; i++) {
    const page = ctx.pages().find((p) => p.url() === mark);
    if (page) return page;
    await sleep(200);
  }
  throw new Error('Chrome không mở được tab mới.');
}

// Đọc thư mục profile của tab, ví dụ "Profile 2". Tab sẽ được dùng tiếp nên không đóng.
async function profileDirOf(page) {
  await page.goto('chrome://version', { waitUntil: 'domcontentloaded' });
  const p = await page.evaluate(() => document.querySelector('#profile_path')?.innerText || document.body.innerText);
  const m = p.match(/[\\/]([^\\/\r\n]+)\s*$/m) || p.match(/Profile Path\s*([^\r\n]+)/);
  return m ? path.basename(m[1].trim()) : null;
}

// Tab nền trong context mặc định.
async function newDefaultPage(browser) {
  const ctx = browser.contexts()[0];
  const mark = `about:blank#p${process.pid}-${Date.now()}`;
  const cdp = await browser.newBrowserCDPSession();
  await cdp.send('Target.createTarget', { url: mark, background: true });
  await cdp.detach();
  return waitPage(ctx, mark);
}

// Tab mới cùng profile với tab `opener`. Tab mới hiện lên trước trong cửa sổ của profile đó.
async function newPageBeside(opener) {
  const ctx = opener.context();
  const mark = `about:blank#p${process.pid}-${Date.now()}`;
  const s = await ctx.newCDPSession(opener);
  try {
    await s.send('Runtime.evaluate', { expression: `window.open(${JSON.stringify(mark)}, '_blank')`, userGesture: true });
  } finally {
    await s.detach().catch(() => {});
  }
  return waitPage(ctx, mark);
}

// Liệt kê tab http(s) theo browserContextId.
async function tabsByContext(browser) {
  const groups = new Map();
  for (const p of browser.contexts()[0].pages()) {
    if (!/^https?:/.test(p.url())) continue;
    const id = await contextIdOf(p).catch(() => null);
    if (!id) continue;
    if (!groups.has(id)) groups.set(id, []);
    groups.get(id).push(p);
  }
  return groups;
}

// Mở 1 tab trong profile `key` (oliver|my), đi tới `url` nếu có. Báo lỗi nếu không mở được đúng profile.
export async function newPageInProfile(browser, key, url) {
  const want = profileInfo(key).dir;
  const go = async (page) => {
    if (url) await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    return page;
  };
  // 1. Context mặc định.
  const page = await newDefaultPage(browser);
  const defDir = await profileDirOf(page).catch(() => null);
  if (defDir === want) return go(page);
  const defId = await contextIdOf(page).catch(() => null);
  await page.close().catch(() => {});
  // 2. Context khác: mở tab từ 1 tab có sẵn của context đó, rồi kiểm tra profile.
  for (const [id, tabs] of await tabsByContext(browser)) {
    if (id === defId) continue;
    const p = await newPageBeside(tabs[0]);
    const dir = await profileDirOf(p).catch(() => null);
    if (dir === want) return go(p);
    await p.close().catch(() => {});
  }
  throw new Error(
    `Không mở được tab trong profile ${key} ("${want}"). Mở 1 cửa sổ của profile này trong Chrome CDP, có ít nhất 1 tab trang web, rồi chạy lại.`,
  );
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const key = process.argv[2];
  const browser = await connectCdp();
  try {
    if (key) {
      const p = await newPageInProfile(browser, key, 'chrome://version');
      console.log(`✓ Mở được tab trong profile ${key}: ${await profileDirOf(p)}`);
      await p.close();
    } else {
      const probe = await newDefaultPage(browser);
      console.log(`Context mặc định (tab mới mở vào đây): ${await profileDirOf(probe)}`);
      const defId = await contextIdOf(probe);
      await probe.close();
      for (const [id, tabs] of await tabsByContext(browser)) {
        console.log(`- context ${id.slice(0, 8)}${id === defId ? ' (mặc định)' : ''}: ${tabs.length} tab, vd ${tabs[0].url().slice(0, 60)}`);
      }
    }
  } catch (err) {
    console.error(`✗ ${err.message}`);
    process.exitCode = 1;
  }
  process.exit(process.exitCode ?? 0);
}
