import { useCallback, useEffect, useState } from 'react';
import type { View } from './components/Sidebar';

export interface Route {
  view: View;
  id?: string;
}

const VIEWS: View[] = ['editor', 'templates', 'nodes', 'runs', 'settings'];

export function parseRoute(): Route {
  const seg = location.pathname.split('/').filter(Boolean);
  const first = seg[0] as View;
  const view = VIEWS.includes(first) ? first : 'editor';
  return { view, id: seg[1] };
}

/** Routing thật bằng History API: URL đổi theo trang, back/forward + refresh giữ đúng trang. */
export function useRouter() {
  const [route, setRoute] = useState<Route>(parseRoute);

  useEffect(() => {
    const onPop = () => setRoute(parseRoute());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((path: string) => {
    if (location.pathname !== path) window.history.pushState({}, '', path);
    setRoute(parseRoute());
  }, []);

  return { route, navigate };
}
