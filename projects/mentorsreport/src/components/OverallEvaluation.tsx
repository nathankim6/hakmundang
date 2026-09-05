
import React from 'react';
import { Textarea } from "@/components/ui/textarea";

interface CategoryEvaluation {
  category: string;
  evaluation: string;
}

interface OverallEvaluationProps {
  evaluations: CategoryEvaluation[];
  onEvaluationChange: (category: string, value: string) => void;
  selectedCategories?: string[];
  isHighSchool?: boolean;
}

const OverallEvaluation: React.FC<OverallEvaluationProps> = ({
  evaluations,
  onEvaluationChange,
  selectedCategories = [],
  isHighSchool = false
}) => {
  // For high school, we use a single evaluation with category '종합 평가'
  // regardless of selectedCategories
  const displayEvaluations = React.useMemo(() => {
    if (isHighSchool) {
      // Always return just one evaluation for high school regardless of selectedCategories
      const existingOverall = evaluations.find(e => e.category === '종합 평가');
      return [existingOverall || { category: '종합 평가', evaluation: '' }];
    }
    
    if (selectedCategories.length > 0) {
      return selectedCategories.map(category => {
        // Check if this category already exists in evaluations
        const existing = evaluations.find(e => e.category === category);
        return existing || { category, evaluation: '' };
      });
    } else {
      // Fall back to first evaluation or default
      return [evaluations[0] || { category: '종합 평가', evaluation: '' }];
    }
  }, [selectedCategories, evaluations, isHighSchool]);

  // Add debug logging
  React.useEffect(() => {
    console.log('OverallEvaluation - Current evaluations:', evaluations);
    console.log('OverallEvaluation - Selected categories:', selectedCategories);
    console.log('OverallEvaluation - Display evaluations:', displayEvaluations);
    console.log('OverallEvaluation - isHighSchool:', isHighSchool);
  }, [evaluations, selectedCategories, displayEvaluations, isHighSchool]);

  const handleTextareaChange = (category: string, value: string) => {
    console.log(`Changing evaluation for ${category} to: ${value}`);
    onEvaluationChange(category, value);
  };

  return (
    <div className="space-y-4 w-full">
      {isHighSchool ? (
        // For high school, always show exactly one textarea
        <div className="space-y-2 w-full">
          <Textarea
            id="eval-종합-평가"
            value={displayEvaluations[0]?.evaluation || ''}
            onChange={(e) => handleTextareaChange('종합 평가', e.target.value)}
            placeholder="종합 평가를 작성하세요."
            className="min-h-[120px] w-full"
          />
        </div>
      ) : (
        // For middle school, show one textarea per category
        displayEvaluations.map((item, index) => (
          <div key={`${item.category}-${index}`} className="space-y-2 w-full">
            <Textarea
              id={`eval-${item.category}`}
              value={item.evaluation || ''}
              onChange={(e) => handleTextareaChange(item.category, e.target.value)}
              placeholder={`${item.category}에 대한 평가를 작성하세요.`}
              className="min-h-[120px] w-full"
            />
          </div>
        ))
      )}
      {!isHighSchool && displayEvaluations.length === 0 && (
        <div className="text-gray-500 italic text-sm">
          선택된 대분류 카테고리가 없습니다. 문제 유형에서 대분류를 선택하시면 해당 카테고리별 코멘트를 작성할 수 있습니다.
        </div>
      )}
    </div>
  );
};

export default OverallEvaluation;
