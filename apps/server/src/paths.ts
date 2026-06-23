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

/**
 * Resolve path của FileRef về ĐÚNG DATA_DIR của MÁY HIỆN TẠI — để node mẫu/workflow chuyển máy/folder
 * vẫn chạy (FileRef cũ lưu path tuyệt đối kiểu `/Users/.../data/assets/X`).
 * - tương đối → ghép vào DATA_DIR
 * - tuyệt đối đã nằm trong DATA_DIR này → giữ nguyên
 * - tuyệt đối từ MÁY KHÁC → lấy phần sau `/data/` rồi ghép vào DATA_DIR local (chạy được trên Windows/home khác)
 */
export function resolveDataPath(p: string): string {
  if (!p) return p;
  const norm = p.replace(/\\/g, '/'); // chuẩn hoá cả path Windows (\ → /)
  // Có "/data/" (path tuyệt đối từ MỌI máy/OS) → lấy phần SAU cùng rồi ghép vào DATA_DIR local
  const i = norm.lastIndexOf('/data/');
  if (i !== -1) {
    if (path.isAbsolute(p)) {
      const abs = path.resolve(p);
      if (abs.startsWith(path.resolve(DATA_DIR) + path.sep)) return abs; // đã đúng máy này
    }
    return path.resolve(DATA_DIR, norm.slice(i + '/data/'.length));
  }
  // Không có "/data/" → coi như tương đối với DATA_DIR
  return path.resolve(DATA_DIR, norm.replace(/^data\//, ''));
}
