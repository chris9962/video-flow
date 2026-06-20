import { useState } from 'react';
import { useReactFlow, type NodeProps } from '@xyflow/react';
import { isFileRef } from '@videoflow/shared';
import { fileUrl, uploadAsset } from '../../api';
import { NodeShell } from '../NodeShell';
import type { FlowNode } from '../types';

/**
 * Trích Prompt (Video): trên = nguồn video (upload trong block, hoặc nối 1 video vào cổng Video);
 * dưới = prompt chuyển động Gemini trích ra khi Run (sửa được, kéo cổng out làm input block khác).
 */
export function MotionBlock({ id, data, selected }: NodeProps<FlowNode>) {
  const { updateNodeData } = useReactFlow();
  const [uploading, setUploading] = useState(false);
  const { config } = data;
  const video = isFileRef(config.video) ? config.video : null;
  // content = prompt trích ra (output); result mới nhất sau Run ưu tiên hơn config đã lưu
  const extracted = data.result?.content ?? config.content;
  const promptText = typeof extracted === 'string' ? extracted : '';

  const setConfig = (patch: Record<string, unknown>) =>
    updateNodeData(id, { config: { ...config, ...patch } });

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const ref = await uploadAsset(file);
      setConfig({ video: ref });
    } finally {
      setUploading(false);
    }
  };

  const actions = video ? (
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
    <NodeShell type="motion" id={id} status={data.status} error={data.error} selected={selected} actions={actions}>
      {video ? (
        <div className="media-wrap">
          <video className="media" controls preload="metadata" src={fileUrl(video)} />
        </div>
      ) : data.hasInput ? (
        // Đã nối 1 video vào cổng Video → dùng video đó, không cần upload
        <div className="gen-placeholder" aria-hidden="true" />
      ) : (
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
      )}

      <label className="field-label">
        Prompt trích ra
        <textarea
          className="nodrag"
          placeholder="Chạy để Gemini xem video và trích prompt chuyển động…"
          value={promptText}
          onChange={(e) => setConfig({ content: e.target.value })}
        />
      </label>
    </NodeShell>
  );
}
