import React from 'react';
import type { Question } from '@/lib/parseQuestions';
import orunLighthouseLogo from '@/assets/orun-lighthouse-logo.jpg';
import { Check, X } from 'lucide-react';

interface SyntaxAnswerFlowProps {
  items: { question: Question; analysis: string }[];
  chapters: { chapterNumber: number; title: string; startQuestion: number; endQuestion: number }[];
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

export function SyntaxAnswerFlow({ items, chapters }: SyntaxAnswerFlowProps) {
  // Group items by chapter
  const getChapterForQuestion = (qId: number) => {
    return chapters.find(c => qId >= c.startQuestion && qId <= c.endQuestion);
  };

  let lastChapter: number | null = null;

  return (
    <div className="sa-flow-container">
      {items.map(({ question, analysis }, idx) => {
        const parsed = parseAnalysisCompact(analysis);
        const ch = getChapterForQuestion(question.id);
        const showChapterHeader = ch && ch.chapterNumber !== lastChapter;
        if (ch) lastChapter = ch.chapterNumber;

        // Split into left (오류수정 + 오답분석) and right (구문분석)
        const left: typeof parsed = [];
        const right: typeof parsed = [];
        let target = left;
        for (const s of parsed) {
          if (s.type === 'section-title' && s.content === '구문 분석') {
            target = right;
            right.push(s);
            continue;
          }
          target.push(s);
        }

        return (
          <React.Fragment key={question.id}>
            {showChapterHeader && (
              <div className="sa-chapter-break">
                <div className="sa-chapter-line" />
                <span className="sa-chapter-title">Chapter {ch!.chapterNumber}. {ch!.title}</span>
                <div className="sa-chapter-line" />
              </div>
            )}
            <div className="sa-flow-item">
              <div className="sa-item-header">
                <span className="sa-item-num">{question.id}</span>
                <p className="sa-item-sentence">{question.sentence}</p>
              </div>
              <div className="sa-item-analysis-2col">
                <div className="sa-col">
                  {left.map((s, i) => renderAnalysisItem(s, i))}
                </div>
                <div className="sa-col">
                  {right.map((s, i) => renderAnalysisItem(s, i + 100))}
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
