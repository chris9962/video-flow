import { useState } from 'react';
import { useReactFlow, type NodeProps } from '@xyflow/react';
import { isFileRef } from '@videoflow/shared';
import { fileUrl, uploadAsset } from '../../api';
import { NodeShell } from '../NodeShell';
import { useBrokenSrc } from '../useBrokenSrc';
import type { FlowNode } from '../types';

// Model Google Flow (value khớp FLOW_MODEL_LABELS ở server/flow-impl.ts)
const MODELS = [
  { value: 'veo-3.1-fast', label: 'Veo 3.1 Fast' },
  { value: 'veo-3.1-quality', label: 'Veo 3.1 Quality' },
  { value: 'veo-3.1-lite', label: 'Veo 3.1 Lite' },
  { value: 'omni-flash', label: 'Omni Flash (rẻ)' },
];

export function VideoBlock({ id, data, selected }: NodeProps<FlowNode>) {
  const { updateNodeData } = useReactFlow();
  const [uploading, setUploading] = useState(false);
  const { config } = data;
  const { isBroken, markBroken } = useBrokenSrc();
  const content = data.result?.content ?? config.content;
  // Bỏ qua video tải lỗi (file thiếu/404) → block hiện như chưa có video
  const okContent = isFileRef(content) && !isBroken(content.path) ? content : null;
  const refs = Array.isArray(content)
    ? content.filter(isFileRef).filter((r) => !isBroken(r.path))
    : null;
  const sourceUrl = typeof config.sourceUrl === 'string' ? config.sourceUrl : '';
  const provider = typeof config.provider === 'string' ? config.provider : 'flow';
  const model = typeof config.model === 'string' ? config.model : MODELS[0].value;
  const duration = Number(config.duration ?? 6);
  const aspectRatio = typeof config.aspectRatio === 'string' ? config.aspectRatio : '9:16';

  const setConfig = (patch: Record<string, unknown>) =>
    updateNodeData(id, { config: { ...config, ...patch } });

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const ref = await uploadAsset(file);
      setConfig({ content: ref });
    } finally {
      setUploading(false);
    }
  };

  const isSource = !data.hasInput;
  const actions =
    isSource && okContent ? (
      <label className="node-tool" aria-label="Đổi video" title="Đổi video khác">
        ⟳
        <input
          type="file"
          accept="video/*"
          className="visually-hidden"
          disabled={uploading}
          onChange={(e) => handleUpload(e.target.files?.[0])}
        />
      </label>
    ) : undefined;

  return (
    <NodeShell type="video" id={id} status={data.status} error={data.error} selected={selected} actions={actions}>
      {okContent ? (
        <div className="media-wrap">
          <video className="media" controls preload="metadata" src={fileUrl(okContent)} onError={() => markBroken(okContent.path)} />
        </div>
      ) : refs && refs.length > 0 ? (
        <div className="media-stack">
          {refs.map((ref) => (
            <video key={ref.path} className="media" controls preload="metadata" src={fileUrl(ref)} onError={() => markBroken(ref.path)} />
          ))}
        </div>
      ) : data.hasInput ? (
        // Block sẽ tự tạo/ghép video khi Run → không cho upload hay nhập link
        <div className="gen-placeholder" aria-hidden="true" />
      ) : (
        <>
          <label className="upload-btn nodrag">
            {uploading ? 'Đang tải lên…' : 'Tải video lên'}
            <input
              type="file"
              accept="video/*"
              className="visually-hidden"
              disabled={uploading}
              onChange={(e) => handleUpload(e.target.files?.[0])}
            />
          </label>
          <label className="field-label">
            Link YouTube
            <input
              type="text"
              className="nodrag url-input"
              placeholder="Dán link YouTube…"
              value={sourceUrl}
              onChange={(e) => setConfig({ sourceUrl: e.target.value, content: undefined })}
            />
          </label>
        </>
      )}
      {/* Cấu hình tạo video chỉ áp dụng khi block tự generate (có input nối vào) */}
      {data.hasInput && (
        <div className="config-row">
          <select
            aria-label="Provider tạo video"
            className="nodrag"
            value={provider}
            onChange={(e) => setConfig({ provider: e.target.value })}
          >
            <option value="flow">Google Flow</option>
            <option value="grok">Grok Imagine</option>
          </select>
          {/* Model Veo + thời lượng chỉ áp dụng cho Google Flow; Grok Imagine không có các tuỳ chọn này */}
          {provider !== 'grok' && (
            <select
              aria-label="Model tạo video"
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
          {provider !== 'grok' && (
            <select
              aria-label="Thời lượng video"
              className="nodrag"
              value={String(duration)}
              onChange={(e) => setConfig({ duration: Number(e.target.value) })}
            >
              <option value="4">4s</option>
              <option value="6">6s</option>
              <option value="8">8s</option>
              <option value="10">10s</option>
            </select>
          )}
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
      )}
    </NodeShell>
  );
}
