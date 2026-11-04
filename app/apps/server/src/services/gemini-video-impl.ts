import { chromium, type BrowserContext, type Page } from 'playwright';
import { CHROME_CDP_URL } from '../paths';
import type { VideoUnderstandingService } from './types';

// Gemini xem video NATIVE (gemini.google.com/app) → trả 1 prompt i2v mô tả chuyển động, tái dùng
// cho block kling/Flow. connectOverCDP vào Chrome user tự mở (npm run chrome) + đăng nhập Gemini.
// Selector đã soi DOM thật + verify probe ra prompt đúng nội dung clip. Mỗi lần mở tab mới + đóng.

const APP_URL = 'https://gemini.google.com/app';
const COMPOSER = 'div.ql-editor[contenteditable="true"]';
const UPLOAD_TIMEOUT_MS = 5 * 60_000;
const REPLY_TIMEOUT_MS = 12 * 60_000;

const CDP_HINT =
  'Chưa kết nối được Chrome. Mở Chrome cho VideoFlow (npm run chrome), rồi đăng nhập Gemini trong cửa sổ đó 1 lần.';

// Dấu mốc bao quanh prompt để bóc CHÍNH XÁC phần cần, bỏ mọi lời dẫn/markdown của Gemini.
const START_MARK = '###PROMPT_START###';
const END_MARK = '###PROMPT_END###';

// Gemini app có sẵn Veo: prompt chứa từ khoá sinh video ("tạo video"/"image-to-video prompt") cạnh 1
// video đã đính kèm sẽ bị ĐỊNH TUYẾN NHẦM sang công cụ tạo video (trả "Generating your video…") thay vì
// phân tích. Vì vậy diễn đạt thuần là TÁC VỤ PHÂN TÍCH → trả VĂN BẢN; tránh mọi động từ sinh/tạo.
const EXTRACT_PROMPT = [
  'NHIỆM VỤ: PHÂN TÍCH video đã đính kèm và CHỈ TRẢ LỜI BẰNG VĂN BẢN.',
  'TUYỆT ĐỐI KHÔNG tạo, sinh, dựng hay render video/ảnh; KHÔNG dùng công cụ tạo video. Chỉ viết chữ.',
  '',
  'Xem kỹ video từ đầu đến cuối, phân tích chuyển động của nhân vật và máy quay theo đúng trình tự thời',
  'gian: tư thế cơ thể, chuyển động tay, chân, đầu, hướng nhìn của mắt, biểu cảm môi/miệng, nhịp điệu, và',
  'góc/chuyển động máy quay. Tổng hợp thành MỘT đoạn văn mô tả bằng tiếng Anh, thì hiện tại, các cụm điện',
  'ảnh ngăn cách bằng dấu phẩy, CHỈ nói về CHUYỂN ĐỘNG và CAMERA — không ngoại hình, khuôn mặt, trang phục',
  'hay bối cảnh. Đây là đoạn mô tả dạng text để con người dùng lại sau, KHÔNG phải yêu cầu tạo video.',
  '',
  'QUY TẮC OUTPUT (bắt buộc tuân thủ tuyệt đối):',
  '- KHÔNG viết bất kỳ lời dẫn, mở đầu, tiêu đề, ghi chú, lời kết hay giải thích nào.',
  '- KHÔNG dùng markdown (không **, không #, không dấu ```), KHÔNG xuống dòng giữa đoạn, KHÔNG ngoặc kép.',
  '- In ra ĐÚNG theo khuôn sau, không thêm gì ngoài 2 dấu mốc và đoạn mô tả ở giữa:',
  START_MARK,
  '<đoạn mô tả tiếng Anh ở đây>',
  END_MARK,
].join('\n');

// Gemini lỡ định tuyến sang Veo → trả lời báo "đang tạo video" thay vì phân tích. Bắt để báo lỗi rõ.
const VIDEO_GEN_ACK = /generating your video|đang tạo video|tạo video.{0,40}(vài phút|minute)/i;

/**
 * Bóc đúng đoạn prompt từ phản hồi Gemini: lấy phần giữa 2 dấu mốc, rồi gỡ sạch code fence, markdown,
 * lời dẫn và ngoặc kép còn sót (phòng khi agent không tuân thủ 100%). Trả raw đã trim nếu bóc rỗng.
 */
function sanitizePrompt(raw: string): string {
  let t = raw.trim();
  const between = t.match(
    new RegExp(`${START_MARK}([\\s\\S]*?)${END_MARK}`, 'i'),
  );
  if (between) {
    t = between[1];
  } else {
    // Thiếu 1 đầu mốc → vẫn cắt theo mốc còn lại
    t = t
      .replace(new RegExp(`[\\s\\S]*?${START_MARK}`, 'i'), '')
      .replace(new RegExp(`${END_MARK}[\\s\\S]*$`, 'i'), '');
  }
  t = t.replace(/```[a-z]*\s*/gi, '').replace(/```/g, '');
  // Gỡ lời dẫn mở đầu thường gặp (VN/EN) nếu agent vẫn chèn
  const lead =
    /^\s*(sure[,!.]?|certainly[,!.]?|here(?:'s| is)[^\n:]*:?|below is[^\n:]*:?|đây là[^\n:]*:?|dưới đây[^\n:]*:?|english prompt|image-to-video prompt|prompt)\s*[:\-]?\s*/i;
  for (let i = 0; i < 3 && lead.test(t); i++) t = t.replace(lead, '');
  t = t
    .replace(/^\s*#{1,6}\s*/gm, '')
    .replace(/\*\*/g, '')
    .trim()
    .replace(/^["'“”]+|["'“”]+$/g, '')
    .trim();
  return t.length > 0 ? t : raw.trim();
}

export function createVideoUnderstandingService(): VideoUnderstandingService {
  let contextPromise: Promise<BrowserContext> | null = null;
  // Pool: tối đa POOL tab xem-video SONG SONG (xem video nặng → mặc định 2). Dư thì chờ slot.
  const POOL = Math.max(1, Number(process.env.GEMINI_VIDEO_POOL_SIZE) || 2);
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

  async function assertLoggedIn(page: Page): Promise<void> {
    const ok = await page
      .evaluate(
        () =>
          !!document.querySelector('img[src*=googleusercontent]') ||
          !/sign in|đăng nhập/i.test(document.body.innerText),
      )
      .catch(() => false);
    if (!ok) {
      throw new Error(
        'Chưa đăng nhập Gemini — mở tab gemini.google.com trong Chrome CDP, đăng nhập rồi chạy lại.',
      );
    }
  }

  async function uploadVideo(page: Page, videoPath: string): Promise<void> {
    await page.locator('button[aria-label="Upload & tools"]').first().click({ timeout: 15_000 });
    await page.waitForTimeout(500);
    const [chooser] = await Promise.all([
      page.waitForEvent('filechooser', { timeout: 15_000 }),
      page.getByText('Upload files', { exact: false }).first().click({ timeout: 8_000 }),
    ]);
    await chooser.setFiles(videoPath);
    // Video upload + xử lý backend LÂU. Gửi sớm khi spinner còn quay → Gemini lỗi "Something went wrong".
    // Chờ có chip đính kèm VÀ hết progressbar, ổn định 2 nhịp (tối đa UPLOAD_TIMEOUT_MS).
    await page.waitForTimeout(1_500);
    const deadline = Date.now() + UPLOAD_TIMEOUT_MS;
    let stable = 0;
    while (Date.now() < deadline) {
      const st = await page
        .evaluate(() => {
          const chips = document.querySelectorAll(
            'uploader-file-preview, [data-test-id="file-preview"]',
          ).length;
          // CHỈ đếm spinner TRONG ô preview — Gemini có vài [role=progressbar] "ma" luôn tồn tại
          // trên trang (không liên quan upload), đếm toàn trang sẽ không bao giờ về 0 → kẹt.
          const uploading = document.querySelectorAll(
            'uploader-file-preview [role="progressbar"], uploader-file-preview .mat-mdc-progress-spinner, uploader-file-preview mat-spinner',
          ).length;
          return { ready: chips > 0, uploading };
        })
        .catch(() => ({ ready: false, uploading: 1 }));
      if (st.ready && st.uploading === 0) {
        if (++stable >= 2) {
          await page.waitForTimeout(800);
          return;
        }
      } else {
        stable = 0;
      }
      await page.waitForTimeout(800);
    }
    throw new Error('Gemini xử lý video quá lâu (>5 phút) — kiểm tra tab Chrome rồi chạy lại.');
  }

  async function send(page: Page): Promise<void> {
    // Enter = xuống dòng trên Gemini → phải click nút Send; chờ .send-button có class has-input
    const deadline = Date.now() + 30_000;
    while (Date.now() < deadline) {
      const ok = await page
        .evaluate(() => (document.querySelector('.send-button')?.className || '').includes('has-input'))
        .catch(() => false);
      if (ok) break;
      await page.waitForTimeout(400);
    }
    await page.locator('button[aria-label="Send message"]').last().click({ timeout: 12_000 });
  }

  async function waitReply(page: Page): Promise<string> {
    const deadline = Date.now() + REPLY_TIMEOUT_MS;
    let last = '';
    let stable = 0;
    let sawGen = false;
    while (Date.now() < deadline) {
      await page.waitForTimeout(1_500);
      const st = await page
        .evaluate(() => {
          const gen = (document.querySelector('.send-button')?.className || '').includes('stop');
          const els = [...document.querySelectorAll('message-content, .model-response-text')];
          const text = els.map((e) => (e as HTMLElement).innerText).filter(Boolean).pop() || '';
          return { gen, text };
        })
        .catch(() => ({ gen: true, text: '' }));
      if (st.gen) {
        sawGen = true;
        stable = 0;
        continue;
      }
      if (!st.text) continue;
      if (st.text === last) {
        // Thấy nút Stop xuất hiện rồi mất → tin ngay; chưa thấy thì chờ text đứng yên lâu hơn
        if (++stable >= (sawGen ? 1 : 3)) return st.text;
      } else {
        stable = 0;
        last = st.text;
      }
    }
    throw new Error('Gemini chưa trả lời xong (xem video lâu) — kiểm tra tab Chrome rồi chạy lại.');
  }

  async function extract(videoPath: string): Promise<string> {
    const ctx = await ensureContext();
    const page = await ctx.newPage();
    try {
      await page.goto(APP_URL, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      const composer = page.locator(COMPOSER).first();
      await composer.waitFor({ state: 'visible', timeout: 30_000 });
      await assertLoggedIn(page);
      await uploadVideo(page, videoPath);
      await composer.click();
      await page.keyboard.insertText(EXTRACT_PROMPT);
      await page.waitForTimeout(1_200);
      await send(page);
      const reply = await waitReply(page);
      if (VIDEO_GEN_ACK.test(reply)) {
        throw new Error(
          'Gemini hiểu nhầm thành lệnh tạo video thay vì phân tích — chạy lại block; nếu lặp lại, mở tab Gemini và thử thủ công.',
        );
      }
      return sanitizePrompt(reply);
    } finally {
      await page.close().catch(() => {});
    }
  }

  return {
    async extractPrompt(videoPath) {
      await acquire();
      try {
        return await extract(videoPath);
      } finally {
        release();
      }
    },
  };
}
