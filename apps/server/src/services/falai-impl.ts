import { createWriteStream } from 'node:fs';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { ReadableStream as WebReadableStream } from 'node:stream/web';
import { fal } from '@fal-ai/client';
import { readSettings } from '../settings';
import type { FalService } from './types';

const MIME_BY_EXT: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
  '.m4v': 'video/x-m4v',
};

/**
 * Model trong config có thể là tên ngắn ('kling-video/v2.5-turbo/pro') hoặc id đầy đủ.
 * Họ model Kling trên fal tách endpoint theo variant /text-to-video và /image-to-video.
 */
function resolveModelId(model: string, hasImage: boolean): string {
  const base = model.startsWith('fal-ai/') ? model : `fal-ai/${model}`;
  if (/\/(text|image)-to-video$/.test(base)) return base;
  return `${base}/${hasImage ? 'image' : 'text'}-to-video`;
}

export function createFalService(): FalService {
  async function ensureKey(): Promise<void> {
    const { falKey } = await readSettings();
    if (!falKey.trim()) {
      throw new Error('Chưa có fal.ai API key — vào trang Settings thêm key rồi chạy lại');
    }
    fal.config({ credentials: falKey.trim() });
  }

  async function upload(filePath: string): Promise<string> {
    const bytes = await readFile(filePath);
    const blob = new Blob([new Uint8Array(bytes)], {
      type: MIME_BY_EXT[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream',
    });
    return fal.storage.upload(blob);
  }

  /** Chạy model rồi tải video kết quả (mọi model fal ở đây đều trả data.video.url) về outFile */
  async function runAndSave(modelId: string, input: Record<string, unknown>, outFile: string): Promise<void> {
    const result = await fal.subscribe(modelId, { input });
    const videoUrl = (result.data as { video?: { url?: string } } | undefined)?.video?.url;
    if (!videoUrl) throw new Error(`fal.ai không trả về video (model ${modelId})`);

    const res = await fetch(videoUrl);
    if (!res.ok || !res.body) {
      throw new Error(`Tải video kết quả từ fal.ai thất bại (HTTP ${res.status})`);
    }
    await mkdir(path.dirname(outFile), { recursive: true });
    await pipeline(Readable.fromWeb(res.body as unknown as WebReadableStream), createWriteStream(outFile));
  }

  return {
    async generateVideo({ prompt, imagePath, endImagePath, model, durationSeconds, aspectRatio, outFile }) {
      await ensureKey();
      const modelId = resolveModelId(model, Boolean(imagePath));
      const input: Record<string, unknown> = {
        prompt,
        duration: durationSeconds >= 10 ? '10' : '5', // Kling chỉ nhận "5" | "10"
        aspect_ratio: aspectRatio, // "16:9" | "9:16" | "1:1"
      };
      if (imagePath) input.image_url = await upload(imagePath); // frame Start
      if (endImagePath) input.tail_image_url = await upload(endImagePath); // frame End
      await runAndSave(modelId, input, outFile);
    },

    async editVideo({ videoPath, prompt, refImagePaths, keepAudio, outFile }) {
      await ensureKey();
      const input: Record<string, unknown> = {
        prompt,
        video_url: await upload(videoPath),
        keep_audio: keepAudio ?? false,
      };
      if (refImagePaths?.length) {
        input.image_urls = await Promise.all(refImagePaths.slice(0, 4).map(upload));
      }
      await runAndSave('fal-ai/kling-video/o1/video-to-video/edit', input, outFile);
    },

    async swapFace({ videoPath, imagePath, mode, resolution, keepAudio, outFile }) {
      await ensureKey();
      const input: Record<string, unknown> = {
        video_url: await upload(videoPath),
        image_url: await upload(imagePath),
        mode,
        resolution,
        original_sound_switch: keepAudio ?? true,
      };
      await runAndSave('fal-ai/pixverse/swap', input, outFile);
    },
  };
}
