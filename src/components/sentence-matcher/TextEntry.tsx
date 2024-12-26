import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface TextEntryProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onEnterPress?: () => void;
  onDelete?: () => void;
  placeholder?: string;
}

export const TextEntry = ({ 
  label, 
  value, 
  onChange, 
  onEnterPress, 
  onDelete,
  placeholder 
}: TextEntryProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && onEnterPress) {
      e.preventDefault();
      onEnterPress();
    }
  };

  return (
    <div className="relative font-[Gulim]">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium">{label}</label>
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-8 w-8 text-destructive hover:text-destructive/80"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <textarea
        className="w-full h-32 p-2 border rounded font-[Gulim]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
    </div>
  );
};