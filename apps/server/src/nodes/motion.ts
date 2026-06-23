import { BLOCK_DEFINITIONS, isFileRef } from '@videoflow/shared';
import { getVideoUnderstanding } from '../services';
import { resolveDataPath } from '../paths';
import { type ExecutableBlock } from './registry';

/**
 * Trích prompt từ video: Gemini xem video → mô tả chuyển động → text. Block ĐẶC BIỆT: chạy được dù
 * KHÔNG nối input (xử video đã upload trong config.video); cổng Video tuỳ chọn để nối 1 video nguồn vào.
 */
export const motionBlock: ExecutableBlock = {
  definition: BLOCK_DEFINITIONS.motion,
  execute: async ({ config, inputs }) => {
    const inputVideo = inputs.byPort.video?.videos[0] ?? inputs.videos[0];
    const source = inputVideo ?? (isFileRef(config.video) ? config.video : undefined);
    if (!source) {
      throw new Error(
        'Block Trích Prompt chưa có video — upload video vào block hoặc nối 1 video nguồn vào cổng Video',
      );
    }
    const prompt = await getVideoUnderstanding().extractPrompt(resolveDataPath(source.path));
    return { out: prompt, content: prompt };
  },
};
