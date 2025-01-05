import { Textarea } from "@/components/ui/textarea";
import { KeyboardEvent, ClipboardEvent } from "react";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onEnterPress?: () => void;
  onPaste?: (values: string[]) => void;
}

export const TextInput = ({ value, onChange, onEnterPress, onPaste }: TextInputProps) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEnterPress?.();
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
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#0EA5E9]/50 via-[#38BDF8]/25 to-[#7DD3FC]/50 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200" />
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Enter your text here..."
          className="input-text h-[80px] w-full bg-white/90 focus:border-[#0EA5E9] transition-all duration-300 rounded-lg text-foreground placeholder:text-[#38BDF8]/60 resize-none relative backdrop-blur-sm text-sm"
        />
      </div>
    </div>
  );
};