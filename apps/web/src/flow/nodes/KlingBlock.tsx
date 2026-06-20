import { useReactFlow, type NodeProps } from '@xyflow/react';
import { isFileRef } from '@videoflow/shared';
import { fileUrl } from '../../api';
import { NodeShell } from '../NodeShell';
import type { FlowNode } from '../types';

// Base model id (resolveModelId ở server tự thêm /image-to-video | /text-to-video)
const MODELS = [
  { value: 'kling-video/v2.5-turbo/pro', label: 'Kling 2.5 Turbo Pro' },
  { value: 'kling-video/v2.1/master', label: 'Kling 2.1 Master' },
  { value: 'kling-video/v2.1/pro', label: 'Kling 2.1 Pro' },
  { value: 'kling-video/v2.1/standard', label: 'Kling 2.1 Standard' },
];

export function KlingBlock({ id, data, selected }: NodeProps<FlowNode>) {
  const { updateNodeData } = useReactFlow();
  const { config } = data;
  const content = data.result?.content ?? config.content;
  const engine = config.engine === 'web' ? 'web' : 'falai';
  const model = typeof config.model === 'string' ? config.model : MODELS[0].value;
  const duration = Number(config.duration ?? 5);
  const aspectRatio = typeof config.aspectRatio === 'string' ? config.aspectRatio : '9:16';
  const quality = typeof config.quality === 'string' ? config.quality : '1080p';

  const setConfig = (patch: Record<string, unknown>) =>
    updateNodeData(id, { config: { ...config, ...patch } });

  return (
    <NodeShell type="kling" id={id} status={data.status} error={data.error} selected={selected}>
      {isFileRef(content) ? (
        <div className="media-wrap">
          <video className="media" controls preload="metadata" src={fileUrl(content)} />
        </div>
      ) : (
        <div className="gen-placeholder" aria-hidden="true" />
      )}
      <div className="config-row">
        <select
          aria-label="Engine tạo video"
          className="nodrag"
          value={engine}
          onChange={(e) => setConfig({ engine: e.target.value })}
        >
          <option value="falai">fal.ai (API, trả tiền)</option>
          <option value="web">kling.ai (web, dùng sub)</option>
        </select>
        {engine === 'falai' && (
          <select
            aria-label="Model Kling"
            className="nodrag"
            value={model}
            onChange={(e) => setConfig({ model: e.target.value })}
          >
            {MODELS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        )}
        {engine === 'web' && (
          <select
            aria-label="Chất lượng (Mode)"
            className="nodrag"
            value={quality}
            onChange={(e) => setConfig({ quality: e.target.value })}
          >
            <option value="720p">720p</option>
            <option value="1080p">1080p</option>
          </select>
        )}
        <select
          aria-label="Thời lượng video"
          className="nodrag"
          value={String(duration)}
          onChange={(e) => setConfig({ duration: Number(e.target.value) })}
        >
          <option value="5">5s</option>
          <option value="10">10s</option>
        </select>
        <select
          aria-label="Tỉ lệ khung hình"
          className="nodrag"
          value={aspectRatio}
          onChange={(e) => setConfig({ aspectRatio: e.target.value })}
        >
          <option value="9:16">9:16</option>
          <option value="16:9">16:9</option>
          <option value="1:1">1:1</option>
        </select>
      </div>
    </NodeShell>
  );
}
