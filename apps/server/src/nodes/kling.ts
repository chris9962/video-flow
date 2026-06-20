import path from 'node:path';
import { BLOCK_DEFINITIONS, type FileRef } from '@videoflow/shared';
import { getFal, getKlingWeb } from '../services';
import { type ExecutableBlock } from './registry';

const videoRef = (file: string): FileRef => ({ kind: 'file', path: file, mime: 'video/mp4' });

/**
 * Kling Generate: Start (ảnh) + Prompt + End (ảnh) → 1 video.
 * engine='web' → kLing.ai web (dùng credit gói sub); 'falai' (mặc định) → fal.ai API (trả tiền).
 */
export const klingBlock: ExecutableBlock = {
  definition: BLOCK_DEFINITIONS.kling,
  execute: async ({ config, inputs, dir, itemIndex }) => {
    const i = itemIndex ?? 0;
    const startImg = inputs.byPort.start?.images[0];
    const endImg = inputs.byPort.end?.images[0];
    const prompt = (inputs.byPort.prompt?.texts ?? []).join('\n\n').trim();
    if (!prompt) {
      throw new Error('Block Kling cần Prompt mô tả chuyển động — nối 1 block text vào cổng Prompt');
    }

    const outFile = path.join(dir, `kling-${i}.mp4`);
    if (config.engine === 'web') {
      await getKlingWeb().generateVideo({
        prompt,
        imagePath: startImg?.path,
        endImagePath: endImg?.path,
        model: '',
        durationSeconds: Number(config.duration ?? 5),
        aspectRatio: typeof config.aspectRatio === 'string' ? config.aspectRatio : '9:16',
        quality: typeof config.quality === 'string' ? config.quality : '1080p',
        outFile,
      });
      return { out: videoRef(outFile) };
    }

    await getFal().generateVideo({
      prompt,
      imagePath: startImg?.path,
      endImagePath: endImg?.path,
      model: typeof config.model === 'string' ? config.model : 'kling-video/v2.5-turbo/pro',
      durationSeconds: Number(config.duration ?? 5),
      aspectRatio: typeof config.aspectRatio === 'string' ? config.aspectRatio : '9:16',
      outFile,
    });
    return { out: videoRef(outFile) };
  },
};
