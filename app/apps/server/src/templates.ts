import { readFile, readdir } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import type { Workflow } from '@videoflow/shared';

// Template ship kèm app, nằm trong source (KHÔNG để trong data/ vốn là dữ liệu user).
// templates.ts ở apps/server/src → templates/ ở apps/server cạnh src
const defaultDir = path.join(import.meta.dirname, '..', 'templates');

/** Workflow shape + mô tả hiển thị cho người dùng chọn template */
export interface Template extends Workflow {
  description?: string;
}

export interface TemplateSummary {
  id: string;
  name: string;
  description?: string;
}

export class TemplateStore {
  constructor(private readonly dir: string = defaultDir) {}

  private async load(): Promise<Template[]> {
    const files = (await readdir(this.dir)).filter((f) => f.endsWith('.json'));
    return Promise.all(
      files.map(async (f) => JSON.parse(await readFile(path.join(this.dir, f), 'utf8')) as Template),
    );
  }

  async list(): Promise<TemplateSummary[]> {
    const templates = await this.load();
    return templates.map((t) => ({ id: t.id, name: t.name, description: t.description }));
  }

  async get(id: string): Promise<Template | null> {
    const templates = await this.load();
    return templates.find((t) => t.id === id) ?? null;
  }

  /** Tạo workflow độc lập từ template: toàn bộ id (workflow/node/edge) sinh mới để bản sao không dính id template */
  async instantiate(id: string): Promise<Workflow | null> {
    const template = await this.get(id);
    if (!template) return null;
    const idMap = new Map(template.nodes.map((n) => [n.id, randomUUID()]));
    return {
      id: randomUUID(),
      name: template.name,
      nodes: template.nodes.map((n) => ({ ...n, id: idMap.get(n.id)! })),
      edges: template.edges.map((e) => ({
        id: randomUUID(),
        source: { ...e.source, nodeId: idMap.get(e.source.nodeId)! },
        target: { ...e.target, nodeId: idMap.get(e.target.nodeId)! },
      })),
    };
  }
}
