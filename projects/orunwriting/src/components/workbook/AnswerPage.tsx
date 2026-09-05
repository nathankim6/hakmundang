import { A4Page } from "./A4Page";
import { Problem } from "./ProblemPage";

interface AnswerPageProps {
  problems: {
    unitNumber: number;
    unitTitle: string;
    problems: Problem[];
    section: 'arrangement' | 'conditional';
  }[];
  pageNumber: number;
  totalPages: number;
  startIndex: number;
  unitsPerPage?: number;
}

export function AnswerPage({ problems, pageNumber, totalPages, startIndex, unitsPerPage = 2 }: AnswerPageProps) {
  const pageUnits = problems.slice(startIndex, startIndex + unitsPerPage);
  
  // Determine section from first unit on page
  const pageSection = pageUnits[0]?.section || 'conditional';
  
  // Theme colors based on section
  // 조건영작 (arrangement): 딥 와인/로즈골드 테마
  // 배열영작 (conditional): 다크 네이비/골드 테마
  const themeColors = pageSection === 'arrangement' ? {
    headerBorder: '#c77d8e',
    badgeBg: 'linear-gradient(135deg, #c77d8e 0%, #9e4a5e 100%)',
    badgeColor: '#fff',
    titleColor: '#3d1a24',
    sectionBadgeBg: '#5c1c2e',
    sectionBadgeColor: '#f4c4d0',
    unitHeaderBg: 'linear-gradient(135deg, #5c1c2e 0%, #8b3a4e 100%)',
    unitHeaderBorder: 'rgba(199,125,142,0.4)',
    unitTitleColor: '#f4c4d0',
    unitSubtitleColor: 'rgba(244,196,208,0.7)',
    sectionTagBg: 'linear-gradient(135deg, #f4c4d0 0%, #e8a8b8 100%)',
    sectionTagColor: '#5c1c2e',
    gridBorder: '#c77d8e',
    gridBg: 'rgba(199,125,142,0.04)',
    numberBg: 'linear-gradient(135deg, #c77d8e 0%, #9e4a5e 100%)',
    numberColor: '#fff',
    footerBorder: 'rgba(199,125,142,0.3)',
    footerColor: '#9e4a5e',
  } : {
    headerBorder: '#c9a227',
    badgeBg: 'linear-gradient(135deg, #c9a227 0%, #8b6914 100%)',
    badgeColor: '#0f1419',
    titleColor: '#0f1419',
    sectionBadgeBg: '#0f1419',
    sectionBadgeColor: '#c9a227',
    unitHeaderBg: 'linear-gradient(135deg, #0f1419 0%, #1a2028 100%)',
    unitHeaderBorder: 'rgba(201,162,39,0.3)',
    unitTitleColor: '#d4af37',
    unitSubtitleColor: 'rgba(212,175,55,0.7)',
    sectionTagBg: 'linear-gradient(135deg, #c9a227 0%, #8b6914 100%)',
    sectionTagColor: '#0f1419',
    gridBorder: '#c9a227',
    gridBg: 'rgba(201,162,39,0.03)',
    numberBg: 'linear-gradient(135deg, #c9a227 0%, #8b6914 100%)',
    numberColor: '#0f1419',
    footerBorder: 'rgba(201,162,39,0.3)',
    footerColor: '#8b6914',
  };

  return (
    <A4Page pageNumber={pageNumber} totalPages={totalPages} section={pageSection}>
      <div className="h-full flex flex-col">
        {/* Header - Theme-based Design */}
        <div 
          className="mb-2 pb-2 flex items-center justify-between"
          style={{ borderBottom: `1.5px solid ${themeColors.headerBorder}` }}
        >
          <div className="flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: themeColors.badgeBg }}
            >
              <span className="font-bold text-xs" style={{ color: themeColors.badgeColor }}>A</span>
            </div>
            <h2 
              className="text-base font-bold"
              style={{ color: themeColors.titleColor }}
            >
              정답 및 해설
            </h2>
          </div>
          <div 
            className="px-3 py-1 rounded"
            style={{ 
              backgroundColor: themeColors.sectionBadgeBg,
              color: themeColors.sectionBadgeColor,
              fontSize: '10px',
              fontWeight: '600',
            }}
          >
            {pageSection === 'arrangement' ? '조건영작' : '배열영작'}
          </div>
        </div>

        {/* Two units per page */}
        <div className="flex-1 flex flex-col gap-3">
          {pageUnits.map((unit) => {
            // Per-unit theme (in case mixed sections on same page)
            const unitTheme = unit.section === 'arrangement' ? {
              unitHeaderBg: 'linear-gradient(135deg, #5c1c2e 0%, #8b3a4e 100%)',
              unitHeaderBorder: 'rgba(199,125,142,0.4)',
              unitTitleColor: '#f4c4d0',
              unitSubtitleColor: 'rgba(244,196,208,0.7)',
              sectionTagBg: 'linear-gradient(135deg, #f4c4d0 0%, #e8a8b8 100%)',
              sectionTagColor: '#5c1c2e',
              gridBorder: '#c77d8e',
              gridBg: 'rgba(199,125,142,0.04)',
              numberBg: 'linear-gradient(135deg, #c77d8e 0%, #9e4a5e 100%)',
              numberColor: '#fff',
            } : {
              unitHeaderBg: 'linear-gradient(135deg, #0f1419 0%, #1a2028 100%)',
              unitHeaderBorder: 'rgba(201,162,39,0.3)',
              unitTitleColor: '#d4af37',
              unitSubtitleColor: 'rgba(212,175,55,0.7)',
              sectionTagBg: 'linear-gradient(135deg, #c9a227 0%, #8b6914 100%)',
              sectionTagColor: '#0f1419',
              gridBorder: '#c9a227',
              gridBg: 'rgba(201,162,39,0.03)',
              numberBg: 'linear-gradient(135deg, #c9a227 0%, #8b6914 100%)',
              numberColor: '#0f1419',
            };
            
            return (
              <div key={`${unit.section}-${unit.unitNumber}`} className="flex-1 flex flex-col">
                {/* Unit header - Theme-based Design */}
                <div 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-t"
                  style={{ 
                    background: unitTheme.unitHeaderBg,
                    borderBottom: `1px solid ${unitTheme.unitHeaderBorder}`,
                  }}
                >
                  <span 
                    className="text-[10px] font-bold px-2 py-0.5 rounded"
                    style={{ 
                      background: unitTheme.sectionTagBg,
                      color: unitTheme.sectionTagColor,
                    }}
                  >
                    {unit.section === 'arrangement' ? '조건' : '배열'}
                  </span>
                  <span 
                    className="text-xs font-bold"
                    style={{ color: unitTheme.unitTitleColor }}
                  >
                    UNIT {String(unit.unitNumber).padStart(2, '0')}
                  </span>
                  <span 
                    className="text-[11px] ml-1"
                    style={{ color: unitTheme.unitSubtitleColor }}
                  >
                    {unit.unitTitle}
                  </span>
                </div>
                
                {/* Problems grid - 2 columns */}
                <div 
                  className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1 px-2 py-1"
                  style={{ 
                    borderLeft: `2px solid ${unitTheme.gridBorder}`,
                    backgroundColor: unitTheme.gridBg,
                  }}
                >
                  {unit.problems.map((problem, idx) => (
                    <div 
                      key={`${unit.unitNumber}-${problem.number}-${idx}`}
                      className="flex items-start gap-1.5 py-0.5"
                    >
                      {/* Problem number badge */}
                      <div 
                        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={{ 
                          background: unitTheme.numberBg,
                          color: unitTheme.numberColor,
                        }}
                      >
                        {String(problem.number).padStart(2, '0')}
                      </div>
                      
                      {/* Answer content */}
                      <p 
                        className="flex-1 text-[11px] leading-snug"
                        style={{ color: '#1a1a1a' }}
                      >
                        {problem.answer || problem.hints?.join(' ') || ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <div 
          className="mt-2 pt-1"
          style={{ borderTop: `1px solid ${themeColors.footerBorder}` }}
        >
          <p 
            className="text-[10px] text-center"
            style={{ color: themeColors.footerColor }}
          >
            ※ 정답은 문맥에 따라 다양할 수 있습니다. 기본적인 문법과 의미가 맞으면 정답으로 인정됩니다.
          </p>
        </div>
      </div>
    </A4Page>
  );
}
