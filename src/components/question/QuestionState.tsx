import { useState } from 'react';
import { QuestionType, TypeEntry } from '@/types/question';
import { useToast } from '@/hooks/use-toast';

export const useQuestionState = () => {
  const [selectedTypes, setSelectedTypes] = useState<TypeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const { toast } = useToast();

  const handleTypeSelect = (type: QuestionType) => {
    if (!selectedTypes.find(entry => entry.type.id === type.id)) {
      setSelectedTypes(prev => [...prev, { 
        type, 
        passages: [{ id: crypto.randomUUID(), text: "", result: "" }] 
      }]);
    }
  };

  const handleRemoveType = (typeId: string) => {
    setSelectedTypes(prev => prev.filter(entry => entry.type.id !== typeId));
  };

  const handleAddPassage = (typeId: string) => {
    setSelectedTypes(prev => prev.map(entry => 
      entry.type.id === typeId 
        ? { ...entry, passages: [...entry.passages, { id: crypto.randomUUID(), text: "", result: "" }] }
        : entry
    ));
  };

  const handleRemovePassage = (typeId: string, passageId: string) => {
    setSelectedTypes(prev => prev.map(entry => 
      entry.type.id === typeId 
        ? { ...entry, passages: entry.passages.filter(p => p.id !== passageId) }
        : entry
    ));
  };

  const handleTextChange = (typeId: string, passageId: string, newText: string) => {
    setSelectedTypes(prev => prev.map(entry => 
      entry.type.id === typeId 
        ? {
            ...entry,
            passages: entry.passages.map(p => 
              p.id === passageId ? { ...p, text: newText } : p
            )
          }
        : entry
    ));
  };

  const handlePasteValues = (typeId: string, passageId: string, values: string[]) => {
    setSelectedTypes(prev => {
      const updatedTypes = [...prev];
      const typeIndex = updatedTypes.findIndex(t => t.type.id === typeId);
      
      if (typeIndex === -1) return prev;
      
      const passageIndex = updatedTypes[typeIndex].passages.findIndex(p => p.id === passageId);
      if (passageIndex === -1) return prev;
      
      updatedTypes[typeIndex].passages[passageIndex].text = values[0];
      
      const remainingValues = values.slice(1);
      const newPassages = remainingValues.map(value => ({
        id: crypto.randomUUID(),
        text: value,
        result: ""
      }));
      
      updatedTypes[typeIndex].passages.splice(passageIndex + 1, 0, ...newPassages);
      
      return updatedTypes;
    });
  };

  return {
    selectedTypes,
    isLoading,
    setIsLoading,
    progress,
    setProgress,
    handleTypeSelect,
    handleRemoveType,
    handleAddPassage,
    handleRemovePassage,
    handleTextChange,
    handlePasteValues,
    toast
  };
};