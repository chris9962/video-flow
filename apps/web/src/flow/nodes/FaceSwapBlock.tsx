import { useReactFlow, type NodeProps } from '@xyflow/react';
import { isFileRef } from '@videoflow/shared';
import { fileUrl } from '../../api';
import { NodeShell } from '../NodeShell';
import type { FlowNode } from '../types';

const MODES = [
  { value: 'person', label: 'Đổi mặt người' },
  { value: 'object', label: 'Đổi đối tượng' },
  { value: 'background', label: 'Đổi nền' },
];

/** Face Swap: 1 video + 1 ảnh mặt → đổi mặt, giữ đồ/cảnh/động tác. 1 block = 1 video. */
export function FaceSwapBlock({ id, data, selected }: NodeProps<FlowNode>) {
  const { updateNodeData } = useReactFlow();
  const { config } = data;
  const content = data.result?.content ?? config.content;
  const mode = typeof config.mode === 'string' ? config.mode : 'person';
  const resolution = typeof config.resolution === 'string' ? config.resolution : '720p';

  const setConfig = (patch: Record<string, unknown>) =>
    updateNodeData(id, { config: { ...config, ...patch } });

  return (
    <NodeShell type="faceswap" id={id} status={data.status} error={data.error} selected={selected}>
      {isFileRef(content) ? (
        <div className="media-wrap">
          <video className="media" controls preload="metadata" src={fileUrl(content)} />
        </div>
      ) : (
        <div className="gen-placeholder" aria-hidden="true" />
      )}
      <div className="config-row">
        <select
          aria-label="Chế độ swap"
          className="nodrag"
          value={mode}
          onChange={(e) => setConfig({ mode: e.target.value })}
        >
          {MODES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Độ phân giải"
          className="nodrag"
          value={resolution}
          onChange={(e) => setConfig({ resolution: e.target.value })}
        >
          <option value="360p">360p</option>
          <option value="540p">540p</option>
          <option value="720p">720p</option>
        </select>
      </div>
    </NodeShell>
  );
}
