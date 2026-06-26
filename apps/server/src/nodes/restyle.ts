import path from 'node:path';
import {
  BLOCK_DEFINITIONS,
  RESTYLE_DEFAULT_ANALYZE,
  RESTYLE_DEFAULT_GEN,
  type FileRef,
} from '@videoflow/shared';
import { getPilot } from '../services';
import { type ExecutableBlock } from './registry';

/**
 * Ảnh GPT 2 bước: gửi 2 message LIÊN TIẾP trong CÙNG 1 tab ChatGPT —
 *  B1: ảnh THAM CHIẾU (ref) + prompt ghi nhớ góc máy/ánh sáng/bg;
 *  B2: ảnh MẪU (face) + prompt tạo ảnh áp style đó, giữ nguyên mặt → tải ảnh kết quả.
 */
export const restyleBlock: ExecutableBlock = {
  definition: BLOCK_DEFINITIONS.restyle,
  execute: async ({ config, inputs, dir, itemIndex }) => {
    const ref = inputs.byPort.ref?.images[0];
    const face = inputs.byPort.face?.images[0];
    if (!ref || !face) {
      throw new Error(
        'Block Ảnh GPT 2 bước cần cả ảnh THAM CHIẾU (góc máy/ánh sáng/bg) lẫn ảnh MẪU (gương mặt) — nối 2 block ảnh vào cổng Tham chiếu và Mẫu',
      );
    }
    const analyzePrompt =
      typeof config.analyzePrompt === 'string' && config.analyzePrompt.trim()
        ? config.analyzePrompt
        : RESTYLE_DEFAULT_ANALYZE;
    const genPrompt =
      typeof config.genPrompt === 'string' && config.genPrompt.trim()
        ? config.genPrompt
        : RESTYLE_DEFAULT_GEN;

    const outFile = path.join(dir, `restyle-${itemIndex ?? 0}.png`);
    await getPilot().generateImageSteps({
      steps: [
        { prompt: analyzePrompt, referenceImagePaths: [ref.path] },
        { prompt: genPrompt, referenceImagePaths: [face.path] },
      ],
      outFile,
    });
    const out: FileRef = { kind: 'file', path: outFile, mime: 'image/png' };
    return { out };
  },
};
