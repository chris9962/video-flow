// Đọc trang qua CDP của riêng tab, không qua Playwright: kết nối Playwright mới đổi thư mục tải của Chrome.
const [id, expr, shot] = process.argv.slice(2);
const ws = new WebSocket(`ws://127.0.0.1:9222/devtools/page/${id}`);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let n = 0;
const call = (method, params) => new Promise((resolve) => {
  const mid = ++n;
  ws.addEventListener('message', function h(m) { const d = JSON.parse(m.data); if (d.id === mid) { ws.removeEventListener('message', h); resolve(d.result); } });
  ws.send(JSON.stringify({ id: mid, method, params }));
});
const r = await call('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
console.log(JSON.stringify(r.result.value ?? r, null, 1));
if (shot) {
  const s = await call('Page.captureScreenshot', { format: 'png' });
  (await import('node:fs')).writeFileSync(shot, Buffer.from(s.data, 'base64'));
}
ws.close();
