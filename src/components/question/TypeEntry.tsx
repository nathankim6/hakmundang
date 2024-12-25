import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { TextInput } from "../TextInput";
import { QuestionType } from "@/types/question";

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
}

export const TypeEntry = ({
  type,
  passages,
  onAddPassage,
  onRemovePassage,
  onTextChange,
  onPasteValues,
}: TypeEntryProps) => {
  return (
    <div className="space-y-6 p-6 rounded-lg border-2 border-[#9b87f5]/20 relative bg-[#F8F7FF]">
      <h3 className="text-xl font-bold text-[#7E69AB]">{type.name}</h3>
      
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
              onEnterPress={() => onAddPassage(type.id)}
              onPaste={(values) => onPasteValues(type.id, passage.id, values)}
            />
          </div>
        ))}
      </div>
      
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
    </div>
  );
};