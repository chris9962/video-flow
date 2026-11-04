import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { NodeTemplate } from '@videoflow/shared';

// Prompt mẫu ship kèm app (trích từ sheet cộng đồng "Ông Chú MMO") → mỗi prompt là 1 node text NGUỒN
// (content = prompt) để kéo vào flow rồi nối sang block ảnh/video. Read-only, không nằm trong data/.
interface PresetItem {
  name: string;
  prompt: string;
  note?: string;
}
interface PresetCategory {
  key: string;
  label: string;
  short: string;
  items: PresetItem[];
}

const presetsFile = path.join(import.meta.dirname, 'data', 'prompt-presets.json');
const categories: PresetCategory[] = JSON.parse(readFileSync(presetsFile, 'utf8'));

const pad = (n: number): string => String(n).padStart(2, '0');

// id ổn định 'builtin-<key>-<NN>' (chỉ chữ/số/gạch → khớp ID_RE của route, và prefix để FE nhận read-only)
export const BUILTIN_NODE_TEMPLATES: NodeTemplate[] = categories.flatMap((cat) =>
  cat.items.map((item, i) => ({
    id: `builtin-${cat.key}-${pad(i + 1)}`,
    name: item.name,
    builtin: true,
    category: cat.label,
    nodes: [{ id: 'n', type: 'text', position: { x: 0, y: 0 }, config: { content: item.prompt } }],
    edges: [],
  })),
);

export const isBuiltinId = (id: string): boolean => id.startsWith('builtin-');
export const getBuiltinTemplate = (id: string): NodeTemplate | undefined =>
  BUILTIN_NODE_TEMPLATES.find((t) => t.id === id);
