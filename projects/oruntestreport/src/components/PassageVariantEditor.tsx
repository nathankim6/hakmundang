import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import type { PassageVariant } from '@/integrations/supabase/reportService';

interface PassageVariantEditorProps {
  items: PassageVariant[];
  onChange: (items: PassageVariant[]) => void;
}

const EMPTY: PassageVariant = {
  number: '',
  source: '',
  variantType: '',
  originalText: '',
  examText: '',
  changeDetail: '',
  impact: '',
};

/** 원문 대조 · 지문 변형 분석 항목 편집기 */
const PassageVariantEditor: React.FC<PassageVariantEditorProps> = ({ items, onChange }) => {
  const update = (idx: number, patch: Partial<PassageVariant>) =>
    onChange(items.map((item, i) => (i === idx ? { ...item, ...patch } : item)));

  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <p className="text-[13px] text-[hsl(var(--ink-soft))] break-keep">
          아직 변형 분석 항목이 없습니다. 기본 정보 단계에서 원문을 넣고 자동 분석을 실행하거나, 아래에서 직접
          추가하세요.
        </p>
      )}

      {items.map((item, idx) => (
        <div key={idx} className="rounded-xl border border-[hsl(var(--ink)/0.12)] bg-white/80 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="editorial-kicker text-[10px] tracking-[0.3em] font-bold text-[#16233A]">
              VARIANT {idx + 1}
            </span>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-red-500 hover:text-red-600"
              onClick={() => onChange(items.filter((_, i) => i !== idx))}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              value={item.number}
              onChange={(e) => update(idx, { number: e.target.value })}
              placeholder="문항 번호 (예: 21)"
              className="bg-white text-black"
            />
            <Input
              value={item.source}
              onChange={(e) => update(idx, { source: e.target.value })}
              placeholder="원문 출처 (교재 · 단원)"
              className="bg-white text-black"
            />
            <Input
              value={item.variantType}
              onChange={(e) => update(idx, { variantType: e.target.value })}
              placeholder="변형 유형 (예: 어휘 치환)"
              className="bg-white text-black"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Textarea
              value={item.originalText}
              onChange={(e) => update(idx, { originalText: e.target.value })}
              placeholder="원문 문장"
              className="min-h-[90px] bg-white text-black"
            />
            <Textarea
              value={item.examText}
              onChange={(e) => update(idx, { examText: e.target.value })}
              placeholder="시험지 출제 문장"
              className="min-h-[90px] bg-white text-black"
            />
          </div>

          <Textarea
            value={item.changeDetail}
            onChange={(e) => update(idx, { changeDetail: e.target.value })}
            placeholder="어떤 부분이 어떻게 변형되었는지"
            className="min-h-[80px] bg-white text-black"
          />
          <Textarea
            value={item.impact || ''}
            onChange={(e) => update(idx, { impact: e.target.value })}
            placeholder="학습 포인트 · 함정 (선택)"
            className="min-h-[60px] bg-white text-black"
          />
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        className="rounded-full"
        onClick={() => onChange([...items, { ...EMPTY }])}
      >
        <Plus className="h-4 w-4 mr-1.5" />
        변형 항목 추가
      </Button>
    </div>
  );
};

export default PassageVariantEditor;
