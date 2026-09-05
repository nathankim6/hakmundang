
import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface CategoryEvaluation {
  category: string;
  evaluation: string;
}

interface OverallEvaluationProps {
  evaluations: CategoryEvaluation[];
  onEvaluationChange: (category: string, value: string) => void;
  selectedCategories?: string[];
  isHighSchool?: boolean;
  gptLoading?: boolean;
  onGptEnhance?: () => void;
}

const OverallEvaluation: React.FC<OverallEvaluationProps> = ({
  evaluations,
  onEvaluationChange,
  selectedCategories = [],
  isHighSchool = false,
  gptLoading = false,
  onGptEnhance
}) => {
  // Always use a single evaluation with category '종합 평가' for both middle and high school
  const displayEvaluation = React.useMemo(() => {
    const existingOverall = evaluations.find(e => e.category === '종합 평가');
    return existingOverall || { category: '종합 평가', evaluation: '' };
  }, [evaluations]);

  // Add debug logging
  React.useEffect(() => {
    console.log('OverallEvaluation - Current evaluations:', evaluations);
    console.log('OverallEvaluation - Selected categories:', selectedCategories);
    console.log('OverallEvaluation - Display evaluation:', displayEvaluation);
    console.log('OverallEvaluation - isHighSchool:', isHighSchool);
  }, [evaluations, selectedCategories, displayEvaluation, isHighSchool]);

  const handleTextareaChange = (category: string, value: string) => {
    console.log(`Changing evaluation for ${category} to: ${value}`);
    onEvaluationChange(category, value);
  };

  return (
    <div className="space-y-4 w-full">
      <div className="space-y-2 w-full">
        <label htmlFor="eval-종합-평가" className="block text-sm font-medium text-gray-700">
          종합 평가
        </label>
        <div className="relative">
          <Textarea
            id="eval-종합-평가"
            value={displayEvaluation.evaluation || ''}
            onChange={(e) => handleTextareaChange('종합 평가', e.target.value)}
            placeholder="종합 평가를 작성하세요."
            className="min-h-[120px] w-full pr-28"
          />
          {onGptEnhance && (
            <Button
              type="button"
              onClick={onGptEnhance}
              disabled={gptLoading}
              className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 shadow-md"
              size="sm"
            >
              {gptLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  첨삭 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI 첨삭
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverallEvaluation;
