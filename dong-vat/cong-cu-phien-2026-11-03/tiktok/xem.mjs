import { chromium } from '/Users/nguyentruong/.claude/skills/flow-chain-video/scripts/node_modules/playwright-core/index.mjs';
const out = process.argv[2];
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 5000 });
const page = browser.contexts()[0].pages().find((p) => p.url().includes('tiktokstudio'));
if (!page) throw new Error('Không thấy tab TikTok Studio');
console.log('URL', page.url());
await page.screenshot({ path: out });
const info = await page.evaluate(() => ({
  inputs: [...document.querySelectorAll('input')].map((i) => `${i.type} accept=${i.accept} name=${i.name}`),
  buttons: [...document.querySelectorAll('button')].map((b) => b.innerText.trim()).filter(Boolean).slice(0, 40),
}));
console.log(JSON.stringify(info, null, 1));
await browser.close();
