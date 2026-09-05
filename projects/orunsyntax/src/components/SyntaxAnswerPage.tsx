import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { Question } from '@/lib/parseQuestions';
import orunLighthouseLogo from '@/assets/orun-lighthouse-logo.jpg';
import { Check, X } from 'lucide-react';

interface SyntaxAnswerPageProps {
  items: { question: Question; analysis: string }[];
  pageNumber: number;
  chapterTitle?: string;
  grade?: 'g10' | 'g11' | 'g12';
}


function parseAnalysisCompact(text: string) {
  const sections: { type: 'error' | 'correct' | 'header' | 'sub' | 'content' | 'section-title'; content: string }[] = [];
  const lines = text.split('\n');
  let currentSection: string | null = null;

  for (const line of lines) {
    const t = line.trim();
    if (!t || t === '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━') continue;

    if (t.includes('【오류 수정】') || t.includes('오류 수정')) { currentSection = 'error'; sections.push({ type: 'section-title', content: '오류 수정' }); continue; }
    if (t.includes('【오답 분석】') || t.includes('오답 분석')) { currentSection = 'analysis'; sections.push({ type: 'section-title', content: '오답 분석' }); continue; }
    if (t.includes('【구문 분석】') || t.includes('구문 분석')) { currentSection = 'syntax'; sections.push({ type: 'section-title', content: '구문 분석' }); continue; }
    if (t.startsWith('전체 해석')) { currentSection = 'translation'; continue; }
    if (currentSection === 'translation') continue;

    if (t.startsWith('❌') || t.startsWith('오류:') || t.includes('❌ 오류')) {
      sections.push({ type: 'error', content: t.replace(/[❌]/g, '').trim().replace(/^오류:\s*/i, '') });
      continue;
    }
    if (t.startsWith('✅') || t.startsWith('정답:') || t.includes('✅ 정답')) {
      sections.push({ type: 'correct', content: t.replace(/[✅]/g, '').trim().replace(/^정답:\s*/i, '') });
      continue;
    }

    if (/^[①②③④⑤⑥⑦⑧⑨⑩]/.test(t)) {
      sections.push({ type: 'header', content: t });
      continue;
    }

    if (t.startsWith('→') || t.startsWith('•') || t.startsWith('-') || t.startsWith('·')) {
      sections.push({ type: 'sub', content: t.replace(/^[→•\-·]\s*/, '') });
      continue;
    }

    if (currentSection === 'analysis') {
      sections.push({ type: 'content', content: t });
      continue;
    }

    sections.push({ type: 'content', content: t });
  }
  return sections;
}

function renderAnalysisItem(s: { type: string; content: string }, i: number) {
  if (s.type === 'section-title') {
    return <span key={i} className="sa-section-label">{s.content}</span>;
  }
  if (s.type === 'error') {
    return (
      <div key={i} className="sa-error-line">
        <X className="w-2.5 h-2.5 text-rose-500 flex-shrink-0" strokeWidth={3} />
        <span className="line-through decoration-rose-300 text-rose-700">{s.content}</span>
      </div>
    );
  }
  if (s.type === 'correct') {
    return (
      <div key={i} className="sa-correct-line">
        <Check className="w-2.5 h-2.5 text-emerald-500 flex-shrink-0" strokeWidth={3} />
        <span className="text-emerald-700 font-medium">{s.content}</span>
      </div>
    );
  }
  if (s.type === 'header') {
    const circleNum = s.content.charAt(0);
    const rest = s.content.slice(1).trim();
    return (
      <div key={i} className="sa-struct-header">
        <span className="sa-circle-num">{circleNum}</span>
        <span>{rest}</span>
      </div>
    );
  }
  if (s.type === 'sub') {
    return <div key={i} className="sa-sub-line">→ {s.content}</div>;
  }
  return <div key={i} className="sa-content-line">{s.content}</div>;
}

function extractSubjectVerb(analysis: string): { subject: string | null; verb: string | null } {
  let subject: string | null = null;
  let verb: string | null = null;
  const lines = analysis.split('\n');
  let inSyntax = false;
  let pendingPhrase: string | null = null;

  for (const line of lines) {
    const t = line.trim();
    if (t.includes('【구문 분석】') || t.includes('구문 분석')) { inSyntax = true; continue; }
    if (t.includes('전체 해석') || (t.includes('【') && inSyntax && !t.includes('구문'))) break;
    if (!inSyntax) continue;

    // Numbered line like "② the genetic code itself (유전자...)"
    const numberedMatch = t.match(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*(.+?)(?:\s*\(|$)/);
    if (numberedMatch) {
      pendingPhrase = numberedMatch[1].trim();
      // Check if the same line has 주어/동사 info after the Korean
      if (/주어/.test(t) && !subject) {
        subject = pendingPhrase;
        pendingPhrase = null;
      } else if (/(?:본동사|술어|동사구|연결동사)/.test(t) && !/조동사|준동사|to부정사|분사/.test(t) && !verb) {
        verb = pendingPhrase;
        pendingPhrase = null;
      }
      continue;
    }

    // Description line after a numbered line
    if (pendingPhrase && t) {
      if (/주어/.test(t) && !subject) {
        subject = pendingPhrase;
      } else if (/(?:본동사|술어|동사구|연결동사)/.test(t) && !/조동사|준동사|to부정사|분사/.test(t) && !verb) {
        verb = pendingPhrase;
      }
      if (!/^[→•\-·]/.test(t)) pendingPhrase = null;
    }
  }
  return { subject, verb };
}

function highlightSentenceWithSV(
  sentence: string,
  errorWord: string | null,
  subject: string | null,
  verb: string | null,
) {
  // Build highlight ranges
  type HRange = { start: number; end: number; type: 'error' | 'subject' | 'verb' };
  const ranges: HRange[] = [];

  if (errorWord) {
    const idx = sentence.indexOf(errorWord);
    if (idx !== -1) ranges.push({ start: idx, end: idx + errorWord.length, type: 'error' });
  }
  if (subject) {
    const idx = sentence.indexOf(subject);
    if (idx !== -1) ranges.push({ start: idx, end: idx + subject.length, type: 'subject' });
  }
  if (verb) {
    const idx = sentence.indexOf(verb);
    if (idx !== -1) ranges.push({ start: idx, end: idx + verb.length, type: 'verb' });
  }

  if (ranges.length === 0) return <>{sentence}</>;

  // Sort by start position
  ranges.sort((a, b) => a.start - b.start);

  // Remove overlapping ranges (error takes priority)
  const filtered: HRange[] = [];
  for (const r of ranges) {
    const overlaps = filtered.some(f => r.start < f.end && r.end > f.start);
    if (!overlaps) filtered.push(r);
  }

  const parts: React.ReactNode[] = [];
  let cursor = 0;
  for (const r of filtered) {
    if (cursor < r.start) parts.push(sentence.slice(cursor, r.start));
    const text = sentence.slice(r.start, r.end);
    if (r.type === 'error') {
      parts.push(<span key={r.start} style={{ color: 'hsl(0 70% 45%)', fontWeight: 700, textDecoration: 'underline', textDecorationColor: 'hsl(0 70% 45%)' }}>{text}</span>);
    } else {
      const label = r.type === 'subject' ? 'S' : 'V';
      parts.push(
        <span key={r.start} style={{ background: 'hsl(50 100% 70%)', padding: '0 2px', borderRadius: '2px', position: 'relative' }}>
          {text}
          <sup style={{ fontSize: '7px', fontWeight: 700, color: 'hsl(45 80% 30%)', marginLeft: '1px' }}>{label}</sup>
        </span>
      );
    }
    cursor = r.end;
  }
  if (cursor < sentence.length) parts.push(sentence.slice(cursor));
  return <>{parts}</>;
}

function extractErrorWord(analysis: string): string | null {
  const lines = analysis.split('\n');
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith('❌') || t.includes('❌ 오류')) {
      const cleaned = t.replace(/[❌]/g, '').trim().replace(/^오류:\s*/i, '');
      const arrowMatch = cleaned.match(/^(.+?)\s*→/);
      if (arrowMatch) return arrowMatch[1].trim();
      return cleaned;
    }
  }
  return null;
}

function AnalysisCards({ parsed }: { parsed: ReturnType<typeof parseAnalysisCompact> }) {
  const left: typeof parsed = [];
  const right: typeof parsed = [];
  let target = left;
  for (const s of parsed) {
    if (s.type === 'section-title' && s.content === '구문 분석') {
      target = right;
      continue;
    }
    target.push(s);
  }

  const leftSections: { title: string; items: typeof parsed }[] = [];
  let current: { title: string; items: typeof parsed } | null = null;
  for (const item of left) {
    if (item.type === 'section-title') {
      current = { title: item.content, items: [] };
      leftSections.push(current);
    } else if (current) {
      current.items.push(item);
    }
  }

  const errorSection = leftSections.find(s => s.title === '오류 수정');
  const analysisSection = leftSections.find(s => s.title === '오답 분석');

  return (
    <div className="sa-item-analysis-2col">
      <div className="sa-col">
        {errorSection && (
          <SectionCard title="오류 수정" variant="error" badge="Error Correction">
            <div className="sa-error-correction-box">
              {errorSection.items.map((s, i) => renderAnalysisItem(s, i))}
            </div>
          </SectionCard>
        )}
        {analysisSection && (
          <SectionCard title="오답 분석" variant="analysis" badge="Analysis">
            <div className="sa-analysis-list">
              {analysisSection.items.map((s, i) => renderAnalysisItem(s, i))}
            </div>
          </SectionCard>
        )}
        <SectionCard title="문장의 의미를 쉽고 직관적인 표현으로 요약해보세요." variant="rewrite" badge="Paraphrase">
          <div className="sa-rewrite-section">
            <div className="sa-rewrite-label">
              <span className="sa-rewrite-hint">핵심이 드러나게, 짧고 직관적으로</span>
            </div>
            <div className="sa-rewrite-area" />
            <div className="sa-rewrite-area" />
          </div>
        </SectionCard>
      </div>
      <div className="sa-col">
        <SectionCard title="구문 분석" variant="syntax" badge="Structure">
          <div className="sa-section-card-body-syntax">
            <SyntaxGroups items={right} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function SyntaxGroups({ items }: { items: ReturnType<typeof parseAnalysisCompact> }) {
  const groups: { items: typeof items }[] = [];
  let current: typeof items = [];
  for (const item of items) {
    if (item.type === 'header') {
      if (current.length > 0) groups.push({ items: current });
      current = [item];
    } else {
      current.push(item);
    }
  }
  if (current.length > 0) groups.push({ items: current });

  return (
    <>
      {groups.map((group, idx) => (
        <SyntaxGroup key={idx} items={group.items} baseIndex={idx * 100} />
      ))}
    </>
  );
}

function SyntaxGroup({ items, baseIndex }: { items: ReturnType<typeof parseAnalysisCompact>; baseIndex: number }) {
  const totalLength = items.reduce((acc, item) => acc + item.content.length, 0);
  // Scale only the numbered explanation that is unusually long. All child
  // typography uses em units so this scale also affects wrapped line height.
  const scale = totalLength > 360
    ? 0.58
    : totalLength > 280
      ? 0.66
      : totalLength > 210
        ? 0.74
        : totalLength > 140
          ? 0.84
          : totalLength > 90
            ? 0.92
            : 1;

  return (
    <div className="sa-syntax-group" style={{ fontSize: `${scale}em` }}>
      {items.map((s, i) => renderAnalysisItem(s, baseIndex + i))}
    </div>
  );
}

function SectionCard({
  title,
  variant,
  badge,
  children,
}: {
  title: string;
  variant: 'error' | 'analysis' | 'rewrite' | 'syntax';
  badge: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`sa-section-card sa-section-card-${variant}`}>
      <div className="sa-section-card-header">
        <span className={`sa-section-badge sa-section-badge-${variant}`}>{badge}</span>
        <h3 className="sa-section-card-title">{title}</h3>
      </div>
      <div className={`sa-section-card-body sa-section-card-body-${variant}`}>{children}</div>
    </div>
  );
}


export function SyntaxAnswerPage({ items, pageNumber, chapterTitle, grade }: SyntaxAnswerPageProps) {
  const volumeLabel = grade === 'g10' ? 'VOL 1' : grade === 'g11' ? 'VOL 2' : 'VOL 3';

  const contentRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);
  const [fontScale, setFontScale] = useState(1);

  const scheduleScaleCalculation = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const contentEl = contentRef.current;
        const itemsEl = itemsRef.current;
        if (!contentEl || !itemsEl) return;

        const MIN_SCALE = 0.5;

        const overflows = () =>
          contentEl.scrollHeight - contentEl.clientHeight > 1 ||
          itemsEl.scrollHeight - itemsEl.clientHeight > 1;

        // Measure at full size first
        itemsEl.style.fontSize = '1em';
        if (!overflows()) {
          itemsEl.style.fontSize = '';
          setFontScale(1);
          return;
        }

        // Binary search the largest scale that fits
        let low = MIN_SCALE;
        let high = 1;
        let best = MIN_SCALE;
        for (let i = 0; i < 14; i++) {
          const mid = (low + high) / 2;
          itemsEl.style.fontSize = `${mid}em`;
          if (overflows()) {
            high = mid;
          } else {
            best = mid;
            low = mid;
          }
        }

        const finalScale = Math.max(MIN_SCALE, Math.min(1, best * 0.99));
        itemsEl.style.fontSize = `${finalScale}em`;
        setFontScale(finalScale);
      });
    });
  }, []);


  useEffect(() => {
    scheduleScaleCalculation();

    const contentEl = contentRef.current;
    const resizeHandler = () => scheduleScaleCalculation();

    let resizeObserver: ResizeObserver | null = null;
    if (contentEl && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(resizeHandler);
      resizeObserver.observe(contentEl);
    }

    window.addEventListener('resize', resizeHandler);
    window.addEventListener('beforeprint', resizeHandler);
    window.addEventListener('afterprint', resizeHandler);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', resizeHandler);
      window.removeEventListener('beforeprint', resizeHandler);
      window.removeEventListener('afterprint', resizeHandler);
    };
  }, [items, scheduleScaleCalculation]);

  return (
    <div className="a4-page rounded-xl animate-fade-in syntax-answer-page">
      <div className="page-watermark" aria-hidden="true">ORUN WEEKLY</div>
      <div className="sa-page-content" ref={contentRef}>
        {/* Header */}
        <header className="page-header">
          <div className="header-top-bar">
            <div className="header-brand">
              <div className="header-logo">
                <img src={orunLighthouseLogo} alt="ORUN Academy" className="w-10 h-10 rounded-full object-cover" />
              </div>
              <div className="header-title-block">
                <h1 className="header-main-title font-orbitron">
                  <span className="header-title-orun">ORUN</span>
                  <span className="header-title-syntax">GUIDE</span>
                  <span className="text-[9px] font-medium text-muted-foreground ml-2 tracking-wider">옳은영어 주간지 해설집</span>

                </h1>
              </div>
            </div>
            {chapterTitle && (
                <div className="ml-auto mr-0 px-[27px] flex items-center gap-[6px]" style={{ fontFamily: "'Noto Sans KR', 'Noto Sans', sans-serif" }}>
                  <span className="header-volume-badge">{volumeLabel}</span>
                  <span className="header-week-badge">{chapterTitle}</span>
                </div>
            )}

          </div>
          <div className="header-bottom-bar">
            <div className="header-line" />
            <span className="header-badge">ORUN GUIDE</span>
            <div className="header-line header-line-reverse" />
          </div>
        </header>

        {/* Items - scaled to fit */}
        <div className="sa-items-container" ref={itemsRef} style={fontScale < 1 ? { fontSize: `${fontScale}em` } : undefined}>
          {items.map(({ question, analysis }, idx) => {
            const parsed = parseAnalysisCompact(analysis);
            const errorWord = extractErrorWord(analysis);

            return (
              <div key={question.id} className="sa-flow-item">
                <div className="sa-item-header">
                  <span className="sa-item-num">{question.id}</span>
                  <p className="sa-item-sentence">{highlightSentenceWithSV(question.sentence, errorWord, null, null)}</p>
                </div>
                <AnalysisCards parsed={parsed} />
                {idx < items.length - 1 && <div className="sa-divider" />}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <footer className="page-footer">
          <div className="footer-content">
            <div className="footer-left">
              <div className="footer-accent" />
              <span className="footer-text">ORUN WEEKLY</span>
            </div>
            <div className="footer-center">
              <div className="footer-line" />
              <div className="footer-page-box">
                <span className="footer-page-number">{pageNumber}</span>
              </div>
              <div className="footer-line" />
            </div>
            <div className="footer-right">
              <span className="footer-brand-en">ORUN ENGLISH</span>
              <span className="footer-brand-ko">옳은영어</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
