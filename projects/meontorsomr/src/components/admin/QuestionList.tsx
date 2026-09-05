
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { QuestionAnswer, QuestionType } from "@/types/test";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QuestionListProps {
  questionCount: number;
  onQuestionCountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  answers: Record<number, QuestionAnswer>;
  onAnswerChange: (questionNumber: number, answer: QuestionAnswer) => void;
  readOnlyCount?: boolean;
}

const QuestionList = ({ 
  questionCount, 
  onQuestionCountChange, 
  answers, 
  onAnswerChange,
  readOnlyCount = false
}: QuestionListProps) => {
  const handleTypeChange = (questionNumber: number, type: QuestionType) => {
    const currentAnswer = answers[questionNumber];
    onAnswerChange(questionNumber, {
      type,
      answer: type === 'multiple' ? (currentAnswer?.answer as number || 1) : ''
    });
  };

  const handleAnswerChange = (questionNumber: number, value: string | number) => {
    const currentType = answers[questionNumber]?.type || 'multiple';
    onAnswerChange(questionNumber, {
      type: currentType,
      answer: value
    });
  };

  return (
    <div className="space-y-2">
      {!readOnlyCount && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4 p-3 bg-emerald-50 rounded-lg">
          <h2 className="text-lg font-semibold text-emerald-700 whitespace-nowrap">문항 수 설정</h2>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              min="1"
              value={questionCount}
              onChange={onQuestionCountChange}
              className="w-24 border-emerald-200 focus:border-emerald-500"
            />
            <span className="text-emerald-700">문항</span>
          </div>
        </div>
      )}
      
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 pb-4">
        {Array.from({ length: questionCount }, (_, i) => i + 1).map((num) => (
          <div key={num} className="flex flex-col sm:flex-row sm:items-center py-2 px-2 border-b border-emerald-100 bg-white rounded-lg shadow-sm">
            <span className="w-16 font-medium text-emerald-700 text-lg mb-2 sm:mb-0">{num}번</span>
            
            <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-3">
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

              {answers[num]?.type === 'subjective' ? (
                <div className="flex-1 w-full">
                  <Input
                    type="text"
                    value={answers[num]?.answer?.toString() || ''}
                    onChange={(e) => handleAnswerChange(num, e.target.value)}
                    placeholder="정답을 입력하세요"
                    className="flex-1 border-emerald-200 focus:border-emerald-500 w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    복수 정답은 콤마(,)로 구분. 예: 답1, 답2, 답3
                  </p>
                </div>
              ) : (
                <div className="flex gap-3 flex-wrap">
                  {[1, 2, 3, 4, 5].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleAnswerChange(num, option)}
                      className={`w-9 h-9 flex items-center justify-center rounded-full text-sm transition-all border ${
                        answers[num]?.answer === option
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
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
