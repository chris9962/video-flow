import Fastify, { type FastifyInstance } from 'fastify';
import websocket from '@fastify/websocket';
import { randomUUID } from 'node:crypto';
import type { ExecutionEvent, Workflow } from '@videoflow/shared';
import { WorkflowStore } from './storage';
import { runWorkflow, type RunOptions } from './engine';
import { registerBuiltinNodes } from './nodes';
import { bootstrapBrowserServices } from './services/bootstrap-browser';
import { bootstrapMediaServices } from './services/bootstrap-media';
import { registerBrowserRoutes } from './routes/browser';
import { registerMediaRoutes } from './routes/media';
import { registerTemplateRoutes } from './routes/templates';
import { registerNodeTemplateRoutes } from './routes/node-templates';
import { registerAiRoutes } from './routes/ai';

const ID_RE = /^[A-Za-z0-9-]+$/;

export function buildApp(
  store: WorkflowStore = new WorkflowStore(),
  runOptions: RunOptions = {},
): FastifyInstance {
  registerBuiltinNodes();
  bootstrapBrowserServices();
  bootstrapMediaServices();
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

  registerBrowserRoutes(app);
  registerMediaRoutes(app);
  registerTemplateRoutes(app, store);
  registerNodeTemplateRoutes(app);
  registerAiRoutes(app);

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

  // AbortController cho mỗi run đang chạy → nút Stop hủy được
  const running = new Map<string, AbortController>();

  app.post('/api/workflows/:id/run', async (req, reply) => {
    const { id } = req.params as { id: string };
    if (!ID_RE.test(id)) return reply.code(400).send({ error: 'invalid id' });
    const workflow = await store.get(id);
    if (!workflow) return reply.code(404).send({ error: 'not found' });
    const from = (req.body as { from?: string | string[] } | undefined)?.from;
    const startNodeIds = Array.isArray(from)
      ? from.filter((x): x is string => typeof x === 'string')
      : typeof from === 'string'
        ? [from]
        : undefined;
    const runId = randomUUID();
    const controller = new AbortController();
    running.set(runId, controller);
    void runWorkflow(workflow, runId, broadcast, {
      ...runOptions,
      signal: controller.signal,
      startNodeIds,
    })
      .then(async ({ contents }) => {
        if (Object.keys(contents).length === 0) return;
        // Apply-back: kết quả generate đè vào content của block trong workflow đã lưu
        const latest = (await store.get(id)) ?? workflow;
        for (const node of latest.nodes) {
          if (node.id in contents) node.config = { ...node.config, content: contents[node.id] };
        }
        await store.save(latest);
      })
      .catch((err) => app.log.error(err))
      .finally(() => running.delete(runId));
    return { runId };
  });

  app.post('/api/runs/:runId/stop', async (req, reply) => {
    const { runId } = req.params as { runId: string };
    const controller = running.get(runId);
    if (!controller) return reply.code(404).send({ error: 'run không còn chạy' });
    controller.abort();
    return { ok: true };
  });

  return app;
}
