import { QuestionType } from "@/types/question";
import { CategoryTitle } from "./CategoryTitle";
import { TypeButton } from "./TypeButton";

interface TypeCategoryProps {
  title: string;
  types: QuestionType[];
  selectedTypes: QuestionType[];
  hasAccess: boolean;
  onTypeClick: (type: QuestionType, isSelected: boolean) => void;
}

export const TypeCategory = ({ 
  title, 
  types, 
  selectedTypes, 
  hasAccess, 
  onTypeClick 
}: TypeCategoryProps) => {
  return (
    <div className="space-y-2">
      <CategoryTitle>{title}</CategoryTitle>
      {types.map((type) => {
        const isSelected = selectedTypes.some(t => t.id === type.id);
        return (
          <TypeButton
            key={type.id}
            type={type}
            isSelected={isSelected}
            hasAccess={hasAccess}
            onClick={() => onTypeClick(type, isSelected)}
          />
        );
      })}
    </div>
  );
};