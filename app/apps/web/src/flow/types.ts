import type { Node } from '@xyflow/react';
import type { NodeStatus } from '@videoflow/shared';

export type FlowNodeData = {
  config: Record<string, unknown>;
  /** Block có edge nối vào → sẽ generate khi Run thay vì làm nguồn */
  hasInput?: boolean;
  status?: NodeStatus;
  result?: Record<string, unknown>;
  error?: string;
};

export type FlowNode = Node<FlowNodeData>;
