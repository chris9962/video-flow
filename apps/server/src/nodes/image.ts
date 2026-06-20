import path from 'node:path';
import { BLOCK_DEFINITIONS, isFileRef, type FileRef } from '@videoflow/shared';
import { getGrok, getPilot, type ImageProvider } from '../services';
import { hasInputs, type ExecutableBlock } from './registry';

export const imageBlock: ExecutableBlock = {
  definition: BLOCK_DEFINITIONS.image,
  execute: async ({ config, inputs, dir, itemIndex }) => {
    if (!hasInputs(inputs)) {
      if (!isFileRef(config.content)) {
        throw new Error('Block ảnh chưa có nội dung — upload ảnh hoặc nối input vào');
      }
      return { out: config.content };
    }

    const prompt = inputs.texts.join('\n\n');
    const referenceImagePaths = inputs.images.map((f) => f.path);
    const outFile = path.join(dir, `image-${itemIndex ?? 0}.png`);
    const ref: FileRef = { kind: 'file', path: outFile, mime: 'image/png' };

    // Grok Imagine (grok.com) qua browser — credit gói SuperGrok, không API trả tiền
    if (config.provider === 'grok') {
      await getGrok().generateImage({
        prompt,
        referenceImagePaths,
        aspectRatio: typeof config.aspectRatio === 'string' ? config.aspectRatio : undefined,
        outFile,
      });
      return { out: ref };
    }

    const provider: ImageProvider = config.provider === 'gemini' ? 'gemini' : 'chatgpt';
    await getPilot().generateImage({ provider, prompt, referenceImagePaths, outFile });
    return { out: ref };
  },
};
