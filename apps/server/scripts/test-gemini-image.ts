/**
 * Test tạo ảnh bằng Gemini qua browser pilot.
 * Trước tiên: Chrome phải đang chạy với --remote-debugging-port=9222 và đã đăng nhập Gemini.
 * Chạy: npx tsx scripts/test-gemini-image.ts "prompt của bạn"
 */
import path from 'node:path';
import { bootstrapBrowserServices } from '../src/services/bootstrap-browser';
import { getPilot } from '../src/services';

const prompt = process.argv[2] ?? 'A beautiful sunset over a mountain landscape, photorealistic';
const outFile = path.resolve('../../data/test-gemini-output.png');

bootstrapBrowserServices();

console.log(`[test-gemini-image] Prompt: ${prompt}`);
console.log(`[test-gemini-image] Output: ${outFile}`);

try {
  await getPilot().generateImage({ provider: 'gemini', prompt, referenceImagePaths: [], outFile });
  console.log('\n✅ Tạo ảnh xong! File:', outFile);
  process.exit(0);
} catch (err) {
  console.error('\n❌ Lỗi:', err instanceof Error ? err.message : err);
  process.exit(1);
}
