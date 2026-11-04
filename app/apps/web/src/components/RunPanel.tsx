import { useState } from 'react';
import type { RunLogEntry } from '../useExecution';

export function RunPanel({ log, nodeLabel }: { log: RunLogEntry[]; nodeLabel: (id: string) => string }) {
  const [open, setOpen] = useState(true);

  if (log.length === 0) return null;

  return (
    <section className="run-panel" aria-label="Nhật ký chạy">
      <header>
        Run log
        <button className="collapse" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? 'thu gọn ▾' : 'mở ▸'}
        </button>
      </header>
      {open && (
        <ol className="run-log" aria-live="polite">
          {log.map((entry, i) => (
            <li key={i}>
              <span className="t">{entry.time}</span>
              <span className={`lvl-${entry.level}`}>
                {entry.nodeId ? `${nodeLabel(entry.nodeId)}: ` : ''}
                {entry.text}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
