#!/usr/bin/env node
// Đăng bài viết có ảnh lên fanpage Facebook qua Chrome CDP. Lời bài lấy từ mục "## Bài viết" trong dang-bai.md.
// Viết ngày 2026-11-14 cho bài ảnh macro châu chấu sa mạc (nntruong96). Giao diện Facebook tiếng Việt.
//
// CLI:
//   node dang-anh-fb.mjs <thư mục> --profile <oliver|my> --anh a.png [b.png ...] [--fb-page <id>] [--dry-run]
//   --dry-run: điền ảnh và lời, chụp màn hình vào <thư mục>/fb-shots/, không bấm Đăng.
//   Script chụp màn hình từng bước vào <thư mục>/fb-shots/ để Claude xem khi dừng giữa chừng.

import fs from 'node:fs';
import path from 'node:path';
import { profileInfo, newPageInProfile, connectCdp } from './chrome-profile.mjs';

const t0 = Date.now();
const step = (s) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s] ${s}`);

function parseArgs(argv) {
  const o = { dir: null, profile: null, fbPage: null, anh: [], dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--profile') o.profile = argv[++i];
    else if (a === '--fb-page') o.fbPage = argv[++i];
    else if (a === '--dry-run') o.dryRun = true;
    else if (a === '--anh') {
      while (argv[i + 1] && !argv[i + 1].startsWith('--')) o.anh.push(argv[++i]);
    } else if (!o.dir) o.dir = a;
  }
  return o;
}

function readSection(md, heading) {
  const lines = md.split('\n');
  const start = lines.findIndex((l) => l.trim() === `## ${heading}`);
  if (start < 0) throw new Error(`dang-bai.md thiếu mục "## ${heading}"`);
  const end = lines.findIndex((l, i) => i > start && l.startsWith('## '));
  const body = lines.slice(start + 1, end < 0 ? undefined : end);
  while (body.length && !body[0].trim()) body.shift();
  while (body.length && !body.at(-1).trim()) body.pop();
  return body;
}

function recordPost(dir, link) {
  const file = path.join(dir, 'dang-bai.md');
  let md = fs.readFileSync(file, 'utf8').replace(/\n*$/, '\n');
  if (!md.includes('\n## Đã đăng\n')) md += '\n## Đã đăng\n\n';
  const d = new Date();
  const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  fs.writeFileSync(file, `${md}- Facebook ${day}: ${link}\n`);
}

async function main() {
  const o = parseArgs(process.argv.slice(2));
  if (!o.dir || !o.anh.length) {
    throw new Error('Cách dùng: node dang-anh-fb.mjs <thư mục> --profile <oliver|my> --anh a.png [b.png ...] [--fb-page <id>] [--dry-run]');
  }
  const P = profileInfo(o.profile);
  const fb = o.fbPage ? P.facebook.find((f) => f.id === o.fbPage) : P.facebook[0];
  if (!fb) throw new Error(`Profile ${P.key} không có trang Facebook ${o.fbPage ?? ''}`);
  const anh = o.anh.map((f) => path.resolve(o.dir, f));
  for (const f of anh) if (!fs.existsSync(f)) throw new Error(`Thiếu ảnh ${f}`);
  const lines = readSection(fs.readFileSync(path.join(o.dir, 'dang-bai.md'), 'utf8'), 'Bài viết');
  const shots = path.join(o.dir, 'fb-shots');
  fs.mkdirSync(shots, { recursive: true });
  const browser = await connectCdp();
  const pageUrl = `https://www.facebook.com/profile.php?id=${fb.id}`;
  const page = await newPageInProfile(browser, P.key, pageUrl);
  await page.setViewportSize({ width: 1280, height: 900 }).catch(() => {});
  const shot = (n) => page.screenshot({ path: path.join(shots, `${n}.png`) }).catch(() => {});
  try {
    await page.waitForTimeout(6_000);
    // Đang dùng tên trang thì trang hiện cột "Quản lý trang" bên trái và ô "Bạn đang nghĩ gì, <trang> ơi?" ở phần bài viết
    // (phải cuộn xuống mới hiện, đo 2026-11-14). Chưa dùng tên trang thì có nút "Chuyển" để đổi sang trang.
    const moi = page.getByRole('button', { name: /Bạn đang nghĩ gì|What's on your mind/ }).first();
    const timComposer = async () => {
      for (let i = 0; i < 8; i++) {
        if (await moi.count()) return true;
        await page.mouse.wheel(0, 600);
        await page.waitForTimeout(1_500);
      }
      return false;
    };
    let co = await timComposer();
    if (!co) {
      const chuyen = page.getByRole('button', { name: /^(Chuyển|Switch)( ngay)?$/ }).first();
      if (await chuyen.count()) {
        step(`Facebook chưa dùng tên trang "${fb.name}", bấm Chuyển...`);
        await chuyen.click();
        const trongHop = page.getByRole('dialog').getByRole('button', { name: /^(Chuyển|Switch)$/ }).first();
        if (await trongHop.waitFor({ timeout: 8_000 }).then(() => true).catch(() => false)) await trongHop.click();
        await page.waitForTimeout(10_000);
        await page.goto(pageUrl, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(6_000);
        co = await timComposer();
      }
    }
    await shot('01-trang');
    if (!co) throw new Error(`Không thấy ô "Bạn đang nghĩ gì" của trang "${fb.name}". Mở ${pageUrl} trong profile ${P.key}, bấm Chuyển sang trang, rồi chạy lại.`);
    // Trên trang của chính mình, ô chỉ ghi "Bạn đang nghĩ gì?" (đo 2026-11-14). Xác nhận đang dùng tên trang bằng cột
    // "Quản lý trang" có tên trang, rồi kiểm tra lại tên người đăng trong hộp Tạo bài viết.
    const quanLy = await page.evaluate((name) => {
      const t = document.body.innerText;
      return (t.includes('Quản lý trang') || t.includes('Manage Page')) && t.includes(name);
    }, fb.name);
    const tenO = await moi.innerText().catch(() => '');
    if (!tenO.includes(fb.name) && !quanLy) throw new Error(`Ô soạn bài ghi "${tenO}" và không thấy "Quản lý trang ${fb.name}". Dừng để không đăng nhầm.`);
    await moi.scrollIntoViewIfNeeded();
    await moi.click();
    const dialog = page.getByRole('dialog').filter({ hasText: /Tạo bài viết|Create post/ }).first();
    await dialog.waitFor({ timeout: 30_000 });
    await page.waitForTimeout(1_500);
    const tenHop = await dialog.innerText().catch(() => '');
    if (!tenHop.includes(fb.name)) {
      await shot('98-hop-sai-ten');
      throw new Error(`Hộp Tạo bài viết không ghi tên "${fb.name}". Dừng để không đăng nhầm. Xem ${shots}/98-hop-sai-ten.png`);
    }
    step('Facebook: đã mở hộp Tạo bài viết');
    // Thêm ảnh: nút "Ảnh/video" ở hàng "Thêm vào bài viết của bạn" mở vùng kéo thả; nạp file thẳng vào input[type=file]
    // của hộp (lần đầu 2026-11-14 dùng filechooser, ảnh không hiện trong hộp).
    const nutAnh = dialog.locator('[aria-label="Ảnh/video"], [aria-label="Photo/video"]').first();
    await nutAnh.waitFor({ timeout: 15_000 });
    await nutAnh.click();
    await page.waitForTimeout(2_000);
    const input = dialog.locator('input[type="file"]').first();
    await input.waitFor({ state: 'attached', timeout: 15_000 });
    await input.setInputFiles(anh);
    step(`Facebook: đã nạp ${anh.length} ảnh`);
    // Chờ ảnh hiện trong hộp (thẻ img blob:).
    for (let i = 0; i < 30; i++) {
      const n = await dialog.locator('img[src^="blob:"]').count();
      if (n >= 1) break;
      await page.waitForTimeout(1_000);
    }
    const soAnh = await dialog.locator('img[src^="blob:"]').count();
    if (!soAnh) {
      await shot('97-khong-co-anh');
      throw new Error(`Ảnh không hiện trong hộp Tạo bài viết. Xem ${shots}/97-khong-co-anh.png`);
    }
    step(`Facebook: hộp hiện ${soAnh} ảnh`);
    const editor = dialog.locator('[contenteditable="true"][role="textbox"]').first();
    await editor.waitFor({ timeout: 30_000 });
    await editor.click();
    for (let i = 0; i < lines.length; i++) {
      if (lines[i]) await page.keyboard.insertText(lines[i]);
      if (i < lines.length - 1) await page.keyboard.press('Enter');
    }
    await page.waitForTimeout(2_000);
    const typed = (await editor.innerText()).replace(/\s+/g, ' ').trim();
    const want = lines.join(' ').replace(/\s+/g, ' ').trim();
    if (!typed.startsWith(want.slice(0, 40))) throw new Error(`Lời bài không vào ô soạn. Đã gõ: "${typed.slice(0, 80)}"`);
    step('Facebook: đã điền lời bài');
    await shot('02-da-dien');
    // Bật nhãn AI (ảnh tạo bằng AI): nút "Nhãn AI đang tắt" cạnh "Công khai" mở bảng có công tắc.
    const nhan = dialog.getByRole('button', { name: /Nhãn AI|AI label/ }).first();
    if (await nhan.count()) {
      const truoc = await nhan.innerText().catch(() => '');
      if (/tắt|off/i.test(truoc)) {
        await nhan.click();
        await page.waitForTimeout(1_500);
        await shot('02b-nhan-ai');
        const sw = page.getByRole('dialog').locator('[role="switch"], [role="checkbox"]').last();
        if (await sw.count()) {
          if ((await sw.getAttribute('aria-checked')) !== 'true') await sw.click();
          await page.waitForTimeout(800);
          // Bảng "Gắn nhãn nội dung" đóng bằng nút "Đã hiểu" (đo 2026-11-14).
          const luu = page.getByRole('dialog').getByRole('button', { name: /^(Đã hiểu|Lưu|Xong|Got it|Save|Done)$/ }).first();
          if (await luu.count()) await luu.click();
          await page.waitForTimeout(1_500);
        } else {
          await page.keyboard.press('Escape');
          await page.waitForTimeout(800);
        }
        const sau = await dialog.getByRole('button', { name: /Nhãn AI|AI label/ }).first().innerText().catch(() => '');
        step(`Facebook: nhãn AI: "${truoc}" → "${sau}"`);
      } else step(`Facebook: nhãn AI: "${truoc}"`);
    }
    // Hộp của trang có nút "Tiếp" (bước 2: chia sẻ thêm nơi khác) rồi mới tới "Đăng" (đo 2026-11-14).
    const tiep = dialog.getByRole('button', { name: /^(Tiếp|Next)$/ }).first();
    let dang = dialog.getByRole('button', { name: /^(Đăng|Post)$/ }).first();
    const bat = (loc) => loc.isEnabled({ timeout: 1_000 }).catch(() => false);
    for (let i = 0; i < 90; i++) {
      if ((await bat(dang)) || (await bat(tiep))) break;
      await page.waitForTimeout(2_000);
    }
    if (!(await bat(dang)) && (await bat(tiep))) {
      await tiep.click();
      step('Facebook: đã bấm Tiếp');
      await page.waitForTimeout(3_000);
      dang = page.getByRole('dialog').getByRole('button', { name: /^(Đăng|Post)$/ }).first();
      for (let i = 0; i < 30; i++) {
        if (await bat(dang)) break;
        await page.waitForTimeout(2_000);
      }
    }
    await shot('03-truoc-dang');
    if (o.dryRun) {
      step(`Dry run: không bấm Đăng. Xem ảnh ở ${shots}`);
      return;
    }
    if (!(await bat(dang))) throw new Error('Nút Đăng chưa bật sau 3 phút.');
    await dang.click();
    step('Facebook: đã bấm Đăng, chờ lên bài...');
    await dialog.waitFor({ state: 'hidden', timeout: 120_000 }).catch(() => {});
    await page.waitForTimeout(15_000);
    await page.goto(pageUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8_000);
    await shot('04-sau-dang');
    // Tìm link bài mới nhất: bài có đoạn đầu của lời.
    const link = await page.evaluate((first) => {
      const arts = [...document.querySelectorAll('[role="article"]')];
      const art = arts.find((a) => a.innerText.includes(first));
      if (!art) return null;
      const hrefs = [...art.querySelectorAll('a[href]')].map((x) => x.href);
      const a = hrefs.find((h) => /\/posts\/|\/permalink\/|pfbid|story_fbid/.test(h));
      if (!a) return null;
      if (a.includes('story_fbid')) {
        const u = new URL(a);
        return `https://www.facebook.com/permalink.php?story_fbid=${u.searchParams.get('story_fbid')}&id=${u.searchParams.get('id')}`;
      }
      return a.split('?')[0];
    }, lines[0].slice(0, 30));
    const out = link || pageUrl;
    recordPost(o.dir, out);
    console.log(`✓ Facebook: ${out}`);
  } catch (err) {
    await shot('99-loi');
    throw err;
  } finally {
    await page.close().catch(() => {});
    await browser.close().catch(() => {});
  }
}

main().catch((err) => {
  console.error(`✗ ${err.message}`);
  process.exit(1);
});
