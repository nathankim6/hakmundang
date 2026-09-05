
import { TextInput } from "@/components/TextInput";
import { Button } from "@/components/ui/button";
import { X, Database } from "lucide-react";
import { PassageEntry } from "./question/TypeEntry";
import { useState } from "react";
import { PassageModal } from "./passage/PassageModal";

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
  const [isPassageModalOpen, setIsPassageModalOpen] = useState(false);
  
  // Set custom placeholder for grammar questions
  const isGrammarType = typeId === "grammar";
  const grammarPlaceholder = "어법문제는 직접 오답을 만들어야 합니다.";
  const finalPlaceholder = isGrammarType ? grammarPlaceholder : placeholder;

  const handleSelectPassage = (content: string) => {
    onChange(typeId, passage.id, content);
    setIsPassageModalOpen(false);
  };
  
  const handleSelectMultiplePassages = (contents: string[]) => {
    if (contents.length === 0) return;
    
    // Use the first content for this passage
    onChange(typeId, passage.id, contents[0]);
    
    // Add additional passages if there are more selected
    if (contents.length > 1 && onAddPassage) {
      // First add enough new passages (n-1) where n is the number of contents
      for (let i = 1; i < contents.length; i++) {
        onAddPassage(typeId);
      }
      
      // Then use onPaste to distribute the remaining contents to the new passages
      onPaste(typeId, passage.id, contents);
    }
    
    setIsPassageModalOpen(false);
  };

  return (
    <div className="passage-container space-y-2">
      <div className="flex items-start gap-2">
        <div className="flex-1 passage-input-container">
          <TextInput
            value={passage.text}
            onChange={(value) => onChange(typeId, passage.id, value)}
            onPaste={(values) => onPaste(typeId, passage.id, values)}
            onEnterPress={() => onAddPassage?.(typeId)}
            isSpecialVocabType={isSpecialVocabType}
            placeholder={finalPlaceholder}
          />
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(typeId, passage.id)}
            className="passage-delete-button"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Passage Modal */}
      {isPassageModalOpen && (
        <PassageModal
          isOpen={isPassageModalOpen}
          onClose={() => setIsPassageModalOpen(false)}
          onSelectPassage={handleSelectPassage}
          onSelectMultiplePassages={handleSelectMultiplePassages}
        />
      )}
    </div>
  );
};
