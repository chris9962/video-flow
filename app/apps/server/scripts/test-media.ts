/**
 * Smoke test thủ công cho MediaService:
 *   npx tsx scripts/test-media.ts <youtube-url>
 */
import { mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createMediaService } from '../src/services/media-impl';

const url = process.argv[2];
if (!url) {
  console.error('Usage: npx tsx scripts/test-media.ts <youtube-url>');
  process.exit(1);
}

const media = createMediaService();
const outDir = await mkdtemp(path.join(os.tmpdir(), 'videoflow-media-'));
console.log('Out dir:', outDir);

console.log('Downloading', url, '...');
const { file, info } = await media.downloadVideo(url, outDir);
console.log('Downloaded:', file);
console.log('Title:', (info as { title?: string }).title ?? '(no info.json)');

console.log('Extracting context...');
const ctx = await media.extractVideoContext(file, outDir);
console.log('Frames:', ctx.framePaths.length);
for (const p of ctx.framePaths) console.log(' -', p);
console.log('Transcript length:', ctx.transcript.length);
if (ctx.transcript) console.log('Transcript preview:', ctx.transcript.slice(0, 200));
