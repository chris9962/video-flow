#!/usr/bin/env node
// Gửi 1 tin nhắn chữ cho ChatGPT qua Chrome CDP và in câu trả lời.
//   GPT_PROFILE=oliver|my node gpt-text.mjs --prompt "..." [--prompt-file f.txt] [--chat <url>] [--out tra-loi.txt]
// Viết ngày 2026-11-09 để nhờ GPT viết lại lời thuyết minh.
import fs from 'node:fs/promises';
import { chromium } from 'playwright-core';
import { CHROME_CDP_URL, newPageInProfile } from './chrome-profile.mjs';

const args = process.argv.slice(2);
const get = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
let prompt = get('--prompt');
if (get('--prompt-file')) prompt = await fs.readFile(get('--prompt-file'), 'utf8');
const chat = get('--chat');
const out = get('--out');
const profile = process.env.GPT_PROFILE;
if (!prompt || !profile) { console.error('Cần --prompt và GPT_PROFILE=oliver|my'); process.exit(1); }

const t0 = Date.now();
const step = (m) => console.error(`[${((Date.now() - t0) / 1000).toFixed(1)}s] ${m}`);
const browser = await chromium.connectOverCDP(CHROME_CDP_URL, { timeout: 5_000 });
const page = await newPageInProfile(browser, profile, chat || 'https://chatgpt.com/');
const composer = page.locator('#prompt-textarea, div[contenteditable="true"]').first();
await composer.waitFor({ timeout: 30_000 });
await page.waitForTimeout(2_000);
// 2026-11-09: trang ChatGPT không còn thuộc tính data-message-author-role. Đọc chữ của <main>,
// lấy phần sau nhãn "ChatGPT said:" cuối cùng, bỏ phần chân trang.
const MARK = 'ChatGPT said:';
const readReply = () => page.evaluate((mark) => {
  const t = document.querySelector('main')?.innerText || '';
  const n = t.split(mark).length - 1;
  const s = t.slice(t.lastIndexOf(mark) + mark.length);
  return { n, txt: s.split(/\nChatGPT can make mistakes/)[0].trim() };
}, MARK);
const before = (await readReply()).n;
await composer.click();
await page.keyboard.press('ControlOrMeta+a');
await page.keyboard.press('Backspace');
// Giữ xuống dòng: Shift+Enter giữa các dòng.
const lines = prompt.trim().split(/\r?\n/);
for (let i = 0; i < lines.length; i++) {
  if (lines[i]) await page.keyboard.insertText(lines[i]);
  if (i < lines.length - 1) await page.keyboard.press('Shift+Enter');
}
await page.keyboard.press('Enter');
step('Đã gửi');
const stop = page.locator('[data-testid="stop-button"], button[aria-label*="Stop"]');
const deadline = Date.now() + 5 * 60_000;
let last = '', stable = 0;
while (Date.now() < deadline) {
  await page.waitForTimeout(2_000);
  const r = await readReply().catch(() => ({ n: 0, txt: '' }));
  if (r.n <= before) continue;
  const txt = r.txt;
  const streaming = (await stop.count().catch(() => 0)) > 0;
  if (txt && txt === last && !streaming) { if (++stable >= 2) break; } else stable = 0;
  last = txt;
}
await page.waitForURL(/\/c\//, { timeout: 10_000 }).catch(() => {});
step(`Cuộc chat: ${page.url().split('?')[0]}`);
if (out) await fs.writeFile(out, last, 'utf8');
console.log(last);
await page.close().catch(() => {});
process.exit(0);
