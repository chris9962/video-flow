import type { FastifyInstance } from 'fastify';
import type { WorkflowStore } from '../storage';
import { TemplateStore } from '../templates';

export function registerTemplateRoutes(app: FastifyInstance, store: WorkflowStore): void {
  const templates = new TemplateStore();

  app.get('/api/templates', async () => templates.list());

  app.post('/api/templates/:id/instantiate', async (req, reply) => {
    const { id } = req.params as { id: string };
    const workflow = await templates.instantiate(id);
    if (!workflow) return reply.code(404).send({ error: 'không tìm thấy template' });
    await store.save(workflow);
    return workflow;
  });
}
