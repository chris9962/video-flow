import path from 'node:path';
import {
  BLOCK_DEFINITIONS,
  TRYON_DEFAULT_BG,
  TRYON_DEFAULT_FACE,
  TRYON_DEFAULT_GEN,
  TRYON_DEFAULT_OUTFIT,
  TRYON_KEEP_OUTFIT,
  type FileRef,
} from '@videoflow/shared';
import { getMedia, getPilot } from '../services';
import { type ExecutableBlock } from './registry';

const text = (v: unknown, fallback: string) => (typeof v === 'string' && v.trim() ? v : fallback);
// ChatGPT luôn trả ảnh 2:3 (1024×1536).
const GPT_ASPECT = 2 / 3;

/**
 * Ghép mẫu: các message liên tiếp cùng 1 tab —
 *  B1: ảnh Mặt mẫu + prompt ghi nhớ gương mặt;
 *  B2: ảnh Trang phục + prompt ghi nhớ trang phục (bỏ qua khi không nối Trang phục);
 *  B3: ảnh Dáng (cắt từ clip) + prompt sửa ảnh: thay mặt + trang phục, giữ nguyên tư thế → tải ảnh kết quả;
 *  B4 (chỉ khi nối Background): ảnh Background + prompt đưa nhân vật vừa ghép vào background mới.
 */
export const tryOnBlock: ExecutableBlock = {
  definition: BLOCK_DEFINITIONS.tryon,
  execute: async ({ config, inputs, dir, itemIndex }) => {
    const i = itemIndex ?? 0;
    const face = inputs.byPort.face?.images[0];
    const outfit = inputs.byPort.outfit?.images[0];
    if (!face) {
      throw new Error('Block Ghép mẫu cần ảnh Mặt mẫu — nối 1 block ảnh vào cổng Mặt mẫu');
    }

    let posePath = inputs.byPort.pose?.images[0]?.path;
    if (!posePath) {
      const clip = inputs.byPort.clip?.videos[0];
      if (!clip) {
        throw new Error('Block Ghép mẫu cần Ảnh dáng — nối ảnh cắt từ clip vào cổng Ảnh dáng, hoặc nối Clip để block tự cắt');
      }
      // Mặc định khung đầu: video aidancing mở màn bằng đúng ảnh ghép này.
      const seconds = Number(config.frameTime ?? 0);
      posePath = path.join(dir, `pose-${i}.png`);
      await getMedia().extractFrame(clip.path, Number.isFinite(seconds) ? seconds : 0, posePath);
    }

    let genPrompt = text(config.genPrompt, TRYON_DEFAULT_GEN);
    // Không có ảnh Trang phục: bỏ bước ghi nhớ trang phục, giữ quần áo đang mặc trong Ảnh dáng.
    if (!outfit) {
      if (genPrompt === TRYON_DEFAULT_GEN) {
        genPrompt = genPrompt.split('\n').filter((l) => !l.startsWith('- Thay trang phục')).join('\n');
      }
      genPrompt += `\n${TRYON_KEEP_OUTFIT}`;
    }

    // Ảnh kết quả phải cùng tỉ lệ và cùng khung với Ảnh dáng để khớp cỡ nhân vật trong clip khi tạo video.
    // Ảnh dáng khác 2:3 (vd khung 9:16 của clip) → nới 2 bên bằng nền mờ tới 2:3 trước khi gửi,
    // nhận ảnh 2:3 rồi cắt phần giữa về đúng tỉ lệ Ảnh dáng. Gửi thẳng 9:16 thì GPT tự kéo giãn/cắt khung.
    const media = getMedia();
    const poseSize = await media.imageSize(posePath);
    const poseAspect = poseSize.width / poseSize.height;
    const padded = Math.abs(poseAspect - GPT_ASPECT) > 0.01;
    const sendPose = padded ? path.join(dir, `pose-${i}-2x3.png`) : posePath;
    if (padded) await media.padToAspect(posePath, GPT_ASPECT, sendPose);
    const fit = async (raw: string, final: string) => {
      if (padded) await media.cropToAspect(raw, poseAspect, final);
    };

    const background = inputs.byPort.background?.images[0];
    const provider = config.provider === 'gemini' ? 'gemini' : 'chatgpt';
    const outFile = path.join(dir, `tryon-${i}.png`);
    const rawOut = padded ? path.join(dir, `tryon-${i}-2x3.png`) : outFile;
    const ghep = path.join(dir, `tryon-${i}-ghep.png`);
    const rawGhep = padded ? path.join(dir, `tryon-${i}-ghep-2x3.png`) : ghep;
    await getPilot().generateImageSteps({
      provider,
      steps: [
        { prompt: text(config.facePrompt, TRYON_DEFAULT_FACE), referenceImagePaths: [face.path] },
        ...(outfit
          ? [{ prompt: text(config.outfitPrompt, TRYON_DEFAULT_OUTFIT), referenceImagePaths: [outfit.path] }]
          : []),
        {
          prompt: genPrompt,
          referenceImagePaths: [sendPose],
          // Có Background thì ảnh ghép là ảnh trung gian; lưu lại để so với ảnh đã đổi background.
          ...(background ? { saveTo: rawGhep } : {}),
        },
        ...(background
          ? [{ prompt: text(config.bgPrompt, TRYON_DEFAULT_BG), referenceImagePaths: [background.path] }]
          : []),
      ],
      outFile: rawOut,
    });
    await fit(rawOut, outFile);
    if (background) await fit(rawGhep, ghep);
    const out: FileRef = { kind: 'file', path: outFile, mime: 'image/png' };
    return { out };
  },
};
