
import { useState } from 'react';
import { Passage } from './types';

export const usePassageSelection = (filteredPassages: Passage[]) => {
  const [selectedPassages, setSelectedPassages] = useState<string[]>([]);
  const [accumulatedSelections, setAccumulatedSelections] = useState<Passage[]>([]);

  const handleSelectPassage = (id: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedPassages(prev => [...prev, id]);
    } else {
      setSelectedPassages(prev => prev.filter(passageId => passageId !== id));
    }
  };

  const handleSelectAllPassages = (isChecked: boolean) => {
    if (isChecked) {
      const allIds = filteredPassages.map(passage => passage.id);
      setSelectedPassages(allIds);
    } else {
      setSelectedPassages([]);
    }
  };

  const clearSelectedPassages = () => {
    setSelectedPassages([]);
  };

  // Add passage to accumulated selections
  const accumulatePassage = (passage: Passage) => {
    // Check if the passage is already in accumulated selections
    const isAlreadyAccumulated = accumulatedSelections.some(p => p.id === passage.id);
    
    if (!isAlreadyAccumulated) {
      setAccumulatedSelections(prev => [...prev, passage]);
    }
  };

  // Add multiple passages to accumulated selections
  const accumulateMultiplePassages = (passages: Passage[]) => {
    // Filter out passages that are already in accumulated selections
    const newPassages = passages.filter(passage => 
      !accumulatedSelections.some(p => p.id === passage.id)
    );
    
    setAccumulatedSelections(prev => [...prev, ...newPassages]);
  };

  const removeAccumulatedPassage = (passageId: string) => {
    setAccumulatedSelections(prev => prev.filter(p => p.id !== passageId));
  };

  const clearAccumulatedSelections = () => {
    setAccumulatedSelections([]);
  };

  const getAccumulatedSelections = () => {
    return accumulatedSelections;
  };

  // Check if a passage is accumulated
  const isPassageAccumulated = (passageId: string) => {
    return accumulatedSelections.some(p => p.id === passageId);
  };

  // Toggle accumulation status of a passage
  const togglePassageAccumulation = (passage: Passage) => {
    const isAlreadyAccumulated = isPassageAccumulated(passage.id);
    
    if (isAlreadyAccumulated) {
      removeAccumulatedPassage(passage.id);
      return false; // Indicate it was removed
    } else {
      accumulatePassage(passage);
      return true; // Indicate it was added
    }
  };

  return {
    selectedPassages,
    handleSelectPassage,
    handleSelectAllPassages,
    clearSelectedPassages,
    accumulatePassage,
    accumulateMultiplePassages,
    removeAccumulatedPassage,
    accumulatedSelections,
    clearAccumulatedSelections,
    getAccumulatedSelections,
    setAccumulatedSelections,
    isPassageAccumulated,
    togglePassageAccumulation
  };
};
