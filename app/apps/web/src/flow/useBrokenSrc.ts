import { useState } from 'react';

/**
 * Theo dõi media (ảnh/video) tải LỖI — vd asset bị thiếu (404), node mẫu clone về thiếu file.
 * Block dùng để hiện như "chưa có ảnh/video" (empty state) thay vì ảnh vỡ.
 */
export function useBrokenSrc() {
  const [broken, setBroken] = useState<Set<string>>(() => new Set());
  return {
    isBroken: (src?: string | null): boolean => !!src && broken.has(src),
    markBroken: (src: string): void =>
      setBroken((prev) => (prev.has(src) ? prev : new Set(prev).add(src))),
  };
}
