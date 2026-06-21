import path from 'node:path';
import os from 'node:os';

/** Mọi dữ liệu nằm trong data/ ở root repo (đã gitignore) — file này ở apps/server/src */
export const DATA_DIR = path.join(import.meta.dirname, '..', '..', '..', 'data');
export const WORKFLOWS_DIR = path.join(DATA_DIR, 'workflows');
export const RUNS_DIR = path.join(DATA_DIR, 'runs');
export const ASSETS_DIR = path.join(DATA_DIR, 'assets');
export const BROWSER_PROFILE_DIR = path.join(DATA_DIR, 'browser-profile');
/** Profile Chrome CDP — TOÀN CỤC (~/chrome-cdp-profile) để mọi project dùng chung 1 login.
 *  Override bằng env CHROME_CDP_PROFILE. (Server thật ra nối qua CHROME_CDP_URL, path này chỉ tham khảo.) */
export const CHROME_CDP_PROFILE_DIR =
  process.env.CHROME_CDP_PROFILE || path.join(os.homedir(), 'chrome-cdp-profile');
export const CHROME_CDP_URL = process.env.CHROME_CDP_URL ?? 'http://127.0.0.1:9222';
export const BIN_DIR = path.join(DATA_DIR, 'bin');
export const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
