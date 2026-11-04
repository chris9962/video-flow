#!/usr/bin/env node
// ChatGPT (chatgpt.com) qua Chrome CDP: tạo 1 ảnh khung, hoặc sửa ảnh trước trong cùng cuộc chat, rồi tải ảnh về.
// Selector và cách tải lấy từ ~/video-flow (browser-pilot.ts), soi lại ngày 2026-10-18.
//
// CLI:
//   node gpt-image.mjs --prompt "..." --out K01.png [--chat <url cuộc chat>] [--ref ảnh.png]
//   Không có --chat: mở cuộc chat mới. Có --chat: gửi prompt vào cuộc chat đó để sửa ảnh trước.
//   --ref: đính kèm ảnh, dùng khi ảnh trước không nằm trong cuộc chat (ví dụ người dùng tự tạo).
//   node gpt-image.mjs --save-last --chat <url> --out K05.png   (lưu ảnh cuối của cuộc chat, không gửi prompt)

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const CHROME_CDP_URL = process.env.CHROME_CDP_URL || 'http://127.0.0.1:9222';
const CHAT_HOME = 'https://chatgpt.com/';
// 2026-10-18: ô nhập là div contenteditable aria-label "Ask ChatGPT", không còn id #prompt-textarea.
// Không dùng 'form textarea': ChatGPT để sẵn 1 textarea ẩn trước khi editor hydrate.
const COMPOSER = '#prompt-textarea, div[contenteditable="true"][aria-label]';
const IMAGE = '[data-testid="generated-image-preview"] img';
// Nút này chỉ hiện khi ảnh đã xong; bản xem trước mờ hiện trước đó không có nút.
const DONE_BUTTON = /^(Share generated image|Edit generated image|Chia sẻ ảnh đã tạo|Chỉnh sửa ảnh đã tạo) \d+$/i;
const LIMIT_TEXT = /hit the (free )?plan limit|reached (your|the) (image )?limit|đã đạt giới hạn|hết lượt tạo ảnh/i;
const IMAGE_TIMEOUT_MS = 10 * 60_000;

const t0 = Date.now();
const step = (s) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s] ${s}`);

async function connect() {
  try {
    return await chromium.connectOverCDP(CHROME_CDP_URL, { timeout: 5_000 });
  } catch (err) {
    // Trên macOS, người dùng đóng hết cửa sổ thì Chrome vẫn chạy với 0 tab, và Playwright không kết nối được.
    if (!/context management is not supported/i.test(err.message)) {
      throw new Error(`Không kết nối được Chrome tại ${CHROME_CDP_URL}. Chạy: node scripts/launch-chrome.mjs`);
    }
    await openBackgroundWindow().catch(() => {});
    return chromium.connectOverCDP(CHROME_CDP_URL, { timeout: 5_000 });
  }
}

// /json/new, ctx.newPage() và page.bringToFront() làm macOS chuyển focus sang Chrome, Target.createTarget với background: true thì không.
// Đo ngày 2026-10-30: tab nền vẫn chạy timer và requestAnimationFrame đủ tốc độ.
async function openBackgroundWindow() {
  const { webSocketDebuggerUrl } = await (await fetch(`${CHROME_CDP_URL}/json/version`)).json();
  const ws = new WebSocket(webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  await new Promise((resolve) => {
    ws.onmessage = resolve;
    ws.send(JSON.stringify({ id: 1, method: 'Target.createTarget', params: { url: 'about:blank', newWindow: true, background: true } }));
  });
  ws.close();
}

async function newBackgroundPage(ctx) {
  // Nhiều script có thể mở tab cùng lúc, nên tìm tab theo URL riêng thay vì chờ sự kiện 'page'.
  const mark = `about:blank#${process.pid}-${Date.now()}`;
  const cdp = await ctx.browser().newBrowserCDPSession();
  await cdp.send('Target.createTarget', { url: mark, background: true });
  await cdp.detach();
  for (let i = 0; i < 50; i++) {
    const page = ctx.pages().find((p) => p.url() === mark);
    if (page) return page;
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('Chrome không mở được tab mới.');
}

async function doneButtons(page) {
  return page.getByRole('button', { name: DONE_BUTTON }).count().catch(() => 0);
}

// Kích thước byte của từng ảnh trong cuộc chat, theo thứ tự trên trang. Ảnh lỗi tải trả 0.
async function imageSizes(page) {
  return page
    .locator(IMAGE)
    .evaluateAll((els) =>
      Promise.all(
        els.map(async (el) => {
          if (el.naturalWidth < 512) return 0;
          try {
            return (await (await fetch(el.currentSrc || el.src, { credentials: 'include' })).arrayBuffer()).byteLength;
          } catch {
            return 0;
          }
        }),
      ),
    )
    .catch(() => []);
}

// Lần thử 2026-10-18: khi sửa ảnh, nút "ảnh xong" tăng trước khi ô ảnh mới có nội dung mới,
// và lấy ảnh cuối trang đã lưu nhầm ảnh cũ. Chỉ nhận ảnh có kích thước byte chưa từng có, giữ nguyên qua 2 lần kiểm tra.
async function waitNewImage(page, beforeButtons, beforeSizes) {
  const deadline = Date.now() + IMAGE_TIMEOUT_MS;
  let lastLog = 0;
  let candidate = null;
  let lastReload = Date.now();
  while (Date.now() < deadline) {
    await page.waitForTimeout(2_000);
    // Lần chạy 2026-10-18: ảnh đã hiện nhưng chưa vào khối generated-image-preview và chưa có nút; tải lại trang thì đủ.
    if (Date.now() - lastReload > 90_000) {
      step('Tải lại trang ChatGPT để cập nhật ảnh');
      await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
      await page.waitForTimeout(5_000);
      lastReload = Date.now();
      candidate = null;
    }
    const limit = await page
      .evaluate((re) => (document.querySelector('main')?.innerText || '').match(new RegExp(re, 'i'))?.[0], LIMIT_TEXT.source)
      .catch(() => null);
    if (limit) throw new Error(`ChatGPT không tạo ảnh: "${limit}"`);
    // Lần chạy 2026-10-21: ChatGPT trả 2 ảnh và hỏi "Which image do you like more?". Chưa chọn thì không có nút ảnh xong.
    const pick = page.getByRole('button', { name: /^Image 1 is better$/ });
    if (await pick.count().catch(() => 0)) {
      await pick.first().click().catch(() => {});
      step('ChatGPT hỏi chọn 1 trong 2 ảnh: chọn ảnh 1');
      continue;
    }
    if ((await doneButtons(page)) > beforeButtons) {
      const sizes = await imageSizes(page);
      const idx = sizes.findLastIndex((n) => n > 0 && !beforeSizes.includes(n));
      if (idx >= 0 && candidate?.idx === idx && candidate.size === sizes[idx]) return idx;
      candidate = idx >= 0 ? { idx, size: sizes[idx] } : null;
    }
    if (Date.now() - lastLog > 30_000) {
      step('ChatGPT đang tạo ảnh...');
      lastLog = Date.now();
    }
  }
  throw new Error('Hết 10 phút chờ — ChatGPT chưa tạo xong ảnh. Xem tab Chrome.');
}

// page.request.get(URL ảnh) bị chặn. Ảnh có src blob: cùng origin, nên đọc trong trang rồi ghi file.
async function saveImage(page, idx, outFile) {
  const img = page.locator(IMAGE).nth(idx);
  const b64 = await img.evaluate(async (el) => {
    const r = await fetch(el.currentSrc || el.src, { credentials: 'include' });
    const buf = new Uint8Array(await r.arrayBuffer());
    let bin = '';
    for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
    return btoa(bin);
  });
  const size = await img.evaluate((el) => `${el.naturalWidth}×${el.naturalHeight}`);
  await fs.mkdir(path.dirname(path.resolve(outFile)), { recursive: true });
  await fs.writeFile(path.resolve(outFile), Buffer.from(b64, 'base64'));
  return size;
}

export async function generateGptImage({ prompt, outFile, chatUrl, refImage, saveLast = false }) {
  if (!prompt && !saveLast) throw new Error('Thiếu prompt.');
  if (saveLast && !chatUrl) throw new Error('--save-last cần --chat <url cuộc chat>.');
  if (!outFile) throw new Error('Thiếu đường dẫn file ra.');
  const browser = await connect();
  // Không gọi browser.close(): với Chrome của người dùng, lệnh này đóng luôn cửa sổ đã đăng nhập.
  const ctx = browser.contexts()[0] ?? (await browser.newContext());
  const page = await newBackgroundPage(ctx);
  let keepTab = false;
  try {
    await page.goto(chatUrl || CHAT_HOME, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    step(`Mở ${page.url()}`);
    const composer = page.locator(COMPOSER).first();
    await composer.waitFor({ timeout: 30_000 }).catch(() => {
      throw new Error('Không thấy ô nhập ChatGPT. Kiểm tra đã đăng nhập chatgpt.com trong cửa sổ Chrome CDP chưa.');
    });
    // Cuộc chat cũ tải ảnh dần dần. Đếm khi chưa tải xong thì ảnh cũ bị coi là ảnh mới → chờ số ảnh ổn định qua 2 lần đo.
    let beforeSizes = await imageSizes(page);
    if (chatUrl) {
      const until = Date.now() + 30_000;
      for (let prev = null; Date.now() < until; ) {
        await page.waitForTimeout(1_500);
        beforeSizes = await imageSizes(page);
        const key = beforeSizes.join(',');
        if (beforeSizes.length && !beforeSizes.includes(0) && key === prev) break;
        prev = key;
      }
      if (!beforeSizes.length) throw new Error('Cuộc chat cũ không có ảnh nào. Kiểm tra URL cuộc chat.');
    }
    if (saveLast) {
      const size = await saveImage(page, beforeSizes.length - 1, outFile);
      step(`✓ Đã lưu ảnh cuối ${size}: ${outFile}`);
      return { outFile, chatUrl };
    }
    const beforeButtons = await doneButtons(page);
    step(`Ô nhập sẵn sàng, ${beforeSizes.length} ảnh trong cuộc chat`);

    if (refImage) {
      // Ô file đầu tiên là "Take a photo" (capture): gắn file vào đó thì ChatGPT không nhận ảnh.
      // Gắn file ngay khi trang vừa hiện ô nhập thì trang bỏ qua sự kiện → chờ rồi thử lại. 2026-10-20.
      const attached = page.locator(`button[aria-label="Remove ${path.basename(refImage)}"]`).first();
      for (let attempt = 1; ; attempt++) {
        await page.waitForTimeout(2_000);
        await page.locator('input[type="file"]:not([capture]):not([accept])').first().setInputFiles(path.resolve(refImage));
        if (await attached.waitFor({ timeout: 10_000 }).then(() => true, () => false)) break;
        if (attempt === 3) throw new Error(`Ô nhập chưa có ảnh ${path.basename(refImage)} sau 3 lần gắn. Xem tab Chrome.`);
      }
      step(`Đính kèm: ${path.basename(refImage)}`);
      await page.waitForTimeout(4_000);
    }
    const text = !chatUrl && !refImage && !/^(generate|create|edit|tạo)\b/i.test(prompt) ? `Generate an image. ${prompt}` : prompt;
    await composer.click();
    // insertText giữ prompt trên 1 dòng; Enter gửi.
    await page.keyboard.insertText(text);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1_500);
    // Lần chạy 2026-10-18: Enter không gửi khi trang chưa sẵn sàng → bấm nút Send nếu prompt còn trong ô nhập.
    const pending = async () => ((await composer.innerText().catch(() => '')) || '').trim().length > 0;
    if (await pending()) {
      await page
        .locator('[data-testid="send-button"], button[aria-label="Send prompt"], button[aria-label="Send"], button[aria-label*="Gửi"]')
        .first()
        .click({ timeout: 10_000 })
        .catch(() => {});
      await page.waitForTimeout(1_500);
    }
    if (await pending()) throw new Error('ChatGPT chưa gửi prompt: prompt vẫn nằm trong ô nhập. Xem tab Chrome.');
    step(chatUrl ? 'Đã gửi prompt vào cuộc chat cũ' : 'Đã gửi prompt vào cuộc chat mới');

    const idx = await waitNewImage(page, beforeButtons, beforeSizes);
    // Lúc mới gửi, URL là mã tạm local-chatgpt:…; mã thật có sau khi ChatGPT lưu cuộc chat.
    await page.waitForURL(/\/c\/[0-9a-f]{8}-[0-9a-f-]{27}/, { timeout: 30_000 }).catch(() => {});
    const url = page.url().split('?')[0];
    step(`Cuộc chat: ${url}`);
    await page.waitForTimeout(1_000);
    const size = await saveImage(page, idx, outFile);
    step(`✓ Đã lưu ảnh ${size}: ${outFile}`);
    return { outFile, chatUrl: url };
  } catch (err) {
    keepTab = true;
    throw err;
  } finally {
    if (!keepTab) await page.close().catch(() => {});
  }
}

function parseArgs(argv) {
  const args = {};
  argv.forEach((val, i) => {
    if (!val.startsWith('--')) return;
    const next = argv[i + 1];
    args[val.slice(2)] = next && !next.startsWith('--') ? next : true;
  });
  return args;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const a = parseArgs(process.argv.slice(2));
  if ((!a.prompt && !a['save-last']) || !a.out) {
    console.error('Cách dùng: node gpt-image.mjs --prompt "<prompt>" --out <file.png> [--chat <url cuộc chat>] [--ref ảnh.png]\n       node gpt-image.mjs --save-last --chat <url cuộc chat> --out <file.png>   (lưu ảnh cuối, không gửi prompt)');
    process.exit(1);
  }
  generateGptImage({ prompt: a.prompt, outFile: a.out, chatUrl: a.chat, refImage: a.ref, saveLast: !!a['save-last'] })
    // Kết nối CDP giữ event loop sống — phải thoát chủ động.
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(`✗ ${err.message}`);
      process.exit(1);
    });
}
