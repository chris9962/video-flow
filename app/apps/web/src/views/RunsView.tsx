import { useEffect, useState } from 'react';
import { isFileRef } from '@videoflow/shared';
import { listRuns, getRun, fileUrl, type RunSummary, type RunDetail } from '../api';

const formatTime = (iso: string) => new Date(iso).toLocaleString('vi-VN', { hour12: false });

function OutputView({ value }: { value: unknown }) {
  if (isFileRef(value)) {
    const url = fileUrl(value);
    if (value.mime.startsWith('video')) return <video className="run-media" controls preload="metadata" src={url} />;
    if (value.mime.startsWith('image')) return <img className="run-media" src={url} alt="Kết quả" />;
    return (
      <a className="run-file" href={url} download>
        ⤓ Tải file
      </a>
    );
  }
  if (Array.isArray(value)) {
    return (
      <div className="run-array">
        {value.map((v, i) => (
          <OutputView key={i} value={v} />
        ))}
      </div>
    );
  }
  return <pre className="run-text">{typeof value === 'string' ? value : JSON.stringify(value, null, 2)}</pre>;
}

export function RunsView({ navigate }: { navigate: (p: string) => void }) {
  const [runs, setRuns] = useState<RunSummary[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<RunDetail | null>(null);

  useEffect(() => {
    let cancelled = false;
    listRuns()
      .then((rs) => {
        if (cancelled) return;
        setRuns(rs);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  useEffect(() => {
    if (!selected) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    getRun(selected)
      .then((d) => !cancelled && setDetail(d))
      .catch(() => !cancelled && setDetail(null));
    return () => {
      cancelled = true;
    };
  }, [selected]);

  return (
    <div className="view">
      <div className="view-bar">
        <h1 className="view-title">Runs</h1>
        <span className="spacer" />
        <button className="btn" onClick={() => setReloadKey((k) => k + 1)}>
          Tải lại
        </button>
      </div>
      <div className="view-body runs-split">
        <div className="runs-list">
          {loaded && runs.length === 0 ? (
            <p className="view-hint">Chưa có lần chạy nào — mở một workflow và bấm Chạy.</p>
          ) : (
            <table className="runs-table">
              <thead>
                <tr>
                  <th scope="col">Workflow</th>
                  <th scope="col">Trạng thái</th>
                  <th scope="col">Bắt đầu</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr
                    key={run.runId}
                    data-selected={run.runId === selected}
                    onClick={() => setSelected(run.runId)}
                  >
                    <td>{run.workflowName}</td>
                    <td>
                      <span className="run-chip" data-state={run.status}>
                        {run.status}
                      </span>
                    </td>
                    <td>{formatTime(run.startedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {detail && (
          <aside className="run-detail">
            <div className="run-detail-head">
              <div>
                <h2>{detail.workflowName}</h2>
                <span className="run-chip" data-state={detail.status}>
                  {detail.status}
                </span>
              </div>
              <button className="btn" onClick={() => navigate(`/editor/${detail.workflowId}`)}>
                Mở workflow
              </button>
            </div>
            {detail.nodes.length === 0 ? (
              <p className="view-hint">Run này chưa có output node nào (lỗi sớm hoặc bị huỷ).</p>
            ) : (
              <div className="run-nodes">
                {detail.nodes.map((n) => (
                  <section className="run-node" key={n.nodeId}>
                    <h3>{n.nodeId.slice(0, 8)}…</h3>
                    <OutputView value={n.output.content ?? n.output.out} />
                  </section>
                ))}
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
