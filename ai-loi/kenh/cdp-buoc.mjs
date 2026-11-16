// Chạy 1 bước trên tab trong profile Chrome "my", rồi chụp màn hình để Claude xem.
// node cdp-buoc.mjs <url-chứa|new:URL> "<code JS dùng biến p (Playwright Page)>" <ảnh.png>
const { connectCdp, newPageInProfile } = await import('file:///D:/Github/video-flow/.claude/skills/flow-chain-video/scripts/chrome-profile.mjs');
const [target, code, shot] = process.argv.slice(2);
const b = await connectCdp();
let p;
if (target.startsWith('new:')) p = await newPageInProfile(b, process.env.PROF || 'my', target.slice(4));
else p = b.contexts().flatMap(c => c.pages()).find(x => x.url().includes(target));
if (!p) { console.log('không thấy tab', target); process.exit(1); }
try {
  const r = await (new Function('p', `return (async () => { ${code || ''} })()`))(p);
  if (r !== undefined) console.log('kết quả:', typeof r === 'string' ? r : JSON.stringify(r));
} catch (e) { console.log('lỗi:', e.message.split('\n')[0]); }
await p.waitForTimeout(1500);
console.log('url:', p.url());
if (shot) await p.screenshot({ path: shot });
process.exit(0);
