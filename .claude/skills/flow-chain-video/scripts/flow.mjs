#!/usr/bin/env node
// Google Flow (flow.google.com) qua Chrome CDP: tạo 1 video từ prompt + ảnh Start/End, rồi tải bản 1080p.
// Script bấm giao diện ở 2 bước có reCAPTCHA Enterprise ẩn: tải ảnh (RPC maseQ) và tạo video (RPC nprQif).
// Mọi bước khác đọc response batchexecute mà trang tự nhận, không tự gửi RPC, nên không cần token reCAPTCHA.
// Giao diện và RPC đo thật ngày 2026-10-18.
//
// CLI:
//   node flow.mjs --prompt "..." --out out.mp4 [--image start.png] [--end-image end.png]
//                 [--model omni-flash] [--duration 6] [--aspect 9:16] [--quality 720p] [--download 1080p] [--dry-run]
//   node flow.mjs --project <url> --out out.mp4 [--download 1080p]   (tải video từ project đã tạo xong)

import fs from 'node:fs/promises';
import path from 'node:path';
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const CHROME_CDP_URL = process.env.CHROME_CDP_URL || 'http://127.0.0.1:9222';
const FLOW_HOME = 'https://flow.google.com/';
// Ô TÊN project ở đầu trang là input, không phải contenteditable — selector này chỉ khớp ô prompt.
const COMPOSER = 'div[role="textbox"][contenteditable="true"]';
// Aria-label của chip là "Điều kiện kích hoạt cài đặt", không chứa tên model → tìm chip theo icon tỉ lệ trong chữ.
const CHIP = /crop_(9_16|16_9)/;
const GEN_TIMEOUT_MS = 12 * 60_000;
const UPSCALE_TIMEOUT_MS = 10 * 60_000;
export const ALLOWED_DURATIONS = [4, 6, 8, 10];

export const FLOW_MODEL_LABELS = {
  // Ngày 2026-11-07, Flow thêm Omni 1.2 Flash, đặt làm model mặc định, giá gần gấp đôi Omni 1.1.
  'omni-flash': /Omni 1\.1 Flash/,
  'omni-1.2-flash': /Omni 1\.2 Flash/,
  'veo-3.1-lite': /Veo 3\.1 - Lite/,
  'veo-3.1-fast': /Veo 3\.1 - Fast/,
  'veo-3.1-quality': /Veo 3\.1 - Quality/,
};
// Chỉ Omni có lựa chọn độ dài và độ phân giải. Veo cố định 8 giây, 720p.
const OMNI = 'omni-flash';
const isOmni = (model) => model.startsWith('omni');

export function snapDuration(sec) {
  return ALLOWED_DURATIONS.reduce((a, b) => (Math.abs(b - sec) <= Math.abs(a - sec) ? b : a), 6);
}

const t0 = Date.now();
const step = (s) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s] ${s}`);

function parseBatchResponse(text) {
  const out = [];
  for (const line of (text || '').split('\n')) {
    if (!line.startsWith('[[')) continue;
    let arr;
    try {
      arr = JSON.parse(line);
    } catch {
      continue;
    }
    for (const e of arr) {
      if (e?.[0] !== 'wrb.fr' || !e[2]) continue;
      try {
        out.push({ rpc: e[1], data: JSON.parse(e[2]) });
      } catch {}
    }
  }
  return out;
}

function parseBatchRequest(postData) {
  try {
    const freq = new URLSearchParams(postData || '').get('f.req');
    return JSON.parse(freq)[0].map(([rpc, payload]) => ({ rpc, data: JSON.parse(payload) }));
  } catch {
    return [];
  }
}

const flatStrings = (o, out = []) => {
  if (typeof o === 'string') out.push(o);
  else if (Array.isArray(o)) o.forEach((v) => flatStrings(v, out));
  return out;
};

// Mục media trong mọi RPC có dạng [mã, ..., [..., [mã trạng thái]] ở vị trí [5][8].
// Đo 2026-10-18: 6 = Flow vừa nhận lệnh (response nprQif), 2 = đang tạo, 3 = xong.
function collectStatuses(o, statuses) {
  if (!Array.isArray(o)) return;
  if (typeof o[0] === 'string' && typeof o[5]?.[8]?.[0] === 'number') statuses.set(o[0], o[5][8][0]);
  o.forEach((v) => collectStatuses(v, statuses));
}

function watchRpc(page) {
  const waiters = [];
  const statuses = new Map();
  page.on('response', async (res) => {
    if (!res.url().includes('/data/batchexecute')) return;
    const reqs = parseBatchRequest(res.request().postData());
    const results = parseBatchResponse(await res.text().catch(() => ''));
    results.forEach((r) => collectStatuses(r.data, statuses));
    for (const w of [...waiters]) {
      const req = reqs.find((r) => r.rpc === w.rpc)?.data;
      const result = results.find((r) => r.rpc === w.rpc)?.data;
      if (req === undefined && result === undefined) continue;
      if (w.match && !w.match({ req, res: result })) continue;
      waiters.splice(waiters.indexOf(w), 1);
      clearTimeout(w.timer);
      w.resolve({ req, res: result });
    }
  });
  // Gọi hàm này TRƯỚC thao tác kích hoạt RPC, nếu không response có thể đến trước khi có người chờ.
  const waitRpc = (rpc, { match, timeout = 60_000, label = rpc } = {}) =>
    new Promise((resolve, reject) => {
      const w = { rpc, match, resolve };
      w.timer = setTimeout(() => {
        waiters.splice(waiters.indexOf(w), 1);
        reject(new Error(`Hết ${Math.round(timeout / 1000)} giây chờ ${label} từ Flow.`));
      }, timeout);
      waiters.push(w);
    });
  return { waitRpc, statuses };
}

async function newProject(page) {
  await page.goto(FLOW_HOME, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  // Trước khi hydrate, trang hiện bản marketing — chờ nút thật thay vì chờ theo thời gian.
  const btn = page.getByRole('button', { name: /Dự án mới|New project/i }).first();
  await btn.waitFor({ timeout: 45_000 }).catch(() => {
    throw new Error('Không vào được Flow. Kiểm tra đã đăng nhập Google trong cửa sổ Chrome CDP chưa.');
  });
  await btn.click();
  await page.locator(COMPOSER).first().waitFor({ timeout: 30_000 });
  await page.waitForTimeout(1_500);
  const done = page.getByRole('button', { name: /^(Done|Xong)$/ });
  if (await done.count()) await done.first().click().catch(() => {});
}

async function openSettings(page) {
  if (await page.getByRole('radio', { name: /Video/ }).count()) return;
  await page.locator('button', { hasText: CHIP }).first().click();
  await page.getByRole('radio', { name: /Video/ }).first().waitFor({ timeout: 5_000 });
}

async function pickRadio(page, name, what) {
  await openSettings(page);
  const r = page.getByRole('radio', { name }).first();
  if (!(await r.count())) throw new Error(`Không thấy lựa chọn "${what}" trong cài đặt Flow.`);
  await r.click();
  await page.waitForTimeout(300);
}

// Omni 1.1 chọn độ dài bằng nút radio. Omni 1.2 dùng thanh trượt 3–15 giây.
async function pickDuration(page, sec) {
  await openSettings(page);
  const radio = page.getByRole('radio', { name: new RegExp(`^${sec} ?(giây|s)$`) }).first();
  if (await radio.count()) {
    await radio.click();
    await page.waitForTimeout(300);
    return;
  }
  const slider = page.locator('mat-slider.duration-slider input[type=range]').first();
  if (!(await slider.count())) throw new Error(`Không thấy lựa chọn "${sec} giây" trong cài đặt Flow.`);
  const shown = () => slider.evaluate((el) => el.closest('mat-slider').parentElement.parentElement.innerText);
  await slider.focus();
  await page.keyboard.press('Home');
  for (let i = 0; i < 20; i++) {
    if (new RegExp(`\\b${sec} ?(giây|s)\\b`).test(await shown())) return;
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(150);
  }
  throw new Error(`Không đặt được thanh trượt độ dài về ${sec} giây.`);
}

async function configure(page, { model, aspect, duration, quality, frames }) {
  // Chế độ Tác nhân bật thì chip cấu hình bị ẩn.
  if (!(await page.locator('button', { hasText: CHIP }).count())) {
    await page.getByRole('button', { name: /^(Agent|Tác nhân)$/ }).first().click().catch(() => {});
    await page.waitForTimeout(1_000);
  }
  if (!(await page.locator('button', { hasText: CHIP }).count())) throw new Error('Không thấy chip cấu hình của Flow.');

  await pickRadio(page, /Video/, 'Video');
  if (frames) await pickRadio(page, /Khung hình|Frames/, 'Khung hình');
  await pickRadio(page, aspect === '16:9' ? /16:9/ : /9:16/, aspect);

  // Chọn model trước: đổi model làm Flow đặt lại độ dài và độ phân giải.
  await openSettings(page);
  await page
    .getByRole('button', { name: /Chọn nhóm mô hình|model/i })
    .or(page.locator('.cdk-overlay-pane button', { hasText: 'arrow_drop_down' }))
    .first()
    .click();
  await page
    .getByRole('menuitem', { name: FLOW_MODEL_LABELS[model] })
    .first()
    .click({ timeout: 5_000 })
    .catch(() => {
      throw new Error(`Không chọn được model ${model} trong Flow.`);
    });
  await page.waitForTimeout(600);

  if (isOmni(model)) {
    await pickRadio(page, new RegExp(`^${quality}`), quality);
    await pickDuration(page, duration);
  } else if (duration !== 8) {
    console.warn(`! Model ${model} cố định 8 giây trên Flow. Bỏ qua duration ${duration}.`);
  }
  await pickRadio(page, /x1/, 'x1');

  const m = await page.evaluate(() => document.body.innerText.match(/tốn (\d+) tín dụng|use (\d+) credits?/i));
  const credits = m ? Number(m[1] || m[2]) : null;
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  const chip = await page.locator('button', { hasText: CHIP }).first().innerText().catch(() => '');
  step(`Cấu hình: ${chip.replace(/\s+/g, ' ').trim()} · ${credits ?? '?'} tín dụng`);
  return credits;
}

// src của ảnh trong hộp thoại có dạng flow-content.google/image/<mã>. Chỉ đi lên vài cấp từ tên file,
// vì đi lên tới gốc hộp thoại sẽ lấy nhầm ảnh của ô khác.
async function mediaIdFromTile(page, name) {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    const id = await page
      .evaluate((n) => {
        const label = [...document.querySelectorAll('.cdk-overlay-container *')].find((e) => !e.children.length && e.textContent.trim() === n);
        let el = label;
        for (let depth = 0; el && depth < 5; depth++, el = el.parentElement) {
          const src = el.querySelector?.('img')?.src;
          if (src) return src.match(/\/image\/([0-9a-f-]{36})/)?.[1] ?? null;
        }
        return null;
      }, name)
      .catch(() => null);
    if (id) {
      step(`Không có response maseQ, lấy mã ảnh từ hộp thoại: ${id}`);
      return id;
    }
    await page.waitForTimeout(2_000);
  }
  return null;
}

async function attachFrame(page, waitRpc, slot, file) {
  const slotName = slot === 'start' ? /^(Bắt đầu|Start)$/ : /^(Kết thúc|End)$/;
  await page.getByRole('button', { name: slotName }).first().click();
  const uploadBtn = page.getByRole('button', { name: /Tải nội dung nghe nhìn lên|Upload media/i }).first();
  await uploadBtn.waitFor({ timeout: 10_000 });
  // Đã gặp 1 response maseQ không có mã ảnh rồi mới tới response đúng → chỉ nhận response có mã.
  const uploaded = waitRpc('maseQ', { match: ({ res }) => typeof res?.[0]?.[0] === 'string', timeout: 30_000 }).catch(() => null);
  const chooserP = page.waitForEvent('filechooser', { timeout: 15_000 });
  await uploadBtn.click();
  await (await chooserP).setFiles(path.resolve(file));
  // Lần chạy 2026-10-21 (3 lần): ảnh đã hiện trong hộp thoại nhưng trang không nhận response maseQ có mã.
  // Khi đó lấy mã từ src của ảnh nằm cạnh tên file trong hộp thoại.
  const name = path.basename(file);
  const mediaId = (await uploaded)?.res?.[0]?.[0] ?? (await mediaIdFromTile(page, name));
  if (!mediaId) step(`! Không đọc được mã ảnh ${slot}. Script chọn ảnh theo tên file và bỏ bước kiểm tra mã trong lệnh tạo.`);
  // Hộp thoại liệt kê mọi ảnh của project. Chọn theo tên file vừa tải: bấm ảnh đầu tiên từng gắn nhầm ảnh start vào ô end.
  // Từ 2026-10-31, src ảnh trong hộp thoại là flow.google.com/asb/… không chứa mã ảnh, nên không tìm theo mã được.
  const label = page.locator('.cdk-overlay-container').getByText(name, { exact: true }).first();
  await label.waitFor({ timeout: 30_000 });
  // Đọc src trước khi bấm: project chỉ có 1 ảnh thì bấm là gắn luôn và hộp thoại đóng.
  // Ảnh thu nhỏ cạnh tên file chưa có src ngay sau khi tải, nên chờ tới khi có.
  const tileSrc = await label
    .evaluate(
      (el) =>
        new Promise((resolve) => {
          const deadline = Date.now() + 15_000;
          const poll = () => {
            for (let n = el, depth = 0; n && depth < 6; depth++, n = n.parentElement) {
              const src = [...(n.querySelectorAll?.('img') ?? [])].map((i) => i.src).find((s) => s.includes('/asb/'));
              if (src) return resolve(src);
            }
            if (Date.now() > deadline) return resolve(null);
            setTimeout(poll, 500);
          };
          poll();
        }),
    )
    .catch(() => null);
  await label.click();
  await page.waitForTimeout(600);
  // Project có từ 2 ảnh trở lên thì bấm ảnh chỉ mở xem trước; phải bấm thêm nút này mới gắn vào ô.
  const add = page.getByRole('button', { name: /Thêm vào câu lệnh|Add to prompt/i });
  if (await add.count()) await add.first().click();
  await page.waitForTimeout(800);
  if (await page.getByText(/Chọn một hình ảnh khung|Choose a frame/i).count()) await page.keyboard.press('Escape');
  const attached = await page
    .waitForFunction(
      ({ id, src }) =>
        [...document.querySelectorAll('img')].some((i) => {
          const w = i.getBoundingClientRect().width;
          // Ảnh trong ô và ảnh trong hộp thoại chỉ khác phần cỡ ảnh ở cuối, ví dụ =s512-rw.
          const base = (s) => s.replace(/=[^/=]*$/, '');
          const same = (id && i.src.includes(id)) || (src && base(i.src) === base(src));
          return same && !i.closest('.cdk-overlay-container') && w > 0 && w <= 80;
        }),
      { id: mediaId, src: tileSrc },
      { timeout: 10_000 },
    )
    .then(() => true)
    .catch(() => false);
  if (!attached) throw new Error(`Ảnh ${name} đã tải lên nhưng chưa gắn vào ô ${slot}. src trong hộp thoại: ${tileSrc ?? "(không có)"}`);
  step(`Ảnh ${slot}: ${name} → ${mediaId ?? '(không có mã)'}`);
  return mediaId;
}

// Ô video xong có ảnh thu nhỏ thật; ô đang tạo chỉ có số %. Trong tab vừa tạo, src ảnh là flow.google.com/asb/…
// không chứa mã video, nên nhận ô theo thẻ flow-video-tile thay vì theo mã.
const DONE_TILE = 'flow-video-tile:has(img[src]), flow-video-tile:has(video[src])';

async function videoTiles(page) {
  return page.locator(DONE_TILE).count().catch(() => 0);
}

// Lần chạy 2026-10-18 không nhận được jwpduf khớp mã video dù video đã xong → kiểm tra cả trạng thái RPC lẫn lưới kết quả.
async function waitVideo(page, statuses, videoId, timeout) {
  const PENDING = new Set([1, 2, 6]);
  const deadline = Date.now() + timeout;
  let lastPct = null;
  let lastCode;
  while (Date.now() < deadline) {
    const code = statuses.get(videoId);
    if (code === 3) return videoId;
    if (code !== undefined && !PENDING.has(code) && code !== lastCode) {
      console.warn(`! Flow báo trạng thái ${code} cho video ${videoId}. Script tiếp tục chờ.`);
    }
    lastCode = code;
    if ((await videoTiles(page)) > 0) return videoId ?? '(mã không đọc được)';
    const failed = await page
      .locator('flow-video-tile', { hasText: /Không thành công|thất bại|Failed|went wrong/i })
      .count()
      .catch(() => 0);
    if (failed) throw new Error('Flow báo tạo video không thành công. Xem tab Chrome.');
    const pct = await page.evaluate(() => (document.body.innerText.match(/\b(\d{1,3})%/) || [])[1]).catch(() => null);
    if (pct && pct !== lastPct) step(`Flow đang tạo: ${pct}%`);
    lastPct = pct;
    await page.waitForTimeout(2_000);
  }
  throw new Error(`Video chưa xong sau ${Math.round(timeout / 60_000)} phút. Xem tab Chrome.`);
}

async function downloadResult(page, resolution, outFile) {
  await page.keyboard.press('Escape');
  // Mỗi clip có project riêng, nên project chỉ có 1 ô video.
  const tile = page.locator(DONE_TILE).first();
  await tile.waitFor({ timeout: 30_000 });
  await tile.hover();
  await page.waitForTimeout(600);
  // Mọi ô có nút "Tuỳ chọn khác" ẩn; leo từ ô video lên để lấy đúng nút của ô đó.
  const more = await tile.evaluateHandle((el) => {
    for (let n = el; n; n = n.parentElement) {
      const b = n.querySelector?.('button[aria-label="Tuỳ chọn khác"], button[aria-label="More options"]');
      if (b) return b;
    }
    return null;
  });
  if (!more.asElement()) throw new Error('Không thấy menu của video kết quả.');
  await more.asElement().click();
  await page.getByRole('menuitem', { name: /Tải xuống|Download/ }).first().click({ timeout: 5_000 });
  await page.waitForTimeout(500);
  let option = page.getByRole('menuitem', { name: new RegExp(`^${resolution}`) }).first();
  if (!(await option.count())) {
    console.warn(`! Flow không có lựa chọn ${resolution}. Tải kích thước gốc.`);
    option = page.getByRole('menuitem', { name: /Kích thước gốc|Original/ }).first();
  }
  // Bản tăng độ phân giải chưa có thì Flow tạo trước (RPC p0UkFb có reCAPTCHA), nên phải bấm giao diện và chờ lâu.
  const dlP = page.waitForEvent('download', { timeout: UPSCALE_TIMEOUT_MS });
  await option.click();
  step(`Đang tải bản ${resolution}...`);
  const dl = await dlP;
  await fs.mkdir(path.dirname(path.resolve(outFile)), { recursive: true });
  await dl.saveAs(path.resolve(outFile));
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
  // Clip tạo song song nên nhiều tiến trình mở tab cùng lúc. Tìm tab theo URL riêng thay vì chờ sự kiện 'page'.
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

export async function generateFlowVideo({
  prompt,
  startImage,
  endImage,
  model = OMNI,
  duration = 6,
  aspect = '9:16',
  quality = '720p',
  download = '1080p',
  outFile,
  project,
  dryRun = process.env.FLOW_DRYRUN === '1',
}) {
  if (!prompt && !project) throw new Error('Thiếu prompt.');
  if (!dryRun && !outFile) throw new Error('Thiếu đường dẫn file ra.');
  if (!FLOW_MODEL_LABELS[model]) {
    throw new Error(`Model không hỗ trợ: ${model}. Chọn một trong: ${Object.keys(FLOW_MODEL_LABELS).join(', ')}.`);
  }

  let browser;
  try {
    browser = await chromium.connectOverCDP(CHROME_CDP_URL, { timeout: 5_000 });
  } catch (err) {
    // Trên macOS, người dùng đóng hết cửa sổ thì Chrome vẫn chạy với 0 tab, và Playwright không kết nối được.
    if (!/context management is not supported/i.test(err.message)) {
      throw new Error(`Không kết nối được Chrome tại ${CHROME_CDP_URL}. Chạy: node scripts/launch-chrome.mjs`);
    }
    await openBackgroundWindow().catch(() => {});
    browser = await chromium.connectOverCDP(CHROME_CDP_URL, { timeout: 5_000 }).catch(() => {
      throw new Error(`Chrome tại ${CHROME_CDP_URL} không có cửa sổ nào. Mở 1 cửa sổ trong Chrome CDP rồi chạy lại.`);
    });
  }
  // Không gọi browser.close(): với Chrome của người dùng, lệnh này đóng luôn cửa sổ đã đăng nhập.
  const ctx = browser.contexts()[0] ?? (await browser.newContext());
  const page = await newBackgroundPage(ctx);
  const { waitRpc, statuses } = watchRpc(page);
  let keepTab = false;
  try {
    if (project) {
      await page.goto(project, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await page.locator(COMPOSER).first().waitFor({ timeout: 45_000 });
      const doneId = await waitVideo(page, statuses, null, GEN_TIMEOUT_MS);
      step(`Video trong project: ${doneId}`);
      await downloadResult(page, download, outFile);
      step(`✓ Đã lưu video: ${outFile}`);
      return outFile;
    }
    // Project mới cho mỗi clip: thư viện ảnh và lưới kết quả chỉ chứa dữ liệu của clip này.
    await newProject(page);
    step(`Project: ${page.url()}`);
    await configure(page, {
      model,
      aspect,
      duration: snapDuration(duration),
      quality,
      frames: !!(startImage || endImage),
    });
    const startId = startImage ? await attachFrame(page, waitRpc, 'start', startImage) : null;
    const endId = endImage ? await attachFrame(page, waitRpc, 'end', endImage) : null;

    await page.locator(COMPOSER).last().click();
    // insertText thay vì keyboard.type: Flow coi '\n' là Enter = gửi, prompt nhiều dòng sẽ tách thành 2 video.
    await page.keyboard.insertText(prompt);
    await page.waitForTimeout(500);

    if (dryRun) {
      keepTab = true;
      step('DRY RUN: đã nạp cấu hình, ảnh và prompt, chưa bấm tạo. Tab Flow để mở để bạn kiểm tra.');
      return null;
    }

    const submitted = waitRpc('nprQif', { timeout: 60_000, label: 'lệnh tạo video' });
    await page.getByRole('button', { name: /^(Bắt đầu tạo|Generate|Create)$/ }).first().click();
    const { req, res } = await submitted;
    const sent = flatStrings(req);
    step(`Flow nhận lệnh tạo: model ${sent.find((s) => /^(omni|veo)_[a-z0-9_]+$/.test(s)) ?? '?'}`);
    if (startId && !sent.includes(startId)) throw new Error(`Lệnh tạo không chứa ảnh start ${startId}. Video sẽ sai, xem tab Chrome.`);
    if (endId && !sent.includes(endId)) throw new Error(`Lệnh tạo không chứa ảnh end ${endId}. Video sẽ sai, xem tab Chrome.`);
    if (!sent.includes(prompt)) console.warn('! Prompt Flow nhận khác prompt đã gửi.');
    const videoId = res?.[3]?.[0]?.[0];
    step(`Mã video: ${videoId ?? '(không đọc được)'}`);

    const doneId = await waitVideo(page, statuses, videoId, GEN_TIMEOUT_MS);
    step(`Video xong: ${doneId}`);
    await downloadResult(page, download, outFile);
    step(`✓ Đã lưu video: ${outFile}`);
    return outFile;
  } catch (err) {
    // Lỗi tải ENOENT xảy ra khi video đã xong; tải lại bằng --project, nên tab này không còn dùng.
    keepTab = !/download\.saveAs|ENOENT/.test(err.message);
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

// So đường dẫn thật: ~/.claude/skills/<tên> là symlink về repo, và import.meta.url luôn là đường dẫn thật.
if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const a = parseArgs(process.argv.slice(2));
  if ((!a.prompt && !a.project) || (!a.out && !a['dry-run'])) {
    console.error(
      'Cách dùng: node flow.mjs --prompt "<prompt>" --out <file.mp4> [--image start.png] [--end-image end.png] [--model omni-flash] [--duration 6] [--aspect 9:16] [--quality 720p] [--download 1080p] [--dry-run]\n       node flow.mjs --project <url project đã tạo xong> --out <file.mp4> [--download 1080p]',
    );
    process.exit(1);
  }
  generateFlowVideo({
    prompt: a.prompt,
    startImage: a.image,
    endImage: a['end-image'],
    model: a.model || OMNI,
    duration: Number(a.duration || 6),
    aspect: a.aspect || '9:16',
    quality: a.quality || '720p',
    download: a.download || '1080p',
    outFile: a.out,
    project: a.project,
    dryRun: !!a['dry-run'] || process.env.FLOW_DRYRUN === '1',
  })
    // Kết nối CDP giữ event loop sống — phải thoát chủ động.
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(`✗ ${err.message}`);
      process.exit(1);
    });
}
