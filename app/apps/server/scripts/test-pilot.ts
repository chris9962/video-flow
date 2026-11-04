/**
 * Smoke test thủ công cho Browser Pilot.
 * Trước tiên: chạy `npm run chrome` và đăng nhập ChatGPT/Claude trong cửa sổ đó.
 * Rồi: npx tsx scripts/test-pilot.ts chatgpt "xin chào"
 */
import { getPilot, type LlmProvider } from '../src/services';
import { bootstrapBrowserServices } from '../src/services/bootstrap-browser';

const [providerArg = 'chatgpt', prompt = 'xin chào'] = process.argv.slice(2);

if (providerArg !== 'chatgpt' && providerArg !== 'claude') {
  console.error(`Provider không hợp lệ: "${providerArg}" — dùng "chatgpt" hoặc "claude"`);
  process.exit(1);
}
const provider: LlmProvider = providerArg;

bootstrapBrowserServices();

console.log(`[test-pilot] Gửi prompt tới ${provider}: ${prompt}`);
try {
  const reply = await getPilot().sendPrompt(provider, { prompt, imagePaths: [] });
  console.log('\n===== TRẢ LỜI =====\n');
  console.log(reply);
  process.exit(0);
} catch (err) {
  console.error('\n[test-pilot] Lỗi:', err instanceof Error ? err.message : err);
  process.exit(1);
}
