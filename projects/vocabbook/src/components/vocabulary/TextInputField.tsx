import React, { KeyboardEvent } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface TextInputFieldProps {
  id: string;
  value: string;
  onChange: (id: string, value: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>, id: string) => void;
  onPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>, id: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  isLast: boolean;
  showRemove: boolean;
}

export const TextInputField: React.FC<TextInputFieldProps> = ({
  id,
  value,
  onChange,
  onKeyDown,
  onPaste,
  onAdd,
  onRemove,
  isLast,
  showRemove,
}) => {
  return (
    <div className="flex gap-2">
      <Textarea
        value={value}
        onChange={(e) => onChange(id, e.target.value)}
        onKeyDown={(e) => onKeyDown(e, id)}
        onPaste={(e) => onPaste(e, id)}
        placeholder="단어 데이터를 여기에 붙여넣으세요..."
        className="min-h-[100px] flex-1"
      />
      <div className="flex flex-col gap-2">
        {isLast && (
          <Button
            onClick={onAdd}
            variant="outline"
            size="icon"
            className="flex-shrink-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
        {showRemove && (
          <Button
            onClick={() => onRemove(id)}
            variant="destructive"
            size="icon"
            className="flex-shrink-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};