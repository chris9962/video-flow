import { chromium } from '/Users/nguyentruong/.claude/skills/flow-chain-video/scripts/node_modules/playwright-core/index.mjs';
const [file, out] = process.argv.slice(2);
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 5000 });
const page = browser.contexts()[0].pages().find((p) => p.url().includes('tiktokstudio/upload'));
await page.locator('input[type="file"][accept="video/*"]').setInputFiles(file);
for (let i = 0; i < 24; i++) {
  await page.waitForTimeout(5000);
  const t = await page.evaluate(() => document.body.innerText);
  const m = t.match(/Uploaded[^\n]*|Uploading[^\n]*|\d+%/);
  console.log(i, m ? m[0] : '-');
  if (/Uploaded/.test(t)) break;
}
await page.screenshot({ path: out, fullPage: true });
const info = await page.evaluate(() => ({
  editable: [...document.querySelectorAll('[contenteditable="true"]')].map((e) => e.innerText.slice(0, 80)),
  buttons: [...document.querySelectorAll('button')].map((b) => b.innerText.trim()).filter(Boolean),
  switches: [...document.querySelectorAll('[role="switch"], input[type="checkbox"]')].map((s) => (s.closest('div')?.parentElement?.innerText || '').slice(0, 60).replace(/\n/g, ' | ') + ' checked=' + (s.getAttribute('aria-checked') ?? s.checked)),
}));
console.log(JSON.stringify(info, null, 1));
await browser.close();
