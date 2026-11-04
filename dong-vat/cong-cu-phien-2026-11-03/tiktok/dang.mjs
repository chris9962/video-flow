import { chromium } from '/Users/nguyentruong/.claude/skills/flow-chain-video/scripts/node_modules/playwright-core/index.mjs';
const out = process.argv[2];
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 5000 });
const page = browser.contexts()[0].pages().find((p) => p.url().includes('tiktokstudio/upload'));
const caption = await page.locator('[contenteditable="true"]').first().innerText();
const aiOn = await page.evaluate(() => {
  const label = [...document.querySelectorAll('*')].find((e) => e.childElementCount === 0 && e.textContent.trim() === 'AI-generated content');
  let el = label;
  while (el && !el.querySelector('[role="switch"], input[type="checkbox"]')) el = el.parentElement;
  if (!el || /Disclose/.test(el.innerText)) return 'không xác định';
  const sw = el.querySelector('[role="switch"], input[type="checkbox"]');
  return sw.getAttribute('aria-checked') ?? String(sw.checked);
});
console.log('caption =', JSON.stringify(caption), '| AI label =', aiOn);
if (aiOn !== 'false') throw new Error('Nhãn AI không ở trạng thái tắt, dừng');
if (!caption.includes('#outfit')) throw new Error('Mô tả sai, dừng');
await page.getByRole('button', { name: 'Post', exact: true }).click();
for (let i = 0; i < 20; i++) {
  await page.waitForTimeout(3000);
  const d = await page.evaluate(() => [...document.querySelectorAll('[role="dialog"]')].map((x) => x.innerText.slice(0, 200).replace(/\n/g, ' | ')));
  console.log(i, page.url().slice(0, 80), JSON.stringify(d));
  if (d.length || !page.url().includes('/upload')) break;
}
await page.screenshot({ path: out });
await browser.close();
