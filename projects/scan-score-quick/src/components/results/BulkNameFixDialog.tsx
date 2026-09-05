import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Loader2, Search, Download, UserCog, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TestResult } from '@/types/results';
import { useResultsContext } from '@/contexts/ResultsContext';
import { downloadExcel } from '@/utils/resultsUtils';
import StudentSearchFilter from '@/components/results/StudentSearchFilter';
import { useVirtualizer } from '@tanstack/react-virtual';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onDeduplicateAll?: () => Promise<void> | void;
}

type TabKey = 'rename' | 'search';

// 올바른 이름 형식: 한글이름 + 숫자 4자리 (예: 김옳은5554)
const NAME_REGEX = /^[가-힣]{2,}\d{4}$/;

const splitName = (full: string): { cls: string; raw: string } => {
  const parts = (full || '').split(' ');
  if (parts.length > 1) return { cls: parts[0], raw: parts.slice(1).join(' ') };
  return { cls: '', raw: full || '' };
};

const isInvalid = (full: string): boolean => {
  const { raw } = splitName(full);
  return !NAME_REGEX.test(raw.trim());
};

interface NameFixRowProps {
  id: string;
  testTitle: string;
  createdAt: string;
  cls: string;
  raw: string;
  draft: string;
  onChange: (id: string, value: string) => void;
}

const DEBOUNCE_MS = 200;

const NameFixRow = React.memo(({ id, testTitle, createdAt, cls, raw, draft, onChange }: NameFixRowProps) => {
  // Local input state — updates immediately on each keystroke (no parent re-render).
  const [local, setLocal] = useState(draft);
  const lastExternal = useRef(draft);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync from parent only when the external value actually changes (e.g. reset).
  useEffect(() => {
    if (draft !== lastExternal.current) {
      lastExternal.current = draft;
      setLocal(draft);
    }
  }, [draft]);

  // Cleanup pending debounce on unmount.
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const handle = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setLocal(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      lastExternal.current = v;
      onChange(id, v);
    }, DEBOUNCE_MS);
  }, [id, onChange]);

  // Validation/badge derive from local value so feedback stays instant on this row only.
  const trimmed = local.trim();
  const valid = NAME_REGEX.test(trimmed);
  const dirty = trimmed !== raw.trim();
  return (
    <div className="grid grid-cols-12 gap-3 items-center rounded-lg border border-slate-200 bg-white px-3 py-2.5 hover:border-slate-300 transition-colors">
      <div className="col-span-4 min-w-0">
        <div className="text-xs text-slate-400 truncate">{testTitle}</div>
        <div className="text-[11px] text-slate-400 truncate">
          {new Date(createdAt).toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="text-sm font-medium text-slate-700 truncate">
          {cls && <span className="text-xs text-slate-400 mr-1">[{cls}]</span>}
          <span className="line-through text-rose-500">{raw || '(없음)'}</span>
        </div>
      </div>
      <div className="col-span-6">
        <Input
          value={local}
          onChange={handle}
          placeholder="예: 김옳은5554"
          className={`h-9 text-sm ${
            dirty
              ? valid
                ? 'border-emerald-400 focus-visible:ring-emerald-400 bg-emerald-50/40'
                : 'border-rose-300 focus-visible:ring-rose-400 bg-rose-50/40'
              : ''
          }`}
        />
      </div>
      <div className="col-span-2 flex justify-end">
        {dirty ? (
          valid ? (
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              올바름
            </Badge>
          ) : (
            <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-0">
              형식 오류
            </Badge>
          )
        ) : (
          <span className="text-xs text-slate-400">미수정</span>
        )}
      </div>
    </div>
  );
});
NameFixRow.displayName = 'NameFixRow';

const BulkNameFixDialog = ({ open, onOpenChange, onDeduplicateAll }: Props) => {
  const { results, setResults, tests } = useResultsContext();
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<TabKey>('rename');
  const [dedupRunning, setDedupRunning] = useState(false);

  const invalidResults = useMemo(() => {
    return results
      .filter(r => isInvalid(r.student_name))
      .filter(r => {
        if (!search.trim()) return true;
        return (r.student_name || '').toLowerCase().includes(search.toLowerCase());
      })
      .sort((a, b) => (a.student_name || '').localeCompare(b.student_name || ''));
  }, [results, search]);

  const testTitleMap = useMemo(() => {
    const m = new Map<string, string>();
    tests.forEach(t => m.set(t.testId, t.title || t.testId));
    return m;
  }, [tests]);

  const handleChange = useCallback((id: string, value: string) => {
    setEdits(prev => ({ ...prev, [id]: value }));
  }, []);

  const previewFor = (r: TestResult): string => {
    const { cls } = splitName(r.student_name);
    const newRaw = (edits[r.id] ?? splitName(r.student_name).raw).trim();
    return cls ? `${cls} ${newRaw}` : newRaw;
  };

  const validRowCount = invalidResults.filter(r => {
    const v = (edits[r.id] ?? '').trim();
    return v && NAME_REGEX.test(v);
  }).length;

  const handleSaveAll = async () => {
    const toUpdate = invalidResults
      .map(r => {
        const v = (edits[r.id] ?? '').trim();
        if (!v || !NAME_REGEX.test(v)) return null;
        return { id: r.id, newFullName: previewFor(r) };
      })
      .filter((x): x is { id: string; newFullName: string } => !!x);

    if (toUpdate.length === 0) {
      toast({ title: '수정할 항목이 없습니다', description: '올바른 형식(한글이름+숫자4자리)으로 입력해주세요.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    let success = 0;
    let failed = 0;
    try {
      for (const u of toUpdate) {
        const { error } = await supabase
          .from('test_results')
          .update({ student_name: u.newFullName })
          .eq('id', u.id);
        if (error) {
          failed++;
          console.error('update failed', u, error);
        } else {
          success++;
          setResults(prev => prev.map(r => r.id === u.id ? { ...r, student_name: u.newFullName } : r));
        }
      }
      toast({
        title: '일괄 수정 완료',
        description: `${success}건 수정${failed > 0 ? `, ${failed}건 실패` : ''}`,
      });
      setEdits({});
    } finally {
      setSaving(false);
    }
  };

  const handleDedup = async () => {
    if (!onDeduplicateAll) return;
    setDedupRunning(true);
    try {
      await onDeduplicateAll();
    } finally {
      setDedupRunning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            결과 관리
          </DialogTitle>
          <DialogDescription>
            상단 메뉴에서 작업을 선택하세요. 모든 작업이 이 창 안에서 처리됩니다.
          </DialogDescription>
        </DialogHeader>

        {/* Sticky toolbar */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b -mx-6 px-6 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setTab('search')}
              className={`h-8 ${tab === 'search' ? 'bg-indigo-100 border-indigo-300 text-indigo-800 shadow-sm' : 'bg-white hover:bg-indigo-50 border-indigo-200 text-indigo-700'}`}
            >
              <Search className="mr-1.5 h-3.5 w-3.5" /> 학생 검색
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setTab('rename')}
              className={`h-8 ${tab === 'rename' ? 'bg-amber-100 border-amber-300 text-amber-800 shadow-sm' : 'bg-white hover:bg-amber-50 border-amber-200 text-amber-700'}`}
            >
              <UserCog className="mr-1.5 h-3.5 w-3.5" /> 이름 일괄 수정
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                downloadExcel(results, tests);
                toast({ title: '엑셀 다운로드 시작' });
              }}
              className="h-8 bg-white hover:bg-emerald-50 border-emerald-200 text-emerald-700"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" /> 전체 엑셀 다운로드
            </Button>
            {onDeduplicateAll && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleDedup}
                disabled={dedupRunning}
                className="h-8 bg-white hover:bg-rose-50 border-rose-200 text-rose-700"
              >
                {dedupRunning
                  ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> 처리 중...</>
                  : <><Trash2 className="mr-1.5 h-3.5 w-3.5" /> 중복 데이터 제거</>}
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto -mx-6 px-6 pt-3">
          {tab === 'search' && (
            <div className="animate-fade-in">
              <StudentSearchFilter results={results} tests={tests} />
            </div>
          )}

          {tab === 'rename' && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="이름으로 검색..."
                    className="pl-9 h-9"
                  />
                </div>
                <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                  잘못된 이름 {invalidResults.length}건
                </Badge>
                {validRowCount > 0 && (
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    수정 준비됨 {validRowCount}건
                  </Badge>
                )}
              </div>

              {invalidResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-3" />
                  <p className="text-sm font-semibold text-slate-700">모든 이름이 올바른 형식입니다</p>
                  <p className="text-xs text-slate-400 mt-1">수정할 항목이 없습니다.</p>
                </div>
              ) : (
                <VirtualNameFixList
                  invalidResults={invalidResults}
                  edits={edits}
                  testTitleMap={testTitleMap}
                  onChange={handleChange}
                />
              )}
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-3 mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>닫기</Button>
          {tab === 'rename' && (
            <Button
              onClick={handleSaveAll}
              disabled={saving || validRowCount === 0}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white"
            >
              {saving ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> 저장 중...</>
              ) : (
                `${validRowCount}건 일괄 저장`
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkNameFixDialog;

interface VirtualListProps {
  invalidResults: TestResult[];
  edits: Record<string, string>;
  testTitleMap: Map<string, string>;
  onChange: (id: string, value: string) => void;
}

const ROW_HEIGHT = 80; // px — matches NameFixRow height + gap

const VirtualNameFixList = ({ invalidResults, edits, testTitleMap, onChange }: VirtualListProps) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: invalidResults.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
    getItemKey: (index) => invalidResults[index].id,
  });

  return (
    <div
      ref={parentRef}
      className="overflow-y-auto"
      style={{ height: 'min(60vh, 600px)', contain: 'strict' }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map(virtualRow => {
          const r = invalidResults[virtualRow.index];
          const { cls, raw } = splitName(r.student_name);
          const draft = edits[r.id] ?? raw;
          return (
            <div
              key={virtualRow.key}
              ref={rowVirtualizer.measureElement}
              data-index={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
                paddingBottom: 8,
              }}
            >
              <NameFixRow
                id={r.id}
                testTitle={testTitleMap.get(r.test_id) || r.test_id}
                createdAt={r.created_at}
                cls={cls}
                raw={raw}
                draft={draft}
                onChange={onChange}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
