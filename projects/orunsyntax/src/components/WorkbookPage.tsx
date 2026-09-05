import { useRef, useEffect, useState, useCallback } from 'react';
import type { Question } from '@/lib/parseQuestions';
import type { RCQuestion } from '@/types/readingComprehension';
import orunLighthouseLogo from '@/assets/orun-lighthouse-logo.jpg';

interface WorkbookPageProps {
  questions: Question[];
  pageNumber: number;
  totalPages: number;
  totalQuestions: number;
  grammarCategories?: Record<number, string>;
  categoryViewMode?: boolean;
  chapterTitle?: string;
  rcQuestions?: RCQuestion[]; // Optional RC questions to embed at bottom
  gradeLabel?: string; // e.g., 고1, 고2, 고3
}


export function WorkbookPage({
  questions = [],
  pageNumber = 1,
  totalPages = 1,
  totalQuestions = 0,
  grammarCategories = {},
  categoryViewMode = false,
  chapterTitle,
  rcQuestions,
  gradeLabel,
}: WorkbookPageProps) {
  const startNum = questions[0]?.id ?? 0;
  const endNum = questions[questions.length - 1]?.id ?? 0;
  const isLeftPage = pageNumber % 2 === 0;
  const hasRC = rcQuestions && rcQuestions.length > 0;

  // Dynamic font scaling to guarantee content fits within the page (incl. embedded RC)
  const contentRef = useRef<HTMLDivElement>(null);
  const questionsRef = useRef<HTMLDivElement>(null);
  const rcRef = useRef<HTMLDivElement>(null);
  const [fontScale, setFontScale] = useState(1);
  const [rcScale, setRcScale] = useState(1);

  const calcScale = useCallback(() => {
    const pageContent = contentRef.current;
    const questionsContainer = questionsRef.current;
    const rcContainer = rcRef.current;
    if (!pageContent || !questionsContainer) return;

    const minScale = hasRC ? 0.62 : 0.52;
    const minRcScale = 0.55;

    const pageOverflow = () => pageContent.scrollHeight - pageContent.clientHeight > 1;
    const itemOverflow = () => {
      const items = Array.from(
        questionsContainer.querySelectorAll<HTMLElement>('.question-item')
      );
      return items.some((it) => it.scrollHeight - it.clientHeight > 1);
    };
    const containerOverflow = () =>
      questionsContainer.scrollHeight - questionsContainer.clientHeight > 1;
    const rcOverflow = () =>
      !!rcContainer && rcContainer.scrollHeight - rcContainer.clientHeight > 1;

    const hasOverflow = () =>
      itemOverflow() || containerOverflow() || pageOverflow() || rcOverflow();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Reset RC scale first
        if (rcContainer) rcContainer.style.fontSize = '1em';

        // If minimum scale still overflows, use minimum anyway
        questionsContainer.style.fontSize = `${minScale}em`;
        if (hasOverflow()) {
          // Also shrink RC as a last resort
          if (rcContainer) {
            let rLow = minRcScale, rHigh = 1, rBest = minRcScale;
            for (let i = 0; i < 10; i++) {
              const mid = (rLow + rHigh) / 2;
              rcContainer.style.fontSize = `${mid}em`;
              if (hasOverflow()) rHigh = mid;
              else { rBest = mid; rLow = mid; }
            }
            setRcScale(Math.max(minRcScale, Math.min(1, rBest * 0.99)));
          }
          setFontScale(minScale);
          return;
        }

        // Binary search largest scale that does NOT overflow
        let low = minScale;
        let high = 1;
        let best = minScale;

        for (let i = 0; i < 12; i++) {
          const mid = (low + high) / 2;
          questionsContainer.style.fontSize = `${mid}em`;

          if (hasOverflow()) {
            high = mid;
          } else {
            best = mid;
            low = mid;
          }
        }

        setRcScale(1);
        setFontScale(Math.max(minScale, Math.min(1, best * 0.995)));
      });
    });
  }, [hasRC]);

  useEffect(() => {
    const scheduleScale = () => {
      calcScale();
      window.setTimeout(calcScale, 80);
    };

    scheduleScale();

    const onBeforePrint = () => scheduleScale();
    const onAfterPrint = () => scheduleScale();

    window.addEventListener('beforeprint', onBeforePrint);
    window.addEventListener('afterprint', onAfterPrint);

    const ro = new ResizeObserver(() => scheduleScale());
    if (contentRef.current) ro.observe(contentRef.current);
    if (questionsRef.current) ro.observe(questionsRef.current);
    if (rcRef.current) ro.observe(rcRef.current);

    document.fonts?.ready.then(() => scheduleScale()).catch(() => undefined);

    return () => {
      window.removeEventListener('beforeprint', onBeforePrint);
      window.removeEventListener('afterprint', onAfterPrint);
      ro.disconnect();
    };
  }, [calcScale, questions, rcQuestions]);

  return (
    <div className="a4-page animate-fade-in" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Subtle watermark */}
      <div className="page-watermark-v7" aria-hidden="true">ORUN<br/>WEEKLY</div>

      <div className="page-content" ref={contentRef}>
        {/* Header — matches vocabulary page style */}
        <header className="page-header">
          <div className="header-top-bar">
            <div className="header-brand">
              <div className="header-logo">
                <img src={orunLighthouseLogo} alt="ORUN Academy" className="w-10 h-10 rounded-full object-cover" />
              </div>
              <div className="header-title-block">
                <h1 className="header-main-title font-orbitron">
                  <span className="header-title-orun">ORUN</span>
                  <span className="header-title-syntax">WEEKLY</span>
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="vt-badge">
                {gradeLabel ? `${gradeLabel} · ` : ''}
                {chapterTitle || `No. ${startNum}–${endNum}`}
              </span>
            </div>
          </div>
        </header>

        {/* Study instructions */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          marginTop: '4px',
          marginBottom: '4px',
          padding: '4px 6px',
          background: 'hsl(45 30% 96%)',
          borderRadius: '3px',
          border: '1px solid hsl(45 30% 88%)',
        }}>
          <p style={{
            fontSize: '7.5px',
            color: 'hsl(215 25% 30%)',
            margin: 0,
            lineHeight: 1.5,
            fontFamily: "'Noto Sans KR', sans-serif",
            fontWeight: 500,
          }}>
            <span style={{ color: 'hsl(45 80% 40%)', fontWeight: 700 }}>✏️ 학습법 |</span>{' '}
            본 동사와 본 주어에 <span style={{ background: 'hsl(50 100% 70%)', padding: '0 2px', borderRadius: '1px', fontWeight: 600 }}>노란 형광펜</span>으로 체크하고 각각 <strong>S</strong>, <strong>V</strong>를 표시하세요. 각 문장에서 <span style={{ fontWeight: 700, color: 'hsl(0 70% 45%)' }}>어법 오류 1개</span>를 찾으세요.
          </p>
          <p style={{
            fontSize: '7px',
            color: 'hsl(215 15% 45%)',
            margin: 0,
            lineHeight: 1.5,
            fontFamily: "'Noto Sans KR', sans-serif",
            fontWeight: 400,
          }}>
            💡 해석이 어려운 학생은 <strong style={{ color: 'hsl(215 40% 25%)' }}>ORUN GUIDE</strong>에서 구문 분석과 어법 해설을 먼저 읽고 이해한 뒤 다시 문장을 분석해 보세요.
          </p>
        </div>

        {/* Questions - use compact mode when RC questions are embedded */}
        <div ref={questionsRef} className={`questions-container ${hasRC ? 'questions-container-compact' : ''} ${fontScale < 0.86 ? 'questions-container-tight' : ''}`} style={{ fontSize: `${fontScale}em` }}>
          {questions.map((question, idx) => {
            const category = grammarCategories[question.id];
            const prevCategory = idx > 0 ? grammarCategories[questions[idx - 1].id] : null;
            const showCategoryHeader = categoryViewMode && category && category !== prevCategory;

            return (
              <div key={question.id}>
                {showCategoryHeader && (
                  <div className="category-divider-inline">
                    <span className="category-divider-label">{category}</span>
                  </div>
                )}
                <article className="question-item sentence-selectable">
                  <div className="question-number">{question.id}</div>
                  <div className="question-content">
                    <p className="sentence-en">{question.sentence}</p>
                    {question.translation && (
                      <p className="sentence-kr">{question.translation}</p>
                    )}
                  </div>
                </article>
              </div>
            );
          })}
        </div>

        {/* Embedded RC Questions in 2-column layout */}
        {hasRC && (
          <div ref={rcRef} className="rc-embedded-section" style={{ fontSize: `${rcScale}em` }}>
            {/* RC Section Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '6px',
            }}>
              <div style={{ flex: 1, height: '1px', background: 'hsl(215 25% 75%)' }} />
              <span style={{
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '0.15em',
                color: 'hsl(215 40% 35%)',
                fontFamily: "'Noto Sans KR', sans-serif",
              }}>📖 Reading Comprehension</span>
              <div style={{ flex: 1, height: '1px', background: 'hsl(215 25% 75%)' }} />
            </div>

            <div className="rc-embedded-columns">
              {rcQuestions!.map((q, idx) => {
                const parts = q.questionType.split('||');
                const questionPrompt = parts[0];
                const givenSentence = parts.length > 1 ? parts[1] : null;
                const isGrammarQ = questionPrompt.includes('어법');

                // For grammar questions, underline words after circled numbers
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
                  <div key={idx} className="rc-embedded-column">
                    <div className="rc-question-type" style={{ fontSize: '12px', marginBottom: '2px' }}>{questionPrompt}</div>
                    {q.year && (
                      <div className="rc-source" style={{ fontSize: '9px', marginBottom: '4px' }}>({q.year}{q.errorRate ? ` ${q.errorRate}` : ''})</div>
                    )}
                    {givenSentence && (
                      <div className="rc-given-sentence" style={{ fontSize: '11.5px', padding: '4px 6px', marginBottom: '4px' }}>{givenSentence}</div>
                    )}
                    <div className="rc-passage" style={{ fontSize: '11.5px', lineHeight: 1.5 }}>
                      {isGrammarQ
                        ? renderPassageWithUnderlines(q.passage)
                        : q.passage.split(/(?=(?<!_)\([A-C]\)(?!_))/).map((part, pi) => (
                            <span key={pi}>{pi > 0 && <><br /><br /></>}{part}</span>
                          ))
                      }
                    </div>
                    {!givenSentence && !isGrammarQ && (
                      <div className="rc-choices" style={{ marginTop: '4px' }}>
                        {q.choices.map((choice, ci) => (
                          <div key={ci} className="rc-choice" style={{ fontSize: '11px' }}>
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
          </div>
        )}

        {/* Footer */}
        <footer className="wp8-footer">
          <div className="wp8-footer-inner">
            <span className="wp8-footer-left">ORUN WEEKLY</span>
            <span className="wp8-footer-center wp8-footer-page">{pageNumber}</span>
            <span className="wp8-footer-right">옳은영어 고등부</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
