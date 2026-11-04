import { useEffect, useState } from 'react';
import type { Workflow } from '@videoflow/shared';
import { listTemplates, instantiateTemplate, type TemplateSummary } from '../api';

export function TemplatesView({ onCreated }: { onCreated: (workflow: Workflow) => void }) {
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [creatingId, setCreatingId] = useState<string | null>(null);

  useEffect(() => {
    listTemplates()
      .then(setTemplates)
      .catch(() => setTemplates([]));
  }, []);

  const handleUse = async (id: string) => {
    setCreatingId(id);
    try {
      onCreated(await instantiateTemplate(id));
    } finally {
      setCreatingId(null);
    }
  };

  return (
    <div className="view">
      <div className="view-bar">
        <h1 className="view-title">Templates</h1>
      </div>
      <div className="view-body">
        {templates.map((t) => (
          <article className="template-card" key={t.id}>
            <h2>{t.name}</h2>
            {t.description && <p>{t.description}</p>}
            <button className="btn" onClick={() => handleUse(t.id)} disabled={creatingId === t.id}>
              {creatingId === t.id ? 'Đang tạo…' : 'Dùng template'}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
