import type { FastifyInstance } from 'fastify';
import { getPilot, type LlmProvider } from '../services';

// Site web (không phải LLM) cho user đăng nhập tay để automation dùng credit của họ
const SITE_URLS: Record<string, string> = {
  kling: 'https://kling.ai/app/',
  flow: 'https://labs.google/fx/tools/flow',
  grok: 'https://grok.com/imagine',
};

export function registerBrowserRoutes(app: FastifyInstance): void {
  app.post('/api/browser/login/:provider', async (req, reply) => {
    const { provider } = req.params as { provider: string };
    if (provider !== 'chatgpt' && provider !== 'claude' && provider !== 'gemini') {
      return reply.code(400).send({ error: 'provider không hợp lệ' });
    }
    await getPilot().openLogin(provider as LlmProvider);
    return { ok: true };
  });

  app.post('/api/browser/open-site/:site', async (req, reply) => {
    const { site } = req.params as { site: string };
    const url = SITE_URLS[site];
    if (!url) return reply.code(400).send({ error: 'site không hợp lệ' });
    await getPilot().openSite(url);
    return { ok: true };
  });
}
