import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { SETTINGS_FILE } from './paths';

export interface Settings {
  falKey: string;
  /** Claude Code OAuth token (sk-ant-oat…) cho AI Workflow Builder — lưu ở data/ (gitignored) */
  claudeToken: string;
}

const DEFAULTS: Settings = { falKey: '', claudeToken: '' };

export async function readSettings(): Promise<Settings> {
  try {
    return { ...DEFAULTS, ...JSON.parse(await readFile(SETTINGS_FILE, 'utf8')) };
  } catch {
    return { ...DEFAULTS };
  }
}

export async function writeSettings(settings: Partial<Settings>): Promise<Settings> {
  const merged = { ...(await readSettings()), ...settings };
  await mkdir(path.dirname(SETTINGS_FILE), { recursive: true });
  await writeFile(SETTINGS_FILE, JSON.stringify(merged, null, 2));
  return merged;
}
