import { describe, it, expect, beforeAll } from 'vitest';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { Workflow, ExecutionEvent, FileRef } from '@videoflow/shared';
import { runWorkflow } from '../src/engine';
import { registerBuiltinNodes } from '../src/nodes';
import { setMedia, setPilot, setVideoGen } from '../src/services';

registerBuiltinNodes();
setPilot({
  sendPrompt: async (_provider, { prompt, imagePaths }) => `LLM<${prompt}>[${imagePaths.length}]`,
  generateImage: async ({ outFile }) => {
    await writeFile(outFile, 'png');
  },
  generateImageSteps: async ({ outFile }) => {
    await writeFile(outFile, 'png');
  },
  openLogin: async () => {},
  openSite: async () => {},
});
setMedia({
  downloadVideo: async (_url, outDir) => {
    const file = path.join(outDir, 'dl.mp4');
    await writeFile(file, 'v');
    return { file, info: {} };
  },
  extractVideoContext: async () => ({ framePaths: [], transcript: 'lời thoại' }),
  stitchVideos: async (paths, outFile) => {
    await writeFile(outFile, `stitch:${paths.length}`);
  },
  extractFrame: async () => {},
  imageSize: async () => ({ width: 1024, height: 1536 }),
  padToAspect: async () => {},
  cropToAspect: async () => {},
  videoDuration: async () => 12.35,
});
setVideoGen({
  generateVideo: async ({ outFile }) => {
    await writeFile(outFile, 'gen');
  },
});

let runsDir: string;
let mediaDir: string;
const vid = (name: string): FileRef => ({
  kind: 'file',
  path: path.join(mediaDir, name),
  mime: 'video/mp4',
});

beforeAll(async () => {
  runsDir = await mkdtemp(path.join(tmpdir(), 'vf-runs-'));
  mediaDir = await mkdtemp(path.join(tmpdir(), 'vf-media-'));
  await writeFile(path.join(mediaDir, 'a.mp4'), 'a');
  await writeFile(path.join(mediaDir, 'b.mp4'), 'b');
});

const node = (id: string, type: string, config: Record<string, unknown> = {}) => ({
  id,
  type,
  position: { x: 0, y: 0 },
  config,
});
const edge = (id: string, source: string, target: string, port = 'in') => ({
  id,
  source: { nodeId: source, port: 'out' },
  target: { nodeId: target, port },
});

async function collect(
  wf: Workflow,
  runId: string,
  signal?: AbortSignal,
  start?: string | string[],
) {
  const events: ExecutionEvent[] = [];
  const startNodeId = typeof start === 'string' ? start : undefined;
  const startNodeIds = Array.isArray(start) ? start : undefined;
  const result = await runWorkflow(wf, runId, (e) => events.push(e), {
    runsDir,
    signal,
    startNodeId,
    startNodeIds,
  });
  return { events, ...result };
}

const resultOf = (events: ExecutionEvent[], id: string) =>
  events.find((e) => e.kind === 'node-result' && e.nodeId === id) as
    | Extract<ExecutionEvent, { kind: 'node-result' }>
    | undefined;

const lastStatusOf = (events: ExecutionEvent[], id: string) =>
  events
    .filter((e) => e.kind === 'node-status' && e.nodeId === id)
    .map((e) => (e as Extract<ExecutionEvent, { kind: 'node-status' }>).status)
    .at(-1);

describe('runWorkflow (block model)', () => {
  it('source text block emits its content', async () => {
    const wf: Workflow = { id: 'w1', name: 'w1', nodes: [node('t1', 'text', { content: 'hello' })], edges: [] };
    const { events, status, contents } = await collect(wf, 'r1');
    expect(status).toBe('done');
    expect(resultOf(events, 't1')?.outputs).toEqual({ out: 'hello', content: 'hello' });
    expect(contents).toEqual({});
  });

  it('text block with input becomes an agent and reports new content', async () => {
    const wf: Workflow = {
      id: 'w2',
      name: 'w2',
      nodes: [node('src', 'text', { content: 'dữ liệu' }), node('agent', 'text', { content: 'tóm tắt' })],
      edges: [edge('e1', 'src', 'agent')],
    };
    const { events, status, contents } = await collect(wf, 'r2');
    expect(status).toBe('done');
    const out = resultOf(events, 'agent')?.outputs.out as string;
    expect(out).toContain('LLM<');
    expect(out).toContain('tóm tắt');
    expect(out).toContain('dữ liệu');
    expect(contents.agent).toBe(out);
  });

  it('fans out when a text block emits a JSON array', async () => {
    const wf: Workflow = {
      id: 'w3',
      name: 'w3',
      nodes: [node('list', 'text', { content: '["a","b"]' }), node('img', 'image', {})],
      edges: [edge('e1', 'list', 'img')],
    };
    const { events, status } = await collect(wf, 'r3');
    expect(status).toBe('done');
    const out = resultOf(events, 'img')?.outputs.out as FileRef[];
    expect(out).toHaveLength(2);
    expect(out.every((f) => f.kind === 'file')).toBe(true);
    expect(existsSync(path.join(runsDir, 'r3', 'img', 'image-0.png'))).toBe(true);
    expect(existsSync(path.join(runsDir, 'r3', 'img', 'image-1.png'))).toBe(true);
  });

  it('video block generates via Flow from Start image + Prompt ports', async () => {
    const imgRef: FileRef = { kind: 'file', path: path.join(mediaDir, 'a.mp4'), mime: 'image/png' };
    const wf: Workflow = {
      id: 'w4',
      name: 'w4',
      nodes: [
        node('imgSrc', 'image', { content: imgRef }),
        node('txtSrc', 'text', { content: 'walks forward' }),
        node('vid', 'video', { model: 'veo-3.1-fast' }),
      ],
      edges: [edge('e1', 'imgSrc', 'vid', 'start'), edge('e2', 'txtSrc', 'vid', 'prompt')],
    };
    const { events, status } = await collect(wf, 'r4');
    expect(status).toBe('done');
    const out = resultOf(events, 'vid')?.outputs.out as FileRef;
    expect(await readFile(out.path, 'utf8')).toBe('gen');
  });

  it('routes legacy "in" edges into the right video port by source type', async () => {
    const imgRef: FileRef = { kind: 'file', path: path.join(mediaDir, 'a.mp4'), mime: 'image/png' };
    const wf: Workflow = {
      id: 'w4b',
      name: 'w4b',
      nodes: [
        node('imgSrc', 'image', { content: imgRef }),
        node('txtSrc', 'text', { content: 'walk' }),
        node('vid', 'video', {}),
      ],
      // cổng mặc định 'in' (như workflow lưu trước khi tách start/prompt/end)
      edges: [edge('e1', 'imgSrc', 'vid'), edge('e2', 'txtSrc', 'vid')],
    };
    const { events, status } = await collect(wf, 'r4b');
    expect(status).toBe('done');
    expect(await readFile((resultOf(events, 'vid')?.outputs.out as FileRef).path, 'utf8')).toBe('gen');
  });

  it('errors propagate as skips, independent branches still run', async () => {
    const wf: Workflow = {
      id: 'w5',
      name: 'w5',
      nodes: [node('bad', 'image', {}), node('after', 'text', { content: 'x' }), node('free', 'text', { content: 'ok' })],
      edges: [edge('e1', 'bad', 'after')],
    };
    const { events, status } = await collect(wf, 'r5');
    expect(status).toBe('error');
    expect(lastStatusOf(events, 'bad')).toBe('error');
    expect(lastStatusOf(events, 'after')).toBe('skipped');
    expect(lastStatusOf(events, 'free')).toBe('done');
  });

  it('rejects connections the block does not accept', async () => {
    const wf: Workflow = {
      id: 'w6',
      name: 'w6',
      nodes: [node('v1', 'video', { content: vid('a.mp4') }), node('img', 'image', {})],
      edges: [edge('e1', 'v1', 'img')],
    };
    const { events, status } = await collect(wf, 'r6');
    expect(status).toBe('error');
    const err = events.find((e) => e.kind === 'node-status' && e.status === 'error') as Extract<
      ExecutionEvent,
      { kind: 'node-status' }
    >;
    expect(err.error).toContain('không nhận input');
  });

  it('cancels via abort signal: no node runs, status cancelled', async () => {
    const wf: Workflow = { id: 'wc', name: 'wc', nodes: [node('t1', 'text', { content: 'x' })], edges: [] };
    const { events, status } = await collect(wf, 'rc', AbortSignal.abort());
    expect(status).toBe('cancelled');
    expect(lastStatusOf(events, 't1')).toBe('skipped');
    expect(events.at(-1)).toMatchObject({ kind: 'run-finished', status: 'cancelled' });
  });

  it('runs only from the selected node, reusing upstream content', async () => {
    const wf: Workflow = {
      id: 'wf-from',
      name: 'from',
      nodes: [
        node('a', 'text', { content: 'AAA' }),
        node('b', 'text', { content: 'promptB' }),
        node('c', 'text', { content: 'promptC' }),
      ],
      edges: [edge('e1', 'a', 'b'), edge('e2', 'b', 'c')],
    };
    const { events, status } = await collect(wf, 'rfrom', undefined, 'b');
    expect(status).toBe('done');
    // a không chạy lại
    expect(events.some((e) => e.kind === 'node-status' && e.nodeId === 'a')).toBe(false);
    // b chạy với content cũ của a làm input
    expect(lastStatusOf(events, 'b')).toBe('done');
    expect(resultOf(events, 'b')?.outputs.out as string).toContain('AAA');
    // c cũng chạy
    expect(lastStatusOf(events, 'c')).toBe('done');
  });

  it('run-from-here KHÔNG chạy nhánh độc lập (node chưa có content ngoài nhánh)', async () => {
    const imgRef: FileRef = { kind: 'file', path: path.join(mediaDir, 'a.mp4'), mime: 'image/png' };
    const wf: Workflow = {
      id: 'wf-indep',
      name: 'indep',
      nodes: [
        // nhánh chạy: imgSrc → gen1 (chạy từ gen1)
        node('imgSrc', 'image', { content: imgRef }),
        node('gen1', 'image', {}),
        // nhánh ĐỘC LẬP: imgSrc2 + txtSrc2 → vid2 (vid2 chưa có content) — KHÔNG được chạy lan
        node('imgSrc2', 'image', { content: imgRef }),
        node('txtSrc2', 'text', { content: 'walks' }),
        node('vid2', 'video', {}),
      ],
      edges: [
        edge('e1', 'imgSrc', 'gen1'),
        edge('e2', 'imgSrc2', 'vid2', 'start'),
        edge('e3', 'txtSrc2', 'vid2', 'prompt'),
      ],
    };
    const { events, status } = await collect(wf, 'rindep', undefined, 'gen1');
    expect(status).toBe('done');
    expect(lastStatusOf(events, 'gen1')).toBe('done');
    // vid2 thuộc nhánh độc lập (không phải start/sau/tổ tiên) → tuyệt đối không có status event
    expect(events.some((e) => e.kind === 'node-status' && e.nodeId === 'vid2')).toBe(false);
  });

  it('chạy từ NHIỀU node chọn: cả 2 nhánh độc lập đều chạy', async () => {
    const imgRef: FileRef = { kind: 'file', path: path.join(mediaDir, 'a.mp4'), mime: 'image/png' };
    const wf: Workflow = {
      id: 'wf-multi',
      name: 'multi',
      nodes: [
        node('srcA', 'image', { content: imgRef }),
        node('genA', 'image', {}),
        node('srcB', 'image', { content: imgRef }),
        node('genB', 'image', {}),
        node('other', 'image', {}), // KHÔNG chọn, độc lập → không chạy
      ],
      edges: [edge('eA', 'srcA', 'genA'), edge('eB', 'srcB', 'genB')],
    };
    const { events, status } = await collect(wf, 'rmulti', undefined, ['genA', 'genB']);
    expect(status).toBe('done');
    expect(lastStatusOf(events, 'genA')).toBe('done');
    expect(lastStatusOf(events, 'genB')).toBe('done');
    // node không chọn, độc lập, chưa content → không chạy
    expect(events.some((e) => e.kind === 'node-status' && e.nodeId === 'other')).toBe(false);
  });

  it('persists node outputs and run manifest', async () => {
    const wf: Workflow = { id: 'w7', name: 'w7', nodes: [node('t1', 'text', { content: 'hi' })], edges: [] };
    await collect(wf, 'r7');
    const outputs = JSON.parse(await readFile(path.join(runsDir, 'r7', 't1', 'outputs.json'), 'utf8'));
    expect(outputs).toEqual({ out: 'hi', content: 'hi' });
    const manifest = JSON.parse(await readFile(path.join(runsDir, 'r7', 'run.json'), 'utf8'));
    expect(manifest).toMatchObject({ runId: 'r7', workflowId: 'w7', status: 'done' });
  });
});
