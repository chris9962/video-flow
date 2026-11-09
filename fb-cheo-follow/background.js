const time = () => new Date().toTimeString().slice(0, 8);

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// Có posts: chạy lại đúng các bài đó. Không có posts: quét feed nhóm để lấy bài.
async function start(config, posts) {
  const first = posts?.[0];
  // tabId null trước khi mở tab: content script của tab mới chờ tới khi có tabId.
  await chrome.storage.local.set({
    config,
    log: [],
    status: { text: first ? 'Đang mở bài' : 'Đang mở nhóm' },
    run: {
      running: true,
      tabId: null,
      phase: first ? 'posts' : 'collect',
      posts: posts || [],
      idx: 0,
      count: 0,
      nav: first ? first.match(/posts\/(\d+)/)[1] : null,
    },
  });
  const tab = await chrome.tabs.create({ url: first || config.groupUrl, active: true });
  const { run } = await chrome.storage.local.get('run');
  await chrome.storage.local.set({ run: { ...run, tabId: tab.id } });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'whoami') {
    sendResponse(sender.tab?.id ?? null);
    return false;
  }
  if (msg.type === 'start') {
    start(msg.config, msg.posts).then(() => sendResponse(true));
    return true;
  }
  return false;
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  const { run, log = [] } = await chrome.storage.local.get(['run', 'log']);
  if (!run?.running || run.tabId !== tabId) return;
  await chrome.storage.local.set({
    run: { ...run, running: false },
    status: { text: 'Tab Facebook đã đóng, extension dừng' },
    log: [...log, `${time()} Tab Facebook đã đóng, extension dừng`].slice(-200),
  });
});
