import { useReactFlow, type NodeProps } from '@xyflow/react';
import { AIDANCING_DURATIONS, isFileRef } from '@videoflow/shared';
import { fileUrl } from '../../api';
import { NodeShell } from '../NodeShell';
import { useBrokenSrc } from '../useBrokenSrc';
import type { FlowNode } from '../types';

/** AI Dancing (aidancing.net): Ảnh mẫu + Video mẫu → nhân vật trong ảnh làm theo động tác của video. */
export function AiDancingBlock({ id, data, selected }: NodeProps<FlowNode>) {
  const { updateNodeData } = useReactFlow();
  const { config } = data;
  const { isBroken, markBroken } = useBrokenSrc();
  const content = data.result?.content ?? config.content;
  const okContent = isFileRef(content) && !isBroken(content.path) ? content : null;
  const quality = config.quality === 'fast' ? 'fast' : 'quality';
  const duration = AIDANCING_DURATIONS.includes(Number(config.duration)) ? String(config.duration) : 'auto';
  const aspectRatio = config.aspectRatio === '16:9' ? '16:9' : '9:16';

  const setConfig = (patch: Record<string, unknown>) =>
    updateNodeData(id, { config: { ...config, ...patch } });

  return (
    <NodeShell type="aidancing" id={id} status={data.status} error={data.error} selected={selected}>
      {okContent ? (
        <div className="media-wrap">
          <video className="media" controls preload="metadata" src={fileUrl(okContent)} onError={() => markBroken(okContent.path)} />
        </div>
      ) : (
        <div className="gen-placeholder" aria-hidden="true" />
      )}
      <div className="config-row">
        <select
          aria-label="Chất lượng"
          className="nodrag"
          title="Chất lượng: 0,22 credit/giây · Nhanh: 0,11 credit/giây"
          value={quality}
          onChange={(e) => setConfig({ quality: e.target.value })}
        >
          <option value="quality">Chất lượng</option>
          <option value="fast">Nhanh</option>
        </select>
        <select
          aria-label="Thời lượng"
          className="nodrag"
          title="Tự động: thời lượng nhỏ nhất đủ dài cho Video mẫu"
          value={duration}
          onChange={(e) => setConfig({ duration: e.target.value === 'auto' ? undefined : Number(e.target.value) })}
        >
          <option value="auto">Tự động theo video</option>
          {AIDANCING_DURATIONS.map((d) => (
            <option key={d} value={String(d)}>
              {d} giây
            </option>
          ))}
        </select>
        <select
          aria-label="Tỉ lệ khung hình"
          className="nodrag"
          value={aspectRatio}
          onChange={(e) => setConfig({ aspectRatio: e.target.value })}
        >
          <option value="9:16">9:16</option>
          <option value="16:9">16:9</option>
        </select>
      </div>
    </NodeShell>
  );
}
