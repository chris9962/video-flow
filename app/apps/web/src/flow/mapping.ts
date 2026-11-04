import type { Edge } from '@xyflow/react';
import type { NodeTemplate, Workflow, WorkflowEdge, WorkflowNode } from '@videoflow/shared';
import type { FlowNode } from './types';

/** Lấy width/height đã resize (React Flow v12 set node.width/height khi kéo NodeResizer) */
const sizeOf = (n: { width?: number | null; height?: number | null }) => ({
  ...(n.width != null ? { width: n.width } : {}),
  ...(n.height != null ? { height: n.height } : {}),
});

/** Phần đang chọn (1+ node) trên canvas → nodes/edges cho node mẫu; toạ độ chuẩn hoá về góc trái-trên. */
export function selectionToTemplateParts(
  flowNodes: FlowNode[],
  edges: Edge[],
): { nodes: WorkflowNode[]; edges: WorkflowEdge[] } {
  const picked = flowNodes.filter((n) => n.selected);
  if (picked.length === 0) return { nodes: [], edges: [] };
  const ids = new Set(picked.map((n) => n.id));
  const minX = Math.min(...picked.map((n) => n.position.x));
  const minY = Math.min(...picked.map((n) => n.position.y));
  return {
    nodes: picked.map((n) => ({
      id: n.id,
      type: n.type ?? 'text',
      position: { x: n.position.x - minX, y: n.position.y - minY },
      config: n.data.config,
      ...sizeOf(n),
    })),
    edges: edges
      .filter((e) => ids.has(e.source) && ids.has(e.target))
      .map((e) => ({
        id: e.id,
        source: { nodeId: e.source, port: e.sourceHandle ?? 'out' },
        target: { nodeId: e.target, port: e.targetHandle ?? 'in' },
      })),
  };
}

/** Node mẫu (sub-flow) → FlowNode/Edge với id MỚI, dời tới vị trí origin (giữ bố cục tương đối). */
export function templateToFlow(
  template: NodeTemplate,
  origin: { x: number; y: number },
): { nodes: FlowNode[]; edges: Edge[] } {
  const idMap = new Map(template.nodes.map((n) => [n.id, crypto.randomUUID()]));
  return {
    nodes: template.nodes.map((n) => ({
      id: idMap.get(n.id)!,
      type: n.type,
      position: { x: origin.x + n.position.x, y: origin.y + n.position.y },
      data: { config: n.config },
      selected: true,
      ...sizeOf(n),
    })),
    edges: template.edges.map((e) => ({
      id: crypto.randomUUID(),
      source: idMap.get(e.source.nodeId)!,
      sourceHandle: e.source.port,
      target: idMap.get(e.target.nodeId)!,
      targetHandle: e.target.port,
    })),
  };
}

export function toFlow(workflow: Workflow): { nodes: FlowNode[]; edges: Edge[] } {
  return {
    nodes: workflow.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: { config: n.config },
      ...sizeOf(n),
    })),
    edges: workflow.edges.map((e) => ({
      id: e.id,
      source: e.source.nodeId,
      sourceHandle: e.source.port,
      target: e.target.nodeId,
      targetHandle: e.target.port,
    })),
  };
}

/** Nhân bản độc lập: workflow mới + TOÀN BỘ node/edge id mới (tránh dùng chung id giữa các bản sao) */
export function cloneWithFreshIds(name: string, nodes: FlowNode[], edges: Edge[]): Workflow {
  const wf = fromFlow(crypto.randomUUID(), name, nodes, edges);
  const idMap = new Map(wf.nodes.map((n) => [n.id, crypto.randomUUID()]));
  return {
    ...wf,
    nodes: wf.nodes.map((n) => ({ ...n, id: idMap.get(n.id)! })),
    edges: wf.edges.map((e) => ({
      id: crypto.randomUUID(),
      source: { ...e.source, nodeId: idMap.get(e.source.nodeId)! },
      target: { ...e.target, nodeId: idMap.get(e.target.nodeId)! },
    })),
  };
}

export function fromFlow(id: string, name: string, nodes: FlowNode[], edges: Edge[]): Workflow {
  return {
    id,
    name,
    nodes: nodes.map((n) => ({
      id: n.id,
      type: n.type ?? 'text',
      position: { x: n.position.x, y: n.position.y },
      config: n.data.config,
      ...sizeOf(n),
    })),
    edges: edges.map((e) => ({
      id: e.id,
      source: { nodeId: e.source, port: e.sourceHandle ?? 'out' },
      target: { nodeId: e.target, port: e.targetHandle ?? 'in' },
    })),
  };
}
