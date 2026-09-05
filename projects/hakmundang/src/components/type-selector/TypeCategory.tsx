import { QuestionType } from "@/types/question";
import { CategoryTitle } from "./CategoryTitle";
import { TypeButton } from "./TypeButton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface TypeCategoryProps {
  title: string;
  types: QuestionType[];
  selectedTypes: QuestionType[];
  hasAccess: boolean;
  onTypeClick: (type: QuestionType, isSelected: boolean) => void;
}

const getSchoolLogo = (typeId: string): string[] => {
  if (typeId.startsWith('sungnamVocab')) {
    return [
      '/lovable-uploads/21a8d8a1-8477-4ccd-b993-e77b9fef8e2b.png',
      '/lovable-uploads/f65366ac-b1b1-445b-b193-e2f14c9dfd82.png'
    ];
  }
  if (typeId.startsWith('sung')) {
    return ['/lovable-uploads/21a8d8a1-8477-4ccd-b993-e77b9fef8e2b.png'];
  }
  if (typeId.startsWith('yeong')) {
    return ['/lovable-uploads/9a8b2f51-6d3e-473c-b09c-528ecc1f6613.png'];
  }
  if (typeId.startsWith('dang')) {
    return ['/lovable-uploads/31f3e37e-b83a-4053-b1db-3b652acfb6c4.png'];
  }
  return [];
};

export const TypeCategory = ({ 
  title, 
  types, 
  selectedTypes, 
  hasAccess, 
  onTypeClick 
}: TypeCategoryProps) => {
  const [isOpen, setIsOpen] = useState(true); // Changed from false to true

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="space-y-2 bg-white/50 rounded-lg p-2 transition-all duration-200 hover:bg-white/60"
    >
      <CollapsibleTrigger className="flex items-center justify-between w-full group">
        <CategoryTitle>{title}</CategoryTitle>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 text-gray-500 ${isOpen ? 'transform rotate-180' : ''}`} />
      </CollapsibleTrigger>
      
      <CollapsibleContent className="space-y-2">
        {types.map((type) => {
          const isSelected = selectedTypes.some(t => t.id === type.id);
          const logos = getSchoolLogo(type.id);
          return (
            <TypeButton
              key={type.id}
              type={type}
              isSelected={isSelected}
              hasAccess={hasAccess}
              onClick={() => onTypeClick(type, isSelected)}
              logos={logos}
            />
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
};