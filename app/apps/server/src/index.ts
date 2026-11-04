import { buildApp } from './app';

// Lỗi automation browser (vd tab Chrome bị đóng giữa run → page.waitForEvent reject) có thể văng ra
// dạng unhandledRejection/uncaughtException và GIẾT cả server (→ UI rỗng, tưởng mất data). Bắt ở process
// để server SỐNG SÓT, chỉ log lỗi — run đó coi như fail, các run/workflow khác không bị ảnh hưởng.
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection] bỏ qua để không crash server:', reason instanceof Error ? reason.message : reason);
});
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException] bỏ qua để không crash server:', err instanceof Error ? err.stack : err);
});

const app = buildApp();
app.listen({ port: 3001, host: '127.0.0.1' }).then((addr) => {
  console.log(`VideoFlow server: ${addr}`);
});
