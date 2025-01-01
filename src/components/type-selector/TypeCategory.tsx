import { QuestionType } from "@/types/question";
import { CategoryTitle } from "./CategoryTitle";

interface TypeCategoryProps {
  title: string;
  types: QuestionType[];
  selectedTypes: QuestionType[];
  hasAccess: boolean;
  onTypeClick: (type: QuestionType, isSelected: boolean) => void;
  renderTypeButton: (type: QuestionType, isSelected: boolean) => React.ReactNode;
}

export const TypeCategory = ({ 
  title, 
  types, 
  selectedTypes, 
  hasAccess,
  onTypeClick,
  renderTypeButton
}: TypeCategoryProps) => {
  return (
    <div className="space-y-2">
      <CategoryTitle>{title}</CategoryTitle>
      {types.map((type) => {
        const isSelected = selectedTypes.some(t => t.id === type.id);
        return renderTypeButton(type, isSelected);
      })}
    </div>
  );
};