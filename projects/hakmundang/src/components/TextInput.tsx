import { Textarea } from "@/components/ui/textarea";
import { KeyboardEvent, ClipboardEvent } from "react";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onEnterPress?: () => void;
  onPaste?: (values: string[]) => void;
  isSpecialVocabType?: boolean;
  placeholder?: string;
}

export const TextInput = ({ 
  value, 
  onChange, 
  onEnterPress, 
  onPaste, 
  isSpecialVocabType,
  placeholder = "Enter your text here..." 
}: TextInputProps) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      if (onEnterPress) {
        onEnterPress();
      }
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    
    // Split by tabs and newlines to handle Excel paste
    const values = text.split(/[\t\n]+/).filter(Boolean);
    
    if (values.length > 1 && onPaste) {
      onPaste(values);
    } else {
      onChange(text);
    }
  };

  return (
    <div className="space-y-1">
      <div className="relative group gradient-border">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 via-primary/25 to-primary/50 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200" />
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder}
          className="input-text h-[80px] w-full bg-white/90 focus:border-primary transition-all duration-300 rounded-lg text-foreground placeholder:text-muted-foreground resize-none relative backdrop-blur-sm text-sm"
        />
        {isSpecialVocabType && (
          <p className="text-xs text-muted-foreground mt-1">
            Tip: You can use square brackets [like this] to mark specific parts of the text for implication questions.
          </p>
        )}
      </div>
    </div>
  );
};