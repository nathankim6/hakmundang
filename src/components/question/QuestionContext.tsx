import { createContext, useContext } from 'react';
import { TypeEntry, QuestionType } from '@/types/question';

interface QuestionContextType {
  selectedTypes: TypeEntry[];
  isLoading: boolean;
  progress: { current: number; total: number };
  onTypeSelect: (type: QuestionType) => void;
  onRemoveType: (typeId: string) => void;
  onAddPassage: (typeId: string) => void;
  onRemovePassage: (typeId: string, passageId: string) => void;
  onTextChange: (typeId: string, passageId: string, newText: string) => void;
  onPasteValues: (typeId: string, passageId: string, values: string[]) => void;
}

const QuestionContext = createContext<QuestionContextType | undefined>(undefined);

export const useQuestionContext = () => {
  const context = useContext(QuestionContext);
  if (!context) {
    throw new Error('useQuestionContext must be used within a QuestionProvider');
  }
  return context;
};

export const QuestionProvider = QuestionContext.Provider;