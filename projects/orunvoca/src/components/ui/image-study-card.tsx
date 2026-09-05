import * as React from "react";
import { cn } from "@/lib/utils";
import { RotateCcw, Volume2, X, Check } from "lucide-react";

const renderHighlightedText = (text: string, highlightClass: string) => {
  const parts = text.split(/_(.*?)_/g);
  return parts.map((part, i) =>
    i % 2 === 1
      ? <span key={i} className={highlightClass}>{part}</span>
      : part
  );
};

interface ImageStudyCardProps {
  word: string;
  meaning: string;
  phonetic?: string;
  exampleEn?: string;
  exampleKr?: string;
  imageUrl?: string;
  isFlipped?: boolean;
  onFlip?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}

const ImageStudyCard = React.forwardRef<HTMLDivElement, ImageStudyCardProps>(({
  word,
  meaning,
  phonetic,
  exampleEn,
  exampleKr,
  imageUrl,
  isFlipped = false,
  onFlip,
  onSwipeLeft,
  onSwipeRight,
  className,
}, ref) => {
  const [dragX, setDragX] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isExiting, setIsExiting] = React.useState<'left' | 'right' | null>(null);
  const startX = React.useRef(0);
  const startY = React.useRef(0);
  const cardRef = React.useRef<HTMLDivElement>(null);

  const SWIPE_THRESHOLD = 80;

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - startX.current;
    const diffY = currentY - startY.current;
    
    // If vertical scroll is dominant, don't swipe
    if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffX) < 20) return;
    
    setDragX(diffX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (Math.abs(dragX) > SWIPE_THRESHOLD) {
      const direction = dragX > 0 ? 'right' : 'left';
      setIsExiting(direction);
      setTimeout(() => {
        if (direction === 'left') {
          onSwipeLeft?.();
        } else {
          onSwipeRight?.();
        }
        setDragX(0);
        setIsExiting(null);
      }, 250);
    } else {
      setDragX(0);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diffX = e.clientX - startX.current;
    setDragX(diffX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (Math.abs(dragX) > SWIPE_THRESHOLD) {
      const direction = dragX > 0 ? 'right' : 'left';
      setIsExiting(direction);
      setTimeout(() => {
        if (direction === 'left') {
          onSwipeLeft?.();
        } else {
          onSwipeRight?.();
        }
        setDragX(0);
        setIsExiting(null);
      }, 250);
    } else {
      setDragX(0);
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragX(0);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only flip if not dragging
    if (Math.abs(dragX) < 5) {
      onFlip?.();
    }
  };

  const handleSpeak = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    speechSynthesis.speak(utterance);
  };

  const rotation = dragX * 0.1;
  const opacity = isExiting ? 0 : 1 - Math.abs(dragX) / 400;
  const swipeIndicatorOpacity = Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1);

  const cardStyle: React.CSSProperties = isExiting
    ? {
        transform: `translateX(${isExiting === 'left' ? '-120%' : '120%'}) rotate(${isExiting === 'left' ? '-15' : '15'}deg)`,
        opacity: 0,
        transition: 'transform 0.25s ease-out, opacity 0.25s ease-out',
      }
    : {
        transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out',
      };

  return (
    <div className={cn("relative w-full", className)}>
      {/* Swipe indicators */}
      {(isDragging || isExiting) && (
        <>
          {/* Left indicator - 모르는 단어 */}
          <div
            className="absolute top-1/2 left-3 -translate-y-1/2 z-20 flex flex-col items-center gap-1.5 pointer-events-none"
            style={{ opacity: dragX < 0 ? swipeIndicatorOpacity : 0 }}
          >
            <div className="w-12 h-12 rounded-xl bg-white border border-neutral-300 flex items-center justify-center shadow-[0_12px_28px_-16px_rgba(15,23,42,0.6)]">
              <X className="w-5 h-5 text-neutral-700" strokeWidth={2.5} />
            </div>
            <span className="text-[9px] font-mono tracking-[0.16em] uppercase text-neutral-500">Unknown</span>
          </div>
          {/* Right indicator - 아는 단어 */}
          <div
            className="absolute top-1/2 right-3 -translate-y-1/2 z-20 flex flex-col items-center gap-1.5 pointer-events-none"
            style={{ opacity: dragX > 0 ? swipeIndicatorOpacity : 0 }}
          >
            <div className="w-12 h-12 rounded-xl bg-neutral-950 border border-neutral-950 flex items-center justify-center shadow-[0_12px_28px_-16px_rgba(15,23,42,0.9)]">
              <Check className="w-5 h-5 text-amber-400" strokeWidth={2.5} />
            </div>
            <span className="text-[9px] font-mono tracking-[0.16em] uppercase text-amber-600">Known</span>
          </div>
        </>
      )}

      <div
        ref={cardRef}
        className="relative w-full cursor-grab active:cursor-grabbing touch-manipulation select-none"
        style={cardStyle}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {/* Directional glow */}
        {dragX !== 0 && (
          <div
            className={cn(
              "absolute -inset-px rounded-2xl z-0 transition-opacity",
              dragX > 0 ? "bg-amber-400/40" : "bg-neutral-400/40"
            )}
            style={{ opacity: swipeIndicatorOpacity * 0.7 }}
          />
        )}


        {/* Front Side */}
        {!isFlipped ? (
          <div className="relative w-full rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-900 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_28px_60px_-32px_rgba(15,23,42,0.55)] z-10">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px z-30 bg-gradient-to-r from-transparent via-amber-400/70 to-transparent" />
            {/* Image Section */}
            <div className="relative w-full aspect-[3/4] overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={word}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2.5 rounded-xl border border-neutral-800 bg-neutral-950 flex items-center justify-center">
                      <span className="text-lg opacity-60">🖼️</span>
                    </div>
                    <p className="text-[9px] font-mono tracking-[0.18em] uppercase text-neutral-600">No image</p>
                  </div>
                </div>
              )}
              {/* Gradient overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-neutral-950 via-neutral-950/75 to-transparent" />
            </div>

            {/* Text Content */}
            <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
              <div className="h-px w-full bg-white/10 mb-3" />
              {/* Word + Meaning */}
              <div className="flex items-baseline gap-2.5 mb-1">
                <h2 className="text-[30px] font-semibold text-white tracking-[-0.03em] leading-none">
                  {word}
                </h2>
                <span className="text-[13px] text-neutral-300 font-medium tracking-tight truncate">
                  {meaning}
                </span>
              </div>

              {/* Phonetic + Speaker */}
              {phonetic && (
                <div className="flex items-center gap-2 mb-2.5 mt-1.5">
                  <span className="text-[11px] text-neutral-400 font-mono">
                    {phonetic}
                  </span>
                  <button
                    onClick={handleSpeak}
                    onTouchEnd={(e) => { e.stopPropagation(); handleSpeak(e); }}
                    className="w-6 h-6 rounded-md border border-white/15 bg-white/5 backdrop-blur-sm flex items-center justify-center hover:bg-white/15 transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-neutral-200" />
                  </button>
                </div>
              )}

              {/* Example Sentence (English) */}
              {exampleEn && (
                <p className="text-[13px] text-neutral-200/90 leading-relaxed line-clamp-2 tracking-tight">
                  {renderHighlightedText(exampleEn, "text-amber-400 font-semibold")}
                </p>
              )}
               {exampleKr && (
                 <p className="text-[11px] text-neutral-400/80 leading-relaxed mt-1">
                   {exampleKr}
                 </p>
               )}
            </div>

            {/* Swipe hint */}
            <div className="absolute top-3 right-3 z-20">
              <span className="text-[9px] font-mono tracking-[0.14em] uppercase text-white/60 bg-neutral-950/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded-md">
                ← Unknown · Known →
              </span>
            </div>
          </div>
        ) : (

          /* Back Side */
          <div className="relative w-full rounded-2xl overflow-hidden bg-white border border-neutral-200 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_28px_60px_-32px_rgba(15,23,42,0.4)] z-10">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/70 to-transparent" />

            <div className="relative z-10 p-6 min-h-[280px] flex flex-col justify-center">
              {/* Word */}
              <div className="mb-4">
                <div className="text-[9px] font-mono tracking-[0.24em] uppercase text-neutral-400 mb-1.5">Entry</div>
                <h3 className="text-[22px] font-semibold text-neutral-950 tracking-[-0.025em] leading-none">
                  {word}
                </h3>
                {phonetic && (
                  <span className="text-[11px] text-neutral-400 font-mono mt-1 inline-block">{phonetic}</span>
                )}
              </div>

              <div className="h-px w-full bg-neutral-200 mb-4" />

              {/* Korean Meaning */}
              <div className="mb-5">
                <div className="text-[9px] font-mono tracking-[0.24em] uppercase text-neutral-400 mb-1.5">Meaning</div>
                <p className="text-[17px] font-semibold text-neutral-950 leading-snug tracking-tight">
                  {meaning}
                </p>
              </div>

              {/* Example */}
              {exampleKr && (
                <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-3.5">
                  <div className="text-[9px] font-mono tracking-[0.24em] uppercase text-neutral-400 mb-1.5">Example</div>
                  <p className="text-[13.5px] text-neutral-800 leading-relaxed mb-1 tracking-tight">
                    {renderHighlightedText(exampleEn || '', "text-amber-600 font-semibold")}
                  </p>
                  <p className="text-[12.5px] text-neutral-500 leading-relaxed">
                    {exampleKr}
                  </p>
                </div>
              )}

              {/* Back hint */}
              <div className="absolute bottom-3 right-4">
                <span className="text-[9px] font-mono tracking-[0.14em] uppercase text-neutral-400 flex items-center gap-1">
                  <RotateCcw className="w-2.5 h-2.5" />
                  Flip
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Swipe buttons */}
      {(onSwipeLeft || onSwipeRight) && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            onClick={(e) => { e.stopPropagation(); onSwipeLeft?.(); }}
            className="group flex items-center gap-2 h-11 px-5 rounded-xl bg-white border border-neutral-200 hover:border-neutral-400 active:scale-[0.98] transition-all shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
          >
            <X className="w-4 h-4 text-neutral-500" strokeWidth={2.5} />
            <span className="text-[10px] font-mono tracking-[0.16em] uppercase text-neutral-500">Unknown</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onSwipeRight?.(); }}
            className="group flex items-center gap-2 h-11 px-5 rounded-xl bg-neutral-950 border border-neutral-950 hover:bg-neutral-800 active:scale-[0.98] transition-all shadow-[0_12px_28px_-18px_rgba(15,23,42,0.9)]"
          >
            <Check className="w-4 h-4 text-amber-400" strokeWidth={2.5} />
            <span className="text-[10px] font-mono tracking-[0.16em] uppercase text-white">Known</span>
          </button>
        </div>
      )}

    </div>
  );
});

ImageStudyCard.displayName = "ImageStudyCard";
export { ImageStudyCard };
