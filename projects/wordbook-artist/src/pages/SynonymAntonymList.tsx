import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loadWorkbook } from '@/utils/workbookStorage';
import { DayGroup, VocabularyWord } from '@/types/vocabulary';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const WORKBOOKS = {
  sungnam: { id: '2ba8fb56-c7b0-4fe5-af65-3f63dcf20a9a', name: '워드마스터 수능2000' },
};

interface WordPair {
  day: string;
  headword: string;
  headwordMeaning: string;
  relatedWord: string;
  relatedMeaning: string;
  relation: '동의어' | '반의어';
}

const SynonymAntonymList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const school = 'sungnam' as const;
  const printRef = useRef<HTMLDivElement>(null);

  const [dayGroups, setDayGroups] = useState<DayGroup[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startDay, setStartDay] = useState(1);
  const [endDay, setEndDay] = useState(5);
  const [pairs, setPairs] = useState<WordPair[]>([]);
  const [filter, setFilter] = useState<'all' | '동의어' | '반의어'>('all');
  const [isVerifying, setIsVerifying] = useState(false);
  const wb = WORKBOOKS[school];

  useEffect(() => {
    loadData();
  }, [school]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const result = await loadWorkbook(wb.id);
      setDayGroups(result.dayGroups);
    } catch {
      toast.error('단어장 로드 실패');
    } finally {
      setIsLoading(false);
    }
  };

  // Load derivative relations from localStorage cache
  const getDerivativeRelations = (): Record<string, string> => {
    try {
      const raw = localStorage.getItem(`derivative-relations-v2:${wb.id}`);
      if (raw) return JSON.parse(raw);
    } catch {}
    return {};
  };

  const extractPairs = () => {
    if (!dayGroups) return;
    const result: WordPair[] = [];
    const relations = getDerivativeRelations();

    const filtered = dayGroups.filter((_, i) => i + 1 >= startDay && i + 1 <= endDay);

    for (const dg of filtered) {
      let currentHeadword: VocabularyWord | null = null;

      for (const w of dg.words) {
        if (w.wordType === '표제어') {
          currentHeadword = w;
        } else if (currentHeadword) {
          const relationKey = `${currentHeadword.word}::${w.word}`;
          const analyzedRelation = relations[relationKey];

          // Include if AI labeled as 동의 or 반의, or if 어원으로 줄줄이
          const isEtymology = w.wordType === '어원으로 줄줄이';
          const isSynLabel = analyzedRelation === '동의';
          const isAntLabel = analyzedRelation === '반의';

          if (isSynLabel || isAntLabel || isEtymology) {
            const relation = isAntLabel ? '반의어' : '동의어';
            result.push({
              day: dg.day,
              headword: currentHeadword.word,
              headwordMeaning: currentHeadword.meaning,
              relatedWord: w.word,
              relatedMeaning: w.meaning,
              relation,
            });
          }
        }
      }
    }

    setPairs(result);
    if (result.length === 0) toast.info('해당 범위에 동의어/반의어가 없습니다.');
  };

  const displayPairs = filter === 'all' ? pairs : pairs.filter(p => p.relation === filter);

  // Group by day for display
  const groupedByDay: Record<string, WordPair[]> = {};
  for (const p of displayPairs) {
    if (!groupedByDay[p.day]) groupedByDay[p.day] = [];
    groupedByDay[p.day].push(p);
  }

  const handlePrint = () => {
    document.body.classList.add('synant-printing');
    const cleanup = () => {
      document.body.classList.remove('synant-printing');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    setTimeout(() => window.print(), 50);
  };

  const handleAIVerify = async () => {
    if (pairs.length === 0) return;
    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-synonym-pairs', {
        body: { pairs },
      });

      if (error) throw error;

      const results = data?.results as { index: number; valid: boolean; reason?: string }[];
      if (!results || results.length === 0) {
        toast.info('검증 결과가 없습니다.');
        return;
      }

      const invalidIndices = new Set(
        results.filter(r => !r.valid).map(r => r.index)
      );

      if (invalidIndices.size === 0) {
        toast.success('모든 쌍이 유효합니다!');
        return;
      }

      const invalidReasons = results
        .filter(r => !r.valid)
        .map(r => `${pairs[r.index]?.headword}-${pairs[r.index]?.relatedWord}: ${r.reason}`)
        .join('\n');

      const confirmed = window.confirm(
        `${invalidIndices.size}개의 부적절한 쌍이 발견되었습니다.\n\n${invalidReasons}\n\n제거하시겠습니까?`
      );

      if (confirmed) {
        const filtered = pairs.filter((_, i) => !invalidIndices.has(i));
        setPairs(filtered);
        toast.success(`${invalidIndices.size}개 쌍 제거됨`);
      }
    } catch (e: any) {
      console.error('AI verify error:', e);
      toast.error('AI 검증 실패: ' + (e.message || '알 수 없는 오류'));
    } finally {
      setIsVerifying(false);
    }
  };

  const maxDay = dayGroups?.length || 30;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Toolbar */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b print:hidden">
        <div className="container mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> 돌아가기
          </Button>

          <div className="h-5 w-px bg-border" />

          <span className="text-xs font-semibold text-foreground">{wb.name} 동의어/반의어</span>

          <div className="h-5 w-px bg-border" />

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground">DAY</span>
            <input type="number" min={1} max={maxDay} value={startDay}
              onChange={e => setStartDay(Number(e.target.value))}
              className="w-12 h-7 rounded border bg-background px-1.5 text-center text-xs" />
            <span className="text-muted-foreground">~</span>
            <input type="number" min={1} max={maxDay} value={endDay}
              onChange={e => setEndDay(Number(e.target.value))}
              className="w-12 h-7 rounded border bg-background px-1.5 text-center text-xs" />
          </div>

          <Button size="sm" onClick={extractPairs} className="text-xs h-7 px-3">추출</Button>

          <div className="h-5 w-px bg-border" />

          <div className="flex items-center gap-1">
            {(['all', '동의어', '반의어'] as const).map(f => (
              <button key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                  filter === f
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}>
                {f === 'all' ? '전체' : f}
              </button>
            ))}
          </div>

          {pairs.length > 0 && (
            <>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {displayPairs.length}개 쌍
                </span>
                <Button variant="outline" size="sm" onClick={handleAIVerify} disabled={isVerifying} className="text-xs h-7">
                  {isVerifying ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1" />}
                  AI 검증
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint} className="text-xs h-7">
                  <Printer className="w-3.5 h-3.5 mr-1" /> 인쇄
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div ref={printRef} className="flex flex-col items-center py-6 print:py-0 gap-6 print:gap-0">
        {pairs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-sm">DAY 범위를 설정하고 "추출" 버튼을 눌러주세요.</p>
          </div>
        ) : (
          (() => {
            // ===== 동적 페이지 패킹 (푸터 침범 방지) =====
            // 각 행의 실제 높이를 "단위(units)"로 계산:
            //   - 기본 행: 1.0 units
            //   - DAY 구분선 추가: +0.6 units
            //   - 표제어 의미 또는 관련어 의미가 길어 줄바꿈: +0.7 units
            // 컬럼당 사용 가능: 28 units (푸터 침범 방지 안전 마진 강화)
            const COLS = 2;
            const UNITS_PER_COL = 28;
            const HEAD_LIMIT = 20; // 이 길이 넘으면 줄바꿈 가능성

            const allItemsRaw = displayPairs.map((pair, i) => ({ ...pair, globalIndex: i + 1 }));

            const itemCost = (pair: typeof allItemsRaw[0], isFirstInCol: boolean, prevDay: string | null) => {
              let cost = 1.0;
              const isNewDay = prevDay !== pair.day;
              if (isNewDay || isFirstInCol) cost += 0.8; // DAY 구분선
              const headLen = (pair.headword + pair.headwordMeaning).length;
              const relLen = (pair.relatedWord + (pair.relatedMeaning || '')).length;
              if (headLen > HEAD_LIMIT || relLen > HEAD_LIMIT) cost += 0.8;
              if (headLen > HEAD_LIMIT * 1.6 || relLen > HEAD_LIMIT * 1.6) cost += 0.5; // 매우 김
              return cost;
            };

            // 페이지/컬럼 단위로 패킹
            type Item = typeof allItemsRaw[0];
            const pages: Item[][][] = []; // pages[pageIdx][colIdx] = items
            let curPage: Item[][] = [[]];
            let curCol = 0;
            let curUnits = 0;
            let prevDay: string | null = null;
            let isFirstInCol = true;

            for (const item of allItemsRaw) {
              const cost = itemCost(item, isFirstInCol, prevDay);
              if (curUnits + cost > UNITS_PER_COL) {
                // 다음 컬럼/페이지로
                if (curCol < COLS - 1) {
                  curCol++;
                  curPage.push([]);
                } else {
                  pages.push(curPage);
                  curPage = [[]];
                  curCol = 0;
                }
                curUnits = 0;
                isFirstInCol = true;
                prevDay = null;
              }
              curPage[curCol].push(item);
              curUnits += itemCost(item, isFirstInCol, prevDay);
              prevDay = item.day;
              isFirstInCol = false;
            }
            if (curPage.some(c => c.length > 0)) pages.push(curPage);

            const totalPages = pages.length;

            return pages.map((columns, pageIdx) => {
              return (
                <div key={pageIdx} className="syn-ant-page bg-white border-2 border-black relative flex flex-col print:border-[1.5px]"
                  style={{ width: '200mm', height: '287mm', margin: '5mm', padding: '4mm', boxSizing: 'border-box', pageBreakAfter: 'always', overflow: 'hidden' }}>
                  
                  {/* Header */}
                  <div className="flex items-center justify-between mb-2 pb-2 shrink-0" style={{ borderBottom: '2px solid #1a1a1a' }}>
                    <div className="flex items-center gap-2 w-1/3">
                      <span className="text-[14px] font-bold tracking-wide" style={{ fontFamily: '"Orbitron", serif' }}>
                        ORUN ENGLISH
                      </span>
                    </div>
                    <h2 className="text-[15px] font-bold text-center w-1/3">
                      {wb.name} 동의어 / 반의어
                    </h2>
                    <span className="text-[11px] text-gray-500 text-right w-1/3">
                      DAY {startDay}~{endDay}{totalPages > 1 && ` · ${pageIdx + 1}/${totalPages}`}
                    </span>
                  </div>

                  {/* 2-column layout - flex-1 fills remaining height */}
                  <div className="grid grid-cols-2 gap-0 flex-1 min-h-0">
                    {columns.map((col, colIdx) => (
                      <div key={colIdx} className={colIdx === 0 ? 'border-r border-gray-300 pr-3' : 'pl-3'}>
                        {/* Column header */}
                        <div className="grid grid-cols-[22px_1fr_30px_1fr] gap-0 pb-1 mb-1" style={{ borderBottom: '1.5px solid #1a1a1a' }}>
                          <span className="font-bold text-gray-500 text-center" style={{ fontSize: '9px' }}>#</span>
                          <span className="font-bold text-gray-700" style={{ fontSize: '9px' }}>표제어</span>
                          <span className="font-bold text-gray-500 text-center" style={{ fontSize: '9px' }}>관계</span>
                          <span className="font-bold text-gray-700" style={{ fontSize: '9px' }}>관련어</span>
                        </div>
                        {col.map((pair, idxInCol) => {
                          const prevItem = idxInCol > 0 ? col[idxInCol - 1] : null;
                          const isNewDay = !prevItem || prevItem.day !== pair.day;
                          const isColFirst = idxInCol === 0;
                          const showDay = isNewDay || isColFirst;

                          return (
                            <div key={pair.globalIndex}>
                              {showDay && (
                                <div className="py-[2px] mt-1 mb-1 text-center rounded"
                                  style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(32 75% 45%))', color: 'white', fontSize: '9px', fontWeight: 700, letterSpacing: '0.05em' }}>
                                  {pair.day}
                                </div>
                              )}
                              <div className="grid grid-cols-[22px_1fr_30px_1fr] gap-0 items-baseline py-[2.5px]"
                                style={{ borderBottom: '0.5px solid #f0f0f0' }}>
                                <span className="text-gray-400 text-center" style={{ fontSize: '9px' }}>{pair.globalIndex}</span>
                                <span className="break-words leading-tight">
                                  <span className="font-semibold text-gray-900" style={{ fontSize: '10.5px' }}>{pair.headword}</span>
                                  <span className="text-gray-500 ml-1 leading-tight" style={{ fontSize: pair.headwordMeaning.length > 18 ? '7px' : '8.5px' }}>({pair.headwordMeaning})</span>
                                </span>
                                <span className="text-center">
                                  <span className={`font-bold ${pair.relation === '동의어' ? 'text-emerald-600' : 'text-rose-500'}`}
                                    style={{ fontSize: '12px' }}>
                                    {pair.relation === '동의어' ? '≈' : '↔'}
                                  </span>
                                </span>
                                <span className="break-words leading-tight">
                                  <span className="font-semibold text-gray-900" style={{ fontSize: '10.5px' }}>{pair.relatedWord}</span>
                                  {pair.relatedMeaning && (
                                    <span className="text-gray-500 ml-1 leading-tight" style={{ fontSize: pair.relatedMeaning.length > 18 ? '7px' : '8.5px' }}>({pair.relatedMeaning})</span>
                                  )}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-2 pt-1.5 shrink-0" style={{ borderTop: '1px solid #1a1a1a', fontSize: '9px' }}>
                    <span className="text-gray-600">
                      <span className="text-emerald-600 font-semibold">≈ 동의어 {displayPairs.filter(p => p.relation === '동의어').length}</span>
                      <span className="mx-2 text-gray-300">·</span>
                      <span className="text-rose-500 font-semibold">↔ 반의어 {displayPairs.filter(p => p.relation === '반의어').length}</span>
                      <span className="mx-2 text-gray-300">·</span>
                      <span>총 {displayPairs.length}개 쌍</span>
                    </span>
                    <span className="text-gray-500 font-bold" style={{ fontFamily: '"Orbitron", serif', letterSpacing: '0.1em', fontSize: '9px' }}>
                      ORUN ENGLISH
                    </span>
                  </div>
                </div>
              );
            });
          })()
        )}
      </div>
    </div>
  );
};

export default SynonymAntonymList;
