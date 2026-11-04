import { describe, it, expect, beforeAll } from 'vitest';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { FileRef } from '@videoflow/shared';
import { textBlock } from '../src/nodes/text';
import { imageBlock } from '../src/nodes/image';
import { videoBlock } from '../src/nodes/video';
import { tryOnBlock } from '../src/nodes/tryon';
import { aiDancingBlock, pickDuration } from '../src/nodes/aidancing';
import { setAiDancing, setMedia, setPilot, setVideoGen } from '../src/services';
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
      extractFrame: async () => {},
      imageSize: async () => ({ width: 1024, height: 1536 }),
      padToAspect: async () => {},
      cropToAspect: async () => {},
      videoDuration: async () => 12.35,
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
      extractFrame: async () => {},
      imageSize: async () => ({ width: 1024, height: 1536 }),
      padToAspect: async () => {},
      cropToAspect: async () => {},
      videoDuration: async () => 12.35,
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

describe('tryon block', () => {
  const face: FileRef = { kind: 'file', path: '/face.png', mime: 'image/png' };
  const outfit: FileRef = { kind: 'file', path: '/outfit.png', mime: 'image/png' };

  it('errors when Mặt mẫu is missing', async () => {
    await expect(
      tryOnBlock.execute({ config: {}, inputs: withPorts({ outfit: port({ images: [outfit] }) }), dir }),
    ).rejects.toThrow(/cần ảnh Mặt mẫu/);
  });

  it('skips the outfit step and keeps the clothes when Trang phục is missing', async () => {
    let steps: { prompt: string; referenceImagePaths: string[] }[] = [];
    setPilot({
      sendPrompt: async () => '',
      generateImage: async () => {},
      generateImageSteps: async (req) => {
        steps = req.steps;
      },
      openLogin: async () => {},
      openSite: async () => {},
    });
    const pose: FileRef = { kind: 'file', path: '/pose.png', mime: 'image/png' };
    await tryOnBlock.execute({
      config: {},
      inputs: withPorts({ face: port({ images: [face] }), pose: port({ images: [pose] }) }),
      dir,
    });
    expect(steps.map((s) => s.referenceImagePaths[0])).toEqual(['/face.png', '/pose.png']);
    expect(steps[1].prompt).not.toContain('- Thay trang phục');
    expect(steps[1].prompt).toContain('GIỮ NGUYÊN trang phục đang mặc');
  });

  it('sends face, outfit, then the pose image in one tab', async () => {
    let steps: { prompt: string; referenceImagePaths: string[] }[] = [];
    let provider = '';
    setPilot({
      sendPrompt: async () => '',
      generateImage: async () => {},
      generateImageSteps: async (req) => {
        steps = req.steps;
        provider = req.provider ?? '';
      },
      openLogin: async () => {},
      openSite: async () => {},
    });
    const pose: FileRef = { kind: 'file', path: '/pose.png', mime: 'image/png' };
    const r = await tryOnBlock.execute({
      config: { genPrompt: 'đổi mặt và áo' },
      inputs: withPorts({
        face: port({ images: [face] }),
        outfit: port({ images: [outfit] }),
        pose: port({ images: [pose] }),
      }),
      dir,
    });
    expect(provider).toBe('chatgpt');
    expect(steps.map((s) => s.referenceImagePaths[0])).toEqual(['/face.png', '/outfit.png', '/pose.png']);
    expect(steps[2].prompt).toBe('đổi mặt và áo');
    expect((r.out as FileRef).path).toContain('tryon-0.png');
  });

  it('adds a background step after the composite when Background is connected', async () => {
    let steps: { prompt: string; referenceImagePaths: string[]; saveTo?: string }[] = [];
    setPilot({
      sendPrompt: async () => '',
      generateImage: async () => {},
      generateImageSteps: async (req) => {
        steps = req.steps;
      },
      openLogin: async () => {},
      openSite: async () => {},
    });
    const pose: FileRef = { kind: 'file', path: '/pose.png', mime: 'image/png' };
    const bg: FileRef = { kind: 'file', path: '/bg.png', mime: 'image/png' };
    const r = await tryOnBlock.execute({
      config: {},
      inputs: withPorts({
        face: port({ images: [face] }),
        outfit: port({ images: [outfit] }),
        pose: port({ images: [pose] }),
        background: port({ images: [bg] }),
      }),
      dir,
    });
    expect(steps.map((s) => s.referenceImagePaths[0])).toEqual(['/face.png', '/outfit.png', '/pose.png', '/bg.png']);
    expect(steps[2].saveTo).toContain('tryon-0-ghep.png');
    expect(steps[3].saveTo).toBeUndefined();
    expect((r.out as FileRef).path).toContain('tryon-0.png');
  });

  it('cuts a frame from the Clip when there is no pose image', async () => {
    let cut: { videoPath: string; seconds: number; outFile: string } | null = null;
    let padded: { aspect: number; outFile: string } | null = null;
    let cropped: { aspect: number; outFile: string } | null = null;
    setMedia({
      downloadVideo: async () => ({ file: '', info: {} }),
      extractVideoContext: async () => ({ framePaths: [], transcript: '' }),
      stitchVideos: async () => {},
      extractFrame: async (videoPath, seconds, outFile) => {
        cut = { videoPath, seconds, outFile };
      },
      imageSize: async () => ({ width: 576, height: 1024 }),
      padToAspect: async (_in, aspect, outFile) => {
        padded = { aspect, outFile };
      },
      cropToAspect: async (_in, aspect, outFile) => {
        cropped = { aspect, outFile };
      },
      videoDuration: async () => 12.35,
    });
    let posePath = '';
    setPilot({
      sendPrompt: async () => '',
      generateImage: async () => {},
      generateImageSteps: async (req) => {
        posePath = req.steps[2].referenceImagePaths[0];
      },
      openLogin: async () => {},
      openSite: async () => {},
    });
    const clip: FileRef = { kind: 'file', path: '/clip.mp4', mime: 'video/mp4' };
    await tryOnBlock.execute({
      config: { frameTime: 2.5 },
      inputs: withPorts({
        face: port({ images: [face] }),
        outfit: port({ images: [outfit] }),
        clip: port({ videos: [clip] }),
      }),
      dir,
    });
    expect(cut!.videoPath).toBe('/clip.mp4');
    expect(cut!.seconds).toBe(2.5);
    // Khung 9:16 của clip được nới tới 2:3 trước khi gửi, kết quả cắt lại về 9:16.
    expect(padded!.aspect).toBeCloseTo(2 / 3);
    expect(posePath).toBe(padded!.outFile);
    expect(cropped!.aspect).toBeCloseTo(576 / 1024);
    expect(cropped!.outFile).toContain('tryon-0.png');
  });
});

describe('aidancing block', () => {
  const img: FileRef = { kind: 'file', path: '/tryon.png', mime: 'image/png' };
  const clip: FileRef = { kind: 'file', path: '/clip.mp4', mime: 'video/mp4' };

  it('picks the smallest duration that covers the clip', () => {
    expect(pickDuration(12.35)).toBe(15);
    expect(pickDuration(10)).toBe(10);
    expect(pickDuration(10.02)).toBe(10);
    expect(pickDuration(40)).toBe(25);
  });

  it('sends image + video with defaults and returns the downloaded video', async () => {
    let req: { jobTypeId: number; seconds: number; quality: string; aspectRatio: string; imagePath: string } | null = null;
    setMedia({
      downloadVideo: async () => ({ file: '', info: {} }),
      extractVideoContext: async () => ({ framePaths: [], transcript: '' }),
      stitchVideos: async () => {},
      extractFrame: async () => {},
      imageSize: async () => ({ width: 864, height: 1536 }),
      padToAspect: async () => {},
      cropToAspect: async () => {},
      videoDuration: async () => 12.35,
    });
    setAiDancing({
      generateVideo: async (r) => {
        req = r;
        return { jobId: 1 };
      },
    });
    const r = await aiDancingBlock.execute({
      config: {},
      inputs: withPorts({ image: port({ images: [img] }), video: port({ videos: [clip] }) }),
      dir,
    });
    expect(req!).toMatchObject({ jobTypeId: 192, seconds: 15, quality: 'quality', aspectRatio: '9:16', imagePath: '/tryon.png' });
    expect((r.out as FileRef).path).toContain('aidancing-0.mp4');
  });

  it('errors without Ảnh mẫu', async () => {
    await expect(
      aiDancingBlock.execute({ config: {}, inputs: withPorts({ video: port({ videos: [clip] }) }), dir }),
    ).rejects.toThrow(/cần Ảnh mẫu/);
  });
});
