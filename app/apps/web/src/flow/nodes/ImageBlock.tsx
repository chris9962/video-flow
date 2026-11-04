import { useState } from 'react';
import { useReactFlow, type NodeProps } from '@xyflow/react';
import { isFileRef, type FileRef } from '@videoflow/shared';
import { fileUrl, uploadAsset } from '../../api';
import { NodeShell } from '../NodeShell';
import { Lightbox } from '../../components/Lightbox';
import { useBrokenSrc } from '../useBrokenSrc';
import type { FlowNode } from '../types';

export function ImageBlock({ id, data, selected }: NodeProps<FlowNode>) {
  const { updateNodeData } = useReactFlow();
  const [uploading, setUploading] = useState(false);
  const [zoom, setZoom] = useState<string | null>(null);
  const { isBroken, markBroken } = useBrokenSrc();
  const content = data.result?.content ?? data.config.content;
  // Bỏ qua ảnh tải lỗi (file thiếu/404) → block hiện như chưa có ảnh
  const okContent = isFileRef(content) && !isBroken(content.path) ? content : null;
  const refs = Array.isArray(content)
    ? content.filter(isFileRef).filter((r) => !isBroken(r.path))
    : null;

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const ref = await uploadAsset(file);
      updateNodeData(id, { config: { ...data.config, content: ref } });
    } finally {
      setUploading(false);
    }
  };

  const primaryUrl = okContent ? fileUrl(okContent) : refs?.[0] ? fileUrl(refs[0]) : null;
  const isSource = !data.hasInput;

  // Action icon ở thanh trên block: ⤢ mở rộng, ⟳ đổi ảnh (block nguồn đã có ảnh)
  const actions = (
    <>
      {primaryUrl && (
        <button
          type="button"
          className="node-tool"
          aria-label="Xem toàn màn hình"
          title="Xem toàn màn hình"
          onClick={() => setZoom(primaryUrl)}
        >
          ⤢
        </button>
      )}
      {isSource && isFileRef(content) && (
        <label className="node-tool" aria-label="Đổi ảnh" title="Đổi ảnh khác">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M11.4 2.6l2 2L6 12l-2.7.7.7-2.7z" />
            <path d="M10.3 3.7l2 2" />
          </svg>
          <input
            type="file"
            accept="image/*"
            className="visually-hidden"
            disabled={uploading}
            onChange={(e) => handleUpload(e.target.files?.[0])}
          />
        </label>
      )}
    </>
  );

  const tile = (ref: FileRef, alt: string) => {
    const url = fileUrl(ref);
    return (
      <div className="media-wrap" key={ref.path}>
        <img
          className="media"
          alt={alt}
          src={url}
          onError={() => markBroken(ref.path)}
          onDoubleClick={() => setZoom(url)}
          title="Double-click để xem toàn màn hình"
        />
      </div>
    );
  };

  return (
    <NodeShell type="image" id={id} status={data.status} error={data.error} selected={selected} actions={actions}>
      {okContent ? (
        tile(okContent, 'Nội dung block ảnh')
      ) : refs && refs.length > 0 ? (
        <div className="media-grid">{refs.map((ref, i) => tile(ref, `Ảnh kết quả ${i + 1}`))}</div>
      ) : data.hasInput ? (
        <div className="gen-placeholder" aria-hidden="true" />
      ) : (
        <label className="upload-btn upload-area nodrag">
          {uploading ? 'Đang tải lên…' : 'Tải ảnh lên'}
          <input
            type="file"
            accept="image/*"
            className="visually-hidden"
            disabled={uploading}
            onChange={(e) => handleUpload(e.target.files?.[0])}
          />
        </label>
      )}
      {/* Block ảnh có input ⇒ tạo/ghép ảnh — chọn provider ở ĐÁY block */}
      {data.hasInput && (
        <div className="config-row">
          <label className="agent-label">
            Agent
            <select
              aria-label="Provider tạo ảnh"
              className="nodrag"
              value={typeof data.config.provider === 'string' ? data.config.provider : 'chatgpt'}
              onChange={(e) => updateNodeData(id, { config: { ...data.config, provider: e.target.value } })}
            >
              <option value="chatgpt">ChatGPT (tạo ảnh)</option>
              <option value="gemini">Gemini (ghép đồ)</option>
              <option value="grok">Grok Imagine</option>
            </select>
          </label>
          {data.config.provider === 'grok' && (
            <label className="agent-label">
              Tỷ lệ
              <select
                aria-label="Tỷ lệ khung hình"
                className="nodrag"
                value={typeof data.config.aspectRatio === 'string' ? data.config.aspectRatio : '2:3'}
                onChange={(e) => updateNodeData(id, { config: { ...data.config, aspectRatio: e.target.value } })}
              >
                <option value="2:3">2:3</option>
                <option value="3:2">3:2</option>
                <option value="1:1">1:1</option>
                <option value="16:9">16:9</option>
                <option value="9:16">9:16</option>
              </select>
            </label>
          )}
        </div>
      )}
      {zoom && <Lightbox src={zoom} kind="image" onClose={() => setZoom(null)} />}
    </NodeShell>
  );
}
