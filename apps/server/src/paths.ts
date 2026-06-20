import path from 'node:path';

/** Mọi dữ liệu nằm trong data/ ở root repo (đã gitignore) — file này ở apps/server/src */
export const DATA_DIR = path.join(import.meta.dirname, '..', '..', '..', 'data');
export const WORKFLOWS_DIR = path.join(DATA_DIR, 'workflows');
export const RUNS_DIR = path.join(DATA_DIR, 'runs');
export const ASSETS_DIR = path.join(DATA_DIR, 'assets');
export const BROWSER_PROFILE_DIR = path.join(DATA_DIR, 'browser-profile');
/** Profile cho Chrome bạn tự mở (CDP) — bạn đăng nhập tay 1 lần, server kết nối vào */
export const CHROME_CDP_PROFILE_DIR = path.join(DATA_DIR, 'chrome-cdp-profile');
export const CHROME_CDP_URL = process.env.CHROME_CDP_URL ?? 'http://127.0.0.1:9222';
export const BIN_DIR = path.join(DATA_DIR, 'bin');
export const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
