import { useEffect, useState } from 'react';

export interface AiMessage {
  role: 'user' | 'ai' | 'error' | 'review';
  text: string;
}

/** Panel chat AI dựng workflow — trình bày thuần, logic (gọi API + áp ops) nằm ở EditorView. */
export function AiChatPanel({
  messages,
  busy,
  attachCount,
  selectedCount,
  onSubmit,
  onAttach,
  onClose,
}: {
  messages: AiMessage[];
  busy: boolean;
  attachCount: number;
  selectedCount: number;
  onSubmit: (text: string) => void;
  onAttach: (file: File) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState('');
  // Đếm giây khi AI đang dựng — build workflow phức tạp ~60–120s, hiển thị để biết đang chạy chứ không treo
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!busy) {
      setElapsed(0);
      return;
    }
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [busy]);

  const submit = () => {
    const t = text.trim();
    if (t && !busy) {
      onSubmit(t);
      setText('');
    }
  };

  return (
    <aside className="ai-panel" aria-label="AI dựng workflow">
      <header className="ai-panel-head">
        <strong>AI dựng workflow</strong>
        <button className="ai-close" onClick={onClose} aria-label="Đóng panel AI" title="Đóng">
          ✕
        </button>
      </header>
      <div className="ai-msgs">
        {messages.length === 0 && (
          <p className="ai-hint">
            Mô tả video bạn muốn — vd <em>"video giới thiệu tất chân 3 shot"</em>. Kéo ảnh sản phẩm vào
            canvas hoặc bấm 📎 đính ảnh trước, AI sẽ tự viết kịch bản, tách shot và dựng các block.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`ai-msg ai-${m.role}`}>
            {m.text}
          </div>
        ))}
        {busy && (
          <div className="ai-msg ai-ai ai-busy" aria-live="polite">
            <span className="ai-think-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            thinking {elapsed > 0 && <span className="ai-think-time">{elapsed}s</span>}
            {elapsed >= 20 && <span className="ai-think-hint"> · workflow phức tạp có thể mất 1–2 phút</span>}
          </div>
        )}
      </div>
      {selectedCount > 0 && (
        <div className="ai-selctx" title="AI sẽ hiểu 'node này / mấy node này' là các node bạn đang chọn trên canvas">
          📍 {selectedCount} node đang chọn — AI sẽ bám vào khi bạn nói "node này"
        </div>
      )}
      <div className="ai-input">
        <label className="ai-attach" aria-label="Đính ảnh sản phẩm" title="Đính ảnh sản phẩm">
          📎{attachCount > 0 && <span className="ai-attach-n">{attachCount}</span>}
          <input
            type="file"
            accept="image/*"
            className="visually-hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onAttach(f);
              e.target.value = '';
            }}
          />
        </label>
        <textarea
          className="nodrag"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Nhắn AI… (Enter gửi, Shift+Enter xuống dòng)"
          rows={2}
          disabled={busy}
          aria-label="Tin nhắn cho AI"
        />
        <button className="btn btn-run" onClick={submit} disabled={busy || !text.trim()}>
          Gửi
        </button>
      </div>
    </aside>
  );
}
