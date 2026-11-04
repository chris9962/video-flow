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

// ChatGPT: selector và cách tải ảnh lấy từ skill flow-chain-video (scripts/gpt-image.mjs), đo lại ngày 2026-10-18 → 2026-10-21.
const GPT_IMAGE = '[data-testid="generated-image-preview"] img';
// Nút này chỉ hiện khi ảnh đã xong; bản xem trước mờ hiện trước đó không có nút.
const GPT_DONE_BUTTON = /^(Share generated image|Edit generated image|Chia sẻ ảnh đã tạo|Chỉnh sửa ảnh đã tạo) \d+$/i;
const GPT_LIMIT_TEXT = /hit the (free )?plan limit|reached (your|the) (image )?limit|đã đạt giới hạn|hết lượt tạo ảnh/i;

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
    // 2026-10-18: ô nhập là div contenteditable aria-label "Ask ChatGPT", không còn id #prompt-textarea.
    composer: ['#prompt-textarea', 'div[contenteditable="true"][aria-label]', 'form div[contenteditable="true"]'],
    send: [
      '[data-testid="send-button"]',
      'button[data-testid="composer-send-button"]',
      'button[aria-label="Send prompt"]',
      'button[aria-label*="send" i]',
      'button[aria-label*="gửi" i]',
      'form button[type="submit"]',
    ],
    stop: [
      '[data-testid="stop-button"]',
      'button[aria-label*="stop" i]',
      'button[aria-label*="dừng" i]',
    ],
    // Đo ngày 2026-11-02: reply không còn data-message-author-role; chữ trả lời nằm trong khối assistant-message.
    assistant: ['[data-markdown-text-style="assistant-message"]', '[data-message-author-role="assistant"]'],
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

// ctx.newPage() và page.bringToFront() làm macOS chuyển focus sang Chrome, Target.createTarget với background: true thì không.
// Đo ngày 2026-10-30: tab nền vẫn chạy timer và requestAnimationFrame đủ tốc độ.
async function newBackgroundPage(ctx: BrowserContext): Promise<Page> {
  // Pool chạy nhiều task cùng lúc. Tìm tab theo URL riêng thay vì chờ sự kiện 'page'.
  const mark = `about:blank#pilot-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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

async function gptDoneButtons(page: Page): Promise<number> {
  return page.getByRole('button', { name: GPT_DONE_BUTTON }).count().catch(() => 0);
}

/** Kích thước byte của từng ảnh ChatGPT trong cuộc chat, theo thứ tự trên trang. Ảnh lỗi tải trả 0. */
async function gptImageSizes(page: Page): Promise<number[]> {
  return page
    .locator(GPT_IMAGE)
    .evaluateAll((els) =>
      Promise.all(
        (els as HTMLImageElement[]).map(async (el) => {
          if (el.naturalWidth < 512) return 0;
          try {
            return (await (await fetch(el.currentSrc || el.src, { credentials: 'include' })).arrayBuffer()).byteLength;
          } catch {
            return 0;
          }
        }),
      ),
    )
    .catch(() => [] as number[]);
}

// Lần thử 2026-10-18: khi sửa ảnh, nút "ảnh xong" tăng trước khi ô ảnh mới có nội dung mới,
// và lấy ảnh cuối trang đã lưu nhầm ảnh cũ. Chỉ nhận ảnh có kích thước byte chưa từng có, giữ nguyên qua 2 lần kiểm tra.
async function waitNewGptImage(page: Page, beforeButtons: number, beforeSizes: number[]): Promise<number> {
  const deadline = Date.now() + IMAGE_TIMEOUT_MS;
  let candidate: { idx: number; size: number } | null = null;
  let lastReload = Date.now();
  while (Date.now() < deadline) {
    await page.waitForTimeout(2_000);
    // Lần chạy 2026-10-18: ảnh đã hiện nhưng chưa vào khối generated-image-preview và chưa có nút; tải lại trang thì đủ.
    if (Date.now() - lastReload > 90_000) {
      await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
      await page.waitForTimeout(5_000);
      lastReload = Date.now();
      candidate = null;
    }
    const limit = await page
      .evaluate((re) => (document.querySelector('main')?.innerText || '').match(new RegExp(re, 'i'))?.[0] ?? null, GPT_LIMIT_TEXT.source)
      .catch(() => null);
    if (limit) throw new Error(`ChatGPT không tạo ảnh: "${limit}"`);
    // Lần chạy 2026-10-21: ChatGPT trả 2 ảnh và hỏi "Which image do you like more?". Chưa chọn thì không có nút ảnh xong.
    const pick = page.getByRole('button', { name: /^Image 1 is better$/ });
    if (await pick.count().catch(() => 0)) {
      await pick.first().click().catch(() => {});
      continue;
    }
    if ((await gptDoneButtons(page)) > beforeButtons) {
      const sizes = await gptImageSizes(page);
      let idx = sizes.length - 1;
      while (idx >= 0 && !(sizes[idx] > 0 && !beforeSizes.includes(sizes[idx]))) idx--;
      const prev = candidate as { idx: number; size: number } | null;
      if (idx >= 0 && prev !== null && prev.idx === idx && prev.size === sizes[idx]) return idx;
      candidate = idx >= 0 ? { idx, size: sizes[idx] } : null;
    }
  }
  throw new Error('Hết 10 phút chờ — ChatGPT chưa tạo xong ảnh. Kiểm tra còn lượt tạo ảnh không, hoặc xem tab Chrome');
}

// page.request.get(URL ảnh) bị chặn. Ảnh có src blob: cùng origin, nên đọc trong trang rồi ghi file.
async function saveGptImage(page: Page, idx: number, outFile: string): Promise<void> {
  const b64 = await page
    .locator(GPT_IMAGE)
    .nth(idx)
    .evaluate(async (el) => {
      const img = el as HTMLImageElement;
      const r = await fetch(img.currentSrc || img.src, { credentials: 'include' });
      const buf = new Uint8Array(await r.arrayBuffer());
      let bin = '';
      for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
      return btoa(bin);
    });
  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await fs.writeFile(outFile, Buffer.from(b64, 'base64'));
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
    const page = await newBackgroundPage(ctx);
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
    // Đếm blob ảnh ĐÃ có trước khi đính (conversation nhiều lượt: ảnh message trước cũng là blob:) →
    // chỉ chờ tới khi có THÊM đủ n blob mới, tránh tưởng upload xong ngay vì đã có ảnh cũ.
    const baseBlobs = await page
      .evaluate(() => Array.from(document.querySelectorAll('img')).filter((im) => im.src.startsWith('blob:')).length)
      .catch(() => 0);
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
    const need = baseBlobs + imagePaths.length;
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
        }, need)
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

  async function attachImagesChatGPT(page: Page, imagePaths: string[]): Promise<void> {
    // Ô file đầu tiên là "Take a photo" (capture): gắn file vào đó thì ChatGPT không nhận ảnh.
    // Gắn file ngay khi trang vừa hiện ô nhập thì trang bỏ qua sự kiện → chờ rồi thử lại. 2026-10-20.
    const input = page.locator('input[type="file"]:not([capture]):not([accept])').first();
    const chip = (p: string) => page.locator(`button[aria-label="Remove ${path.basename(p)}"]`).first();
    let missing = imagePaths;
    for (let attempt = 1; missing.length > 0; attempt++) {
      if (attempt > 3) {
        throw new Error(
          `Ô nhập ChatGPT chưa có ảnh ${missing.map((p) => path.basename(p)).join(', ')} sau 3 lần gắn — xem tab Chrome`,
        );
      }
      await page.waitForTimeout(2_000);
      await input.setInputFiles(missing.map((p) => path.resolve(p)));
      await chip(missing[missing.length - 1]).waitFor({ timeout: 10_000 }).catch(() => {});
      const still: string[] = [];
      for (const p of missing) if (!(await chip(p).count())) still.push(p);
      missing = still;
    }
    await page.waitForTimeout(4_000);
  }

  async function attachImages(page: Page, cfg: ProviderConfig, imagePaths: string[]): Promise<void> {
    if (imagePaths.length === 0) return;
    if (cfg === PROVIDERS.chatgpt) return attachImagesChatGPT(page, imagePaths);
    // Composer của Claude có input file ẩn — không cần mở menu attach
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
  async function typeAndSubmit(page: Page, cfg: ProviderConfig, composer: Locator, prompt: string): Promise<void> {
    await composer.waitFor({ state: 'visible', timeout: 15_000 });
    try {
      await composer.fill(prompt, { timeout: 10_000 });
    } catch {
      await composer.click({ timeout: 8_000 });
      await page.keyboard.insertText(prompt);
    }
    // fill/insertText để lại focus trên composer → Enter gửi đúng chỗ
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1_500);
    // Lần chạy 2026-10-18: Enter không gửi khi trang chưa sẵn sàng → bấm nút gửi nếu prompt còn trong ô nhập.
    const pending = async () => ((await composer.innerText().catch(() => '')) || '').trim().length > 0;
    if (await pending()) {
      const send = await waitForAnyVisible(page, cfg.send, 5_000);
      await send?.click({ timeout: 10_000 }).catch(() => {});
      await page.waitForTimeout(1_500);
    }
    if (await pending()) throw new Error(`${cfg.label} chưa gửi prompt: prompt vẫn nằm trong ô nhập — xem tab Chrome`);
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
      await typeAndSubmit(page, cfg, composer, prompt);
      return await waitForReply(page, cfg, baseline, timeoutMs);
    } finally {
      await page.close().catch(() => {}); // luôn đóng tab (login giữ trong profile)
    }
  }

  async function generateImageChatGPT(prompt: string, refs: string[], outFile: string): Promise<void> {
    await generateImageChatGPTSteps([{ prompt, refs }], outFile);
  }

  /**
   * Gửi NHIỀU message LIÊN TIẾP trong CÙNG 1 tab ChatGPT (giữ ngữ cảnh hội thoại) — dùng cho block đặc thù
   * "B1: đưa ảnh tham chiếu cho GPT ghi nhớ góc máy/ánh sáng/bg; B2: đưa ảnh mẫu + tạo ảnh áp style đó".
   * Message CUỐI tạo ẢNH → chờ ảnh xong + tải; các message trước chờ ChatGPT trả lời (text) rồi mới gửi tiếp.
   * Mở 1 tab, gửi tuần tự, LUÔN đóng tab khi xong.
   */
  async function generateImageChatGPTSteps(
    steps: { prompt: string; refs: string[]; saveTo?: string }[],
    outFile: string,
  ): Promise<void> {
    if (steps.length === 0) throw new Error('generateImageChatGPTSteps: cần ít nhất 1 message');
    const ctx = await ensureContext();
    const cfg = PROVIDERS.chatgpt;
    const page = await newBackgroundPage(ctx);
    let keepTab = false;
    try {
      await page.goto(cfg.newChatUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      if (!(await waitForAnyVisible(page, cfg.composer, 30_000))) {
        throw new Error(
          'Không tìm thấy ô nhập ChatGPT — có thể chưa đăng nhập. Mở Chrome (npm run chrome), đăng nhập chatgpt.com rồi thử lại',
        );
      }
      for (let i = 0; i < steps.length; i++) {
        const isLast = i === steps.length - 1;
        const makesImage = isLast || !!steps[i].saveTo;
        const composer = await waitForAnyVisible(page, cfg.composer, 30_000); // re-locate mỗi turn (UI re-render)
        if (!composer) throw new Error('Mất ô nhập ChatGPT giữa chừng');
        const baseline = await countAssistant(page, cfg);
        const beforeButtons = makesImage ? await gptDoneButtons(page) : 0;
        const beforeSizes = makesImage ? await gptImageSizes(page) : [];
        await attachImages(page, cfg, steps[i].refs);
        await typeAndSubmit(page, cfg, composer, makesImage ? `Tạo một ảnh: ${steps[i].prompt}` : steps[i].prompt);
        if (makesImage) {
          const idx = await waitNewGptImage(page, beforeButtons, beforeSizes);
          await page.waitForTimeout(1_000);
          await saveGptImage(page, idx, isLast ? outFile : steps[i].saveTo!);
        } else {
          // Chờ GPT trả lời xong message này rồi mới gửi message kế (giữ đúng thứ tự hội thoại)
          await waitForReply(page, cfg, baseline, REPLY_TIMEOUT_MS);
          await page.waitForTimeout(1_200);
        }
      }
    } catch (err) {
      keepTab = true; // để tab mở cho user xem ChatGPT báo gì
      throw err;
    } finally {
      if (!keepTab) await page.close().catch(() => {});
    }
  }

  // Gửi 1 lượt vào Gemini (đính ảnh nếu có → gõ prompt → chờ enable + hết spinner upload → click Gửi).
  async function geminiSendTurn(page: Page, prompt: string, refs: string[]): Promise<void> {
    const cfg = PROVIDERS.gemini;
    const composer = await waitForAnyVisible(page, cfg.composer, 30_000); // re-locate mỗi lượt (UI re-render)
    if (!composer) throw new Error('Mất ô nhập Gemini giữa chừng');
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
  }

  function geminiResponseCount(page: Page): Promise<number> {
    return page.evaluate(() => document.querySelectorAll('.model-response-text').length).catch(() => 0);
  }

  // Chờ Gemini trả lời xong 1 lượt TEXT (message KHÔNG-cuối, vd B1 ghi nhớ): có lượt mới + ngừng generate.
  async function waitGeminiTextReply(page: Page, baseline: number, timeoutMs: number): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    await page.waitForTimeout(1_500);
    while (Date.now() < deadline) {
      const st = await page
        .evaluate(() => ({
          count: document.querySelectorAll('.model-response-text').length,
          generating: (document.querySelector('.send-button')?.getAttribute('class') ?? '').includes('stop'),
        }))
        .catch(() => ({ count: 0, generating: true }));
      if (st.count > baseline && !st.generating) return;
      await page.waitForTimeout(1_500);
    }
    throw new Error('Gemini chưa trả lời xong bước ghi nhớ — kiểm tra tab Gemini rồi thử lại');
  }

  // Chờ Gemini tạo xong ảnh (message CUỐI) rồi tải về outFile; bắt sớm khi Gemini từ chối (trả text, không ảnh).
  async function waitAndDownloadGeminiImage(page: Page, outFile: string, baseImages = 0): Promise<void> {
    // Ảnh Gemini là blob (không fetch URL được). Xong khi: ảnh sinh ra xuất hiện VÀ không còn
    // generate (nút .send-button mất class 'stop' — lúc generate nó là nút pause).
    const deadline = Date.now() + IMAGE_TIMEOUT_MS;
    let ready = false;
    let refusalPolls = 0; // số nhịp liên tiếp: đã trả lời xong + có text + KHÔNG có ảnh → Gemini từ chối
    while (Date.now() < deadline) {
      await page.waitForTimeout(3_000);
      const st = await page
        .evaluate((base) => ({
          // Đếm ảnh đã tạo: cuộc chat có ảnh của bước trước thì chỉ nhận khi có thêm ảnh mới.
          hasImg: document.querySelectorAll('single-image.generated-image').length > base,
          generating: (document.querySelector('.send-button')?.getAttribute('class') ?? '').includes('stop'),
          text:
            [...document.querySelectorAll('message-content, .model-response-text')]
              .map((e) => (e as HTMLElement).innerText)
              .filter(Boolean)
              .pop() ?? '',
        }), baseImages)
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
  }

  async function generateImageGemini(prompt: string, refs: string[], outFile: string): Promise<void> {
    await generateImageGeminiSteps([{ prompt, refs }], outFile);
  }

  /**
   * Gửi NHIỀU message LIÊN TIẾP trong CÙNG 1 tab Gemini (giữ ngữ cảnh) — bản Gemini của block "Ảnh GPT 2 bước".
   * Message CUỐI tạo ẢNH → chờ ảnh + tải; các message trước chờ Gemini trả lời text rồi mới gửi tiếp.
   * Mở 1 tab MỚI, gửi tuần tự, LUÔN đóng tab khi xong (login vẫn còn trong profile CDP).
   */
  async function generateImageGeminiSteps(
    steps: { prompt: string; refs: string[]; saveTo?: string }[],
    outFile: string,
  ): Promise<void> {
    if (steps.length === 0) throw new Error('generateImageGeminiSteps: cần ít nhất 1 message');
    const ctx = await ensureContext();
    const cfg = PROVIDERS.gemini;
    const page = await ctx.newPage();
    try {
      await page.goto(cfg.newChatUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      if (!(await waitForAnyVisible(page, cfg.composer, 30_000))) {
        throw new Error(
          'Không tìm thấy ô nhập Gemini — có thể chưa đăng nhập. Mở Chrome (npm run chrome), đăng nhập gemini.google.com rồi thử lại',
        );
      }
      for (let i = 0; i < steps.length; i++) {
        const isLast = i === steps.length - 1;
        const baseline = await geminiResponseCount(page);
        const baseImages = await page.locator('single-image.generated-image').count().catch(() => 0);
        await geminiSendTurn(page, steps[i].prompt, steps[i].refs);
        if (isLast || steps[i].saveTo) {
          await waitAndDownloadGeminiImage(page, isLast ? outFile : steps[i].saveTo!, baseImages);
        } else {
          await waitGeminiTextReply(page, baseline, REPLY_TIMEOUT_MS);
          await page.waitForTimeout(1_200);
        }
      }
    } finally {
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

    // Gửi NHIỀU message liên tiếp cùng 1 tab (block "Ảnh GPT 2 bước") — ChatGPT hoặc Gemini tuỳ provider
    generateImageSteps({ provider, steps, outFile }) {
      const target: LlmProvider = provider === 'gemini' ? 'gemini' : 'chatgpt';
      const mapped = steps.map((s) => ({ prompt: s.prompt, refs: s.referenceImagePaths, saveTo: s.saveTo }));
      return enqueue(target, () =>
        target === 'gemini'
          ? generateImageGeminiSteps(mapped, outFile)
          : generateImageChatGPTSteps(mapped, outFile),
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
