import orunLighthouseLogo from '@/assets/orun-lighthouse-logo.jpg';
import type { VocabItem } from './WeeklyVocabTable';

interface WeeklyMatchingTestProps {
  weekNumber: number;
  vocabItems: VocabItem[];
  pageNumber: number;
  totalPages: number;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function WeeklyMatchingTest({ weekNumber, vocabItems, pageNumber, totalPages }: WeeklyMatchingTestProps) {
  // Select up to 30 items for the test, shuffle meanings separately
  const testItems = vocabItems.slice(0, 30);
  // Use a deterministic shuffle based on week number
  const shuffledMeanings = [...testItems].sort((a, b) => {
    const hashA = (a.meaning.charCodeAt(0) * 31 + weekNumber * 7) % 100;
    const hashB = (b.meaning.charCodeAt(0) * 31 + weekNumber * 7) % 100;
    return hashA - hashB;
  });

  const mid = Math.ceil(testItems.length / 2);
  const leftItems = testItems.slice(0, mid);
  const rightItems = testItems.slice(mid);
  const leftMeanings = shuffledMeanings.slice(0, mid);
  const rightMeanings = shuffledMeanings.slice(mid);

  return (
    <div className="a4-page rounded-xl animate-fade-in" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="page-watermark" aria-hidden="true">ORUN WEEKLY</div>
      <div className="page-content">
        {/* Header */}
        <header className="page-header">
          <div className="header-top-bar">
            <div className="header-brand">
              <div className="header-logo">
                <img src={orunLighthouseLogo} alt="ORUN Academy" className="w-10 h-10 rounded-full object-cover" />
              </div>
              <div className="header-title-block">
                <h1 className="header-main-title font-cinzel">
                  <span className="header-title-orun">WEEKLY</span>
                  <span className="header-title-syntax">ORUN</span>
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-semibold tracking-widest uppercase px-3 py-1 rounded bg-destructive/10 text-destructive border border-destructive/20">
                WEEK {weekNumber} · TEST
              </span>
            </div>
            <div className="header-meta">
              <div className="header-page-info">Page {pageNumber} of {totalPages}</div>
            </div>
          </div>
          <div className="header-bottom-bar">
            <div className="header-line" />
            <span className="header-badge">ORUN WEEKLY</span>
            <div className="header-line header-line-reverse" />
          </div>
        </header>

        {/* Test Title */}
        <div className="flex items-center justify-between mb-2 mt-1">
          <h2 className="text-[13px] font-bold text-foreground tracking-wide">
            ✏️ WEEK {weekNumber} 어휘 테스트 — 영한 매칭
          </h2>
          <div className="text-[10px] text-muted-foreground flex items-center gap-3">
            <span>이름: ______________</span>
            <span>점수: _____ / {testItems.length}</span>
          </div>
        </div>

        <p className="text-[9.5px] text-muted-foreground mb-3">
          왼쪽 영어 단어와 오른쪽 한국어 뜻을 연결하세요. 번호를 빈칸에 적으세요.
        </p>

        {/* Two-column matching layout */}
        <div className="flex-1 flex gap-4">
          {/* Left half */}
          <div className="flex-1 flex gap-2">
            {/* Words */}
            <div className="flex-1">
              <div className="text-[8px] font-bold text-muted-foreground tracking-widest mb-1 pb-1 border-b border-foreground/15">ENGLISH</div>
              {leftItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 py-[3px] border-b border-foreground/5 text-[10.5px]">
                  <span className="w-5 text-right text-muted-foreground font-mono text-[9px]">{idx + 1}.</span>
                  <span className="font-medium text-foreground">{item.word}</span>
                </div>
              ))}
            </div>
            {/* Meanings (shuffled) */}
            <div className="flex-1">
              <div className="text-[8px] font-bold text-muted-foreground tracking-widest mb-1 pb-1 border-b border-foreground/15">한국어 뜻</div>
              {leftMeanings.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 py-[3px] border-b border-foreground/5 text-[10.5px]">
                  <span className="w-5 h-4 border border-foreground/20 rounded text-center text-[8px] leading-4 text-muted-foreground/50 inline-block flex-shrink-0"></span>
                  <span className="text-foreground/80">{item.meaning}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="w-px bg-foreground/10" />

          {/* Right half */}
          <div className="flex-1 flex gap-2">
            {/* Words */}
            <div className="flex-1">
              <div className="text-[8px] font-bold text-muted-foreground tracking-widest mb-1 pb-1 border-b border-foreground/15">ENGLISH</div>
              {rightItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 py-[3px] border-b border-foreground/5 text-[10.5px]">
                  <span className="w-5 text-right text-muted-foreground font-mono text-[9px]">{mid + idx + 1}.</span>
                  <span className="font-medium text-foreground">{item.word}</span>
                </div>
              ))}
            </div>
            {/* Meanings (shuffled) */}
            <div className="flex-1">
              <div className="text-[8px] font-bold text-muted-foreground tracking-widest mb-1 pb-1 border-b border-foreground/15">한국어 뜻</div>
              {rightMeanings.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 py-[3px] border-b border-foreground/5 text-[10.5px]">
                  <span className="w-5 h-4 border border-foreground/20 rounded text-center text-[8px] leading-4 text-muted-foreground/50 inline-block flex-shrink-0"></span>
                  <span className="text-foreground/80">{item.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="page-footer">
          <div className="footer-content">
            <div className="footer-left">
              <span className="footer-text">Week {weekNumber} Vocabulary Test</span>
            </div>
            <div className="footer-center">
              <div className="footer-line" />
              <div className="footer-page-box">
                <span className="footer-page-number">{pageNumber}</span>
              </div>
              <div className="footer-line" />
            </div>
            <div className="footer-right">옳은영어</div>
          </div>
        </footer>
      </div>
    </div>
  );
}
