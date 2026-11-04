import path from 'node:path';
import { AIDANCING_DURATIONS, BLOCK_DEFINITIONS, type FileRef } from '@videoflow/shared';
import { getAiDancing, getMedia } from '../services';
import { type ExecutableBlock } from './registry';

const DEFAULT_JOB_TYPE = 192;

/** Thời lượng nhỏ nhất ≥ độ dài video mẫu, để video ra đủ cả điệu nhảy; video dài hơn 25 giây thì lấy 25. */
export function pickDuration(videoSeconds: number): number {
  return AIDANCING_DURATIONS.find((d) => d >= Math.ceil(videoSeconds - 0.05)) ?? AIDANCING_DURATIONS.at(-1)!;
}

/** AI Dancing: Ảnh mẫu + Video mẫu → aidancing.net copy chuyển động → tải video về. */
export const aiDancingBlock: ExecutableBlock = {
  definition: BLOCK_DEFINITIONS.aidancing,
  execute: async ({ config, inputs, dir, itemIndex }) => {
    const i = itemIndex ?? 0;
    const image = inputs.byPort.image?.images[0];
    const video = inputs.byPort.video?.videos[0];
    if (!image) throw new Error('Block AI Dancing cần Ảnh mẫu — nối block ảnh (vd kết quả Ghép mẫu) vào cổng Ảnh mẫu');
    if (!video) throw new Error('Block AI Dancing cần Video mẫu — nối block video vào cổng Video mẫu');

    const fixed = Number(config.duration);
    const seconds = AIDANCING_DURATIONS.includes(fixed)
      ? fixed
      : pickDuration(await getMedia().videoDuration(video.path));
    const jobTypeId = Number(config.jobTypeId) > 0 ? Number(config.jobTypeId) : DEFAULT_JOB_TYPE;
    const outFile = path.join(dir, `aidancing-${i}.mp4`);
    await getAiDancing().generateVideo({
      jobTypeId,
      imagePath: image.path,
      videoPath: video.path,
      seconds,
      quality: config.quality === 'fast' ? 'fast' : 'quality',
      aspectRatio: config.aspectRatio === '16:9' ? '16:9' : '9:16',
      outFile,
    });
    const out: FileRef = { kind: 'file', path: outFile, mime: 'video/mp4' };
    return { out };
  },
};
