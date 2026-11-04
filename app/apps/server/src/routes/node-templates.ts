import type { FastifyInstance } from 'fastify';
import type { NodeTemplate } from '@videoflow/shared';
import { NodeTemplateStore } from '../node-templates';
import { isBuiltinId } from '../builtin-node-templates';

const ID_RE = /^[A-Za-z0-9-]+$/;

export function registerNodeTemplateRoutes(app: FastifyInstance): void {
  const store = new NodeTemplateStore();

  app.get('/api/node-templates', async () => store.list());

  app.get('/api/node-templates/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    if (!ID_RE.test(id)) return reply.code(400).send({ error: 'invalid id' });
    const t = await store.get(id);
    if (!t) return reply.code(404).send({ error: 'not found' });
    return t;
  });

  app.post('/api/node-templates', async (req, reply) => {
    const body = req.body as Partial<NodeTemplate>;
    if (!body?.nodes || body.nodes.length === 0) return reply.code(400).send({ error: 'thiếu nodes' });
    return store.create({ name: body.name ?? '', nodes: body.nodes, edges: body.edges ?? [] });
  });

  app.put('/api/node-templates/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = req.body as NodeTemplate;
    if (!ID_RE.test(id) || body.id !== id) return reply.code(400).send({ error: 'invalid id' });
    if (isBuiltinId(id)) return reply.code(403).send({ error: 'node mẫu có sẵn không sửa được' });
    return store.update(body);
  });

  app.delete('/api/node-templates/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    if (!ID_RE.test(id)) return reply.code(400).send({ error: 'invalid id' });
    if (isBuiltinId(id)) return reply.code(403).send({ error: 'node mẫu có sẵn không xoá được' });
    await store.delete(id);
    return reply.code(204).send();
  });
}
