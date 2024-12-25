import { QuestionType } from "@/types/question";
import { getQuestionTypes } from "@/lib/claude";
import { useToast } from "./ui/use-toast";
import { TypeCategory } from "./type-selector/TypeCategory";

interface TypeSelectorProps {
  selectedTypes: QuestionType[];
  onSelect: (type: QuestionType) => void;
  onRemove: (typeId: string) => void;
}

export const TypeSelector = ({ selectedTypes, onSelect, onRemove }: TypeSelectorProps) => {
  const types = getQuestionTypes();
  const readingTypes = types.slice(0, 14);
  const schoolTypes = types.slice(14, 19);
  const contentTypes = types.slice(19);
  
  const { toast } = useToast();
  const hasAccess = localStorage.getItem("hasAccess") === "true";

  const handleTypeClick = (type: QuestionType, isSelected: boolean) => {
    if (!hasAccess) {
      toast({
        title: "접근 제한",
        description: "문제 유형을 선택하려면 로그인이 필요합니다.",
        variant: "destructive",
      });
      return;
    }
    
    isSelected ? onRemove(type.id) : onSelect(type);
  };

  return (
    <div className="space-y-8">
      <TypeCategory
        title="수능형"
        types={readingTypes}
        selectedTypes={selectedTypes}
        hasAccess={hasAccess}
        onTypeClick={handleTypeClick}
      />
      <TypeCategory
        title="내신형"
        types={schoolTypes}
        selectedTypes={selectedTypes}
        hasAccess={hasAccess}
        onTypeClick={handleTypeClick}
      />
      <TypeCategory
        title="옳은영어 콘텐츠"
        types={contentTypes}
        selectedTypes={selectedTypes}
        hasAccess={hasAccess}
        onTypeClick={handleTypeClick}
      />
    </div>
  );
};