import type { FastifyInstance } from 'fastify';
import { aiBuild, getChatHistory, type AiBuildRequest } from '../services/ai-builder';

const ID_RE = /^[A-Za-z0-9-]+$/;

export function registerAiRoutes(app: FastifyInstance): void {
  app.post('/api/ai/build', async (req, reply) => {
    const body = req.body as Partial<AiBuildRequest>;
    if (typeof body?.message !== 'string' || !body.message.trim()) {
      return reply.code(400).send({ error: 'message rỗng' });
    }
    const workflow = body.workflow ?? { nodes: [], edges: [] };
    const selectedNodeIds = Array.isArray(body.selectedNodeIds)
      ? body.selectedNodeIds.filter((x): x is string => typeof x === 'string')
      : undefined;
    try {
      return await aiBuild({
        message: body.message,
        workflow,
        attachments: body.attachments,
        workflowId: body.workflowId,
        selectedNodeIds,
      });
    } catch (err) {
      return reply.code(502).send({ error: err instanceof Error ? err.message : 'AI lỗi' });
    }
  });

  // Lịch sử chat của 1 workflow (SDK lưu session, ta chỉ map workflow→sessionId rồi getSessionMessages)
  app.get('/api/ai/chat/:workflowId', async (req, reply) => {
    const { workflowId } = req.params as { workflowId: string };
    if (!ID_RE.test(workflowId)) return reply.code(400).send({ error: 'invalid id' });
    try {
      return { messages: await getChatHistory(workflowId) };
    } catch {
      return { messages: [] };
    }
  });
}
