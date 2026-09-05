import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const SESSIONS = [
  '1회차','2회차','3회차','4회차','5회차','6회차',
  '7회차','8회차','9회차','10회차','11회차(토요특강)','12회차(토요특강)'
];

const ROW1 = SESSIONS.slice(0, 6);
const ROW2 = SESSIONS.slice(6, 12);

export const ALL_TOPICS: Record<string, string[]> = {
  '문법A': ['품사, 문장성분','BE동사','일반동사 현재형','일반동사 과거형','BE동사, 일반동사(의문문, 부정문)','품사,문장성분','조동사','미래시제','진행형','시제(현재, 과거, 미래, 진행)'],
  '문법B': ['문장형식(1,2형식)','문장형식(3,4형식)','문장형식(5형식)','부정사의 용법(1)','부정사의 용법(2)','동명사','부정사 VS 동명사','명사구, 명사절','형용사구, 형용사절','부사구, 부사절'],
  '문독C+독해B': ['구와절','문장형식(상)','현재완료','분사','서술형 모의고사(중학 기출)','모의고사(주제 찾기)','모의고사(제목찾기)','모의고사(내용일치)','모의고사(글의목적)','모의고사(중등 +수능)'],
};

export const SATURDAY_11_OPTIONS = ['오전10시 8품사와 문장성분', '오후 12시 구와 절'];
export const SATURDAY_12_OPTIONS = ['오전 10시 : 구조분석 I', '오후 12시: 구조분석 II'];

export const getSessionOptions = (i: number): string[] => {
  if (i === 10) return SATURDAY_11_OPTIONS;
  if (i === 11) return SATURDAY_12_OPTIONS;
  return [
    `문법A: ${ALL_TOPICS['문법A'][i]}`,
    `문법B: ${ALL_TOPICS['문법B'][i]}`,
    `문독C+독해B: ${ALL_TOPICS['문독C+독해B'][i]}`,
  ];
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  '문법A': { bg: '#dbeafe', text: '#1e3a8a', border: '#3b82f6' },
  '문법B': { bg: '#dcfce7', text: '#14532d', border: '#22c55e' },
  '문독C+독해B': { bg: '#ffedd5', text: '#7c2d12', border: '#f97316' },
};

const SATURDAY_COLOR = '#7c3aed'; // violet-600

interface Props {
  resultId: string;
  studentName: string;
  initialAssignments?: (string | null)[] | null;
}

const BrainiacSpecialClassSection: React.FC<Props> = ({ resultId, studentName, initialAssignments }) => {
  const TAG = '[BrainiacSpecialClass]';
  console.log(`${TAG} 🔵 RENDER`, { resultId, studentName, initialAssignments });
  const [values, setValues] = useState<string[]>(() => {
    const arr = Array.isArray(initialAssignments) ? initialAssignments : [];
    const init = SESSIONS.map((_, i) => (arr[i] ?? '') as string);
    console.log(`${TAG} 🟡 INIT state from initialAssignments`, init);
    return init;
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    console.log(`${TAG} 🟢 MOUNT effect → fetching from DB`, { resultId });
    (async () => {
      const t0 = performance.now();
      const { data, error } = await supabase
        .from('level_test_results')
        .select('special_class_assignments')
        .eq('id', resultId)
        .maybeSingle();
      const dt = Math.round(performance.now() - t0);
      if (cancelled) {
        console.log(`${TAG} ⚪️ fetch CANCELLED (unmounted)`, { resultId });
        return;
      }
      console.log(`${TAG} 📥 fetch result (${dt}ms)`, { resultId, data, error });
      if (error) {
        console.warn(`${TAG} ❌ fetch error → falling back to initialAssignments`, error);
        const arr = Array.isArray(initialAssignments) ? initialAssignments : [];
        setValues(SESSIONS.map((_, i) => (arr[i] ?? '') as string));
        return;
      }
      const fetched = (data as any)?.special_class_assignments;
      console.log(`${TAG} 🔎 fetched.special_class_assignments`, {
        fetched,
        isArray: Array.isArray(fetched),
        type: typeof fetched,
      });
      const arr = Array.isArray(fetched)
        ? fetched
        : (Array.isArray(initialAssignments) ? initialAssignments : []);
      const next = SESSIONS.map((_, i) => (arr[i] ?? '') as string);
      console.log(`${TAG} ✅ SET values from DB`, next);
      setValues(next);
    })();
    return () => {
      cancelled = true;
      console.log(`${TAG} 🔻 UNMOUNT (cleanup)`, { resultId });
    };
  }, [resultId]);

  const persist = async (next: string[]) => {
    console.log(`${TAG} 💾 persist → updating DB`, { resultId, next });
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('level_test_results')
        .update({ special_class_assignments: next } as any)
        .eq('id', resultId)
        .select('id, special_class_assignments');
      if (error) throw error;
      console.log(`${TAG} ✔️ persist OK`, { resultId, updated: data });
    } catch (e) {
      console.error(`${TAG} 🚨 persist FAILED`, e);
      toast({ title: '저장 실패', description: '특강 배정 저장에 실패했습니다.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (i: number, v: string) => {
    const next = [...values];
    next[i] = v;
    setValues(next);
    persist(next);
  };

  const teal = '#0d9488';

  const renderSessionCell = (s: string, i: number) => {
    const val = values[i] || '';
    const isEmpty = !val;
    const category = val.split(':')[0]?.trim();
    const colors = CATEGORY_COLORS[category];
    const isSaturday = i >= 10;
    const headerColor = isSaturday ? SATURDAY_COLOR : teal;

    return (
      <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '0.05em',
            textAlign: 'center',
            background: headerColor,
            borderRadius: '6px 6px 0 0',
            padding: '4px 6px',
          }}
        >
          {s}
        </div>
        <div
          style={{
            background: isEmpty ? '#ffffff' : (colors?.bg ?? '#ffffff'),
            border: `1.5px solid ${isEmpty ? '#e2e8f0' : (colors?.border ?? headerColor)}`,
            borderTop: 'none',
            borderRadius: '0 0 6px 6px',
            fontSize: isEmpty ? '0.72rem' : '0.78rem',
            fontWeight: isEmpty ? 400 : 600,
            color: isEmpty ? '#94a3b8' : (colors?.text ?? '#1a1d2e'),
            padding: '8px 8px',
            minHeight: '2.8rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            lineHeight: 1.35,
            wordBreak: 'keep-all',
          }}
        >
          {isEmpty ? '—' : val}
        </div>
        <select
          data-export-ignore
          value={val}
          onChange={(e) => handleChange(i, e.target.value)}
          style={{
            width: '100%',
            marginTop: 4,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 6,
            color: '#1a1d2e',
            fontSize: '0.72rem',
            padding: '5px 8px',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value=""></option>
          {i === 10 ? (
            <>
              <option value="오전10시 8품사와 문장성분">오전10시 8품사와 문장성분</option>
              <option value="오후 12시 구와 절">오후 12시 구와 절</option>
            </>
          ) : i === 11 ? (
            <>
              <option value="오전 10시 : 구조분석 I">오전 10시 : 구조분석 I</option>
              <option value="오후 12시: 구조분석 II">오후 12시: 구조분석 II</option>
            </>
          ) : (
            <>
              <option value={`문법A: ${ALL_TOPICS['문법A'][i]}`}>문법A: {ALL_TOPICS['문법A'][i]}</option>
              <option value={`문법B: ${ALL_TOPICS['문법B'][i]}`}>문법B: {ALL_TOPICS['문법B'][i]}</option>
              <option value={`문독C+독해B: ${ALL_TOPICS['문독C+독해B'][i]}`}>문독C+독해B: {ALL_TOPICS['문독C+독해B'][i]}</option>
            </>
          )}
        </select>
      </div>
    );
  };

  return (
    <div
      style={{
        marginTop: '1rem',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        padding: '1rem 1.2rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1d2e', margin: 0 }}>
            🏫 프렙 방학 특강 수업 배정
          </h3>
          <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '2px 0 0' }}>
            {studentName} · 담당 선생님이 선정한 회차별 권장 수업입니다 {saving && <span data-export-ignore style={{ color: teal }}>· 저장 중…</span>}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
          {ROW1.map((s, idx) => renderSessionCell(s, idx))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
          {ROW2.map((s, idx) => renderSessionCell(s, idx + 6))}
        </div>
      </div>
    </div>
  );
};

export default BrainiacSpecialClassSection;