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
  
  // 수능형 (index 0-13)
  const readingTypes = types.filter(type => 
    type.id.match(/^(purpose|mood|claim|implication|mainPoint|topic|title|vocabulary|blank|blankMultiple|irrelevant|order|insert|summary)$/)
  );
  
  // 내신형
  const schoolTypes = types.filter(type => 
    type.id.match(/^(sungnamVocab|sungExternal|sungReference|yeongExternal|dangDict)/)
  );
  
  // 서답형
  const writingTypes = types.filter(type => 
    type.id.match(/^(orderWriting|conditionWriting|summaryBlank|topicWriting)$/)
  );
  
  // 옳은영어 콘텐츠
  const contentTypes = types.filter(type => 
    type.id.match(/^(synonymAntonym|trueOrFalse|logicFlow|sentenceSplitter|weekendClinic)$/)
  );
  
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
        title="서답형"
        types={writingTypes}
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