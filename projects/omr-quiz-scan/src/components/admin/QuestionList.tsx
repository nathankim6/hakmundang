
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { QuestionAnswer, QuestionType, TestFormat } from "@/types/test";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { calculateAutoPoints, sumPoints } from "@/utils/testUtils/pointsDistribution";

interface QuestionListProps {
  questionCount: number;
  onQuestionCountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  answers: Record<number, QuestionAnswer>;
  onAnswerChange: (questionNumber: number, answer: QuestionAnswer) => void;
  readOnlyCount?: boolean;
  testFormat: TestFormat;
  onTestFormatChange: (format: TestFormat) => void;
  showGrammarCategory?: boolean;
}

const QuestionList = ({ 
  questionCount, 
  onQuestionCountChange, 
  answers, 
  onAnswerChange,
  readOnlyCount = false,
  testFormat,
  onTestFormatChange,
  showGrammarCategory = false
}: QuestionListProps) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoPoints = calculateAutoPoints(questionCount);
  const currentTotal = (() => {
    let total = 0;
    for (let i = 1; i <= questionCount; i++) total += answers[i]?.points ?? autoPoints[i] ?? 0;
    return Math.round(total * 10) / 10;
  })();

  const applyAutoPoints = () => {
    for (let i = 1; i <= questionCount; i++) {
      onAnswerChange(i, {
        ...(answers[i] || { type: 'multiple' as QuestionType, answer: [] }),
        points: autoPoints[i],
      });
    }
  };


  const handleTypeChange = (questionNumber: number, type: QuestionType) => {
    const currentAnswer = answers[questionNumber];
    onAnswerChange(questionNumber, {
      type,
      answer: type === 'multiple' ? [] : '', // multiple: number[], subjective: string
      points: currentAnswer?.points
    });
  };

  const handlePointsChange = (questionNumber: number, points: number) => {
    const currentAnswer = answers[questionNumber];
    onAnswerChange(questionNumber, {
      ...currentAnswer,
      points
    });
  };

  const handleGrammarCategoryChange = (questionNumber: number, category: string) => {
    const currentAnswer = answers[questionNumber];
    onAnswerChange(questionNumber, {
      ...currentAnswer,
      type: currentAnswer?.type || 'multiple',
      answer: currentAnswer?.answer || [],
      grammarCategory: category
    });
  };

  const handleAnswerChange = (questionNumber: number, value: number | string) => {
    const currentType = answers[questionNumber]?.type || 'multiple';
    
    if (currentType === 'multiple') {
      const currentAnswers = Array.isArray(answers[questionNumber]?.answer) 
        ? (answers[questionNumber].answer as number[])
        : [];
      let newAnswers: number[];
      if (typeof value === "number") {
        newAnswers = currentAnswers.includes(value)
          ? currentAnswers.filter(a => a !== value)
          : [...currentAnswers, value].sort((a, b) => a - b);
      } else {
        newAnswers = currentAnswers;
      }
      onAnswerChange(questionNumber, {
        type: currentType,
        answer: newAnswers,
        points: answers[questionNumber]?.points
      });
    } else {
      // subjective: always string
      onAnswerChange(questionNumber, {
        type: currentType,
        answer: String(value),
        points: answers[questionNumber]?.points
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: "오류", description: "이미지 파일만 업로드할 수 있습니다.", variant: "destructive" });
      return;
    }

    setIsExtracting(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke('extract-answers-from-image', {
        body: { imageBase64: base64, questionCount, accessCode: sessionStorage.getItem('verifiedAccessCode') || '' }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const extracted = data.answers as Array<{ number: number; type: string; answer: number[] | string }>;
      
      let filledCount = 0;
      extracted.forEach((item) => {
        const num = item.number;
        if (num < 1 || num > questionCount) return;
        
        const type: QuestionType = item.type === 'subjective' ? 'subjective' : 'multiple';
        const currentPoints = answers[num]?.points ?? autoPoints[num];
        
        onAnswerChange(num, {
          type,
          answer: type === 'multiple' 
            ? (Array.isArray(item.answer) ? item.answer : []) 
            : String(item.answer || ''),
          points: currentPoints
        });
        filledCount++;
      });

      toast({ title: "정답 추출 완료", description: `${filledCount}개 문항의 정답이 입력되었습니다.` });
    } catch (err: any) {
      console.error('Answer extraction error:', err);
      toast({ title: "정답 추출 실패", description: err.message || "AI 정답 추출에 실패했습니다.", variant: "destructive" });
    } finally {
      setIsExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {/* AI 이미지 정답 추출 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isExtracting}
          className="border-blue-300 text-blue-700 hover:bg-blue-100 shrink-0"
        >
          {isExtracting ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />AI 분석 중...</>
          ) : (
            <><ImagePlus className="h-4 w-4 mr-2" />이미지로 정답 입력</>
          )}
        </Button>
        <span className="text-xs text-blue-600">정답지 사진을 업로드하면 AI가 자동으로 정답을 입력합니다</span>
      </div>

      {!readOnlyCount && (
        <div className="mb-4 p-3 bg-emerald-50 rounded-lg space-y-3">
          {/* 첫 줄: 문항 수 + 총점/현재배점 */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-emerald-700 whitespace-nowrap">문항 수</h2>
              <Input
                type="number"
                min="1"
                value={questionCount}
                onChange={onQuestionCountChange}
                onFocus={(e) => e.target.select()}
                className="w-20 h-8 border-emerald-200 focus:border-emerald-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 bg-emerald-100 rounded text-emerald-700 font-medium">총점 100점</span>
              <span className={`text-xs px-2 py-1 rounded font-bold ${
                Math.abs(currentTotal - 100) <= 0.05 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
              }`}>
                현재 {currentTotal}점
              </span>
            </div>
          </div>
          {/* 둘째 줄: 일괄배점 */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 text-xs px-3 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
              onClick={applyAutoPoints}
            >
              자동 배점(100점)
            </Button>
            <Label className="text-xs text-emerald-600 shrink-0">일괄배점</Label>
            <Input
              type="number"
              min="0.1"
              step="0.1"
              max="100"
              id="bulk-points-input"
              placeholder="점수"
              onFocus={(e) => e.target.select()}
              className="w-16 h-7 text-center text-xs border-emerald-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const val = parseFloat((e.target as HTMLInputElement).value);
                  if (val && val > 0) {
                    for (let i = 1; i <= questionCount; i++) {
                      onAnswerChange(i, { ...answers[i] || { type: 'multiple', answer: [] }, points: val });
                    }
                    (e.target as HTMLInputElement).value = '';
                  }
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 text-xs px-3 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
              onClick={() => {
                const input = document.getElementById('bulk-points-input') as HTMLInputElement;
                const val = parseFloat(input?.value);
                if (val && val > 0) {
                  for (let i = 1; i <= questionCount; i++) {
                    onAnswerChange(i, { ...answers[i] || { type: 'multiple', answer: [] }, points: val });
                  }
                  if (input) input.value = '';
                }
              }}
            >
              적용
            </Button>
          </div>
        </div>
      )}
      
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 pb-4">
        {Array.from({ length: questionCount }, (_, i) => i + 1).map((num) => (
          <div key={num} className="flex flex-col sm:flex-row sm:items-center py-2 px-2 border-b border-emerald-100 rounded-lg shadow-sm bg-white">
            <span className="w-16 font-medium text-emerald-700 text-lg mb-2 sm:mb-0">
              {num}번
            </span>
            
            <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
              {showGrammarCategory && (
                <Input
                  type="text"
                  value={answers[num]?.grammarCategory || ''}
                  onChange={(e) => handleGrammarCategoryChange(num, e.target.value)}
                  placeholder="문법 카테고리"
                  className="w-full sm:w-28 h-8 text-[10px] border-purple-200 focus:border-purple-500 placeholder:text-purple-300 placeholder:text-[10px]"
                />
              )}
              <Select
                value={answers[num]?.type || 'multiple'}
                onValueChange={(value: QuestionType) => handleTypeChange(num, value)}
              >
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple">객관식</SelectItem>
                  <SelectItem value="subjective">주관식</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Label className="text-sm text-emerald-700">배점:</Label>
                <Input
                  type="number"
                  min="0.1"
                  step="0.1"
                  max="100"
                  value={answers[num]?.points ?? autoPoints[num]}
                  onChange={(e) => handlePointsChange(num, Math.round((parseFloat(e.target.value) || 0) * 10) / 10)}
                  onFocus={(e) => e.target.select()}
                  className="w-16 h-8 text-center border-emerald-200 focus:border-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-sm text-emerald-600">점</span>
              </div>

              {answers[num]?.type === 'subjective' ? (
                <div className="flex-1 w-full">
                  <textarea
                    value={answers[num]?.answer?.toString() || ''}
                    onChange={(e) => handleAnswerChange(num, e.target.value)}
                    placeholder="정답을 입력하세요 (복수 정답은 줄바꿈으로 구분)"
                    rows={Math.min(
                      6,
                      Math.max(1, (answers[num]?.answer?.toString() || '').split('\n').length)
                    )}
                    className="flex-1 w-full rounded-md border border-emerald-200 focus:border-emerald-500 focus:outline-none px-3 py-2 text-sm resize-y min-h-[36px]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    복수 정답은 <strong>줄바꿈(Enter)</strong>으로 구분하세요. 문장 안 콤마는 그대로 사용 가능합니다.
                  </p>
                </div>
              ) : (
                <div className="flex gap-3 flex-wrap">
                  {[1, 2, 3, 4, 5].map((option) => {
                    const isSelected = Array.isArray(answers[num]?.answer) && 
                      (answers[num]?.answer as number[]).includes(option);
                    
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleAnswerChange(num, option)}
                        className={`w-9 h-9 flex items-center justify-center rounded-full text-sm transition-all border ${
                          isSelected
                            ? 'bg-emerald-500 text-white border-emerald-500'
                            : 'text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionList;
