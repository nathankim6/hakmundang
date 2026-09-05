
import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2"
      >
        <Input
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          className="border-indigo-200 focus:border-indigo-400 shadow-sm"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleTitleSubmit();
            if (e.key === 'Escape') handleCancel();
          }}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleTitleSubmit}
          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 shadow-sm"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 shadow-sm"
        >
          <X className="h-4 w-4" />
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="flex items-center gap-2 group">
      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors">
        {title}
      </h3>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsEditing(true)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-indigo-700 hover:bg-indigo-50"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};

export default EditableTitle;
