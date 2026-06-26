import { useState } from 'react';
import { useReactFlow, type NodeProps } from '@xyflow/react';
import { isFileRef, RESTYLE_DEFAULT_ANALYZE, RESTYLE_DEFAULT_GEN } from '@videoflow/shared';
import { fileUrl } from '../../api';
import { NodeShell } from '../NodeShell';
import { Lightbox } from '../../components/Lightbox';
import { useBrokenSrc } from '../useBrokenSrc';
import type { FlowNode } from '../types';

/**
 * Ảnh GPT 2 bước: 2 cổng vào (Tham chiếu + Mẫu). Khi Run, ChatGPT gửi 2 message liên tiếp cùng 1 tab —
 * B1 ghi nhớ góc máy/ánh sáng/bg của ảnh Tham chiếu, B2 tạo ảnh từ ảnh Mẫu (giữ mặt) áp style đó.
 */
export function RestyleBlock({ id, data, selected }: NodeProps<FlowNode>) {
  const { updateNodeData } = useReactFlow();
  const { config } = data;
  const [zoom, setZoom] = useState<string | null>(null);
  const { isBroken, markBroken } = useBrokenSrc();
  const content = data.result?.content ?? config.content;
  const okContent = isFileRef(content) && !isBroken(content.path) ? content : null;
  // Prompt mặc định hiện sẵn (editable) để user chỉ cần sửa 1 phần nhỏ — config rỗng vẫn dùng đúng default này.
  const analyzePrompt = typeof config.analyzePrompt === 'string' ? config.analyzePrompt : '';
  const genPrompt = typeof config.genPrompt === 'string' ? config.genPrompt : '';
  const set = (patch: Record<string, unknown>) =>
    updateNodeData(id, { config: { ...config, ...patch } });

  const primaryUrl = okContent ? fileUrl(okContent) : null;

  const actions = primaryUrl ? (
    <button
      type="button"
      className="node-tool"
      aria-label="Xem toàn màn hình"
      title="Xem toàn màn hình"
      onClick={() => setZoom(primaryUrl)}
    >
      ⤢
    </button>
  ) : undefined;

  return (
    <NodeShell type="restyle" id={id} status={data.status} error={data.error} selected={selected} actions={actions}>
      {okContent ? (
        <div className="media-wrap">
          <img
            className="media"
            alt="Ảnh GPT 2 bước"
            src={primaryUrl!}
            onError={() => markBroken(okContent.path)}
            onDoubleClick={() => setZoom(primaryUrl!)}
            title="Double-click để xem toàn màn hình"
          />
        </div>
      ) : (
        <div className="gen-placeholder" aria-hidden="true" />
      )}
      <div className="restyle-steps">
        <label className="restyle-step">
          <span className="restyle-step-head">
            <span className="restyle-step-num">1</span>
            GPT ghi nhớ · ảnh Tham chiếu
          </span>
          <textarea
            className="nodrag"
            value={analyzePrompt || RESTYLE_DEFAULT_ANALYZE}
            onChange={(e) => set({ analyzePrompt: e.target.value })}
          />
        </label>
        <label className="restyle-step">
          <span className="restyle-step-head">
            <span className="restyle-step-num">2</span>
            Tạo ảnh · ảnh Mẫu (giữ mặt)
          </span>
          <textarea
            className="nodrag"
            value={genPrompt || RESTYLE_DEFAULT_GEN}
            onChange={(e) => set({ genPrompt: e.target.value })}
          />
        </label>
      </div>
      {zoom && <Lightbox src={zoom} kind="image" onClose={() => setZoom(null)} />}
    </NodeShell>
  );
}
