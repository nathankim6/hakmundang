import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loadWorkbook } from '@/utils/workbookStorage';
import { DayGroup, VocabularyWord } from '@/types/vocabulary';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { PosBadge } from '@/components/PosMeaning';

const SUNGNAM_WORKBOOK_ID = '2ba8fb56-c7b0-4fe5-af65-3f63dcf20a9a';
const DEFAULT_DAYS = [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];

type TestType = 'wordlist' | 'round1' | 'round2' | 'round3' | 'round4';

const TYPE_TITLE: Record<TestType, string> = {
  wordlist: '전체 단어 리스트',
  round1: '1회독 시험지 · 뜻쓰기',
  round2: '2회독 시험지 · 예문 빈칸 (첫 글자 제시)',
  round3: '3회독 시험지 · 영영풀이 → 단어쓰기',
  round4: '4회독 시험지 · 다의어 의미별 예문',
};

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** "[명] 속임수" → { tag: '명', text: '속임수' }. 태그 없으면 직전 태그를 이어받는다. */
function withPosTags(meanings: string[]): { tag: string | null; text: string }[] {
  let last: string | null = null;
  return meanings.map((m) => {
    const match = m.match(/^\[([^\]]{1,10})\]\s*/);
    if (match) last = match[1].trim();
    return { tag: match ? match[1].trim() : last, text: m.replace(/^\[[^\]]{1,10}\]\s*/, '').trim() };
  });
}

/** Split a meaning string into separate meaning items. Handles 콤마/세미콜론/슬래시. */
function splitMeanings(meaning: string): string[] {
  if (!meaning) return [];
  return meaning
    .replace(/^\([a-z.]+\)\s*/i, '')
    .split(/[,;]/)
    .map(s => s.trim())
    .filter(Boolean);
}

/** Blank the target word in a sentence with optional first-letter hint. */
function blankSentence(sentence: string, word: string, firstLetterHint: boolean): { before: string; hint: string; under: string; after: string; matched: string } {
  const wordLower = word.toLowerCase().trim();
  const variations = [
    wordLower, wordLower + 's', wordLower + 'es', wordLower + 'ed', wordLower + 'ing',
    wordLower + 'er', wordLower + 'est', wordLower + 'ly', wordLower + 'd',
    wordLower.replace(/e$/, 'ing'), wordLower.replace(/e$/, 'ed'),
    wordLower.replace(/y$/, 'ied'), wordLower.replace(/y$/, 'ies'),
  ];
  const tryMatch = (variants: string[]) => {
    for (const v of variants) {
      const re = new RegExp(`\\b${escapeRegex(v)}\\b`, 'i');
      const m = sentence.match(re);
      if (m && m.index !== undefined) return m;
    }
    return null;
  };
  if (wordLower.includes(' ')) {
    const re = new RegExp(`\\b${escapeRegex(wordLower)}\\b`, 'i');
    const m = sentence.match(re);
    if (m && m.index !== undefined) {
      const matched = m[0];
      return {
        before: sentence.substring(0, m.index),
        hint: firstLetterHint ? matched[0] : '',
        under: '_'.repeat(Math.max(matched.length - (firstLetterHint ? 1 : 0), 6)),
        after: sentence.substring(m.index + matched.length),
        matched,
      };
    }
  }
  const m = tryMatch(variations);
  if (m && m.index !== undefined) {
    const matched = m[0];
    return {
      before: sentence.substring(0, m.index),
      hint: firstLetterHint ? matched[0] : '',
      under: '_'.repeat(Math.max(matched.length - (firstLetterHint ? 1 : 0), 6)),
      after: sentence.substring(m.index + matched.length),
      matched,
    };
  }
  return { before: sentence, hint: '', under: '', after: '', matched: word };
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const headwordsOnly = (words: VocabularyWord[]) =>
  words.filter(w => !w.wordType || w.wordType === '표제어');

// Group flat items by their DAY, preserving order
function groupByDay<T extends { day: string }>(items: T[]): { day: string; items: T[] }[] {
  const out: { day: string; items: T[] }[] = [];
  for (const it of items) {
    if (!out.length || out[out.length - 1].day !== it.day) out.push({ day: it.day, items: [] });
    out[out.length - 1].items.push(it);
  }
  return out;
}

// ============ Component ============

const SungnamReviewTests = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const type = (searchParams.get('type') || 'wordlist') as TestType;
  const targetDays = useMemo(() => {
    const raw = searchParams.get('days');
    if (!raw) return DEFAULT_DAYS;
    const m = raw.match(/^(\d+)\s*-\s*(\d+)$/);
    if (m) {
      const a = parseInt(m[1], 10), b = parseInt(m[2], 10);
      const out: number[] = [];
      for (let i = Math.min(a, b); i <= Math.max(a, b); i++) out.push(i);
      return out;
    }
    const list = raw.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    return list.length ? list : DEFAULT_DAYS;
  }, [searchParams]);

  const rangeLabel = `DAY ${String(targetDays[0]).padStart(2, '0')}-${String(targetDays[targetDays.length - 1]).padStart(2, '0')}`;

  const [dayGroups, setDayGroups] = useState<DayGroup[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);

  // Cache for round4 AI-generated examples per word
  const [meaningExamples, setMeaningExamples] = useState<Record<string, { meaning: string; english: string; korean: string }[]>>({});
  const [aiLoading, setAiLoading] = useState(false);

  // Toggle body class so print @page rules apply
  useEffect(() => {
    document.body.classList.add('review-printing');
    return () => { document.body.classList.remove('review-printing'); };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const r = await loadWorkbook(SUNGNAM_WORKBOOK_ID);
        setDayGroups(r.dayGroups);
      } catch {
        toast.error('단어장을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Load cached meaning examples from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`sungnam-meaning-examples-v1`);
      if (raw) setMeaningExamples(JSON.parse(raw));
    } catch {}
    // Also load from DB so generated examples persist across devices
    (async () => {
      try {
        const { data, error } = await supabase
          .from('sungnam_meaning_examples')
          .select('word, examples');
        if (error) throw error;
        if (data && data.length > 0) {
          const map: Record<string, { meaning: string; english: string; korean: string }[]> = {};
          for (const row of data) {
            map[row.word] = row.examples as any;
          }
          setMeaningExamples(prev => {
            const merged = { ...prev, ...map };
            try { localStorage.setItem('sungnam-meaning-examples-v1', JSON.stringify(merged)); } catch {}
            return merged;
          });
        }
      } catch (e) {
        console.error('Failed to load meaning examples from DB', e);
      }
    })();
  }, []);

  const selectedDays = useMemo(() => {
    if (!dayGroups) return [];
    return targetDays
      .map(d => dayGroups.find(g => {
        const n = parseInt(String(g.day).replace(/\D/g, ''), 10);
        return n === d;
      }))
      .filter((g): g is DayGroup => !!g);
  }, [dayGroups, targetDays]);

  // All headwords across selected days, in order
  const allHeadwords = useMemo(() => {
    const out: { day: string; word: VocabularyWord }[] = [];
    for (const dg of selectedDays) {
      for (const w of headwordsOnly(dg.words)) {
        out.push({ day: dg.day, word: w });
      }
    }
    return out;
  }, [selectedDays]);

  // Polysemous headwords for round 4 (3+ meanings)
  const polysemousWords = useMemo(() => {
    return allHeadwords.filter(({ word }) => splitMeanings(word.meaning).length >= 3);
  }, [allHeadwords]);

  // Missing data in the selected range
  const missingExampleWords = useMemo(
    () => allHeadwords.filter(({ word }) => !word.examples || word.examples.length === 0),
    [allHeadwords]
  );
  const missingDefinitionWords = useMemo(
    () => allHeadwords.filter(({ word }) => !word.englishDefinition || !word.englishDefinition.trim()),
    [allHeadwords]
  );

  const [dataLoading, setDataLoading] = useState(false);
  const [dataProgress, setDataProgress] = useState<{ done: number; total: number } | null>(null);

  const reloadWorkbook = async () => {
    const r = await loadWorkbook(SUNGNAM_WORKBOOK_ID);
    setDayGroups(r.dayGroups);
  };

  // Generate missing example sentences (round 2) or english definitions (round 3)
  const generateMissingData = async (kind: 'examples' | 'definitions') => {
    const targets = kind === 'examples' ? missingExampleWords : missingDefinitionWords;
    if (targets.length === 0) {
      toast.success('이미 모든 단어에 데이터가 있습니다.');
      return;
    }
    setDataLoading(true);
    setDataProgress({ done: 0, total: targets.length });
    const BATCH = 10;
    let done = 0;
    let failed = 0;
    try {
      for (let i = 0; i < targets.length; i += BATCH) {
        const ids = targets.slice(i, i + BATCH).map(t => t.word.id);
        const fn = kind === 'examples' ? 'generate-missing-examples' : 'update-word-definitions';
        const { error } = await supabase.functions.invoke(fn, { body: { wordIds: ids } });
        if (error) failed += ids.length;
        done += ids.length;
        setDataProgress({ done, total: targets.length });
      }
      await reloadWorkbook();
      toast.success(`생성 완료 (${targets.length - failed}/${targets.length})`);
    } catch (e: any) {
      toast.error(`생성 실패: ${e?.message || ''}`);
    } finally {
      setDataLoading(false);
      setDataProgress(null);
    }
  };

  const generateAllMeaningExamples = async () => {
    const missing = polysemousWords.filter(({ word }) => !meaningExamples[word.word]);
    if (missing.length === 0) {
      toast.success('이미 모든 다의어 예문이 생성되어 있습니다.');
      return;
    }
    setAiLoading(true);
    try {
      // Batch in groups of 5
      const updated = { ...meaningExamples };
      for (let i = 0; i < missing.length; i += 5) {
        const batch = missing.slice(i, i + 5);
        const items = batch.map(({ word }) => ({
          word: word.word,
          meanings: splitMeanings(word.meaning),
        }));
        const { data, error } = await supabase.functions.invoke('generate-meaning-examples', {
          body: { items },
        });
        if (error) throw error;
        const results = data?.results || [];
        for (const r of results) {
          updated[r.word] = r.examples;
        }
        setMeaningExamples({ ...updated });
        localStorage.setItem('sungnam-meaning-examples-v1', JSON.stringify(updated));
        // Persist to DB so other devices/users see the same data
        if (results.length > 0) {
          const rows = results.map((r: any) => ({ word: r.word, examples: r.examples }));
          const { error: upsertError } = await supabase
            .from('sungnam_meaning_examples')
            .upsert(rows, { onConflict: 'word' });
          if (upsertError) console.error('DB save failed', upsertError);
        }
        toast.success(`진행: ${Math.min(i + 5, missing.length)}/${missing.length}`);
      }
      toast.success('완료!');
    } catch (e: any) {
      toast.error(`AI 예문 생성 실패: ${e?.message || ''}`);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Toolbar */}
      <div className="print:hidden sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> 뒤로
          </Button>
          <h1 className="text-sm font-bold" style={{ fontFamily: '"Noto Sans KR", sans-serif' }}>워드마스터 수능2000 · {TYPE_TITLE[type]} · {rangeLabel}</h1>
          <div className="ml-auto flex items-center gap-2 flex-wrap">
            {type !== 'wordlist' && (
              <Button size="sm" variant="outline" onClick={() => setShowAnswer(s => !s)}>
                {showAnswer ? '정답 숨기기' : '정답 보기'}
              </Button>
            )}
            {type === 'round4' && (
              <Button size="sm" variant="outline" onClick={generateAllMeaningExamples} disabled={aiLoading}>
                {aiLoading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1" />}
                AI 예문 생성 ({polysemousWords.filter(({ word }) => !meaningExamples[word.word]).length}개 남음)
              </Button>
            )}
            {(type === 'round2' || type === 'round3') && (
              <>
                <span className="text-xs text-muted-foreground">
                  {type === 'round2'
                    ? `예문 보유 ${allHeadwords.length - missingExampleWords.length} / ${allHeadwords.length}`
                    : `영영풀이 보유 ${allHeadwords.length - missingDefinitionWords.length} / ${allHeadwords.length}`}
                  {dataProgress ? ` · 생성 중 ${dataProgress.done}/${dataProgress.total}` : ''}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={dataLoading}
                  onClick={() => generateMissingData(type === 'round2' ? 'examples' : 'definitions')}
                >
                  {dataLoading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1" />}
                  누락 데이터 생성 ({type === 'round2' ? missingExampleWords.length : missingDefinitionWords.length}개)
                </Button>
              </>
            )}
            <Button size="sm" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-1" /> 인쇄
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {type === 'wordlist' && <WordlistView headwords={allHeadwords} rangeLabel={rangeLabel} />}
      {type === 'round1' && <Round1View headwords={allHeadwords} rangeLabel={rangeLabel} showAnswer={showAnswer} />}
      {type === 'round2' && <Round2View headwords={allHeadwords} rangeLabel={rangeLabel} showAnswer={showAnswer} />}
      {type === 'round3' && <Round3View headwords={allHeadwords} rangeLabel={rangeLabel} showAnswer={showAnswer} />}
      {type === 'round4' && (
        <Round4View
          polysemous={polysemousWords}
          meaningExamples={meaningExamples}
          rangeLabel={rangeLabel}
          showAnswer={showAnswer}
        />
      )}
    </div>
  );
};

// ============ Page Frame ============

const PageFrame = ({
  children, dayLabel, rangeLabel, title, subtitle, pageIdx, totalPages, isFirst,
}: {
  children: React.ReactNode;
  dayLabel: string;
  rangeLabel: string;
  title: string;
  subtitle: string;
  pageIdx: number;
  totalPages: number;
  isFirst: boolean;
}) => (
  <div
    className={`page-review-a4 mx-auto bg-white text-black shadow-lg my-6 print:my-0 print:shadow-none`}
    style={{ width: '210mm', height: '297mm', maxHeight: '297mm', padding: '5mm', boxSizing: 'border-box', overflow: 'hidden', pageBreakAfter: 'always' }}
  >
    <div className="review-print-safe-page border-2 border-black flex flex-col h-full overflow-hidden" style={{ height: '287mm', maxHeight: '287mm', boxSizing: 'border-box' }}>
      <div className="flex items-center justify-between px-4 py-2 border-b-2 border-black bg-gray-50 shrink-0">
        <span className="text-xs font-bold tracking-wide">ORUN ENGLISH</span>
        <div className="text-center flex-1">
          <h2 className="text-sm font-bold tracking-wider" style={{ fontFamily: '"Noto Sans KR", sans-serif' }}>워드마스터 수능2000 · {title}</h2>
          <p className="text-[9px] text-gray-600 mt-0.5">{subtitle}</p>
        </div>
        <span className="text-xs font-semibold">
          {dayLabel || rangeLabel}{totalPages > 1 ? ` (${pageIdx + 1}/${totalPages})` : ''}
        </span>
      </div>
      <div className="px-4 py-1 border-b border-black bg-gray-100 flex items-center justify-between text-[10px] shrink-0">
        <span>이름: ______________________</span>
        <span>날짜: ______ / ______</span>
      </div>
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">{children}</div>
    </div>
  </div>
);

// ============ Wordlist ============

const WORDLIST_PER_PAGE = 40;

const WordlistView = ({ headwords, rangeLabel }: { headwords: { day: string; word: VocabularyWord }[]; rangeLabel: string }) => {
  const days = groupByDay(headwords);
  return (
    <div>
      {days.map(({ day, items: dayItems }) => {
        const pages = chunk(dayItems, WORDLIST_PER_PAGE);
        return pages.map((items, pIdx) => {
        const left = items.slice(0, 20);
        const right = items.slice(20);
        return (
          <PageFrame
            key={`${day}-${pIdx}`}
            dayLabel={formatDayLabel(day)}
            rangeLabel={rangeLabel}
            title="전체 단어 리스트"
            subtitle={`${formatDayLabel(day)} 표제어`}
            pageIdx={pIdx}
            totalPages={pages.length}
            isFirst={pIdx === 0}
          >
            <div className="grid grid-cols-2 gap-0 flex-1">
              <WordlistColumn items={left} startNum={pIdx * WORDLIST_PER_PAGE + 1} bordered />
              <WordlistColumn items={right} startNum={pIdx * WORDLIST_PER_PAGE + 21} />
            </div>
          </PageFrame>
        );
        });
      })}
    </div>
  );
};

const WordlistColumn = ({ items, startNum, bordered }: { items: { day: string; word: VocabularyWord }[]; startNum: number; bordered?: boolean }) => (
  <div className={`px-3 py-2 ${bordered ? 'border-r border-black' : ''}`}>
    {items.map((it, i) => (
      <div key={it.word.id} className="py-1 border-b border-gray-200 last:border-b-0 flex items-baseline gap-2 text-[11px]">
        <span className="font-bold w-6 text-right text-gray-500">{startNum + i}</span>
        <span className="font-bold flex-shrink-0" style={{ minWidth: '90px' }}>{it.word.word}</span>
        <span className="flex-1 text-gray-800 break-words">{it.word.meaning}</span>
      </div>
    ))}
  </div>
);

// ============ Round 1: 뜻쓰기 ============

const ROUND1_PER_PAGE = 30;

const Round1View = ({ headwords, rangeLabel, showAnswer }: { headwords: { day: string; word: VocabularyWord }[]; rangeLabel: string; showAnswer: boolean }) => {
  const days = groupByDay(headwords);
  return (
    <div>
      {days.flatMap(({ day, items: dayItems }) => chunk(dayItems, ROUND1_PER_PAGE).map((items, pIdx, arr) => (
        <PageFrame
          key={`${day}-${pIdx}`}
          dayLabel={formatDayLabel(day)}
          rangeLabel={rangeLabel}
          title="1회독 시험지 · 뜻쓰기"
          subtitle="각 단어의 한국어 뜻을 빈칸 개수에 맞게 쓰시오."
          pageIdx={pIdx}
          totalPages={arr.length}
          isFirst={pIdx === 0}
        >
          <div
            className="px-4 py-2 flex-1 min-h-0 grid overflow-hidden"
            style={{ gridTemplateRows: `repeat(${items.length}, minmax(0, 1fr))` }}
          >
            {items.map((it, i) => {
              const meanings = withPosTags(splitMeanings(it.word.meaning));
              const num = pIdx * ROUND1_PER_PAGE + i + 1;
              return (
                <div key={it.word.id} className="flex items-center min-h-0 border-b border-gray-200 text-[11.5px] leading-none overflow-hidden">
                  <span className="font-bold w-7 text-gray-500">{num}.</span>
                  <span className="font-bold w-32 flex-shrink-0 break-words leading-tight">{it.word.word}</span>
                  <div className="flex-1 flex flex-wrap gap-x-2 gap-y-0.5 overflow-hidden">
                    {meanings.map((m, mi) => (
                      <span key={mi} className="inline-flex items-center">
                        {m.tag && <PosBadge tag={m.tag} size={8} />}
                        <span
                          className="inline-block"
                          style={{
                            borderBottom: '1px solid #555',
                            minWidth: '84px',
                            paddingBottom: '1px',
                            color: showAnswer ? '#c00' : 'transparent',
                            fontWeight: showAnswer ? 600 : 400,
                          }}
                        >
                          {showAnswer ? m.text : '\u00A0'}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </PageFrame>
      )))}
    </div>
  );
};

// ============ Round 2: 예문 빈칸 (첫 글자 제시) ============

const ROUND2_PER_PAGE = 20;

const Round2View = ({ headwords, rangeLabel, showAnswer }: { headwords: { day: string; word: VocabularyWord }[]; rangeLabel: string; showAnswer: boolean }) => {
  const filtered = headwords.filter(({ word }) => word.examples && word.examples.length > 0);
  const days = groupByDay(filtered);
  return (
    <div>
      {days.flatMap(({ day, items: dayItems }) => chunk(dayItems, ROUND2_PER_PAGE).map((pageItems, pIdx, arr) => {
        const left = pageItems.slice(0, 10);
        const right = pageItems.slice(10);
        return (
          <PageFrame
            key={`${day}-${pIdx}`}
            dayLabel={formatDayLabel(day)}
            rangeLabel={rangeLabel}
            title="2회독 시험지 · 예문 빈칸"
            subtitle="첫 글자가 주어진 빈칸에 알맞은 단어를 쓰시오."
            pageIdx={pIdx}
            totalPages={arr.length}
            isFirst={pIdx === 0}
          >
            <div className="grid grid-cols-2 gap-0 flex-1">
              <Round2Column items={left} startNum={pIdx * ROUND2_PER_PAGE + 1} showAnswer={showAnswer} bordered />
              <Round2Column items={right} startNum={pIdx * ROUND2_PER_PAGE + 11} showAnswer={showAnswer} />
            </div>
          </PageFrame>
        );
      }))}
    </div>
  );
};

const Round2Column = ({ items, startNum, showAnswer, bordered }: { items: { day: string; word: VocabularyWord }[]; startNum: number; showAnswer: boolean; bordered?: boolean }) => (
  <div className={`px-3 py-2 flex flex-col ${bordered ? 'border-r border-black' : ''}`}>
    {items.map((it, i) => {
      const num = startNum + i;
      const ex = it.word.examples![0];
      const b = blankSentence(ex.english, it.word.word, true);
      return (
        <div key={it.word.id} className="py-2 border-b border-gray-200 last:border-b-0 flex-1">
          <div className="text-[11.5px] leading-snug">
            <span className="font-bold mr-1 text-gray-600">{String(num).padStart(2, '0')}.</span>
            <span className="break-words">
              {b.before}
              <span
                className="inline-flex items-baseline"
                style={{ borderBottom: '1px solid #000', minWidth: '60px', paddingBottom: '0px' }}
              >
                {showAnswer ? (
                  <span className="text-red-600 font-bold px-1">{b.matched}</span>
                ) : (
                  <>
                    <span className="font-bold text-black">{b.hint}</span>
                    <span style={{ color: 'transparent' }}>{b.under}</span>
                  </>
                )}
              </span>
              {b.after}
            </span>
          </div>
        </div>
      );
    })}
    {Array.from({ length: Math.max(0, 10 - items.length) }).map((_, i) => (
      <div key={`e-${i}`} className="flex-1" />
    ))}
  </div>
);

// ============ Round 3: 영영풀이 → 단어쓰기 ============

const ROUND3_PER_PAGE = 24;

const Round3View = ({ headwords, rangeLabel, showAnswer }: { headwords: { day: string; word: VocabularyWord }[]; rangeLabel: string; showAnswer: boolean }) => {
  const items = headwords.filter(({ word }) => word.englishDefinition && word.englishDefinition.trim().length > 0);
  const days = groupByDay(items);

  if (items.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        영영풀이(english definition) 데이터가 없습니다. 단어 정리에서 정의 생성을 먼저 실행해주세요.
      </div>
    );
  }

  return (
    <div>
      {days.flatMap(({ day, items: dayItems }) => chunk(dayItems, ROUND3_PER_PAGE).map((pageItems, pIdx, arr) => (
        <PageFrame
          key={`${day}-${pIdx}`}
          dayLabel={formatDayLabel(day)}
          rangeLabel={rangeLabel}
          title="3회독 시험지 · 영영풀이 → 단어"
          subtitle="영영풀이를 읽고 알맞은 단어를 쓰시오."
          pageIdx={pIdx}
          totalPages={arr.length}
          isFirst={pIdx === 0}
        >
          <div className="px-4 py-2 flex-1">
            {pageItems.map((it, i) => {
              const num = pIdx * ROUND3_PER_PAGE + i + 1;
              return (
                <div key={it.word.id} className="flex items-start py-2 border-b border-gray-200 text-[11.5px] leading-snug">
                  <span className="font-bold w-7 text-gray-500">{num}.</span>
                  <span className="flex-1 break-words pr-3">{it.word.englishDefinition}</span>
                  <span
                    className="inline-block text-center"
                    style={{
                      borderBottom: '1px solid #000',
                      minWidth: '120px',
                      color: showAnswer ? '#c00' : 'transparent',
                      fontWeight: 700,
                    }}
                  >
                    {showAnswer ? it.word.word : '\u00A0'}
                  </span>
                </div>
              );
            })}
          </div>
        </PageFrame>
      )))}
    </div>
  );
};

const formatDayLabel = (day: string) => {
  const n = parseInt(day.replace(/\D/g, ''), 10);
  return isNaN(n) ? day : `DAY ${String(n).padStart(2, '0')}`;
};

// ============ Round 4: 다의어 의미별 예문 ============

const Round4View = ({
  polysemous, meaningExamples, rangeLabel, showAnswer,
}: {
  polysemous: { day: string; word: VocabularyWord }[];
  meaningExamples: Record<string, { meaning: string; english: string; korean: string }[]>;
  rangeLabel: string;
  showAnswer: boolean;
}) => {
  // Build flat list of (word, meaning, example) rows
  type Row = { wordObj: VocabularyWord; day: string; meaning: string; english: string; korean: string; isFirst: boolean; meaningIdx: number; totalForWord: number };
  const rows: Row[] = [];
  for (const { day, word } of polysemous) {
    const exs = meaningExamples[word.word];
    if (!exs || exs.length === 0) continue;
    exs.forEach((ex, idx) => {
      rows.push({
        wordObj: word,
        day: word.day || day,
        meaning: ex.meaning,
        english: ex.english,
        korean: ex.korean,
        isFirst: idx === 0,
        meaningIdx: idx,
        totalForWord: exs.length,
      });
    });
  }

  if (polysemous.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        다의어(뜻 3개 이상) 표제어가 없습니다.
      </div>
    );
  }
  if (rows.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        상단의 <b>"AI 예문 생성"</b> 버튼을 눌러 다의어 {polysemous.length}개의 의미별 예문을 먼저 생성해주세요.
      </div>
    );
  }

  // Group rows by word for visual grouping; paginate exactly 8 words per page
  type Group = { word: VocabularyWord; rows: Row[]; day: string };
  const groups: Group[] = [];
  for (const r of rows) {
    if (groups.length === 0 || groups[groups.length - 1].word.id !== r.wordObj.id) {
      groups.push({ word: r.wordObj, rows: [], day: r.day });
    }
    groups[groups.length - 1].rows.push(r);
  }

  const WORDS_PER_PAGE = 8;
  const dayBuckets = groupByDay(groups);
  const CIRCLED = ['①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩'];

  // Underline the target word in the example (do NOT blank it)
  const underlineWord = (sentence: string, word: string) => {
    const b = blankSentence(sentence, word, false);
    if (!b.matched || b.before === sentence) {
      return <span>{sentence}</span>;
    }
    return (
      <span>
        {b.before}
        <u className="font-semibold">{b.matched}</u>
        {b.after}
      </span>
    );
  };

  return (
    <div>
      {dayBuckets.flatMap(({ day, items: dayGroups }) => chunk(dayGroups, WORDS_PER_PAGE).map((pageGroups, pIdx, arr) => (
        <PageFrame
          key={`${day}-${pIdx}`}
          dayLabel={formatDayLabel(day)}
          rangeLabel={rangeLabel}
          title="4회독 시험지 · 다의어 의미별 예문"
          subtitle="다의어의 각 의미별 예문을 학습하시오. 밑줄 친 단어의 의미를 확인할 것."
          pageIdx={pIdx}
          totalPages={arr.length}
          isFirst={pIdx === 0}
        >
          <div
            className="flex-1 min-h-0 px-3 overflow-hidden"
            style={{ display: 'grid', gridTemplateRows: pageGroups.map(g => `${g.rows.length}fr`).join(' '), gap: '1.5mm' }}
          >
            {pageGroups.map((g, gi) => (
              <div
                key={g.word.id}
                className="min-h-0 overflow-hidden flex flex-col"
                style={{ pageBreakInside: 'avoid' }}
              >
                <div className="flex items-center gap-3 pb-1 border-b border-black shrink-0">
                  {g.day && (
                    <span className="inline-flex items-center justify-center text-[9px] font-bold text-gray-700 border border-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-sm">
                      {formatDayLabel(g.day)}
                    </span>
                  )}
                  <span className="font-bold text-gray-600 text-[11px]">{pIdx * WORDS_PER_PAGE + gi + 1}.</span>
                  <span className="font-bold text-[13px] tracking-wide">{g.word.word}</span>
                  <span className="text-[10px] text-gray-600 break-words">[{g.word.meaning}]</span>
                </div>
                <div
                  className="pl-4 flex-1 min-h-0 overflow-hidden"
                  style={{ display: 'grid', gridTemplateRows: `repeat(${g.rows.length}, 1fr)`, gap: '1mm' }}
                >
                  {g.rows.map((r, idx) => (
                    <div
                      key={r.meaningIdx}
                      className="flex items-start gap-1 min-h-0 text-[10px] leading-[1.45] overflow-hidden"
                    >
                      <span className="font-semibold text-gray-700 flex-shrink-0">{CIRCLED[idx] || `(${idx + 1})`}</span>
                      <span className="flex-1 min-w-0 break-words">
                        <span className="font-semibold text-gray-700">{r.meaning}:</span>{' '}
                        <span className="text-gray-900">{underlineWord(r.english, g.word.word)}</span>
                        {showAnswer && r.korean && (
                          <span className="text-[9px] text-gray-500 italic leading-[1.45]"> → {r.korean}</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </PageFrame>
      )))}
    </div>
  );
};

export default SungnamReviewTests;