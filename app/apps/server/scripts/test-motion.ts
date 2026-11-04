// E2E test block "Trích Prompt (Video)": npx tsx scripts/test-motion.ts [đường-dẫn-video]
// Cần Chrome CDP mở + đăng nhập Gemini.
import { createVideoUnderstandingService } from '../src/services/gemini-video-impl';

const svc = createVideoUnderstandingService();
const video =
  process.argv[2] ?? '/Users/nguyentruong/Desktop/kling_20260505_Motion_Control__715_0.mp4';

const t0 = Date.now();
svc
  .extractPrompt(video)
  .then((prompt) => {
    console.log(`\n=== PROMPT TRÍCH RA (${Math.round((Date.now() - t0) / 1000)}s) ===\n${prompt}`);
    process.exit(0);
  })
  .catch((e) => {
    console.error('FAIL:', e instanceof Error ? e.message : e);
    process.exit(1);
  });
