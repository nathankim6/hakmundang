import { TextInput } from "@/components/TextInput";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { PassageEntry } from "./TypeEntry";

interface PassageProps {
  passage: PassageEntry;
  typeId: string;
  onRemove: (typeId: string, passageId: string) => void;
  onChange: (typeId: string, passageId: string, text: string) => void;
  onPaste: (typeId: string, passageId: string, values: string[]) => void;
  onAddPassage?: (typeId: string) => void;
  isSpecialVocabType?: boolean;
  placeholder?: string;
}

export const Passage = ({
  passage,
  typeId,
  onRemove,
  onChange,
  onPaste,
  onAddPassage,
  isSpecialVocabType,
  placeholder = "Enter your text here..."
}: PassageProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <TextInput
            value={passage.text}
            onChange={(value) => onChange(typeId, passage.id, value)}
            onPaste={(values) => onPaste(typeId, passage.id, values)}
            onEnterPress={() => onAddPassage?.(typeId)}
            isSpecialVocabType={isSpecialVocabType}
            placeholder={placeholder}
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(typeId, passage.id)}
          className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};