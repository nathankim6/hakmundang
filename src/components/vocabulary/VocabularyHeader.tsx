import React, { useState } from 'react';
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2 } from "lucide-react";

interface VocabularyHeaderProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
}

export const VocabularyHeader = ({ title, onTitleChange }: VocabularyHeaderProps) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  return (
    <DialogHeader>
      <DialogTitle className="text-2xl font-bold text-[#1A1F2C] mb-4 flex items-center justify-between">
        {isEditingTitle ? (
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            onBlur={() => setIsEditingTitle(false)}
            autoFocus
            className="max-w-sm"
          />
        ) : (
          <div className="flex items-center gap-2">
            {title}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingTitle(true)}
              className="ml-2"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </DialogTitle>
    </DialogHeader>
  );
};