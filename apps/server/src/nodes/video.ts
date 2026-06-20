import path from 'node:path';
import { BLOCK_DEFINITIONS, isFileRef, type FileRef } from '@videoflow/shared';
import { getGrok, getMedia, getVideoGen } from '../services';
import { type ExecutableBlock } from './registry';

const videoRef = (file: string): FileRef => ({ kind: 'file', path: file, mime: 'video/mp4' });

export const videoBlock: ExecutableBlock = {
  definition: BLOCK_DEFINITIONS.video,
  execute: async ({ config, inputs, dir, itemIndex }) => {
    const i = itemIndex ?? 0;
    const startImg = inputs.byPort.start?.images[0];
    const endImg = inputs.byPort.end?.images[0];
    const prompt = (inputs.byPort.prompt?.texts ?? []).join('\n\n').trim();

    // Nối Start/Prompt/End → tự tạo video qua Google Flow (Start=frame đầu, End=frame cuối)
    if (startImg || endImg || prompt) {
      if (!prompt) {
        throw new Error('Block video cần Prompt mô tả chuyển động — nối 1 block text vào cổng Prompt');
      }
      const outFile = path.join(dir, `video-${i}.mp4`);
      // provider='grok' → Grok Imagine (grok.com) qua browser; mặc định 'flow' = Google Flow
      if (config.provider === 'grok') {
        await getGrok().generateVideo({
          prompt,
          imagePath: startImg?.path,
          aspectRatio: typeof config.aspectRatio === 'string' ? config.aspectRatio : '9:16',
          outFile,
        });
        return { out: videoRef(outFile) };
      }
      await getVideoGen().generateVideo({
        prompt,
        imagePath: startImg?.path,
        endImagePath: endImg?.path,
        model: typeof config.model === 'string' ? config.model : 'veo-3.1-fast',
        durationSeconds: Number(config.duration ?? 6),
        aspectRatio: typeof config.aspectRatio === 'string' ? config.aspectRatio : '9:16',
        outFile,
      });
      return { out: videoRef(outFile) };
    }

    // Không nối input → nguồn: video đã upload hoặc link YouTube
    if (isFileRef(config.content)) return { out: config.content };
    if (typeof config.sourceUrl === 'string' && config.sourceUrl.trim() !== '') {
      const { file } = await getMedia().downloadVideo(config.sourceUrl.trim(), dir);
      return { out: videoRef(file) };
    }
    throw new Error('Block video chưa có nội dung — upload, dán link YouTube, hoặc nối Start/Prompt/End');
  },
};
