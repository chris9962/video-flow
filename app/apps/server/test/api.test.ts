import { describe, it, expect, beforeEach } from 'vitest';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { AddressInfo } from 'node:net';
import WebSocket from 'ws';
import type { Workflow, ExecutionEvent } from '@videoflow/shared';
import { buildApp } from '../src/app';
import { WorkflowStore } from '../src/storage';

const demo: Workflow = {
  id: 'demo-1',
  name: 'demo',
  nodes: [{ id: 't1', type: 'text', position: { x: 0, y: 0 }, config: { content: 'hello' } }],
  edges: [],
};

describe('api', () => {
  let store: WorkflowStore;
  let runsDir: string;

  beforeEach(async () => {
    store = new WorkflowStore(await mkdtemp(path.join(tmpdir(), 'vf-')));
    runsDir = await mkdtemp(path.join(tmpdir(), 'vf-runs-'));
  });

  it('GET /health returns ok', async () => {
    const app = buildApp(store, { runsDir });
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ ok: true });
    await app.close();
  });

  it('CRUD workflows', async () => {
    const app = buildApp(store, { runsDir });

    let res = await app.inject({ method: 'GET', url: '/api/workflows' });
    expect(res.json()).toEqual([]);

    res = await app.inject({ method: 'PUT', url: '/api/workflows/demo-1', payload: demo });
    expect(res.statusCode).toBe(200);

    res = await app.inject({ method: 'GET', url: '/api/workflows/demo-1' });
    expect(res.json()).toEqual(demo);

    res = await app.inject({ method: 'GET', url: '/api/workflows' });
    expect(res.json()).toHaveLength(1);

    res = await app.inject({ method: 'DELETE', url: '/api/workflows/demo-1' });
    expect(res.statusCode).toBe(204);

    res = await app.inject({ method: 'GET', url: '/api/workflows/demo-1' });
    expect(res.statusCode).toBe(404);

    await app.close();
  });

  it('PUT rejects mismatched id and invalid id', async () => {
    const app = buildApp(store, { runsDir });
    let res = await app.inject({ method: 'PUT', url: '/api/workflows/other', payload: demo });
    expect(res.statusCode).toBe(400);
    res = await app.inject({ method: 'PUT', url: '/api/workflows/..%2Fevil', payload: demo });
    expect(res.statusCode).toBe(400);
    await app.close();
  });

  it('POST run returns 404 for unknown workflow', async () => {
    const app = buildApp(store, { runsDir });
    const res = await app.inject({ method: 'POST', url: '/api/workflows/nope/run' });
    expect(res.statusCode).toBe(404);
    await app.close();
  });

  it('POST run broadcasts execution events over /ws', async () => {
    await store.save(demo);
    const app = buildApp(store, { runsDir });
    await app.listen({ port: 0, host: '127.0.0.1' });
    const port = (app.server.address() as AddressInfo).port;

    const ws = new WebSocket(`ws://127.0.0.1:${port}/ws`);
    await new Promise((resolve) => ws.on('open', resolve));
    const events: ExecutionEvent[] = [];
    const finished = new Promise<void>((resolve) => {
      ws.on('message', (data) => {
        const event = JSON.parse(data.toString()) as ExecutionEvent;
        events.push(event);
        if (event.kind === 'run-finished') resolve();
      });
    });

    const res = await app.inject({ method: 'POST', url: '/api/workflows/demo-1/run' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveProperty('runId');

    await finished;
    const t1 = events.find((e) => e.kind === 'node-result' && e.nodeId === 't1');
    expect(t1).toMatchObject({ outputs: { out: 'hello', content: 'hello' } });

    ws.close();
    await app.close();
  });
});
