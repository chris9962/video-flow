import { chromium } from '/Users/nguyentruong/.claude/skills/flow-chain-video/scripts/node_modules/playwright-core/index.mjs';
const [caption, out] = process.argv.slice(2);
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 5000 });
const page = browser.contexts()[0].pages().find((p) => p.url().includes('tiktokstudio/upload'));
const editor = page.locator('[contenteditable="true"]').first();
await editor.click();
await page.keyboard.press('Meta+A');
await page.keyboard.press('Backspace');
for (const part of caption.split(/(?=#)/)) {
  await page.keyboard.insertText(part.trimEnd());
  await page.waitForTimeout(1200);
  await page.keyboard.press('Escape');
  if (part.endsWith(' ')) await page.keyboard.insertText(' ');
}
await page.waitForTimeout(800);
console.log('caption =', JSON.stringify(await editor.innerText()));

const aiRow = page.locator('div', { hasText: /^AI-generated content/ }).last();
const ai = page.locator('[role="switch"], input[type="checkbox"]').nth(4);
const label = await ai.evaluate((s) => { let el = s; for (let k = 0; k < 6 && el.innerText.trim().length < 5; k++) el = el.parentElement; return el.innerText.split('\n')[0]; });
if (label !== 'AI-generated content') throw new Error('Không đúng công tắc: ' + label);
const on = async () => ai.evaluate((s) => (s.getAttribute('aria-checked') ?? String(s.checked)) === 'true');
if (!(await on())) await ai.click({ force: true });
await page.waitForTimeout(1500);
console.log('AI label =', await on());
const dialog = await page.evaluate(() => [...document.querySelectorAll('[role="dialog"]')].map((d) => d.innerText.slice(0, 300)));
console.log('dialogs =', JSON.stringify(dialog));
await page.screenshot({ path: out, fullPage: true });
await browser.close();
