import orunLighthouseLogo from '@/assets/orun-lighthouse-logo.jpg';
import { VocabItem } from './WeeklyVocabTable';

interface VocabQuizPageProps {
  weekNumber: number;
  quizItems: VocabItem[];
  pageNumber: number;
  totalPages: number;
  startNumber?: number;
  partLabel?: string;
}

export function VocabQuizPage({ weekNumber, quizItems, pageNumber, totalPages, startNumber = 1, partLabel }: VocabQuizPageProps) {
  const mid = Math.ceil(quizItems.length / 2);
  const left = quizItems.slice(0, mid);
  const right = quizItems.slice(mid);

  return (
    <div className="a4-page rounded-xl animate-fade-in" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="page-watermark" aria-hidden="true">ORUN WEEKLY</div>
      <div className="page-content">
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
                WEEK {weekNumber} · WORD TEST{partLabel ? ` · ${partLabel}` : ''}
              </span>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-between mb-2 mt-1">
          <h2 className="vt-title">WEEK {weekNumber} 단어 시험</h2>
          <div className="vt-hint">
            <span>다음 영어 단어의 한글 뜻을 쓰세요.</span>
          </div>
        </div>

        <div className="flex gap-3" style={{ flex: 1 }}>
          {[left, right].map((col, colIdx) => (
            <div key={colIdx} className="flex-1">
              <table className="vt-table" style={{ height: '100%' }}>
                <thead>
                  <tr>
                    <th className="vt-th w-[8%]">#</th>
                    <th className="vt-th w-[40%]">WORD</th>
                    <th className="vt-th w-[52%]">뜻</th>
                  </tr>
                </thead>
                <tbody>
                  {col.map((item, idx) => (
                    <tr key={idx} className="vt-row">
                      <td className="vt-td-num">{startNumber + colIdx * mid + idx}</td>
                      <td className="vt-td-word">{item.word}</td>
                      <td className="vt-td-meaning vt-blank">&nbsp;</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        <footer className="page-footer">
          <div className="footer-content">
            <div className="footer-left">
              <span className="footer-text">Week {weekNumber} Word Test</span>
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
    </div>
  );
}
