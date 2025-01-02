import { Button } from "@/components/ui/button";
import { Plus, Trash2, X } from "lucide-react";
import { TextInput } from "../TextInput";
import { QuestionType } from "@/types/question";
import { useToast } from "@/components/ui/use-toast";
import { SentenceMatcher } from "../SentenceMatcher";

interface PassageEntry {
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

  const handleDeleteAll = () => {
    onRemoveType(type.id);
    
    toast({
      title: "문제 유형 삭제",
      description: "선택한 문제 유형이 삭제되었습니다.",
    });
  };

  // Check if this is the sentence matcher type
  const isSentenceMatcher = type.id === "sentenceSplitter";
  
  // Check if this is one of the special vocabulary types
  const isSpecialVocabType = [
    "sungnamVocab1",
    "sungnamVocab2",
    "sungnamVocab3"
  ].includes(type.id);

  // Modified paste handler for special vocabulary types
  const handlePaste = (typeId: string, passageId: string, values: string[]) => {
    if (isSpecialVocabType) {
      // For special vocab types, join all values with newlines
      const combinedText = values.join('\n');
      onTextChange(typeId, passageId, combinedText);
    } else {
      // For other types, use the original paste behavior
      onPasteValues(typeId, passageId, values);
    }
  };

  if (isSentenceMatcher) {
    return (
      <div className="space-y-6 p-6 rounded-lg border-2 border-[#9b87f5]/20 relative bg-[#F8F7FF]">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-[#7E69AB]">{type.name}</h3>
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
    <div className="space-y-6 p-6 rounded-lg border-2 border-[#9b87f5]/20 relative bg-[#F8F7FF]">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-[#7E69AB]">{type.name}</h3>
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
      
      <div className="space-y-4">
        {passages.map((passage, index) => (
          <div key={passage.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">지문 {index + 1}</h4>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemovePassage(type.id, passage.id)}
                className="text-destructive hover:text-destructive/80"
                disabled={passages.length === 1}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            
            <TextInput 
              value={passage.text} 
              onChange={(text) => onTextChange(type.id, passage.id, text)}
              onEnterPress={() => !isSpecialVocabType && onAddPassage(type.id)}
              onPaste={(values) => handlePaste(type.id, passage.id, values)}
            />
          </div>
        ))}
      </div>
      
      {!isSpecialVocabType && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onAddPassage(type.id)}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            지문 추가하기
          </Button>
        </div>
      )}
    </div>
  );
};