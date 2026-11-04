# VideoFlow Phase 1 (Skeleton + Editor) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Monorepo TypeScript với node editor (React Flow) kéo thả/nối/save workflow, và execution engine chạy được workflow `text → output` với trạng thái realtime qua WebSocket.

**Architecture:** 3 package — `packages/shared` (types + node definitions dùng chung), `apps/server` (Fastify local server: storage JSON file, node registry, execution engine, REST + WebSocket), `apps/web` (React + Vite + React Flow, proxy `/api` và `/ws` sang server). Port có kiểu dữ liệu, editor chặn nối sai kiểu. Spec gốc: `docs/superpowers/specs/2026-06-10-video-flow-design.md`.

**Tech Stack:** TypeScript, npm workspaces, Fastify 5 + @fastify/websocket, React 19, Vite, @xyflow/react (React Flow v12), vitest, tsx.

**Quy ước chung:**
- Mọi package đều `"type": "module"`.
- Server chạy ở `127.0.0.1:3001`, web dev server ở `5173`.
- Chạy lệnh từ root repo (`/Users/nguyentruong/new-project`) trừ khi ghi khác.

---

### Task 1: Monorepo scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.base.json`
- Create: `.gitignore`

- [ ] **Step 1: Tạo root package.json**

```json
{
  "name": "videoflow",
  "private": true,
  "type": "module",
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev:server": "npm run dev -w apps/server",
    "dev:web": "npm run dev -w apps/web",
    "test": "npm run test -ws --if-present",
    "typecheck": "npm run typecheck -ws --if-present"
  }
}
```

- [ ] **Step 2: Tạo tsconfig.base.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true
  }
}
```

- [ ] **Step 3: Tạo .gitignore**

```
node_modules/
dist/
data/
*.local
.DS_Store
```

- [ ] **Step 4: Verify npm nhận workspaces**

Run: `npm install`
Expected: chạy xong không lỗi, tạo `package-lock.json` (chưa có workspace con cũng không sao).

- [ ] **Step 5: Commit**

```bash
git add package.json tsconfig.base.json .gitignore package-lock.json
git commit -m "chore: scaffold npm workspaces monorepo"
```

---

### Task 2: packages/shared — types + node definitions

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/workflow.ts`
- Create: `packages/shared/src/execution.ts`
- Create: `packages/shared/src/node-defs.ts`
- Create: `packages/shared/src/index.ts`

- [ ] **Step 1: Tạo packages/shared/package.json**

```json
{
  "name": "@videoflow/shared",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": { ".": "./src/index.ts" },
  "scripts": { "typecheck": "tsc --noEmit" },
  "devDependencies": { "typescript": "^5.7.0" }
}
```

- [ ] **Step 2: Tạo packages/shared/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "include": ["src"]
}
```

- [ ] **Step 3: Tạo src/workflow.ts**

```typescript
export type DataType = 'text' | 'image' | 'video' | 'json';

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  config: Record<string, unknown>;
}

export interface WorkflowEdge {
  id: string;
  source: { nodeId: string; port: string };
  target: { nodeId: string; port: string };
}

export interface Workflow {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}
```

- [ ] **Step 4: Tạo src/execution.ts**

```typescript
export type NodeStatus = 'pending' | 'running' | 'done' | 'error' | 'skipped';

export type ExecutionEvent =
  | { kind: 'run-started'; runId: string; workflowId: string }
  | { kind: 'node-status'; runId: string; nodeId: string; status: NodeStatus; error?: string }
  | { kind: 'node-result'; runId: string; nodeId: string; outputs: Record<string, unknown> }
  | { kind: 'run-finished'; runId: string; status: 'done' | 'error' };
```

- [ ] **Step 5: Tạo src/node-defs.ts**

Port `dataType` cho phép thêm `'any'` để node `output` nhận mọi kiểu (spec §4).

```typescript
import type { DataType } from './workflow';

export interface PortDefinition {
  id: string;
  label: string;
  dataType: DataType | 'any';
}

export interface NodeTypeDefinition {
  type: string;
  label: string;
  inputs: PortDefinition[];
  outputs: PortDefinition[];
}

export const NODE_DEFINITIONS: Record<string, NodeTypeDefinition> = {
  text: {
    type: 'text',
    label: 'Text',
    inputs: [],
    outputs: [{ id: 'text', label: 'Text', dataType: 'text' }],
  },
  output: {
    type: 'output',
    label: 'Output',
    inputs: [{ id: 'value', label: 'Value', dataType: 'any' }],
    outputs: [],
  },
};
```

- [ ] **Step 6: Tạo src/index.ts**

```typescript
export * from './workflow';
export * from './execution';
export * from './node-defs';
```

- [ ] **Step 7: Install + typecheck**

Run: `npm install && npm run typecheck -w packages/shared`
Expected: PASS, không lỗi TS.

- [ ] **Step 8: Commit**

```bash
git add packages/shared package-lock.json
git commit -m "feat(shared): workflow/execution types and node definitions"
```

---

### Task 3: Server scaffold + /health

**Files:**
- Create: `apps/server/package.json`
- Create: `apps/server/tsconfig.json`
- Create: `apps/server/src/app.ts`
- Create: `apps/server/src/index.ts`
- Test: `apps/server/test/api.test.ts`

- [ ] **Step 1: Tạo apps/server/package.json**

```json
{
  "name": "@videoflow/server",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@fastify/websocket": "^11.0.0",
    "@videoflow/shared": "*",
    "fastify": "^5.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/ws": "^8.5.0",
    "tsx": "^4.19.0",
    "typescript": "^5.7.0",
    "vitest": "^3.0.0",
    "ws": "^8.18.0"
  }
}
```

- [ ] **Step 2: Tạo apps/server/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "types": ["node"] },
  "include": ["src", "test"]
}
```

- [ ] **Step 3: Viết failing test cho /health**

`apps/server/test/api.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { buildApp } from '../src/app';

describe('api', () => {
  it('GET /health returns ok', async () => {
    const app = buildApp();
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ ok: true });
    await app.close();
  });
});
```

- [ ] **Step 4: Install + chạy test, verify FAIL**

Run: `npm install && npm run test -w apps/server`
Expected: FAIL — `Cannot find module '../src/app'` (hoặc tương đương).

- [ ] **Step 5: Tạo src/app.ts tối thiểu**

```typescript
import Fastify, { type FastifyInstance } from 'fastify';

export function buildApp(): FastifyInstance {
  const app = Fastify();
  app.get('/health', async () => ({ ok: true }));
  return app;
}
```

- [ ] **Step 6: Tạo src/index.ts (entry)**

```typescript
import { buildApp } from './app';

const app = buildApp();
app.listen({ port: 3001, host: '127.0.0.1' }).then((addr) => {
  console.log(`VideoFlow server: ${addr}`);
});
```

- [ ] **Step 7: Chạy test, verify PASS**

Run: `npm run test -w apps/server`
Expected: PASS (1 test).

- [ ] **Step 8: Commit**

```bash
git add apps/server package-lock.json
git commit -m "feat(server): fastify scaffold with /health"
```

---

### Task 4: WorkflowStore — lưu workflow ra file JSON

**Files:**
- Create: `apps/server/src/storage.ts`
- Test: `apps/server/test/storage.test.ts`

- [ ] **Step 1: Viết failing test**

`apps/server/test/storage.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { Workflow } from '@videoflow/shared';
import { WorkflowStore } from '../src/storage';

const wf = (id: string): Workflow => ({ id, name: `wf ${id}`, nodes: [], edges: [] });

describe('WorkflowStore', () => {
  let store: WorkflowStore;

  beforeEach(async () => {
    store = new WorkflowStore(await mkdtemp(path.join(tmpdir(), 'vf-')));
  });

  it('list returns empty initially', async () => {
    expect(await store.list()).toEqual([]);
  });

  it('saves and gets a workflow', async () => {
    await store.save(wf('a'));
    expect(await store.get('a')).toEqual(wf('a'));
  });

  it('get returns null when missing', async () => {
    expect(await store.get('nope')).toBeNull();
  });

  it('save overwrites and list returns all', async () => {
    await store.save(wf('a'));
    await store.save({ ...wf('a'), name: 'renamed' });
    await store.save(wf('b'));
    const all = await store.list();
    expect(all).toHaveLength(2);
    expect(all.find((w) => w.id === 'a')?.name).toBe('renamed');
  });

  it('deletes a workflow', async () => {
    await store.save(wf('a'));
    await store.delete('a');
    expect(await store.get('a')).toBeNull();
  });
});
```

- [ ] **Step 2: Chạy test, verify FAIL**

Run: `npm run test -w apps/server`
Expected: FAIL — `Cannot find module '../src/storage'`.

- [ ] **Step 3: Implement src/storage.ts**

Default dir theo spec §2: `data/workflows` ở root repo (đã gitignore), đường dẫn luôn qua `path.join` (đa nền tảng).

```typescript
import { mkdir, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import type { Workflow } from '@videoflow/shared';

// storage.ts nằm ở apps/server/src → lên 3 cấp là root repo
const defaultDir = path.join(import.meta.dirname, '..', '..', '..', 'data', 'workflows');

export class WorkflowStore {
  constructor(private readonly dir: string = defaultDir) {}

  private file(id: string): string {
    return path.join(this.dir, `${id}.json`);
  }

  async list(): Promise<Workflow[]> {
    await mkdir(this.dir, { recursive: true });
    const files = (await readdir(this.dir)).filter((f) => f.endsWith('.json'));
    return Promise.all(
      files.map(async (f) => JSON.parse(await readFile(path.join(this.dir, f), 'utf8')) as Workflow),
    );
  }

  async get(id: string): Promise<Workflow | null> {
    try {
      return JSON.parse(await readFile(this.file(id), 'utf8')) as Workflow;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw err;
    }
  }

  async save(workflow: Workflow): Promise<void> {
    await mkdir(this.dir, { recursive: true });
    await writeFile(this.file(workflow.id), JSON.stringify(workflow, null, 2));
  }

  async delete(id: string): Promise<void> {
    await rm(this.file(id), { force: true });
  }
}
```

- [ ] **Step 4: Chạy test, verify PASS**

Run: `npm run test -w apps/server`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/server/src/storage.ts apps/server/test/storage.test.ts
git commit -m "feat(server): JSON file workflow store"
```

---

### Task 5: Node registry + node text/output

**Files:**
- Create: `apps/server/src/nodes/registry.ts`
- Create: `apps/server/src/nodes/text.ts`
- Create: `apps/server/src/nodes/output.ts`
- Create: `apps/server/src/nodes/index.ts`
- Test: `apps/server/test/nodes.test.ts`

- [ ] **Step 1: Viết failing test**

`apps/server/test/nodes.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { getExecutable } from '../src/nodes/registry';
import { registerBuiltinNodes } from '../src/nodes';

registerBuiltinNodes();

describe('builtin nodes', () => {
  it('text node outputs its configured text', async () => {
    const out = await getExecutable('text').execute({ config: { text: 'hello' }, inputs: {} });
    expect(out).toEqual({ text: 'hello' });
  });

  it('text node defaults to empty string', async () => {
    const out = await getExecutable('text').execute({ config: {}, inputs: {} });
    expect(out).toEqual({ text: '' });
  });

  it('output node passes through its input', async () => {
    const out = await getExecutable('output').execute({ config: {}, inputs: { value: 'hi' } });
    expect(out).toEqual({ value: 'hi' });
  });

  it('throws on unknown node type', () => {
    expect(() => getExecutable('nope')).toThrow(/Unknown node type/);
  });
});
```

- [ ] **Step 2: Chạy test, verify FAIL**

Run: `npm run test -w apps/server`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement src/nodes/registry.ts**

```typescript
import type { NodeTypeDefinition } from '@videoflow/shared';

export interface ExecuteContext {
  config: Record<string, unknown>;
  inputs: Record<string, unknown>;
}

export interface ExecutableNode {
  definition: NodeTypeDefinition;
  execute(ctx: ExecuteContext): Promise<Record<string, unknown>>;
}

const registry = new Map<string, ExecutableNode>();

export function registerNode(node: ExecutableNode): void {
  registry.set(node.definition.type, node);
}

export function getExecutable(type: string): ExecutableNode {
  const node = registry.get(type);
  if (!node) throw new Error(`Unknown node type: ${type}`);
  return node;
}
```

- [ ] **Step 4: Implement src/nodes/text.ts và src/nodes/output.ts**

`src/nodes/text.ts`:

```typescript
import { NODE_DEFINITIONS } from '@videoflow/shared';
import type { ExecutableNode } from './registry';

export const textNode: ExecutableNode = {
  definition: NODE_DEFINITIONS.text,
  execute: async ({ config }) => ({ text: typeof config.text === 'string' ? config.text : '' }),
};
```

`src/nodes/output.ts`:

```typescript
import { NODE_DEFINITIONS } from '@videoflow/shared';
import type { ExecutableNode } from './registry';

export const outputNode: ExecutableNode = {
  definition: NODE_DEFINITIONS.output,
  execute: async ({ inputs }) => ({ value: inputs.value }),
};
```

`src/nodes/index.ts`:

```typescript
import { registerNode } from './registry';
import { textNode } from './text';
import { outputNode } from './output';

export function registerBuiltinNodes(): void {
  registerNode(textNode);
  registerNode(outputNode);
}
```

- [ ] **Step 5: Chạy test, verify PASS**

Run: `npm run test -w apps/server`
Expected: PASS (4 tests mới + tests cũ).

- [ ] **Step 6: Commit**

```bash
git add apps/server/src/nodes apps/server/test/nodes.test.ts
git commit -m "feat(server): node registry with text and output nodes"
```

---

### Task 6: Execution engine

**Files:**
- Create: `apps/server/src/engine.ts`
- Test: `apps/server/test/engine.test.ts`

Hành vi theo spec §3, §7: chạy theo dependency (wave-based, các node sẵn sàng trong cùng wave chạy song song), truyền dữ liệu qua edge theo port, node lỗi → toàn bộ node phía sau (transitive) bị `skipped`, nhánh độc lập vẫn chạy.

- [ ] **Step 1: Viết failing test**

`apps/server/test/engine.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import type { Workflow, ExecutionEvent } from '@videoflow/shared';
import { runWorkflow } from '../src/engine';
import { registerBuiltinNodes } from '../src/nodes';
import { registerNode } from '../src/nodes/registry';

registerBuiltinNodes();
registerNode({
  definition: { type: 'boom', label: 'Boom', inputs: [], outputs: [{ id: 'out', label: 'Out', dataType: 'text' }] },
  execute: async () => {
    throw new Error('boom');
  },
});

const textOutputWorkflow: Workflow = {
  id: 'wf1',
  name: 'demo',
  nodes: [
    { id: 't1', type: 'text', position: { x: 0, y: 0 }, config: { text: 'hello' } },
    { id: 'o1', type: 'output', position: { x: 200, y: 0 }, config: {} },
  ],
  edges: [{ id: 'e1', source: { nodeId: 't1', port: 'text' }, target: { nodeId: 'o1', port: 'value' } }],
};

async function collect(wf: Workflow) {
  const events: ExecutionEvent[] = [];
  const status = await runWorkflow(wf, 'run1', (e) => events.push(e));
  return { events, status };
}

describe('runWorkflow', () => {
  it('runs text → output and passes data by port', async () => {
    const { events, status } = await collect(textOutputWorkflow);
    expect(status).toBe('done');
    expect(events[0]).toEqual({ kind: 'run-started', runId: 'run1', workflowId: 'wf1' });
    const o1Result = events.find((e) => e.kind === 'node-result' && e.nodeId === 'o1');
    expect(o1Result).toMatchObject({ outputs: { value: 'hello' } });
    expect(events.at(-1)).toEqual({ kind: 'run-finished', runId: 'run1', status: 'done' });
  });

  it('emits running before done for each node', async () => {
    const { events } = await collect(textOutputWorkflow);
    const t1Statuses = events
      .filter((e) => e.kind === 'node-status' && e.nodeId === 't1')
      .map((e) => (e as Extract<ExecutionEvent, { kind: 'node-status' }>).status);
    expect(t1Statuses).toEqual(['running', 'done']);
  });

  it('skips downstream of a failed node but runs independent branches', async () => {
    const wf: Workflow = {
      id: 'wf2',
      name: 'fail',
      nodes: [
        { id: 'b1', type: 'boom', position: { x: 0, y: 0 }, config: {} },
        { id: 'o1', type: 'output', position: { x: 200, y: 0 }, config: {} },
        { id: 't1', type: 'text', position: { x: 0, y: 200 }, config: { text: 'ok' } },
      ],
      edges: [{ id: 'e1', source: { nodeId: 'b1', port: 'out' }, target: { nodeId: 'o1', port: 'value' } }],
    };
    const { events, status } = await collect(wf);
    expect(status).toBe('error');
    const statusOf = (id: string) =>
      events
        .filter((e) => e.kind === 'node-status' && e.nodeId === id)
        .map((e) => (e as Extract<ExecutionEvent, { kind: 'node-status' }>).status)
        .at(-1);
    expect(statusOf('b1')).toBe('error');
    expect(statusOf('o1')).toBe('skipped');
    expect(statusOf('t1')).toBe('done');
    expect(events.at(-1)).toEqual({ kind: 'run-finished', runId: 'run1', status: 'error' });
  });

  it('includes the error message on failed node status', async () => {
    const wf: Workflow = {
      id: 'wf3',
      name: 'fail2',
      nodes: [{ id: 'b1', type: 'boom', position: { x: 0, y: 0 }, config: {} }],
      edges: [],
    };
    const { events } = await collect(wf);
    const errEvent = events.find((e) => e.kind === 'node-status' && e.status === 'error');
    expect(errEvent).toMatchObject({ nodeId: 'b1', error: 'boom' });
  });
});
```

- [ ] **Step 2: Chạy test, verify FAIL**

Run: `npm run test -w apps/server`
Expected: FAIL — `Cannot find module '../src/engine'`.

- [ ] **Step 3: Implement src/engine.ts**

```typescript
import type { ExecutionEvent, Workflow, WorkflowEdge } from '@videoflow/shared';
import { getExecutable } from './nodes/registry';

export async function runWorkflow(
  workflow: Workflow,
  runId: string,
  emit: (event: ExecutionEvent) => void,
): Promise<'done' | 'error'> {
  emit({ kind: 'run-started', runId, workflowId: workflow.id });

  const incoming = new Map<string, WorkflowEdge[]>();
  for (const node of workflow.nodes) incoming.set(node.id, []);
  for (const edge of workflow.edges) incoming.get(edge.target.nodeId)?.push(edge);

  const results = new Map<string, Record<string, unknown>>();
  const done = new Set<string>();
  const dead = new Set<string>(); // error hoặc skipped
  let hadError = false;

  const propagateSkips = () => {
    let changed = true;
    while (changed) {
      changed = false;
      for (const node of workflow.nodes) {
        if (done.has(node.id) || dead.has(node.id)) continue;
        if (incoming.get(node.id)!.some((e) => dead.has(e.source.nodeId))) {
          dead.add(node.id);
          emit({ kind: 'node-status', runId, nodeId: node.id, status: 'skipped' });
          changed = true;
        }
      }
    }
  };

  while (true) {
    propagateSkips();
    const wave = workflow.nodes.filter(
      (node) =>
        !done.has(node.id) &&
        !dead.has(node.id) &&
        incoming.get(node.id)!.every((e) => done.has(e.source.nodeId)),
    );
    if (wave.length === 0) break;

    await Promise.all(
      wave.map(async (node) => {
        emit({ kind: 'node-status', runId, nodeId: node.id, status: 'running' });
        try {
          const inputs: Record<string, unknown> = {};
          for (const edge of incoming.get(node.id)!) {
            inputs[edge.target.port] = results.get(edge.source.nodeId)?.[edge.source.port];
          }
          const outputs = await getExecutable(node.type).execute({ config: node.config, inputs });
          results.set(node.id, outputs);
          done.add(node.id);
          emit({ kind: 'node-result', runId, nodeId: node.id, outputs });
          emit({ kind: 'node-status', runId, nodeId: node.id, status: 'done' });
        } catch (err) {
          hadError = true;
          dead.add(node.id);
          emit({
            kind: 'node-status',
            runId,
            nodeId: node.id,
            status: 'error',
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }),
    );
  }

  const status = hadError ? 'error' : 'done';
  emit({ kind: 'run-finished', runId, status });
  return status;
}
```

- [ ] **Step 4: Chạy test, verify PASS**

Run: `npm run test -w apps/server`
Expected: PASS (toàn bộ).

- [ ] **Step 5: Commit**

```bash
git add apps/server/src/engine.ts apps/server/test/engine.test.ts
git commit -m "feat(server): wave-based execution engine with skip propagation"
```

---

### Task 7: REST API + run + WebSocket broadcast

**Files:**
- Modify: `apps/server/src/app.ts`
- Test: `apps/server/test/api.test.ts` (thêm tests)

- [ ] **Step 1: Thêm failing tests vào test/api.test.ts**

Thay toàn bộ file bằng:

```typescript
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
  nodes: [
    { id: 't1', type: 'text', position: { x: 0, y: 0 }, config: { text: 'hello' } },
    { id: 'o1', type: 'output', position: { x: 200, y: 0 }, config: {} },
  ],
  edges: [{ id: 'e1', source: { nodeId: 't1', port: 'text' }, target: { nodeId: 'o1', port: 'value' } }],
};

describe('api', () => {
  let store: WorkflowStore;

  beforeEach(async () => {
    store = new WorkflowStore(await mkdtemp(path.join(tmpdir(), 'vf-')));
  });

  it('GET /health returns ok', async () => {
    const app = buildApp(store);
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ ok: true });
    await app.close();
  });

  it('CRUD workflows', async () => {
    const app = buildApp(store);

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
    const app = buildApp(store);
    let res = await app.inject({ method: 'PUT', url: '/api/workflows/other', payload: demo });
    expect(res.statusCode).toBe(400);
    res = await app.inject({ method: 'PUT', url: '/api/workflows/..%2Fevil', payload: demo });
    expect(res.statusCode).toBe(400);
    await app.close();
  });

  it('POST run returns 404 for unknown workflow', async () => {
    const app = buildApp(store);
    const res = await app.inject({ method: 'POST', url: '/api/workflows/nope/run' });
    expect(res.statusCode).toBe(404);
    await app.close();
  });

  it('POST run broadcasts execution events over /ws', async () => {
    await store.save(demo);
    const app = buildApp(store);
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
    expect(events.some((e) => e.kind === 'node-result' && e.nodeId === 'o1')).toBe(true);

    ws.close();
    await app.close();
  });
});
```

- [ ] **Step 2: Chạy test, verify FAIL**

Run: `npm run test -w apps/server`
Expected: FAIL — buildApp chưa nhận store, các route chưa tồn tại (404).

- [ ] **Step 3: Viết lại src/app.ts**

```typescript
import Fastify, { type FastifyInstance } from 'fastify';
import websocket from '@fastify/websocket';
import { randomUUID } from 'node:crypto';
import type { ExecutionEvent, Workflow } from '@videoflow/shared';
import { WorkflowStore } from './storage';
import { runWorkflow } from './engine';
import { registerBuiltinNodes } from './nodes';

const ID_RE = /^[A-Za-z0-9-]+$/;

export function buildApp(store: WorkflowStore = new WorkflowStore()): FastifyInstance {
  registerBuiltinNodes();
  const app = Fastify();

  const sockets = new Set<{ send(data: string): void }>();
  const broadcast = (event: ExecutionEvent) => {
    const msg = JSON.stringify(event);
    for (const socket of sockets) socket.send(msg);
  };

  app.register(websocket);
  app.register(async (instance) => {
    instance.get('/ws', { websocket: true }, (socket) => {
      sockets.add(socket);
      socket.on('close', () => sockets.delete(socket));
    });
  });

  app.get('/health', async () => ({ ok: true }));

  app.get('/api/workflows', async () => store.list());

  app.get('/api/workflows/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    if (!ID_RE.test(id)) return reply.code(400).send({ error: 'invalid id' });
    const workflow = await store.get(id);
    if (!workflow) return reply.code(404).send({ error: 'not found' });
    return workflow;
  });

  app.put('/api/workflows/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const workflow = req.body as Workflow;
    if (!ID_RE.test(id) || workflow.id !== id) return reply.code(400).send({ error: 'invalid id' });
    await store.save(workflow);
    return workflow;
  });

  app.delete('/api/workflows/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    if (!ID_RE.test(id)) return reply.code(400).send({ error: 'invalid id' });
    await store.delete(id);
    return reply.code(204).send();
  });

  app.post('/api/workflows/:id/run', async (req, reply) => {
    const { id } = req.params as { id: string };
    if (!ID_RE.test(id)) return reply.code(400).send({ error: 'invalid id' });
    const workflow = await store.get(id);
    if (!workflow) return reply.code(404).send({ error: 'not found' });
    const runId = randomUUID();
    void runWorkflow(workflow, runId, broadcast).catch((err) => app.log.error(err));
    return { runId };
  });

  return app;
}
```

- [ ] **Step 4: Chạy test, verify PASS**

Run: `npm run test -w apps/server`
Expected: PASS toàn bộ.

- [ ] **Step 5: Typecheck + smoke test server thật**

Run: `npm run typecheck -w apps/server`
Expected: PASS.

Run: `npm run dev:server` (để chạy nền), rồi `curl -s http://127.0.0.1:3001/health`
Expected: `{"ok":true}`. Dừng server sau khi check.

- [ ] **Step 6: Commit**

```bash
git add apps/server/src/app.ts apps/server/test/api.test.ts
git commit -m "feat(server): workflow CRUD, run endpoint, websocket event broadcast"
```

---

### Task 8: Web scaffold — Vite + React Flow canvas

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/vite.config.ts`
- Create: `apps/web/index.html`
- Create: `apps/web/src/main.tsx`
- Create: `apps/web/src/App.tsx`
- Create: `apps/web/src/index.css`

- [ ] **Step 1: Tạo apps/web/package.json**

```json
{
  "name": "@videoflow/web",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@videoflow/shared": "*",
    "@xyflow/react": "^12.3.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.7.0",
    "vite": "^6.0.0",
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 2: Tạo apps/web/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
  },
  "include": ["src", "test"]
}
```

- [ ] **Step 3: Tạo apps/web/vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:3001',
      '/ws': { target: 'ws://127.0.0.1:3001', ws: true },
    },
  },
});
```

- [ ] **Step 4: Tạo apps/web/index.html**

```html
<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>VideoFlow</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Tạo src/main.tsx**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ReactFlowProvider } from '@xyflow/react';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReactFlowProvider>
      <App />
    </ReactFlowProvider>
  </StrictMode>,
);
```

- [ ] **Step 6: Tạo src/App.tsx (canvas trống, sẽ mở rộng ở task sau)**

```tsx
import { useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function App() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((ns) => applyNodeChanges(changes, ns)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((es) => applyEdgeChanges(changes, es)),
    [],
  );

  return (
    <div className="app">
      <main className="canvas">
        <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} fitView>
          <Background />
          <Controls />
        </ReactFlow>
      </main>
    </div>
  );
}
```

- [ ] **Step 7: Tạo src/index.css**

```css
* { box-sizing: border-box; }
html, body, #root { height: 100%; margin: 0; font-family: system-ui, sans-serif; }

.app { display: flex; height: 100%; }
.canvas { flex: 1; }

.palette {
  width: 180px;
  padding: 12px;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.palette h2 { font-size: 14px; margin: 0 0 4px; }
.palette button {
  padding: 8px;
  border: 1px solid #bbb;
  border-radius: 6px;
  background: #fff;
  cursor: grab;
  text-align: left;
}
.palette button:focus-visible { outline: 2px solid #4263eb; outline-offset: 2px; }

.toolbar {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
  display: flex;
  gap: 8px;
  align-items: center;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 8px;
}
.toolbar input, .toolbar select { padding: 6px; }
.toolbar button { padding: 6px 12px; cursor: pointer; }

.vf-node {
  border: 1px solid #999;
  border-radius: 8px;
  background: #fff;
  min-width: 180px;
  font-size: 12px;
}
.vf-node header {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 8px;
  border-bottom: 1px solid #eee;
  font-weight: 600;
}
.vf-node textarea { width: 100%; min-height: 60px; border: 0; padding: 8px; resize: vertical; }
.vf-node pre { margin: 0; padding: 8px; white-space: pre-wrap; word-break: break-word; }

.badge { font-weight: 400; font-size: 11px; padding: 1px 6px; border-radius: 8px; background: #eee; }
.badge.running { background: #fff3bf; }
.badge.done { background: #d3f9d8; }
.badge.error { background: #ffe3e3; }
.badge.skipped { background: #e9ecef; color: #868e96; }
```

- [ ] **Step 8: Install + typecheck + verify canvas chạy**

Run: `npm install && npm run typecheck -w apps/web`
Expected: PASS.

Run: `npm run dev:web`, mở `http://localhost:5173`
Expected: thấy canvas React Flow trống (nền chấm, nút zoom). Dừng server sau khi check.

- [ ] **Step 9: Commit**

```bash
git add apps/web package-lock.json
git commit -m "feat(web): vite + react flow canvas scaffold"
```

---

### Task 9: Custom nodes + palette + typed connection validation

**Files:**
- Create: `apps/web/src/flow/types.ts`
- Create: `apps/web/src/flow/validation.ts`
- Create: `apps/web/src/flow/nodes/TextNode.tsx`
- Create: `apps/web/src/flow/nodes/OutputNode.tsx`
- Create: `apps/web/src/Palette.tsx`
- Modify: `apps/web/src/App.tsx`
- Test: `apps/web/test/validation.test.ts`

- [ ] **Step 1: Viết failing test cho validation**

`apps/web/test/validation.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { canConnect } from '../src/flow/validation';

describe('canConnect', () => {
  it('allows text output → any input', () => {
    expect(canConnect('text', 'text', 'output', 'value')).toBe(true);
  });

  it('rejects unknown node types or ports', () => {
    expect(canConnect('nope', 'text', 'output', 'value')).toBe(false);
    expect(canConnect('text', 'nope', 'output', 'value')).toBe(false);
    expect(canConnect('text', 'text', 'output', 'nope')).toBe(false);
  });

  it('rejects mismatched data types', () => {
    // node 'text' không có input port nào nhận text → tự nối vào chính nó là invalid
    expect(canConnect('text', 'text', 'text', 'text')).toBe(false);
  });
});
```

- [ ] **Step 2: Chạy test, verify FAIL**

Run: `npm run test -w apps/web`
Expected: FAIL — module not found.

- [ ] **Step 3: Tạo src/flow/types.ts và src/flow/validation.ts**

`src/flow/types.ts`:

```typescript
import type { Node } from '@xyflow/react';
import type { NodeStatus } from '@videoflow/shared';

export type FlowNodeData = {
  config: Record<string, unknown>;
  status?: NodeStatus;
  result?: Record<string, unknown>;
};

export type FlowNode = Node<FlowNodeData>;
```

`src/flow/validation.ts`:

```typescript
import { NODE_DEFINITIONS } from '@videoflow/shared';

export function canConnect(
  sourceType: string,
  sourcePort: string,
  targetType: string,
  targetPort: string,
): boolean {
  const source = NODE_DEFINITIONS[sourceType]?.outputs.find((p) => p.id === sourcePort);
  const target = NODE_DEFINITIONS[targetType]?.inputs.find((p) => p.id === targetPort);
  if (!source || !target) return false;
  return target.dataType === 'any' || source.dataType === target.dataType;
}
```

- [ ] **Step 4: Chạy test, verify PASS**

Run: `npm run test -w apps/web`
Expected: PASS (3 tests).

- [ ] **Step 5: Tạo custom node components**

`src/flow/nodes/TextNode.tsx` (textarea có `aria-label`; class `nodrag` để gõ không bị kéo node):

```tsx
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react';
import type { FlowNode } from '../types';

export function TextNode({ id, data }: NodeProps<FlowNode>) {
  const { updateNodeData } = useReactFlow();
  const text = typeof data.config.text === 'string' ? data.config.text : '';
  return (
    <div className="vf-node">
      <header>
        Text
        {data.status && <span className={`badge ${data.status}`}>{data.status}</span>}
      </header>
      <textarea
        aria-label="Nội dung text"
        className="nodrag"
        value={text}
        onChange={(e) => updateNodeData(id, { config: { ...data.config, text: e.target.value } })}
      />
      <Handle type="source" position={Position.Right} id="text" />
    </div>
  );
}
```

`src/flow/nodes/OutputNode.tsx`:

```tsx
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { FlowNode } from '../types';

export function OutputNode({ data }: NodeProps<FlowNode>) {
  return (
    <div className="vf-node">
      <header>
        Output
        {data.status && <span className={`badge ${data.status}`}>{data.status}</span>}
      </header>
      <pre>{data.result ? JSON.stringify(data.result.value, null, 2) : '—'}</pre>
      <Handle type="target" position={Position.Left} id="value" />
    </div>
  );
}
```

- [ ] **Step 6: Tạo src/Palette.tsx**

Button vừa kéo được (drag) vừa click được (thêm node vào giữa canvas — dùng được bằng bàn phím):

```tsx
import { NODE_DEFINITIONS } from '@videoflow/shared';

export function Palette({ onAdd }: { onAdd: (type: string) => void }) {
  return (
    <aside className="palette" aria-label="Danh sách node">
      <h2>Nodes</h2>
      {Object.values(NODE_DEFINITIONS).map((def) => (
        <button
          key={def.type}
          draggable
          onDragStart={(e) => e.dataTransfer.setData('application/videoflow', def.type)}
          onClick={() => onAdd(def.type)}
        >
          {def.label}
        </button>
      ))}
    </aside>
  );
}
```

- [ ] **Step 7: Viết lại src/App.tsx — nối palette, custom nodes, drag-drop, validation**

```tsx
import { useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
  type Edge,
  type Connection,
  type NodeChange,
  type EdgeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Palette } from './Palette';
import { TextNode } from './flow/nodes/TextNode';
import { OutputNode } from './flow/nodes/OutputNode';
import { canConnect } from './flow/validation';
import type { FlowNode } from './flow/types';

const nodeTypes = { text: TextNode, output: OutputNode };

export default function App() {
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const { screenToFlowPosition } = useReactFlow();

  const onNodesChange = useCallback(
    (changes: NodeChange<FlowNode>[]) => setNodes((ns) => applyNodeChanges(changes, ns)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((es) => applyEdgeChanges(changes, es)),
    [],
  );
  const onConnect = useCallback((conn: Connection) => setEdges((es) => addEdge(conn, es)), []);

  const isValidConnection = useCallback(
    (conn: Connection | Edge) => {
      const source = nodes.find((n) => n.id === conn.source);
      const target = nodes.find((n) => n.id === conn.target);
      if (!source?.type || !target?.type) return false;
      return canConnect(source.type, conn.sourceHandle ?? '', target.type, conn.targetHandle ?? '');
    },
    [nodes],
  );

  const addNode = useCallback((type: string, position: { x: number; y: number }) => {
    setNodes((ns) => [...ns, { id: crypto.randomUUID(), type, position, data: { config: {} } }]);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('application/videoflow');
      if (!type) return;
      addNode(type, screenToFlowPosition({ x: e.clientX, y: e.clientY }));
    },
    [addNode, screenToFlowPosition],
  );

  return (
    <div className="app">
      <Palette onAdd={(type) => addNode(type, screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 }))} />
      <main className="canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          isValidConnection={isValidConnection}
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </main>
    </div>
  );
}
```

- [ ] **Step 8: Typecheck + verify bằng tay**

Run: `npm run typecheck -w apps/web && npm run dev:web`, mở `http://localhost:5173`

Checklist verify:
- Kéo "Text" và "Output" từ palette thả vào canvas → node hiện đúng vị trí thả.
- Click button trong palette → node thêm vào giữa canvas.
- Gõ được vào textarea của Text node (không bị kéo node khi gõ/chọn text).
- Kéo dây từ port phải của Text → port trái của Output: nối được.
- Kéo dây từ port phải của Text này → port phải của Text khác: KHÔNG nối được.

- [ ] **Step 9: Commit**

```bash
git add apps/web/src apps/web/test
git commit -m "feat(web): palette, custom nodes, typed connection validation"
```

---

### Task 10: Save/load workflow qua API

**Files:**
- Create: `apps/web/src/api.ts`
- Create: `apps/web/src/flow/mapping.ts`
- Modify: `apps/web/src/App.tsx`
- Test: `apps/web/test/mapping.test.ts`

- [ ] **Step 1: Viết failing test cho mapping**

`apps/web/test/mapping.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import type { Workflow } from '@videoflow/shared';
import { toFlow, fromFlow } from '../src/flow/mapping';

const wf: Workflow = {
  id: 'w1',
  name: 'demo',
  nodes: [
    { id: 't1', type: 'text', position: { x: 0, y: 0 }, config: { text: 'hi' } },
    { id: 'o1', type: 'output', position: { x: 200, y: 0 }, config: {} },
  ],
  edges: [{ id: 'e1', source: { nodeId: 't1', port: 'text' }, target: { nodeId: 'o1', port: 'value' } }],
};

describe('mapping', () => {
  it('round-trips workflow → flow → workflow', () => {
    const { nodes, edges } = toFlow(wf);
    expect(fromFlow('w1', 'demo', nodes, edges)).toEqual(wf);
  });

  it('toFlow maps ports to handles', () => {
    const { edges } = toFlow(wf);
    expect(edges[0]).toMatchObject({ source: 't1', sourceHandle: 'text', target: 'o1', targetHandle: 'value' });
  });
});
```

- [ ] **Step 2: Chạy test, verify FAIL**

Run: `npm run test -w apps/web`
Expected: FAIL — module not found.

- [ ] **Step 3: Tạo src/flow/mapping.ts**

```typescript
import type { Edge } from '@xyflow/react';
import type { Workflow } from '@videoflow/shared';
import type { FlowNode } from './types';

export function toFlow(workflow: Workflow): { nodes: FlowNode[]; edges: Edge[] } {
  return {
    nodes: workflow.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: { config: n.config },
    })),
    edges: workflow.edges.map((e) => ({
      id: e.id,
      source: e.source.nodeId,
      sourceHandle: e.source.port,
      target: e.target.nodeId,
      targetHandle: e.target.port,
    })),
  };
}

export function fromFlow(id: string, name: string, nodes: FlowNode[], edges: Edge[]): Workflow {
  return {
    id,
    name,
    nodes: nodes.map((n) => ({
      id: n.id,
      type: n.type ?? 'text',
      position: { x: n.position.x, y: n.position.y },
      config: n.data.config,
    })),
    edges: edges.map((e) => ({
      id: e.id,
      source: { nodeId: e.source, port: e.sourceHandle ?? '' },
      target: { nodeId: e.target, port: e.targetHandle ?? '' },
    })),
  };
}
```

- [ ] **Step 4: Chạy test, verify PASS**

Run: `npm run test -w apps/web`
Expected: PASS.

- [ ] **Step 5: Tạo src/api.ts**

```typescript
import type { Workflow } from '@videoflow/shared';

async function asJson<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}

export const listWorkflows = (): Promise<Workflow[]> =>
  fetch('/api/workflows').then((r) => asJson<Workflow[]>(r));

export const saveWorkflow = (workflow: Workflow): Promise<Workflow> =>
  fetch(`/api/workflows/${workflow.id}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(workflow),
  }).then((r) => asJson<Workflow>(r));

export const startRun = (id: string): Promise<{ runId: string }> =>
  fetch(`/api/workflows/${id}/run`, { method: 'POST' }).then((r) => asJson<{ runId: string }>(r));
```

- [ ] **Step 6: Thêm toolbar save/load vào App.tsx**

Thêm vào `App.tsx` (giữ nguyên phần Task 9, chỉ thêm phần dưới):

Imports mới:

```tsx
import { useEffect, useMemo } from 'react'; // gộp vào dòng import react hiện có
import type { Workflow } from '@videoflow/shared';
import { listWorkflows, saveWorkflow } from './api';
import { toFlow, fromFlow } from './flow/mapping';
```

State + handlers mới (đặt trong component `App`):

```tsx
const [workflowId, setWorkflowId] = useState<string>(() => crypto.randomUUID());
const [name, setName] = useState('Untitled');
const [saved, setSaved] = useState<Workflow[]>([]);

useEffect(() => {
  listWorkflows().then(setSaved).catch(() => setSaved([]));
}, []);

const handleSave = async () => {
  const workflow = fromFlow(workflowId, name, nodes, edges);
  await saveWorkflow(workflow);
  setSaved(await listWorkflows());
};

const handleLoad = (id: string) => {
  const workflow = saved.find((w) => w.id === id);
  if (!workflow) return;
  const flow = toFlow(workflow);
  setWorkflowId(workflow.id);
  setName(workflow.name);
  setNodes(flow.nodes);
  setEdges(flow.edges);
};
```

Toolbar JSX (đặt trong `<main className="canvas">`, trước `<ReactFlow>`):

```tsx
<div className="toolbar">
  <label>
    Tên workflow{' '}
    <input value={name} onChange={(e) => setName(e.target.value)} />
  </label>
  <button onClick={handleSave}>Save</button>
  <label>
    Mở{' '}
    <select value="" onChange={(e) => handleLoad(e.target.value)}>
      <option value="" disabled>
        — chọn workflow —
      </option>
      {saved.map((w) => (
        <option key={w.id} value={w.id}>
          {w.name}
        </option>
      ))}
    </select>
  </label>
</div>
```

- [ ] **Step 7: Verify bằng tay**

Chạy cả hai: `npm run dev:server` và `npm run dev:web`, mở `http://localhost:5173`.

Checklist:
- Tạo workflow Text → Output, đặt tên, bấm Save → không lỗi console.
- Reload trang, chọn workflow trong dropdown "Mở" → canvas khôi phục đúng node, vị trí, nội dung textarea, dây nối.

- [ ] **Step 8: Commit**

```bash
git add apps/web/src apps/web/test
git commit -m "feat(web): save/load workflows via REST API"
```

---

### Task 11: Run + realtime status qua WebSocket

**Files:**
- Create: `apps/web/src/useExecution.ts`
- Modify: `apps/web/src/App.tsx`

- [ ] **Step 1: Tạo src/useExecution.ts**

WebSocket là external system → dùng `useEffect` với cleanup là đúng chuẩn (theo quy tắc react của repo).

```typescript
import { useEffect, useState } from 'react';
import type { ExecutionEvent, NodeStatus } from '@videoflow/shared';

export function useExecution() {
  const [statuses, setStatuses] = useState<Record<string, NodeStatus>>({});
  const [results, setResults] = useState<Record<string, Record<string, unknown>>>({});
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(`ws://${location.host}/ws`);
    ws.onmessage = (msg) => {
      const event = JSON.parse(msg.data as string) as ExecutionEvent;
      switch (event.kind) {
        case 'run-started':
          setStatuses({});
          setResults({});
          setRunning(true);
          break;
        case 'node-status':
          setStatuses((s) => ({ ...s, [event.nodeId]: event.status }));
          break;
        case 'node-result':
          setResults((r) => ({ ...r, [event.nodeId]: event.outputs }));
          break;
        case 'run-finished':
          setRunning(false);
          break;
      }
    };
    return () => ws.close();
  }, []);

  return { statuses, results, running };
}
```

- [ ] **Step 2: Nối vào App.tsx**

Imports mới:

```tsx
import { startRun } from './api'; // gộp vào dòng import từ './api'
import { useExecution } from './useExecution';
```

Trong component `App`:

```tsx
const { statuses, results, running } = useExecution();

const displayNodes = useMemo(
  () =>
    nodes.map((n) => ({
      ...n,
      data: { ...n.data, status: statuses[n.id], result: results[n.id] },
    })),
  [nodes, statuses, results],
);

const handleRun = async () => {
  await handleSave();
  await startRun(workflowId);
};
```

Đổi prop `nodes={nodes}` của `<ReactFlow>` thành `nodes={displayNodes}` (giữ nguyên `onNodesChange` — changes vẫn apply vào state `nodes` gốc).

Thêm vào toolbar (sau nút Save):

```tsx
<button onClick={handleRun} disabled={running}>
  {running ? 'Đang chạy…' : 'Run'}
</button>
<span role="status" aria-live="polite">
  {running ? 'Workflow đang chạy' : ''}
</span>
```

- [ ] **Step 3: Typecheck + test toàn bộ**

Run: `npm run typecheck && npm run test`
Expected: PASS toàn bộ ở cả 3 workspace.

- [ ] **Step 4: Verify end-to-end bằng tay (tiêu chí hoàn thành Giai đoạn 1)**

Chạy `npm run dev:server` + `npm run dev:web`, mở `http://localhost:5173`:

1. Kéo node Text, gõ "xin chào VideoFlow".
2. Kéo node Output, nối Text → Output.
3. Bấm Run.
4. Expected: badge node Text chuyển `running` → `done`, rồi node Output `running` → `done`, và Output hiển thị `"xin chào VideoFlow"`.
5. Reload trang, mở lại workflow từ dropdown, Run lại → vẫn hoạt động.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src
git commit -m "feat(web): run workflow with realtime node status over websocket"
```

---

## Definition of Done (Giai đoạn 1)

- `npm run test` pass toàn bộ (server: storage, nodes, engine, API+WS; web: validation, mapping).
- `npm run typecheck` pass toàn bộ.
- Demo end-to-end ở Task 11 Step 4 chạy đúng.
- Spec coverage Giai đoạn 1 (spec §8.1): monorepo ✓ (Task 1-2), canvas kéo thả/nối/save ✓ (Task 8-10), typed ports + chặn nối sai kiểu ✓ (Task 9), engine `text → output` ✓ (Task 5-6), realtime qua WebSocket ✓ (Task 7, 11).
