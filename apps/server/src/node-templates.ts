import { mkdir, readFile, readdir, writeFile, rm } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import type { NodeTemplate, WorkflowEdge, WorkflowNode } from '@videoflow/shared';
import { BUILTIN_NODE_TEMPLATES, getBuiltinTemplate, isBuiltinId } from './builtin-node-templates';

// Node mẫu do USER tạo → để trong data/ (gitignore). 3 cấp lên là root repo.
const defaultDir = path.join(import.meta.dirname, '..', '..', '..', 'data', 'node-templates');

// Shape cũ {type, config} → sub-flow 1 node (tương thích ngược file đã lưu trước đây)
interface LegacyTemplate {
  id: string;
  name: string;
  type?: string;
  config?: Record<string, unknown>;
  nodes?: WorkflowNode[];
  edges?: WorkflowEdge[];
}

function migrate(raw: LegacyTemplate): NodeTemplate {
  if (raw.nodes) return { id: raw.id, name: raw.name, nodes: raw.nodes, edges: raw.edges ?? [] };
  return {
    id: raw.id,
    name: raw.name,
    nodes: [{ id: randomUUID(), type: raw.type ?? 'text', position: { x: 0, y: 0 }, config: raw.config ?? {} }],
    edges: [],
  };
}

export class NodeTemplateStore {
  constructor(private readonly dir: string = defaultDir) {}

  private file(id: string): string {
    return path.join(this.dir, `${id}.json`);
  }

  async list(): Promise<NodeTemplate[]> {
    await mkdir(this.dir, { recursive: true });
    const files = (await readdir(this.dir)).filter((f) => f.endsWith('.json'));
    const user = await Promise.all(
      files.map(async (f) => migrate(JSON.parse(await readFile(path.join(this.dir, f), 'utf8')))),
    );
    // Node của user lên đầu; builtin giữ thứ tự catalog (đã nhóm theo loại) ở dưới
    return [...user.sort((a, b) => a.name.localeCompare(b.name, 'vi')), ...BUILTIN_NODE_TEMPLATES];
  }

  async get(id: string): Promise<NodeTemplate | null> {
    if (isBuiltinId(id)) return getBuiltinTemplate(id) ?? null;
    try {
      return migrate(JSON.parse(await readFile(this.file(id), 'utf8')));
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw err;
    }
  }

  async create(input: { name: string; nodes: WorkflowNode[]; edges: WorkflowEdge[] }): Promise<NodeTemplate> {
    await mkdir(this.dir, { recursive: true });
    const template: NodeTemplate = {
      id: randomUUID(),
      name: input.name.trim() || 'Node mẫu',
      nodes: input.nodes ?? [],
      edges: input.edges ?? [],
    };
    await writeFile(this.file(template.id), JSON.stringify(template, null, 2));
    return template;
  }

  async update(template: NodeTemplate): Promise<NodeTemplate> {
    if (isBuiltinId(template.id)) throw new Error('Không sửa được node mẫu có sẵn');
    await mkdir(this.dir, { recursive: true });
    const clean: NodeTemplate = {
      id: template.id,
      name: template.name.trim() || 'Node mẫu',
      nodes: template.nodes ?? [],
      edges: template.edges ?? [],
    };
    await writeFile(this.file(clean.id), JSON.stringify(clean, null, 2));
    return clean;
  }

  async delete(id: string): Promise<void> {
    if (isBuiltinId(id)) throw new Error('Không xoá được node mẫu có sẵn');
    await rm(this.file(id), { force: true });
  }
}
