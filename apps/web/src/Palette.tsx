import type { ReactNode } from 'react';
import { BLOCK_DEFINITIONS } from '@videoflow/shared';

const GLYPH: Record<string, ReactNode> = {
  // Chữ "T" — icon text quen thuộc
  text: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 4.2h9M8 4.2v8" />
    </svg>
  ),
  image: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="2.2" y="2.7" width="11.6" height="10.6" rx="1.8" />
      <circle cx="6" cy="6" r="1.1" />
      <path d="M3 11.4l3-2.7 2.4 2 2.3-2.7L13 11.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  // Video (Google Flow) — spark kiểu Google AI
  video: (
    <svg viewBox="0 0 16 16" fill="none">
      <path d="M8 1l1.1 5.9L15 8l-5.9 1.1L8 15l-1.1-5.9L1 8l5.9-1.1z" fill="currentColor" />
    </svg>
  ),
  // Kling — lettermark "K"
  kling: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3v10" />
      <path d="M11 3.5L5.5 8 11 12.5" />
    </svg>
  ),
  // Kling Edit (video→video) — vòng lặp transform
  'kling-edit': (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.2 8a4.8 4.8 0 0 1 8.2-3.4" />
      <path d="M12.8 8a4.8 4.8 0 0 1-8.2 3.4" />
      <path d="M11.6 2.2v2.6H9" />
      <path d="M4.4 13.8v-2.6H7" />
    </svg>
  ),
  // Face Swap — mặt + mũi tên đổi
  faceswap: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="5.6" r="3.4" />
      <circle cx="6.7" cy="5.2" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="9.3" cy="5.2" r="0.5" fill="currentColor" stroke="none" />
      <path d="M5.2 13h5.6" />
      <path d="M9.4 11.3L11 13l-1.6 1.7" />
    </svg>
  ),
  // Trích Prompt (Video) — khung video bên trái + dòng text bên phải (video → text)
  motion: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3.2" width="7" height="6.6" rx="1.2" />
      <path d="M4.7 5.2v2.6l2.2-1.3z" fill="currentColor" stroke="none" />
      <path d="M11 5.4h3M11 8h3M11 10.6h1.8" />
    </svg>
  ),
  // Ảnh GPT 2 bước — 2 khung ảnh chồng (2 message) + sparkle
  restyle: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4.4" width="7.5" height="7" rx="1.4" />
      <rect x="6.5" y="2" width="7.5" height="7" rx="1.4" />
      <path d="M11.3 4.1l.5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5z" fill="currentColor" stroke="none" />
    </svg>
  ),
};

const BLURB: Record<string, string> = {
  text: 'Prompt / văn bản · AI khi có input',
  image: 'Ảnh nguồn · tạo / ghép ảnh khi có input',
  video: 'Video nguồn / Flow · Start · Prompt · End',
  kling: 'Kling (fal.ai) · Start · Prompt · End → 1 video',
  'kling-edit': 'Kling Edit · video mẫu + prompt → đổi nền/style',
  faceswap: 'Face Swap · video + ảnh mặt → đổi mặt',
  motion: 'Trích Prompt · Gemini xem video → prompt chuyển động',
  restyle: 'Ảnh GPT 2 bước · Tham chiếu + Mẫu → giữ mặt, áp style',
};

export function Palette({ onAdd }: { onAdd: (type: string) => void }) {
  return (
    <aside className="palette" aria-label="Thêm block">
      <h2>Thêm block</h2>
      <div className="palette-blocks">
        {Object.values(BLOCK_DEFINITIONS).map((def) => (
          <button
            key={def.type}
            className="palette-block"
            data-type={def.emits}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('application/videoflow', def.type)}
            onClick={() => onAdd(def.type)}
            title={`Thêm block ${def.label} — ${def.description}`}
          >
            <span className="pb-icon" aria-hidden="true">
              {GLYPH[def.type] ?? GLYPH[def.emits]}
            </span>
            <span className="pb-tip" role="tooltip">
              <span className="pb-name">{def.label}</span>
              <span className="pb-desc">{BLURB[def.type] ?? def.description}</span>
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}
