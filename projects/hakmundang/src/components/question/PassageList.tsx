
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
  return (
    <div className="space-y-4">
      {passages.map((passage) => (
        <Passage
          key={passage.id}
          passage={passage}
          typeId={typeId}
          onRemove={onRemovePassage}
          onChange={onTextChange}
          onPaste={onPasteValues}
          onAddPassage={onAddPassage}
          isSpecialVocabType={isSpecialVocabType}
          placeholder={placeholder}
        />
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAddPassage(typeId)}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Passage
      </Button>
    </div>
  );
};
