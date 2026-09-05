
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
    <div className="passage-container group relative">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/95 to-gray-50/90 backdrop-blur-sm border border-gray-200/50 shadow-lg shadow-gray-500/5 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 p-6">
        {/* Subtle background animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/3 via-transparent to-indigo-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Top gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative z-10 flex items-start gap-4">
          <div className="flex-1 passage-input-container">
            <TextInput
              value={passage.text}
              onChange={(value) => onChange(typeId, passage.id, value)}
              onPaste={(values) => onPaste(typeId, passage.id, values)}
              onEnterPress={() => onAddPassage?.(typeId)}
              isSpecialVocabType={isSpecialVocabType}
              placeholder={placeholder}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(typeId, passage.id)}
              className="group/delete relative overflow-hidden rounded-xl bg-gradient-to-br from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 border border-red-200/50 hover:border-red-300/70 text-red-600 hover:text-red-700 transition-all duration-200 p-3 shadow-md hover:shadow-lg hover:shadow-red-500/20 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 opacity-0 group-hover/delete:opacity-100 transition-opacity duration-300" />
              <X className="relative w-4 h-4 group-hover/delete:rotate-90 transition-transform duration-200" />
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
};
