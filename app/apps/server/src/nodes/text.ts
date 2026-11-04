import { BLOCK_DEFINITIONS } from '@videoflow/shared';
import { getMedia, getPilot, type LlmProvider } from '../services';
import { hasInputs, type ExecutableBlock } from './registry';

/** LLM hay trả JSON bọc trong code fence — bóc ra trước khi parse */
function stripFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/, '')
    .trim();
}

/** Kết quả là JSON array → phát ra mảng để các block sau fan-out */
function maybeArray(text: string): unknown {
  const candidate = stripFences(text);
  if (!candidate.startsWith('[')) return text;
  try {
    const parsed = JSON.parse(candidate);
    return Array.isArray(parsed) ? parsed : text;
  } catch {
    return text;
  }
}

export const textBlock: ExecutableBlock = {
  definition: BLOCK_DEFINITIONS.text,
  execute: async ({ config, inputs, dir }) => {
    const ownText = typeof config.content === 'string' ? config.content : '';
    if (!hasInputs(inputs)) {
      return { out: maybeArray(ownText), content: ownText };
    }

    const imagePaths = inputs.images.map((f) => f.path);
    const contextParts = [...inputs.texts];
    for (const video of inputs.videos) {
      const ctx = await getMedia().extractVideoContext(video.path, dir);
      imagePaths.push(...ctx.framePaths);
      if (ctx.transcript) contextParts.push(`Transcript của video:\n${ctx.transcript}`);
    }

    const prompt = [ownText, ...contextParts].filter(Boolean).join('\n\n---\n\n');
    const provider = (config.provider as LlmProvider) ?? 'chatgpt';
    const response = await getPilot().sendPrompt(provider, { prompt, imagePaths });
    return { out: maybeArray(response), content: response };
  },
};
