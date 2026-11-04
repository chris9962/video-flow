import path from 'node:path';
import { BLOCK_DEFINITIONS, type FileRef } from '@videoflow/shared';
import { getFal } from '../services';
import { type ExecutableBlock } from './registry';

const videoRef = (file: string): FileRef => ({ kind: 'file', path: file, mime: 'video/mp4' });

const MODES = ['person', 'object', 'background'] as const;
const RESOLUTIONS = ['360p', '540p', '720p'] as const;
type Mode = (typeof MODES)[number];
type Resolution = (typeof RESOLUTIONS)[number];

/** Face Swap (fal.ai Pixverse): 1 video + 1 ảnh mặt → đổi mặt, giữ đồ/cảnh/động tác → 1 video. */
export const faceSwapBlock: ExecutableBlock = {
  definition: BLOCK_DEFINITIONS.faceswap,
  execute: async ({ config, inputs, dir, itemIndex }) => {
    const i = itemIndex ?? 0;
    const video = inputs.byPort.video?.videos[0];
    const face = inputs.byPort.face?.images[0];
    if (!video) throw new Error('Block Face Swap cần 1 video — nối block Video vào cổng Video');
    if (!face) throw new Error('Block Face Swap cần 1 ảnh mặt — nối block Ảnh vào cổng Mặt');

    const mode = MODES.includes(config.mode as Mode) ? (config.mode as Mode) : 'person';
    const resolution = RESOLUTIONS.includes(config.resolution as Resolution)
      ? (config.resolution as Resolution)
      : '720p';

    const outFile = path.join(dir, `faceswap-${i}.mp4`);
    await getFal().swapFace({ videoPath: video.path, imagePath: face.path, mode, resolution, outFile });
    return { out: videoRef(outFile) };
  },
};
