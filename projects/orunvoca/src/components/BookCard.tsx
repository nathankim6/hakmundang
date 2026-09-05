import React from 'react';
import { BookOpen, Target, Trash2, Pencil } from 'lucide-react';
import orunLogo from '@/assets/orun-academy-new-logo.png';
interface BookCardProps {
  id: string;
  title: string;
  wordCount: number;
  dayCount: number;
  imageUrl?: string;
  isAdmin?: boolean;
  onTestClick: (e: React.MouseEvent) => void;
  onPracticeClick: (e: React.MouseEvent) => void;
  onEditClick?: (e: React.MouseEvent) => void;
  onDeleteClick?: (e: React.MouseEvent) => void;
  compact?: boolean;
}
const BookCard: React.FC<BookCardProps> = ({
  id,
  title,
  wordCount,
  dayCount,
  imageUrl,
  isAdmin,
  onTestClick,
  onPracticeClick,
  onEditClick,
  onDeleteClick,
  compact = false
}) => {
  // 타이틀 파싱
  const formatTitle = (title: string) => {
    if (title.startsWith("ORUN VOCA")) {
      const rest = title.replace("ORUN VOCA", "").trim();
      return {
        main: "ORUN VOCA",
        sub: rest
      };
    }
    return {
      main: title,
      sub: ""
    };
  };

  // 숫자를 크게 표시하는 함수
  const formatSubWithLargeNumbers = (sub: string) => {
    if (!sub) return null;
    const parts = sub.split(/(\d+)/);
    return parts.map((part, index) => {
      if (/^\d+$/.test(part)) {
        return <span key={index} className={compact ? "text-[12px] font-bold mx-0.5" : "text-[22px] md:text-[26px] font-bold mx-0.5"}>
            {part}
          </span>;
      }
      return part;
    });
  };
  const {
    main,
    sub
  } = formatTitle(title);
  const coverSize = compact
    ? 'w-full aspect-[3/4]'
    : 'w-[100px] h-[133px] sm:w-[130px] sm:h-[173px] md:w-[180px] md:h-[240px]';

  // 커스텀 이미지가 있으면 이미지 카드, 없으면 기본 타일
  const renderCover = () => {
    if (imageUrl) {
      return (
        <div className={`relative ${coverSize} overflow-hidden bg-[#f0ebe3]`}>
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-1.5 ${compact ? 'pt-5 pb-2' : 'pt-7 pb-3'}`}>
            <p
              className={`${compact ? 'text-[6.5px]' : 'text-[7.5px] sm:text-[8px] md:text-[9px]'} font-bold leading-[1.25] text-center uppercase tracking-[0.06em] break-keep bg-gradient-to-r from-[#ffffff] via-[#c8ccd2] to-[#ffffff] bg-clip-text text-transparent`}
              style={{ fontFamily: "'Orbitron', sans-serif", filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.65))' }}
            >
              {title}
            </p>
            <span className={`block mx-auto ${compact ? 'mt-1 w-6' : 'mt-1.5 w-9'} h-px bg-gradient-to-r from-transparent via-[#d5d9de]/80 to-transparent`} />
          </div>


        </div>
      );
    }

    return (
      <div className={`relative ${coverSize} overflow-hidden bg-[#2b241c] flex flex-col items-center justify-center px-3 text-center`}>
        <div className={`${compact ? 'w-5 h-5 mb-1' : 'w-8 h-8 md:w-10 md:h-10 mb-3'} rounded-full overflow-hidden bg-white/95`}>
          <img src={orunLogo} alt="ORUN Academy" className="w-full h-full object-contain" />
        </div>
        <h3
          className={`text-white ${compact ? 'text-[9px] md:text-[10px]' : 'text-[11px] md:text-[13px]'} tracking-[0.12em] leading-tight`}
          style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800 }}
        >
          {main}
        </h3>
        {sub && (
          <p
            className={`mt-0.5 text-white/70 ${compact ? 'text-[8px] md:text-[9px]' : 'text-[10px] md:text-[11px]'} tracking-[0.14em] font-semibold leading-tight`}
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            {formatSubWithLargeNumbers(sub)}
          </p>
        )}
      </div>
    );
  };

  return <div className={`group relative flex flex-col items-center ${compact ? 'w-full' : 'w-[100px] sm:w-[130px] md:w-[180px]'}`}>
      <div
        onClick={onTestClick}
        className="apple-tile apple-tile-interactive cursor-pointer w-full"
      >
        {renderCover()}
      </div>

      {/* 메타 정보 */}
      <div className={`${compact ? 'mt-1.5 gap-1' : 'mt-3 gap-1.5'} flex items-center justify-center`}>
        <span className="inline-flex items-center gap-0.5 rounded-full border border-[#e3d9c8] bg-[#faf8f5] px-1.5 py-[2px] text-[8px] md:text-[9px] font-bold tracking-[0.08em] text-[#8b7355]">
          <span className="tabular-nums text-[#1a1a1a]">{wordCount.toLocaleString()}</span>
          <span className="opacity-70">W</span>
        </span>
        <span className="inline-flex items-center gap-0.5 rounded-full border border-[#e3d9c8] bg-[#faf8f5] px-1.5 py-[2px] text-[8px] md:text-[9px] font-bold tracking-[0.08em] text-[#8b7355]">
          <span className="tabular-nums text-[#1a1a1a]">{dayCount}</span>
          <span className="opacity-70">D</span>
        </span>
      </div>

      {/* 액션 버튼들 */}
      <div className="relative w-full mt-1.5 group/actions">
        <div className={`${compact ? 'gap-1 flex-row' : 'gap-1 flex-col'} flex w-full items-center justify-center`}>
          <button
            onClick={onTestClick}
            className={`flex-1 ${compact ? 'py-[3px]' : 'py-1 w-full'} rounded-[5px] text-[7px] md:text-[8px] font-bold uppercase tracking-[0.08em] text-[#faf8f5] bg-[#8b7355] hover:bg-[#1a1a1a] active:scale-[0.97] transition-all duration-200 flex items-center justify-center gap-1 whitespace-nowrap shadow-[0_1px_2px_rgba(43,36,28,0.15)]`}
          >
            모의시험
          </button>
          <button
            onClick={onPracticeClick}
            className={`flex-1 ${compact ? 'py-[3px]' : 'py-1 w-full'} rounded-[5px] text-[7px] md:text-[8px] font-bold uppercase tracking-[0.08em] text-[#8b7355] bg-white border border-[#c9b99a] hover:bg-[#f0ebe3] hover:border-[#8b7355] active:scale-[0.97] transition-all duration-200 flex items-center justify-center gap-1 whitespace-nowrap`}
          >
            연습모드
          </button>
        </div>

        {isAdmin && (onEditClick || onDeleteClick) && (
          <div className="absolute -top-7 right-0 flex items-center justify-center gap-1.5 opacity-0 group-hover/actions:opacity-100 group-hover:opacity-100 transition-all duration-300">
            {onEditClick && <button onClick={onEditClick} className="flex items-center justify-center w-6 h-6 rounded-[4px] bg-[#f0ebe3] text-[#8b7355] hover:bg-[#c9b99a] transition-all active:scale-90">
                <Pencil className="w-3 h-3" strokeWidth={2} />
              </button>}
            {onDeleteClick && <button onClick={onDeleteClick} className="flex items-center justify-center w-6 h-6 rounded-[4px] bg-[#f0ebe3] text-[#a33] hover:bg-[#e8d5d5] transition-all active:scale-90">
                <Trash2 className="w-3 h-3" strokeWidth={2} />
              </button>}
          </div>
        )}
      </div>

    </div>;
};

export default BookCard;