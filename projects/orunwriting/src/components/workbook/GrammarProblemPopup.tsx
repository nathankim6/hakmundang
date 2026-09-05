import { useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { ProblemRow, ProblemType } from "./ProblemRow";
interface GrammarProblemPopupProps {
  isOpen: boolean;
  onClose: () => void;
  number: number;
  koreanSentence: string;
  hints?: string[];
  wordCount?: number;
  instructions?: string;
  type: ProblemType;
  answer?: string;
  unitNumber: number;
  unitTitle: string;
  section?: 'arrangement' | 'conditional';
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}
export function GrammarProblemPopup({
  isOpen,
  onClose,
  number,
  koreanSentence,
  hints,
  wordCount,
  instructions,
  type,
  answer,
  unitNumber,
  unitTitle,
  section = 'conditional',
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false
}: GrammarProblemPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const isArrangement = section === 'arrangement';
  const [notes, setNotes] = useState("");

  // Close on Escape, navigate with arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle arrow keys if typing in textarea
      const isTyping = document.activeElement?.tagName === 'TEXTAREA';
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && !isTyping && hasPrevious && onPrevious) {
        e.preventDefault();
        onPrevious();
      } else if (e.key === 'ArrowRight' && !isTyping && hasNext && onNext) {
        e.preventDefault();
        onNext();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, onPrevious, onNext, hasPrevious, hasNext]);

  // Reset notes when problem changes
  useEffect(() => {
    setNotes("");
  }, [number, unitNumber]);
  if (!isOpen) return null;

  // Theme colors
  const themeColors = isArrangement ? {
    headerBg: 'linear-gradient(135deg, #5c1c2e 0%, #8b3a4e 100%)',
    headerBorder: 'rgba(199,125,142,0.4)',
    numberBadgeBg: 'linear-gradient(135deg, #f4c4d0 0%, #e8a8b8 100%)',
    numberBadgeColor: '#5c1c2e',
    titleColor: '#f4c4d0',
    cardBg: 'linear-gradient(180deg, #fdfbfc 0%, #f8f0f3 100%)',
    cardBorder: 'rgba(199,125,142,0.3)',
    accentColor: '#9e4a5e',
    notesBg: 'rgba(199,125,142,0.08)',
    notesBorder: 'rgba(199,125,142,0.3)'
  } : {
    headerBg: 'linear-gradient(135deg, #0f1419 0%, #1a2028 100%)',
    headerBorder: 'rgba(201,162,39,0.3)',
    numberBadgeBg: 'linear-gradient(135deg, #c9a227 0%, #8b6914 100%)',
    numberBadgeColor: '#0f1419',
    titleColor: '#d4af37',
    cardBg: 'linear-gradient(180deg, #fefefe 0%, #faf8f0 100%)',
    cardBorder: 'rgba(201,162,39,0.3)',
    accentColor: '#8b6914',
    notesBg: 'rgba(201,162,39,0.08)',
    notesBorder: 'rgba(201,162,39,0.3)'
  };
  return <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-8">
      {/* Close button */}
      <button onClick={onClose} className="absolute top-6 right-6 z-10 p-3 rounded-full bg-white/95 hover:bg-white shadow-xl transition-all hover:scale-110" title="닫기 (ESC)">
        <X className="w-7 h-7" />
      </button>

      {/* Previous button */}
      {hasPrevious && onPrevious && <button onClick={onPrevious} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/95 hover:bg-white shadow-xl transition-all hover:scale-110" title="이전 문제 (←)">
          <ChevronLeft className="w-8 h-8" />
        </button>}

      {/* Next button */}
      {hasNext && onNext && <button onClick={onNext} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/95 hover:bg-white shadow-xl transition-all hover:scale-110" title="다음 문제 (→)">
          <ChevronRight className="w-8 h-8" />
        </button>}

      {/* Popup Card */}
      <div ref={popupRef} className="relative w-[95vw] max-w-[1600px] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto" style={{
      background: themeColors.cardBg,
      border: `3px solid ${themeColors.cardBorder}`
    }}>
        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-4" style={{
        background: themeColors.headerBg,
        borderBottom: `2px solid ${themeColors.headerBorder}`
      }}>
          <div className="flex items-center justify-center font-bold" style={{
          width: '48px',
          height: '48px',
          background: themeColors.numberBadgeBg,
          borderRadius: '10px',
          fontSize: '18px',
          color: themeColors.numberBadgeColor
        }}>
            {String(unitNumber).padStart(2, '0')}
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-xl" style={{
            color: themeColors.titleColor
          }}>
              {unitTitle}
            </h2>
          </div>
          <div className="px-4 py-2 rounded-lg text-base font-medium" style={{
          color: themeColors.titleColor,
          border: `1px solid ${themeColors.headerBorder}`,
          background: 'rgba(255,255,255,0.1)'
        }}>
            문제 {number}
          </div>
        </div>

        {/* Problem Content - Large */}
        <div className="p-10" style={{
        fontFamily: "'Noto Sans KR', 'Noto Sans', sans-serif"
      }}>
          <div style={{
          minHeight: '350px'
        }}>
            <ProblemRow number={number} koreanSentence={koreanSentence} hints={hints} wordCount={wordCount} instructions={instructions} type={type} answer={answer} isActive={true} onActivate={() => {}} className="text-3xl font-bold" section={section} />
          </div>

          {/* Chalkboard-style notes area */}
          <div className="mt-6 rounded-xl overflow-hidden shadow-lg" style={{
          border: '8px solid #8B4513',
          borderImage: 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%) 1'
        }}>
            <div className="relative p-4" style={{
            background: 'linear-gradient(135deg, #2d4a3e 0%, #1a3329 50%, #2d4a3e 100%)'
          }}>
              <label className="block text-lg font-bold mb-2 tracking-wide" style={{
              color: '#f5f5dc',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
            }}>
                ✏️ Memo  
              </label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="여기에 분석 내용을 적어보세요..." className="w-full rounded-lg p-4 text-4xl leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-yellow-300/50 transition-all placeholder:text-gray-400/60" style={{
              background: 'rgba(0,0,0,0.2)',
              border: '2px dashed rgba(255,255,255,0.2)',
              minHeight: '150px',
              color: '#ffffff',
              fontFamily: '"Noto Sans KR", sans-serif',
              fontWeight: 700,
              textShadow: '0 0 1px rgba(255,255,255,0.3)'
            }} rows={4} />
              {/* Chalk dust effect */}
              <div className="absolute bottom-2 right-4 text-xs opacity-50" style={{
              color: '#f5f5dc'
            }}>
                ✨ 분필로 작성중...
              </div>
            </div>
          </div>
        </div>

        {/* Footer hint */}
        <div className="px-6 py-3 text-center text-xs flex flex-wrap items-center justify-center gap-x-3 gap-y-1" style={{
        background: 'rgba(0,0,0,0.03)',
        color: themeColors.accentColor,
        borderTop: `1px solid ${themeColors.cardBorder}`
      }}>
          <span>← → : 이전/다음</span>
          <span>ESC: 닫기</span>
          <span className="border-l pl-3" style={{
          borderColor: themeColors.cardBorder
        }}>Shift+1: 자동완성</span>
          <span>Ctrl+Z/Y: 되돌리기</span>
          <span className="border-l pl-3" style={{
          borderColor: themeColors.cardBorder
        }}>Ctrl+1: S</span>
          <span>Ctrl+2: V</span>
          <span>Ctrl+3: O</span>
          <span>Ctrl+4: C</span>
          <span className="border-l pl-3" style={{
          borderColor: themeColors.cardBorder
        }}>Alt+1: [ ]</span>
          <span>Alt+2: ( )</span>
          <span>Alt+3: △</span>
          <span className="border-l pl-3" style={{
          borderColor: themeColors.cardBorder
        }}>~: 정답</span>
        </div>
      </div>
    </div>;
}