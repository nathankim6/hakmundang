import type { RCQuestion } from '@/types/readingComprehension';
import orunLighthouseLogo from '@/assets/orun-lighthouse-logo.jpg';

interface ReadingComprehensionPageProps {
  questions: [RCQuestion, RCQuestion]; // exactly 2 questions per page
  pageNumber: number;
  totalPages: number;
  weekNumber: number;
  setNumber: number; // 1 or 2 (first or second half)
}

export function ReadingComprehensionPage({
  questions,
  pageNumber,
  totalPages,
  weekNumber,
  setNumber,
}: ReadingComprehensionPageProps) {
  const [q1, q2] = questions;

  return (
    <div className="a4-page animate-fade-in rc-page" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="page-content rc-page-content">
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
              <span className="wp8-header-chapter">Week {weekNumber} · 독해 {setNumber === 1 ? 'A' : 'B'}</span>
            </div>
          </div>
          <div className="wp8-header-rule" />
        </header>

        {/* Two-column layout */}
        <div className="rc-columns">
          {[q1, q2].map((q, idx) => {
            const parts = q.questionType.split('||');
            const questionPrompt = parts[0];
            const givenSentence = parts.length > 1 ? parts[1] : null;
            const isGrammarQ = questionPrompt.includes('어법');

            const renderPassageWithUnderlines = (text: string) => {
              const segments = text.split(/([①②③④⑤]\s*\S+)/g);
              return segments.map((seg, si) => {
                const match = seg.match(/^([①②③④⑤])\s*(\S+)$/);
                if (match) {
                  return <span key={si}>{match[1]} <span style={{ textDecoration: 'underline', textUnderlineOffset: '2px' }}>{match[2]}</span></span>;
                }
                return <span key={si}>{seg}</span>;
              });
            };

            return (
              <div key={idx} className="rc-column">
                <div className="rc-question-type">{questionPrompt}</div>

                {q.year && (
                  <div className="rc-source">({q.year}{q.errorRate ? ` ${q.errorRate}` : ''})</div>
                )}

                {givenSentence && (
                  <div className="rc-given-sentence">{givenSentence}</div>
                )}

                <div className="rc-passage">
                  {isGrammarQ
                    ? renderPassageWithUnderlines(q.passage)
                    : q.passage.split(/(?=(?<!_)\([A-C]\)(?!_))/).map((part, pi) => (
                        <span key={pi}>{pi > 0 && <><br /><br /></>}{part}</span>
                      ))
                  }
                </div>

                {!givenSentence && !isGrammarQ && (
                  <div className="rc-choices">
                    {q.choices.map((choice, ci) => (
                      <div key={ci} className="rc-choice">
                        <span className="rc-choice-label">{choice.label}</span>
                        <span className="rc-choice-text">{choice.text}</span>
                      </div>
                    ))}
                  </div>
                )}

            </div>
            );
          })}
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
