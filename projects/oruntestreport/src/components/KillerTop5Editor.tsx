import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import type { KillerProblem } from '@/integrations/supabase/reportService';

interface KillerTop5EditorProps {
  items: KillerProblem[];
  onChange: (items: KillerProblem[]) => void;
}

const KillerTop5Editor: React.FC<KillerTop5EditorProps> = ({ items, onChange }) => {
  const update = (index: number, field: keyof KillerProblem, value: string | number) => {
    onChange(items.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  };

  const add = () => onChange([...items, { number: '', title: '', points: undefined, reason: '' }]);
  const remove = (index: number) => onChange(items.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <p className="text-[13px] text-[hsl(var(--ink-soft))] break-keep">
          등급을 가른 문항을 예상 오답률 순으로 최대 5개까지 등록하세요. PDF 자동 분석으로도 채울 수 있습니다.
        </p>
      )}

      {items.map((item, index) => (
        <div
          key={index}
          className="rounded-xl border border-[hsl(var(--ink)/0.1)] bg-white/70 p-3 shadow-sm"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-[hsl(0_70%_45%/0.1)] text-[12px] font-bold tabular-nums text-[hsl(0_70%_40%)]">
              {index + 1}
            </span>
            <Input
              value={item.number}
              onChange={(e) => update(index, 'number', e.target.value)}
              placeholder="문항 번호 (예: 21, 14·15)"
              className="w-full bg-white/80 md:w-[180px]"
            />
            <Input
              value={item.title}
              onChange={(e) => update(index, 'title', e.target.value)}
              placeholder="유형 요약 (예: 어법 2개 고르기)"
              className="min-w-[160px] flex-1 bg-white/80"
            />
            <Input
              inputMode="decimal"
              value={item.points ?? ''}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9.]/g, '');
                update(index, 'points', raw === '' ? 0 : parseFloat(raw) || 0);
              }}
              placeholder="배점"
              className="w-full bg-white/80 text-center md:w-[92px]"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
              className="text-red-500 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <Textarea
            value={item.reason}
            onChange={(e) => update(index, 'reason', e.target.value)}
            placeholder="왜 등급을 갈랐는지 2~3문장"
            className="mt-2 min-h-[68px] bg-white/80 text-[13.5px] leading-[1.7]"
            style={{ wordBreak: 'keep-all' }}
          />
        </div>
      ))}

      {items.length < 5 && (
        <Button type="button" variant="outline" size="sm" onClick={add} className="gap-1.5">
          <Plus className="h-4 w-4" /> 킬러 문항 추가
        </Button>
      )}
    </div>
  );
};

export default KillerTop5Editor;
