import { useRef, useState } from 'react';
import { useReactFlow, type NodeProps } from '@xyflow/react';
import { NodeShell } from '../NodeShell';
import type { FlowNode } from '../types';

const PenIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11.4 2.6l2 2L6 12l-2.7.7.7-2.7z" />
    <path d="M10.3 3.7l2 2" />
  </svg>
);

export function TextBlock({ id, data, selected }: NodeProps<FlowNode>) {
  const { updateNodeData } = useReactFlow();
  // Chỉ cho sửa khi double-click / bấm pen — còn lại click-kéo để DI CHUYỂN block.
  // Dùng CHUNG 1 textarea cho cả xem & sửa (chỉ đổi readOnly + nodrag) → size NHẤT QUÁN.
  const [editing, setEditing] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const content = data.result?.content ?? data.config.content;
  const provider = typeof data.config.provider === 'string' ? data.config.provider : 'chatgpt';
  const isArray = Array.isArray(content);
  const textValue = typeof content === 'string' ? content : '';

  const startEdit = () => {
    setEditing(true);
    taRef.current?.focus();
  };

  const actions = isArray ? undefined : (
    <button
      type="button"
      className="node-tool"
      aria-label="Sửa nội dung"
      title="Sửa nội dung (hoặc double-click vào block)"
      onClick={startEdit}
    >
      <PenIcon />
    </button>
  );

  return (
    <NodeShell type="text" id={id} status={data.status} error={data.error} selected={selected} actions={actions}>
      {isArray ? (
        <>
          <ol className="fanout-list nodrag">
            {(content as unknown[]).map((item, i) => (
              <li key={i}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
            ))}
          </ol>
          <button
            type="button"
            className="node-action nodrag"
            onClick={() =>
              updateNodeData(id, { config: { ...data.config, content: JSON.stringify(content, null, 2) } })
            }
          >
            sửa lại
          </button>
        </>
      ) : (
        <textarea
          ref={taRef}
          aria-label="Nội dung text"
          placeholder="Nhập text… (double-click để sửa)"
          // editing → nodrag để gõ/bôi đen; không edit → bỏ nodrag để kéo cả block
          className={editing ? 'nodrag' : undefined}
          readOnly={!editing}
          value={textValue}
          onChange={(e) => updateNodeData(id, { config: { ...data.config, content: e.target.value } })}
          onDoubleClick={() => setEditing(true)}
          onBlur={() => setEditing(false)}
        />
      )}
      {/* Có input nối vào ⇒ block này chạy AI agent → mới cần chọn provider */}
      {data.hasInput && (
        <div className="config-row">
          <label className="agent-label">
            Agent
            <select
              aria-label="Provider AI"
              className="nodrag"
              value={provider}
              onChange={(e) => updateNodeData(id, { config: { ...data.config, provider: e.target.value } })}
            >
              <option value="chatgpt">ChatGPT</option>
              <option value="claude">Claude</option>
            </select>
          </label>
        </div>
      )}
    </NodeShell>
  );
}
