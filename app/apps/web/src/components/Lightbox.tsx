import { useEffect } from 'react';
import { createPortal } from 'react-dom';

/** Xem media toàn màn hình. Portal ra body để không bị transform của canvas React Flow cắt/đẩy lệch.
 *  Đóng bằng Esc hoặc click nền. */
export function Lightbox({
  src,
  kind,
  onClose,
}: {
  src: string;
  kind: 'image' | 'video';
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Xem toàn màn hình" onClick={onClose}>
      <button className="lightbox-close" aria-label="Đóng" onClick={onClose}>
        ✕
      </button>
      {kind === 'video' ? (
        <video className="lightbox-media" src={src} controls autoPlay onClick={(e) => e.stopPropagation()} />
      ) : (
        <img className="lightbox-media" src={src} alt="Xem toàn màn hình" onClick={(e) => e.stopPropagation()} />
      )}
    </div>,
    document.body,
  );
}
