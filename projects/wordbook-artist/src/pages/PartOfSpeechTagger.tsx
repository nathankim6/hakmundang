import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Tags, Loader2 } from 'lucide-react';
import { PosBadge } from '@/components/PosMeaning';

interface Workbook { id: string; title: string }
interface RunState { status: 'idle' | 'running' | 'done' | 'error'; updated: number; remaining: number; message?: string }
interface Counts { total: number; pending: number }

const PartOfSpeechTagger = () => {
  const navigate = useNavigate();
  const [workbooks, setWorkbooks] = useState<Workbook[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [states, setStates] = useState<Record<string, RunState>>({});
  const [running, setRunning] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, Counts>>({});
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [tick, setTick] = useState(0);

  const loadCounts = async (list: Workbook[]) => {
    setLoadingCounts(true);
    const { data: groups } = await supabase.from('day_groups').select('id, workbook_id');
    const byWb = new Map<string, string[]>();
    (groups || []).forEach(g => {
      const arr = byWb.get(g.workbook_id) || [];
      arr.push(g.id);
      byWb.set(g.workbook_id, arr);
    });

    const next: Record<string, Counts> = {};
    for (const wb of list) {
      const ids = byWb.get(wb.id) || [];
      if (ids.length === 0) { next[wb.id] = { total: 0, pending: 0 }; continue; }
      const [{ count: total }, { count: pending }] = await Promise.all([
        supabase.from('words').select('id', { count: 'exact', head: true }).in('day_group_id', ids),
        supabase.from('words').select('id', { count: 'exact', head: true }).in('day_group_id', ids).not('meaning', 'ilike', '%[%'),
      ]);
      next[wb.id] = { total: total ?? 0, pending: pending ?? 0 };
    }
    setCounts(next);
    setLoadingCounts(false);
  };

  // 단어장 1개의 저장 현황만 다시 계산 (실시간 반영)
  const refreshOne = async (workbookId: string) => {
    const { data: groups } = await supabase.from('day_groups').select('id').eq('workbook_id', workbookId);
    const ids = (groups || []).map(g => g.id);
    if (ids.length === 0) { setCounts(prev => ({ ...prev, [workbookId]: { total: 0, pending: 0 } })); return; }
    const [{ count: total }, { count: pending }] = await Promise.all([
      supabase.from('words').select('id', { count: 'exact', head: true }).in('day_group_id', ids),
      supabase.from('words').select('id', { count: 'exact', head: true }).in('day_group_id', ids).not('meaning', 'ilike', '%[%'),
    ]);
    setCounts(prev => ({ ...prev, [workbookId]: { total: total ?? 0, pending: pending ?? 0 } }));
  };

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('workbooks').select('id, title').order('created_at');
      if (error) { toast({ title: '단어장 불러오기 실패', description: error.message, variant: 'destructive' }); return; }
      const list = data || [];
      setWorkbooks(list);
      setSelected(Object.fromEntries(list.map(w => [w.id, true])));
      await loadCounts(list);
    })();
  }, []);

  // 경과 시간 실시간 갱신
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const targets = workbooks.filter(w => selected[w.id]);
  const totalWords = targets.reduce((s, w) => s + (counts[w.id]?.total ?? 0), 0);
  const totalPending = targets.reduce((s, w) => s + (counts[w.id]?.pending ?? 0), 0);
  const totalTagged = totalWords - totalPending;
  const totalUpdatedAll = targets.reduce((s, w) => s + (states[w.id]?.updated ?? 0), 0);
  const overallPercent = totalWords > 0 ? Math.min(100, Math.round((totalTagged / totalWords) * 100)) : 0;
  const doneWorkbooks = targets.filter(w => states[w.id]?.status === 'done' || states[w.id]?.status === 'error').length;
  const elapsed = startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0;
  const eta = totalUpdatedAll > 0 && elapsed > 0
    ? Math.max(0, Math.round(((totalPending - totalUpdatedAll) / totalUpdatedAll) * elapsed))
    : null;
  const fmt = (s: number) => `${Math.floor(s / 60)}분 ${s % 60}초`;

  const runAll = async () => {
    if (!targets.length) { toast({ title: '단어장을 선택해주세요' }); return; }
    setRunning(true);
    setStartedAt(Date.now());
    setStates({});
    let hadError = false;

    for (let i = 0; i < targets.length; i++) {
      const wb = targets[i];
      setCurrent(wb.title);
      setStates(prev => ({ ...prev, [wb.id]: { status: 'running', updated: 0, remaining: 0 } }));

      let totalUpdated = 0;
      let guard = 0;
      let fails = 0;
      try {
        while (guard < 400) {
          guard++;
          const { data, error } = await supabase.functions.invoke('tag-part-of-speech', {
            body: { workbookId: wb.id, batchSize: 20, maxWords: 60 },
          });
          const errMsg = error?.message || data?.error;
          if (errMsg) {
            fails++;
            // 이미 저장된 진행분은 유지하고 재시도 (최대 3회 연속 실패 시 중단)
            if (fails >= 3) throw new Error(errMsg);
            setStates(prev => ({ ...prev, [wb.id]: { status: 'running', updated: totalUpdated, remaining: prev[wb.id]?.remaining ?? 0, message: `재시도 ${fails}/3` } }));
            await new Promise(r => setTimeout(r, 1500 * fails));
            continue;
          }
          fails = 0;
          totalUpdated += data?.updated ?? 0;
          setStates(prev => ({ ...prev, [wb.id]: { status: 'running', updated: totalUpdated, remaining: data?.remaining ?? 0 } }));
          await refreshOne(wb.id);
          if (!data?.processed || (data?.remaining ?? 0) === 0) break;
        }
        setStates(prev => ({ ...prev, [wb.id]: { status: 'done', updated: totalUpdated, remaining: 0 } }));
      } catch (e) {
        hadError = true;
        setStates(prev => ({ ...prev, [wb.id]: { status: 'error', updated: totalUpdated, remaining: 0, message: e instanceof Error ? e.message : '오류' } }));
      }
      await refreshOne(wb.id);
    }

    setCurrent(null);
    setRunning(false);
    await loadCounts(workbooks);
    toast({
      title: hadError ? '일부 단어장에서 중단됨' : '품사 기호 적용 완료',
      description: hadError ? '이미 적용된 단어는 저장되어 있습니다. 다시 실행하면 남은 단어부터 이어서 진행합니다.' : undefined,
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> 대시보드
        </Button>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Tags className="w-6 h-6" /> 품사 기호 일괄 적용</h1>
          <p className="text-sm text-muted-foreground">
            AI가 각 단어의 뜻을 분석해 아래 품사 기호를 뜻 앞에 붙입니다. 이미 기호가 있는 단어는 건너뜁니다.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {['명', '동사', '동', '형', '부', '대', '전', '접', '감탄', '조동', 'COLLOC.', '숙어'].map(t => (
              <PosBadge key={t} tag={t} size={11} />
            ))}
          </div>
        </div>

        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">
              대상 단어장 ({targets.length}/{workbooks.length})
              {!loadingCounts && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  저장 완료 {totalTagged.toLocaleString()} / {totalWords.toLocaleString()}개 · 남은 단어 {totalPending.toLocaleString()}개
                </span>
              )}
            </div>
            <Button size="sm" variant="outline" disabled={running}
              onClick={() => {
                const allOn = workbooks.every(w => selected[w.id]);
                setSelected(Object.fromEntries(workbooks.map(w => [w.id, !allOn])));
              }}>전체 선택/해제</Button>
          </div>
          <div className="grid gap-2 max-h-[420px] overflow-auto">
            {workbooks.map(wb => {
              const st = states[wb.id];
              return (
                <label key={wb.id} className="flex items-center gap-3 p-2 rounded-md border border-border/60">
                  <Checkbox checked={!!selected[wb.id]} disabled={running}
                    onCheckedChange={(v) => setSelected(prev => ({ ...prev, [wb.id]: !!v }))} />
                  <span className="flex-1 text-sm">{wb.title}</span>
                  {counts[wb.id] && (
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {(counts[wb.id].total - counts[wb.id].pending).toLocaleString()} / {counts[wb.id].total.toLocaleString()}
                    </span>
                  )}
                  {st?.status === 'running' && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                  {st && st.status !== 'error' && (
                    <span className="text-xs text-muted-foreground">{st.updated}개 적용{st.remaining ? ` · 남음 ${st.remaining}` : ''}</span>
                  )}
                  {st?.status === 'error' && <span className="text-xs text-destructive">{st.message}</span>}
                </label>
              );
            })}
          </div>
        </Card>

        {running && (
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>{current ? `처리 중: ${current}` : '처리 중...'}</span>
              <span className="tabular-nums font-medium">
                {totalTagged.toLocaleString()} / {totalWords.toLocaleString()}개 저장됨 ({overallPercent}%)
              </span>
            </div>
            <Progress value={overallPercent} />
            <div className="flex items-center justify-between text-xs text-muted-foreground tabular-nums">
              <span>단어장 {doneWorkbooks}/{targets.length} 완료</span>
              <span>경과 {fmt(elapsed)}{eta !== null ? ` · 남은 시간 약 ${fmt(eta)}` : ''}</span>
            </div>
          </Card>
        )}

        <Button onClick={runAll} disabled={running} className="w-full gap-2">
          {running ? <><Loader2 className="w-4 h-4 animate-spin" /> 처리 중...</> : <><Tags className="w-4 h-4" /> 선택 단어장 품사 기호 적용</>}
        </Button>
      </div>
    </div>
  );
};

export default PartOfSpeechTagger;
