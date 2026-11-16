// Gắn nhạc TikTok cho video đang mở ở tab TikTok Studio (sau `dang-tiktok.mjs --dry-run`), rồi Post.
// Đo thật ngày 2026-11-13 trên @khoai.kai: nút "Sounds" cạnh "Edit" mở trình chỉnh sửa, tab "For You" là nhạc TikTok gợi ý.
//
// Cách dùng:
//   node tiktok-nhac.mjs --list                 # in danh sách nhạc gợi ý (tab For You), không đổi gì
//   node tiktok-nhac.mjs --pick "<tên nhạc>"    # thêm nhạc có tên chứa chuỗi này, Save, rồi Post; in link bài
//   node tiktok-nhac.mjs --pick "<tên>" --no-post   # chỉ thêm nhạc và Save, không Post
// Cần Chrome CDP đang mở đúng 1 tab tiktokstudio/upload (của profile nào cũng được, script tìm theo URL).
import { chromium } from 'playwright-core';
import { CHROME_CDP_URL } from '../../flow-chain-video/scripts/chrome-profile.mjs';

const argv = process.argv.slice(2);
const opts = { list: false, pick: null, post: true };
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--list') opts.list = true;
  else if (a === '--pick') opts.pick = argv[++i];
  else if (a === '--no-post') opts.post = false;
}
if (!opts.list && !opts.pick) {
  console.log('Cách dùng: node tiktok-nhac.mjs --list | --pick "<tên nhạc>" [--no-post]');
  process.exit(1);
}
const t0 = Date.now();
const step = (s) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s] ${s}`);

const browser = await chromium.connectOverCDP(CHROME_CDP_URL, { timeout: 5_000 });
const page = browser.contexts().flatMap((c) => c.pages()).find((p) => p.url().includes('tiktokstudio/upload'));
if (!page) throw new Error('Không thấy tab tiktokstudio/upload. Chạy dang-tiktok.mjs --dry-run trước.');
await page.setViewportSize({ width: 1400, height: 1000 });

async function openSounds() {
  // Trình chỉnh sửa đã mở (ví dụ sau --list) thì ô tìm nhạc đã có, không bấm "Sounds" nữa: nút trong trình chỉnh sửa bị chặn click.
  if (await page.getByPlaceholder('Search sounds').isVisible().catch(() => false)) return;
  const btn = page.getByRole('button', { name: /^Sounds$/ });
  if (await btn.count()) {
    await btn.click();
    await page.waitForTimeout(5_000);
    const got = page.getByRole('button', { name: /Got it/i });
    if (await got.count()) await got.click().catch(() => {});
    await page.waitForTimeout(1_000);
  }
  await page.getByPlaceholder('Search sounds').waitFor({ timeout: 20_000 });
}
async function listSounds() {
  // Mỗi bài là 1 hàng: tên, rồi "mm:ss · tác giả". Lấy text của bảng Sounds.
  const t = await page.locator('body').innerText();
  const i = t.indexOf('For You'); const j = t.indexOf('Basic mode');
  const lines = t.slice(i, j > i ? j : undefined).split('\n').map((s) => s.trim()).filter(Boolean);
  const names = [];
  for (let k = 0; k < lines.length - 1; k++) if (/^\d\d:\d\d · /.test(lines[k + 1])) names.push(`${lines[k]}  (${lines[k + 1]})`);
  return names;
}

await openSounds();
const names = await listSounds();
if (opts.list) {
  console.log(names.map((n, i) => `${i + 1}. ${n}`).join('\n'));
  await browser.close();
  process.exit(0);
}

let item = page.getByText(opts.pick, { exact: false }).first();
if (!(await item.count())) {
  // Không có trong tab For You: gõ vào ô "Search sounds" (thêm 2026-11-14 cho bài "Anh Thanh Niên" của Khoai Kai clip-07).
  step(`Không thấy "${opts.pick}" trong gợi ý, tìm bằng ô Search sounds`);
  const box = page.getByPlaceholder('Search sounds');
  await box.click(); await box.fill(opts.pick); await box.press('Enter');
  await page.waitForTimeout(5_000);
  item = page.getByText(opts.pick, { exact: false }).first();
  if (!(await item.count())) throw new Error(`Không thấy nhạc "${opts.pick}" kể cả khi tìm. Gợi ý:\n${names.join('\n')}`);
}
await item.scrollIntoViewIfNeeded();
const b = await item.boundingBox();
// Nút "+" nằm cuối hàng, cách mép phải bảng Sounds khoảng 40 px (bảng rộng tới x≈428).
await page.mouse.click(388, b.y + b.height / 2);
await page.waitForTimeout(3_000);
const okAdded = await page.locator('body').innerText().then((t) => t.includes('Volume'));
step(`Đã thêm nhạc "${opts.pick}"${okAdded ? '' : ' (chưa thấy bảng Volume, kiểm tra tab)'}`);
await page.getByRole('button', { name: /^Save$/ }).click();
step('Đã bấm Save, chờ 10 giây');
await page.waitForTimeout(10_000);
const text = await page.locator('body').innerText();
if (!text.includes('Post')) throw new Error('Không quay về trang upload sau khi Save.');
if (!opts.post) { step('Không Post (--no-post). Tab để mở.'); await browser.close(); process.exit(0); }

for (const d of await page.locator('[role="dialog"]').all()) {
  const bt = d.getByRole('button', { name: /Got it|Close|Skip/i }).first();
  if (await bt.count()) await bt.click().catch(() => {});
}
await page.getByRole('button', { name: 'Post', exact: true }).click();
step('Đã bấm Post');
const postNow = page.getByRole('button', { name: 'Post now', exact: true });
if (await postNow.waitFor({ timeout: 8_000 }).then(() => true).catch(() => false)) { await postNow.click(); step('Bấm Post now'); }
await page.waitForURL(/tiktokstudio\/content/, { timeout: 120_000 }).catch(async () => {
  const d = await page.evaluate(() => [...document.querySelectorAll('[role="dialog"]')].map((x) => x.innerText.slice(0, 200)));
  throw new Error('Đã bấm Post nhưng trang không chuyển sang danh sách bài. Hộp thoại: ' + JSON.stringify(d));
});
await page.waitForTimeout(5_000);
const links = await page.evaluate(() => [...new Set([...document.querySelectorAll('a[href*="/video/"]')].map((a) => a.href))]);
const link = links.sort((a, c) => (BigInt(c.split('/video/')[1].split(/[?#]/)[0]) > BigInt(a.split('/video/')[1].split(/[?#]/)[0]) ? 1 : -1))[0];
step(`✓ Đã đăng: ${link ?? 'chưa đọc được link, xem tiktok.com/tiktokstudio/content'}`);
await page.close().catch(() => {});
await browser.close();
