import orunLighthouseLogo from '@/assets/orun-lighthouse-logo.jpg';

export interface VocabItem {
  word: string;
  meaning: string;
  pos: string; // part of speech
  sentence_id: number;
}

interface WeeklyVocabTableProps {
  weekNumber: number;
  vocabItems: VocabItem[];
  pageNumber: number;
  totalPages: number;
  allVocabItems?: VocabItem[]; // all vocab for quiz (only on last page)
  isLastVocabPage?: boolean;
  startNumber?: number; // running number across vocab pages within a week

}

// Simple seeded shuffle for consistent quiz order
export function seededShuffle<T>(arr: T[], seed: number): T[] {
  const copy = [...arr];
  let s = seed;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647;
    const j = s % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function WeeklyVocabTable({ weekNumber, vocabItems, pageNumber, totalPages, allVocabItems, isLastVocabPage, startNumber = 1 }: WeeklyVocabTableProps) {
  // Split into two columns
  const mid = Math.ceil(vocabItems.length / 2);
  const leftCol = vocabItems.slice(0, mid);
  const rightCol = vocabItems.slice(mid);




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
                <h1 className="header-main-title font-orbitron">
                  <span className="header-title-orun text-white">ORUN</span>
                  <span className="header-title-syntax">WEEKLY</span>
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="vt-badge">
                WEEK {weekNumber} · VOCABULARY
              </span>
            </div>
          </div>
          




        </header>

        {/* Vocab Title */}
        <div className="flex items-center justify-between mb-3 mt-1">
          <div className="flex items-center gap-3">
            <h2 className="vt-title">
              WEEK {weekNumber} 핵심 어휘
            </h2>
            
          </div>
          <div className="vt-hint">
            <span className="vt-hint-swatch" />
            <span>모르는 단어는 형광펜으로 표시하고 암기하세요</span>
          </div>
        </div>

        {/* Two-column vocab table */}
        <div className="flex-1 flex gap-3">
          {[leftCol, rightCol].map((col, colIdx) =>
          <div key={colIdx} className="flex-1">
              <table className="vt-table">
                <thead>
                  <tr>
                    <th className="vt-th w-[8%]">#</th>
                    <th className="vt-th w-[35%]">WORD</th>
                    <th className="vt-th w-[12%]">품사</th>
                    <th className="vt-th w-[45%]">뜻</th>
                  </tr>
                </thead>
                <tbody>
                  {col.map((item, idx) =>
                <tr key={idx} className="vt-row">
                      <td className="vt-td-num">{startNumber + colIdx * mid + idx}</td>
                      <td className="vt-td-word">{item.word}</td>
                      <td className="vt-td-pos">{item.pos}</td>
                      <td className="vt-td-meaning">{item.meaning}</td>
                    </tr>
                )}
                </tbody>
              </table>
            </div>
          )}
        </div>




        {/* Footer */}
        <footer className="page-footer">
          <div className="footer-content">
            <div className="footer-left">
              <span className="footer-text">Week {weekNumber} Vocabulary</span>
            </div>
            <div className="footer-center">
              <div className="footer-line" />
              <div className="footer-page-box">
                <span className="footer-page-number">{pageNumber}</span>
              </div>
              <div className="footer-line" />
            </div>
            <div className="footer-right">ORUN ENGLISH</div>
          </div>
        </footer>
      </div>
    </div>);

}