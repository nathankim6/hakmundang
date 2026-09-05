import React from 'react';
import { ChevronDown, AlertCircle, Lightbulb, BookOpen, Check, X, Sparkles } from 'lucide-react';

interface SyntaxAnalysisDisplayProps {
  analysis: string;
  onToggle: () => void;
  isExpanded: boolean;
}

export const SyntaxAnalysisDisplay: React.FC<SyntaxAnalysisDisplayProps> = ({
  analysis,
  onToggle,
  isExpanded
}) => {
  const parseAnalysis = (text: string) => {
    const sections: {
      type: 'error-correction' | 'error-analysis' | 'syntax-header' | 'header' | 'subheader' | 'content' | 'translation' | 'divider' | 'section-title';
      content: string;
    }[] = [];
    const lines = text.split('\n');
    let currentSection: 'error' | 'analysis' | 'syntax' | 'translation' | null = null;
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed === '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━') return;

      if (trimmed.includes('【오류 수정】') || trimmed.includes('오류 수정')) {
        currentSection = 'error';
        sections.push({ type: 'section-title', content: '오류 수정' });
        return;
      }
      if (trimmed.includes('【오답 분석】') || trimmed.includes('오답 분석')) {
        currentSection = 'analysis';
        sections.push({ type: 'section-title', content: '오답 분석' });
        return;
      }
      if (trimmed.includes('【구문 분석】') || trimmed.includes('구문 분석')) {
        currentSection = 'syntax';
        sections.push({ type: 'section-title', content: '구문 분석' });
        return;
      }
      if (trimmed.startsWith('전체 해석')) {
        currentSection = 'translation';
        return;
      }

      if (trimmed.startsWith('❌') || trimmed.startsWith('오류:') || trimmed.includes('❌ 오류')) {
        sections.push({ type: 'error-correction', content: trimmed });
        return;
      }
      if (trimmed.startsWith('✅') || trimmed.startsWith('정답:') || trimmed.includes('✅ 정답')) {
        sections.push({ type: 'error-correction', content: trimmed });
        return;
      }

      if (/^[①②③④⑤⑥⑦⑧⑨⑩]/.test(trimmed)) {
        sections.push({ type: 'header', content: trimmed });
        return;
      }

      if (trimmed.startsWith('→') || trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('·')) {
        sections.push({ type: 'subheader', content: trimmed });
        return;
      }

      if (currentSection === 'translation') {
        return;
      }

      if (currentSection === 'analysis') {
        sections.push({ type: 'error-analysis', content: trimmed });
        return;
      }

      sections.push({ type: 'content', content: trimmed });
    });
    return sections;
  };

  const sections = parseAnalysis(analysis);

  // Group sections by section-title
  const groupedSections: { title: string; items: typeof sections }[] = [];
  sections.forEach(section => {
    if (section.type === 'section-title') {
      groupedSections.push({ title: section.content, items: [] });
    } else if (groupedSections.length > 0) {
      groupedSections[groupedSections.length - 1].items.push(section);
    }
  });

  const sectionConfig: Record<string, { icon: React.ReactNode; color: string; dot: string }> = {
    '오류 수정': { icon: <AlertCircle className="w-3 h-3" />, color: 'text-rose-600', dot: 'bg-rose-400' },
    '오답 분석': { icon: <Lightbulb className="w-3 h-3" />, color: 'text-amber-600', dot: 'bg-amber-400' },
    '구문 분석': { icon: <BookOpen className="w-3 h-3" />, color: 'text-blue-600', dot: 'bg-blue-400' },
  };

  const renderItem = (item: typeof sections[0], index: number) => {
    switch (item.type) {
      case 'error-correction': {
        const isError = item.content.includes('❌') || item.content.startsWith('오류');
        const cleanContent = item.content.replace(/[❌✅]/g, '').trim().replace(/^(오류:|정답:)\s*/i, '');
        return (
          <div
            key={index}
            className={`flex items-center gap-2 px-2 py-1 rounded ${
              isError ? 'bg-rose-50/80' : 'bg-emerald-50/80'
            }`}
          >
            <div className={`flex items-center justify-center w-4 h-4 rounded-full flex-shrink-0 ${
              isError ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
            }`}>
              {isError ? <X className="w-2.5 h-2.5" strokeWidth={3} /> : <Check className="w-2.5 h-2.5" strokeWidth={3} />}
            </div>
            <p className={`text-[11px] font-medium leading-tight ${isError ? 'text-rose-800 line-through decoration-rose-300' : 'text-emerald-800'}`}>
              {cleanContent}
            </p>
          </div>
        );
      }

      case 'error-analysis':
        return (
          <div key={index} className="px-2 py-1.5 text-[10px] leading-snug text-gray-500">
            {item.content}
          </div>
        );

      case 'header': {
        const circleNum = item.content.charAt(0);
        const headerText = item.content.slice(1).trim();
        const koreanMatch = headerText.match(/\(([^)]+)\)/);
        const englishPart = koreanMatch ? headerText.replace(/\([^)]+\)/, '').trim() : headerText;
        const koreanPart = koreanMatch ? koreanMatch[1] : null;
        return (
          <div key={index} className="flex items-start gap-1.5 px-2 py-1">
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] font-bold flex-shrink-0 mt-px">
              {circleNum}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-gray-800 leading-snug">{englishPart}</p>
              {koreanPart && (
                <p className="text-[10px] text-blue-500 leading-snug">{koreanPart}</p>
              )}
            </div>
          </div>
        );
      }

      case 'subheader':
        return (
          <div key={index} className="ml-6 px-1.5 py-0.5 text-[10px] text-gray-400 border-l border-blue-100">
            <span className="text-blue-300 mr-1">→</span>
            {item.content.replace(/^[→•\-·]\s*/, '')}
          </div>
        );

      default:
        return (
          <div key={index} className="px-2 py-0.5 text-[10px] text-gray-500">
            {item.content}
          </div>
        );
    }
  };

  return (
    <div
      className="relative overflow-hidden rounded-lg bg-white shadow-md border border-gray-200/70"
      onClick={e => e.stopPropagation()}
    >
      {/* Minimal Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br from-amber-400 to-orange-500">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <span className="text-[11px] font-bold text-gray-700 tracking-tight">
            ORUN <span className="text-amber-500">SYNTAX</span>
          </span>
        </div>
        <button
          className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-all"
          onClick={onToggle}
        >
          <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''}`} />
          {isExpanded ? '접기' : '펼치기'}
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-2 space-y-1.5 max-h-[50vh] overflow-y-auto">
          {groupedSections.map((group, gi) => {
            const config = sectionConfig[group.title];
            if (!config) return null;
            return (
              <div key={gi}>
                {/* Section label */}
                <div className="flex items-center gap-1.5 px-2 py-1 mb-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${config.color}`}>
                    {group.title}
                  </span>
                </div>
                {/* Section items */}
                <div className="space-y-0.5">
                  {group.items.map((item, ii) => renderItem(item, gi * 100 + ii))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Accent line */}
      {isExpanded && (
        <div className="h-px bg-gradient-to-r from-rose-300 via-amber-300 to-blue-300" />
      )}
    </div>
  );
};
