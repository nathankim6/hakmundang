
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Pencil } from 'lucide-react';

interface EditableTitleProps {
  title: string;
  onTitleUpdate: (newTitle: string) => void;
}

const EditableTitle = ({ title, onTitleUpdate }: EditableTitleProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);

  const handleTitleSubmit = () => {
    if (editedTitle.trim() === '') return;
    onTitleUpdate(editedTitle);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(title);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          className="border-[#9F9EA1] text-[#403E43]"
          autoFocus
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleTitleSubmit}
          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <h3 className="text-sm font-semibold text-gradient bg-gradient-to-r from-purple-600 to-indigo-600">{title}</h3>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsEditing(true)}
        className="text-[#403E43] hover:text-[#2D2B31] hover:bg-[#F1F1F1]"
      >
        <Pencil className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default EditableTitle;
