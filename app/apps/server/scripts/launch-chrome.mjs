// Mở Google Chrome cho VideoFlow với cổng remote-debugging để server kết nối qua CDP.
// Dùng profile RIÊNG (Chrome 136+ chặn debugging trên profile mặc định) đặt ở thư mục TOÀN CỤC
// (~/chrome-cdp-profile) → mọi project/feature nối chung 1 Chrome đã đăng nhập, login 1 lần xài mọi nơi.
// Chrome KHÔNG bật cờ automation ở đây → đăng nhập Google/ChatGPT/Claude hoạt động bình thường.
import { spawn } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import os from 'node:os';

const PORT = Number(process.env.CHROME_CDP_PORT ?? 9222);
// Override bằng env CHROME_CDP_PROFILE nếu muốn đặt chỗ khác.
const PROFILE_DIR = process.env.CHROME_CDP_PROFILE || path.join(os.homedir(), 'chrome-cdp-profile');

const CHROME_PATHS = {
  darwin: [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Google Chrome Beta.app/Contents/MacOS/Google Chrome Beta',
  ],
  win32: [
    path.join(process.env['PROGRAMFILES'] ?? 'C:\\Program Files', 'Google/Chrome/Application/chrome.exe'),
    path.join(
      process.env['PROGRAMFILES(X86)'] ?? 'C:\\Program Files (x86)',
      'Google/Chrome/Application/chrome.exe',
    ),
    path.join(process.env['LOCALAPPDATA'] ?? '', 'Google/Chrome/Application/chrome.exe'),
  ],
  linux: ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium'],
};

function findChrome() {
  for (const p of CHROME_PATHS[process.platform] ?? []) {
    if (p && existsSync(p)) return p;
  }
  return null;
}

function portInUse(port) {
  return new Promise((resolve) => {
    const socket = net
      .connect({ port, host: '127.0.0.1' }, () => {
        socket.destroy();
        resolve(true);
      })
      .on('error', () => resolve(false));
    socket.setTimeout(800, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

const chrome = findChrome();
if (!chrome) {
  console.error('✗ Không tìm thấy Google Chrome. Cài Chrome rồi thử lại: https://google.com/chrome');
  process.exit(1);
}

if (await portInUse(PORT)) {
  console.log(`✓ Đã có Chrome lắng nghe ở cổng ${PORT} — không cần mở lại.`);
  console.log('  Nếu chưa đăng nhập, mở tab chatgpt.com / claude.ai trong cửa sổ đó và đăng nhập.');
  process.exit(0);
}

mkdirSync(PROFILE_DIR, { recursive: true });

const args = [
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${PROFILE_DIR}`,
  // LUÔN dùng 1 profile (mặc định Default, đổi bằng env CHROME_CDP_PROFILE_DIRECTORY, vd "Profile 1")
  // → tránh user lỡ tạo/đổi profile (Chrome mở nhiều context thì
  // Playwright connectOverCDP gãy: "Browser context management is not supported").
  `--profile-directory=${process.env.CHROME_CDP_PROFILE_DIRECTORY || 'Default'}`,
  // TẮT extension: extension (MetaMask…) chạy service_worker target → Playwright connectOverCDP
  // assert "targetInfo … type service_worker" rồi GÃY ("Chưa kết nối được Chrome"). Automation
  // không cần extension nào → tắt cho sạch (login Google/ChatGPT vẫn giữ nguyên).
  '--disable-extensions',
  '--no-first-run',
  '--no-default-browser-check',
  'https://chatgpt.com/',
];

console.log('▶ Đang mở Chrome cho VideoFlow…');
console.log(`  Profile: ${PROFILE_DIR}`);
console.log(`  CDP:     http://127.0.0.1:${PORT}`);
console.log('  → Đăng nhập ChatGPT (và claude.ai nếu cần) trong cửa sổ này MỘT lần.');
console.log('  → Cứ để cửa sổ mở khi chạy workflow. Đóng terminal này sẽ tắt Chrome.\n');

const child = spawn(chrome, args, { stdio: 'inherit' });
child.on('exit', (code) => process.exit(code ?? 0));
