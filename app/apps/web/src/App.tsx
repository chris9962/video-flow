import { useEffect, useState } from 'react';
import '@xyflow/react/dist/style.css';
import type { Workflow } from '@videoflow/shared';
import { Sidebar } from './components/Sidebar';
import { EditorView } from './views/EditorView';
import { WorkflowGalleryView } from './views/WorkflowGalleryView';
import { TemplatesView } from './views/TemplatesView';
import { NodeTemplatesView } from './views/NodeTemplatesView';
import { RunsView } from './views/RunsView';
import { SettingsView } from './views/SettingsView';
import { listWorkflows, getWorkflow, saveWorkflow, deleteWorkflow } from './api';
import { useExecution } from './useExecution';
import { useRouter } from './router';

export default function App() {
  const { route, navigate } = useRouter();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [current, setCurrent] = useState<Workflow | null>(null);
  const execution = useExecution();

  // Lần đầu: nạp danh sách. KHÔNG tự mở workflow nào — / và /editor là trang gallery để chọn.
  useEffect(() => {
    listWorkflows()
      .then(setWorkflows)
      .catch(() => setWorkflows([]));
  }, []);

  // URL /editor/:id → nạp đúng workflow đó (đổi URL qua sidebar/back/forward đều chạy)
  useEffect(() => {
    if (route.view !== 'editor' || !route.id) return;
    if (current?.id === route.id) return;
    getWorkflow(route.id).then(setCurrent).catch(() => setCurrent(null));
  }, [route.view, route.id, current?.id]);

  const refresh = async () => setWorkflows(await listWorkflows());

  const handleNew = async () => {
    const wf: Workflow = { id: crypto.randomUUID(), name: 'Workflow mới', nodes: [], edges: [] };
    await saveWorkflow(wf);
    await refresh();
    setCurrent(wf);
    navigate(`/editor/${wf.id}`);
  };

  const handleOpen = (id: string) => navigate(`/editor/${id}`);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa workflow này? Hành động không hoàn tác được.')) return;
    await deleteWorkflow(id);
    await refresh();
    if (current?.id === id) {
      setCurrent(null);
      navigate('/editor');
    }
  };

  const handleTemplateCreated = async (wf: Workflow) => {
    await refresh();
    setCurrent(wf);
    navigate(`/editor/${wf.id}`);
  };

  return (
    <div className="app">
      <Sidebar
        view={route.view}
        onViewChange={(v) => navigate(`/${v}`)}
        workflows={workflows}
        currentId={route.view === 'editor' ? (route.id ?? null) : null}
        onOpen={handleOpen}
        onNew={handleNew}
        onDelete={handleDelete}
      />
      {route.view === 'editor' &&
        (current && current.id === route.id ? (
          <EditorView key={current.id} workflow={current} execution={execution} onSaved={refresh} />
        ) : route.id ? (
          <div className="view">
            <div className="view-body">
              <p className="view-hint">Đang mở workflow…</p>
            </div>
          </div>
        ) : (
          <WorkflowGalleryView
            workflows={workflows}
            onOpen={handleOpen}
            onNew={handleNew}
            onDelete={handleDelete}
          />
        ))}
      {route.view === 'templates' && <TemplatesView onCreated={handleTemplateCreated} />}
      {route.view === 'nodes' && <NodeTemplatesView templateId={route.id} navigate={navigate} />}
      {route.view === 'runs' && <RunsView navigate={navigate} />}
      {route.view === 'settings' && <SettingsView />}
    </div>
  );
}
