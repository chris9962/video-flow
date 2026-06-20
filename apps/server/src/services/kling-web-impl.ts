import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, type BrowserContext, type Page } from 'playwright';
import { CHROME_CDP_URL } from '../paths';
import type { VideoGenService } from './types';

// Kling qua WEB (kling.ai/app) — dùng credit gói sub của user thay vì API trả tiền.
// connectOverCDP vào Chrome user tự mở (npm run chrome) + đăng nhập kling.ai. KHÔNG launch.
// Selector đã soi DOM thật (đăng nhập state). KHÔNG bấm Generate khi KLING_WEB_DRYRUN=1.

const CREATE_URL = 'https://kling.ai/app/video/new';
const COMPOSER = 'div.tiptap.ProseMirror[contenteditable="true"]';
const GEN_TIMEOUT_MS = 12 * 60_000;

const CDP_HINT =
  'Chưa kết nối được Chrome. Mở Chrome cho VideoFlow (npm run chrome), rồi đăng nhập kling.ai trong cửa sổ đó (Settings → Mở tab kling.ai).';

export function createKlingWebService(): VideoGenService {
  let contextPromise: Promise<BrowserContext> | null = null;
  // Pool: tối đa POOL tab gen SONG SONG (mỗi gen 1 tab riêng, độc lập như Gemini ảnh). Dư thì chờ slot.
  const POOL = Math.max(1, Number(process.env.KLING_WEB_POOL_SIZE) || 3);
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

  /** Báo chưa đăng nhập (popup "Sign in"/"Trial Package" hoặc nút Sign In hiện) */
  async function assertLoggedIn(page: Page): Promise<void> {
    const needLogin = await page
      .evaluate(() => {
        const t = document.body.innerText;
        if (/Sign in to (Obtain|Claim)|Trial Package/i.test(t)) return true;
        const v = (el: Element) => {
          const r = el.getBoundingClientRect();
          return r.width > 4 && r.height > 4;
        };
        return [...document.querySelectorAll('button,a')].some(
          (e) => v(e) && /^sign in$/i.test((e as HTMLElement).innerText.trim()),
        );
      })
      .catch(() => false);
    if (needLogin) {
      throw new Error(
        'Chưa đăng nhập kling.ai trong cửa sổ Chrome — vào Settings → "Mở tab kling.ai" rồi đăng nhập, sau đó chạy lại.',
      );
    }
  }

  /**
   * Tắt Native Audio nếu đang BẬT — vì kling.ai KHOÁ frame End khi Native Audio bật ("End Frame is not
   * available with Native Audio"). Phải tắt TRƯỚC khi set frame (tắt sau khi set Start không cập nhật slot).
   * Toggle: ON = icon `#icon-checkbox-checked-secondary`, OFF = `#icon-checkbox-unchecked`.
   */
  async function ensureNativeAudioOff(page: Page): Promise<void> {
    const isOn = await page
      .evaluate(() => {
        const tw = [...document.querySelectorAll('*')].find((e) =>
          [...e.childNodes].some((n) => n.nodeType === 3 && /native audio/i.test(n.textContent ?? '')),
        );
        if (!tw) return false; // model không có Native Audio → bỏ qua
        let box: Element = tw;
        for (let i = 0; i < 3; i++) box = box.parentElement ?? box;
        return [...box.querySelectorAll('use')].some((u) =>
          /icon-checkbox-checked-secondary$/.test(u.getAttribute('xlink:href') || u.getAttribute('href') || ''),
        );
      })
      .catch(() => false);
    if (isOn) {
      await page.getByText(/native audio/i).first().click({ timeout: 6_000 }).catch(() => {});
      await page.waitForTimeout(1_500);
    }
  }

  /**
   * Mở popover config (click div summary "1080p · 5s · 16:9 · 1") rồi chọn Mode/Length/Aspect.
   * Option là `div.inner` (vd <div class="inner">10s</div>); popover giữ mở khi click nhiều option.
   * Length + Aspect set chắc; Quality best-effort (nếu trượt thì giữ mặc định trang).
   */
  async function applyConfig(
    page: Page,
    opts: { quality?: string; durationSeconds: number; aspectRatio: string },
  ): Promise<void> {
    const center = await page
      .evaluate(() => {
        const el = [...document.querySelectorAll('*')].find(
          (e) =>
            [...e.childNodes].some((n) => n.nodeType === 3 && /720p|1080p/.test(n.textContent ?? '')) &&
            /·/.test((e as HTMLElement).innerText || '') &&
            ((e as HTMLElement).innerText || '').length < 40,
        );
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) };
      })
      .catch(() => null);
    if (!center) return; // không thấy thanh config → bỏ qua, dùng mặc định trang
    await page.mouse.click(center.x, center.y);
    await page.waitForTimeout(1_000);

    const pick = async (re: RegExp): Promise<void> => {
      await page.locator('div.inner').filter({ hasText: re }).first().click({ timeout: 4_000 }).catch(() => {});
      await page.waitForTimeout(400);
    };
    if (opts.quality) await pick(new RegExp(`^${opts.quality}$`));
    await pick(new RegExp(`^${opts.durationSeconds}s$`));
    await pick(new RegExp(`^${opts.aspectRatio.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`));
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(600);
  }

  /** Frame Start: input file đầu có sẵn trong DOM → setInputFiles thẳng (verified) */
  async function setStartFrame(page: Page, imagePath: string): Promise<void> {
    await page.locator('input[type=file][accept*="jpg" i]').first().setInputFiles(imagePath);
    await page.waitForTimeout(3_000); // chờ upload + UI tách thành 2 slot (Start | "Add an end frame")
  }

  /** Frame End: chỉ khả dụng khi có Start + Native Audio đã tắt. Slot "Add an end frame" → click → filechooser */
  async function setEndFrame(page: Page, imagePath: string): Promise<void> {
    const endSlot = page.getByText(/add an end frame/i).first();
    await endSlot.waitFor({ timeout: 8_000 }).catch(() => {
      throw new Error(
        'Frame End không khả dụng trên kling.ai — thường do Native Audio đang bật hoặc model không hỗ trợ end frame.',
      );
    });
    const [chooser] = await Promise.all([
      page.waitForEvent('filechooser', { timeout: 8_000 }),
      endSlot.click({ timeout: 6_000 }),
    ]);
    await chooser.setFiles(imagePath);
    await page.waitForTimeout(3_000);
  }

  /** src video đầu tiên (mới nhất) trong khu kết quả — dùng để phân biệt video MỚI với history cũ */
  async function firstVideoSrc(page: Page): Promise<string> {
    return page
      .locator('video')
      .first()
      .evaluate((v) => (v as HTMLVideoElement).currentSrc || (v as HTMLVideoElement).src || '')
      .catch(() => '');
  }

  /** Tâm nút download (icon `#icon-download`) trong card kết quả */
  function downloadBtnCenter(page: Page) {
    return page.evaluate(() => {
      const use = [...document.querySelectorAll('use')].find((u) =>
        /icon-download$/.test(u.getAttribute('xlink:href') || u.getAttribute('href') || ''),
      );
      if (!use) return null;
      let el: Element = use;
      for (let i = 0; i < 5; i++) {
        if (el.tagName && /button/i.test(el.tagName)) break;
        el = el.parentElement ?? el;
      }
      const r = el.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    });
  }

  /**
   * Video Kling là blob: (không request.get được). Tải = bấm nút `#icon-download` → waitForEvent('download').
   * XONG = video đầu (mới nhất) có src KHÁC `beforeSrc` (video vừa gen, không lẫn history) VÀ nút download hiện.
   */
  async function downloadResult(page: Page, outFile: string, beforeSrc: string): Promise<void> {
    await fs.mkdir(path.dirname(outFile), { recursive: true });
    const deadline = Date.now() + GEN_TIMEOUT_MS;
    let ready = false;
    while (Date.now() < deadline) {
      const st = await page
        .evaluate(() => {
          const v = document.querySelector('video');
          const hasDl = [...document.querySelectorAll('use')].some((u) =>
            /icon-download$/.test(u.getAttribute('xlink:href') || u.getAttribute('href') || ''),
          );
          return { src: v ? (v as HTMLVideoElement).currentSrc || (v as HTMLVideoElement).src || '' : '', dur: v ? (v as HTMLVideoElement).duration : 0, hasDl };
        })
        .catch(() => ({ src: '', dur: 0, hasDl: false }));
      if (st.src && st.src !== beforeSrc && st.dur > 0 && st.hasDl) {
        ready = true;
        break;
      }
      await page.waitForTimeout(4_000);
    }
    if (!ready) {
      throw new Error(`Kling web chưa render xong video sau ${Math.round(GEN_TIMEOUT_MS / 60_000)} phút — kiểm tra tab Chrome`);
    }

    await page.locator('video').first().hover().catch(() => {});
    await page.waitForTimeout(1_000);
    let saved = false;
    for (let attempt = 0; attempt < 3 && !saved; attempt++) {
      try {
        const box = await downloadBtnCenter(page);
        if (!box) throw new Error('không thấy nút download');
        const [download] = await Promise.all([
          page.waitForEvent('download', { timeout: 25_000 }),
          page.mouse.click(box.x, box.y),
        ]);
        await download.saveAs(outFile);
        saved = true;
      } catch {
        await page.locator('video').first().hover().catch(() => {});
        await page.waitForTimeout(2_500);
      }
    }
    if (!saved) throw new Error('Không tải được video Kling web sau vài lần thử');
  }

  async function generate(req: {
    prompt: string;
    imagePath?: string;
    endImagePath?: string;
    quality?: string;
    durationSeconds: number;
    aspectRatio: string;
    outFile: string;
  }): Promise<void> {
    const ctx = await ensureContext();
    const page = await ctx.newPage();
    try {
      await page.goto(CREATE_URL, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      const composer = page.locator(COMPOSER).first();
      await composer.waitFor({ timeout: 30_000 });
      await page.waitForTimeout(1_500);
      await assertLoggedIn(page);

      // End chỉ gắn được sau khi có Start, và phải TẮT Native Audio TRƯỚC khi set frame
      if (req.imagePath) {
        if (req.endImagePath) await ensureNativeAudioOff(page);
        await setStartFrame(page, req.imagePath);
        if (req.endImagePath) await setEndFrame(page, req.endImagePath);
      }

      // Mode/Length/Aspect cho khớp lựa chọn trên block (mặc định trang nếu trượt)
      await applyConfig(page, {
        quality: req.quality,
        durationSeconds: req.durationSeconds,
        aspectRatio: req.aspectRatio,
      });

      await composer.click();
      // insertText (KHÔNG keyboard.type): prompt nhiều dòng tránh '\n' bị hiểu là Enter; chèn 1 event
      await page.keyboard.insertText(req.prompt);
      await page.waitForTimeout(1_200);

      const genBtn = page.locator('button', { hasText: /generate/i }).last();
      await genBtn.waitFor({ timeout: 15_000 });

      // An toàn khi đang phát triển: KHÔNG bấm Generate (tránh tốn credit). Bỏ env để chạy thật.
      if (process.env.KLING_WEB_DRYRUN === '1') {
        return;
      }

      const beforeSrc = await firstVideoSrc(page); // video mới nhất TRƯỚC khi gen (để không tải nhầm history)
      await genBtn.click({ timeout: 15_000 });
      await downloadResult(page, req.outFile, beforeSrc);
    } finally {
      await page.close().catch(() => {});
    }
  }

  return {
    generateVideo: async (req) => {
      await acquire();
      try {
        await generate(req);
      } finally {
        release();
      }
    },
  };
}
