
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Passage } from "./Passage";
import { PassageEntry } from "./TypeEntry";

interface PassageListProps {
  passages: PassageEntry[];
  typeId: string;
  onAddPassage: (typeId: string) => void;
  onRemovePassage: (typeId: string, passageId: string) => void;
  onTextChange: (typeId: string, passageId: string, text: string) => void;
  onPasteValues: (typeId: string, passageId: string, values: string[]) => void;
  isSpecialVocabType?: boolean;
  placeholder?: string;
}

export const PassageList = ({
  passages,
  typeId,
  onAddPassage,
  onRemovePassage,
  onTextChange,
  onPasteValues,
  isSpecialVocabType,
  placeholder = "Enter your text here..."
}: PassageListProps) => {
  // Check if this is one of the special types that need guidance text
  const needsWordListGuidance = typeId === 'collocation';
  const needsDictionaryGuidance = typeId === 'dictionary';
  const needsExampleSentencesGuidance = typeId === 'exampleSentences';
  const needsBracketGuidance = ['implication', 'insert', 'blank', 'blankMultiple'].includes(typeId);
  
  return (
    <div className="space-y-6">
      {needsWordListGuidance && (
        <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
          💡 지문입력 칸에 최소 10개의 단어, 또는 단어쌍을 입력하세요. (ex: haunt - obsess, abundant - scarce)
        </div>
      )}
      {needsDictionaryGuidance && (
        <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
          💡 지문입력 칸에 6개의 단어를 입력하세요.
        </div>
      )}
      {needsExampleSentencesGuidance && (
        <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
          💡 지문입력 칸에 5개의 단어를 입력하세요.
        </div>
      )}
      {needsBracketGuidance && (
        <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-200">
          💡 원하는 부분을 대괄호[square brackets]로 감싸면 해당 부분이 문제로 출제됩니다.
        </div>
      )}
      {passages.map((passage, index) => (
        <div 
          key={passage.id}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <Passage
            passage={passage}
            typeId={typeId}
            onRemove={onRemovePassage}
            onChange={onTextChange}
            onPaste={onPasteValues}
            onAddPassage={onAddPassage}
            isSpecialVocabType={isSpecialVocabType}
            placeholder={placeholder}
          />
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAddPassage(typeId)}
        className="w-full add-passage-button group relative overflow-hidden rounded-xl bg-gradient-to-r from-white to-blue-50/50 border-2 border-blue-200/50 hover:border-blue-300/70 hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 p-4 shadow-md hover:shadow-lg hover:shadow-blue-500/10 hover:scale-[1.02]"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative flex items-center justify-center">
          <Plus className="w-5 h-5 mr-2 text-blue-600 group-hover:rotate-90 transition-transform duration-200" />
          <span className="font-semibold text-blue-700 group-hover:text-indigo-700">지문 추가하기</span>
        </div>
      </Button>
    </div>
  );
};
