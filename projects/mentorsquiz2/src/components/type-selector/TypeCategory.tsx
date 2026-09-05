import { QuestionType } from "@/types/question";
import { CategoryTitle } from "./CategoryTitle";
import { TypeButton } from "./TypeButton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { ChevronDown, Folder, FolderOpen, LayoutGrid, Settings, Server, Code } from "lucide-react";
interface TypeCategoryProps {
  title: string;
  types: QuestionType[];
  selectedTypes: QuestionType[];
  hasAccess: boolean;
  onTypeClick: (type: QuestionType, isSelected: boolean) => void;
}
const getSchoolLogo = (typeId: string): string[] => {
  if (typeId.startsWith('sungnamVocab')) {
    return ['/lovable-uploads/21a8d8a1-8477-4ccd-b993-e77b9fef8e2b.png', '/lovable-uploads/f65366ac-b1b1-445b-b193-e2f14c9dfd82.png'];
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

// Map category titles to appropriate icons
const getCategoryIcon = (title: string) => {
  switch (title) {
    case "수능형":
      return <Server className="w-5 h-5 program-menu-icon" />;
    case "내신형":
      return <LayoutGrid className="w-5 h-5 program-menu-icon" />;
    case "서답형":
      return <Code className="w-5 h-5 program-menu-icon" />;
    case "워크북 제작":
      return <Settings className="w-5 h-5 program-menu-icon" />;
    default:
      return <Folder className="w-5 h-5 program-menu-icon" />;
  }
};
export const TypeCategory = ({
  title,
  types,
  selectedTypes,
  hasAccess,
  onTypeClick
}: TypeCategoryProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const categoryIcon = getCategoryIcon(title);
  const isHovered = false;
  return <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2 mb-4 bg-white rounded-lg shadow-sm border border-gray-100">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-t-lg text-left hover:bg-gray-50 text-base">
        <div className="flex items-center gap-2">
          <div className="text-teal-500 flex items-center justify-center">
            {categoryIcon}
          </div>
          <CategoryTitle>{title}</CategoryTitle>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </CollapsibleTrigger>
      
      <CollapsibleContent className="space-y-1 px-2 pb-3">
        {types.map(type => {
        const isSelected = selectedTypes.some(t => t.id === type.id);
        const logos = getSchoolLogo(type.id);
        return <TypeButton key={type.id} type={type} isSelected={isSelected} hasAccess={hasAccess} onClick={() => onTypeClick(type, isSelected)} logos={logos} />;
      })}
      </CollapsibleContent>
    </Collapsible>;
};