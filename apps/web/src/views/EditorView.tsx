import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
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
import {
  BLOCK_DEFINITIONS,
  type NodeTemplate,
  type Workflow,
  type WorkflowEdge,
  type WorkflowNode,
} from '@videoflow/shared';
import { Palette } from '../Palette';
import { TextBlock } from '../flow/nodes/TextBlock';
import { ImageBlock } from '../flow/nodes/ImageBlock';
import { VideoBlock } from '../flow/nodes/VideoBlock';
import { KlingBlock } from '../flow/nodes/KlingBlock';
import { KlingEditBlock } from '../flow/nodes/KlingEditBlock';
import { FaceSwapBlock } from '../flow/nodes/FaceSwapBlock';
import { MotionBlock } from '../flow/nodes/MotionBlock';
import { canConnect } from '../flow/validation';
import {
  toFlow,
  fromFlow,
  cloneWithFreshIds,
  selectionToTemplateParts,
  templateToFlow,
} from '../flow/mapping';
import {
  saveWorkflow,
  startRun,
  stopRun,
  getWorkflow,
  uploadAsset,
  listNodeTemplates,
  createNodeTemplate,
  aiBuild,
  getAiChat,
  type AiBuildOp,
} from '../api';
import { RunPanel } from '../components/RunPanel';
import { AiChatPanel, type AiMessage } from '../components/AiChatPanel';
import { NodeSearchOverlay } from '../components/NodeSearchOverlay';
import type { FlowNode } from '../flow/types';
import type { ExecutionState } from '../useExecution';

const nodeTypes = {
  text: TextBlock,
  image: ImageBlock,
  video: VideoBlock,
  kling: KlingBlock,
  'kling-edit': KlingEditBlock,
  faceswap: FaceSwapBlock,
  motion: MotionBlock,
};

const RUN_CHIP_TEXT = {
  running: 'đang chạy…',
  done: '✓ chạy xong',
  error: '✗ có lỗi',
  cancelled: '■ đã dừng',
} as const;

export function EditorView({
  workflow,
  execution,
  onSaved,
}: {
  workflow: Workflow;
  execution: ExecutionState;
  onSaved: () => void;
}) {
  const initial = useState(() => toFlow(workflow))[0];
  const [nodes, setNodes] = useState<FlowNode[]>(initial.nodes);
  const [edges, setEdges] = useState<Edge[]>(initial.edges);
  const [name, setName] = useState(workflow.name);
  const [nodeTemplates, setNodeTemplates] = useState<NodeTemplate[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInitial, setSearchInitial] = useState('');
  const { screenToFlowPosition, fitView } = useReactFlow();

  const refreshNodeTemplates = useCallback(() => {
    listNodeTemplates().then(setNodeTemplates).catch(() => {});
  }, []);
  useEffect(() => refreshNodeTemplates(), [refreshNodeTemplates]);

  // Gõ chữ khi KHÔNG focus ô nhập nào → mở overlay tìm node mẫu (seed bằng ký tự vừa gõ)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (searchOpen || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.length !== 1 || !/\S/.test(e.key)) return;
      const el = document.activeElement as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
      e.preventDefault();
      setSearchInitial(e.key);
      setSearchOpen(true);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [searchOpen]);
  const { statuses, results, errors, log, running, lastRun, runWorkflowId, runId } = execution;
  // Run hiển thị (log, chip, badge) chỉ thuộc về workflow đang chạy/vừa chạy
  const runIsMine = runWorkflowId === workflow.id;

  // Mở/đổi workflow → khung hình ôm trọn flow (chờ node đo xong kích thước)
  useEffect(() => {
    const t = setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 80);
    return () => clearTimeout(t);
  }, [workflow.id, fitView]);

  // ── Undo/redo + copy/paste (lưu snapshot {nodes,edges}; đọc state mới nhất qua ref → callback ổn định)
  type Snap = { nodes: FlowNode[]; edges: Edge[] };
  type Clip = { nodes: WorkflowNode[]; edges: WorkflowEdge[] };
  const stateRef = useRef<Snap>({ nodes, edges });
  stateRef.current = { nodes, edges };
  const past = useRef<Snap[]>([]);
  const future = useRef<Snap[]>([]);
  const clip = useRef<Clip | null>(null);
  const dragging = useRef(false);

  const record = useCallback(() => {
    past.current.push({ ...stateRef.current });
    if (past.current.length > 60) past.current.shift();
    future.current = [];
  }, []);
  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (!prev) return;
    future.current.push({ ...stateRef.current });
    setNodes(prev.nodes);
    setEdges(prev.edges);
  }, []);
  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    past.current.push({ ...stateRef.current });
    setNodes(next.nodes);
    setEdges(next.edges);
  }, []);
  const copySelection = useCallback(() => {
    const part = selectionToTemplateParts(stateRef.current.nodes, stateRef.current.edges);
    if (part.nodes.length) clip.current = part;
  }, []);
  const pasteAt = useCallback(
    (origin: { x: number; y: number }, parts: Clip) => {
      record();
      const out = templateToFlow({ id: '', name: '', nodes: parts.nodes, edges: parts.edges }, origin);
      setNodes((ns) => [...ns.map((n) => ({ ...n, selected: false })), ...out.nodes]);
      setEdges((es) => [...es, ...out.edges]);
    },
    [record],
  );
  const paste = useCallback(() => {
    if (clip.current) pasteAt(screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 }), clip.current);
  }, [pasteAt, screenToFlowPosition]);
  const duplicate = useCallback(() => {
    const { nodes: ns } = stateRef.current;
    const part = selectionToTemplateParts(ns, stateRef.current.edges);
    if (!part.nodes.length) return;
    const sel = ns.filter((n) => n.selected);
    const minX = Math.min(...sel.map((n) => n.position.x));
    const minY = Math.min(...sel.map((n) => n.position.y));
    pasteAt({ x: minX + 40, y: minY + 40 }, part);
  }, [pasteAt]);

  const onNodesChange = useCallback(
    (changes: NodeChange<FlowNode>[]) => {
      // snapshot 1 lần khi bắt đầu kéo, và khi xoá node → undo trả về đúng trạng thái trước
      const dragStart = changes.some((c) => c.type === 'position' && c.dragging) && !dragging.current;
      if (dragStart) {
        record();
        dragging.current = true;
      }
      if (changes.some((c) => c.type === 'position' && c.dragging === false)) dragging.current = false;
      if (changes.some((c) => c.type === 'remove')) record();
      setNodes((ns) => applyNodeChanges(changes, ns));
    },
    [record],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (changes.some((c) => c.type === 'remove')) record();
      setEdges((es) => applyEdgeChanges(changes, es));
    },
    [record],
  );
  const onConnect = useCallback(
    (conn: Connection) => {
      record();
      setEdges((es) => addEdge(conn, es));
    },
    [record],
  );

  // Phím tắt: ⌘/Ctrl + Z (undo) · ⇧Z hoặc Y (redo) · C (copy) · V (paste) · D (nhân đôi)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const el = document.activeElement as HTMLElement | null;
      const editable = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
      const k = e.key.toLowerCase();
      if (editable && (k === 'z' || k === 'c' || k === 'v' || k === 'x' || k === 'y')) return; // để ô nhập tự xử lý
      if (k === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((k === 'z' && e.shiftKey) || k === 'y') {
        e.preventDefault();
        redo();
      } else if (k === 'c') {
        copySelection();
      } else if (k === 'v') {
        e.preventDefault();
        paste();
      } else if (k === 'd') {
        e.preventDefault();
        duplicate();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [undo, redo, copySelection, paste, duplicate]);

  const isValidConnection = useCallback(
    (conn: Connection | Edge) => {
      if (conn.source === conn.target) return false;
      const source = nodes.find((n) => n.id === conn.source);
      const target = nodes.find((n) => n.id === conn.target);
      if (!source?.type || !target?.type) return false;
      return canConnect(source.type, target.type, conn.targetHandle);
    },
    [nodes],
  );

  // Server đè kết quả generate vào config.content sau khi chạy xong → kéo về cho block hiển thị bền
  useEffect(() => {
    if (!runIsMine || lastRun === null) return;
    let cancelled = false;
    getWorkflow(workflow.id)
      .then((fresh) => {
        if (cancelled) return;
        const byId = new Map(fresh.nodes.map((n) => [n.id, n]));
        setNodes((ns) =>
          ns.map((n) => {
            const saved = byId.get(n.id);
            if (!saved || !('content' in saved.config)) return n;
            return { ...n, data: { ...n.data, config: { ...n.data.config, content: saved.config.content } } };
          }),
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [lastRun, runIsMine, workflow.id]);

  const addNode = useCallback(
    (type: string, position: { x: number; y: number }, config: Record<string, unknown> = {}) => {
      record();
      setNodes((ns) => [...ns, { id: crypto.randomUUID(), type, position, data: { config } }]);
    },
    [record],
  );

  // ── AI Workflow Builder ─────────────────────────────────────────────
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([]);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiAttachCount, setAiAttachCount] = useState(0);

  // Mở workflow → nạp lịch sử chat của session gắn với nó (SDK lưu, ta chỉ get)
  useEffect(() => {
    let cancelled = false;
    getAiChat(workflow.id)
      .then((r) => {
        if (!cancelled && r.messages.length) setAiMessages(r.messages as AiMessage[]);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [workflow.id]);

  // Áp các thao tác AI trả về (tempId = node mới, id = node có sẵn) vào canvas trong 1 lần (undo được)
  const applyOps = useCallback(
    (ops: AiBuildOp[]) => {
      record();
      const idMap = new Map<string, string>();
      for (const op of ops) if (op.op === 'addNode' && op.tempId) idMap.set(op.tempId, crypto.randomUUID());
      const resolve = (x?: string) => (x ? (idMap.get(x) ?? x) : x);
      setNodes((ns) => {
        let next = [...ns];
        for (const op of ops) {
          if (op.op === 'addNode' && op.type) {
            const uuid = op.tempId ? idMap.get(op.tempId)! : crypto.randomUUID();
            next.push({ id: uuid, type: op.type, position: op.position ?? { x: 40, y: 40 }, data: { config: op.config ?? {} } });
          } else if (op.op === 'updateNode' && op.id) {
            next = next.map((n) =>
              n.id === op.id ? { ...n, data: { ...n.data, config: { ...n.data.config, ...op.config } } } : n,
            );
          } else if (op.op === 'deleteNode' && op.id) {
            next = next.filter((n) => n.id !== op.id);
          }
        }
        return next;
      });
      setEdges((es) => {
        const deleted = new Set(ops.filter((o) => o.op === 'deleteNode').map((o) => o.id));
        let next = es.filter((e) => !deleted.has(e.source) && !deleted.has(e.target));
        for (const op of ops) {
          if (op.op === 'addEdge' && op.source && op.target) {
            next.push({
              id: crypto.randomUUID(),
              source: resolve(op.source)!,
              sourceHandle: 'out',
              target: resolve(op.target)!,
              targetHandle: op.targetPort ?? 'in',
            });
          }
        }
        return next;
      });
    },
    [record],
  );

  const handleAiSubmit = useCallback(
    async (text: string) => {
      setAiMessages((m) => [...m, { role: 'user', text }]);
      setAiBusy(true);
      try {
        const wf = fromFlow(workflow.id, name, nodes, edges);
        // Node đang chọn → AI hiểu "node này/mấy node này" là ám chỉ chúng
        const sel = nodes.filter((n) => n.selected).map((n) => n.id);
        const res = await aiBuild(text, { nodes: wf.nodes, edges: wf.edges }, workflow.id, sel);
        applyOps(res.ops);
        // Agent vẫn tự review ngầm (field review) để suy nghĩ + nhất quán, nhưng KHÔNG hiện trong chat
        setAiMessages((m) => [...m, { role: 'ai' as const, text: res.reply }]);
        setAiAttachCount(0);
      } catch (err) {
        setAiMessages((m) => [...m, { role: 'error', text: err instanceof Error ? err.message : 'AI lỗi' }]);
      } finally {
        setAiBusy(false);
      }
    },
    [nodes, edges, name, workflow.id, applyOps],
  );

  const handleAiAttach = useCallback(
    async (file: File) => {
      try {
        const ref = await uploadAsset(file);
        addNode('image', screenToFlowPosition({ x: 140, y: 140 }), { content: ref });
        setAiAttachCount((n) => n + 1);
        setAiMessages((m) => [
          ...m,
          { role: 'ai', text: `Đã thêm ảnh "${file.name}" vào canvas. Mô tả video để mình dựng nhé.` },
        ]);
      } catch {
        setAiMessages((m) => [...m, { role: 'error', text: 'Tải ảnh thất bại.' }]);
      }
    },
    [addNode, screenToFlowPosition],
  );

  // Chọn node mẫu từ overlay → instantiate cả sub-flow (1 hoặc nhiều node + edge) vào giữa khung nhìn
  const handlePickTemplate = useCallback(
    (t: NodeTemplate) => {
      pasteAt(screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 }), {
        nodes: t.nodes,
        edges: t.edges,
      });
      setSearchOpen(false);
    },
    [pasteAt, screenToFlowPosition],
  );

  const blockTypeForFile = (file: File): 'image' | 'video' | null =>
    file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : null;

  const onDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });

      // Kéo-thả file ảnh/video từ máy → tạo block tương ứng với nội dung là file vừa upload
      const files = Array.from(e.dataTransfer.files).filter((f) => blockTypeForFile(f));
      if (files.length > 0) {
        let offset = 0;
        for (const file of files) {
          const type = blockTypeForFile(file)!;
          const ref = await uploadAsset(file);
          addNode(type, { x: pos.x + offset, y: pos.y + offset }, { content: ref });
          offset += 36;
        }
        return;
      }

      // Kéo block từ palette
      const type = e.dataTransfer.getData('application/videoflow');
      if (type) addNode(type, pos);
    },
    [addNode, screenToFlowPosition],
  );

  const displayNodes = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          hasInput: edges.some((e) => e.target === n.id),
          // Kết quả live chỉ đẩy vào block khi đang chạy — chạy xong thì config.content (đã apply-back) là nguồn sự thật
          ...(runIsMine
            ? { status: statuses[n.id], error: errors[n.id], result: running ? results[n.id] : undefined }
            : {}),
        },
      })),
    [nodes, edges, statuses, results, errors, running, runIsMine],
  );

  // Edge "sáng" khi node đích đang chạy — nhìn là biết dữ liệu đang đổ vào đâu
  const displayEdges = useMemo(
    () => edges.map((e) => (statuses[e.target] === 'running' ? { ...e, className: 'vf-active' } : e)),
    [edges, statuses],
  );

  const handleSave = async () => {
    await saveWorkflow(fromFlow(workflow.id, name, nodes, edges));
    onSaved();
  };

  const selectedIds = nodes.filter((n) => n.selected).map((n) => n.id);
  const selectedCount = selectedIds.length;

  // Lưu (các) block ĐANG CHỌN thành node mẫu — 1 hoặc nhiều node + edge giữa chúng, giữ full config
  const handleSaveNodeTemplate = async () => {
    const part = selectionToTemplateParts(nodes, edges);
    if (part.nodes.length === 0) return;
    const name = window
      .prompt(`Tên node mẫu (đang chọn ${part.nodes.length} node${part.nodes.length > 1 ? ' — lưu cả nhóm' : ''}):`)
      ?.trim();
    if (!name) return;
    await createNodeTemplate({ name, nodes: part.nodes, edges: part.edges });
    refreshNodeTemplates();
  };

  const handleRun = async (from?: string | string[]) => {
    await saveWorkflow(fromFlow(workflow.id, name, nodes, edges));
    onSaved();
    await startRun(workflow.id, from);
  };

  const handleStop = async () => {
    if (runId) await stopRun(runId);
  };

  // Nhân bản để backup: bản sao có node/edge id MỚI hoàn toàn → độc lập với gốc, vẫn ở lại gốc
  const handleClone = async () => {
    await saveWorkflow(fromFlow(workflow.id, name, nodes, edges)); // lưu gốc trước
    await saveWorkflow(cloneWithFreshIds(`${name} (copy)`, nodes, edges));
    onSaved();
  };

  // Tự lưu định kỳ — bỏ qua khi đang chạy, và TUYỆT ĐỐI không ghi đè khi canvas rỗng
  // (tránh xoá sạch workflow nếu editor lỡ về trạng thái trống)
  const snapshot = useRef({ nodes, edges, name });
  snapshot.current = { nodes, edges, name };
  useEffect(() => {
    const id = setInterval(() => {
      if (running) return;
      const s = snapshot.current;
      if (s.nodes.length === 0) return;
      saveWorkflow(fromFlow(workflow.id, s.name, s.nodes, s.edges)).catch(() => {});
    }, 5000);
    return () => clearInterval(id);
  }, [workflow.id, running]);

  const nodeLabel = useCallback(
    (id: string) => {
      const node = nodes.find((n) => n.id === id);
      return node?.type ? (BLOCK_DEFINITIONS[node.type]?.label ?? node.type) : id;
    },
    [nodes],
  );

  const chipState = runIsMine ? (running ? 'running' : lastRun) : null;
  // Node lỗi của lần chạy gần nhất → cho phép "thử lại từ đây" (tái dùng kết quả node phía trước)
  const erroredNodeId =
    runIsMine && !running && lastRun === 'error'
      ? (nodes.find((n) => statuses[n.id] === 'error')?.id ?? Object.keys(errors)[0] ?? null)
      : null;

  return (
    <div className="view">
      <div className="view-bar">
        <input
          className="wf-name"
          aria-label="Tên workflow"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <span className="spacer" />
        <span role="status" aria-live="polite">
          {chipState && (
            <span className="run-chip" data-state={chipState}>
              {RUN_CHIP_TEXT[chipState]}
            </span>
          )}
        </span>
        <button
          className={`btn${aiOpen ? ' is-active' : ''}`}
          onClick={() => setAiOpen((o) => !o)}
          title="AI dựng workflow — chat để AI tự tạo block + nối dây"
        >
          ✨ AI
        </button>
        <button className="btn" onClick={handleSave} disabled={running}>
          Lưu
        </button>
        <button
          className="btn"
          onClick={handleClone}
          disabled={running || nodes.length === 0}
          title="Tạo bản sao để backup, vẫn ở lại workflow này"
        >
          ⧉ Nhân bản
        </button>
        {selectedCount > 0 && (
          <button
            className="btn"
            onClick={handleSaveNodeTemplate}
            disabled={running}
            title="Lưu (các) block đang chọn thành node mẫu — chọn nhiều node để lưu cả nhóm"
          >
            ＋ Lưu node mẫu{selectedCount > 1 ? ` (${selectedCount})` : ''}
          </button>
        )}
        {runIsMine && running ? (
          <button className="btn btn-stop" onClick={handleStop}>
            ■ Dừng
          </button>
        ) : (
          <>
            {erroredNodeId && (
              <button
                className="btn"
                onClick={() => handleRun(erroredNodeId)}
                disabled={running}
                title="Chạy lại từ node bị lỗi — các node phía trước dùng kết quả đã có (không chạy lại, đỡ tốn credit)"
              >
                ↻ Thử lại từ lỗi
              </button>
            )}
            {selectedCount > 0 && (
              <button
                className="btn"
                onClick={() => handleRun(selectedIds)}
                disabled={running}
                title={
                  selectedCount > 1
                    ? `Chạy từ ${selectedCount} block đang chọn — nhánh độc lập chạy song song, cùng cây theo flow`
                    : 'Chạy từ block đang chọn (block phía trước dùng kết quả cũ)'
                }
              >
                ▶ Chạy từ đây{selectedCount > 1 ? ` (${selectedCount})` : ''}
              </button>
            )}
            <button
              className="btn btn-run"
              onClick={() => handleRun()}
              disabled={running || nodes.length === 0}
            >
              ▶ Chạy
            </button>
          </>
        )}
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
            Kéo block từ bảng bên trái vào đây, nối chúng lại rồi bấm Chạy.
          </div>
        )}
        <ReactFlow
          nodes={displayNodes}
          edges={displayEdges}
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
        {runIsMine && <RunPanel log={log} nodeLabel={nodeLabel} />}
        {aiOpen && (
          <AiChatPanel
            messages={aiMessages}
            busy={aiBusy}
            attachCount={aiAttachCount}
            selectedCount={selectedCount}
            onSubmit={handleAiSubmit}
            onAttach={handleAiAttach}
            onClose={() => setAiOpen(false)}
          />
        )}
      </main>
      {searchOpen && (
        <NodeSearchOverlay
          templates={nodeTemplates}
          initialQuery={searchInitial}
          onPick={handlePickTemplate}
          onClose={() => setSearchOpen(false)}
        />
      )}
    </div>
  );
}
