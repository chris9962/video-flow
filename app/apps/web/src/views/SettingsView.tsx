import { useEffect, useState } from 'react';
import { getSettings, saveSettings, openBrowserLogin, openSiteLogin } from '../api';

export function SettingsView() {
  const [configured, setConfigured] = useState(false);
  const [falKey, setFalKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');
  const [claudeConfigured, setClaudeConfigured] = useState(false);
  const [claudeToken, setClaudeToken] = useState('');
  const [savingClaude, setSavingClaude] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getSettings()
      .then((s) => {
        if (!cancelled) {
          setConfigured(s.falKeyConfigured);
          setClaudeConfigured(s.claudeTokenConfigured);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await saveSettings({ falKey });
      setConfigured(res.falKeyConfigured);
      setFalKey('');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveClaude = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingClaude(true);
    try {
      const res = await saveSettings({ claudeToken });
      setClaudeConfigured(res.claudeTokenConfigured);
      setClaudeToken('');
    } finally {
      setSavingClaude(false);
    }
  };

  const handleLogin = async (provider: 'chatgpt' | 'claude' | 'gemini') => {
    setLoginMessage('Đang mở tab…');
    try {
      await openBrowserLogin(provider);
      setLoginMessage(`Đã mở tab ${provider} trong cửa sổ Chrome — đăng nhập tại đó là xong.`);
    } catch {
      setLoginMessage('Chưa kết nối được Chrome. Chạy lệnh "npm run chrome" trong terminal trước.');
    }
  };

  const handleSiteLogin = async (site: 'kling' | 'flow' | 'grok', label: string) => {
    setLoginMessage('Đang mở tab…');
    try {
      await openSiteLogin(site);
      setLoginMessage(`Đã mở tab ${label} trong cửa sổ Chrome — đăng nhập tại đó là xong.`);
    } catch {
      setLoginMessage('Chưa kết nối được Chrome. Chạy lệnh "npm run chrome" trong terminal trước.');
    }
  };

  return (
    <div className="view">
      <div className="view-bar">
        <h1 className="view-title">Settings</h1>
      </div>
      <div className="view-body">
        <section className="settings-section" aria-labelledby="settings-fal">
          <h2 id="settings-fal">fal.ai API key</h2>
          <p className="hint">Dùng cho block video khi tạo video bằng AI (Kling, Veo, Hailuo).</p>
          <form className="settings-form" onSubmit={handleSave}>
            <label className="field-label" htmlFor="fal-key">
              API key
            </label>
            <div className="field-row">
              <input
                id="fal-key"
                type="password"
                autoComplete="off"
                placeholder="fal_…"
                value={falKey}
                onChange={(e) => setFalKey(e.target.value)}
              />
              <button type="submit" className="btn" disabled={saving || falKey === ''}>
                {saving ? 'Đang lưu…' : 'Lưu'}
              </button>
            </div>
            <p role="status" className="key-status" data-configured={configured}>
              {configured ? 'đã cấu hình ✓' : 'chưa cấu hình'}
            </p>
          </form>
        </section>
        <section className="settings-section" aria-labelledby="settings-claude">
          <h2 id="settings-claude">Claude token (AI dựng workflow)</h2>
          <p className="hint">
            Token <code>sk-ant-oat…</code> cho tính năng <strong>✨ AI</strong> trong editor (chat → AI tự dựng
            block). Lấy bằng <code>claude setup-token</code>. Lưu cục bộ ở máy bạn (data/, không commit).
          </p>
          <form className="settings-form" onSubmit={handleSaveClaude}>
            <label className="field-label" htmlFor="claude-token">
              CLAUDE_CODE_OAUTH_TOKEN
            </label>
            <div className="field-row">
              <input
                id="claude-token"
                type="password"
                autoComplete="off"
                placeholder="sk-ant-oat01-…"
                value={claudeToken}
                onChange={(e) => setClaudeToken(e.target.value)}
              />
              <button type="submit" className="btn" disabled={savingClaude || claudeToken === ''}>
                {savingClaude ? 'Đang lưu…' : 'Lưu'}
              </button>
            </div>
            <p role="status" className="key-status" data-configured={claudeConfigured}>
              {claudeConfigured ? 'đã cấu hình ✓' : 'chưa cấu hình'}
            </p>
          </form>
        </section>
        <section className="settings-section" aria-labelledby="settings-browser">
          <h2 id="settings-browser">Đăng nhập AI provider</h2>
          <ol className="hint setup-steps">
            <li>
              Mở terminal, chạy <code>npm run chrome</code> — một cửa sổ Chrome riêng của VideoFlow bật lên.
            </li>
            <li>Trong cửa sổ đó, đăng nhập ChatGPT (và claude.ai nếu dùng) — một lần duy nhất.</li>
            <li>Cứ để cửa sổ mở. Bấm nút dưới đây để mở nhanh tab provider khi cần.</li>
          </ol>
          <p className="hint">
            Server chỉ kết nối vào cửa sổ Chrome đó (không tự mở browser ẩn), nên đăng nhập Google hoạt
            động bình thường và phiên được giữ lại cho các lần sau.
          </p>
          <div className="field-row">
            <button type="button" className="btn" onClick={() => handleLogin('chatgpt')}>
              Mở tab ChatGPT
            </button>
            <button type="button" className="btn" onClick={() => handleLogin('claude')}>
              Mở tab Claude
            </button>
            <button type="button" className="btn" onClick={() => handleLogin('gemini')}>
              Mở tab Gemini
            </button>
          </div>
          <p role="status" className="hint">
            {loginMessage}
          </p>
        </section>
        <section className="settings-section" aria-labelledby="settings-video-web">
          <h2 id="settings-video-web">Đăng nhập web tạo video (dùng credit gói có sẵn)</h2>
          <p className="hint">
            Đăng nhập <strong>kling.ai</strong> (gói sub), <strong>Google Flow</strong> hoặc{' '}
            <strong>grok.com</strong> (Imagine — gói SuperGrok) trong cửa sổ Chrome đó để block ảnh/video chạy
            chế độ web — tiêu credit gói của bạn thay vì API trả tiền. Riêng grok.com phải tự vượt xác minh
            Cloudflare 1 lần khi đăng nhập.
          </p>
          <div className="field-row">
            <button type="button" className="btn" onClick={() => handleSiteLogin('kling', 'kling.ai')}>
              Mở tab kling.ai
            </button>
            <button type="button" className="btn" onClick={() => handleSiteLogin('flow', 'Google Flow')}>
              Mở tab Google Flow
            </button>
            <button type="button" className="btn" onClick={() => handleSiteLogin('grok', 'grok.com')}>
              Mở tab grok.com
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
