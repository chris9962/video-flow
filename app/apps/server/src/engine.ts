import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  BLOCK_DEFINITIONS,
  isFileRef,
  type DataType,
  type ExecutionEvent,
  type FileRef,
  type RunStatus,
  type Workflow,
  type WorkflowEdge,
} from '@videoflow/shared';
import { getExecutable, type BlockInputs, type BlockResult, type PortInputs } from './nodes/registry';
import { resolveDataPath } from './paths';

const DEFAULT_RUNS_DIR = path.join(import.meta.dirname, '..', '..', '..', 'data', 'runs');

export interface RunOptions {
  runsDir?: string;
  /** Hủy run: dừng mở wave mới (node đang chạy sẽ chạy nốt) */
  signal?: AbortSignal;
  /** Chạy từ block này trở đi: các block phía trước dùng content đã có sẵn, không chạy lại */
  startNodeId?: string;
  /** Chạy từ NHIỀU block đang chọn cùng lúc: các nhánh độc lập chạy song song, cùng cây theo flow */
  startNodeIds?: string[];
}

export interface RunResult {
  status: RunStatus;
  /** Content mới của các block đã generate (có input) — để apply ngược vào workflow */
  contents: Record<string, unknown>;
}

const toText = (value: unknown): string =>
  typeof value === 'string' ? value : JSON.stringify(value, null, 2);

function toFileRef(value: unknown, sourceType: DataType): FileRef {
  if (!isFileRef(value)) {
    throw new Error(`Output của block ${sourceType} phía trước không phải file`);
  }
  // resolve path về DATA_DIR máy hiện tại → node mẫu/workflow chuyển máy vẫn đọc đúng file
  return { ...value, path: resolveDataPath(value.path) };
}

export async function runWorkflow(
  workflow: Workflow,
  runId: string,
  emit: (event: ExecutionEvent) => void,
  options: RunOptions = {},
): Promise<RunResult> {
  const runsDir = options.runsDir ?? DEFAULT_RUNS_DIR;
  const runDir = path.join(runsDir, runId);
  const startedAt = new Date().toISOString();
  emit({ kind: 'run-started', runId, workflowId: workflow.id });

  const nodeById = new Map(workflow.nodes.map((n) => [n.id, n]));
  const incoming = new Map<string, WorkflowEdge[]>();
  for (const node of workflow.nodes) incoming.set(node.id, []);
  for (const edge of workflow.edges) incoming.get(edge.target.nodeId)?.push(edge);

  const results = new Map<string, BlockResult>();
  const contents: Record<string, unknown> = {};
  const done = new Set<string>();
  const dead = new Set<string>(); // error hoặc skipped
  let hadError = false;
  let cancelled = false;

  // Chạy từ (các) block chọn: những block đó + mọi block phía sau mới chạy; block phía trước
  // coi như đã xong, lấy output từ content đã lưu (không chạy lại, không tốn tiền/thời gian).
  // Nhiều start độc lập → các nhánh chạy SONG SONG (wave + Promise.all); cùng cây → theo thứ tự flow.
  const startIds = options.startNodeIds?.length
    ? options.startNodeIds
    : options.startNodeId
      ? [options.startNodeId]
      : [];
  if (startIds.length > 0) {
    const outgoing = new Map<string, string[]>();
    for (const edge of workflow.edges) {
      (outgoing.get(edge.source.nodeId) ?? outgoing.set(edge.source.nodeId, []).get(edge.source.nodeId)!).push(
        edge.target.nodeId,
      );
    }
    const target = new Set<string>();
    const stack = [...startIds];
    while (stack.length) {
      const id = stack.pop()!;
      if (target.has(id)) continue;
      target.add(id);
      for (const next of outgoing.get(id) ?? []) stack.push(next);
    }
    // Tổ tiên (ngược cạnh) của mọi start — cần để tạo input nếu upstream chưa cache content.
    const ancestors = new Set<string>();
    const astack = startIds.flatMap((id) => (incoming.get(id) ?? []).map((e) => e.source.nodeId));
    while (astack.length) {
      const id = astack.pop()!;
      if (ancestors.has(id) || target.has(id)) continue;
      ancestors.add(id);
      for (const e of incoming.get(id) ?? []) astack.push(e.source.nodeId);
    }
    for (const node of workflow.nodes) {
      if (target.has(node.id)) continue;
      if ('content' in node.config) {
        // Upstream có content → dùng lại, không chạy lại (không tốn tiền/thời gian)
        results.set(node.id, { out: node.config.content });
        done.add(node.id);
      } else if (!ancestors.has(node.id)) {
        // Node KHÔNG thuộc nhánh "chạy từ đây" và KHÔNG phải tổ tiên của start (nhánh độc lập)
        // → KHÔNG chạy. Trước đây node loại này lọt vào wave nếu input tình cờ sẵn → chạy lan.
        dead.add(node.id);
      }
      // Tổ tiên không có content → để nguyên: wave sẽ chạy nó để tạo input cho start.
    }
  }

  const propagateSkips = () => {
    let changed = true;
    while (changed) {
      changed = false;
      for (const node of workflow.nodes) {
        if (done.has(node.id) || dead.has(node.id)) continue;
        if (incoming.get(node.id)!.some((e) => dead.has(e.source.nodeId))) {
          dead.add(node.id);
          emit({ kind: 'node-status', runId, nodeId: node.id, status: 'skipped' });
          changed = true;
        }
      }
    }
  };

  while (true) {
    if (options.signal?.aborted) {
      cancelled = true;
      for (const node of workflow.nodes) {
        if (!done.has(node.id) && !dead.has(node.id)) {
          dead.add(node.id);
          emit({ kind: 'node-status', runId, nodeId: node.id, status: 'skipped' });
        }
      }
      break;
    }
    propagateSkips();
    const wave = workflow.nodes.filter(
      (node) =>
        !done.has(node.id) &&
        !dead.has(node.id) &&
        incoming.get(node.id)!.every((e) => done.has(e.source.nodeId)),
    );
    if (wave.length === 0) break;

    await Promise.all(
      wave.map(async (node) => {
        emit({ kind: 'node-status', runId, nodeId: node.id, status: 'running' });
        try {
          const executable = getExecutable(node.type);
          const def = executable.definition;
          const dir = path.join(runDir, node.id);
          await mkdir(dir, { recursive: true });

          const edges = incoming.get(node.id)!;
          const portList = def.inputs;
          // Cổng cũ/không khớp (vd 'in' từ workflow lưu trước khi tách port) → định tuyến vào
          // cổng đầu tiên nhận đúng loại nguồn, để workflow cũ vẫn chạy
          const resolvePort = (portId: string, srcType: DataType): string => {
            if (!portList || portList.some((p) => p.id === portId)) return portId;
            return portList.find((p) => p.accepts.includes(srcType))?.id ?? portId;
          };
          // Accepts theo từng cổng (block nhiều cổng: start/prompt/end); block 1 cổng dùng accepts chung
          const portAccepts = (portId: string): DataType[] =>
            portList ? (portList.find((p) => p.id === portId) ?? portList[0]).accepts : def.accepts;
          const wholeVideos: { value: unknown; port: string }[] = [];
          const mapped: { type: DataType; value: unknown; port: string }[] = [];
          // Bỏ edge trùng cùng (nguồn, cổng-đã-resolve): workflow cũ có cả cổng 'in' legacy lẫn
          // start/prompt/end mới từ CÙNG nguồn → 'in' resolve về đúng cổng đó → tránh nhân đôi input
          // (vd prompt bị join "TEXT\\n\\nTEXT" gây Flow submit 2 lần).
          const seenEdge = new Set<string>();
          for (const edge of edges) {
            const src = nodeById.get(edge.source.nodeId);
            // Loại data nguồn = emits của block (block kling/faceswap có type riêng nhưng phát 'video')
            const srcType = (src ? (BLOCK_DEFINITIONS[src.type]?.emits ?? src.type) : undefined) as DataType;
            const port = resolvePort(edge.target.port, srcType);
            if (!portAccepts(port).includes(srcType)) {
              throw new Error(
                `Cổng "${edge.target.port}" của block ${def.label} không nhận input từ block ${srcType}`,
              );
            }
            const edgeKey = `${edge.source.nodeId}|${port}`;
            if (seenEdge.has(edgeKey)) continue;
            seenEdge.add(edgeKey);
            const value = results.get(edge.source.nodeId)?.out;
            if (def.consumeWhole?.includes(srcType)) {
              for (const v of Array.isArray(value) ? value : [value]) wholeVideos.push({ value: v, port });
            } else {
              mapped.push({ type: srcType, value, port });
            }
          }

          const lengths = mapped
            .filter((m) => Array.isArray(m.value))
            .map((m) => (m.value as unknown[]).length);
          if (new Set(lengths).size > 1) {
            throw new Error(`Các nhánh fan-out có độ dài khác nhau: ${lengths.join(', ')}`);
          }
          const fanOut = lengths.length > 0;

          const buildInputs = (i: number): BlockInputs => {
            const byPort: Record<string, PortInputs> = {};
            const port = (id: string): PortInputs => (byPort[id] ??= { texts: [], images: [], videos: [] });
            const inputs: BlockInputs = { texts: [], images: [], videos: [], byPort };
            for (const wv of wholeVideos) {
              const ref = toFileRef(wv.value, 'video');
              inputs.videos.push(ref);
              port(wv.port).videos.push(ref);
            }
            for (const m of mapped) {
              const value = Array.isArray(m.value) ? m.value[i] : m.value;
              if (value === undefined || value === null) continue;
              if (m.type === 'text') {
                const t = toText(value);
                inputs.texts.push(t);
                port(m.port).texts.push(t);
              } else if (m.type === 'image') {
                const ref = toFileRef(value, m.type);
                inputs.images.push(ref);
                port(m.port).images.push(ref);
              } else {
                const ref = toFileRef(value, m.type);
                inputs.videos.push(ref);
                port(m.port).videos.push(ref);
              }
            }
            return inputs;
          };

          let result: BlockResult;
          if (!fanOut) {
            result = await executable.execute({ config: node.config, inputs: buildInputs(0), dir });
          } else {
            // Fan-out chạy SONG SONG — pool per-provider (browser-pilot) + pool Flow tự giới hạn số
            // tab/cửa sổ thật chạy đồng thời. Promise.all giữ nguyên thứ tự kết quả.
            const rs = await Promise.all(
              Array.from({ length: lengths[0] }, (_, i) =>
                executable.execute({ config: node.config, inputs: buildInputs(i), dir, itemIndex: i }),
              ),
            );
            result = { out: rs.map((r) => r.out), content: rs.map((r) => r.content ?? r.out) };
          }

          results.set(node.id, result);
          done.add(node.id);
          // Apply-back content khi: block có input (generate), HOẶC block tự sinh content khác content
          // cũ dù không nối input (vd block 'motion' trích prompt từ video đã upload trong block).
          if (edges.length > 0 || (result.content !== undefined && result.content !== node.config.content)) {
            contents[node.id] = result.content ?? result.out;
          }
          await writeFile(path.join(dir, 'outputs.json'), JSON.stringify(result, null, 2));
          emit({
            kind: 'node-result',
            runId,
            nodeId: node.id,
            outputs: { out: result.out, content: result.content ?? result.out },
          });
          emit({ kind: 'node-status', runId, nodeId: node.id, status: 'done' });
        } catch (err) {
          hadError = true;
          dead.add(node.id);
          emit({
            kind: 'node-status',
            runId,
            nodeId: node.id,
            status: 'error',
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }),
    );
  }

  const status: RunStatus = cancelled ? 'cancelled' : hadError ? 'error' : 'done';
  await mkdir(runDir, { recursive: true });
  await writeFile(
    path.join(runDir, 'run.json'),
    JSON.stringify(
      {
        runId,
        workflowId: workflow.id,
        workflowName: workflow.name,
        status,
        startedAt,
        finishedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );
  emit({ kind: 'run-finished', runId, status });
  return { status, contents };
}
