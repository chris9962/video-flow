import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, type BrowserContext, type Locator, type Page } from 'playwright';
import { CHROME_CDP_URL } from '../paths';
import type { BrowserPilot, LlmProvider } from './types';

const CDP_HINT =
  'Chưa kết nối được Chrome. Mở Chrome cho VideoFlow bằng lệnh: npm run chrome (rồi đăng nhập ChatGPT/Claude trong cửa sổ đó 1 lần).';

const REPLY_TIMEOUT_MS = 5 * 60_000;
const IMAGE_TIMEOUT_MS = 10 * 60_000;
const POLL_MS = 1_000;

interface ProviderConfig {
  label: string;
  /** URL mở conversation MỚI mỗi lần gửi — tránh leak context giữa các node */
  newChatUrl: string;
  /** Thứ tự ưu tiên: data-testid/id → aria/role → cấu trúc form. KHÔNG dùng class băm */
  composer: string[];
  send: string[];
  stop: string[];
  assistant: string[];
}

const PROVIDERS: Record<LlmProvider, ProviderConfig> = {
  chatgpt: {
    label: 'ChatGPT',
    newChatUrl: 'https://chatgpt.com/',
    // KHÔNG dùng 'form textarea': ChatGPT để sẵn 1 textarea ẩn (fallback trước khi editor hydrate)
    composer: ['#prompt-textarea', 'form div[contenteditable="true"]'],
    send: [
      '[data-testid="send-button"]',
      'button[data-testid="composer-send-button"]',
      'button[aria-label*="send" i]',
      'button[aria-label*="gửi" i]',
      'form button[type="submit"]',
    ],
    stop: [
      '[data-testid="stop-button"]',
      'button[aria-label*="stop" i]',
      'button[aria-label*="dừng" i]',
    ],
    assistant: ['[data-message-author-role="assistant"]'],
  },
  claude: {
    label: 'Claude',
    newChatUrl: 'https://claude.ai/new',
    composer: [
      'div[contenteditable="true"][aria-label]',
      'fieldset div[contenteditable="true"]',
      'form div[contenteditable="true"]',
      'div[contenteditable="true"]',
    ],
    send: [
      'button[aria-label*="send" i]',
      'button[aria-label*="gửi" i]',
      '[data-testid="send-button"]',
      'fieldset button[type="submit"]',
      'form button[type="submit"]',
    ],
    stop: [
      'button[aria-label*="stop" i]',
      'button[aria-label*="dừng" i]',
      '[data-testid="stop-button"]',
      'div[data-is-streaming="true"]',
    ],
    assistant: [
      'div[data-is-streaming]',
      '[data-testid="assistant-message"]',
      'div[data-test-render-count] [data-is-streaming]',
    ],
  },
  // Selector ban đầu (sẽ tinh chỉnh sau khi soi DOM thật của gemini.google.com)
  gemini: {
    label: 'Gemini',
    newChatUrl: 'https://gemini.google.com/app',
    composer: [
      'div.ql-editor[contenteditable="true"]',
      'rich-textarea div[contenteditable="true"]',
      'div[contenteditable="true"][role="textbox"]',
    ],
    send: ['button[aria-label="Send message"]', 'button[aria-label*="Send" i]', 'button[aria-label*="Gửi" i]'],
    stop: ['button[aria-label*="Stop" i]', 'button[aria-label*="Dừng" i]'],
    assistant: ['model-response', 'message-content', '.model-response-text'],
  },
};

async function isVisibleAny(page: Page, selectors: string[]): Promise<boolean> {
  for (const selector of selectors) {
    const visible = await page
      .locator(selector)
      .last()
      .isVisible()
      .catch(() => false);
    if (visible) return true;
  }
  return false;
}

async function waitForAnyVisible(
  page: Page,
  selectors: string[],
  timeoutMs: number,
): Promise<Locator | null> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    for (const selector of selectors) {
      // :visible neo vào element đang hiện — tránh khi gọi lại re-resolve sang bản ẩn cùng selector
      const loc = page.locator(`${selector}:visible`).last();
      if (await loc.isVisible().catch(() => false)) return loc;
    }
    await page.waitForTimeout(500);
  }
  return null;
}

/** Đếm theo selector đầu tiên có match — các selector sau chỉ là fallback cho cùng một thứ */
async function countAssistant(page: Page, cfg: ProviderConfig): Promise<number> {
  for (const selector of cfg.assistant) {
    const count = await page
      .locator(selector)
      .count()
      .catch(() => 0);
    if (count > 0) return count;
  }
  return 0;
}

async function lastAssistant(page: Page, cfg: ProviderConfig): Promise<Locator | null> {
  for (const selector of cfg.assistant) {
    const loc = page.locator(selector);
    if ((await loc.count().catch(() => 0)) > 0) return loc.last();
  }
  return null;
}

async function lastAssistantText(page: Page, cfg: ProviderConfig): Promise<string> {
  const loc = await lastAssistant(page, cfg);
  if (!loc) return '';
  return (await loc.innerText().catch(() => '')).trim();
}

export function createBrowserPilot(): BrowserPilot {
  let contextPromise: Promise<BrowserContext> | null = null;
  const pages = new Map<LlmProvider, Page>();
  // Pool N tab/provider: tối đa N task chạy SONG SONG cho mỗi provider (mở nhiều tab cùng lúc),
  // dư thì xếp hàng chờ slot. (Đổi từ FIFO-1-tab cũ → C, N cùng provider chạy đồng thời được.)
  const POOL = Math.max(1, Number(process.env.BROWSER_POOL_SIZE) || 3);
  const active = new Map<LlmProvider, number>();
  const waiters = new Map<LlmProvider, Array<() => void>>();

  function ensureContext(): Promise<BrowserContext> {
    if (!contextPromise) {
      contextPromise = (async () => {
        try {
          // Chỉ KẾT NỐI vào Chrome bạn tự mở (không launch) → Chrome không bật cờ automation,
          // navigator.webdriver không bị set → Google không chặn đăng nhập OAuth
          const browser = await chromium.connectOverCDP(CHROME_CDP_URL, { timeout: 5_000 });
          const ctx = browser.contexts()[0] ?? (await browser.newContext());
          // User đóng Chrome → reset để lần gọi sau kết nối lại
          browser.on('disconnected', () => {
            contextPromise = null;
            pages.clear();
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

  /** Tái dùng tab đang mở của provider nếu có, tránh đẻ tab mới mỗi lần */
  async function ensurePage(provider: LlmProvider): Promise<Page> {
    const ctx = await ensureContext();
    const existing = pages.get(provider);
    if (existing && !existing.isClosed()) return existing;

    const host = new URL(PROVIDERS[provider].newChatUrl).host;
    const reused = ctx.pages().find((p) => {
      try {
        return new URL(p.url()).host === host;
      } catch {
        return false;
      }
    });
    const page = reused ?? (await ctx.newPage());
    pages.set(provider, page);
    return page;
  }

  /** Cấp slot trong pool của provider; chờ nếu đã đủ POOL task đang chạy */
  function acquire(provider: LlmProvider): Promise<void> {
    const n = active.get(provider) ?? 0;
    if (n < POOL) {
      active.set(provider, n + 1);
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      const q = waiters.get(provider) ?? [];
      q.push(resolve);
      waiters.set(provider, q);
    });
  }
  function release(provider: LlmProvider): void {
    const q = waiters.get(provider);
    if (q && q.length > 0) q.shift()!(); // chuyển slot cho task đang chờ (active không đổi)
    else active.set(provider, Math.max(0, (active.get(provider) ?? 1) - 1));
  }
  /** Chạy task trong pool per-provider — tối đa POOL task đồng thời cho mỗi provider */
  async function enqueue<T>(provider: LlmProvider, task: () => Promise<T>): Promise<T> {
    await acquire(provider);
    try {
      return await task();
    } finally {
      release(provider);
    }
  }

  // MỞ TAB MỚI mỗi lần (không tái dùng) → nhiều sendPrompt cùng provider chạy song song không chen tab
  async function openNewChat(provider: LlmProvider): Promise<{ page: Page; cfg: ProviderConfig; composer: Locator }> {
    const ctx = await ensureContext();
    const cfg = PROVIDERS[provider];
    const page = await ctx.newPage();
    await page.goto(cfg.newChatUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    const composer = await waitForAnyVisible(page, cfg.composer, 30_000);
    if (!composer) {
      await page.close().catch(() => {});
      throw new Error(
        `Không tìm thấy ô nhập chat trên ${cfg.label} — có thể chưa đăng nhập. Trong cửa sổ Chrome (mở bằng "npm run chrome"), đăng nhập ${cfg.label} rồi chạy lại`,
      );
    }
    return { page, cfg, composer };
  }

  /**
   * Gemini không có input[type=file] sẵn: bấm "Upload & tools" → "Upload files" mở hộp thoại
   * file của OS (Playwright bắt bằng filechooser). Ảnh lên hiển thị dạng blob: thumbnail.
   */
  async function attachImagesGemini(page: Page, imagePaths: string[]): Promise<void> {
    if (imagePaths.length === 0) return;
    await page.locator('button[aria-label="Upload & tools"]').first().click({ timeout: 10_000 });
    await page.waitForTimeout(500);
    const [chooser] = await Promise.all([
      page.waitForEvent('filechooser', { timeout: 10_000 }),
      page.getByText('Upload files', { exact: false }).first().click({ timeout: 5_000 }),
    ]);
    await chooser.setFiles(imagePaths);
    // QUAN TRỌNG: thumbnail blob hiện ra KHÁC với upload-lên-server-xong. Gửi sớm khi spinner
    // còn quay → Gemini lỗi "Something went wrong (1076)". Chờ đủ thumbnail VÀ hết spinner.
    await page.waitForTimeout(1_000); // để spinner kịp xuất hiện
    const deadline = Date.now() + 120_000;
    let stable = 0;
    while (Date.now() < deadline) {
      const st = await page
        .evaluate((n) => {
          const blobs = Array.from(document.querySelectorAll('img')).filter((im) => im.src.startsWith('blob:')).length;
          const uploading = document.querySelectorAll(
            'uploader-file-preview [role="progressbar"], gem-media-attachment [role="progressbar"], uploader-file-preview .mat-mdc-progress-spinner',
          ).length;
          return { ready: blobs >= n, uploading };
        }, imagePaths.length)
        .catch(() => ({ ready: false, uploading: 1 }));
      if (st.ready && st.uploading === 0) {
        if (++stable >= 2) {
          await page.waitForTimeout(600);
          return;
        }
      } else {
        stable = 0;
      }
      await page.waitForTimeout(700);
    }
  }

  async function attachImages(page: Page, cfg: ProviderConfig, imagePaths: string[]): Promise<void> {
    if (imagePaths.length === 0) return;
    // Composer của ChatGPT/Claude đều có input file ẩn — không cần mở menu attach
    const deadline = Date.now() + 15_000;
    let fileInput: Locator | null = null;
    while (Date.now() < deadline) {
      const loc = page.locator('input[type="file"]').first();
      if ((await loc.count().catch(() => 0)) > 0) {
        fileInput = loc;
        break;
      }
      await page.waitForTimeout(500);
    }
    if (!fileInput) {
      throw new Error(`Không tìm thấy chỗ đính kèm ảnh trên ${cfg.label} — UI có thể đã đổi, thử lại sau`);
    }
    await fileInput.setInputFiles(imagePaths);
    // Chờ upload xong: nút gửi enable lại (tối đa 90s), nếu không thấy nút thì chờ cố định
    const uploadDeadline = Date.now() + 90_000;
    while (Date.now() < uploadDeadline) {
      await page.waitForTimeout(POLL_MS);
      const send = await waitForAnyVisible(page, cfg.send, 1_000);
      if (send && (await send.isEnabled().catch(() => false))) return;
    }
  }

  /**
   * Gõ prompt rồi GỬI BẰNG ENTER (composer đã focus) thay vì tìm-click nút gửi.
   * - fill() trước vì nó tự chờ element actionable: ngay sau khi đính ảnh, composer bị
   *   "not visible" chốc lát (thumbnail đang render) khiến click() fail ngay, còn fill() chờ được.
   * - Enter ổn định hơn việc tìm-click nút gửi (nút hay bị Playwright coi là không visible).
   */
  async function typeAndSubmit(page: Page, composer: Locator, prompt: string): Promise<void> {
    await composer.waitFor({ state: 'visible', timeout: 15_000 });
    try {
      await composer.fill(prompt, { timeout: 10_000 });
    } catch {
      await composer.click({ timeout: 8_000 });
      await page.keyboard.insertText(prompt);
    }
    // fill/insertText để lại focus trên composer → Enter gửi đúng chỗ
    await page.keyboard.press('Enter');
  }

  async function waitForReply(
    page: Page,
    cfg: ProviderConfig,
    baselineCount: number,
    timeoutMs: number,
  ): Promise<string> {
    const deadline = Date.now() + timeoutMs;
    let sawStreaming = false;
    let lastText = '';
    let stablePolls = 0;
    while (Date.now() < deadline) {
      await page.waitForTimeout(POLL_MS);
      if (await isVisibleAny(page, cfg.stop)) {
        sawStreaming = true;
        stablePolls = 0;
        continue;
      }
      if ((await countAssistant(page, cfg)) <= baselineCount) continue;
      const text = await lastAssistantText(page, cfg);
      if (text && text === lastText) {
        stablePolls += 1;
        // Đã thấy nút Stop xuất hiện rồi biến mất thì tin ngay; chưa từng thấy thì chờ text đứng yên lâu hơn
        if (stablePolls >= (sawStreaming ? 1 : 3)) return text;
      } else {
        stablePolls = 0;
        lastText = text;
      }
    }
    throw new Error(
      `${cfg.label} chưa trả lời xong sau ${Math.round(timeoutMs / 60_000)} phút — kiểm tra tab Chrome (có thể bị captcha hoặc hết lượt), rồi chạy lại`,
    );
  }

  async function sendAndWait(
    provider: LlmProvider,
    prompt: string,
    imagePaths: string[],
    timeoutMs: number,
  ): Promise<string> {
    const { page, cfg, composer } = await openNewChat(provider);
    try {
      const baseline = await countAssistant(page, cfg);
      await attachImages(page, cfg, imagePaths);
      await typeAndSubmit(page, composer, prompt);
      return await waitForReply(page, cfg, baseline, timeoutMs);
    } finally {
      await page.close().catch(() => {}); // luôn đóng tab (login giữ trong profile)
    }
  }

  /**
   * Ảnh ChatGPT tạo ra nằm ở conversation-turn CUỐI (turn của assistant) — KHÔNG có
   * data-message-author-role="assistant" như reply text, nên dò theo turn + src content.
   * Trả ảnh content lớn nhất theo ĐỘ PHÂN GIẢI THẬT (naturalWidth) — quan trọng để phân biệt
   * bản preview MỜ độ phân giải thấp (ChatGPT hiện trước) với ảnh final nét.
   */
  /**
   * Tín hiệu ẢNH ĐÃ GEN XONG: các nút hành động trên ảnh chỉ xuất hiện khi hoàn tất
   * (nút thích/share/chỉnh sửa ảnh). Nút Stop tắt rất sớm TRƯỚC khi ảnh xong nên KHÔNG dùng được.
   */
  async function imageReady(page: Page): Promise<boolean> {
    return page.evaluate(() => {
      const turns = document.querySelectorAll('[data-testid^="conversation-turn"]');
      const last = turns[turns.length - 1];
      if (!last) return false;
      return !!(
        last.querySelector('[data-testid="good-image-turn-action-button"]') ||
        last.querySelector('button[aria-label*="Chia sẻ hình ảnh" i]') ||
        last.querySelector('button[aria-label*="hare this image" i]') ||
        last.querySelector('button[aria-label*="Chỉnh sửa ảnh" i]') ||
        last.querySelector('button[aria-label*="dit image" i]')
      );
    });
  }

  async function generateImageChatGPT(prompt: string, refs: string[], outFile: string): Promise<void> {
    // Mỗi lần MỞ TAB MỚI (không dùng lại tab cũ), và LUÔN đóng khi xong (finally)
    const ctx = await ensureContext();
    const cfg = PROVIDERS.chatgpt;
    const page = await ctx.newPage();
    try {
      await page.goto(cfg.newChatUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      const composer = await waitForAnyVisible(page, cfg.composer, 30_000);
      if (!composer) {
        throw new Error(
          'Không tìm thấy ô nhập ChatGPT — có thể chưa đăng nhập. Mở Chrome (npm run chrome), đăng nhập chatgpt.com rồi thử lại',
        );
      }
      await attachImages(page, cfg, refs);
      await typeAndSubmit(page, composer, `Tạo một ảnh: ${prompt}`);

    // Xong khi NÚT HÀNH ĐỘNG TRÊN ẢNH xuất hiện (thích/share/sửa ảnh) — tín hiệu đáng tin nhất.
    const deadline = Date.now() + IMAGE_TIMEOUT_MS;
    let ready = false;
    while (Date.now() < deadline) {
      await page.waitForTimeout(2_500);
      if (await imageReady(page)) {
        ready = true;
        break;
      }
    }
    if (!ready) {
      throw new Error(
        'Hết thời gian chờ — ChatGPT chưa tạo xong ảnh. Kiểm tra còn lượt tạo ảnh không, hoặc thử prompt khác',
      );
    }
    // Tải qua UI (page.request.get bị chặn): click ảnh → mở dialog → nút "Lưu" → bắt download
    await page.waitForTimeout(1_500);
    await fs.mkdir(path.dirname(outFile), { recursive: true });
    let saved = false;
    for (let attempt = 0; attempt < 3 && !saved; attempt++) {
      await page
        .locator('[data-testid^="conversation-turn"] img')
        .last()
        .click({ timeout: 8_000 })
        .catch(() => {});
      await page.waitForTimeout(1_200);
      try {
        const [download] = await Promise.all([
          page.waitForEvent('download', { timeout: 30_000 }),
          page
            .locator('[role="dialog"] button[aria-label="Lưu"], [role="dialog"] button[aria-label*="Save" i]')
            .last()
            .click({ timeout: 10_000 }),
        ]);
        await download.saveAs(outFile);
        saved = true;
      } catch {
        await page.keyboard.press('Escape').catch(() => {});
        await page.waitForTimeout(2_000);
      }
    }
    await page.keyboard.press('Escape').catch(() => {}); // đóng dialog
    if (!saved) throw new Error('Không tải được ảnh từ ChatGPT sau vài lần thử — thử lại sau ít giây');
    } finally {
      await page.close().catch(() => {}); // luôn đóng tab vừa mở
    }
  }

  async function generateImageGemini(prompt: string, refs: string[], outFile: string): Promise<void> {
    // Mỗi lần MỞ TAB MỚI (không dùng lại tab cũ), và LUÔN đóng khi xong (finally)
    const ctx = await ensureContext();
    const cfg = PROVIDERS.gemini;
    const page = await ctx.newPage();
    try {
      await page.goto(cfg.newChatUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      const composer = await waitForAnyVisible(page, cfg.composer, 30_000);
      if (!composer) {
        throw new Error(
          'Không tìm thấy ô nhập Gemini — có thể chưa đăng nhập. Mở Chrome (npm run chrome), đăng nhập gemini.google.com rồi thử lại',
        );
      }
      await attachImagesGemini(page, refs);

      // Gemini: Enter = xuống dòng (chế độ mobile) → PHẢI click nút gửi.
      await composer.click({ timeout: 8_000 });
    await page.keyboard.insertText(prompt);
    await page.waitForTimeout(1_000); // để Angular nhận prompt, tránh gửi quá sớm

    // Chỉ gửi khi: nút đã enable (has-input) VÀ không còn spinner upload (tránh lỗi 1076)
    for (let i = 0; i < 30; i++) {
      const st = await page
        .evaluate(() => ({
          hasInput: (document.querySelector('.send-button')?.getAttribute('class') ?? '').includes('has-input'),
          uploading:
            document.querySelectorAll(
              'uploader-file-preview [role="progressbar"], gem-media-attachment [role="progressbar"]',
            ).length > 0,
        }))
        .catch(() => ({ hasInput: false, uploading: true }));
      if (st.hasInput && !st.uploading) break;
      await page.waitForTimeout(400);
    }
    await page.waitForTimeout(500); // settle thêm trước khi gửi
    await page.locator('button[aria-label="Send message"]').last().click({ timeout: 10_000 });

    // Ảnh Gemini là blob (không fetch URL được). Xong khi: ảnh sinh ra xuất hiện VÀ không còn
    // generate (nút .send-button mất class 'stop' — lúc generate nó là nút pause).
    const deadline = Date.now() + IMAGE_TIMEOUT_MS;
    let ready = false;
    let refusalPolls = 0; // số nhịp liên tiếp: đã trả lời xong + có text + KHÔNG có ảnh → Gemini từ chối
    while (Date.now() < deadline) {
      await page.waitForTimeout(3_000);
      const st = await page
        .evaluate(() => ({
          hasImg: !!document.querySelector('single-image.generated-image, download-generated-image-button'),
          generating: (document.querySelector('.send-button')?.getAttribute('class') ?? '').includes('stop'),
          text:
            [...document.querySelectorAll('message-content, .model-response-text')]
              .map((e) => (e as HTMLElement).innerText)
              .filter(Boolean)
              .pop() ?? '',
        }))
        .catch(() => ({ hasImg: false, generating: true, text: '' }));
      if (st.hasImg && !st.generating) {
        ready = true;
        break;
      }
      // Gemini đôi khi TỪ CHỐI ghép ảnh người thật (chính sách) → trả về text, KHÔNG có ảnh. Bắt sớm
      // để báo lỗi RÕ thay vì chờ tới timeout 10 phút rồi báo mơ hồ. Cần 2 nhịp ổn định tránh false-positive.
      if (!st.generating && !st.hasImg && st.text.trim().length > 12) {
        if (++refusalPolls >= 2) {
          throw new Error(
            `Gemini KHÔNG tạo ảnh (có thể từ chối ghép ảnh người thật). Gemini trả lời: "${st.text.trim().slice(0, 180)}". Thử lại, đổi prompt, hoặc dùng provider khác.`,
          );
        }
      } else {
        refusalPolls = 0;
      }
    }
    if (!ready) {
      throw new Error('Hết thời gian chờ — Gemini chưa tạo xong ảnh. Kiểm tra tab Gemini hoặc thử prompt khác');
    }

    // Ảnh vừa xuất hiện nhưng backend chưa sẵn bản full-res → tải sớm sẽ "couldn't download image".
    // Chờ cho ảnh ổn định rồi mới tải.
    await page.waitForTimeout(2_000);
    await fs.mkdir(path.dirname(outFile), { recursive: true });

    // Tải: nút "Download full size image" nằm sẵn trong khu ảnh NHƯNG bị overlay ảnh chặn pointer khi
    // không hover → click trúng toạ độ mà handler không chạy (fail cả 3 lần). Phải HOVER vào ảnh trước
    // cho toolbar nổi lên rồi mới click. KHÔNG mở viewer (lẫn nút "More options" của ảnh khác). Verified.
    const imgArea = page.locator('single-image.generated-image').last();
    let saved = false;
    for (let attempt = 0; attempt < 3 && !saved; attempt++) {
      try {
        await imgArea.hover({ timeout: 8_000 });
        await page.waitForTimeout(400);
        // Dùng tên ELEMENT `download-generated-image-button` (KHÔNG phụ thuộc ngôn ngữ) — verified ra file.
        // aria-label="Download full size image" chỉ đúng khi Gemini hiển thị tiếng Anh; tài khoản tiếng Việt
        // thì label khác → click trượt → "download failed" dù ảnh đã tạo. Giữ aria-label EN làm fallback.
        const [download] = await Promise.all([
          page.waitForEvent('download', { timeout: 30_000 }),
          page
            .locator('download-generated-image-button button, button[aria-label="Download full size image"]')
            .last()
            .click({ timeout: 10_000 }),
        ]);
        await download.saveAs(outFile);
        saved = true;
      } catch {
        await page.keyboard.press('Escape').catch(() => {});
        await page.waitForTimeout(2_500);
      }
    }
    if (!saved) {
      throw new Error('Không tải được ảnh từ Gemini sau vài lần thử — thử lại sau ít giây');
    }
    } finally {
      // Luôn đóng tab vừa mở, kể cả khi lỗi (login vẫn còn trong profile CDP)
      await page.close().catch(() => {});
    }
  }

  return {
    sendPrompt(provider, { prompt, imagePaths }) {
      return enqueue(provider, () => sendAndWait(provider, prompt, imagePaths, REPLY_TIMEOUT_MS));
    },

    generateImage({ provider, prompt, referenceImagePaths, outFile }) {
      return enqueue(provider, async () =>
        provider === 'gemini'
          ? generateImageGemini(prompt, referenceImagePaths, outFile)
          : generateImageChatGPT(prompt, referenceImagePaths, outFile),
      );
    },

    async openLogin(provider) {
      const cfg = PROVIDERS[provider];
      // Mở tab provider trong chính Chrome bạn đã mở để đăng nhập tay; session lưu trong profile CDP
      const page = await ensurePage(provider);
      await page.bringToFront().catch(() => undefined);
      await page
        .goto(cfg.newChatUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 })
        .catch(() => undefined);
    },

    async openSite(url) {
      // Mở tab mới tới site bất kỳ để user đăng nhập tay (kling.ai/Flow…); KHÔNG đóng để user thao tác
      const ctx = await ensureContext();
      const page = await ctx.newPage();
      await page.bringToFront().catch(() => undefined);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 }).catch(() => undefined);
    },
  };
}
