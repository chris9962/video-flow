const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rand = (a, b) => a + Math.random() * (b - a);
const time = () => new Date().toTimeString().slice(0, 8);
const norm = (s) => s.replace(/\s+/g, ' ');

const BLOCK_RE = /tạm thời bị chặn|quá nhanh|bị hạn chế|temporarily blocked|going too fast|restricted/i;
const MORE_COMMENTS_RE = /^(Xem thêm bình luận|Xem các bình luận trước|Xem thêm \d+ bình luận)/;
const MORE_REPLIES_RE = /^(Xem( tất cả)? \d+ (câu trả lời|phản hồi)|Xem thêm (câu trả lời|phản hồi)|Xem (câu trả lời|phản hồi) trước)/;
const POST_RE = /facebook\.com\/groups\/([^/?#]+)\/(?:posts|permalink)\/(\d+)/;
const MAX_HISTORY = 300;

const REPLY_TEXT = {
  ok: 'đã trả lời',
  oknotag: 'đã trả lời, không có tag',
  unsent: 'chưa gửi được câu trả lời',
  dirty: 'ô trả lời có chữ khác, không xoá được',
  notyped: 'không nhập được câu trả lời',
  nobox: 'không mở được ô trả lời',
  noreplybtn: 'không thấy nút Trả lời',
};
const REPLIED = new Set(['ok', 'oknotag']);
const LIKE_TEXT = {
  yes: 'đã thích bình luận',
  before: 'đã thích bình luận từ lần trước',
  clicked: 'đã bấm Thích, chưa xác nhận được',
  none: 'không thấy nút Thích',
};

let stopped = false;
chrome.storage.onChanged.addListener((changes) => {
  if (changes.run && !changes.run.newValue?.running) stopped = true;
});

async function log(text) {
  const { log = [] } = await chrome.storage.local.get('log');
  await chrome.storage.local.set({ log: [...log, `${time()} ${text}`].slice(-200) });
}

async function setStatus(text) {
  await chrome.storage.local.set({ status: { text } });
}

async function saveRun(patch) {
  const { run } = await chrome.storage.local.get('run');
  await chrome.storage.local.set({ run: { ...run, ...patch } });
}

async function finish(text) {
  await log(text);
  await setStatus(text);
  await saveRun({ running: false });
}

async function updateHistory(id, url, patch, person) {
  const { history = {} } = await chrome.storage.local.get('history');
  const h = history[id] || { id, url, people: {}, followed: 0, replied: 0, complete: false };
  const { mine, ...rest } = patch;
  Object.assign(h, rest);
  // Bài người dùng tự thêm vào "Bài của tôi" giữ nguyên, kể cả khi không đọc được người đăng.
  if (mine) h.mine = true;
  if (person) {
    const prev = h.people[person.name] || {};
    h.people[person.name] = { followed: prev.followed || person.followed, result: person.result, liked: !!(prev.liked || person.liked) };
  }
  const people = Object.values(h.people);
  h.followed = people.filter((p) => p.followed).length;
  h.replied = people.filter((p) => REPLIED.has(p.result)).length;
  history[id] = h;
  const ids = Object.keys(history);
  if (ids.length > MAX_HISTORY) {
    ids.sort((a, b) => (history[a].scannedAt || 0) - (history[b].scannedAt || 0))
      .slice(0, ids.length - MAX_HISTORY)
      .forEach((k) => delete history[k]);
  }
  await chrome.storage.local.set({ history });
}

function nameOf(label, nested) {
  const m = label.match(/^Bình luận dưới tên (.+?) vào /)
    || (nested && (label.match(/^Phản hồi bình luận của .+? dưới tên (.+?) vào /) || label.match(/^(.+?) đáp lại phản hồi của .+? vào /)));
  return m ? m[1] : null;
}

// Câu trả lời lồng nằm bên trong bình luận cha, nên chỉ lấy nút thuộc đúng bình luận đang xét.
function ownButton(art, text) {
  return [...art.querySelectorAll('[role=button]')].find((b) => b.innerText.trim() === text && b.closest('[role=article]') === art);
}

function commentArticles(nested) {
  return [...document.querySelectorAll('[role=article][aria-label]')]
    .map((art) => ({ art, name: nameOf(art.getAttribute('aria-label'), nested) }))
    .filter((x) => x.name);
}

const followable = (nested) => commentArticles(nested).filter((x) => ownButton(x.art, 'Theo dõi'));

function postInfo() {
  const heading = [...document.querySelectorAll('h1,h2,h3,[role=heading]')]
    .map((h) => h.innerText.trim())
    .find((t) => t.startsWith('Bài viết của '));
  const author = heading ? heading.slice('Bài viết của '.length) : null;
  const box = document.querySelector('[contenteditable=true][role=textbox][aria-label^="Bình luận dưới tên "]');
  const me = box ? box.getAttribute('aria-label').slice('Bình luận dưới tên '.length) : null;
  return { author, me, mine: !!author && author === me };
}

// Bài viết cũng mở trong hộp thoại, nên chỉ xét hộp thoại không chứa bình luận.
function blockedText() {
  const t = [...document.querySelectorAll('[role=dialog],[role=alertdialog]')]
    .filter((d) => !d.querySelector('[role=article]'))
    .map((d) => d.innerText).join(' ');
  return BLOCK_RE.test(t) ? norm(t).slice(0, 200) : '';
}

async function collectPosts(max, groupUrl) {
  const { history = {} } = await chrome.storage.local.get('history');
  await sleep(6000);
  const found = new Map();
  const skipped = new Set();
  for (let i = 0; i < 30 && found.size < max && !stopped; i++) {
    await setStatus(`Đang cuộn feed nhóm để lấy bài chưa quét: lần ${i + 1}/30, đã thấy ${found.size} bài mới, bỏ qua ${skipped.size} bài đã quét`);
    for (const a of document.querySelectorAll('a[href*="/groups/"]')) {
      const m = a.href.match(POST_RE);
      if (!m || found.has(m[2]) || skipped.has(m[2])) continue;
      if (history[m[2]]?.complete) skipped.add(m[2]);
      else found.set(m[2], { group: m[1], url: `https://www.facebook.com/groups/${m[1]}/posts/${m[2]}/` });
    }
    window.scrollBy(0, 2500);
    await sleep(rand(2000, 3000));
  }
  // Feed nhóm có thể chứa link bài của nhóm khác. Ưu tiên nhóm trong link cấu hình, sau đó nhóm xuất hiện nhiều nhất.
  const counts = {};
  for (const p of found.values()) counts[p.group] = (counts[p.group] || 0) + 1;
  const wanted = groupUrl.match(/\/groups\/([^/]+)/)?.[1];
  const main = counts[wanted] ? wanted : Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
  return { posts: [...found.values()].filter((p) => p.group === main).map((p) => p.url).slice(0, max), skipped: skipped.size };
}

async function expand(nested, where) {
  for (let i = 0; i < 30 && !stopped; i++) {
    const b = [...document.querySelectorAll('[role=button]')].find((x) => {
      const t = x.innerText.trim();
      return MORE_COMMENTS_RE.test(t) || (nested && MORE_REPLIES_RE.test(t));
    });
    if (!b) break;
    await setStatus(`Đang mở bình luận ẩn trong ${where}: bấm "${b.innerText.trim()}"`);
    b.click();
    await sleep(rand(1200, 2000));
  }
}

async function waitFor(fn, ms) {
  for (let t = 0; t < ms; t += 250) {
    const v = fn();
    if (v) return v;
    await sleep(250);
  }
  return fn();
}

// Ô bình luận của Facebook bỏ qua phím giả lập, nhưng nhận insertText.
async function typeText(text) {
  for (const ch of text) {
    document.execCommand('insertText', false, ch);
    await sleep(rand(40, 90));
  }
}

// Lệnh execCommand('delete') không xoá được chữ trong ô của Facebook. Sự kiện beforeinput xoá được.
async function clearBox(box) {
  getSelection().selectAllChildren(box);
  box.dispatchEvent(new InputEvent('beforeinput', { inputType: 'deleteContentBackward', bubbles: true, cancelable: true }));
  await sleep(500);
}

function postButton(box) {
  let p = box.parentElement;
  for (let i = 0; i < 15 && p && p !== document.body; i++, p = p.parentElement) {
    const b = p.querySelector('[role=button][aria-label="Đăng bình luận"]');
    if (b) return b;
  }
  return null;
}

function pressEnter(el) {
  for (const type of ['keydown', 'keypress', 'keyup']) {
    el.dispatchEvent(new KeyboardEvent(type, { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true }));
  }
}

const replyBoxes = () => [...document.querySelectorAll('[contenteditable=true][role=textbox]')]
  .filter((b) => (b.getAttribute('aria-label') || '').startsWith('Trả lời'));

const likeButton = (art) => [...art.querySelectorAll('[role=button][aria-label]')]
  .find((b) => b.closest('[role=article]') === art && /^((Gỡ|Bỏ) )?thích$/i.test(b.getAttribute('aria-label')));

const isLiked = (b) => b.getAttribute('aria-label') !== 'Thích' || b.getAttribute('aria-pressed') === 'true';

// Nút Thích bật và tắt: bấm lần nữa sẽ bỏ thích, nên không bấm khi bình luận đã được thích.
async function likeComment(art, name, wasLiked) {
  const b = likeButton(art);
  if (!b) return 'none';
  if (wasLiked || isLiked(b)) return 'before';
  await setStatus(`Đang thích bình luận của ${name}`);
  b.click();
  await sleep(rand(1200, 1800));
  const after = likeButton(art);
  return after && isLiked(after) ? 'yes' : 'clicked';
}

async function processPerson(art, name, reply, where, follow, wasLiked) {
  art.style.outline = '3px solid #0b57d0';
  art.style.outlineOffset = '2px';
  try {
    const result = await followAndReply(art, name, reply, where, follow);
    if (result === 'block' || result === 'skip' || REPLIED.has(result)) return { result };
    return { result, liked: await likeComment(art, name, wasLiked) };
  } finally {
    art.style.outline = '';
    art.style.outlineOffset = '';
  }
}

// Facebook mở 1 ô trả lời mới có tag cho mỗi người, nhưng focus có thể nằm lại ở ô của người trước.
async function openReplyBox(art, name) {
  const replyBtn = ownButton(art, 'Trả lời');
  if (!replyBtn) return { code: 'noreplybtn' };
  const before = new Set(replyBoxes());
  replyBtn.click();
  const tagged = () => {
    const withName = replyBoxes().filter((b) => b.innerText.trim() === name);
    return withName.find((b) => !before.has(b))
      || withName.find((b) => art.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
  };
  const box = await waitFor(tagged, 2500);
  if (box) return { box, hasTag: true };
  // Chỉ dùng ô vừa mở cho người này. Ô cũ thuộc bình luận khác, trả lời vào đó là trả lời nhầm người.
  const fresh = replyBoxes().find((b) => !before.has(b));
  return fresh ? { box: fresh, hasTag: false } : { code: 'nobox' };
}

async function fillReply(box, name, reply, hasTag) {
  box.focus();
  // Khi tab không có focus, ví dụ lúc bạn bấm trên thanh bên, Facebook chỉ hiện nút "Đăng bình luận" sau sự kiện focusin.
  box.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
  box.dispatchEvent(new FocusEvent('focus'));
  let text = /\s$/.test(box.textContent) ? reply : ` ${reply}`;
  if (!hasTag) {
    if (box.innerText.trim()) await clearBox(box);
    if (box.innerText.trim()) return 'dirty';
    text = `${name} ${reply}`;
  }
  const sel = getSelection();
  sel.selectAllChildren(box);
  sel.collapseToEnd();
  await typeText(text);
  await sleep(rand(500, 900));
  if (!box.innerText.includes(reply)) {
    await clearBox(box);
    return 'notyped';
  }
  return null;
}

async function followAndReply(art, name, reply, where, follow) {
  art.scrollIntoView({ block: 'center' });
  await sleep(rand(600, 1200));
  if (follow) {
    await setStatus(`Đang theo dõi ${name} trong ${where}`);
    ownButton(art, 'Theo dõi').click();
    await sleep(rand(1500, 2200));
    if (blockedText()) return 'block';
    if (ownButton(art, 'Theo dõi')) return 'skip';
  }

  await setStatus(`Đang mở ô trả lời cho ${name}`);
  const { box, hasTag, code } = await openReplyBox(art, name);
  if (code) return code;
  await setStatus(`Đang nhập câu trả lời cho ${name}${hasTag ? '' : ', Facebook không gắn tag nên extension ghi tên bằng chữ'}`);
  const fillError = await fillReply(box, name, reply, hasTag);
  if (fillError) return fillError;

  await setStatus(`Đang gửi câu trả lời cho ${name}`);
  const inBox = () => box.isConnected && box.innerText.includes(reply);
  const btn = await waitFor(() => postButton(box), 2000);
  if (btn) btn.click();
  else pressEnter(box);
  await sleep(rand(1800, 2500));
  if (blockedText()) return 'block';
  if (inBox()) {
    pressEnter(box);
    await sleep(2000);
  }
  if (inBox()) {
    await clearBox(box);
    return 'unsent';
  }
  if (!norm(document.body.innerText).includes(norm(`${name} ${reply}`))) return 'unsent';
  return hasTag ? 'ok' : 'oknotag';
}

async function runPost(run, cfg) {
  const url = run.posts[run.idx];
  const id = url.match(/posts\/(\d+)/)[1];
  const where = `bài ${run.idx + 1}/${run.posts.length}`;
  // Facebook có thể đổi URL sau khi mở bài, nên đánh dấu bài đã mở thay vì so URL.
  if (run.nav !== id) {
    await setStatus(`Đang mở ${where}`);
    await saveRun({ nav: id });
    location.href = url;
    return;
  }
  await setStatus(`Đang chờ ${where} tải xong`);
  await sleep(rand(5000, 6500));
  await expand(cfg.nested, where);
  if (stopped) return;

  const info = postInfo();
  if (info.me) await chrome.storage.local.set({ me: info.me });
  await updateHistory(id, url, { author: info.author, mine: info.mine });

  const { done: doneList = [], history = {} } = await chrome.storage.local.get(['done', 'history']);
  const done = new Set(doneList);
  const followNames = [...new Set(followable(cfg.nested).map((x) => x.name))].filter((n) => !done.has(n) && n !== info.me);
  const prevPeople = history[id]?.people || {};
  // Người đã theo dõi ở lần trước nhưng chưa trả lời được: lần này chỉ trả lời.
  const retryNames = Object.entries(prevPeople)
    .filter(([n, p]) => p.followed && !REPLIED.has(p.result) && !followNames.includes(n))
    .map(([n]) => n);
  const retryText = retryNames.length ? `, ${retryNames.length} người cần trả lời lại` : '';
  await log(`Bài ${id}${info.author ? ` của ${info.author}` : ''}: ${followNames.length} người có nút Theo dõi${retryText}`);
  await setStatus(`${where[0].toUpperCase()}${where.slice(1)}: ${followNames.length} người có nút Theo dõi${retryText}`);

  const queue = [...followNames.map((name) => ({ name, follow: true })), ...retryNames.map((name) => ({ name, follow: false }))];
  let { count } = run;
  let complete = true;
  for (const { name, follow } of queue) {
    if (stopped || count >= cfg.maxPeople) {
      complete = false;
      break;
    }
    const target = (follow ? followable(cfg.nested) : commentArticles(cfg.nested)).find((x) => x.name === name);
    if (!target) continue;
    const { result, liked } = await processPerson(target.art, name, cfg.reply, where, follow, prevPeople[name]?.liked);
    if (result === 'block') {
      await updateHistory(id, url, { scannedAt: Date.now() });
      await finish(`DỪNG: Facebook hiện thông báo chặn: ${blockedText()}`);
      return;
    }
    if (result === 'skip') {
      await log(`  ${name}: bấm Theo dõi không có tác dụng, bỏ qua`);
      continue;
    }
    if (follow) {
      done.add(name);
      count++;
      await chrome.storage.local.set({ done: [...done] });
      await saveRun({ count });
    }
    await updateHistory(id, url, { scannedAt: Date.now() }, { name, followed: follow, result, liked: liked && liked !== 'none' });
    const text = `${follow ? 'đã theo dõi' : 'trả lời lại'}, ${REPLY_TEXT[result]}${liked ? `, ${LIKE_TEXT[liked]}` : ''}`;
    await log(`  ${follow ? `${count}.` : '↻'} ${name}: ${text}`);
    const wait = rand(cfg.delayMin * 1000, cfg.delayMax * 1000);
    await setStatus(`${name}: ${text}. Đang chờ ${(wait / 1000).toFixed(1)} giây`);
    await sleep(wait);
  }
  await updateHistory(id, url, { scannedAt: Date.now(), complete: complete && !stopped });

  if (stopped) return;
  const idx = run.idx + 1;
  if (count >= cfg.maxPeople || idx >= run.posts.length) {
    await finish(`Xong: ${count} người`);
    return;
  }
  await saveRun({ idx, nav: null });
  const { run: next } = await chrome.storage.local.get('run');
  if (next.running) runPost(next, cfg);
}

// Tiêu đề tab có dạng "(2) Tên nhóm | Facebook" hoặc "Tên nhóm | Nội dung bài".
async function saveGroupName() {
  const slug = location.pathname.match(/^\/groups\/([^/]+)/)?.[1];
  const name = document.title.replace(/^\(\d+\)\s*/, '').split(' | ')[0].trim();
  if (!slug || !name || name === 'Facebook' || name.startsWith('Bài viết của ')) return;
  const { groups = {} } = await chrome.storage.local.get('groups');
  if (!groups[slug] || groups[slug].name) return;
  groups[slug].name = name;
  await chrome.storage.local.set({ groups });
}

(async () => {
  if (location.pathname.startsWith('/groups/')) setTimeout(saveGroupName, 4000);
  let { run } = await chrome.storage.local.get('run');
  for (let i = 0; i < 10 && run?.running && run.tabId == null; i++) {
    await sleep(500);
    ({ run } = await chrome.storage.local.get('run'));
  }
  if (!run?.running) return;
  const tabId = await chrome.runtime.sendMessage({ type: 'whoami' });
  if (tabId !== run.tabId) return;
  const { config: cfg } = await chrome.storage.local.get('config');

  if (run.phase === 'collect') {
    await log('Đang lấy danh sách bài trong nhóm');
    await setStatus('Đang chờ trang nhóm tải xong');
    const { posts, skipped } = await collectPosts(cfg.maxPosts, cfg.groupUrl);
    if (stopped) return;
    if (!posts.length) {
      await finish(`Không tìm thấy bài chưa quét trong nhóm. Đã bỏ qua ${skipped} bài đã quét.`);
      return;
    }
    await log(`Tìm thấy ${posts.length} bài chưa quét, bỏ qua ${skipped} bài đã quét`);
    await saveRun({ phase: 'posts', posts, idx: 0, nav: null });
    ({ run } = await chrome.storage.local.get('run'));
  }
  await runPost(run, cfg);
})();
