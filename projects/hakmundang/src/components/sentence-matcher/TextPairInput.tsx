import { TextEntry } from "./TextEntry";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface TextPairInputProps {
  id: string;
  english: string;
  korean: string;
  showDelete: boolean;
  onUpdateText: (id: string, field: 'english' | 'korean', value: string) => void;
  onDeletePair: (id: string) => void;
  onAddNewPair: () => void;
}

export const TextPairInput = ({
  id,
  english,
  korean,
  showDelete,
  onUpdateText,
  onDeletePair,
  onAddNewPair,
}: TextPairInputProps) => {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">영어</label>
        {showDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDeletePair(id)}
            className="text-destructive hover:text-destructive/80"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
      <TextEntry
        value={english}
        onChange={(value) => onUpdateText(id, 'english', value)}
        onEnterPress={onAddNewPair}
        onPaste={(values) => {
          if (values.length > 0) {
            onUpdateText(id, 'english', values[0]);
            if (values.length > 1) {
              onAddNewPair();
            }
          }
        }}
      />
      <label className="text-sm font-medium text-gray-700">한글</label>
      <TextEntry
        value={korean}
        onChange={(value) => onUpdateText(id, 'korean', value)}
        onEnterPress={onAddNewPair}
        onPaste={(values) => {
          if (values.length > 0) {
            onUpdateText(id, 'korean', values[0]);
            if (values.length > 1) {
              onAddNewPair();
            }
          }
        }}
      />
    </div>
  );
};