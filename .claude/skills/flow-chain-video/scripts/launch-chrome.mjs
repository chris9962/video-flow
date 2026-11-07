// Launch Google Chrome for VideoFlow / Scroll-World with remote-debugging port for CDP connection.
// Uses a dedicated global profile (~/chrome-cdp-profile) so that all sessions share the same logins.
// Chrome is opened without automation flags, so Google / ChatGPT logins work perfectly.
import { spawn } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import os from 'node:os';

const PORT = Number(process.env.CHROME_CDP_PORT ?? 9222);
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
  console.error('✗ Google Chrome not found. Please install Chrome and try again.');
  process.exit(1);
}

if (await portInUse(PORT)) {
  console.log(`✓ Chrome is already listening on port ${PORT} — no need to relaunch.`);
  console.log('  Make sure you are logged in to the Google account that has Flow credits, and to ChatGPT, in that window.');
  process.exit(0);
}

mkdirSync(PROFILE_DIR, { recursive: true });

const args = [
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${PROFILE_DIR}`,
  `--profile-directory=${process.env.CHROME_CDP_PROFILE_DIRECTORY || 'Default'}`,
  '--disable-extensions',
  '--no-first-run',
  '--no-default-browser-check',
  'https://accounts.google.com/',
  'https://flow.google.com/',
  'https://chatgpt.com/',
];

console.log('▶ Launching Chrome for Google Flow...');
console.log(`  Profile: ${PROFILE_DIR}`);
console.log(`  CDP:     http://127.0.0.1:${PORT}`);
console.log('  → Log in to the Google account that has Flow credits, and to ChatGPT, in this window once.');
console.log('  → Keep this window open while running generations.\n');

const child = spawn(chrome, args, { stdio: 'inherit' });
child.on('exit', (code) => process.exit(code ?? 0));
