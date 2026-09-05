import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Printer, Maximize, Search, Menu, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { VolumeSelector } from './VolumeSelector';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface NavigationBarProps {
  currentPage: number;
  totalPages: number;
  totalQuestions: number;
  currentVolume?: number;
  questionsPerPage?: number;
  isAdmin?: boolean;
  volumeStartQuestion?: number;
  onPageChange: (page: number) => void;
  onPrint: (startPage?: number, endPage?: number) => void;
  onVolumeChange?: (volumeId: number) => void;
  onFullscreen?: () => void;
}

export function NavigationBar({
  currentPage,
  totalPages,
  totalQuestions,
  currentVolume,
  questionsPerPage = 10,
  isAdmin = false,
  volumeStartQuestion = 1,
  onPageChange,
  onPrint,
  onVolumeChange,
  onFullscreen
}: NavigationBarProps) {
  const [sentenceNumber, setSentenceNumber] = useState('');
  const [showPrintRange, setShowPrintRange] = useState(false);
  const [printStart, setPrintStart] = useState('1');
  const [printEnd, setPrintEnd] = useState(totalPages.toString());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const handleSentenceJump = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(sentenceNumber);
    const volumeEndQuestion = volumeStartQuestion + totalQuestions - 1;

    if (num >= volumeStartQuestion && num <= volumeEndQuestion) {
      const relativePosition = num - volumeStartQuestion;
      const contentPageIndex = Math.floor(relativePosition / questionsPerPage);
      const questionsPerChapter = 1000;
      const pagesPerChapter = questionsPerChapter / questionsPerPage;
      const chapterBlockSize = pagesPerChapter + 1;
      const chapterIndex = Math.floor(contentPageIndex / pagesPerChapter);
      const contentPageInChapter = contentPageIndex % pagesPerChapter;
      const absolutePage = 2 + chapterIndex * chapterBlockSize + 1 + contentPageInChapter + 1;
      onPageChange(absolutePage);
      setSentenceNumber('');
    }
  };

  const handleRangePrint = () => {
    const start = parseInt(printStart) || 1;
    const end = parseInt(printEnd) || totalPages;
    const validStart = Math.max(1, Math.min(start, totalPages));
    const validEnd = Math.max(validStart, Math.min(end, totalPages));
    onPrint(validStart, validEnd);
    setShowPrintRange(false);
  };

  const handlePrintAll = () => {
    onPrint();
  };

  const progress = currentPage / totalPages * 100;

  // Mobile Layout
  if (isMobile) {
    return (
      <nav className="orun-nav no-print">
        <div className="orun-nav-inner">
          {/* Top row */}
          <div className="flex items-center justify-between w-full">
            {/* Brand */}
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="orun-nav-brand text-xs">ORUN WEEKLY</span>
              {currentVolume && (
                <span className="orun-nav-vol">V{currentVolume}</span>
              )}
            </div>

            {/* Page nav + menu */}
            <div className="flex items-center gap-1">
              <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="orun-nav-btn" aria-label="이전">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="orun-nav-page-compact">
                {currentPage}<span className="orun-nav-page-sep">/{totalPages}</span>
              </span>
              <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="orun-nav-btn" aria-label="다음">
                <ChevronRight className="w-4 h-4" />
              </button>

              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button className="orun-nav-btn ml-1">
                    <Menu className="w-4 h-4" />
                  </button>
                </SheetTrigger>
                <SheetContent side="bottom" className="orun-sheet">
                  <SheetHeader>
                    <SheetTitle className="text-foreground text-left text-sm font-semibold tracking-wide">ORUN WEEKLY</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-4 py-4">
                    {currentVolume && onVolumeChange && (
                      <div className="space-y-1.5">
                        <label className="orun-sheet-label">볼륨 선택</label>
                        <VolumeSelector currentVolume={currentVolume} onVolumeChange={(v) => { onVolumeChange(v); setMobileMenuOpen(false); }} />
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <label className="orun-sheet-label">문장 번호로 이동</label>
                      <form onSubmit={(e) => { handleSentenceJump(e); setMobileMenuOpen(false); }} className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                          <input
                            type="number"
                            value={sentenceNumber}
                            onChange={e => setSentenceNumber(e.target.value)}
                            placeholder={`${volumeStartQuestion}–${volumeStartQuestion + totalQuestions - 1}`}
                            className="orun-input pl-8"
                          />
                        </div>
                        <button type="submit" className="orun-btn-accent">이동</button>
                      </form>
                    </div>
                    {isAdmin && (
                      <div className="space-y-2 pt-3 border-t border-border/50">
                        <label className="orun-sheet-label">관리자</label>
                        <div className="flex flex-col gap-2">
                          {onFullscreen && (
                            <button onClick={() => { onFullscreen(); setMobileMenuOpen(false); }} className="orun-btn-outline w-full">
                              <Maximize className="w-4 h-4" /> 수업모드
                            </button>
                          )}
                          <button onClick={() => { handlePrintAll(); setMobileMenuOpen(false); }} className="orun-btn-outline w-full">
                            <Printer className="w-4 h-4" /> 전체 인쇄
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Progress bar */}
          <div className="orun-progress">
            <div className="orun-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </nav>
    );
  }

  // Desktop Layout
  return (
    <nav className="orun-nav no-print">
      <div className="orun-nav-inner orun-nav-desktop">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="orun-nav-brand">ORUN WEEKLY</span>
          <span className="orun-nav-meta">
            {currentVolume ? `Vol.${currentVolume} · ` : ''}{totalQuestions.toLocaleString()}문장
          </span>
        </div>

        {/* Center: Page Navigation */}
        <div className="flex items-center gap-1">
          <button onClick={() => onPageChange(1)} disabled={currentPage === 1} className="orun-nav-btn" aria-label="첫 페이지">
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="orun-nav-btn" aria-label="이전">
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="orun-nav-page">
            <span className="orun-nav-page-current">{currentPage}</span>
            <span className="orun-nav-page-sep">/ {totalPages}</span>
          </div>

          <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="orun-nav-btn" aria-label="다음">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className="orun-nav-btn" aria-label="마지막 페이지">
            <ChevronsRight className="w-4 h-4" />
          </button>

          {/* Progress inline */}
          <div className="orun-progress ml-3" style={{ width: '80px' }}>
            <div className="orun-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Right: Search + Admin */}
        <div className="flex items-center gap-3">
          {/* Sentence Search */}
          <form onSubmit={handleSentenceJump} className="flex items-center gap-1.5">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="number"
                value={sentenceNumber}
                onChange={e => setSentenceNumber(e.target.value)}
                placeholder={`#${volumeStartQuestion}–${volumeStartQuestion + totalQuestions - 1}`}
                className="orun-input orun-input-sm pl-7"
                style={{ width: '140px' }}
              />
            </div>
            <button type="submit" className="orun-btn-accent text-xs">이동</button>
          </form>

          {/* Volume Selector */}
          {currentVolume && onVolumeChange && <VolumeSelector currentVolume={currentVolume} onVolumeChange={onVolumeChange} />}

          {/* Admin Controls */}
          {isAdmin && (
            <div className="flex items-center gap-1.5 ml-1 pl-3 border-l border-border/40">
              {onFullscreen && (
                <button onClick={onFullscreen} className="orun-nav-btn" title="수업모드">
                  <Maximize className="w-4 h-4" />
                </button>
              )}
              <button onClick={handlePrintAll} className="orun-nav-btn" title="전체 인쇄">
                <Printer className="w-4 h-4" />
              </button>
              <div className="relative">
                <button onClick={() => setShowPrintRange(!showPrintRange)} className="orun-btn-accent text-xs">
                  범위 인쇄
                </button>
                {showPrintRange && (
                  <div className="orun-dropdown">
                    <div className="text-[10px] font-medium text-muted-foreground mb-2 tracking-wider uppercase">인쇄 범위</div>
                    <div className="flex items-center gap-2 mb-3">
                      <input type="number" value={printStart} onChange={e => setPrintStart(e.target.value)} min={1} max={totalPages} className="orun-input orun-input-sm w-14 text-center" placeholder="시작" />
                      <span className="text-muted-foreground text-xs">–</span>
                      <input type="number" value={printEnd} onChange={e => setPrintEnd(e.target.value)} min={1} max={totalPages} className="orun-input orun-input-sm w-14 text-center" placeholder="끝" />
                    </div>
                    <button onClick={handleRangePrint} className="orun-btn-accent w-full text-xs">
                      인쇄
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
