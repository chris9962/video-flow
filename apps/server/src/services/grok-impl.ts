import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, type BrowserContext, type Page } from 'playwright';
import { CHROME_CDP_URL } from '../paths';
import type { GrokService } from './types';

// Grok Imagine (grok.com/imagine) — tạo ẢNH và VIDEO bằng credit gói SuperGrok của user qua browser
// (như Gemini/Flow), KHÔNG dùng API trả tiền. connectOverCDP vào Chrome user tự mở + đăng nhập grok.com.
// LƯU Ý: grok.com đứng sau Cloudflare → phải đăng nhập tay 1 lần trong cửa sổ CDP (cookie cf_clearance +
// auth lưu trong profile) thì tự động hoá mới qua được. Selector input ĐÃ soi DOM thật (logged-in).

const IMAGINE_URL = 'https://grok.com/imagine';
const COMPOSER = 'div.tiptap.ProseMirror[contenteditable="true"]';
const SEND = 'button[type="submit"][aria-label="Gửi"], button[type="submit"][aria-label="Send"]';
const GEN_TIMEOUT_MS = 10 * 60_000;

const CDP_HINT =
  'Chưa kết nối được Chrome. Mở Chrome cho VideoFlow (npm run chrome), rồi đăng nhập grok.com trong cửa sổ đó (Settings → "Mở tab grok.com") — nhớ tự vượt Cloudflare 1 lần.';

export function createGrokService(): GrokService {
  let contextPromise: Promise<BrowserContext> | null = null;
  // Pool: số tab Imagine chạy SONG SONG (mặc định 2 — Grok cũng giới hạn theo gói). Dư thì chờ slot.
  const POOL = Math.max(1, Number(process.env.GROK_POOL_SIZE) || 2);
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

  async function assertReady(page: Page): Promise<void> {
    const bad = await page
      .evaluate(() => {
        const t = document.body.innerText;
        if (/xác minh bảo mật|verify you are human|just a moment|Ray ID/i.test(t)) return 'cloudflare';
        if (/^(sign in|log in|đăng nhập)$/im.test(t) && !document.querySelector('.tiptap')) return 'logout';
        return '';
      })
      .catch(() => 'cloudflare');
    if (bad === 'cloudflare') {
      throw new Error(
        'grok.com đang chặn bằng Cloudflare — mở tab grok.com trong cửa sổ Chrome CDP, tự vượt xác minh + đăng nhập 1 lần, rồi chạy lại.',
      );
    }
    if (bad === 'logout') {
      throw new Error('Chưa đăng nhập grok.com — Settings → "Mở tab grok.com" để đăng nhập, rồi chạy lại.');
    }
  }

  /**
   * Grok bật paywall SuperGrok khi tài khoản không có gói/hết quota tạo ảnh-video: URL nhảy `#subscribe`
   * hoặc hiện modal "SuperGrok … /tháng". Bắt sớm để báo lỗi rõ thay vì 403 khó hiểu ở bước tải.
   */
  async function assertNotPaywalled(page: Page): Promise<void> {
    const wall = await page
      .evaluate(() => {
        if (/#subscribe/i.test(location.href)) return true;
        const t = document.body.innerText;
        return /SuperGrok/i.test(t) && /(\/tháng|\/month|Nhận ưu đãi|Giảm giá \d+%)/i.test(t);
      })
      .catch(() => false);
    if (wall) {
      throw new Error(
        'Grok Imagine cần gói SuperGrok — tài khoản đang gặp paywall khi tạo (không có dòng code nào vượt được). Đăng ký SuperGrok tại grok.com rồi chạy lại.',
      );
    }
  }

  /** Chọn chế độ tạo: pill `button[role="radio"]` chữ "Hình ảnh" (image) | "Video" (video) */
  async function selectMode(page: Page, mode: 'image' | 'video'): Promise<void> {
    const re = mode === 'image' ? /^Hình ảnh$|^Image$/ : /^Video$/;
    await page
      .locator('button[role="radio"]')
      .filter({ hasText: re })
      .first()
      .click({ timeout: 6_000 })
      .catch(() => {});
    await page.waitForTimeout(600);
  }

  /** Tỷ lệ khung hình — best-effort: mở `button[aria-label="Tỷ lệ khung hình"]` rồi chọn option khớp text */
  async function setAspect(page: Page, ratio: string): Promise<void> {
    const btn = page.locator('button[aria-label="Tỷ lệ khung hình"], button[aria-label="Aspect ratio"]').first();
    if ((await btn.count().catch(() => 0)) === 0) return;
    await btn.click({ timeout: 4_000 }).catch(() => {});
    await page.waitForTimeout(500);
    const esc = ratio.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await page
      .locator('[role="menuitem"], [role="option"], button, li')
      .filter({ hasText: new RegExp(`^${esc}$`) })
      .first()
      .click({ timeout: 3_000 })
      .catch(() => {});
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(400);
  }

  /** Đính ảnh tham chiếu / frame đầu: input file (accept ảnh) có sẵn trong DOM → setInputFiles */
  async function attachImage(page: Page, imagePath: string): Promise<void> {
    await page
      .locator('input[type=file][accept*="image" i]')
      .first()
      .setInputFiles(imagePath)
      .catch(async () => {
        await page.locator('input[type=file]').first().setInputFiles(imagePath);
      });
    await page.waitForTimeout(3_000); // chờ upload backend
  }

  async function typeAndMaybeSend(page: Page, prompt: string): Promise<boolean> {
    const composer = page.locator(COMPOSER).first();
    await composer.waitFor({ state: 'visible', timeout: 30_000 });
    await composer.click();
    // insertText (KHÔNG keyboard.type): prompt nhiều dòng không bị '\n' hiểu là Enter/submit sớm
    await page.keyboard.insertText(prompt);
    await page.waitForTimeout(1_000);
    const send = page.locator(SEND).first();
    await send.waitFor({ timeout: 15_000 });
    // An toàn khi phát triển: KHÔNG bấm Gửi (tránh tốn credit). Bỏ env GROK_DRYRUN để chạy thật.
    if (process.env.GROK_DRYRUN === '1') return false;
    await send.click({ timeout: 10_000 });
    // Tài khoản free / hết quota → Grok bật paywall ngay sau khi Gửi (không ra kết quả)
    await page.waitForTimeout(1_500);
    await assertNotPaywalled(page);
    return true;
  }

  /**
   * Chờ media MỚI xuất hiện trong khu kết quả rồi tải. Grok phục vụ media qua URL https (assets.grok.com…)
   * nên `page.request.get(src)` lấy được thẳng. `beforeSrc` = media mới nhất TRƯỚC khi gen (tránh tải nhầm cũ).
   * CHƯA verify trên gen thật — cơ chế download này cần xác nhận lần chạy thật đầu tiên (giống Kling web).
   */
  async function downloadResult(
    page: Page,
    kind: 'img' | 'video',
    outFile: string,
    beforeSrc: string,
  ): Promise<void> {
    await fs.mkdir(path.dirname(outFile), { recursive: true });
    const deadline = Date.now() + GEN_TIMEOUT_MS;
    let src = '';
    while (Date.now() < deadline) {
      await assertNotPaywalled(page); // free/hết quota → dừng sớm với lỗi rõ thay vì tải nhầm
      src = await page
        .evaluate((k) => {
          const els = [...document.querySelectorAll(k === 'video' ? 'video' : 'main img, [class*=result] img, img')];
          for (const el of els) {
            const s = k === 'video'
              ? (el as HTMLVideoElement).currentSrc || (el as HTMLVideoElement).src
              : (el as HTMLImageElement).currentSrc || (el as HTMLImageElement).src;
            // CHỈ nhận media của user (assets.grok.com); loại feed công khai (imagine-public) + avatar
            if (s && /assets\.grok\.com/.test(s) && !/profile-picture/.test(s)) return s;
          }
          return '';
        }, kind)
        .catch(() => '');
      if (src && src !== beforeSrc) break;
      await page.waitForTimeout(3_000);
    }
    if (!src || src === beforeSrc) {
      throw new Error(`Grok chưa tạo xong ${kind === 'video' ? 'video' : 'ảnh'} sau ${Math.round(GEN_TIMEOUT_MS / 60_000)} phút — kiểm tra tab Chrome`);
    }
    const resp = await page.request.get(src, { timeout: 60_000 });
    if (!resp.ok()) throw new Error(`Tải media Grok lỗi HTTP ${resp.status()}`);
    await fs.writeFile(outFile, await resp.body());
  }

  async function currentSrc(page: Page, kind: 'img' | 'video'): Promise<string> {
    return page
      .evaluate((k) => {
        const el = document.querySelector(k === 'video' ? 'video' : 'main img, img');
        if (!el) return '';
        return k === 'video'
          ? (el as HTMLVideoElement).currentSrc || (el as HTMLVideoElement).src || ''
          : (el as HTMLImageElement).currentSrc || (el as HTMLImageElement).src || '';
      }, kind)
      .catch(() => '');
  }

  async function run(
    mode: 'image' | 'video',
    req: { prompt: string; imagePath?: string; aspectRatio?: string; outFile: string },
  ): Promise<void> {
    const ctx = await ensureContext();
    const page = await ctx.newPage();
    try {
      await page.goto(IMAGINE_URL, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await page.locator(COMPOSER).first().waitFor({ timeout: 30_000 });
      await page.waitForTimeout(1_000);
      await assertReady(page);
      await selectMode(page, mode);
      if (req.imagePath) await attachImage(page, req.imagePath);
      if (req.aspectRatio) await setAspect(page, req.aspectRatio);
      const kind = mode === 'video' ? 'video' : 'img';
      const beforeSrc = await currentSrc(page, kind);
      const sent = await typeAndMaybeSend(page, req.prompt);
      if (!sent) return; // GROK_DRYRUN
      await downloadResult(page, kind, req.outFile, beforeSrc);
    } finally {
      await page.close().catch(() => {});
    }
  }

  return {
    generateImage: async (req) => {
      await acquire();
      try {
        await run('image', { prompt: req.prompt, imagePath: req.referenceImagePaths?.[0], aspectRatio: req.aspectRatio, outFile: req.outFile });
      } finally {
        release();
      }
    },
    generateVideo: async (req) => {
      await acquire();
      try {
        await run('video', { prompt: req.prompt, imagePath: req.imagePath, aspectRatio: req.aspectRatio, outFile: req.outFile });
      } finally {
        release();
      }
    },
  };
}
