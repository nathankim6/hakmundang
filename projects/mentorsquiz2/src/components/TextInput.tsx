import { Textarea } from "@/components/ui/textarea";
import { KeyboardEvent, ClipboardEvent, useRef, useEffect } from "react";

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      // Calculate the exact height needed for the content
      const scrollHeight = textarea.scrollHeight;
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20;
      const paddingTop = parseInt(getComputedStyle(textarea).paddingTop) || 8;
      const paddingBottom = parseInt(getComputedStyle(textarea).paddingBottom) || 8;
      
      // Set minimum height only when empty, otherwise use exact content height
      const minHeight = value.trim() === '' ? 60 : lineHeight + paddingTop + paddingBottom;
      textarea.style.height = Math.max(minHeight, scrollHeight) + 'px';
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);
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
    
    // Function to clean quotes from text
    const cleanQuotes = (str: string) => {
      return str.replace(/^["'`""'']+|["'`""'']+$/g, '').trim();
    };
    
    // Check if the text contains tabs or multiple lines (Excel-like data)
    const hasTabSeparator = text.includes('\t');
    const hasMultipleLines = text.includes('\n');
    
    if (hasTabSeparator || hasMultipleLines) {
      // Split by tabs and newlines to handle Excel paste
      // First split by newlines to handle rows, then by tabs to handle columns
      const rows = text.split('\n');
      const values: string[] = [];
      
      rows.forEach(row => {
        if (row.includes('\t')) {
          // If row has tabs, split by tabs (Excel columns)
          const cells = row.split('\t').map(cleanQuotes).filter(cell => cell.length > 0);
          values.push(...cells);
        } else {
          // Single cell in row
          const cleanedRow = cleanQuotes(row);
          if (cleanedRow.length > 0) {
            values.push(cleanedRow);
          }
        }
      });
      
      if (values.length > 1 && onPaste) {
        onPaste(values);
      } else if (values.length === 1) {
        onChange(values[0]);
      }
    } else {
      // For regular text, treat as single input
      const cleanedText = cleanQuotes(text);
      if (cleanedText.length > 0) {
        onChange(cleanedText);
      }
    }
  };

  return (
    <div className="space-y-1">
      <div className="relative group gradient-border">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 via-primary/25 to-primary/50 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200" />
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            adjustHeight();
          }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder}
          className="input-text min-h-[80px] w-full bg-white/90 focus:border-primary transition-all duration-300 rounded-lg text-foreground placeholder:text-muted-foreground resize-none relative backdrop-blur-sm text-sm overflow-hidden"
          style={{ height: 'auto' }}
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