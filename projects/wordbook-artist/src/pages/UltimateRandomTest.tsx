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
}

interface PartSection {
  partNum: number;
  partTitle: string;
  words: TestWord[];
}

const ULTIMATE_WORKBOOK_ID = 'b206b49e-577b-4932-ba62-f2edf8cbe7dc';
const PART_TITLES: Record<number, string> = {
  1: '중등 필수 어휘',
  2: '중등 고난도 어휘',
  3: '고등 기본 어휘',
  4: '고등 필수 어휘',
  5: '고등 고난도 어휘',
  6: '고등 어휘 완성',
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

function TestSheetPage({ section, pageNum }: { section: PartSection; pageNum: number }) {
  const isLeftPage = pageNum % 2 === 0;
  const bindingMargin = '42px';
  const outerMargin = '16px';
  const leftMargin = isLeftPage ? outerMargin : bindingMargin;
  const rightMargin = isLeftPage ? bindingMargin : outerMargin;
  const label = `PART ${section.partNum}`;

  return (
    <div className="page-b5 shadow-2xl flex flex-col relative overflow-hidden" style={{
      width: '840px', height: '1188px', backgroundColor: '#fefdfb', pageBreakAfter: 'always',
    }}>
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 20px 20px, ${THEME_COLOR} 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }} />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[5]" style={{ transform: 'rotate(-20deg)' }}>
        <div className="text-center tracking-widest select-none whitespace-nowrap" style={{
          fontSize: '90px', color: 'rgba(180,180,180,0.12)',
          fontFamily: '"Orbitron", "Playfair Display", serif', fontWeight: 700
        }}>ULTIMATE</div>
      </div>

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
          <span style={{ fontFamily: '"Orbitron", "Playfair Display", serif', fontWeight: 700, fontSize: '10px', color: '#FFFFFF', letterSpacing: '0.1em' }}>ULTIMATE RANDOM</span>
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
          영어 단어의 <strong>우리말 뜻</strong>을 쓰세요 · <span style={{ color: THEME_COLOR }}>{section.partTitle}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px]" style={{ color: SECONDARY_COLOR }}>{section.words.length} WORDS</span>
          <span className="text-[9px]" style={{ color: '#999', fontFamily: '"Noto Sans KR", sans-serif' }}>이름: _______________</span>
        </div>
      </div>

      <div className="flex-1 py-2 px-1" style={{ marginLeft: leftMargin, marginRight: rightMargin }}>
        <div className="grid grid-cols-2 gap-4 h-full">
          {[0, 1].map(colIdx => {
            const colWords = section.words.slice(colIdx * 20, (colIdx + 1) * 20);
            return (
              <div key={colIdx} className="flex flex-col rounded-lg overflow-hidden" style={{
                border: `1px solid ${THEME_COLOR}15`, background: '#ffffff'
              }}>
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
                      PART {section.partNum} · {section.partTitle}
                    </span>
                  </div>
                  <span className="text-[8px]" style={{ color: '#999' }}>
                    {String(colIdx * 20 + 1).padStart(2, '0')} — {String(Math.min((colIdx + 1) * 20, section.words.length)).padStart(2, '0')}
                  </span>
                </div>
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

      <div className="flex-shrink-0 mb-4 relative" style={{ marginLeft: leftMargin, marginRight: rightMargin }}>
        <div style={{ height: '1px', background: `linear-gradient(90deg, transparent 0%, ${THEME_COLOR}18 20%, ${SECONDARY_COLOR}15 50%, ${THEME_COLOR}18 80%, transparent 100%)`, marginBottom: '8px' }} />
        <div className={`flex items-center h-8 ${isLeftPage ? 'justify-start' : 'justify-end'}`}>
          <div className="flex items-center gap-3 px-2">
            <span className="text-sm font-bold" style={{ color: THEME_COLOR, fontFamily: '"Orbitron", serif' }}>{pageNum}</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 rotate-45" style={{ background: `${THEME_COLOR}30` }} />
              <div className="w-8 h-px" style={{ background: `${THEME_COLOR}20` }} />
            </div>
            <span className="text-xs font-medium" style={{ color: '#888', fontFamily: '"Noto Sans KR", sans-serif' }}>ULTIMATE Random Test</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnswerKeyPage({ section, pageNum }: { section: PartSection; pageNum: number }) {
  const isLeftPage = pageNum % 2 === 0;
  const bindingMargin = '42px';
  const outerMargin = '16px';
  const leftMargin = isLeftPage ? outerMargin : bindingMargin;
  const rightMargin = isLeftPage ? bindingMargin : outerMargin;
  const label = `PART ${section.partNum}`;

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
        }}>ULTIMATE</div>
      </div>

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
        <div className="text-[10px]" style={{ color: '#666', fontFamily: '"Noto Sans KR", sans-serif' }}>
          정답지 · PART {section.partNum} {section.partTitle}
        </div>
      </div>

      <div className="flex-1 py-2 px-1" style={{ marginLeft: leftMargin, marginRight: rightMargin }}>
        <div className="grid grid-cols-2 gap-3 h-full">
          {[0, 1].map(colIdx => {
            const colWords = section.words.slice(colIdx * 20, (colIdx + 1) * 20);
            return (
              <div key={colIdx} className="flex flex-col rounded-lg overflow-hidden" style={{
                border: `1px solid ${SECONDARY_COLOR}20`, background: '#ffffff'
              }}>
                <div className="py-1.5 px-3 flex items-center gap-2 flex-shrink-0" style={{
                  background: `linear-gradient(180deg, ${SECONDARY_COLOR}10 0%, transparent 100%)`,
                  borderBottom: `1px solid ${SECONDARY_COLOR}20`
                }}>
                  <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: THEME_COLOR }}>
                    <span className="text-[10px] font-bold text-white">{colIdx + 1}</span>
                  </div>
                  <span className="text-[10px] font-semibold" style={{ color: THEME_COLOR, fontFamily: '"Noto Sans KR", sans-serif' }}>
                    PART {section.partNum} · {String(colIdx * 20 + 1).padStart(2, '0')}–{String(Math.min((colIdx + 1) * 20, section.words.length)).padStart(2, '0')}
                  </span>
                </div>
                <div className="flex-1 flex flex-col px-2 py-1">
                  {colWords.map((word, idx) => {
                    const globalNum = colIdx * 20 + idx + 1;
                    const simpleMeaning = word.meaning?.split(',')[0]?.split(';')[0]?.trim() || word.meaning;
                    return (
                      <div key={word.id} className="flex items-center gap-1.5 flex-1" style={{
                        borderBottom: idx < colWords.length - 1 ? `1px solid ${SECONDARY_COLOR}08` : 'none',
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
            );
          })}
        </div>
      </div>

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

export default function UltimateRandomTest() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [partSections, setPartSections] = useState<PartSection[]>([]);
  const printRef = useRef<HTMLDivElement>(null);

  const fetchRandomWords = async () => {
    setLoading(true);
    try {
      const { data: dayGroups, error: dgError } = await supabase
        .from('day_groups')
        .select('id, day_name')
        .eq('workbook_id', ULTIMATE_WORKBOOK_ID);
      if (dgError) throw dgError;

      const partMap: Record<number, string[]> = {};
      (dayGroups || []).forEach(dg => {
        const m = /\[Part (\d+)\]/.exec(dg.day_name);
        if (!m) return;
        const p = parseInt(m[1], 10);
        if (p < 1 || p > 6) return;
        (partMap[p] = partMap[p] || []).push(dg.id);
      });

      const sections: PartSection[] = [];
      for (let p = 1; p <= 6; p++) {
        const ids = partMap[p];
        if (!ids?.length) continue;
        const { data: words, error: wError } = await supabase
          .from('words')
          .select('id, word, meaning')
          .in('day_group_id', ids);
        if (wError || !words?.length) continue;
        const picked = shuffleArray(words).slice(0, 40);
        sections.push({
          partNum: p,
          partTitle: PART_TITLES[p] || '',
          words: picked.map(w => ({ id: w.id, word: w.word, meaning: w.meaning })),
        });
      }

      setPartSections(sections);
      toast.success(`Part ${sections.map(s => s.partNum).join(', ')} — 총 ${sections.reduce((s, v) => s + v.words.length, 0)}단어 추출 완료`);
    } catch (err) {
      console.error(err);
      toast.error('단어 추출 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRandomWords(); }, []);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Ultimate Part 1~6에서 랜덤 단어를 추출하는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b no-print">
        <div className="container mx-auto flex items-center justify-between py-3 px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-1" /> 돌아가기
            </Button>
            <h1 className="text-sm font-semibold">Ultimate Part 1~6 랜덤 시험지</h1>
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

      <div ref={printRef} className="flex flex-col items-center gap-8 py-8">
        {partSections.map((section, idx) => (
          <TestSheetPage key={`test-${idx}`} section={section} pageNum={idx + 1} />
        ))}
        {partSections.map((section, idx) => (
          <AnswerKeyPage key={`answer-${idx}`} section={section} pageNum={partSections.length + idx + 1} />
        ))}
      </div>
    </div>
  );
}