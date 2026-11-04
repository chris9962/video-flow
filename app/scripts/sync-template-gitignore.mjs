// Quét data/node-templates/ → tìm mọi ảnh trong data/assets/ mà node mẫu tham chiếu → ghi lại .gitignore
// để node mẫu + ĐÚNG những ảnh đó được track (commit), phần data còn lại vẫn ignore.
// Chạy mỗi khi thêm/sửa node mẫu: node scripts/sync-template-gitignore.mjs
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.join(import.meta.dirname, '..');
const TPL_DIR = path.join(ROOT, 'data', 'node-templates');

const assets = new Set();
if (existsSync(TPL_DIR)) {
  for (const f of readdirSync(TPL_DIR).filter((x) => x.endsWith('.json'))) {
    const txt = readFileSync(path.join(TPL_DIR, f), 'utf8');
    for (const m of txt.matchAll(/data\/assets\/([^"\\]+\.(?:png|jpg|jpeg|webp|gif))/g)) assets.add(m[1]);
  }
}
const refs = [...assets].sort();
const missing = refs.filter((r) => !existsSync(path.join(ROOT, 'data', 'assets', r)));

const lines = [
  'node_modules/',
  'dist/',
  '',
  '# data/ bị ignore TRỪ node-templates (node mẫu) + đúng những asset mà node mẫu tham chiếu.',
  '# Phần "!data/assets/..." dưới đây do scripts/sync-template-gitignore.mjs tự sinh — đừng sửa tay.',
  'data/*',
  '!data/node-templates/',
  '!data/assets/',
  'data/assets/*',
  ...refs.map((r) => `!data/assets/${r}`),
  '',
  '*.local',
  '.DS_Store',
  '',
];
writeFileSync(path.join(ROOT, '.gitignore'), lines.join('\n'));
console.log(`✓ .gitignore cập nhật: ${refs.length} ảnh từ node mẫu được track.`);
if (missing.length) console.log('⚠ ảnh template KHÔNG còn trên đĩa (bỏ qua):', missing);
