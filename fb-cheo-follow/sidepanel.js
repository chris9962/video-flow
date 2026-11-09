const $ = (id) => document.getElementById(id);
const time = () => new Date().toTimeString().slice(0, 8);
const DEFAULTS = { groupUrl: '', reply: 'đã follow, follow lại giúp mình nha', maxPeople: 40, maxPosts: 15, delayMin: 2, delayMax: 4, nested: true };
const NUMBER_FIELDS = ['maxPeople', 'maxPosts', 'delayMin', 'delayMax'];
const POST_RE = /facebook\.com\/groups\/([^/?#]+)\/(?:posts|permalink)\/(\d+)/;
const REPLIED = new Set(['ok', 'oknotag']);
const RESULT_LABEL = {
  ok: 'đã trả lời',
  oknotag: 'đã trả lời, không có tag',
  unsent: 'chưa gửi được câu trả lời',
  dirty: 'ô trả lời có chữ khác, không xoá được',
  notag: 'ô trả lời không có tag đúng',
  notyped: 'không nhập được câu trả lời',
  nobox: 'không mở được ô trả lời',
  noreplybtn: 'không thấy nút Trả lời',
};

function el(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text !== undefined) e.textContent = text;
  return e;
}

function fmtTime(ms) {
  const d = new Date(ms);
  return `${d.toTimeString().slice(0, 5)} ${d.toLocaleDateString('sv-SE')}`;
}

function groupUrlOf(raw) {
  try {
    const u = new URL(raw.trim());
    const m = /(^|\.)facebook\.com$/.test(u.hostname) && u.pathname.match(/^\/groups\/([^/]+)/);
    return m ? `https://www.facebook.com/groups/${m[1]}/` : null;
  } catch {
    return null;
  }
}

const MAX_GROUPS = 50;
const groupSlug = (url) => url?.match(/\/groups\/([^/]+)/)?.[1] || null;
const fetchingNames = new Set();
const failedNames = new Set();

// Facebook trả HTML có thẻ <title> là tên nhóm khi trình duyệt đã đăng nhập.
async function fetchGroupName(url) {
  try {
    const html = await (await fetch(url, { credentials: 'include' })).text();
    const raw = html.match(/<title[^>]*>([^<]*)<\/title>/)?.[1];
    if (!raw) return null;
    const name = new DOMParser().parseFromString(raw, 'text/html').body.textContent.replace(/ \| Facebook$/, '').trim();
    return name && !/^(Facebook|Đăng nhập|Log in)/i.test(name) ? name : null;
  } catch {
    return null;
  }
}

async function saveGroup(url) {
  const slug = groupSlug(url);
  const { groups = {} } = await chrome.storage.local.get('groups');
  groups[slug] = { ...groups[slug], url, usedAt: Date.now() };
  const old = Object.keys(groups).sort((a, b) => groups[b].usedAt - groups[a].usedAt).slice(MAX_GROUPS);
  for (const k of old) delete groups[k];
  await chrome.storage.local.set({ groups });
  if (groups[slug].name || fetchingNames.has(slug)) return;

  fetchingNames.add(slug);
  failedNames.delete(slug);
  await renderGroups();
  const name = await fetchGroupName(url);
  fetchingNames.delete(slug);
  const { groups: latest = {} } = await chrome.storage.local.get('groups');
  if (name && latest[slug]) {
    latest[slug].name = name;
    await chrome.storage.local.set({ groups: latest });
    return;
  }
  failedNames.add(slug);
  await renderGroups();
}

function renderGroupName(groups) {
  const slug = groupSlug(groupUrlOf($('groupUrl').value));
  const g = slug && groups[slug];
  let text = '';
  if (g?.name) text = `Tên nhóm: ${g.name}`;
  else if (fetchingNames.has(slug)) text = 'Đang lấy tên nhóm';
  else if (failedNames.has(slug)) text = 'Chưa lấy được tên nhóm. Extension đọc tên nhóm khi mở trang nhóm.';
  $('group-name').textContent = text;
}

async function renderGroups() {
  const { groups = {} } = await chrome.storage.local.get('groups');
  const list = Object.entries(groups).sort(([, a], [, b]) => b.usedAt - a.usedAt);
  const current = groupSlug(groupUrlOf($('groupUrl').value));
  const sel = $('savedGroups');
  sel.replaceChildren(
    new Option(list.length ? 'Chọn nhóm để điền link' : 'Chưa lưu nhóm nào', ''),
    ...list.map(([slug, g]) => new Option(g.name ? `${g.name} · ${slug}` : `Nhóm ${slug}`, slug)),
  );
  sel.value = current && groups[current] ? current : '';
  sel.disabled = !list.length;
  $('removeGroup').disabled = !sel.value;
  renderGroupName(groups);
}

function showError(field, text) {
  for (const e of document.querySelectorAll('#form [aria-invalid]')) e.removeAttribute('aria-invalid');
  $('error').textContent = text;
  if (field) {
    $(field).setAttribute('aria-invalid', 'true');
    $(field).focus();
  }
}

// Chạy lại 1 bài không cần link nhóm, nên chỉ bắt buộc link nhóm khi quét feed nhóm.
function readForm(needGroup) {
  const groupUrl = groupUrlOf($('groupUrl').value);
  if (needGroup && !groupUrl) return showError('groupUrl', 'Link nhóm phải có dạng https://www.facebook.com/groups/...');
  const reply = $('reply').value.replace(/\s+/g, ' ').trim();
  if (!reply) return showError('reply', 'Bạn phải nhập câu bình luận.');
  const cfg = { groupUrl: groupUrl || '', reply, nested: $('nested').checked };
  for (const f of NUMBER_FIELDS) {
    const e = $(f);
    const v = Number(e.value);
    if (!Number.isInteger(v) || v < Number(e.min) || v > Number(e.max)) {
      return showError(f, `Ô "${document.querySelector(`label[for=${f}]`).textContent}" phải là số nguyên từ ${e.min} đến ${e.max}.`);
    }
    cfg[f] = v;
  }
  if (cfg.delayMin > cfg.delayMax) return showError('delayMax', 'Thời gian chờ "đến" phải lớn hơn hoặc bằng "từ".');
  showError(null, '');
  return cfg;
}

async function startRun(cfg, posts) {
  if (cfg.groupUrl) $('groupUrl').value = cfg.groupUrl;
  await chrome.runtime.sendMessage({ type: 'start', config: cfg, posts });
}

// Dòng có trả lời hoặc có thích bình luận là đã tương tác với người được follow.
function logClass(line) {
  if (/đã trả lời|đã thích bình luận/.test(line)) return 'ok';
  if (/DỪNG|chưa gửi|chưa xác nhận|không có tag|không xoá được|không nhập được|không mở được|không thấy nút|không có tác dụng/.test(line)) return 'warn';
  return '';
}

async function renderStatus() {
  const { run, status, config, me, log = [], done = [] } = await chrome.storage.local.get(['run', 'status', 'config', 'me', 'log', 'done']);
  const running = !!run?.running;
  $('start').disabled = running;
  $('stop').disabled = !running;
  $('settings').disabled = running;

  $('now').dataset.running = String(running);
  $('state').textContent = running ? 'Đang chạy' : 'Không chạy';
  const text = status?.text || 'Chưa chạy lần nào.';
  if ($('now-text').textContent !== text) $('now-text').textContent = text;

  $('stat-post').textContent = run?.posts?.length ? `${Math.min(run.idx + 1, run.posts.length)}/${run.posts.length}` : '–';
  $('stat-count').textContent = run ? `${run.count}/${config?.maxPeople ?? '–'}` : '–';
  $('stat-total').textContent = String(done.length);
  $('me').textContent = `Trang đang dùng để bình luận: ${me || 'chưa biết. Extension đọc tên trang ở lần chạy đầu.'}`;

  const atBottom = $('log').scrollHeight - $('log').scrollTop - $('log').clientHeight < 24;
  $('log').replaceChildren(...log.map((line) => el('li', logClass(line), line)));
  $('log-empty').hidden = log.length > 0;
  if (atBottom) $('log').scrollTop = $('log').scrollHeight;
}

function postItem(h, running) {
  const li = el('li', 'post');
  const titleId = `post-${h.id}`;
  const title = el('p', 'post-title');
  title.id = titleId;
  const a = el('a', '', h.author ? `Bài của ${h.author}` : `Bài ${h.id}`);
  a.href = h.url;
  a.target = '_blank';
  a.rel = 'noopener';
  title.append(a);

  const scanned = h.scannedAt ? `Quét lúc ${fmtTime(h.scannedAt)}${h.complete ? '' : ', chưa quét xong'}` : 'Chưa quét';
  const people = Object.entries(h.people || {});
  const pending = people.filter(([, p]) => p.followed && !REPLIED.has(p.result));
  const likedOnly = pending.filter(([, p]) => p.liked).length;
  li.append(
    title,
    el('p', 'post-meta', `Mã ${h.id} · ${scanned}`),
    el('p', 'post-stats', `Follow ${h.followed} · Trả lời ${h.replied}${pending.length ? ` · Chưa trả lời được ${pending.length}` : ''}${likedOnly ? `, đã thích bình luận ${likedOnly}` : ''}`),
  );

  if (people.length) {
    const d = el('details');
    d.dataset.id = h.id;
    d.append(el('summary', '', `Người trong bài (${people.length})`));
    const ul = el('ul');
    for (const [name, p] of people) {
      const liked = p.liked && !REPLIED.has(p.result) ? ', đã thích bình luận' : '';
      ul.append(el('li', REPLIED.has(p.result) || p.liked ? 'ok' : 'warn', `${name}: ${p.followed ? 'đã follow' : 'chưa follow'}, ${RESULT_LABEL[p.result] || p.result}${liked}`));
    }
    d.append(ul);
    li.append(d);
  }

  const b = el('button', 'secondary', 'Follow chéo lại bài này');
  b.type = 'button';
  b.dataset.rerun = h.id;
  b.disabled = running;
  b.setAttribute('aria-describedby', titleId);
  li.append(b);
  return li;
}

async function renderHistory() {
  const { history = {}, run } = await chrome.storage.local.get(['history', 'run']);
  const running = !!run?.running;
  const open = new Set([...document.querySelectorAll('details[open]')].map((d) => d.dataset.id));
  const focused = document.activeElement?.dataset?.rerun;

  const key = (h) => h.scannedAt ?? Number.MAX_SAFE_INTEGER;
  const all = Object.values(history).sort((a, b) => key(b) - key(a));
  const mine = all.filter((h) => h.mine);
  const others = all.filter((h) => !h.mine);
  $('mine-list').replaceChildren(...mine.map((h) => postItem(h, running)));
  $('others-list').replaceChildren(...others.map((h) => postItem(h, running)));
  $('count-mine').textContent = String(mine.length);
  $('count-others').textContent = String(others.length);
  $('mine-empty').hidden = mine.length > 0;
  $('others-empty').hidden = others.length > 0;
  $('rerun-mine').disabled = running || !mine.length;
  $('clear-others').disabled = running || !others.length;

  for (const d of document.querySelectorAll('details[data-id]')) if (open.has(d.dataset.id)) d.open = true;
  if (focused) document.querySelector(`[data-rerun="${focused}"]`)?.focus();
}

$('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const cfg = readForm(true);
  if (!cfg) return;
  saveGroup(cfg.groupUrl);
  await startRun(cfg);
});

$('groupUrl').addEventListener('input', renderGroups);

$('groupUrl').addEventListener('change', () => {
  const url = groupUrlOf($('groupUrl').value);
  if (!url) return;
  $('groupUrl').value = url;
  saveGroup(url);
});

$('savedGroups').addEventListener('change', async () => {
  const slug = $('savedGroups').value;
  if (!slug) return renderGroups();
  const { groups = {} } = await chrome.storage.local.get('groups');
  $('groupUrl').value = groups[slug].url;
  showError(null, '');
  await renderGroups();
});

$('removeGroup').addEventListener('click', async () => {
  const slug = $('savedGroups').value;
  if (!slug) return;
  const { groups = {} } = await chrome.storage.local.get('groups');
  delete groups[slug];
  await chrome.storage.local.set({ groups });
  $('savedGroups').focus();
});

$('stop').addEventListener('click', async () => {
  const { run, log = [] } = await chrome.storage.local.get(['run', 'log']);
  await chrome.storage.local.set({
    run: { ...run, running: false },
    status: { text: 'Đã dừng theo yêu cầu' },
    log: [...log, `${time()} Đã bấm Dừng`].slice(-200),
  });
});

document.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-rerun]');
  if (!b) return;
  const cfg = readForm(false);
  if (!cfg) return;
  const { history = {} } = await chrome.storage.local.get('history');
  await startRun(cfg, [history[b.dataset.rerun].url]);
});

$('rerun-mine').addEventListener('click', async () => {
  const cfg = readForm(false);
  if (!cfg) return;
  const { history = {} } = await chrome.storage.local.get('history');
  const posts = Object.values(history).filter((h) => h.mine).map((h) => h.url);
  if (posts.length) await startRun(cfg, posts);
});

$('add-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const m = $('addUrl').value.trim().match(POST_RE);
  if (!m) {
    $('add-error').textContent = 'Link bài phải có dạng https://www.facebook.com/groups/<nhóm>/posts/<mã bài>/';
    $('addUrl').setAttribute('aria-invalid', 'true');
    $('addUrl').focus();
    return;
  }
  const [, group, id] = m;
  const { history = {}, me } = await chrome.storage.local.get(['history', 'me']);
  const prev = history[id] || { id, people: {}, followed: 0, replied: 0, complete: false, scannedAt: null };
  history[id] = { ...prev, url: `https://www.facebook.com/groups/${group}/posts/${id}/`, mine: true, author: prev.author || me || null };
  await chrome.storage.local.set({ history });
  $('addUrl').value = '';
  $('addUrl').removeAttribute('aria-invalid');
  $('add-error').textContent = '';
});

$('clear-others').addEventListener('click', async () => {
  const { history = {} } = await chrome.storage.local.get('history');
  const others = Object.keys(history).filter((id) => !history[id].mine);
  if (!others.length) return;
  if (!confirm(`Xoá lịch sử của ${others.length} bài đã quét? Tab "Bài của tôi" giữ nguyên.`)) return;
  for (const id of others) delete history[id];
  await chrome.storage.local.set({ history });
});

const tabs = [...document.querySelectorAll('[role=tab]')];

function selectTab(tab, focus) {
  for (const t of tabs) {
    const on = t === tab;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    $(t.getAttribute('aria-controls')).hidden = !on;
  }
  if (focus) tab.focus();
  window.scrollTo(0, 0);
  if (tab.id === 'tab-log') $('log').scrollTop = $('log').scrollHeight;
  try {
    localStorage.setItem('tab', tab.id);
  } catch {}
}

$('tablist').addEventListener('click', (e) => {
  const t = e.target.closest('[role=tab]');
  if (t) selectTab(t);
});

$('tablist').addEventListener('keydown', (e) => {
  const i = tabs.indexOf(document.activeElement);
  const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
  if (i < 0 || next === undefined) return;
  e.preventDefault();
  selectTab(tabs[(next + tabs.length) % tabs.length], true);
});

chrome.storage.onChanged.addListener((changes) => {
  renderStatus();
  const runToggled = changes.run && changes.run.oldValue?.running !== changes.run.newValue?.running;
  if (changes.history || runToggled) renderHistory();
  if (changes.groups) renderGroups();
});

(async () => {
  const { config } = await chrome.storage.local.get('config');
  const cfg = { ...DEFAULTS, ...config };
  $('groupUrl').value = cfg.groupUrl;
  $('reply').value = cfg.reply;
  $('nested').checked = cfg.nested;
  for (const f of NUMBER_FIELDS) $(f).value = cfg[f];
  await Promise.all([renderStatus(), renderHistory(), renderGroups()]);
  // Bản trước chỉ lưu 1 link nhóm trong cấu hình: đưa link đó vào danh sách nhóm đã lưu.
  const { groups = {} } = await chrome.storage.local.get('groups');
  const url = groupUrlOf(cfg.groupUrl);
  if (url && !groups[groupSlug(url)]) saveGroup(url);
  let saved = null;
  try {
    saved = localStorage.getItem('tab');
  } catch {}
  selectTab(tabs.find((t) => t.id === saved) || tabs[0]);
})();
