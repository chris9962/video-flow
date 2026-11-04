import { chromium } from '/Users/nguyentruong/.claude/skills/flow-chain-video/scripts/node_modules/playwright-core/index.mjs';
const out = process.argv[2];
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 5000 });
const page = browser.contexts()[0].pages().find((p) => p.url().includes('tiktokstudio/upload'));
const state = await page.evaluate(() => {
  const row = [...document.querySelectorAll('div')].find((d) => d.innerText.startsWith('AI-generated content') && d.innerText.length < 120);
  const sw = row?.parentElement?.querySelector('[role="switch"], input[type="checkbox"]');
  return {
    row: row?.innerText.replace(/\n/g, ' | '),
    sw: sw ? (sw.getAttribute('aria-checked') ?? String(sw.checked)) : 'không thấy',
    dialogs: [...document.querySelectorAll('[role="dialog"]')].map((d) => d.innerText.slice(0, 80)),
  };
});
console.log(JSON.stringify(state, null, 1));
await page.locator('text=AI-generated content').first().scrollIntoViewIfNeeded();
await page.screenshot({ path: out });
await browser.close();
