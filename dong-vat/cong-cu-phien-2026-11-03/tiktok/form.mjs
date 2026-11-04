import { chromium } from '/Users/nguyentruong/.claude/skills/flow-chain-video/scripts/node_modules/playwright-core/index.mjs';
const out = process.argv[2];
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 5000 });
const page = browser.contexts()[0].pages().find((p) => p.url().includes('tiktokstudio/upload'));
const cancel = page.getByRole('button', { name: 'Cancel', exact: true });
if (await cancel.isVisible().catch(() => false)) await cancel.click();
await page.waitForTimeout(800);
const gotIt = page.getByRole('button', { name: 'Got it', exact: true });
if (await gotIt.isVisible().catch(() => false)) await gotIt.click();
await page.waitForTimeout(800);
const more = page.getByText('Show more', { exact: true });
if (await more.isVisible().catch(() => false)) await more.click({ timeout: 5000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: out, fullPage: true });
const info = await page.evaluate(() =>
  [...document.querySelectorAll('[role="switch"], input[type="checkbox"]')].map((s) => {
    let el = s;
    for (let k = 0; k < 6 && el && el.innerText.trim().length < 5; k++) el = el.parentElement;
    return (el?.innerText || '').slice(0, 90).replace(/\n/g, ' | ') + ' => ' + (s.getAttribute('aria-checked') ?? s.checked);
  }),
);
console.log(info.join('\n'));
await browser.close();
