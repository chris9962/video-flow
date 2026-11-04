import type { FileRef, NodeTemplate, Workflow } from '@videoflow/shared';

async function asJson<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}

export interface AiBuildOp {
  op: 'addNode' | 'addEdge' | 'updateNode' | 'deleteNode';
  tempId?: string;
  type?: string;
  config?: Record<string, unknown>;
  position?: { x: number; y: number };
  source?: string;
  target?: string;
  targetPort?: string;
  id?: string;
}
export interface AiBuildResult {
  reply: string;
  ops: AiBuildOp[];
  review?: string;
}

export const aiBuild = (
  message: string,
  workflow: { nodes: unknown[]; edges: unknown[] },
  workflowId?: string,
  selectedNodeIds?: string[],
): Promise<AiBuildResult> =>
  fetch('/api/ai/build', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ message, workflow, workflowId, selectedNodeIds }),
  }).then((r) => asJson<AiBuildResult>(r));

export const getAiChat = (
  workflowId: string,
): Promise<{ messages: { role: 'user' | 'ai'; text: string }[] }> =>
  fetch(`/api/ai/chat/${workflowId}`).then((r) =>
    asJson<{ messages: { role: 'user' | 'ai'; text: string }[] }>(r),
  );

export const listWorkflows = (): Promise<Workflow[]> =>
  fetch('/api/workflows').then((r) => asJson<Workflow[]>(r));

export const getWorkflow = (id: string): Promise<Workflow> =>
  fetch(`/api/workflows/${id}`).then((r) => asJson<Workflow>(r));

export const saveWorkflow = (workflow: Workflow): Promise<Workflow> =>
  fetch(`/api/workflows/${workflow.id}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(workflow),
  }).then((r) => asJson<Workflow>(r));

export const deleteWorkflow = async (id: string): Promise<void> => {
  const res = await fetch(`/api/workflows/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`API error ${res.status}`);
};

export const startRun = (
  id: string,
  from?: string | string[],
): Promise<{ runId: string }> =>
  fetch(`/api/workflows/${id}/run`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(from && (Array.isArray(from) ? from.length > 0 : true) ? { from } : {}),
  }).then((r) => asJson<{ runId: string }>(r));

export const stopRun = async (runId: string): Promise<void> => {
  await fetch(`/api/runs/${runId}/stop`, { method: 'POST' });
};

export const fileUrl = (ref: FileRef): string => `/api/files?path=${encodeURIComponent(ref.path)}`;

export const uploadAsset = (file: File): Promise<FileRef> => {
  const form = new FormData();
  form.append('file', file);
  return fetch('/api/assets', { method: 'POST', body: form }).then((r) => asJson<FileRef>(r));
};

export interface RunSummary {
  runId: string;
  workflowId: string;
  workflowName: string;
  status: string;
  startedAt: string;
  finishedAt?: string;
}

export const listRuns = (): Promise<RunSummary[]> =>
  fetch('/api/runs').then((r) => asJson<RunSummary[]>(r));

export interface RunNodeOutput {
  nodeId: string;
  output: { out: unknown; content: unknown };
}
export interface RunDetail extends RunSummary {
  nodes: RunNodeOutput[];
}

export const getRun = (id: string): Promise<RunDetail> =>
  fetch(`/api/runs/${id}`).then((r) => asJson<RunDetail>(r));

type SettingsStatus = { falKeyConfigured: boolean; claudeTokenConfigured: boolean };

export const getSettings = (): Promise<SettingsStatus> =>
  fetch('/api/settings').then((r) => asJson<SettingsStatus>(r));

export const saveSettings = (patch: { falKey?: string; claudeToken?: string }): Promise<SettingsStatus> =>
  fetch('/api/settings', {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(patch),
  }).then((r) => asJson<SettingsStatus>(r));

export interface TemplateSummary {
  id: string;
  name: string;
  description?: string;
}

export const listTemplates = (): Promise<TemplateSummary[]> =>
  fetch('/api/templates').then((r) => asJson<TemplateSummary[]>(r));

export const instantiateTemplate = (id: string): Promise<Workflow> =>
  fetch(`/api/templates/${id}/instantiate`, { method: 'POST' }).then((r) => asJson<Workflow>(r));

export const listNodeTemplates = (): Promise<NodeTemplate[]> =>
  fetch('/api/node-templates').then((r) => asJson<NodeTemplate[]>(r));

export const getNodeTemplate = (id: string): Promise<NodeTemplate> =>
  fetch(`/api/node-templates/${id}`).then((r) => asJson<NodeTemplate>(r));

export const createNodeTemplate = (input: Omit<NodeTemplate, 'id'>): Promise<NodeTemplate> =>
  fetch('/api/node-templates', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  }).then((r) => asJson<NodeTemplate>(r));

export const updateNodeTemplate = (template: NodeTemplate): Promise<NodeTemplate> =>
  fetch(`/api/node-templates/${template.id}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(template),
  }).then((r) => asJson<NodeTemplate>(r));

export const deleteNodeTemplate = async (id: string): Promise<void> => {
  const res = await fetch(`/api/node-templates/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`API error ${res.status}`);
};

export const openBrowserLogin = async (provider: 'chatgpt' | 'claude' | 'gemini'): Promise<void> => {
  const res = await fetch(`/api/browser/login/${provider}`, { method: 'POST' });
  if (!res.ok) throw new Error(`API error ${res.status}`);
};

export const openSiteLogin = async (site: 'kling' | 'flow' | 'grok'): Promise<void> => {
  const res = await fetch(`/api/browser/open-site/${site}`, { method: 'POST' });
  if (!res.ok) throw new Error(`API error ${res.status}`);
};
