import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Shield, Tag, Loader2, Play, Square, BarChart3, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { parseQuestions } from '@/lib/parseQuestions';
import { parseAnswers } from '@/lib/parseAnswers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import sentencesData from '@/data/sentences.txt?raw';
import answersData from '@/data/answers.txt?raw';
import sentencesG12Data from '@/data/sentences-g12.txt?raw';
import answersG12Data from '@/data/answers-g12.txt?raw';

const GRAMMAR_CATEGORIES = [
  // 절 구조
  '관계대명사절', '관계부사절', '명사절 (that/whether/의문사)', '부사절',
  // 준동사 구문
  '분사구문', '분사 (현재/과거)', '동명사 구문', 'to부정사 (명사적)', 'to부정사 (형용사적/부사적)',
  // 특수 구문
  '가정법 (과거/과거완료)', '도치 구문', '강조 구문 (It is~that / do)', '삽입/동격 구문',
  '비교 구문 (비교급/최상급/원급)', '부정 구문 (부정어/이중부정)',
  // 동사 관련
  '시제/시상', '수동태/능동태', '주어-동사 수일치', '사역/지각동사',
  // 접속/연결
  '등위접속사/상관접속사', '종속접속사', '병렬구조',
  // 품사/수식
  '대명사/지시어', '관사/한정사', '전치사 (구)', '형용사/부사 구별',
  '복합관계사 (whoever/whatever 등)',
  // 기타
  '어순/문장구조', '기타',
];

const CATEGORY_COLORS: Record<string, string> = {
  // 절 구조 - warm tones
  '관계대명사절': 'bg-rose-100 text-rose-700 border-rose-200',
  '관계부사절': 'bg-red-100 text-red-700 border-red-200',
  '명사절 (that/whether/의문사)': 'bg-orange-100 text-orange-700 border-orange-200',
  '부사절': 'bg-amber-100 text-amber-700 border-amber-200',
  // 준동사 구문 - green tones
  '분사구문': 'bg-lime-100 text-lime-700 border-lime-200',
  '분사 (현재/과거)': 'bg-green-100 text-green-700 border-green-200',
  '동명사 구문': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'to부정사 (명사적)': 'bg-teal-100 text-teal-700 border-teal-200',
  'to부정사 (형용사적/부사적)': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  // 특수 구문 - blue tones
  '가정법 (과거/과거완료)': 'bg-sky-100 text-sky-700 border-sky-200',
  '도치 구문': 'bg-blue-100 text-blue-700 border-blue-200',
  '강조 구문 (It is~that / do)': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  '삽입/동격 구문': 'bg-violet-100 text-violet-700 border-violet-200',
  '비교 구문 (비교급/최상급/원급)': 'bg-purple-100 text-purple-700 border-purple-200',
  '부정 구문 (부정어/이중부정)': 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
  // 동사 관련 - pink tones
  '시제/시상': 'bg-pink-100 text-pink-700 border-pink-200',
  '수동태/능동태': 'bg-rose-100 text-rose-600 border-rose-200',
  '주어-동사 수일치': 'bg-red-50 text-red-600 border-red-200',
  '사역/지각동사': 'bg-orange-50 text-orange-600 border-orange-200',
  // 접속/연결 - yellow tones
  '등위접속사/상관접속사': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  '종속접속사': 'bg-amber-50 text-amber-600 border-amber-200',
  '병렬구조': 'bg-lime-50 text-lime-600 border-lime-200',
  // 품사/수식 - neutral tones
  '대명사/지시어': 'bg-stone-100 text-stone-700 border-stone-200',
  '관사/한정사': 'bg-zinc-100 text-zinc-700 border-zinc-200',
  '전치사 (구)': 'bg-slate-100 text-slate-700 border-slate-200',
  '형용사/부사 구별': 'bg-neutral-100 text-neutral-700 border-neutral-200',
  '복합관계사 (whoever/whatever 등)': 'bg-sky-50 text-sky-600 border-sky-200',
  // 기타
  '어순/문장구조': 'bg-gray-100 text-gray-600 border-gray-200',
  '기타': 'bg-gray-100 text-gray-700 border-gray-200',
};

type WorkbookOption = 'syntax10000' | 'syntax2320';

const GrammarClassification = () => {
  const { isAdmin, accessCode } = useAuth();
  const [workbookId, setWorkbookId] = useState<WorkbookOption>('syntax10000');
  const [categories, setCategories] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [batchRunning, setBatchRunning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const abortRef = useRef(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Parse questions/answers based on selected workbook (with duplicate removal)
  const allQuestions = useMemo(() => {
    const questions = parseQuestions(workbookId === 'syntax10000' ? sentencesData : sentencesG12Data);
    
    // Remove duplicates using 9-word n-gram matching
    const MIN_WORDS = 9;
    const ngramMap = new Map<string, Set<number>>();
    for (const q of questions) {
      const words = q.sentence.toLowerCase().trim().replace(/\s+/g, ' ').split(' ');
      for (let i = 0; i <= words.length - MIN_WORDS; i++) {
        const ngram = words.slice(i, i + MIN_WORDS).join(' ');
        const set = ngramMap.get(ngram) || new Set();
        set.add(q.id);
        ngramMap.set(ngram, set);
      }
    }
    
    // Merge overlapping duplicate groups and find IDs to remove
    const idToGroup = new Map<number, Set<number>>();
    for (const [, idSet] of ngramMap) {
      if (idSet.size <= 1) continue;
      let merged = new Set(idSet);
      for (const id of idSet) {
        if (idToGroup.has(id)) {
          for (const eid of idToGroup.get(id)!) merged.add(eid);
        }
      }
      for (const id of merged) idToGroup.set(id, merged);
    }
    
    const removeSet = new Set<number>();
    const processed = new Set<number>();
    for (const [id, group] of idToGroup) {
      if (processed.has(id)) continue;
      const sorted = Array.from(group).sort((a, b) => a - b);
      for (let i = 1; i < sorted.length; i++) removeSet.add(sorted[i]);
      for (const gid of group) processed.add(gid);
    }
    
    return questions.filter(q => !removeSet.has(q.id));
  }, [workbookId]);

  const allAnswers = useMemo(() => {
    return parseAnswers(workbookId === 'syntax10000' ? answersData : answersG12Data);
  }, [workbookId]);

  // Load categories
  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase.functions.invoke('classify-grammar', {
        body: { action: 'getAll', workbookId }
      });
      if (data?.categories) setCategories(data.categories);
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setIsLoading(false);
    }
  }, [workbookId]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Stats
  const stats = useMemo(() => {
    const total = allQuestions.length;
    const classified = Object.keys(categories).filter(k => 
      allQuestions.some(q => q.id === parseInt(k))
    ).length;
    const catCounts: Record<string, number> = {};
    Object.entries(categories).forEach(([k, cat]) => {
      if (allQuestions.some(q => q.id === parseInt(k))) {
        catCounts[cat] = (catCounts[cat] || 0) + 1;
      }
    });
    return { total, classified, catCounts };
  }, [allQuestions, categories]);

  // Batch classify all unclassified questions
  const handleBatchClassifyAll = useCallback(async () => {
    if (batchRunning) return;
    setBatchRunning(true);
    abortRef.current = false;

    const toClassify = allQuestions.filter(q => !categories[q.id]);
    setProgress({ current: 0, total: toClassify.length });

    const newCats: Record<number, string> = { ...categories };

    for (let i = 0; i < toClassify.length; i++) {
      if (abortRef.current) break;
      const q = toClassify[i];
      const answer = allAnswers.get(q.id) || '';

      try {
        const { data } = await supabase.functions.invoke('classify-grammar', {
          body: {
            action: 'classify', sentence: q.sentence, answer,
            questionId: q.id, workbookId, adminCode: accessCode
          }
        });
        if (data?.category) {
          newCats[q.id] = data.category;
          if ((i + 1) % 10 === 0) setCategories({ ...newCats });
        }
      } catch (err) {
        console.error(`Error classifying ${q.id}:`, err);
      }

      setProgress({ current: i + 1, total: toClassify.length });
      await new Promise(r => setTimeout(r, 300));
    }

    setCategories(newCats);
    setBatchRunning(false);
    abortRef.current = false;
    setProgress({ current: 0, total: 0 });
  }, [batchRunning, allQuestions, allAnswers, categories, workbookId, accessCode]);

  // Reclassify a single sentence
  const handleReclassify = useCallback(async (questionId: number) => {
    const q = allQuestions.find(q => q.id === questionId);
    if (!q) return;
    const answer = allAnswers.get(q.id) || '';
    try {
      const { data } = await supabase.functions.invoke('classify-grammar', {
        body: {
          action: 'classify', sentence: q.sentence, answer,
          questionId: q.id, workbookId, adminCode: accessCode
        }
      });
      if (data?.category) {
        setCategories(prev => ({ ...prev, [q.id]: data.category }));
      }
    } catch (err) {
      console.error('Error reclassifying:', err);
    }
  }, [allQuestions, allAnswers, workbookId, accessCode]);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    if (filterCategory === 'all') return allQuestions;
    if (filterCategory === 'unclassified') return allQuestions.filter(q => !categories[q.id]);
    return allQuestions.filter(q => categories[q.id] === filterCategory);
  }, [allQuestions, categories, filterCategory]);

  if (!isAdmin) return <Navigate to="/" replace />;

  const unclassifiedCount = allQuestions.filter(q => !categories[q.id]).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-sky-500" />
                <h1 className="text-lg font-bold text-foreground">문법 카테고리 분류</h1>
              </div>
              <Badge variant="outline" className="text-xs">
                <Shield className="w-3 h-3 mr-1" /> 관리자 전용
              </Badge>
            </div>
            <Select value={workbookId} onValueChange={(v) => setWorkbookId(v as WorkbookOption)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="syntax10000">ORUN WEEKLY (고3)</SelectItem>
                <SelectItem value="syntax2320">ORUN WEEKLY</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-2xl font-bold text-foreground">{stats.total.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">전체 문장</div>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-2xl font-bold text-sky-600">{stats.classified.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">분류 완료</div>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-2xl font-bold text-amber-600">{(stats.total - stats.classified).toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">미분류</div>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-2xl font-bold text-emerald-600">
              {stats.total > 0 ? Math.round((stats.classified / stats.total) * 100) : 0}%
            </div>
            <div className="text-xs text-muted-foreground">진행률</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-500 transition-all duration-500"
            style={{ width: `${stats.total > 0 ? (stats.classified / stats.total) * 100 : 0}%` }}
          />
        </div>

        {/* Batch Classification */}
        <div className="p-4 rounded-lg border bg-card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-500" />
              일괄 분류
            </h2>
            {batchRunning && (
              <div className="flex items-center gap-3">
                <div className="text-sm text-muted-foreground">
                  {progress.current} / {progress.total}
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => { abortRef.current = true; }}
                >
                  <Square className="w-3 h-3 mr-1" /> 중단
                </Button>
              </div>
            )}
          </div>

          {batchRunning && (
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 transition-all duration-300 animate-pulse"
                style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
              />
            </div>
          )}

          <Button
            onClick={handleBatchClassifyAll}
            disabled={batchRunning || unclassifiedCount === 0}
            className="w-full"
          >
            <Play className="w-4 h-4 mr-2" />
            {unclassifiedCount > 0
              ? `미분류 ${unclassifiedCount}문장 전체 분류 시작`
              : '모든 문장 분류 완료'}
          </Button>
        </div>

        {/* Category Distribution */}
        <div className="p-4 rounded-lg border bg-card space-y-3">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Tag className="w-4 h-4 text-sky-500" />
            카테고리 분포
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {GRAMMAR_CATEGORIES.map(cat => {
              const count = stats.catCounts[cat] || 0;
              const colorClass = CATEGORY_COLORS[cat] || 'bg-gray-100 text-gray-700 border-gray-200';
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(filterCategory === cat ? 'all' : cat)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full border transition-all ${
                    filterCategory === cat
                      ? colorClass + ' ring-2 ring-offset-1 ring-sky-400'
                      : count > 0 ? colorClass : 'bg-muted text-muted-foreground border-border opacity-50'
                  }`}
                >
                  {cat}
                  {count > 0 && <span className="font-bold">({count})</span>}
                </button>
              );
            })}
            <button
              onClick={() => setFilterCategory(filterCategory === 'unclassified' ? 'all' : 'unclassified')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full border transition-all ${
                filterCategory === 'unclassified'
                  ? 'bg-amber-100 text-amber-700 border-amber-300 ring-2 ring-offset-1 ring-sky-400'
                  : 'bg-amber-50 text-amber-600 border-amber-200'
              }`}
            >
              미분류 ({stats.total - stats.classified})
            </button>
          </div>
        </div>

        {/* Sentence List */}
        <div className="p-4 rounded-lg border bg-card space-y-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">
              문장 목록 ({filteredQuestions.length.toLocaleString()}문장)
              {filterCategory !== 'all' && (
                <span className="ml-2 text-sky-600">
                  — {filterCategory === 'unclassified' ? '미분류' : filterCategory}
                </span>
              )}
            </h2>
            {filterCategory !== 'all' && (
              <Button size="sm" variant="ghost" onClick={() => setFilterCategory('all')}>
                필터 해제
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-1 max-h-[60vh] overflow-y-auto">
              {filteredQuestions.slice(0, 200).map(q => {
                const cat = categories[q.id];
                const colorClass = cat ? (CATEGORY_COLORS[cat] || CATEGORY_COLORS['기타']) : '';
                return (
                  <div
                    key={q.id}
                    className="flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <span className="text-xs font-mono text-muted-foreground w-10 flex-shrink-0 pt-0.5 text-right">
                      {q.id}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-relaxed truncate">{q.sentence}</p>
                      {q.translation && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{q.translation}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {cat ? (
                        <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full border ${colorClass}`}>
                          {cat}
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">미분류</span>
                      )}
                      <button
                        onClick={() => handleReclassify(q.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted transition-all"
                        title="다시 분류"
                      >
                        <RefreshCw className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {filteredQuestions.length > 200 && (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  처음 200문장만 표시됩니다. 필터를 사용하여 원하는 카테고리를 선택하세요.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GrammarClassification;
