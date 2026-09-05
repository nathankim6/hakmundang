
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
      <div className="space-y-6 p-6 rounded-lg relative bg-gradient-to-br from-[#FAFAFA] via-[#F5F5F5] to-[#F8F8F8] border-2 border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] backdrop-blur-sm before:absolute before:inset-0 before:rounded-lg before:p-[1px] before:bg-gradient-to-r before:from-gray-200/50 before:via-gray-100/50 before:to-gray-200/50 before:-z-10">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">{type.name}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteAll}
            className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
          >
            <X className="w-4 h-4 mr-1" />
            전체 삭제
          </Button>
        </div>
        <SentenceMatcher />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 rounded-lg relative bg-gradient-to-br from-[#FAFAFA] via-[#F5F5F5] to-[#F8F8F8] border-2 border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] backdrop-blur-sm before:absolute before:inset-0 before:rounded-lg before:p-[1px] before:bg-gradient-to-r before:from-gray-200/50 before:via-gray-100/50 before:to-gray-200/50 before:-z-10 transition-all duration-300 hover:shadow-[0_4px_25px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800">{type.name}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDeleteAll}
          className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
        >
          <X className="w-4 h-4 mr-1" />
          전체 삭제
        </Button>
      </div>
      
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
  );
};
