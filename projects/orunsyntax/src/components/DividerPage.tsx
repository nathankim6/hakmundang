import orunMainLogo from '@/assets/orun-academy-main-logo.jpg';

interface DividerPageProps {
  chapterNumber: number;
  startQuestion: number;
  endQuestion: number;
  startPage: number;
  endPage: number;
  chapterTitle?: string;
}

export function DividerPage({
  chapterNumber,
  startQuestion,
  endQuestion,
  startPage,
  endPage,
  chapterTitle
}: DividerPageProps) {
  const questionCount = endQuestion - startQuestion + 1;

  return (
    <div className="dv8 a4-page animate-fade-in">
      <div className="dv8-content">
        {/* Top branding with logo */}
        <div className="dv8-top">
          <div className="dv8-top-brand">
            <img src={orunMainLogo} alt="ORUN" className="dv8-top-logo" />
            <h1 className="dv8-top-brand-title font-cinzel">
              <span className="header-title-orun">ORUN</span>
              <span className="header-title-syntax">WEEKLY</span>
            </h1>
          </div>
        </div>

        <div className="dv8-top-rule" />

        {/* Chapter label & number */}
        <div className="dv8-center">
          <div className="dv8-chapter-label">CHAPTER</div>
          <div className="dv8-number">{String(chapterNumber).padStart(2, '0')}</div>
          <div className="dv8-ornament">
            <span className="dv8-ornament-line" />
            <span className="dv8-ornament-dot" />
            <span className="dv8-ornament-line" />
          </div>
          {chapterTitle && (
            <h2 className="dv8-title">{chapterTitle}</h2>
          )}
        </div>

        {/* Info grid */}
        <div className="dv8-info">
          <div className="dv8-info-item">
            <span className="dv8-info-label">SENTENCES</span>
            <span className="dv8-info-value">{questionCount}</span>
          </div>
          <div className="dv8-info-divider" />
          <div className="dv8-info-item">
            <span className="dv8-info-label">RANGE</span>
            <span className="dv8-info-value">{startQuestion}–{endQuestion}</span>
          </div>
          <div className="dv8-info-divider" />
          <div className="dv8-info-item">
            <span className="dv8-info-label">PAGES</span>
            <span className="dv8-info-value">{startPage}–{endPage}</span>
          </div>
        </div>

        {/* Bottom branding */}
        <div className="dv8-bottom">
          <img src={orunMainLogo} alt="ORUN" className="dv8-logo" />
          <span className="dv8-brand">ORUN WEEKLY</span>
        </div>

        {/* Bottom rule */}
        <div className="dv8-bottom-rule" />
      </div>
    </div>
  );
}
