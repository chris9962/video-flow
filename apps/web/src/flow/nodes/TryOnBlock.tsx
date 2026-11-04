import { useState } from 'react';
import { useReactFlow, type NodeProps } from '@xyflow/react';
import {
  isFileRef,
  TRYON_DEFAULT_BG,
  TRYON_DEFAULT_FACE,
  TRYON_DEFAULT_GEN,
  TRYON_DEFAULT_OUTFIT,
} from '@videoflow/shared';
import { fileUrl } from '../../api';
import { NodeShell } from '../NodeShell';
import { Lightbox } from '../../components/Lightbox';
import { useBrokenSrc } from '../useBrokenSrc';
import type { FlowNode } from '../types';

/**
 * Ghép mẫu: 5 cổng vào (Mặt mẫu, Trang phục, Ảnh dáng, Clip, Background). Khi Run, gửi các message liên tiếp cùng 1 tab —
 * B1 nhớ mặt mẫu, B2 nhớ trang phục, B3 sửa Ảnh dáng (thay mặt + trang phục, giữ nguyên tư thế),
 * B4 (khi nối Background) đưa nhân vật vừa ghép vào background mới.
 */
export function TryOnBlock({ id, data, selected }: NodeProps<FlowNode>) {
  const { updateNodeData } = useReactFlow();
  const { config } = data;
  const [zoom, setZoom] = useState<string | null>(null);
  const { isBroken, markBroken } = useBrokenSrc();
  const content = data.result?.content ?? config.content;
  const okContent = isFileRef(content) && !isBroken(content.path) ? content : null;
  const str = (v: unknown) => (typeof v === 'string' ? v : '');
  const provider = typeof config.provider === 'string' ? config.provider : 'chatgpt';
  const frameTime = typeof config.frameTime === 'number' ? config.frameTime : 0;
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

  const steps = [
    { key: 'facePrompt', head: 'Ghi nhớ · ảnh Mặt mẫu', fallback: TRYON_DEFAULT_FACE },
    { key: 'outfitPrompt', head: 'Ghi nhớ · ảnh Trang phục (bỏ qua nếu không nối)', fallback: TRYON_DEFAULT_OUTFIT },
    { key: 'genPrompt', head: 'Sửa ảnh · Ảnh dáng (giữ tư thế)', fallback: TRYON_DEFAULT_GEN },
    { key: 'bgPrompt', head: 'Đổi background · ảnh Background (bỏ qua nếu không nối)', fallback: TRYON_DEFAULT_BG },
  ];

  return (
    <NodeShell type="tryon" id={id} status={data.status} error={data.error} selected={selected} actions={actions}>
      {okContent ? (
        <div className="media-wrap">
          <img
            className="media"
            alt="Ảnh ghép mẫu"
            src={primaryUrl!}
            onError={() => markBroken(okContent.path)}
            onDoubleClick={() => setZoom(primaryUrl!)}
            title="Double-click để xem toàn màn hình"
          />
        </div>
      ) : (
        <div className="gen-placeholder" aria-hidden="true" />
      )}
      <div className="config-row">
        <label className="agent-label">
          Agent
          <select
            aria-label="Provider tạo ảnh"
            className="nodrag"
            title="ChatGPT giữ mặt tốt; Gemini có thể từ chối ảnh người thật"
            value={provider}
            onChange={(e) => set({ provider: e.target.value })}
          >
            <option value="chatgpt">ChatGPT (giữ mặt tốt)</option>
            <option value="gemini">Gemini</option>
          </select>
        </label>
        <label className="agent-label" title="Chỉ dùng khi không nối Ảnh dáng: block cắt khung hình của Clip ở giây này">
          Cắt clip ở giây
          <input
            type="number"
            className="nodrag"
            min={0}
            step={0.1}
            value={frameTime}
            onChange={(e) => set({ frameTime: Number(e.target.value) })}
          />
        </label>
      </div>
      <div className="restyle-steps">
        {steps.map((s, i) => (
          <label key={s.key} className="restyle-step">
            <span className="restyle-step-head">
              <span className="restyle-step-num">{i + 1}</span>
              {s.head}
            </span>
            <textarea
              className="nodrag"
              value={str(config[s.key]) || s.fallback}
              onChange={(e) => set({ [s.key]: e.target.value })}
            />
          </label>
        ))}
      </div>
      {zoom && <Lightbox src={zoom} kind="image" onClose={() => setZoom(null)} />}
    </NodeShell>
  );
}
