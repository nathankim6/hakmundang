
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Passage } from '../types';
import { stepRoutes } from '@/components/my-works/constants';

export const usePassageApplication = (accumulatedSelections: Passage[]) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSavePassages = useCallback(() => {
    if (accumulatedSelections.length === 0) {
      toast({
        variant: "destructive",
        description: "적용할 지문을 먼저 선택해주세요."
      });
      return;
    }
    
    // Store all passages in session storage for all steps
    sessionStorage.setItem('selectedPassages', JSON.stringify(accumulatedSelections));
    
    // Also store individual passages for each step (1-5)
    const passages = [...accumulatedSelections]; // Create a copy to avoid mutation
    
    // For each step (1-5), save the corresponding passage or first passage if not enough
    for (let step = 1; step <= 5; step++) {
      const passage = passages.length >= step ? passages[step - 1] : passages[0];
      sessionStorage.setItem(`selectedPassage_step${step}`, JSON.stringify(passage));
    }
    
    // Also save the first passage separately (for backward compatibility)
    if (passages.length > 0) {
      sessionStorage.setItem('selectedPassage', JSON.stringify(passages[0]));
    }
    
    toast({
      description: `${passages.length}개의 지문이 모든 STEP에 적용되었습니다.`
    });
    
    // Reload page to apply changes
    navigate(0);
  }, [accumulatedSelections, navigate, toast]);

  return {
    handleSavePassages
  };
};
