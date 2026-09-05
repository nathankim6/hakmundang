import type { RCQuestion } from '@/types/readingComprehension';
import orunLighthouseLogo from '@/assets/orun-lighthouse-logo.jpg';

interface RCExplanationPageProps {
  questions: RCQuestion[]; // up to 4 explanations per page
  pageNumber: number;
  totalPages: number;
  weekNumber: number;
  explanationPageIndex: number; // 0-based index within explanation section
}

export function RCExplanationPage({
  questions,
  pageNumber,
  totalPages,
  weekNumber,
  explanationPageIndex,
}: RCExplanationPageProps) {
  return (
    <div className="a4-page animate-fade-in rc-explanation-page" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="page-content rc-explanation-content">
        {/* Header */}
        <header className="wp8-header">
          <div className="wp8-header-inner">
            <div className="wp8-header-brand">
              <img src={orunLighthouseLogo} alt="ORUN" className="wp8-header-logo" />
              <h1 className="wp8-header-title font-cinzel">
                <span className="header-title-orun">ORUN</span>
                <span className="header-title-syntax">WEEKLY</span>
              </h1>
            </div>
            <div className="wp8-header-info">
              <span className="wp8-header-chapter">Week {weekNumber} · 해설</span>
            </div>
          </div>
          <div className="wp8-header-rule" />
        </header>

        {/* Explanations */}
        <div className="rc-explanations">
          {questions.map((q, idx) => (
            <div key={idx} className="rc-explanation-item">
              {/* Question number and answer */}
              <div className="rc-explanation-header">
                <span className="rc-explanation-num">{q.id}</span>
                <span className="rc-explanation-answer">정답 {q.answer}</span>
                {q.year && <span className="rc-explanation-source">({q.year})</span>}
              </div>

              {/* Error rate table */}
              {q.choices.some(c => c.percentage) && (
                <table className="rc-rate-table rc-rate-table-small">
                  <thead>
                    <tr>
                      {q.choices.map((c, ci) => (
                        <th key={ci}>{c.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {q.choices.map((c, ci) => (
                        <td key={ci}>{c.percentage || '-'}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              )}

              {/* Translation */}
              <div className="rc-explanation-section">
                <div className="rc-explanation-label">[해석]</div>
                <div className="rc-explanation-text">{q.translation}</div>
              </div>

              {/* Explanation */}
              {q.explanation && (
                <div className="rc-explanation-section">
                  <div className="rc-explanation-label">[해설]</div>
                  <div className="rc-explanation-text">{q.explanation}</div>
                </div>
              )}

              {/* Vocabulary */}
              {q.vocabulary.length > 0 && (
                <div className="rc-explanation-section">
                  <div className="rc-explanation-label">[단어]</div>
                  <ul className="rc-vocab-list">
                    {q.vocabulary.map((v, vi) => (
                      <li key={vi}>
                        <span className="rc-vocab-en">{v.english}</span>
                        <span className="rc-vocab-kr">{v.korean}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="wp8-footer">
          <div className="wp8-footer-inner">
            <span className="wp8-footer-left">옳은영어</span>
            <span className="wp8-footer-center wp8-footer-page">{pageNumber}</span>
            <span className="wp8-footer-right">www.orunenglish.com</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
