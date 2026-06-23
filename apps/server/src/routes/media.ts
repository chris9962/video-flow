import { createWriteStream } from 'node:fs';
import { mkdir, readdir, readFile } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import type { FastifyInstance } from 'fastify';
import multipart from '@fastify/multipart';
import type { FileRef } from '@videoflow/shared';
import { ASSETS_DIR, DATA_DIR, RUNS_DIR, resolveDataPath } from '../paths';
import { readSettings, writeSettings } from '../settings';

const MIME_BY_EXT: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
};

export function registerMediaRoutes(app: FastifyInstance): void {
  app.register(multipart, { limits: { fileSize: 1024 * 1024 * 1024 } });

  app.post('/api/assets', async (req, reply) => {
    const file = await req.file();
    if (!file) return reply.code(400).send({ error: 'thiếu file' });
    const ext = path.extname(file.filename).toLowerCase();
    const mime = MIME_BY_EXT[ext] ?? file.mimetype;
    await mkdir(ASSETS_DIR, { recursive: true });
    const dest = path.join(ASSETS_DIR, `${randomUUID()}${ext}`);
    await pipeline(file.file, createWriteStream(dest));
    const ref: FileRef = { kind: 'file', path: dest, mime };
    return ref;
  });

  // Serve file theo FileRef.path — chỉ cho phép file nằm trong data/
  app.get('/api/files', async (req, reply) => {
    const { path: filePath } = req.query as { path?: string };
    if (!filePath) return reply.code(400).send({ error: 'thiếu path' });
    // resolveDataPath: path tuyệt đối từ máy khác (node mẫu commit lên git) → map về DATA_DIR máy này
    const resolved = resolveDataPath(filePath);
    if (!resolved.startsWith(path.resolve(DATA_DIR) + path.sep)) {
      return reply.code(403).send({ error: 'path nằm ngoài data/' });
    }
    try {
      const content = await readFile(resolved);
      reply.header('content-type', MIME_BY_EXT[path.extname(resolved).toLowerCase()] ?? 'application/octet-stream');
      return reply.send(content);
    } catch {
      return reply.code(404).send({ error: 'không tìm thấy file' });
    }
  });

  app.get('/api/runs', async () => {
    let ids: string[];
    try {
      ids = await readdir(RUNS_DIR);
    } catch {
      return [];
    }
    const runs = await Promise.all(
      ids.map(async (id) => {
        try {
          return JSON.parse(await readFile(path.join(RUNS_DIR, id, 'run.json'), 'utf8'));
        } catch {
          return null;
        }
      }),
    );
    return runs
      .filter((r): r is Record<string, unknown> => r !== null)
      .sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt)));
  });

  // Chi tiết 1 run: meta + output từng node (đọc outputs.json trong từng thư mục node)
  app.get('/api/runs/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    if (!/^[A-Za-z0-9-]+$/.test(id)) return reply.code(400).send({ error: 'invalid id' });
    const dir = path.join(RUNS_DIR, id);
    let meta: Record<string, unknown>;
    try {
      meta = JSON.parse(await readFile(path.join(dir, 'run.json'), 'utf8'));
    } catch {
      return reply.code(404).send({ error: 'not found' });
    }
    let entries: import('node:fs').Dirent[] = [];
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      /* ignore */
    }
    const nodes = [];
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      try {
        const output = JSON.parse(await readFile(path.join(dir, e.name, 'outputs.json'), 'utf8'));
        nodes.push({ nodeId: e.name, output });
      } catch {
        /* node chưa có output (lỗi/chưa chạy) */
      }
    }
    return { ...meta, nodes };
  });

  app.get('/api/settings', async () => {
    const settings = await readSettings();
    // không trả key thật về client — chỉ báo đã cấu hình hay chưa
    return { falKeyConfigured: settings.falKey !== '', claudeTokenConfigured: settings.claudeToken !== '' };
  });

  app.put('/api/settings', async (req) => {
    const body = req.body as { falKey?: string; claudeToken?: string };
    const patch: { falKey?: string; claudeToken?: string } = {};
    if (typeof body.falKey === 'string') patch.falKey = body.falKey;
    if (typeof body.claudeToken === 'string') patch.claudeToken = body.claudeToken;
    const saved = await writeSettings(patch);
    return { falKeyConfigured: saved.falKey !== '', claudeTokenConfigured: saved.claudeToken !== '' };
  });
}
