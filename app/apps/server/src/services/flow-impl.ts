import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, type BrowserContext, type Page } from 'playwright';
import { CHROME_CDP_URL } from '../paths';
import type { VideoGenService } from './types';

// Google Flow (flow.google.com) tạo video qua Omni/Veo, dùng credit gói AI Pro/Plus. connectOverCDP vào Chrome
// user tự mở (npm run chrome) — KHÔNG launch (tránh Google chặn OAuth).
// Bản port từ skill flow-chain-video (scripts/flow.mjs), giao diện và RPC đo thật ngày 2026-10-18, cập nhật tới 2026-10-31.
// Script bấm giao diện ở 2 bước có reCAPTCHA Enterprise ẩn: tải ảnh (RPC maseQ) và tạo video (RPC nprQif).
// Mọi bước khác đọc response batchexecute mà trang tự nhận, không tự gửi RPC, nên không cần token reCAPTCHA.

const FLOW_HOME = 'https://flow.google.com/';
// Ô TÊN project ở đầu trang là input, không phải contenteditable — selector này chỉ khớp ô prompt.
const COMPOSER = 'div[role="textbox"][contenteditable="true"]';
// Aria-label của chip là "Điều kiện kích hoạt cài đặt", không chứa tên model → tìm chip theo icon tỉ lệ trong chữ.
const CHIP = /crop_(9_16|16_9)/;
const GEN_TIMEOUT_MS = 12 * 60_000;
const UPSCALE_TIMEOUT_MS = 10 * 60_000;
const ALLOWED_DURATIONS = [4, 6, 8, 10];
// Omni chỉ có 360p/720p khi tạo. Bản tải 1080p/4K là bản Flow tăng độ phân giải sau khi tạo.
const GEN_QUALITY = process.env.FLOW_QUALITY || '720p';
const DOWNLOAD_RESOLUTION = process.env.FLOW_DOWNLOAD || '1080p';

const CDP_HINT =
  'Chưa kết nối được Chrome. Mở Chrome cho VideoFlow: npm run chrome, rồi đăng nhập Google trong cửa sổ đó 1 lần.';

const FLOW_MODEL_LABELS: Record<string, RegExp> = {
  'omni-flash': /Omni .*Flash/,
  'veo-3.1-lite': /Veo 3\.1 - Lite/,
  'veo-3.1-fast': /Veo 3\.1 - Fast/,
  'veo-3.1-quality': /Veo 3\.1 - Quality/,
};
const DEFAULT_MODEL = 'veo-3.1-fast';
// Chỉ Omni có lựa chọn độ dài và độ phân giải. Veo cố định 8 giây, 720p.
const OMNI = 'omni-flash';

/** Flow chỉ cho 4/6/8/10s — kéo về mốc gần nhất (mặc định 6 khi lệch giữa) */
function snapDuration(sec: number): number {
  return ALLOWED_DURATIONS.reduce((a, b) => (Math.abs(b - sec) <= Math.abs(a - sec) ? b : a), 6);
}

const log = (s: string) => console.log(`[flow] ${s}`);

type Rpc = { rpc: string; data: unknown };
type RpcHit = { req: unknown; res: unknown };

function parseBatchResponse(text: string): Rpc[] {
  const out: Rpc[] = [];
  for (const line of (text || '').split('\n')) {
    if (!line.startsWith('[[')) continue;
    let arr: unknown[];
    try {
      arr = JSON.parse(line);
    } catch {
      continue;
    }
    for (const e of arr as unknown[][]) {
      if (e?.[0] !== 'wrb.fr' || !e[2]) continue;
      try {
        out.push({ rpc: e[1] as string, data: JSON.parse(e[2] as string) });
      } catch {}
    }
  }
  return out;
}

function parseBatchRequest(postData: string | null): Rpc[] {
  try {
    const freq = new URLSearchParams(postData || '').get('f.req') || '';
    return (JSON.parse(freq)[0] as [string, string][]).map(([rpc, payload]) => ({ rpc, data: JSON.parse(payload) }));
  } catch {
    return [];
  }
}

const flatStrings = (o: unknown, out: string[] = []): string[] => {
  if (typeof o === 'string') out.push(o);
  else if (Array.isArray(o)) o.forEach((v) => flatStrings(v, out));
  return out;
};

// Mục media trong mọi RPC có dạng [mã, ..., [..., [mã trạng thái]] ở vị trí [5][8].
// Đo 2026-10-18: 6 = Flow vừa nhận lệnh (response nprQif), 2 = đang tạo, 3 = xong.
function collectStatuses(o: unknown, statuses: Map<string, number>): void {
  if (!Array.isArray(o)) return;
  const code = o[5]?.[8]?.[0];
  if (typeof o[0] === 'string' && typeof code === 'number') statuses.set(o[0], code);
  o.forEach((v) => collectStatuses(v, statuses));
}

type Waiter = {
  rpc: string;
  match?: (hit: RpcHit) => boolean;
  resolve: (hit: RpcHit) => void;
  timer?: NodeJS.Timeout;
};

function watchRpc(page: Page) {
  const waiters: Waiter[] = [];
  const statuses = new Map<string, number>();
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
  const waitRpc = (
    rpc: string,
    { match, timeout = 60_000, label = rpc }: { match?: Waiter['match']; timeout?: number; label?: string } = {},
  ) =>
    new Promise<RpcHit>((resolve, reject) => {
      const w: Waiter = { rpc, match, resolve };
      w.timer = setTimeout(() => {
        waiters.splice(waiters.indexOf(w), 1);
        reject(new Error(`Hết ${Math.round(timeout / 1000)} giây chờ ${label} từ Flow.`));
      }, timeout);
      waiters.push(w);
    });
  return { waitRpc, statuses };
}

type WaitRpc = ReturnType<typeof watchRpc>['waitRpc'];

async function newProject(page: Page): Promise<void> {
  await page.goto(FLOW_HOME, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  // Trước khi hydrate, trang hiện bản marketing — chờ nút thật thay vì chờ theo thời gian.
  const btn = page.getByRole('button', { name: /Dự án mới|New project/i }).first();
  await btn.waitFor({ timeout: 45_000 }).catch(() => {
    throw new Error('Không vào được Flow — kiểm tra đã đăng nhập Google trong cửa sổ npm run chrome chưa');
  });
  await btn.click();
  await page.locator(COMPOSER).first().waitFor({ timeout: 30_000 });
  await page.waitForTimeout(1_500);
  const done = page.getByRole('button', { name: /^(Done|Xong)$/ });
  if (await done.count()) await done.first().click().catch(() => {});
}

async function openSettings(page: Page): Promise<void> {
  if (await page.getByRole('radio', { name: /Video/ }).count()) return;
  await page.locator('button', { hasText: CHIP }).first().click();
  await page.getByRole('radio', { name: /Video/ }).first().waitFor({ timeout: 5_000 });
}

async function pickRadio(page: Page, name: RegExp, what: string): Promise<void> {
  await openSettings(page);
  const r = page.getByRole('radio', { name }).first();
  if (!(await r.count())) throw new Error(`Không thấy lựa chọn "${what}" trong cài đặt Flow.`);
  await r.click();
  await page.waitForTimeout(300);
}

async function configure(
  page: Page,
  opts: { model: string; aspect: string; duration: number; quality: string; frames: boolean },
): Promise<number | null> {
  // Chế độ Tác nhân bật thì chip cấu hình bị ẩn.
  if (!(await page.locator('button', { hasText: CHIP }).count())) {
    await page.getByRole('button', { name: /^(Agent|Tác nhân)$/ }).first().click().catch(() => {});
    await page.waitForTimeout(1_000);
  }
  if (!(await page.locator('button', { hasText: CHIP }).count())) throw new Error('Không thấy chip cấu hình của Flow.');

  await pickRadio(page, /Video/, 'Video');
  if (opts.frames) await pickRadio(page, /Khung hình|Frames/, 'Khung hình');
  await pickRadio(page, opts.aspect === '16:9' ? /16:9/ : /9:16/, opts.aspect);

  // Chọn model trước: đổi model làm Flow đặt lại độ dài và độ phân giải.
  await openSettings(page);
  await page
    .getByRole('button', { name: /Chọn nhóm mô hình|model/i })
    .or(page.locator('.cdk-overlay-pane button', { hasText: 'arrow_drop_down' }))
    .first()
    .click();
  await page
    .getByRole('menuitem', { name: FLOW_MODEL_LABELS[opts.model] })
    .first()
    .click({ timeout: 5_000 })
    .catch(() => {
      throw new Error(`Không chọn được model ${opts.model} trong Flow.`);
    });
  await page.waitForTimeout(600);

  if (opts.model === OMNI) {
    await pickRadio(page, new RegExp(`^${opts.quality}`), opts.quality);
    await pickRadio(page, new RegExp(`^${opts.duration} ?(giây|s)$`), `${opts.duration} giây`);
  } else if (opts.duration !== 8) {
    log(`! Model ${opts.model} cố định 8 giây trên Flow. Bỏ qua duration ${opts.duration}.`);
  }
  await pickRadio(page, /x1/, 'x1');

  const m = await page.evaluate(() => document.body.innerText.match(/tốn (\d+) tín dụng|use (\d+) credits?/i));
  const credits = m ? Number(m[1] || m[2]) : null;
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  const chip = await page.locator('button', { hasText: CHIP }).first().innerText().catch(() => '');
  log(`Cấu hình: ${chip.replace(/\s+/g, ' ').trim()} · ${credits ?? '?'} tín dụng`);
  return credits;
}

// src của ảnh trong hộp thoại có dạng flow-content.google/image/<mã>. Chỉ đi lên vài cấp từ tên file,
// vì đi lên tới gốc hộp thoại sẽ lấy nhầm ảnh của ô khác.
async function mediaIdFromTile(page: Page, name: string): Promise<string | null> {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    const id = await page
      .evaluate((n) => {
        const label = [...document.querySelectorAll('.cdk-overlay-container *')].find(
          (e) => !e.children.length && e.textContent?.trim() === n,
        );
        let el: Element | null | undefined = label;
        for (let depth = 0; el && depth < 5; depth++, el = el.parentElement) {
          const src = el.querySelector?.('img')?.src;
          if (src) return src.match(/\/image\/([0-9a-f-]{36})/)?.[1] ?? null;
        }
        return null;
      }, name)
      .catch(() => null);
    if (id) {
      log(`Không có response maseQ, lấy mã ảnh từ hộp thoại: ${id}`);
      return id;
    }
    await page.waitForTimeout(2_000);
  }
  return null;
}

async function attachFrame(page: Page, waitRpc: WaitRpc, slot: 'start' | 'end', file: string): Promise<string | null> {
  const slotName = slot === 'start' ? /^(Bắt đầu|Start)$/ : /^(Kết thúc|End)$/;
  await page.getByRole('button', { name: slotName }).first().click();
  const uploadBtn = page.getByRole('button', { name: /Tải nội dung nghe nhìn lên|Upload media/i }).first();
  await uploadBtn.waitFor({ timeout: 10_000 });
  // Đã gặp 1 response maseQ không có mã ảnh rồi mới tới response đúng → chỉ nhận response có mã.
  const firstId = (res: unknown) => (res as string[][] | undefined)?.[0]?.[0];
  const uploaded = waitRpc('maseQ', { match: ({ res }) => typeof firstId(res) === 'string', timeout: 30_000 }).catch(
    () => null,
  );
  const chooserP = page.waitForEvent('filechooser', { timeout: 15_000 });
  await uploadBtn.click();
  await (await chooserP).setFiles(path.resolve(file));
  // Lần chạy 2026-10-21 (3 lần): ảnh đã hiện trong hộp thoại nhưng trang không nhận response maseQ có mã.
  // Khi đó lấy mã từ src của ảnh nằm cạnh tên file trong hộp thoại.
  const name = path.basename(file);
  const hit = await uploaded;
  const mediaId = (hit && firstId(hit.res)) ?? (await mediaIdFromTile(page, name));
  if (!mediaId) log(`! Không đọc được mã ảnh ${slot}. Chọn ảnh theo tên file và bỏ bước kiểm tra mã trong lệnh tạo.`);
  // Hộp thoại liệt kê mọi ảnh của project. Chọn theo tên file vừa tải: bấm ảnh đầu tiên từng gắn nhầm ảnh start vào ô end.
  // Từ 2026-10-31, src ảnh trong hộp thoại là flow.google.com/asb/… không chứa mã ảnh, nên không tìm theo mã được.
  const label = page.locator('.cdk-overlay-container').getByText(name, { exact: true }).first();
  await label.waitFor({ timeout: 30_000 });
  // Đọc src trước khi bấm: project chỉ có 1 ảnh thì bấm là gắn luôn và hộp thoại đóng.
  // Ảnh thu nhỏ cạnh tên file chưa có src ngay sau khi tải, nên chờ tới khi có.
  const tileSrc = await label
    // Không khai báo hàm có tên trong callback evaluate: tsx (esbuild keepNames) chèn __name(), trang không có hàm này.
    .evaluate(async (el) => {
      const deadline = Date.now() + 15_000;
      while (Date.now() < deadline) {
        for (let n: Element | null = el, depth = 0; n && depth < 6; depth++, n = n.parentElement) {
          const src = [...n.querySelectorAll('img')].map((i) => i.src).find((s) => s.includes('/asb/'));
          if (src) return src;
        }
        await new Promise((r) => setTimeout(r, 500));
      }
      return null;
    })
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
          const same =
            (id && i.src.includes(id)) || (src && i.src.replace(/=[^/=]*$/, '') === src.replace(/=[^/=]*$/, ''));
          return same && !i.closest('.cdk-overlay-container') && w > 0 && w <= 80;
        }),
      { id: mediaId, src: tileSrc },
      { timeout: 10_000 },
    )
    .then(() => true)
    .catch(() => false);
  if (!attached) {
    throw new Error(`Ảnh ${name} đã tải lên nhưng chưa gắn vào ô ${slot}. src trong hộp thoại: ${tileSrc ?? '(không có)'}`);
  }
  log(`Ảnh ${slot}: ${name} → ${mediaId ?? '(không có mã)'}`);
  return mediaId;
}

// Ô video xong có ảnh thu nhỏ thật; ô đang tạo chỉ có số %. Trong tab vừa tạo, src ảnh là flow.google.com/asb/…
// không chứa mã video, nên nhận ô theo thẻ flow-video-tile thay vì theo mã.
const DONE_TILE = 'flow-video-tile:has(img[src]), flow-video-tile:has(video[src])';

// Lần chạy 2026-10-18 không nhận được jwpduf khớp mã video dù video đã xong → kiểm tra cả trạng thái RPC lẫn lưới kết quả.
async function waitVideo(page: Page, statuses: Map<string, number>, videoId: string | null): Promise<void> {
  const PENDING = new Set([1, 2, 6]);
  const deadline = Date.now() + GEN_TIMEOUT_MS;
  let lastPct: string | null = null;
  let lastCode: number | undefined;
  while (Date.now() < deadline) {
    const code = videoId ? statuses.get(videoId) : undefined;
    if (code === 3) return;
    if (code !== undefined && !PENDING.has(code) && code !== lastCode) {
      log(`! Flow báo trạng thái ${code} cho video ${videoId}. Tiếp tục chờ.`);
    }
    lastCode = code;
    if ((await page.locator(DONE_TILE).count().catch(() => 0)) > 0) return;
    const failed = await page
      .locator('flow-video-tile', { hasText: /Không thành công|thất bại|Failed|went wrong/i })
      .count()
      .catch(() => 0);
    if (failed) throw new Error('Flow báo tạo video không thành công. Xem tab Chrome.');
    const pct = await page.evaluate(() => (document.body.innerText.match(/\b(\d{1,3})%/) || [])[1] ?? null).catch(() => null);
    if (pct && pct !== lastPct) log(`Flow đang tạo: ${pct}%`);
    lastPct = pct;
    await page.waitForTimeout(2_000);
  }
  throw new Error(
    `Flow chưa render xong video sau ${Math.round(GEN_TIMEOUT_MS / 60_000)} phút — kiểm tra tab Chrome (có thể hết credit hoặc Flow đang lỗi)`,
  );
}

async function downloadResult(page: Page, resolution: string, outFile: string): Promise<void> {
  await page.keyboard.press('Escape');
  // Mỗi clip có project riêng, nên project chỉ có 1 ô video.
  const tile = page.locator(DONE_TILE).first();
  await tile.waitFor({ timeout: 30_000 });
  await tile.hover();
  await page.waitForTimeout(600);
  // Mọi ô có nút "Tuỳ chọn khác" ẩn; leo từ ô video lên để lấy đúng nút của ô đó.
  const more = await tile.evaluateHandle((el) => {
    for (let n: Element | null = el; n; n = n.parentElement) {
      const b = n.querySelector('button[aria-label="Tuỳ chọn khác"], button[aria-label="More options"]');
      if (b) return b;
    }
    return null;
  });
  const moreBtn = more.asElement();
  if (!moreBtn) throw new Error('Không thấy menu của video kết quả.');
  await moreBtn.click();
  await page.getByRole('menuitem', { name: /Tải xuống|Download/ }).first().click({ timeout: 5_000 });
  await page.waitForTimeout(500);
  let option = page.getByRole('menuitem', { name: new RegExp(`^${resolution}`) }).first();
  if (!(await option.count())) {
    log(`! Flow không có lựa chọn ${resolution}. Tải kích thước gốc.`);
    option = page.getByRole('menuitem', { name: /Kích thước gốc|Original/ }).first();
  }
  // Bản tăng độ phân giải chưa có thì Flow tạo trước (RPC p0UkFb có reCAPTCHA), nên phải bấm giao diện và chờ lâu.
  const dlP = page.waitForEvent('download', { timeout: UPSCALE_TIMEOUT_MS });
  await option.click();
  log(`Đang tải bản ${resolution}...`);
  const dl = await dlP;
  await fs.mkdir(path.dirname(path.resolve(outFile)), { recursive: true });
  await dl.saveAs(path.resolve(outFile));
}

// ctx.newPage() và page.bringToFront() làm macOS chuyển focus sang Chrome, Target.createTarget với background: true thì không.
// Đo ngày 2026-10-30: tab nền vẫn chạy timer và requestAnimationFrame đủ tốc độ.
async function newBackgroundPage(ctx: BrowserContext): Promise<Page> {
  // Nhiều task có thể mở tab cùng lúc. Tìm tab theo URL riêng thay vì chờ sự kiện 'page'.
  const mark = `about:blank#flow-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const browser = ctx.browser();
  if (!browser) return ctx.newPage();
  const cdp = await browser.newBrowserCDPSession();
  await cdp.send('Target.createTarget', { url: mark, background: true });
  await cdp.detach();
  for (let i = 0; i < 50; i++) {
    const page = ctx.pages().find((p) => p.url() === mark);
    if (page) return page;
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('Chrome không mở được tab mới.');
}

export function createFlowVideoGen(): VideoGenService {
  let contextPromise: Promise<BrowserContext> | null = null;
  // Pool video gen. MẶC ĐỊNH 1 = TUẦN TỰ: Flow ăn credit, và fan-out (engine bắn Promise.all) phải
  // đợi video trước render xong mới gen tiếp — chạy song song gây "send 2 prompt liền không đợi" +
  // tốn credit gấp đôi. Muốn song song thì set FLOW_POOL_SIZE>1.
  const POOL = Math.max(1, Number(process.env.FLOW_POOL_SIZE) || 1);
  let active = 0;
  const waiters: Array<() => void> = [];

  function ensureContext(): Promise<BrowserContext> {
    if (!contextPromise) {
      contextPromise = (async () => {
        try {
          const browser = await chromium.connectOverCDP(CHROME_CDP_URL, { timeout: 5_000 });
          const ctx = browser.contexts()[0] ?? (await browser.newContext());
          browser.on('disconnected', () => {
            contextPromise = null;
          });
          return ctx;
        } catch {
          contextPromise = null;
          throw new Error(CDP_HINT);
        }
      })();
    }
    return contextPromise;
  }

  function acquire(): Promise<void> {
    if (active < POOL) {
      active++;
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => waiters.push(resolve));
  }
  function release(): void {
    if (waiters.length > 0) waiters.shift()!();
    else active = Math.max(0, active - 1);
  }
  async function enqueue<T>(task: () => Promise<T>): Promise<T> {
    await acquire();
    try {
      return await task();
    } finally {
      release();
    }
  }

  async function generate(req: {
    prompt: string;
    imagePath?: string;
    endImagePath?: string;
    model: string;
    durationSeconds: number;
    aspectRatio: string;
    outFile: string;
  }): Promise<void> {
    const model = FLOW_MODEL_LABELS[req.model] ? req.model : DEFAULT_MODEL;
    const dryRun = process.env.FLOW_DRYRUN === '1';
    const ctx = await ensureContext();
    const page = await newBackgroundPage(ctx);
    const { waitRpc, statuses } = watchRpc(page);
    let keepTab = false;
    try {
      // Project mới cho mỗi video: thư viện ảnh và lưới kết quả chỉ chứa dữ liệu của video này.
      await newProject(page);
      log(`Project: ${page.url()}`);
      await configure(page, {
        model,
        aspect: req.aspectRatio,
        duration: snapDuration(req.durationSeconds),
        quality: GEN_QUALITY,
        frames: !!(req.imagePath || req.endImagePath),
      });
      const startId = req.imagePath ? await attachFrame(page, waitRpc, 'start', req.imagePath) : null;
      const endId = req.endImagePath ? await attachFrame(page, waitRpc, 'end', req.endImagePath) : null;

      await page.locator(COMPOSER).last().click();
      // insertText thay vì keyboard.type: Flow coi '\n' là Enter = gửi, prompt nhiều dòng sẽ tách thành 2 video.
      await page.keyboard.insertText(req.prompt);
      await page.waitForTimeout(500);

      if (dryRun) {
        // Verify selector mà không tốn credit: tab để mở cho user xem.
        keepTab = true;
        log('DRY RUN: đã nạp cấu hình, ảnh và prompt, chưa bấm tạo.');
        return;
      }

      const submitted = waitRpc('nprQif', { timeout: 60_000, label: 'lệnh tạo video' });
      await page.getByRole('button', { name: /^(Bắt đầu tạo|Generate|Create)$/ }).first().click();
      const { req: sentReq, res } = await submitted;
      const sent = flatStrings(sentReq);
      log(`Flow nhận lệnh tạo: model ${sent.find((s) => /^(omni|veo)_[a-z0-9_]+$/.test(s)) ?? '?'}`);
      if (startId && !sent.includes(startId)) throw new Error(`Lệnh tạo không chứa ảnh start ${startId}. Video sẽ sai, xem tab Chrome.`);
      if (endId && !sent.includes(endId)) throw new Error(`Lệnh tạo không chứa ảnh end ${endId}. Video sẽ sai, xem tab Chrome.`);
      if (!sent.includes(req.prompt)) log('! Prompt Flow nhận khác prompt đã gửi.');
      const videoId = ((res as string[][][] | undefined)?.[3]?.[0]?.[0] as string | undefined) ?? null;
      log(`Mã video: ${videoId ?? '(không đọc được)'}`);

      await waitVideo(page, statuses, videoId);
      await downloadResult(page, DOWNLOAD_RESOLUTION, req.outFile);
      log(`✓ Đã lưu video: ${req.outFile}`);
    } catch (err) {
      // Để tab mở cho user xem lỗi. Lỗi ENOENT khi lưu file xảy ra lúc video đã xong, tab không còn dùng.
      keepTab = !/download\.saveAs|ENOENT/.test((err as Error).message);
      throw err;
    } finally {
      if (!keepTab) await page.close().catch(() => {}); // login vẫn giữ trong profile CDP
    }
  }

  return {
    generateVideo: (req) => enqueue(() => generate(req)),
  };
}
