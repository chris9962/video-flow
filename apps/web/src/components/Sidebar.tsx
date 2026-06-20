import type { Workflow } from '@videoflow/shared';

export type View = 'editor' | 'templates' | 'nodes' | 'runs' | 'settings';

const NAV: { view: View; label: string }[] = [
  { view: 'editor', label: 'Editor' },
  { view: 'templates', label: 'Templates' },
  { view: 'nodes', label: 'Node mẫu' },
  { view: 'runs', label: 'Runs' },
  { view: 'settings', label: 'Settings' },
];

export function Sidebar({
  view,
  onViewChange,
  workflows,
  currentId,
  onOpen,
  onNew,
  onDelete,
}: {
  view: View;
  onViewChange: (view: View) => void;
  workflows: Workflow[];
  currentId: string | null;
  onOpen: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="sidebar">
      <div className="brand">
        VideoFlow<span className="dot">.</span>
      </div>
      <nav className="nav" aria-label="Tính năng">
        {NAV.map((item) => (
          <button
            key={item.view}
            aria-current={view === item.view ? 'page' : undefined}
            onClick={() => onViewChange(item.view)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <section className="workflow-section" aria-label="Workflows">
        <div className="section-head">
          <h2>Workflows</h2>
          <button className="btn-new" onClick={onNew}>
            + Mới
          </button>
        </div>
        <ul className="workflow-list">
          {workflows.map((w) => (
            <li key={w.id} data-active={w.id === currentId}>
              <button className="wf-open" onClick={() => onOpen(w.id)}>
                {w.name}
              </button>
              <button className="wf-delete" aria-label={`Xóa workflow ${w.name}`} onClick={() => onDelete(w.id)}>
                ✕
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
