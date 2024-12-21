import { Textarea } from "@/components/ui/textarea";
import { KeyboardEvent } from "react";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onEnterPress?: () => void;
}

export const TextInput = ({ value, onChange, onEnterPress }: TextInputProps) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEnterPress?.();
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
          placeholder="Enter your text here..."
          className="input-text h-[80px] w-full bg-white/90 focus:border-primary transition-all duration-300 rounded-lg text-foreground placeholder:text-muted-foreground resize-none relative backdrop-blur-sm text-sm"
        />
      </div>
    </div>
  );
};