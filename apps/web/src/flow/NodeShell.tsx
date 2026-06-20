import type { ReactNode } from 'react';
import { Handle, NodeResizer, NodeToolbar, Position, useReactFlow } from '@xyflow/react';
import { BLOCK_DEFINITIONS, type DataType, type NodeStatus } from '@videoflow/shared';

const STATUS_TEXT: Record<NodeStatus, string> = {
  pending: 'chờ',
  running: 'đang chạy',
  done: 'xong',
  error: 'lỗi',
  skipped: 'bỏ qua',
};

/** Icon trong cổng theo LOẠI data: text=chữ "T", image=ảnh, video=play. pointer-events:none để không cản kéo nối. */
function PortGlyph({ type }: { type: DataType }) {
  if (type === 'image') {
    return (
      <svg className="port-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <rect x="2.4" y="3" width="11.2" height="10" rx="1.6" />
        <circle cx="5.8" cy="6.2" r="1" />
        <path d="M3 11l3-2.6 2.3 1.9 2.2-2.5L13 11" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === 'video') {
    return (
      <svg className="port-ico" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M5.5 4.2v7.6l6-3.8z" />
      </svg>
    );
  }
  // text (và json/any) — chữ "T"
  return (
    <svg className="port-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4.6h8M8 4.6v7" />
    </svg>
  );
}

/**
 * Vỏ chung của block. Action (xoá + tuỳ block: upload/mở rộng) nằm ở thanh nổi PHÍA TRÊN block
 * (NodeToolbar) — tách khỏi thân; config (model/agent…) do block tự render ở ĐÁY thân (children).
 */
export function NodeShell({
  type,
  id,
  status,
  error,
  selected,
  actions,
  children,
}: {
  type: string;
  id: string;
  status?: NodeStatus;
  error?: string;
  selected?: boolean;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  const def = BLOCK_DEFINITIONS[type];
  const { deleteElements } = useReactFlow();
  const ports = def.inputs ?? [{ id: 'in', label: '', accepts: def.accepts }];

  return (
    <div className="vf-node" data-type={def.emits} data-status={status}>
      <NodeResizer isVisible={selected} minWidth={180} minHeight={96} />

      <NodeToolbar position={Position.Top} align="end" offset={8} isVisible={selected || undefined}>
        <div className="node-toolbar nodrag">
          {actions}
          <button
            type="button"
            className="node-tool node-tool-del"
            aria-label="Xoá block"
            title="Xoá block"
            onClick={() => deleteElements({ nodes: [{ id }] })}
          >
            ✕
          </button>
        </div>
      </NodeToolbar>

      {status && (
        <header>
          <span className="status-chip" data-status={status}>
            {status === 'running' && <span className="pulse" />}
            {STATUS_TEXT[status]}
          </span>
        </header>
      )}
      {children && <div className="body">{children}</div>}
      {error && <p className="node-error">{error}</p>}

      {ports.map((port, i) => {
        const top = `${((i + 1) / (ports.length + 1)) * 100}%`;
        // Bỏ nhãn chữ; tên cổng để ở title (hover hiện) cho block nhiều cổng (Start/Prompt/End)
        return (
          <Handle
            key={port.id}
            type="target"
            position={Position.Left}
            id={port.id}
            className="vf-handle"
            data-type={port.accepts[0]}
            style={{ top }}
            title={port.label || undefined}
          >
            <PortGlyph type={port.accepts[0]} />
          </Handle>
        );
      })}
      <Handle type="source" position={Position.Right} id="out" className="vf-handle" data-type={def.emits}>
        <PortGlyph type={def.emits} />
      </Handle>
    </div>
  );
}
