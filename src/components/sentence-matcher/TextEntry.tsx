import React from 'react';

interface TextEntryProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onEnterPress?: () => void;
  placeholder?: string;
}

export const TextEntry = ({ label, value, onChange, onEnterPress, placeholder }: TextEntryProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && onEnterPress) {
      e.preventDefault();
      onEnterPress();
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <textarea
        className="w-full h-32 p-2 border rounded"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
    </div>
  );
};