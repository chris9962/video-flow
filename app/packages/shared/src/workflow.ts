export type DataType = 'text' | 'image' | 'video';

/** Content media của block — trỏ tới file trong data/, không nhét binary vào JSON */
export interface FileRef {
  kind: 'file';
  path: string;
  mime: string;
}

export function isFileRef(value: unknown): value is FileRef {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as FileRef).kind === 'file' &&
    typeof (value as FileRef).path === 'string'
  );
}

export interface WorkflowNode {
  id: string;
  type: string; // 'text' | 'image' | 'video'
  position: { x: number; y: number };
  config: Record<string, unknown>; // content + cấu hình agent (provider, model…)
  /** Kích thước sau khi user kéo NodeResizer — lưu để giữ size khi reload */
  width?: number;
  height?: number;
}

export interface WorkflowEdge {
  id: string;
  source: { nodeId: string; port: string }; // port luôn là 'out'
  target: { nodeId: string; port: string }; // port luôn là 'in'
}

export interface Workflow {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

/**
 * Node mẫu tái sử dụng = một sub-flow: 1 node, hoặc cả nhóm node + edge (kèm full config/prompt).
 * Lưu/sửa bằng canvas editor; thêm vào flow chính thì instantiate với id mới.
 */
export interface NodeTemplate {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  /** Prompt mẫu ship kèm app (read-only, không sửa/xoá được) */
  builtin?: boolean;
  /** Nhóm phân loại để hiển thị/lọc (chỉ builtin dùng) */
  category?: string;
}
