import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, type BrowserContext, type Page } from 'playwright';
import { CHROME_CDP_URL } from '../paths';
import type { VideoGenService } from './types';

// Google Flow (labs.google/fx/tools/flow) tạo video qua Veo, dùng credit gói AI Pro/Plus.
// Kiến thức selector hard-won ghi ở CLAUDE.md mục "Google Flow". connectOverCDP vào Chrome user
// tự mở (npm run chrome) — KHÔNG launch (tránh Google chặn OAuth).

const FLOW_DASHBOARD = 'https://labs.google/fx/tools/flow';
const COMPOSER = 'div[role="textbox"][contenteditable="true"]';
const GEN_TIMEOUT_MS = 12 * 60_000;
const ALLOWED_DURATIONS = [4, 6, 8, 10];

const CDP_HINT =
  'Chưa kết nối được Chrome. Mở Chrome cho VideoFlow: npm run chrome, rồi đăng nhập Google (Gemini) trong cửa sổ đó 1 lần.';

// model block (vd "veo-3.1-fast") → nhãn hiện trong dropdown của Flow
const FLOW_MODEL_LABELS: Record<string, string> = {
  'omni-flash': 'Omni Flash',
  'veo-3.1-lite': 'Veo 3.1 - Lite',
  'veo-3.1-fast': 'Veo 3.1 - Fast',
  'veo-3.1-quality': 'Veo 3.1 - Quality',
};
const DEFAULT_MODEL_LABEL = 'Veo 3.1 - Fast';

function resolveModelLabel(model: string): string {
  return FLOW_MODEL_LABELS[model] ?? DEFAULT_MODEL_LABEL;
}

/** Flow chỉ cho 4/6/8/10s — kéo về mốc gần nhất (mặc định 6 khi lệch giữa) */
function snapDuration(sec: number): number {
  return ALLOWED_DURATIONS.reduce((a, b) => (Math.abs(b - sec) <= Math.abs(a - sec) ? b : a), 6);
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

  /** Tạo project mới → chỉ có 1 video trong project, không lẫn kết quả cũ */
  async function newProject(page: Page): Promise<void> {
    await page.goto(FLOW_DASHBOARD, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    // SPA hydrate chậm: chờ nút thật xuất hiện thay vì chờ thời gian (trước đó là trang marketing)
    const btn = page.getByRole('button', { name: /Dự án mới|New project|add_2/i }).first();
    await btn.waitFor({ timeout: 45_000 }).catch(() => {
      throw new Error('Không vào được Flow — kiểm tra đã đăng nhập Google trong cửa sổ npm run chrome chưa');
    });
    await btn.click();
    await page.locator(COMPOSER).first().waitFor({ timeout: 30_000 });
    await page.waitForTimeout(2_500);
  }

  // Chip cấu hình LUÔN chứa icon tỉ lệ "crop_…" (crop_9_16/crop_16_9) ở mọi trạng thái/model
  // — bám token này thay vì text model/thời lượng (đổi tuỳ chế độ). Khi Agent bật thì chip bị ẩn.
  const CHIP_NAME = /crop_|Nano Banana|Omni|Veo|Flash/i;

  /** Mở popover cấu hình (Agent là toggle, persist theo project → dò động thay vì click mù) */
  async function openConfigPopover(page: Page): Promise<void> {
    if ((await page.getByRole('button', { name: CHIP_NAME }).count()) === 0) {
      await page.getByRole('button', { name: /^(Agent|Tác nhân)$/i }).first().click().catch(() => {});
      await page.waitForTimeout(1_500);
    }
    await page.getByRole('button', { name: CHIP_NAME }).first().click({ timeout: 8_000 });
    await page.waitForTimeout(1_200);
  }

  async function clickTab(page: Page, name: string | RegExp, exact = false): Promise<void> {
    const t = page.getByRole('tab', { name, exact });
    if (await t.count()) {
      await t.first().click().catch(() => {});
      await page.waitForTimeout(500);
    }
  }

  async function selectModel(page: Page, label: string): Promise<void> {
    // Dropdown trigger chứa 'arrow_drop_down'; mở rồi chọn option (loại trừ chính trigger)
    const dd = page.getByRole('button', { name: /arrow_drop_down/i }).last();
    if (!(await dd.count())) return;
    await dd.click().catch(() => {});
    await page.waitForTimeout(800);
    await page
      .locator('button', { hasText: label })
      .filter({ hasNotText: 'arrow_drop_down' })
      .first()
      .click({ timeout: 5_000 })
      .catch(() => {});
    await page.waitForTimeout(500);
  }

  async function configure(
    page: Page,
    opts: { modelLabel: string; aspect: string; duration: number; frames: boolean },
  ): Promise<void> {
    await openConfigPopover(page);
    // Project mới mặc định mode Image → phải chuyển sang Video trước
    await clickTab(page, /play_circle|Video/);
    if (opts.frames) await clickTab(page, /crop_free|Khung hình|Frames/i);
    await selectModel(page, opts.modelLabel);
    await clickTab(page, opts.aspect === '16:9' ? /16:9/ : /9:16/);
    await clickTab(page, '1x', true);
    await clickTab(page, `${opts.duration}s`, true);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(800);
  }

  // Nhãn slot frame theo ngôn ngữ Flow (EN | VI) — Flow theo ngôn ngữ tài khoản Google, không ép qua URL
  const SLOT_LABELS: Record<'Start' | 'End', string[]> = {
    Start: ['Start', 'Bắt đầu'],
    End: ['End', 'Kết thúc'],
  };

  /** Toạ độ tâm slot frame (Start/End). Slot là div clickable chứa nhãn (KHÔNG phải button, class băm
   *  đổi theo bản deploy) → leo lên phần tử hình vuông ~50px thay vì bám class. Khớp nhãn EN lẫn VI. */
  async function slotCenter(page: Page, label: 'Start' | 'End'): Promise<{ x: number; y: number } | null> {
    return page.evaluate((labels) => {
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (w.nextNode()) {
        if (!labels.includes((w.currentNode.textContent || '').trim())) continue;
        let el = w.currentNode.parentElement;
        for (let i = 0; i < 5 && el; i++) {
          const r = el.getBoundingClientRect();
          if (r.width >= 44 && r.width <= 160 && r.height >= 44) {
            return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) };
          }
          el = el.parentElement;
        }
        const r = (w.currentNode.parentElement as HTMLElement).getBoundingClientRect();
        return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) };
      }
      return null;
    }, SLOT_LABELS[label]);
  }

  /** Nạp ảnh vào slot Frames: click slot → dialog chọn media → "Upload media" → filechooser →
   *  click asset vừa lên (Flow tự gắn vào slot và đóng dialog; KHÔNG cần nút "Add to Prompt"). */
  async function attachFrame(page: Page, slot: 'Start' | 'End', imagePath: string): Promise<void> {
    const name = path.basename(imagePath);
    const box = await slotCenter(page, slot);
    if (!box) throw new Error(`Không thấy slot ${slot} trong Flow (chế độ Frames)`);
    await page.mouse.click(box.x, box.y);
    await page.waitForTimeout(1_200);
    const chooserP = page.waitForEvent('filechooser', { timeout: 15_000 });
    await page
      .getByText(/Tải nội dung nghe nhìn lên|Upload media/i)
      .first()
      .click({ timeout: 8_000 });
    await (await chooserP).setFiles(imagePath);
    // Asset hiện trong picker (kèm spinner xử lý) → chờ rồi click để gắn vào slot
    const tile = page.getByText(name, { exact: false }).first();
    await tile.waitFor({ timeout: 45_000 });
    await page.waitForTimeout(3_000);
    await tile.click().catch(() => {});
    await page.waitForTimeout(2_500);
  }

  async function typeAndSubmit(page: Page, prompt: string): Promise<void> {
    const composer = page.locator(COMPOSER).first();
    await composer.click();
    // insertText (KHÔNG keyboard.type): prompt nhiều dòng thì mỗi '\n' bị Flow hiểu là Enter=SUBMIT sớm
    // → gen 2 video (1 có frame + nửa prompt, 1 chỉ phần prompt còn lại không ảnh). insertText chèn cả
    // chuỗi trong 1 input event, React vẫn nhận, không phát Enter giữa chừng.
    await page.keyboard.insertText(prompt);
    await page.waitForTimeout(800);
    if (process.env.FLOW_DRYRUN === '1') return; // verify gõ prompt mà không submit (không tốn credit)
    // Nút submit = icon arrow_forward; aria-disabled cho tới khi có prompt → click chờ enable
    await page.locator('button').filter({ hasText: 'arrow_forward' }).last().click({ timeout: 15_000 });
  }

  /** XONG = không còn '\d+%' trong trang VÀ đã có <video>. Project mới nên chỉ 1 video → không nhầm */
  async function waitForVideoDone(page: Page): Promise<void> {
    const deadline = Date.now() + GEN_TIMEOUT_MS;
    await page.waitForTimeout(4_000);
    while (Date.now() < deadline) {
      const st = await page
        .evaluate(() => ({
          rendering: /\b\d{1,3}%/.test(document.body.innerText),
          hasVideo: !!document.querySelector('video'),
        }))
        .catch(() => ({ rendering: true, hasVideo: false }));
      if (!st.rendering && st.hasVideo) return;
      await page.waitForTimeout(4_000);
    }
    throw new Error(
      `Flow chưa render xong video sau ${Math.round(GEN_TIMEOUT_MS / 60_000)} phút — kiểm tra tab Chrome (có thể hết credit hoặc Flow đang lỗi)`,
    );
  }

  /**
   * Tải video: lấy src `<video>` (URL trpc media.getMediaUrlRedirect có auth) rồi GET thẳng bằng
   * request kèm cookie của context — bền hơn nhiều so với hover→kebab→Download (UI hay đổi/không trúng).
   * Reload trước để video về dạng tile đã settle với src trpc ổn định (ngay sau gen src có thể chưa sẵn).
   */
  async function downloadResult(page: Page, outFile: string): Promise<void> {
    await fs.mkdir(path.dirname(outFile), { recursive: true });
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60_000 }).catch(() => {});
    await page.locator('video').first().waitFor({ timeout: 30_000 }).catch(() => {});

    let src = '';
    const deadline = Date.now() + 30_000;
    while (Date.now() < deadline) {
      src = await page
        .locator('video')
        .first()
        .evaluate((v) => (v as HTMLVideoElement).currentSrc || (v as HTMLVideoElement).src || '')
        .catch(() => '');
      if (src.startsWith('http')) break;
      await page.waitForTimeout(1_000);
    }
    if (!src.startsWith('http')) throw new Error('Không lấy được URL video từ Flow sau khi render');

    const res = await page.request.get(src, { timeout: 60_000 });
    if (!res.ok()) throw new Error(`Tải video từ Flow lỗi HTTP ${res.status()}`);
    await fs.writeFile(outFile, await res.body());
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
    const ctx = await ensureContext();
    const page = await ctx.newPage();
    try {
      await newProject(page);
      await configure(page, {
        modelLabel: resolveModelLabel(req.model),
        aspect: req.aspectRatio,
        duration: snapDuration(req.durationSeconds),
        frames: !!(req.imagePath || req.endImagePath),
      });
      if (req.imagePath) await attachFrame(page, 'Start', req.imagePath);
      if (req.endImagePath) await attachFrame(page, 'End', req.endImagePath);
      await typeAndSubmit(page, req.prompt); // FLOW_DRYRUN: gõ prompt xong dừng (chưa submit)
      if (process.env.FLOW_DRYRUN === '1') return;
      await waitForVideoDone(page);
      await downloadResult(page, req.outFile);
    } finally {
      await page.close().catch(() => {}); // luôn đóng tab (login vẫn giữ trong profile CDP)
    }
  }

  return {
    generateVideo: (req) => enqueue(() => generate(req)),
  };
}
