import { useState, useEffect, useMemo, useCallback } from 'react';
import { parseQuestions } from '@/lib/parseQuestions';
import sentencesData from '@/data/sentences.txt?raw';
import sentencesG12Data from '@/data/sentences-g12.txt?raw';
import { NavigationBar } from '@/components/NavigationBar';
import { Copy, AlertTriangle, Search, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface DuplicateGroup {
  matchedPhrase: string;
  ids: number[];
  sentences: Map<number, string>;
}

const MIN_MATCHING_WORDS = 9;

type DataSource = 'syntax10000' | 'syntax2320';

function getNGrams(sentence: string, n: number): string[] {
  const words = sentence.toLowerCase().trim().replace(/\s+/g, ' ').split(' ');
  if (words.length < n) return [];
  const ngrams: string[] = [];
  for (let i = 0; i <= words.length - n; i++) {
    ngrams.push(words.slice(i, i + n).join(' '));
  }
  return ngrams;
}

function findDuplicateGroups(rawData: string): { duplicates: DuplicateGroup[]; allQuestions: { id: number; sentence: string; translation: string }[] } {
  const questions = parseQuestions(rawData);
  const ngramMap = new Map<string, Set<number>>();
  const sentenceById = new Map<number, string>();

  for (const q of questions) {
    sentenceById.set(q.id, q.sentence);
    const ngrams = getNGrams(q.sentence, MIN_MATCHING_WORDS);
    for (const ngram of ngrams) {
      const existing = ngramMap.get(ngram) || new Set();
      existing.add(q.id);
      ngramMap.set(ngram, existing);
    }
  }

  const duplicateNgrams: DuplicateGroup[] = [];
  const processedPairs = new Set<string>();

  for (const [ngram, idSet] of ngramMap.entries()) {
    if (idSet.size > 1) {
      const ids = Array.from(idSet).sort((a, b) => a - b);
      const pairKey = ids.join('-');
      if (processedPairs.has(pairKey)) continue;
      processedPairs.add(pairKey);
      const sentences = new Map<number, string>();
      for (const id of ids) {
        sentences.set(id, sentenceById.get(id) || '');
      }
      duplicateNgrams.push({ matchedPhrase: ngram, ids, sentences });
    }
  }

  duplicateNgrams.sort((a, b) => a.ids[0] - b.ids[0]);
  return { duplicates: duplicateNgrams, allQuestions: questions };
}

export default function DuplicateAnalysis() {
  const [dataSource, setDataSource] = useState<DataSource>('syntax10000');
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [allQuestions, setAllQuestions] = useState<{ id: number; sentence: string; translation: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [rangeStart, setRangeStart] = useState<number>(1);
  const [rangeEnd, setRangeEnd] = useState<number>(10000);

  useEffect(() => {
    setIsLoading(true);
    const rawData = dataSource === 'syntax10000' ? sentencesData : sentencesG12Data;
    
    const { duplicates: dups, allQuestions: qs } = findDuplicateGroups(rawData);
    setDuplicates(dups);
    setAllQuestions(qs);
    setRangeStart(1);
    setRangeEnd(dataSource === 'syntax10000' ? 10000 : qs.length);
    setIsLoading(false);
  }, [dataSource]);

  const maxId = dataSource === 'syntax10000' ? 10000 : allQuestions.length;

  const filteredDuplicates = useMemo(() => {
    let filtered = duplicates.filter(d =>
      d.ids.every(id => id >= rangeStart && id <= rangeEnd)
    );
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(d =>
        d.matchedPhrase.toLowerCase().includes(term) ||
        d.ids.some(id => id.toString().includes(term))
      );
    }
    return filtered;
  }, [duplicates, searchTerm, rangeStart, rangeEnd]);

  const handleCopyAll = () => {
    const text = filteredDuplicates.map(d =>
      `문장 번호 ${d.ids.join(', ')}: "${d.matchedPhrase}"`
    ).join('\n\n');
    navigator.clipboard.writeText(text);
    toast.success('클립보드에 복사되었습니다.');
  };

  // Build a set of IDs to remove (keep first in each duplicate group, remove rest)
  const idsToRemove = useMemo(() => {
    const removeSet = new Set<number>();
    // Group sentences by their duplicate relationships
    // For overlapping groups, merge them
    const idToGroup = new Map<number, Set<number>>();
    
    for (const dup of duplicates) {
      let mergedGroup = new Set(dup.ids);
      for (const id of dup.ids) {
        if (idToGroup.has(id)) {
          for (const existingId of idToGroup.get(id)!) {
            mergedGroup.add(existingId);
          }
        }
      }
      for (const id of mergedGroup) {
        idToGroup.set(id, mergedGroup);
      }
    }

    const processed = new Set<number>();
    for (const [id, group] of idToGroup.entries()) {
      if (processed.has(id)) continue;
      const sorted = Array.from(group).sort((a, b) => a - b);
      // Keep first, remove rest
      for (let i = 1; i < sorted.length; i++) {
        removeSet.add(sorted[i]);
      }
      for (const gid of group) processed.add(gid);
    }
    return removeSet;
  }, [duplicates]);

  const handleDownloadCleaned = useCallback(() => {
    if (idsToRemove.size === 0) {
      toast.info('삭제할 중복 문장이 없습니다.');
      return;
    }

    // Filter out duplicates and renumber
    const kept = allQuestions.filter(q => !idsToRemove.has(q.id));
    
    // Rebuild the file in the original format: groups of 10 sentences then 10 translations
    let output = '\ufeff'; // BOM
    for (let i = 0; i < kept.length; i += 10) {
      const chunk = kept.slice(i, i + 10);
      // Sentences
      for (let j = 0; j < chunk.length; j++) {
        const newId = i + j + 1;
        output += `${newId})\n ${chunk[j].sentence} \n\n\n`;
      }
      output += '\n\n\n';
      // Translations
      for (let j = 0; j < chunk.length; j++) {
        const posInBlock = j + 1;
        output += `${posInBlock}. ${chunk[j].translation} \n`;
      }
      output += '\n';
    }

    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = dataSource === 'syntax10000' ? 'sentences-cleaned.txt' : 'sentences-g12-cleaned.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${idsToRemove.size}개 중복 문장 제거 후 파일을 다운로드했습니다. (${kept.length}개 문장 유지)`);
  }, [idsToRemove, allQuestions, dataSource]);

  const totalDuplicateSentences = duplicates.reduce((acc, d) => acc + d.ids.length, 0);
  const filteredDuplicateSentences = filteredDuplicates.reduce((acc, d) => acc + d.ids.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            중복 문장 분석
          </h1>
          <p className="text-muted-foreground">
            동일한 영어 문장이 여러 번호에서 발견된 경우를 표시합니다.
          </p>
        </header>

        {/* Data Source Selector */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setDataSource('syntax10000')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              dataSource === 'syntax10000'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Syntax 10000
          </button>
          <button
            onClick={() => setDataSource('syntax2320')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              dataSource === 'syntax2320'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Syntax Intermediate
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">분석 중...</span>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-card rounded-xl p-4 border shadow-sm">
                <div className="text-3xl font-bold text-primary">{filteredDuplicates.length}</div>
                <div className="text-sm text-muted-foreground">중복 그룹 수</div>
              </div>
              <div className="bg-card rounded-xl p-4 border shadow-sm">
                <div className="text-3xl font-bold text-destructive">{filteredDuplicateSentences}</div>
                <div className="text-sm text-muted-foreground">중복 문장 총 개수</div>
              </div>
              <div className="bg-card rounded-xl p-4 border shadow-sm">
                <div className="text-3xl font-bold text-destructive">{idsToRemove.size}</div>
                <div className="text-sm text-muted-foreground">삭제 대상 문장 수</div>
              </div>
              <div className="bg-card rounded-xl p-4 border shadow-sm">
                <div className="text-3xl font-bold text-accent-foreground">
                  {((filteredDuplicateSentences / (rangeEnd - rangeStart + 1)) * 100).toFixed(2)}%
                </div>
                <div className="text-sm text-muted-foreground">범위 내 중복 비율</div>
              </div>
              <div className="bg-card rounded-xl p-4 border shadow-sm">
                <div className="text-lg font-bold text-muted-foreground">
                  {rangeStart} ~ {rangeEnd}번
                </div>
                <div className="text-sm text-muted-foreground">분석 범위</div>
              </div>
            </div>

            {/* Range Filter */}
            <div className="flex flex-wrap gap-4 mb-4 p-4 bg-card rounded-xl border">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-muted-foreground">시작:</label>
                <input
                  type="number"
                  min={1}
                  max={maxId}
                  value={rangeStart}
                  onChange={(e) => setRangeStart(Math.max(1, Math.min(maxId, parseInt(e.target.value) || 1)))}
                  className="w-24 px-3 py-1.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-muted-foreground">끝:</label>
                <input
                  type="number"
                  min={1}
                  max={maxId}
                  value={rangeEnd}
                  onChange={(e) => setRangeEnd(Math.max(1, Math.min(maxId, parseInt(e.target.value) || maxId)))}
                  className="w-24 px-3 py-1.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="flex gap-2">
                {dataSource === 'syntax10000' ? (
                  <>
                    <button onClick={() => { setRangeStart(1); setRangeEnd(600); }} className="px-3 py-1.5 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">1~600</button>
                    <button onClick={() => { setRangeStart(1); setRangeEnd(1000); }} className="px-3 py-1.5 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">1~1000</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setRangeStart(1); setRangeEnd(100); }} className="px-3 py-1.5 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">1~100</button>
                    <button onClick={() => { setRangeStart(1); setRangeEnd(500); }} className="px-3 py-1.5 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">1~500</button>
                    <button onClick={() => { setRangeStart(1); setRangeEnd(1000); }} className="px-3 py-1.5 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">1~1000</button>
                  </>
                )}
                <button onClick={() => { setRangeStart(1); setRangeEnd(maxId); }} className="px-3 py-1.5 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">전체</button>
              </div>
            </div>

            {/* Search and Actions */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="문장 또는 번호로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <button
                onClick={handleCopyAll}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                <Copy className="w-4 h-4" />
                전체 복사
              </button>
              {idsToRemove.size > 0 && (
                <button
                  onClick={handleDownloadCleaned}
                  className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Download className="w-4 h-4" />
                  중복 제거 파일 다운로드 ({allQuestions.length - idsToRemove.size}문장)
                </button>
              )}
            </div>

            {/* Results */}
            {duplicates.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>중복 문장이 발견되지 않았습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDuplicates.map((dup, index) => (
                  <div
                    key={index}
                    className="bg-card rounded-xl border p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 bg-destructive/10 text-destructive px-2 py-1 rounded text-xs font-medium">
                        {dup.ids.length}회 중복
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {dup.ids.map((id, idx) => (
                            <span
                              key={id}
                              className={`inline-flex items-center px-2 py-0.5 rounded text-sm font-medium ${
                                idx === 0
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-destructive/10 text-destructive line-through'
                              }`}
                            >
                              #{id} {idx === 0 ? '(유지)' : '(삭제)'}
                            </span>
                          ))}
                        </div>
                        <div className="mb-2 p-2 bg-accent/30 rounded text-xs">
                          <span className="font-semibold text-accent-foreground">일치 구간 ({MIN_MATCHING_WORDS}단어):</span>{' '}
                          <span className="text-foreground">"{dup.matchedPhrase}"</span>
                        </div>
                        <div className="space-y-1">
                          {dup.ids.map((id, idx) => (
                            <p key={id} className={`text-sm leading-relaxed ${idx > 0 ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                              <span className="font-medium">#{id}:</span>{' '}
                              {dup.sentences.get(id)}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredDuplicates.length === 0 && searchTerm && (
                  <div className="text-center py-10 text-muted-foreground">
                    검색 결과가 없습니다.
                  </div>
                )}
              </div>
            )}

            {/* Summary */}
            <div className="mt-8 p-4 bg-muted/50 rounded-xl text-center text-sm text-muted-foreground">
              총 {duplicates.length}개의 중복 그룹에서 {totalDuplicateSentences}개의 문장이 중복되었습니다.
              {idsToRemove.size > 0 && (
                <>
                  <br />
                  <span className="text-destructive font-medium">{idsToRemove.size}개 문장 삭제 → {allQuestions.length - idsToRemove.size}개 문장 유지</span>
                </>
              )}
              <br />
              <span className="text-xs">(9단어 이상 연속 일치 기준)</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
