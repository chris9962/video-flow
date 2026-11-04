import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { DATA_DIR } from './paths';

// Chỉ lưu MAP workflowId → sessionId (Agent SDK). History thật do SDK lưu ở ~/.claude/projects,
// lấy lại bằng getSessionMessages — KHÔNG tự lưu messages. sessionId để resume (bộ nhớ) + biết get session nào.
const SESSIONS_FILE = path.join(DATA_DIR, 'ai-sessions.json');

async function readMap(): Promise<Record<string, string>> {
  try {
    return JSON.parse(await readFile(SESSIONS_FILE, 'utf8')) as Record<string, string>;
  } catch {
    return {};
  }
}

export async function getSession(workflowId: string): Promise<string | undefined> {
  return (await readMap())[workflowId];
}

export async function setSession(workflowId: string, sessionId: string): Promise<void> {
  const map = await readMap();
  map[workflowId] = sessionId;
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(SESSIONS_FILE, JSON.stringify(map, null, 2));
}
