const url = process.argv[2];
const { webSocketDebuggerUrl } = await (await fetch('http://127.0.0.1:9222/json/version')).json();
const ws = new WebSocket(webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
ws.send(JSON.stringify({ id: 1, method: 'Target.createTarget', params: { url, background: true } }));
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id === 1) { console.log(m.result?.targetId ?? JSON.stringify(m.error)); ws.close(); }
});
