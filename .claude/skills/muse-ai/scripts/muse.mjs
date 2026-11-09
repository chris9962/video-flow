#!/usr/bin/env node
// Muse (muse.ai, agent của Meta) qua Chrome CDP: gửi 1 tin nhắn, chờ Muse trả lời, tải video/ảnh Muse tạo.
// Soi ngày 2026-11-09:
// - Tin chat đi qua WebSocket wss://hatch.metaaivm.com/v1/noise, mã hoá giao thức Noise trong trình duyệt.
//   Vì vậy không gọi được bằng cookie + request; phải điều khiển tab muse.ai.
// - Mỗi tài khoản có 1 luồng chat duy nhất. Video Muse tạo dài ~10 giây, có âm thanh, tối đa 6 clip mỗi tin.
// - Tin nhắn: div[data-message-item][data-message-id][data-message-role=user|assistant].
// - Video: [data-hatch-video-wrapper] có data-hatch-video-src = blob:...
//
// CLI:
//   node muse.mjs --profile oliver|my --prompt "..." --out <thư mục> [--ref ảnh.png ...] [--expect video|image|text] [--timeout 15] [--prefix muse]
//   node muse.mjs --profile oliver|my --save-last --out <thư mục>   (tải media của lượt trả lời cuối, không gửi tin)
//   --timeout tính bằng phút, mặc định 15.

import fs from 'node:fs/promises';
import path from 'node:path';
import { realpathSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CP = path.resolve(HERE, '../../flow-chain-video/scripts/chrome-profile.mjs');
const MUSE = 'https://muse.ai/';
const COMPOSER = 'textarea[aria-label]';
const QUIET_MS = 25_000; // Muse không gửi thêm tin trong khoảng này thì coi là xong lượt.

const t0 = Date.now();
const step = (s) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s] ${s}`);

// Đọc toàn bộ tin nhắn trong DOM: id, role, text, media.
async function readMessages(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('[data-message-item][data-message-id]')].map((m) => ({
      id: m.dataset.messageId,
      role: m.dataset.messageRole,
      text: (m.innerText || '').replace(/^Bạn:\s*/, '').trim(),
      videos: [...m.querySelectorAll('[data-hatch-video-wrapper]')]
        .map((e) => e.dataset.hatchVideoSrc || e.querySelector('video')?.src)
        .filter(Boolean),
      images: [...m.querySelectorAll('[data-testid*="presentation-image"] img')]
        .map((i) => i.currentSrc || i.src)
        .filter(Boolean),
      busy: !!m.querySelector('[aria-busy="true"]'),
    })),
  );
}

// Lấy blob/url trong trang thành Buffer.
async function fetchInPage(page, url) {
  const b64 = await page.evaluate(async (u) => {
    const blob = await (await fetch(u)).blob();
    return await new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result).split(',')[1]);
      r.onerror = rej;
      r.readAsDataURL(blob);
    });
  }, url);
  return Buffer.from(b64, 'base64');
}

async function saveMedia(page, msgs, outDir, prefix) {
  await fs.mkdir(outDir, { recursive: true });
  const files = [];
  const seen = new Set();
  let n = 0;
  for (const m of msgs) {
    for (const [ext, list] of [['mp4', m.videos], ['png', m.images]]) {
      for (const u of list) {
        if (seen.has(u)) continue;
        seen.add(u);
        n++;
        const f = path.join(outDir, `${prefix}-${String(n).padStart(2, '0')}.${ext}`);
        await fs.writeFile(f, await fetchInPage(page, u));
        files.push(f);
        step(`✓ Đã lưu ${f}`);
      }
    }
  }
  return files;
}

const composerValue = (composer) => composer.inputValue().catch(() => '').then((v) => (v || '').trim());

export async function museChat({ profile, prompt, outDir, refs = [], expect = 'video', timeoutMin = 15, saveLast = false, prefix = 'muse' }) {
  if (!profile) throw new Error('Thiếu --profile oliver|my.');
  if (!prompt && !saveLast) throw new Error('Thiếu --prompt.');
  if (!outDir && (saveLast || expect !== 'text')) throw new Error('Thiếu --out <thư mục>.');
  const { connectCdp, newPageInProfile } = await import(pathToFileURL(CP).href);
  const browser = await connectCdp();
  // Không gọi browser.close(): lệnh này đóng Chrome của người dùng.
  const page = await newPageInProfile(browser, profile, MUSE);
  let keepTab = false;
  try {
    step(`Mở ${page.url()} trong profile ${profile}`);
    const composer = page.locator(COMPOSER).first();
    await composer.waitFor({ timeout: 60_000 }).catch(() => {
      throw new Error('Không thấy ô nhập của Muse. Kiểm tra đã đăng nhập muse.ai trong profile này chưa.');
    });
    // Lịch sử chat tải dần: chờ số tin ổn định.
    let before = [];
    // Video giải mã xong mới hiện, nên đo cả số media; chờ ít nhất 6 giây.
    for (let prev = '', i = 0; i < 30; i++) {
      await page.waitForTimeout(2_000);
      before = await readMessages(page);
      const key = before.map((m) => m.id + m.videos.length + m.images.length).join();
      if (i >= 2 && before.length && key === prev) break;
      prev = key;
    }

    if (saveLast) {
      // Lượt trả lời gần nhất có video/ảnh.
      const lastMedia = before.findLastIndex((m) => m.role === 'assistant' && m.videos.length + m.images.length);
      if (lastMedia < 0) throw new Error('Luồng chat chưa có video/ảnh nào.');
      const start = before.slice(0, lastMedia).map((m) => m.role).lastIndexOf('user') + 1;
      const end = before.findIndex((m, i) => i > lastMedia && m.role === 'user');
      const turn = before.slice(start, end < 0 ? undefined : end);
      const text = turn.map((m) => m.text).filter(Boolean).join('\n');
      console.log('--- Muse trả lời:\n' + text);
      const files = await saveMedia(page, turn, outDir, prefix);
      return { files, text };
    }

    const oldIds = new Set(before.map((m) => m.id));
    step(`Ô nhập sẵn sàng, ${before.length} tin trong luồng chat`);

    if (refs.length) {
      await page.locator('input[type="file"]').first().setInputFiles(refs.map((r) => path.resolve(r)));
      step(`Đính kèm: ${refs.map((r) => path.basename(r)).join(', ')}`);
      await page.waitForTimeout(5_000);
    }

    await composer.click();
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.press('Backspace');
    await page.keyboard.insertText(prompt);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2_000);
    if (await composerValue(composer)) {
      await page.locator('button[aria-label*="Gửi"], button[aria-label*="Send"], button[type="submit"]').last().click({ timeout: 10_000 }).catch(() => {});
      await page.waitForTimeout(2_000);
    }
    if (await composerValue(composer)) throw new Error('Muse chưa nhận tin: chữ vẫn nằm trong ô nhập.');
    step('Đã gửi tin cho Muse');

    // Chờ lượt trả lời: có tin mới của assistant, không tin nào đang chạy, im lặng QUIET_MS.
    // expect=video|image: chờ tới khi có ít nhất 1 media (Muse thường trả "👍" trước rồi mới gửi video).
    const deadline = Date.now() + timeoutMin * 60_000;
    let lastSig = '';
    let lastChange = Date.now();
    let lastLog = 0;
    let turn = [];
    while (Date.now() < deadline) {
      await page.waitForTimeout(3_000);
      // Trang có lúc tự tải lại (đo ngày 2026-11-09) → bỏ qua lần đọc lỗi, đọc lại ở vòng sau.
      const all = await readMessages(page).catch(() => null);
      if (!all) continue;
      turn = all.filter((m) => !oldIds.has(m.id) && m.role === 'assistant');
      const sig = JSON.stringify(turn.map((m) => [m.id, m.text.length, m.videos.length, m.images.length, m.busy]));
      if (sig !== lastSig) {
        lastSig = sig;
        lastChange = Date.now();
      }
      const media = turn.reduce((s, m) => s + m.videos.length + m.images.length, 0);
      const busy = turn.some((m) => m.busy);
      const quiet = Date.now() - lastChange > QUIET_MS;
      const got = expect === 'text' ? turn.some((m) => m.text) : media > 0;
      if (turn.length && !busy && quiet && got) break;
      if (Date.now() - lastLog > 30_000) {
        lastLog = Date.now();
        step(`Muse đang làm... ${turn.length} tin mới, ${media} media`);
      }
    }
    const text = turn.map((m) => m.text).filter(Boolean).join('\n');
    console.log('--- Muse trả lời:\n' + (text || '(chưa có chữ)'));
    const files = outDir ? await saveMedia(page, turn, outDir, prefix) : [];
    if (expect !== 'text' && !files.length) {
      throw new Error(`Hết ${timeoutMin} phút mà Muse chưa gửi ${expect}. Đọc câu trả lời ở trên; có thể Muse đang hỏi lại. Muse làm xong thì chạy --save-last để tải.`);
    }
    return { files, text };
  } catch (err) {
    keepTab = true;
    throw err;
  } finally {
    if (!keepTab) await page.close().catch(() => {});
  }
}

function parseArgs(argv) {
  const a = { refs: [] };
  const num = ['--timeout'];
  const map = { '--profile': 'profile', '--prompt': 'prompt', '--out': 'outDir', '--expect': 'expect', '--timeout': 'timeoutMin', '--prefix': 'prefix' };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k === '--save-last') a.saveLast = true;
    else if (k === '--ref') a.refs.push(argv[++i]);
    else if (map[k]) a[map[k]] = num.includes(k) ? Number(argv[++i]) : argv[++i];
  }
  return a;
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  museChat(parseArgs(process.argv.slice(2)))
    .then(() => process.exit(0))
    .catch((e) => {
      console.error('✗ ' + e.message);
      process.exit(1);
    });
}
