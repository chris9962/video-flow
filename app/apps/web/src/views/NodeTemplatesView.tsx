import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
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
import type { NodeTemplate } from '@videoflow/shared';
import { Palette } from '../Palette';
import { TextBlock } from '../flow/nodes/TextBlock';
import { ImageBlock } from '../flow/nodes/ImageBlock';
import { VideoBlock } from '../flow/nodes/VideoBlock';
import { KlingBlock } from '../flow/nodes/KlingBlock';
import { KlingEditBlock } from '../flow/nodes/KlingEditBlock';
import { FaceSwapBlock } from '../flow/nodes/FaceSwapBlock';
import { MotionBlock } from '../flow/nodes/MotionBlock';
import { RestyleBlock } from '../flow/nodes/RestyleBlock';
import { TryOnBlock } from '../flow/nodes/TryOnBlock';
import { AiDancingBlock } from '../flow/nodes/AiDancingBlock';
import { canConnect } from '../flow/validation';
import { toFlow, fromFlow } from '../flow/mapping';
import {
  listNodeTemplates,
  getNodeTemplate,
  createNodeTemplate,
  updateNodeTemplate,
  deleteNodeTemplate,
  uploadAsset,
} from '../api';
import type { FlowNode } from '../flow/types';

const nodeTypes = {
  text: TextBlock,
  image: ImageBlock,
  video: VideoBlock,
  kling: KlingBlock,
  'kling-edit': KlingEditBlock,
  faceswap: FaceSwapBlock,
  motion: MotionBlock,
  restyle: RestyleBlock,
  tryon: TryOnBlock,
  aidancing: AiDancingBlock,
};
const TYPE_LABEL: Record<string, string> = {
  text: 'Text',
  image: 'Ảnh',
  video: 'Video',
  kling: 'Kling',
  'kling-edit': 'Kling Edit',
  faceswap: 'Face Swap',
  motion: 'Trích Prompt',
  restyle: 'GPT 2 bước',
  tryon: 'Ghép mẫu',
  aidancing: 'AI Dancing',
};

const badgeOf = (t: NodeTemplate) =>
  t.nodes.length > 1 ? `Nhóm ${t.nodes.length}` : (TYPE_LABEL[t.nodes[0]?.type] ?? t.nodes[0]?.type ?? '');

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Canvas dựng node mẫu — y như editor (palette, kéo-thả, nối, cấu hình block) nhưng không có Run. */
function NodeTemplateCanvas({
  template,
  onDone,
}: {
  template: NodeTemplate | null;
  onDone: () => void;
}) {
  const seed = useMemo(
    () => (template ? toFlow({ id: '', name: '', nodes: template.nodes, edges: template.edges }) : { nodes: [], edges: [] }),
    [template],
  );
  const [nodes, setNodes] = useState<FlowNode[]>(seed.nodes);
  const [edges, setEdges] = useState<Edge[]>(seed.edges);
  const isBuiltin = !!template?.builtin;
  const [name, setName] = useState(isBuiltin ? `${template?.name} (copy)` : (template?.name ?? 'Node mẫu mới'));
  const [saving, setSaving] = useState(false);
  const { screenToFlowPosition } = useReactFlow();

  const onNodesChange = useCallback(
    (c: NodeChange<FlowNode>[]) => setNodes((ns) => applyNodeChanges(c, ns)),
    [],
  );
  const onEdgesChange = useCallback((c: EdgeChange[]) => setEdges((es) => applyEdgeChanges(c, es)), []);
  const onConnect = useCallback((conn: Connection) => setEdges((es) => addEdge(conn, es)), []);
  const isValidConnection = useCallback(
    (conn: Connection | Edge) => {
      if (conn.source === conn.target) return false;
      const s = nodes.find((n) => n.id === conn.source);
      const t = nodes.find((n) => n.id === conn.target);
      if (!s?.type || !t?.type) return false;
      return canConnect(s.type, t.type, conn.targetHandle);
    },
    [nodes],
  );

  const addNode = useCallback(
    (type: string, position: { x: number; y: number }, config: Record<string, unknown> = {}) =>
      setNodes((ns) => [...ns, { id: crypto.randomUUID(), type, position, data: { config } }]),
    [],
  );

  const blockTypeForFile = (f: File): 'image' | 'video' | null =>
    f.type.startsWith('image/') ? 'image' : f.type.startsWith('video/') ? 'video' : null;

  const onDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const files = Array.from(e.dataTransfer.files).filter((f) => blockTypeForFile(f));
      if (files.length > 0) {
        let off = 0;
        for (const file of files) {
          const ref = await uploadAsset(file);
          addNode(blockTypeForFile(file)!, { x: pos.x + off, y: pos.y + off }, { content: ref });
          off += 36;
        }
        return;
      }
      const type = e.dataTransfer.getData('application/videoflow');
      if (type) addNode(type, pos);
    },
    [addNode, screenToFlowPosition],
  );

  const displayNodes = useMemo(
    () => nodes.map((n) => ({ ...n, data: { ...n.data, hasInput: edges.some((e) => e.target === n.id) } })),
    [nodes, edges],
  );

  const handleSave = async () => {
    const wf = fromFlow(template?.id ?? '', name, nodes, edges);
    if (wf.nodes.length === 0) {
      window.alert('Node mẫu cần ít nhất 1 block.');
      return;
    }
    setSaving(true);
    try {
      // Builtin read-only → lưu là TẠO BẢN SAO của user (fork), không update
      if (template && !isBuiltin) await updateNodeTemplate({ id: template.id, name, nodes: wf.nodes, edges: wf.edges });
      else await createNodeTemplate({ name, nodes: wf.nodes, edges: wf.edges });
      onDone();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="view">
      <div className="view-bar">
        <button className="btn" onClick={onDone}>
          ← Node mẫu
        </button>
        <input
          className="wf-name"
          aria-label="Tên node mẫu"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {isBuiltin && <span className="wf-builtin-tag">có sẵn · lưu sẽ tạo bản sao</span>}
        <span className="spacer" />
        <button className="btn btn-run" onClick={handleSave} disabled={saving}>
          {saving ? 'Đang lưu…' : isBuiltin ? 'Lưu thành node mẫu mới' : 'Lưu node mẫu'}
        </button>
      </div>
      <main className="canvas">
        <Palette
          onAdd={(type) =>
            addNode(type, screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 }))
          }
        />
        {nodes.length === 0 && (
          <div className="canvas-empty">
            <strong>Canvas trống</strong>
            Kéo block vào để dựng node mẫu — 1 block hoặc cả nhóm nối với nhau.
          </div>
        )}
        <ReactFlow
          nodes={displayNodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          isValidConnection={isValidConnection}
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          deleteKeyCode={['Backspace', 'Delete']}
          fitView
        >
          <Background gap={22} />
          <Controls />
        </ReactFlow>
      </main>
    </div>
  );
}

function NodeTemplateList({ navigate }: { navigate: (p: string) => void }) {
  const [templates, setTemplates] = useState<NodeTemplate[]>([]);
  const [query, setQuery] = useState('');
  const refresh = () => listNodeTemplates().then(setTemplates).catch(() => setTemplates([]));
  useEffect(() => void refresh(), []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Xoá node mẫu “${name}”?`)) return;
    await deleteNodeTemplate(id);
    await refresh();
  };

  const filtered = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return templates;
    return templates.filter((t) => norm(`${t.name} ${t.category ?? ''}`).includes(q));
  }, [templates, query]);
  const builtinCount = templates.filter((t) => t.builtin).length;

  return (
    <div className="view">
      <div className="view-bar">
        <h1 className="view-title">Node mẫu</h1>
        <span className="spacer" />
        <button className="btn btn-run" onClick={() => navigate('/nodes/new')}>
          ＋ Node mẫu mới
        </button>
      </div>
      <div className="view-body">
        <p className="view-hint">
          Node mẫu là <strong>1 block hoặc cả nhóm block</strong> (kèm config/prompt) để tái sử dụng. Có{' '}
          <strong>{builtinCount} prompt mẫu</strong> ship sẵn (tách đồ, chân dung, chuyển động video theo loại đồ) —
          kéo vào flow rồi nối sang block ảnh/video. Trong editor: gõ chữ để tìm &amp; thêm.
        </p>
        <input
          className="node-search"
          type="search"
          aria-label="Tìm node mẫu"
          placeholder="Tìm node mẫu… (vd: áo dài, yoga, tách đồ)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {filtered.length === 0 ? (
          <p className="view-hint">Không có node mẫu khớp.</p>
        ) : (
          <div className="wf-grid">
            {filtered.map((t) => (
              <article
                key={t.id}
                className="wf-card"
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/nodes/${t.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/nodes/${t.id}`);
                  }
                }}
              >
                <div className="wf-card-preview" aria-hidden="true">
                  {t.nodes.slice(0, 48).map((n, i) => (
                    <span key={i} className="wf-dot" data-type={n.type} />
                  ))}
                </div>
                <div className="wf-card-meta">
                  <h2 title={t.name}>{t.name}</h2>
                  <p className="wf-card-sub">{t.builtin ? (t.category ?? 'Có sẵn') : badgeOf(t)}</p>
                </div>
                {t.builtin ? (
                  <span className="wf-card-badge" aria-label="Node mẫu có sẵn">
                    có sẵn
                  </span>
                ) : (
                  <button
                    className="wf-card-del"
                    aria-label={`Xoá node mẫu ${t.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(t.id, t.name);
                    }}
                  >
                    ✕
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function NodeTemplatesView({
  templateId,
  navigate,
}: {
  templateId?: string;
  navigate: (p: string) => void;
}) {
  // null = tạo mới; 'loading' = đang nạp; NodeTemplate = sửa cái có sẵn
  const [template, setTemplate] = useState<NodeTemplate | null | 'loading'>(
    templateId === 'new' ? null : 'loading',
  );

  useEffect(() => {
    if (!templateId) return;
    if (templateId === 'new') {
      setTemplate(null);
      return;
    }
    setTemplate('loading');
    getNodeTemplate(templateId)
      .then(setTemplate)
      .catch(() => navigate('/nodes'));
  }, [templateId, navigate]);

  if (!templateId) return <NodeTemplateList navigate={navigate} />;
  if (template === 'loading')
    return (
      <div className="view">
        <div className="view-body">
          <p className="view-hint">Đang tải…</p>
        </div>
      </div>
    );
  return (
    <ReactFlowProvider>
      <NodeTemplateCanvas key={templateId} template={template} onDone={() => navigate('/nodes')} />
    </ReactFlowProvider>
  );
}
