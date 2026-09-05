
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash2, Copy } from 'lucide-react';
import { Passage } from '../hooks/types';

interface PassageCardProps {
  passage: Passage;
  isSelected: boolean;
  onSelect: (passageId: string, isSelected: boolean) => void;
  onEdit: (passage: Passage) => void;
  onCopy: (text: string) => void;
  onDelete?: (id: string) => void; // Make this optional
}

const PassageCard: React.FC<PassageCardProps> = ({
  passage,
  isSelected,
  onSelect,
  onEdit,
  onCopy,
  onDelete
}) => {
  const handleCheckboxChange = (checked: boolean) => {
    onSelect(passage.id, checked);
  };

  return (
    <Card className={`border ${isSelected ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200'} hover:border-indigo-300 transition-colors`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={handleCheckboxChange}
              id={`passage-${passage.id}`}
              className="mt-1"
            />
            <div>
              <div className="font-medium text-sm text-gray-500 mb-1">
                ID: {passage.item_id || passage.id.substring(0, 8)}
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{passage.content}</p>
              </div>

              {passage.translation && (
                <div className="mt-3 text-sm text-gray-600 border-t border-gray-200 pt-2">
                  <p className="whitespace-pre-wrap">{passage.translation}</p>
                </div>
              )}

              {passage.tags && passage.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {passage.tags.map(tag => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => onEdit(passage)}
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => onCopy(passage.content)}
              className="h-8 w-8"
            >
              <Copy className="h-4 w-4" />
            </Button>
            
            {onDelete && (
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => {
                  if (window.confirm('정말 이 지문을 삭제하시겠습니까?')) {
                    onDelete(passage.id);
                  }
                }}
                className="h-8 w-8 text-red-600 hover:text-white hover:bg-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PassageCard;
