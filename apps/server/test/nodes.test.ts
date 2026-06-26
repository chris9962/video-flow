import { describe, it, expect, beforeAll } from 'vitest';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { FileRef } from '@videoflow/shared';
import { textBlock } from '../src/nodes/text';
import { imageBlock } from '../src/nodes/image';
import { videoBlock } from '../src/nodes/video';
import { setMedia, setPilot, setVideoGen } from '../src/services';
import type { BlockInputs, PortInputs } from '../src/nodes/registry';

const empty = (): BlockInputs => ({ texts: [], images: [], videos: [], byPort: {} });
const port = (p: Partial<PortInputs>): PortInputs => ({ texts: [], images: [], videos: [], ...p });
const withPorts = (byPort: Record<string, PortInputs>): BlockInputs => ({
  texts: [],
  images: [],
  videos: [],
  byPort,
});

let dir: string;
beforeAll(async () => {
  dir = await mkdtemp(path.join(tmpdir(), 'vf-nodes-'));
});

describe('text block', () => {
  it('emits its content when it has no inputs', async () => {
    const r = await textBlock.execute({ config: { content: 'xin chào' }, inputs: empty(), dir });
    expect(r).toEqual({ out: 'xin chào', content: 'xin chào' });
  });

  it('parses JSON array content for fan-out, including fenced output', async () => {
    const r1 = await textBlock.execute({ config: { content: '["a", "b"]' }, inputs: empty(), dir });
    expect(r1.out).toEqual(['a', 'b']);
    const r2 = await textBlock.execute({
      config: { content: '```json\n[1, 2]\n```' },
      inputs: empty(),
      dir,
    });
    expect(r2.out).toEqual([1, 2]);
  });

  it('calls the pilot with video context extracted', async () => {
    setPilot({
      sendPrompt: async (_p, { prompt, imagePaths }) =>
        `got:${imagePaths.length}:${prompt.includes('lời thoại')}`,
      generateImage: async () => {},
      generateImageSteps: async () => {},
      openLogin: async () => {},
      openSite: async () => {},
    });
    setMedia({
      downloadVideo: async () => ({ file: '', info: {} }),
      extractVideoContext: async () => ({ framePaths: ['/f1.png', '/f2.png'], transcript: 'lời thoại' }),
      stitchVideos: async () => {},
    });
    const video: FileRef = { kind: 'file', path: '/v.mp4', mime: 'video/mp4' };
    const r = await textBlock.execute({
      config: { content: 'phân tích' },
      inputs: { texts: [], images: [], videos: [video], byPort: {} },
      dir,
    });
    expect(r.out).toBe('got:2:true');
  });
});

describe('image block', () => {
  it('errors when it is an empty source', async () => {
    await expect(imageBlock.execute({ config: {}, inputs: empty(), dir })).rejects.toThrow(
      /chưa có nội dung/,
    );
  });

  it('emits uploaded content as-is', async () => {
    const ref: FileRef = { kind: 'file', path: '/a.png', mime: 'image/png' };
    const r = await imageBlock.execute({ config: { content: ref }, inputs: empty(), dir });
    expect(r.out).toEqual(ref);
  });
});

describe('video block', () => {
  it('prefers uploaded content over sourceUrl', async () => {
    const ref: FileRef = { kind: 'file', path: '/v.mp4', mime: 'video/mp4' };
    const r = await videoBlock.execute({
      config: { content: ref, sourceUrl: 'https://youtube.com/watch?v=x' },
      inputs: empty(),
      dir,
    });
    expect(r.out).toEqual(ref);
  });

  it('downloads from sourceUrl when there is no content', async () => {
    setMedia({
      downloadVideo: async (_url, outDir) => {
        const file = path.join(outDir, 'dl.mp4');
        await writeFile(file, 'v');
        return { file, info: {} };
      },
      extractVideoContext: async () => ({ framePaths: [], transcript: '' }),
      stitchVideos: async () => {},
    });
    const r = await videoBlock.execute({
      config: { sourceUrl: 'https://youtube.com/watch?v=x' },
      inputs: empty(),
      dir,
    });
    expect((r.out as FileRef).path).toContain('dl.mp4');
  });

  it('generates a video via Flow from Start image + Prompt', async () => {
    let captured: { prompt: string; imagePath?: string; endImagePath?: string } | null = null;
    setVideoGen({
      generateVideo: async (req) => {
        captured = req;
      },
    });
    const img: FileRef = { kind: 'file', path: '/k.png', mime: 'image/png' };
    const end: FileRef = { kind: 'file', path: '/e.png', mime: 'image/png' };
    const r = await videoBlock.execute({
      config: { model: 'veo-3.1-fast', duration: 6, aspectRatio: '9:16' },
      inputs: withPorts({
        start: port({ images: [img] }),
        prompt: port({ texts: ['walks slowly forward'] }),
        end: port({ images: [end] }),
      }),
      dir,
    });
    expect(captured!.imagePath).toBe('/k.png');
    expect(captured!.endImagePath).toBe('/e.png');
    expect(captured!.prompt).toBe('walks slowly forward');
    expect((r.out as FileRef).mime).toBe('video/mp4');
  });

  it('errors when Start/End frame is connected without a Prompt', async () => {
    const img: FileRef = { kind: 'file', path: '/k.png', mime: 'image/png' };
    await expect(
      videoBlock.execute({ config: {}, inputs: withPorts({ start: port({ images: [img] }) }), dir }),
    ).rejects.toThrow(/Prompt/);
  });
});
