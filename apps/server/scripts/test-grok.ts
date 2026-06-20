// Test input-path của Grok Imagine mà KHÔNG tốn credit: GROK_DRYRUN=1 npx tsx scripts/test-grok.ts [image|video]
// Cần Chrome CDP đang mở + đã đăng nhập grok.com (tự vượt Cloudflare 1 lần).
import { createGrokService } from '../src/services/grok-impl';

const svc = createGrokService();
const mode = process.argv[2] === 'video' ? 'video' : 'image';
const prompt =
  process.argv[3] ??
  'a young woman in an elegant dress walking through a sunlit garden, cinematic, slow camera push-in';

async function main() {
  if (mode === 'video') {
    await svc.generateVideo({ prompt, aspectRatio: '9:16', outFile: '/tmp/grok-out.mp4' });
  } else {
    await svc.generateImage({ prompt, aspectRatio: '2:3', outFile: '/tmp/grok-out.png' });
  }
  console.log(`OK — input path ${mode} chạy hết${process.env.GROK_DRYRUN === '1' ? ' (DRYRUN, không bấm Gửi)' : ''}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('FAIL:', e instanceof Error ? e.message : e);
    process.exit(1);
  });
