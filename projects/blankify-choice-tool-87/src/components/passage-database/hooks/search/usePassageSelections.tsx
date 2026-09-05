
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Passage } from '../types';

export const usePassageSelections = (maxSelections = 40) => {
  const { toast } = useToast();
  const [accumulatedSelections, setAccumulatedSelections] = useState<Passage[]>([]);
  const [showAccumulatedSelections, setShowAccumulatedSelections] = useState(true);

  const isPassageAccumulated = (passageId: string) => {
    return accumulatedSelections.some(p => p.id === passageId);
  };
  
  const removeAccumulatedPassage = (passageId: string) => {
    setAccumulatedSelections(prev => prev.filter(p => p.id !== passageId));
  };
  
  const clearAccumulatedSelections = () => {
    setAccumulatedSelections([]);
  };
  
  const handlePassageSelection = (passage: Passage) => {
    if (isPassageAccumulated(passage.id)) {
      removeAccumulatedPassage(passage.id);
    } else {
      if (accumulatedSelections.length >= maxSelections) {
        toast({
          variant: "destructive",
          description: `최대 ${maxSelections}개의 지문만 선택할 수 있습니다.`
        });
        return;
      }
      
      const passageWithUpdatedAt = {
        ...passage,
        updated_at: passage.updated_at || passage.created_at
      };
      
      setAccumulatedSelections(prev => [...prev, passageWithUpdatedAt]);
      
      toast({
        description: "지문이 선택 목록에 추가되었습니다.",
      });
    }
  };
  
  return {
    accumulatedSelections,
    setAccumulatedSelections,
    showAccumulatedSelections,
    setShowAccumulatedSelections,
    isPassageAccumulated,
    removeAccumulatedPassage,
    clearAccumulatedSelections,
    handlePassageSelection
  };
};
