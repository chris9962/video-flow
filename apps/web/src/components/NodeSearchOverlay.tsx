import { useEffect, useMemo, useRef, useState } from 'react';
import { BLOCK_DEFINITIONS, type NodeTemplate } from '@videoflow/shared';

const TYPE_LABEL: Record<string, string> = {
  text: 'Text',
  image: 'Ảnh',
  video: 'Video',
  kling: 'Kling',
  'kling-edit': 'Kling Edit',
  faceswap: 'Face Swap',
};
const ALIAS: Record<string, string> = {
  text: 'text van ban prompt',
  image: 'image anh hinh picture',
  video: 'video clip phim flow',
  kling: 'kling video fal tao video',
  'kling-edit': 'kling edit video to video doi nen swap',
  faceswap: 'face swap doi mat pixverse',
};

type Entry = NodeTemplate & { isDefault?: boolean };

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// 3 block mặc định luôn có trong search (1 node, config rỗng → thêm block trống như kéo từ palette)
const DEFAULT_NODES: Entry[] = Object.values(BLOCK_DEFINITIONS).map((d) => ({
  id: `default-${d.type}`,
  name: d.label,
  nodes: [{ id: 'n', type: d.type, position: { x: 0, y: 0 }, config: {} }],
  edges: [],
  isDefault: true,
}));

const firstType = (t: NodeTemplate) => t.nodes[0]?.type ?? 'text';
const badge = (t: NodeTemplate) =>
  t.nodes.length > 1 ? `Nhóm ${t.nodes.length}` : (TYPE_LABEL[firstType(t)] ?? firstType(t));
const searchText = (e: Entry) =>
  norm(e.isDefault ? `${e.name} ${ALIAS[firstType(e)] ?? ''}` : e.name);

// Mô tả ngắn cho block mặc định; node mẫu thì trích nội dung prompt (hữu ích nhất khi chọn)
const SHORT_DESC: Record<string, string> = {
  text: 'Prompt / văn bản · thành AI agent khi nối input',
  image: 'Ảnh nguồn · tạo / ghép ảnh khi nối input',
  video: 'Video nguồn · tạo video qua Google Flow',
  kling: 'Tạo video Kling (fal.ai): Start · Prompt · End',
  'kling-edit': 'Đổi nền / nhân vật / style từ 1 video mẫu (Kling O1)',
  faceswap: 'Đổi mặt trong video bằng 1 ảnh mặt (Pixverse)',
};
const entryDesc = (e: Entry): string => {
  if (e.isDefault) return SHORT_DESC[firstType(e)] ?? '';
  if (e.nodes.length === 1) {
    const content = e.nodes[0]?.config?.content;
    if (typeof content === 'string' && content.trim()) return content.replace(/\s+/g, ' ').trim();
  }
  return e.category ?? `Nhóm ${e.nodes.length} block`;
};

/**
 * Overlay tìm node (command palette). Mở khi gõ chữ lúc không focus ô nào.
 * Gồm 3 block mặc định + node mẫu (1 node hoặc cả nhóm). Gõ lọc, ↑/↓ chọn, Enter thêm, Esc đóng.
 */
export function NodeSearchOverlay({
  templates,
  initialQuery,
  onPick,
  onClose,
}: {
  templates: NodeTemplate[];
  initialQuery: string;
  onPick: (template: NodeTemplate) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, []);

  const results = useMemo(() => {
    const all: Entry[] = [...DEFAULT_NODES, ...templates];
    const q = norm(query.trim());
    return (q ? all.filter((e) => searchText(e).includes(q)) : all).slice(0, 50);
  }, [templates, query]);

  useEffect(() => {
    setActive((a) => Math.min(a, Math.max(0, results.length - 1)));
  }, [results.length]);

  const pick = (t: Entry | undefined) => {
    if (t) onPick(t);
  };

  return (
    <div className="palette-overlay" role="dialog" aria-modal="true" aria-label="Tìm node" onMouseDown={onClose}>
      <div className="palette-box" onMouseDown={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="palette-input"
          type="text"
          aria-label="Tìm node theo tên"
          placeholder="Tìm node (block mặc định + node mẫu)… Enter để thêm, Esc để đóng"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, results.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === 'Enter') {
              e.preventDefault();
              pick(results[active]);
            } else if (e.key === 'Escape') {
              e.preventDefault();
              onClose();
            }
          }}
        />
        <ul className="palette-list" role="listbox" aria-label="Kết quả tìm node">
          {results.length === 0 ? (
            <li className="palette-empty">Không tìm thấy node khớp.</li>
          ) : (
            results.map((t, i) => (
              <li key={t.id} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  className={`palette-item${i === active ? ' is-active' : ''}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(t)}
                >
                  <span className="palette-kind" data-type={t.nodes.length > 1 ? 'any' : firstType(t)}>
                    {badge(t)}
                  </span>
                  <span className="palette-text">
                    <span className="palette-name">{t.name}</span>
                    {entryDesc(t) && <span className="palette-desc">{entryDesc(t)}</span>}
                  </span>
                  {t.isDefault && <span className="palette-default">mặc định</span>}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
