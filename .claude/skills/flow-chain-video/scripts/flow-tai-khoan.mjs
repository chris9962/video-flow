#!/usr/bin/env node
// Tài khoản Google và credit của Google Flow.
// Đo ngày 2026-11-08:
// - Chrome CDP đăng nhập nhiều tài khoản Google. Flow chọn tài khoản theo URL: https://flow.google.com/u/<n>/.
//   n là thứ tự tài khoản trong phiên Google, không cố định khi đăng nhập/đăng xuất → luôn kiểm tra email.
// - Nút tài khoản có aria-label "Tài khoản Google: <tên> (<email>), ...". Bấm nút này mở menu có dòng
//   "1.050 tín dụng Google Flow" và "Đặt lại lúc 13:03 vào 8 thg 12".
// - Sổ credit: app/data/flow-credits.json (gitignore). Mỗi lần dò hoặc tạo clip ghi 1 dòng.
//
// CLI:
//   node flow-tai-khoan.mjs            dò mọi tài khoản ở mọi profile Chrome, in credit, ghi sổ
//   node flow-tai-khoan.mjs --so       in sổ credit đã ghi, không mở Chrome

import fs from 'node:fs';
import path from 'node:path';
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { KENH, connectCdp, newPageInProfile } from './chrome-profile.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const CREDIT_FILE =
  process.env.FLOW_CREDITS_FILE || path.resolve(HERE, '../../../../app/data/flow-credits.json');
const ACCOUNT_BTN = '[aria-label^="Tài khoản Google"], [aria-label^="Google Account"]';
const MAX_ACCOUNTS = 6;

// Giá đo trên Flow: Omni 1.1 Flash 9:16 x1 — 4 giây 7 credit (2026-11-06), 6 giây 10 credit (2026-11-08).
// Omni 1.2 Flash giá gần gấp đôi. Độ dài chưa đo thì ước lượng theo tỉ lệ, làm tròn lên.
export function estimateCost(model = 'omni-flash', duration = 6) {
  const base = { 4: 7, 6: 10, 8: 14, 10: 17 }[duration] ?? Math.ceil(duration * 1.75);
  if (model === 'omni-1.2-flash') return base * 2;
  if (model.startsWith('veo')) return 20; // Chưa đo. Dùng mức dư để không chọn nhầm tài khoản sắp hết.
  return base;
}

export const flowUrl = (n) => `https://flow.google.com/u/${n}/`;

export function readBook() {
  try {
    return JSON.parse(fs.readFileSync(CREDIT_FILE, 'utf8'));
  } catch {
    return { accounts: {}, log: [] };
  }
}

function writeBook(book) {
  fs.mkdirSync(path.dirname(CREDIT_FILE), { recursive: true });
  fs.writeFileSync(CREDIT_FILE, JSON.stringify(book, null, 2));
}

// event: 'do' (chỉ dò) | 'tao' (tạo clip) | 'het' (Flow báo hết credit). extra: before, used, model, duration, out…
export function logCredit(acc, event, extra = {}) {
  const book = readBook();
  const at = new Date().toISOString();
  book.accounts[acc.email] = { profile: acc.profile, n: acc.n, credits: acc.credits, reset: acc.reset, checkedAt: at };
  book.log.push({ at, event, profile: acc.profile, email: acc.email, credits: acc.credits, ...extra });
  if (book.log.length > 500) book.log = book.log.slice(-500);
  writeBook(book);
}

// Email của tài khoản đang mở trong trang Flow.
export async function currentEmail(page) {
  const btn = page.locator(ACCOUNT_BTN).first();
  await btn.waitFor({ timeout: 45_000 });
  const label = (await btn.getAttribute('aria-label')) || '';
  return label.match(/[\w.+-]+@[\w.-]+/)?.[0]?.toLowerCase() ?? null;
}

// Mở menu tài khoản, đọc số credit và mốc đặt lại, rồi đóng menu.
export async function readCredits(page) {
  // Nút mở menu nằm trong <flow-header-user-icon> (aria "Thông tin về tài khoản"). Thẻ <a> có aria
  // "Tài khoản Google" là link SignOutOptions của Google, bấm vào sẽ rời Flow.
  await page.locator('flow-header-user-icon [role="button"]').first().click();
  const re = /([\d.,]+)\s*(tín dụng|credits?)\b/i;
  let text = '';
  for (let i = 0; i < 20 && !re.test(text); i++) {
    await page.waitForTimeout(250);
    text = await page.evaluate(() => document.body.innerText);
  }
  await page.keyboard.press('Escape').catch(() => {});
  const m = text.match(re);
  if (!m) return { credits: null, reset: null };
  return {
    credits: Number(m[1].replace(/[.,]/g, '')),
    reset: text.match(/(Đặt lại|Resets?)[^\n]*/i)?.[0]?.trim() ?? null,
  };
}

// Mở Flow bằng tài khoản thứ n, trả { n, email, credits, reset }.
export async function openAccount(page, n) {
  await page.goto(flowUrl(n), { waitUntil: 'domcontentloaded', timeout: 60_000 });
  const email = await currentEmail(page);
  const { credits, reset } = await readCredits(page);
  return { n, email, credits, reset };
}

// Dò mọi tài khoản Google đăng nhập trong phiên. Google đưa /u/<n> không tồn tại về tài khoản đầu → dừng khi email lặp.
export async function scanAccounts(page, log = () => {}, profile = null) {
  const found = [];
  for (let n = 0; n < MAX_ACCOUNTS; n++) {
    let acc;
    try {
      acc = await openAccount(page, n);
    } catch (err) {
      log(`Tài khoản /u/${n}: không đọc được (${err.message.split('\n')[0]})`);
      break;
    }
    if (!acc.email || found.some((a) => a.email === acc.email)) break;
    acc.profile = profile;
    found.push(acc);
    log(`${profile ? `[${profile}] ` : ''}Tài khoản /u/${n}: ${acc.email} — ${acc.credits ?? '?'} credit${acc.reset ? ` (${acc.reset})` : ''}`);
    logCredit(acc, 'do');
  }
  if (!found.length) throw new Error('Không đọc được tài khoản Google nào trong Flow. Kiểm tra đăng nhập Google trong Chrome CDP.');
  return found;
}

// Dò tài khoản Flow ở mọi profile trong kenh.json (hoặc chỉ `only`). Mỗi profile mở 1 tab rồi đóng.
export async function scanAllProfiles(browser, { log = () => {}, only = null } = {}) {
  const all = [];
  const keys = only ? [only] : Object.keys(KENH).filter((k) => !k.startsWith('_'));
  for (const key of keys) {
    let page;
    try {
      page = await newPageInProfile(browser, key);
      const accs = await scanAccounts(page, log, key);
      for (const a of accs) if (!all.some((x) => x.email === a.email)) all.push(a);
    } catch (err) {
      log(`[${key}] không dò được: ${err.message.split(/\r?\n/)[0]}`);
    } finally {
      await page?.close().catch(() => {});
    }
  }
  if (!all.length) throw new Error('Không đọc được tài khoản Flow nào ở các profile Chrome.');
  return all;
}

// Bộ điều phối credit. Chủ máy báo ngày 2026-11-09: mỗi tài khoản Google được cộng 50 credit Flow mỗi ngày,
// kể cả tài khoản đã hết credit tháng (oliver1990ax). Để không bỏ phí 50 credit ngày, 'auto' chọn kiểu "vừa đủ":
// trong các tài khoản đủ credit cho clip, lấy tài khoản còn ÍT credit nhất. Tài khoản chỉ có credit ngày (~50)
// bị dùng trước, tài khoản credit tháng lớn để dành. Bằng nhau thì lấy tài khoản có mốc đặt lại sớm hơn.
// FLOW_PICK=most: quay về cách cũ, chọn tài khoản còn nhiều credit nhất.
export function routeAccounts(accounts, cost, mode = process.env.FLOW_PICK || 'fit') {
  const ok = accounts.filter((a) => a.credits != null && a.credits >= cost);
  const resetAt = (a) => {
    const m = a.reset?.match(/(\d{1,2}):(\d{2}).*?(\d{1,2}) thg (\d{1,2})/);
    if (!m) return Infinity; // Không có mốc đặt lại tháng: chỉ có credit ngày.
    const d = new Date(new Date().getFullYear(), Number(m[4]) - 1, Number(m[3]), Number(m[1]), Number(m[2]));
    return d < Date.now() - 864e5 ? d.setFullYear(d.getFullYear() + 1) : d.getTime();
  };
  return ok.sort((a, b) => (mode === 'most' ? b.credits - a.credits : a.credits - b.credits || resetAt(a) - resetAt(b)));
}

// Chọn tài khoản Google để tạo clip và mở sẵn trang chủ Flow của tài khoản đó trong đúng profile.
// want: email cụ thể, hoặc 'auto' = theo routeAccounts (vừa đủ, dùng credit ngày trước). profile: chỉ dò profile này.
// Trả { page, acc }.
export async function openFlowAccount(browser, { want = 'auto', cost, profile = null, log = () => {} }) {
  const accounts = await scanAllProfiles(browser, { log, only: profile });
  let pick;
  if (want && want !== 'auto') {
    pick = accounts.find((a) => a.email === want.toLowerCase());
    if (!pick) throw new Error(`Không thấy tài khoản ${want} trong Flow. Có: ${accounts.map((a) => a.email).join(', ')}.`);
    if (pick.credits != null && pick.credits < cost) {
      throw new Error(`Tài khoản ${pick.email} còn ${pick.credits} credit, clip cần khoảng ${cost}. ${pick.reset ?? ''}`);
    }
  } else {
    const ok = routeAccounts(accounts, cost);
    if (!ok.length) {
      throw new Error(
        `Không tài khoản Flow nào đủ ${cost} credit: ${accounts.map((a) => `${a.email} ${a.credits ?? '?'}`).join(', ')}.`,
      );
    }
    pick = ok[0];
  }
  const page = await newPageInProfile(browser, pick.profile, flowUrl(pick.n));
  const email = await currentEmail(page);
  if (email !== pick.email) {
    await page.close().catch(() => {});
    throw new Error(`Mở /u/${pick.n} trong profile ${pick.profile} ra ${email}, không phải ${pick.email}. Chạy lại.`);
  }
  log(`Dùng tài khoản Flow: ${pick.email}, profile ${pick.profile} (${pick.credits} credit, clip cần khoảng ${cost})`);
  return { page, acc: pick };
}

function printBook() {
  const book = readBook();
  console.log(`Sổ credit: ${CREDIT_FILE}`);
  for (const [email, a] of Object.entries(book.accounts)) {
    console.log(`- ${email} [${a.profile ?? '?'}]: ${a.credits ?? '?'} credit, đo ${a.checkedAt}${a.reset ? `, ${a.reset}` : ''}`);
  }
  // Thứ tự điều phối theo số credit đã ghi, với clip 6 giây (10 credit).
  const accs = Object.entries(book.accounts).map(([email, a]) => ({ email, ...a }));
  const order = routeAccounts(accs, estimateCost());
  if (order.length) {
    console.log('Thứ tự dùng cho clip 6 giây (vừa đủ, credit ngày trước):');
    order.forEach((a, i) => console.log(`  ${i + 1}. ${a.email} [${a.profile ?? '?'}] ${a.credits} credit ≈ ${Math.floor(a.credits / estimateCost())} clip`));
  }
  const used = book.log.filter((l) => l.event === 'tao').slice(-10);
  if (used.length) {
    console.log('10 lần tạo clip gần nhất:');
    used.forEach((l) => console.log(`  ${l.at} ${l.email} ${l.before ?? '?'} → ${l.credits ?? '?'} (${l.out ?? ''})`));
  }
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--so')) {
    printBook();
    process.exit(0);
  }
  const browser = await connectCdp();
  try {
    await scanAllProfiles(browser, { log: console.log });
    console.log(`Đã ghi sổ: ${CREDIT_FILE}`);
  } catch (err) {
    console.error(`✗ ${err.message}`);
    process.exitCode = 1;
  }
  process.exit(process.exitCode ?? 0);
}
