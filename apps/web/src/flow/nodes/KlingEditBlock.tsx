import { useReactFlow, type NodeProps } from '@xyflow/react';
import { isFileRef } from '@videoflow/shared';
import { fileUrl } from '../../api';
import { NodeShell } from '../NodeShell';
import { useBrokenSrc } from '../useBrokenSrc';
import type { FlowNode } from '../types';

/** Kling Edit: 1 video mẫu + prompt → đổi nền/nhân vật/style, giữ chuyển động. 1 block = 1 video. */
export function KlingEditBlock({ id, data, selected }: NodeProps<FlowNode>) {
  const { updateNodeData } = useReactFlow();
  const { config } = data;
  const { isBroken, markBroken } = useBrokenSrc();
  const content = data.result?.content ?? config.content;
  const okContent = isFileRef(content) && !isBroken(content.path) ? content : null;
  const keepAudio = config.keepAudio === true;

  const setConfig = (patch: Record<string, unknown>) =>
    updateNodeData(id, { config: { ...config, ...patch } });

  return (
    <NodeShell type="kling-edit" id={id} status={data.status} error={data.error} selected={selected}>
      {okContent ? (
        <div className="media-wrap">
          <video className="media" controls preload="metadata" src={fileUrl(okContent)} onError={() => markBroken(okContent.path)} />
        </div>
      ) : (
        <div className="gen-placeholder" aria-hidden="true" />
      )}
      <label className="config-check">
        <input
          type="checkbox"
          className="nodrag"
          checked={keepAudio}
          onChange={(e) => setConfig({ keepAudio: e.target.checked })}
        />
        Giữ audio gốc
      </label>
    </NodeShell>
  );
}
