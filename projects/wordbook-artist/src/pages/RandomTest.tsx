import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, Printer, RotateCcw, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import examIcon from '@/assets/exam-icon.png';

interface TestWord {
  id: string;
  word: string;
  meaning: string;
  pronunciation?: string;
}

interface VocaSection {
  vocaName: string;
  words: TestWord[];
}

// Page pair: 2 VOCAs combined = 40 questions
interface TestPage {
  sections: VocaSection[];
  pageNum: number;
}

const VOCA_IDS: Record<string, string> = {
  'ORUN VOCA 3': '73568866-d0bb-41f3-85bf-05f819a77324',
  'ORUN VOCA 4': 'c6151568-7940-45c8-be4c-f7c2765c9ce5',
  'ORUN VOCA 5': 'd5fb656a-c988-4c00-8167-6f083716267e',
  'ORUN VOCA 6': '584a4459-aee8-4f07-9928-c42403abdcd9',
  'ORUN VOCA 7': '67fdf381-c57c-4a4b-ac4c-1168bf525ea9',
  'ORUN VOCA 8': '77acfda8-11b2-40b1-9a1b-878e34fe6fa8',
};

const THEME_COLOR = '#1a1a2e';
const SECONDARY_COLOR = '#d4a853';

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Test Sheet Page (40 questions: 2 VOCAs × 20 words)
function TestSheetPage({ sections, pageNum }: { sections: VocaSection[]; pageNum: number }) {
  const allWords = sections.flatMap(s => s.words);
  const isLeftPage = pageNum % 2 === 0;
  const bindingMargin = '42px';
  const outerMargin = '16px';
  const leftMargin = isLeftPage ? outerMargin : bindingMargin;
  const rightMargin = isLeftPage ? bindingMargin : outerMargin;
  const label = sections.map(s => s.vocaName.replace('ORUN ', '')).join(' + ');

  return (
    <div className="page-b5 shadow-2xl flex flex-col relative overflow-hidden" style={{
      width: '840px', height: '1188px', backgroundColor: '#fefdfb', pageBreakAfter: 'always',
    }}>
      {/* Background texture */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 20px 20px, ${THEME_COLOR} 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }} />
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[5]" style={{ transform: 'rotate(-20deg)' }}>
        <div className="text-center tracking-widest select-none whitespace-nowrap" style={{
          fontSize: '90px', color: 'rgba(180,180,180,0.12)',
          fontFamily: '"Orbitron", "Playfair Display", serif', fontWeight: 700
        }}>ORUN VOCA</div>
      </div>

      {/* Header */}
      <div className="flex-shrink-0 h-12 flex items-center justify-between relative overflow-hidden mt-5 rounded-lg" style={{
        marginLeft: leftMargin, marginRight: rightMargin, background: THEME_COLOR
      }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%, rgba(0,0,0,0.08) 100%)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          opacity: 0.08,
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.5) 4px, rgba(255,255,255,0.5) 5px), repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(255,255,255,0.5) 4px, rgba(255,255,255,0.5) 5px)`
        }} />
        <div className="flex items-center gap-2 relative z-10 pl-4">
          <div style={{ width: '24px', height: '24px', borderRadius: '4px', overflow: 'hidden', background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <img src={examIcon} alt="" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
          </div>
          <span style={{ fontFamily: '"Orbitron", "Playfair Display", serif', fontWeight: 700, fontSize: '10px', color: '#FFFFFF', letterSpacing: '0.1em' }}>RANDOM TEST</span>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
          <span style={{ fontFamily: '"Orbitron", "Playfair Display", serif', fontWeight: 700, fontSize: '13px', color: '#FFFFFF', letterSpacing: '0.08em' }}>MEANING TEST</span>
        </div>
        <div className="flex items-center relative z-10 pr-4">
          <span style={{ fontFamily: '"Orbitron", "Playfair Display", serif', fontWeight: 700, fontSize: '12px', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.08em' }}>{label}</span>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-2" style={{ marginLeft: leftMargin, marginRight: rightMargin }}>
        <div className="text-[10px]" style={{ color: '#666', fontFamily: '"Noto Sans KR", sans-serif' }}>
          영어 단어의 <strong>우리말 뜻</strong>을 쓰세요
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px]" style={{ color: SECONDARY_COLOR }}>{allWords.length} WORDS</span>
          <span className="text-[9px]" style={{ color: '#999', fontFamily: '"Noto Sans KR", sans-serif' }}>이름: _______________</span>
        </div>
      </div>

      {/* Content: 2 columns × 20 rows */}
      <div className="flex-1 py-2 px-1" style={{ marginLeft: leftMargin, marginRight: rightMargin }}>
        <div className="grid grid-cols-2 gap-4 h-full">
          {[0, 1].map(colIdx => {
            const colWords = allWords.slice(colIdx * 20, (colIdx + 1) * 20);
            const colSection = sections[colIdx];
            return (
              <div key={colIdx} className="flex flex-col rounded-lg overflow-hidden" style={{
                border: `1px solid ${THEME_COLOR}15`, background: '#ffffff'
              }}>
                {/* Column header with VOCA name */}
                <div className="py-2 px-3 flex items-center justify-between flex-shrink-0" style={{
                  background: `linear-gradient(180deg, ${THEME_COLOR}08 0%, transparent 100%)`,
                  borderBottom: `1px solid ${SECONDARY_COLOR}25`
                }}>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: SECONDARY_COLOR }}>
                      <span className="text-[10px] font-bold text-white">{colIdx + 1}</span>
                    </div>
                    <span className="text-[10px] font-semibold" style={{
                      color: THEME_COLOR, fontFamily: '"Noto Sans KR", sans-serif'
                    }}>
                      {colSection?.vocaName || ''}
                    </span>
                  </div>
                  <span className="text-[8px]" style={{ color: '#999' }}>
                    {String(colIdx * 20 + 1).padStart(2, '0')} — {String(Math.min((colIdx + 1) * 20, allWords.length)).padStart(2, '0')}
                  </span>
                </div>

                {/* Questions */}
                <div className="flex-1 flex flex-col px-2 py-1 overflow-hidden">
                  {colWords.map((word, idx) => {
                    const globalNum = colIdx * 20 + idx + 1;
                    return (
                      <div key={word.id} className="flex items-center gap-2 flex-1" style={{
                        borderBottom: idx < colWords.length - 1 ? `1px solid ${THEME_COLOR}08` : 'none',
                        minHeight: '42px'
                      }}>
                        <span className="text-[15px] font-bold w-7 text-right flex-shrink-0" style={{
                          color: SECONDARY_COLOR, fontFamily: '"Playfair Display", serif'
                        }}>
                          {String(globalNum).padStart(2, '0')}
                        </span>
                        <span className="text-[15px] font-semibold flex-shrink-0" style={{
                          color: '#000', fontFamily: '"Noto Sans", sans-serif', minWidth: '100px'
                        }}>
                          {word.word}
                        </span>
                        {/* Answer line */}
                        <div className="flex-1 h-5 relative">
                          <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{
                            background: `linear-gradient(90deg, ${SECONDARY_COLOR}50 0%, ${SECONDARY_COLOR}20 100%)`
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 mb-4 relative" style={{ marginLeft: leftMargin, marginRight: rightMargin }}>
        <div style={{ height: '1px', background: `linear-gradient(90deg, transparent 0%, ${THEME_COLOR}18 20%, ${SECONDARY_COLOR}15 50%, ${THEME_COLOR}18 80%, transparent 100%)`, marginBottom: '8px' }} />
        <div className={`flex items-center h-8 ${isLeftPage ? 'justify-start' : 'justify-end'}`}>
          <div className="flex items-center gap-3 px-2">
            <span className="text-sm font-bold" style={{ color: THEME_COLOR, fontFamily: '"Orbitron", serif' }}>{pageNum}</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 rotate-45" style={{ background: `${THEME_COLOR}30` }} />
              <div className="w-8 h-px" style={{ background: `${THEME_COLOR}20` }} />
            </div>
            <span className="text-xs font-medium" style={{ color: '#888', fontFamily: '"Noto Sans KR", sans-serif' }}>ORUN VOCA Random Test</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Answer Key Page (40 answers: 2 VOCAs × 20 words)
function AnswerKeyPage({ sections, pageNum }: { sections: VocaSection[]; pageNum: number }) {
  const allWords = sections.flatMap(s => s.words);
  const isLeftPage = pageNum % 2 === 0;
  const bindingMargin = '42px';
  const outerMargin = '16px';
  const leftMargin = isLeftPage ? outerMargin : bindingMargin;
  const rightMargin = isLeftPage ? bindingMargin : outerMargin;
  const label = sections.map(s => s.vocaName.replace('ORUN ', '')).join(' + ');

  return (
    <div className="page-b5 shadow-2xl flex flex-col relative overflow-hidden" style={{
      width: '840px', height: '1188px', backgroundColor: '#fefdfb', pageBreakAfter: 'always',
    }}>
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 20px 20px, ${SECONDARY_COLOR} 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }} />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[5]" style={{ transform: 'rotate(-20deg)' }}>
        <div className="text-center tracking-widest select-none whitespace-nowrap" style={{
          fontSize: '90px', color: 'rgba(180,180,180,0.12)',
          fontFamily: '"Orbitron", "Playfair Display", serif', fontWeight: 700
        }}>ORUN VOCA</div>
      </div>

      {/* Header */}
      <div className="flex-shrink-0 h-12 flex items-center justify-between relative overflow-hidden mt-5 rounded-lg" style={{
        marginLeft: leftMargin, marginRight: rightMargin, background: SECONDARY_COLOR
      }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%, rgba(0,0,0,0.08) 100%)' }} />
        <div className="flex items-center gap-2 relative z-10 pl-4">
          <div style={{ width: '24px', height: '24px', borderRadius: '4px', overflow: 'hidden', background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <img src={examIcon} alt="" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
          </div>
          <span style={{ fontFamily: '"Orbitron", "Playfair Display", serif', fontWeight: 700, fontSize: '10px', color: '#FFFFFF', letterSpacing: '0.1em' }}>ANSWER KEY</span>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
          <span style={{ fontFamily: '"Orbitron", "Playfair Display", serif', fontWeight: 700, fontSize: '13px', color: '#FFFFFF', letterSpacing: '0.08em' }}>MEANING TEST</span>
        </div>
        <div className="flex items-center relative z-10 pr-4">
          <span style={{ fontFamily: '"Orbitron", "Playfair Display", serif', fontWeight: 700, fontSize: '12px', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.08em' }}>{label}</span>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-1" style={{ marginLeft: leftMargin, marginRight: rightMargin }}>
        <div className="text-[10px]" style={{ color: '#666', fontFamily: '"Noto Sans KR", sans-serif' }}>정답지</div>
      </div>

      {/* Content: 4 columns × 10 rows for compact answer layout */}
      <div className="flex-1 py-2 px-1" style={{ marginLeft: leftMargin, marginRight: rightMargin }}>
        <div className="grid grid-cols-2 gap-3 h-full">
          {sections.map((section, secIdx) => (
            <div key={secIdx} className="flex flex-col rounded-lg overflow-hidden" style={{
              border: `1px solid ${SECONDARY_COLOR}20`, background: '#ffffff'
            }}>
              <div className="py-1.5 px-3 flex items-center gap-2 flex-shrink-0" style={{
                background: `linear-gradient(180deg, ${SECONDARY_COLOR}10 0%, transparent 100%)`,
                borderBottom: `1px solid ${SECONDARY_COLOR}20`
              }}>
                <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: THEME_COLOR }}>
                  <span className="text-[10px] font-bold text-white">{secIdx + 1}</span>
                </div>
                <span className="text-[10px] font-semibold" style={{ color: THEME_COLOR, fontFamily: '"Noto Sans KR", sans-serif' }}>
                  {section.vocaName}
                </span>
              </div>
              <div className="flex-1 flex flex-col px-2 py-1">
                {section.words.map((word, idx) => {
                  const globalNum = secIdx * 20 + idx + 1;
                  const simpleMeaning = word.meaning?.split(',')[0]?.split(';')[0]?.trim() || word.meaning;
                  return (
                    <div key={word.id} className="flex items-center gap-1.5 flex-1" style={{
                      borderBottom: idx < section.words.length - 1 ? `1px solid ${SECONDARY_COLOR}08` : 'none',
                      minHeight: '36px'
                    }}>
                      <span className="text-[12px] font-bold w-6 text-right flex-shrink-0" style={{
                        color: SECONDARY_COLOR, fontFamily: '"Playfair Display", serif'
                      }}>
                        {String(globalNum).padStart(2, '0')}
                      </span>
                      <span className="text-[13px] font-semibold flex-shrink-0" style={{
                        color: '#000', fontFamily: '"Noto Sans", sans-serif'
                      }}>
                        {word.word}
                      </span>
                      <span className="text-[11px] flex-1 text-right" style={{
                        color: '#555', fontFamily: '"Noto Sans KR", sans-serif'
                      }}>
                        {simpleMeaning}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 mb-4 relative" style={{ marginLeft: leftMargin, marginRight: rightMargin }}>
        <div style={{ height: '1px', background: `linear-gradient(90deg, transparent 0%, ${SECONDARY_COLOR}18 20%, ${THEME_COLOR}15 50%, ${SECONDARY_COLOR}18 80%, transparent 100%)`, marginBottom: '8px' }} />
        <div className={`flex items-center h-8 ${isLeftPage ? 'justify-start' : 'justify-end'}`}>
          <div className="flex items-center gap-3 px-2">
            <span className="text-sm font-bold" style={{ color: SECONDARY_COLOR, fontFamily: '"Orbitron", serif' }}>{pageNum}</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 rotate-45" style={{ background: `${SECONDARY_COLOR}30` }} />
              <div className="w-8 h-px" style={{ background: `${SECONDARY_COLOR}20` }} />
            </div>
            <span className="text-xs font-medium" style={{ color: '#888', fontFamily: '"Noto Sans KR", sans-serif' }}>ANSWER KEY</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RandomTest() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [vocaSections, setVocaSections] = useState<VocaSection[]>([]);
  const printRef = useRef<HTMLDivElement>(null);

  const fetchRandomWords = async () => {
    setLoading(true);
    try {
      const sections: VocaSection[] = [];
      
      for (const [vocaName, workbookId] of Object.entries(VOCA_IDS)) {
        // Get all day_group IDs for this workbook
        const { data: dayGroups, error: dgError } = await supabase
          .from('day_groups')
          .select('id')
          .eq('workbook_id', workbookId);
        
        if (dgError || !dayGroups?.length) continue;

        const dayGroupIds = dayGroups.map(dg => dg.id);
        
        // Get all words for this workbook
        const { data: words, error: wError } = await supabase
          .from('words')
          .select('id, word, meaning, pronunciation')
          .in('day_group_id', dayGroupIds);
        
        if (wError || !words?.length) continue;

        // Shuffle and pick 20
        const shuffled = shuffleArray(words);
        const picked = shuffled.slice(0, 20);
        
        sections.push({
          vocaName,
          words: picked.map(w => ({
            id: w.id,
            word: w.word,
            meaning: w.meaning,
            pronunciation: w.pronunciation || undefined,
          })),
        });
      }

      setVocaSections(sections);
      toast.success(`${sections.length}개 VOCA에서 총 ${sections.reduce((s, v) => s + v.words.length, 0)}단어를 추출했습니다.`);
    } catch (err) {
      console.error(err);
      toast.error('단어 추출 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomWords();
  }, []);

  const handlePrint = () => window.print();

  // Pair VOCAs: 3+4, 5+6, 7+8 → 40 questions per page
  const testPages: { sections: VocaSection[] }[] = [];
  for (let i = 0; i < vocaSections.length; i += 2) {
    testPages.push({
      sections: vocaSections.slice(i, i + 2),
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">VOCA 3~8에서 랜덤 단어를 추출하는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Toolbar */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b no-print">
        <div className="container mx-auto flex items-center justify-between py-3 px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-1" /> 돌아가기
            </Button>
            <h1 className="text-sm font-semibold">VOCA 3~8 랜덤 시험지</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchRandomWords}>
              <RotateCcw className="h-4 w-4 mr-1" /> 다시 뽑기
            </Button>
            <Button size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-1" /> 인쇄
            </Button>
          </div>
        </div>
      </div>

      {/* Pages */}
      <div ref={printRef} className="flex flex-col items-center gap-8 py-8">
        {/* Test Sheets */}
        {testPages.map((page, idx) => (
          <TestSheetPage key={`test-${idx}`} sections={page.sections} pageNum={idx + 1} />
        ))}
        
        {/* Answer Keys */}
        {testPages.map((page, idx) => (
          <AnswerKeyPage key={`answer-${idx}`} sections={page.sections} pageNum={testPages.length + idx + 1} />
        ))}
      </div>
    </div>
  );
}
