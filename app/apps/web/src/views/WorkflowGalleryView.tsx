import type { Workflow } from '@videoflow/shared';

const TYPE_LABEL: Record<string, string> = { text: 'text', image: 'ảnh', video: 'video' };

/** Trang /editor khi chưa mở workflow nào: lưới các workflow để mở nhanh + tạo mới. */
export function WorkflowGalleryView({
  workflows,
  onOpen,
  onNew,
  onDelete,
}: {
  workflows: Workflow[];
  onOpen: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}) {
  const counts = (w: Workflow) => {
    const c: Record<string, number> = {};
    for (const n of w.nodes) c[n.type] = (c[n.type] ?? 0) + 1;
    return c;
  };

  return (
    <div className="view">
      <div className="view-bar">
        <h1 className="view-title">Workflows</h1>
        <span className="spacer" />
        <button className="btn btn-run" onClick={onNew}>
          ＋ Workflow mới
        </button>
      </div>
      <div className="view-body">
        {workflows.length === 0 ? (
          <div className="placeholder">
            <h1>Chưa có workflow nào</h1>
            <p>Bấm “Workflow mới” để bắt đầu dựng flow đầu tiên.</p>
          </div>
        ) : (
          <div className="wf-grid">
            {workflows.map((w) => (
              <article
                key={w.id}
                className="wf-card"
                role="button"
                tabIndex={0}
                onClick={() => onOpen(w.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpen(w.id);
                  }
                }}
              >
                <div className="wf-card-preview" aria-hidden="true">
                  {w.nodes.length === 0 ? (
                    <span className="wf-empty-dot">trống</span>
                  ) : (
                    w.nodes.slice(0, 48).map((n, i) => <span key={i} className="wf-dot" data-type={n.type} />)
                  )}
                </div>
                <div className="wf-card-meta">
                  <h2 title={w.name}>{w.name}</h2>
                  <p className="wf-card-sub">
                    {w.nodes.length === 0
                      ? 'chưa có block'
                      : Object.entries(counts(w))
                          .map(([t, n]) => `${n} ${TYPE_LABEL[t] ?? t}`)
                          .join(' · ')}
                  </p>
                </div>
                <button
                  className="wf-card-del"
                  aria-label={`Xoá workflow ${w.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(w.id);
                  }}
                >
                  ✕
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
