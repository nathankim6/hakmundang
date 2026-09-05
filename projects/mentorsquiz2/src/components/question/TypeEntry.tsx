
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { QuestionType } from "@/types/question";
import { useToast } from "@/components/ui/use-toast";
import { SentenceMatcher } from "../SentenceMatcher";
import { PassageList } from "./PassageList";

export interface PassageEntry {
  id: string;
  text: string;
  result: string;
}

interface TypeEntryProps {
  type: QuestionType;
  passages: PassageEntry[];
  onAddPassage: (typeId: string) => void;
  onRemovePassage: (typeId: string, passageId: string) => void;
  onTextChange: (typeId: string, passageId: string, text: string) => void;
  onPasteValues: (typeId: string, passageId: string, values: string[]) => void;
  onRemoveType: (typeId: string) => void;
}

export const TypeEntry = ({
  type,
  passages,
  onAddPassage,
  onRemovePassage,
  onTextChange,
  onPasteValues,
  onRemoveType,
}: TypeEntryProps) => {
  const { toast } = useToast();
  const isSentenceMatcher = type.id === "sentenceSplitter";
  const isSpecialVocabType = ["sungnamVocab1", "sungnamVocab2", "sungnamVocab3"].includes(type.id);
  const isImplicationType = type.id === "implication";
  const isBlankType = type.id === "blank";
  const isBlankMultipleType = type.id === "blankMultiple";
  const isInsertType = type.id === "insert";

  let placeholder = "Enter your text here...";
  if (isImplicationType || isBlankType || isBlankMultipleType) {
    placeholder = "Enter your text here.. use square brackets [] to mark the part you want to turn into " + 
      (isImplicationType ? "implicit meaning" : "blank space");
  } else if (isInsertType) {
    placeholder = "Enter your text here.. use square brackets [] to mark the sentence you want to insert";
  }

  const handleDeleteAll = () => {
    onRemoveType(type.id);
    toast({
      title: "문제 유형 삭제",
      description: "선택한 문제 유형이 삭제되었습니다.",
    });
  };

  if (isSentenceMatcher) {
    return (
      <div className="question-entry-panel relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/90 to-blue-50/80 backdrop-blur-sm border border-white/20 shadow-xl shadow-blue-500/10 p-4 space-y-4 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/15 group">
        {/* Animated background pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Floating gradient orbs */}
        <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-blue-400/30 to-indigo-600/30 rounded-full blur-xl animate-pulse" />
        <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-xl animate-pulse delay-1000" />
        
        <div className="relative z-10 flex items-center justify-between">
          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent flex items-center">
            <span className="question-type-badge mr-3 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-medium rounded-full shadow-lg shadow-blue-500/25">{type.name}</span>
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteAll}
            className="delete-button group/delete hover:bg-red-50 hover:text-red-600 transition-all duration-200 rounded-xl border border-red-100/50 hover:border-red-200 hover:shadow-lg hover:shadow-red-500/10"
          >
            <X className="w-4 h-4 mr-2 group-hover/delete:rotate-90 transition-transform duration-200" />
            <span className="font-medium">전체 삭제</span>
          </Button>
        </div>
        <div className="relative z-10">
          <SentenceMatcher />
        </div>
      </div>
    );
  }

  return (
    <div className="question-entry-panel relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/90 to-blue-50/80 backdrop-blur-sm border border-white/20 shadow-xl shadow-blue-500/10 p-4 space-y-4 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/15 group">
      {/* Animated background pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Floating gradient orbs */}
      <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-blue-400/30 to-indigo-600/30 rounded-full blur-xl animate-pulse" />
      <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-xl animate-pulse delay-1000" />
      
      <div className="question-entry-header relative z-10 flex items-center justify-between">
        <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent flex items-center">
          <span className="question-type-badge mr-3 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-medium rounded-full shadow-lg shadow-blue-500/25">{type.name}</span>
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDeleteAll}
          className="delete-button group/delete hover:bg-red-50 hover:text-red-600 transition-all duration-200 rounded-xl border border-red-100/50 hover:border-red-200 hover:shadow-lg hover:shadow-red-500/10"
        >
          <X className="w-4 h-4 mr-2 group-hover/delete:rotate-90 transition-transform duration-200" />
          <span className="font-medium">전체 삭제</span>
        </Button>
      </div>
      
      {(type.id === "orderWritingKorean" || type.id === "orderWriting") && (
        <div className="relative z-10 text-sm text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-200">
          💡 문장 2개의 앞뒤를 대괄호"[ ]"로 감싸서 표시하면, 해당 문장들로 문제가 출제됩니다.
        </div>
      )}
      
      <div className="relative z-10">
        <PassageList
          passages={passages}
          typeId={type.id}
          onAddPassage={onAddPassage}
          onRemovePassage={onRemovePassage}
          onTextChange={onTextChange}
          onPasteValues={onPasteValues}
          isSpecialVocabType={isSpecialVocabType}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};
