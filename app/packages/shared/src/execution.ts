export type NodeStatus = 'pending' | 'running' | 'done' | 'error' | 'skipped';

export type RunStatus = 'done' | 'error' | 'cancelled';

export type ExecutionEvent =
  | { kind: 'run-started'; runId: string; workflowId: string }
  | { kind: 'node-status'; runId: string; nodeId: string; status: NodeStatus; error?: string }
  | { kind: 'node-result'; runId: string; nodeId: string; outputs: Record<string, unknown> }
  | { kind: 'run-finished'; runId: string; status: RunStatus };
