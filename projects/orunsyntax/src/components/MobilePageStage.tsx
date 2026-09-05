import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Minus, Plus, Scan } from 'lucide-react';

const PAGE_W = 794; // 210mm @96dpi
const PAGE_H = 1123; // 297mm @96dpi

interface MobilePageStageProps {
  children: React.ReactNode;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Mobile reading stage: renders the A4 page at its natural size and scales it
 * visually, so typography/layout stay identical to print while remaining
 * pinch/button zoomable and swipe-navigable.
 */
export function MobilePageStage({ children, currentPage, totalPages, onPageChange }: MobilePageStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [fitZoom, setFitZoom] = useState(0.5);
  const [zoom, setZoom] = useState<number | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const measure = useCallback(() => {
    const el = stageRef.current;
    if (!el) return;
    const next = Math.max(0.3, el.clientWidth / PAGE_W);
    setFitZoom(next);
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
    };
  }, [measure]);

  const activeZoom = zoom ?? fitZoom;
  const isFit = zoom === null;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || !isFit) return; // only swipe when fit to width (no h-scroll)
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.6) return;
    if (dx < 0 && currentPage < totalPages) onPageChange(currentPage + 1);
    if (dx > 0 && currentPage > 1) onPageChange(currentPage - 1);
  };

  return (
    <div className="m-stage-shell">
      <div
        ref={stageRef}
        className="m-stage"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="m-stage-inner"
          style={{
            width: PAGE_W * activeZoom,
            height: PAGE_H * activeZoom,
            ['--m-zoom' as string]: activeZoom,
          }}
        >
          <div className="m-stage-page">{children}</div>
        </div>
      </div>

      {/* Floating controls */}
      <div className="m-stage-toolbar">
        <button
          type="button"
          className="m-stage-btn"
          aria-label="이전 페이지"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="m-stage-zoom">
          <button
            type="button"
            className="m-stage-zoom-btn"
            aria-label="축소"
            onClick={() => setZoom(Math.max(fitZoom * 0.8, activeZoom - 0.15))}
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            type="button"
            className={`m-stage-zoom-fit ${isFit ? 'is-active' : ''}`}
            aria-label="화면에 맞추기"
            onClick={() => setZoom(null)}
          >
            <Scan className="w-3.5 h-3.5" />
            <span>{Math.round((activeZoom / fitZoom) * 100)}%</span>
          </button>
          <button
            type="button"
            className="m-stage-zoom-btn"
            aria-label="확대"
            onClick={() => setZoom(Math.min(fitZoom * 3, activeZoom + 0.15))}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <button
          type="button"
          className="m-stage-btn"
          aria-label="다음 페이지"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
