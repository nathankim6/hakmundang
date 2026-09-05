import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import type { ExamFeature } from '@/integrations/supabase/reportService';

interface ExamFeaturesEditorProps {
  features: ExamFeature[];
  onChange: (features: ExamFeature[]) => void;
}

const ExamFeaturesEditor: React.FC<ExamFeaturesEditorProps> = ({ features, onChange }) => {
  const update = (index: number, field: keyof ExamFeature, value: string) => {
    onChange(features.map((f, i) => (i === index ? { ...f, [field]: value } : f)));
  };

  const add = () => onChange([...features, { title: '', detail: '' }]);
  const remove = (index: number) => onChange(features.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      {features.length === 0 && (
        <p className="text-[13px] text-[hsl(var(--ink-soft))] break-keep">
          아직 등록된 출제 특징이 없습니다. 항목을 추가하거나 PDF 자동 분석으로 채워 주세요.
        </p>
      )}

      {features.map((feature, index) => (
        <div
          key={index}
          className="rounded-xl border border-[hsl(var(--ink)/0.1)] bg-white/70 p-3 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-[hsl(var(--ink)/0.06)] text-[12px] font-bold tabular-nums text-[hsl(var(--ink))]">
              {index + 1}
            </span>
            <Input
              value={feature.title}
              onChange={(e) => update(index, 'title', e.target.value)}
              placeholder="특징 제목 (예: 어법 4문항 15.0점이 전부 '틀린 것 찾기')"
              className="flex-1 bg-white/80 font-medium"
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
            value={feature.detail}
            onChange={(e) => update(index, 'detail', e.target.value)}
            placeholder="구체적인 설명 2~3문장"
            className="mt-2 min-h-[68px] bg-white/80 text-[13.5px] leading-[1.7]"
            style={{ wordBreak: 'keep-all' }}
          />
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={add} className="gap-1.5">
        <Plus className="h-4 w-4" /> 출제 특징 추가
      </Button>
    </div>
  );
};

export default ExamFeaturesEditor;
