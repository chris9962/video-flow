import path from 'node:path';
import { BLOCK_DEFINITIONS, type FileRef } from '@videoflow/shared';
import { getFal } from '../services';
import { type ExecutableBlock } from './registry';

const videoRef = (file: string): FileRef => ({ kind: 'file', path: file, mime: 'video/mp4' });

/** Kling Edit (fal.ai O1): 1 video mẫu + prompt → đổi nền/nhân vật/style, giữ chuyển động → 1 video. */
export const klingEditBlock: ExecutableBlock = {
  definition: BLOCK_DEFINITIONS['kling-edit'],
  execute: async ({ config, inputs, dir, itemIndex }) => {
    const i = itemIndex ?? 0;
    const video = inputs.byPort.video?.videos[0];
    const prompt = (inputs.byPort.prompt?.texts ?? []).join('\n\n').trim();
    if (!video) throw new Error('Block Kling Edit cần 1 video — nối block Video vào cổng Video');
    if (!prompt) throw new Error('Block Kling Edit cần Prompt mô tả thay đổi — nối block text vào cổng Prompt');

    const outFile = path.join(dir, `kling-edit-${i}.mp4`);
    await getFal().editVideo({ videoPath: video.path, prompt, keepAudio: config.keepAudio === true, outFile });
    return { out: videoRef(outFile) };
  },
};
