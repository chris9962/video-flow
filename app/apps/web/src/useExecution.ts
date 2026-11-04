import { useEffect, useState } from 'react';
import type { ExecutionEvent, NodeStatus, RunStatus } from '@videoflow/shared';

export interface RunLogEntry {
  time: string;
  nodeId?: string;
  level: NodeStatus | 'info';
  text: string;
}

export interface ExecutionState {
  statuses: Record<string, NodeStatus>;
  results: Record<string, Record<string, unknown>>;
  errors: Record<string, string>;
  log: RunLogEntry[];
  running: boolean;
  lastRun: RunStatus | null;
  runWorkflowId: string | null;
  runId: string | null;
}

const now = () => new Date().toLocaleTimeString('vi-VN', { hour12: false });

const STATUS_TEXT: Record<NodeStatus, string> = {
  pending: 'chờ',
  running: 'đang chạy',
  done: 'xong',
  error: 'lỗi',
  skipped: 'bỏ qua',
};

export function useExecution(): ExecutionState {
  const [statuses, setStatuses] = useState<ExecutionState['statuses']>({});
  const [results, setResults] = useState<ExecutionState['results']>({});
  const [errors, setErrors] = useState<ExecutionState['errors']>({});
  const [log, setLog] = useState<RunLogEntry[]>([]);
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState<RunStatus | null>(null);
  const [runWorkflowId, setRunWorkflowId] = useState<string | null>(null);
  const [runId, setRunId] = useState<string | null>(null);

  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let closed = false;

    const handle = (msg: MessageEvent) => {
      const event = JSON.parse(msg.data as string) as ExecutionEvent;
      switch (event.kind) {
        case 'run-started':
          setStatuses({});
          setResults({});
          setErrors({});
          setRunning(true);
          setLastRun(null);
          setRunWorkflowId(event.workflowId);
          setRunId(event.runId);
          setLog([{ time: now(), level: 'info', text: 'Bắt đầu chạy workflow' }]);
          break;
        case 'node-status':
          setStatuses((s) => ({ ...s, [event.nodeId]: event.status }));
          if (event.error) setErrors((e) => ({ ...e, [event.nodeId]: event.error! }));
          setLog((l) => [
            ...l,
            {
              time: now(),
              nodeId: event.nodeId,
              level: event.status,
              text: event.error ? `${STATUS_TEXT[event.status]} — ${event.error}` : STATUS_TEXT[event.status],
            },
          ]);
          break;
        case 'node-result':
          setResults((r) => ({ ...r, [event.nodeId]: event.outputs }));
          break;
        case 'run-finished': {
          setRunning(false);
          setLastRun(event.status);
          const text =
            event.status === 'done'
              ? 'Hoàn thành ✓'
              : event.status === 'cancelled'
                ? 'Đã dừng'
                : 'Kết thúc với lỗi ✗';
          setLog((l) => [...l, { time: now(), level: 'info', text }]);
          break;
        }
      }
    };

    // Tự kết nối lại khi WS đứt (vd server restart lúc dev) — nếu không sẽ mất hết event
    const connect = () => {
      ws = new WebSocket(`ws://${location.host}/ws`);
      ws.onmessage = handle;
      ws.onclose = () => {
        if (!closed) reconnectTimer = setTimeout(connect, 1000);
      };
    };
    connect();

    return () => {
      closed = true;
      clearTimeout(reconnectTimer);
      ws.close();
    };
  }, []);

  return { statuses, results, errors, log, running, lastRun, runWorkflowId, runId };
}
