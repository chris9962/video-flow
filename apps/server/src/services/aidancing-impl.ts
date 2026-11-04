import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { chromium, type APIRequestContext, type BrowserContext } from 'playwright';
import { CHROME_CDP_URL, DATA_DIR } from '../paths';
import type { AiDancingService } from './types';

// aidancing.net: gửi form và hỏi API job bằng cookie đăng nhập của Chrome CDP (context.request), không mở tab.
// Đo ngày 2026-11-03 trên trang /create/general?id=192 và /dashboard:
//  - Tạo job: POST /create/general, multipart: jobTypeId, aspectRatio, qualityMode (1 = Chất lượng, 2 = Nhanh),
//    voiceId, actualTime (giây tính tiền), title, image_1, video. Form không có CSRF token. Xong thì trang chuyển về /dashboard.
//  - Danh sách job: GET /api/proxy/jobs?page=0&size=20 → { items: [{ id, title, status, outputFileId, errorMessage, … }] }.
//    status: WAITING_UPLOAD | PENDING | PROCESSING | COMPLETED | FAILED (FAILED thì trang hoàn credit).
//  - Tải kết quả: GET /api/proxy/files/{outputFileId}. Trang tự xoá dữ liệu sau 3 ngày.
// Response tạo job không trả mã job → đặt title riêng cho mỗi job rồi tìm job theo title trong danh sách.

const BASE = 'https://aidancing.net';
const POLL_MS = 15_000;
const FIND_TIMEOUT_MS = 2 * 60_000;
const JOB_TIMEOUT_MS = 90 * 60_000;

// Job chạy ~22 phút; server restart (tsx watch) giữa chừng thì mất vòng hỏi trạng thái. Lưu job đang chạy theo
// mã băm input → chạy lại cùng input thì theo dõi tiếp job cũ, không gửi job mới (không trừ credit lần 2).
const PENDING_FILE = path.join(DATA_DIR, 'aidancing-pending.json');

async function readPending(): Promise<Record<string, number>> {
  try {
    return JSON.parse(await fs.readFile(PENDING_FILE, 'utf8'));
  } catch {
    return {};
  }
}

// Nhiều block AI Dancing chạy song song cùng đọc-sửa-ghi 1 file: nối các lần ghi để không ghi đè mã job của nhau.
let pendingWrites: Promise<void> = Promise.resolve();

function writePending(key: string, jobId: number | null): Promise<void> {
  const write = pendingWrites.then(async () => {
    const all = await readPending();
    if (jobId === null) delete all[key];
    else all[key] = jobId;
    await fs.mkdir(path.dirname(PENDING_FILE), { recursive: true });
    await fs.writeFile(PENDING_FILE, JSON.stringify(all, null, 1));
  });
  pendingWrites = write.catch(() => {});
  return write;
}

const CDP_HINT = 'Chưa kết nối được Chrome. Mở Chrome cho VideoFlow: npm run chrome, rồi đăng nhập aidancing.net trong cửa sổ đó 1 lần.';

interface Job {
  id: number;
  title?: string;
  status: string;
  outputFileId?: number | null;
  errorMessage?: string | null;
}

const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
};

const log = (s: string) => console.log(`[aidancing] ${s}`);

async function listJobs(api: APIRequestContext): Promise<Job[]> {
  const res = await api.get(`${BASE}/api/proxy/jobs?page=0&size=20`, { timeout: 30_000 });
  if (res.status() === 401 || res.status() === 403) {
    throw new Error('Chưa đăng nhập aidancing.net trong Chrome CDP — mở aidancing.net trong cửa sổ npm run chrome và đăng nhập');
  }
  if (!res.ok()) throw new Error(`aidancing.net trả HTTP ${res.status()} khi đọc danh sách job`);
  const data = (await res.json()) as { items?: Job[] };
  return Array.isArray(data.items) ? data.items : [];
}

async function filePart(file: string) {
  return {
    name: path.basename(file),
    mimeType: MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream',
    buffer: await fs.readFile(file),
  };
}

type Part = Awaited<ReturnType<typeof filePart>>;

async function submitJob(
  api: APIRequestContext,
  f: { jobTypeId: number; aspectRatio: string; quality: 'fast' | 'quality'; seconds: number; image: Part; video: Part },
): Promise<Job> {
  const title = `vf-${randomUUID().slice(0, 8)}`;
  const res = await api.post(`${BASE}/create/general`, {
    multipart: {
      jobTypeId: String(f.jobTypeId),
      aspectRatio: f.aspectRatio,
      qualityMode: f.quality === 'quality' ? '1' : '2',
      voiceId: '',
      actualTime: String(f.seconds),
      title,
      image_1: f.image,
      video: f.video,
    },
    maxRedirects: 0,
    timeout: 10 * 60_000,
  });
  const location = res.headers()['location'] ?? '';
  if (/login/i.test(location) || /login/i.test(res.url())) {
    throw new Error('aidancing.net chuyển sang trang đăng nhập — đăng nhập lại trong cửa sổ npm run chrome');
  }
  if (res.status() >= 400) throw new Error(`aidancing.net từ chối job: HTTP ${res.status()}`);
  log(`Đã gửi job ${title} (model ${f.jobTypeId}, ${f.seconds}s, ${f.quality}) → HTTP ${res.status()} ${location}`);

  const deadline = Date.now() + FIND_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const job = (await listJobs(api)).find((j) => j.title?.trim() === title);
    if (job) {
      log(`Job ${job.id}: ${job.status}`);
      return job;
    }
    await new Promise((r) => setTimeout(r, 5_000));
  }
  throw new Error(`Đã gửi form nhưng không thấy job "${title}" trong /dashboard — xem trang aidancing.net/dashboard`);
}

async function waitAndDownload(api: APIRequestContext, job: Job, key: string, outFile: string): Promise<void> {
  const deadline = Date.now() + JOB_TIMEOUT_MS;
  let last = job.status;
  while (job.status !== 'COMPLETED') {
    if (job.status === 'FAILED') {
      await writePending(key, null);
      throw new Error(`aidancing.net báo job ${job.id} không thành công (đã hoàn credit): ${job.errorMessage ?? 'không có thông báo'}`);
    }
    if (Date.now() > deadline) {
      throw new Error(`Job ${job.id} chưa xong sau ${JOB_TIMEOUT_MS / 60_000} phút — xem aidancing.net/dashboard`);
    }
    await new Promise((r) => setTimeout(r, POLL_MS));
    job = (await listJobs(api)).find((j) => j.id === job.id) ?? job;
    if (job.status !== last) {
      log(`Job ${job.id}: ${job.status}`);
      last = job.status;
    }
  }
  if (!job.outputFileId) throw new Error(`Job ${job.id} xong nhưng không có file kết quả`);

  const file = await api.get(`${BASE}/api/proxy/files/${job.outputFileId}`, { timeout: 10 * 60_000 });
  if (!file.ok()) throw new Error(`Tải video kết quả lỗi HTTP ${file.status()}`);
  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await fs.writeFile(outFile, await file.body());
  await writePending(key, null);
  log(`✓ Job ${job.id} → ${outFile}`);
}

export function createAiDancingService(): AiDancingService {
  let contextPromise: Promise<BrowserContext> | null = null;

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

  return {
    async generateVideo({ jobTypeId, imagePath, videoPath, seconds, quality, aspectRatio, outFile }) {
      const api = (await ensureContext()).request;
      const jobs = await listJobs(api);
      const image = await filePart(imagePath);
      const video = await filePart(videoPath);
      const key = createHash('sha1')
        .update(image.buffer)
        .update(video.buffer)
        .update(`${jobTypeId}|${seconds}|${quality}|${aspectRatio}`)
        .digest('hex');

      const pendingId = (await readPending())[key];
      let job = pendingId ? jobs.find((j) => j.id === pendingId && j.status !== 'FAILED') : undefined;
      if (job) log(`Theo dõi tiếp job ${job.id} của cùng input (không gửi job mới)`);
      else job = await submitJob(api, { jobTypeId, aspectRatio, quality, seconds, image, video });
      await writePending(key, job.id);
      await waitAndDownload(api, job, key, outFile);
      return { jobId: job.id };
    },
  };
}
