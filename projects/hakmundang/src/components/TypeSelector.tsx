
import { QuestionType } from "@/types/question";
import { getQuestionTypes } from "@/lib/questionTypes";
import { useToast } from "@/hooks/use-toast";
import { TypeCategory } from "./type-selector/TypeCategory";

interface TypeSelectorProps {
  selectedTypes: QuestionType[];
  onSelect: (type: QuestionType) => void;
  onRemove: (typeId: string) => void;
}

export const TypeSelector = ({ selectedTypes, onSelect, onRemove }: TypeSelectorProps) => {
  const types = getQuestionTypes();
  
  // 수능형 (index 0-14)
  const readingTypes = types.filter(type => 
    type.id.match(/^(purpose|mood|claim|implication|mainPoint|topic|title|contentMismatch|contentMatch|vocabulary|blank|blankMultiple|irrelevant|order|insert|summary|grammar)$/)
  );
  
  // 내신형
  const schoolTypes = types.filter(type => 
    type.id.match(/^(kyungbuk|kyungshin|daeguGirls|daeryun|osung|junghwaGirls|hyehwaGirls)$/)
  );
  
  // 서답형
  const writingTypes = types.filter(type => 
    type.id.match(/^(orderWriting|summaryBlank|topicWriting)$/)
  );
  
  // 워크북 제작
  const workbookTypes = types.filter(type => 
    type.id.match(/^(sentenceSplitter|logicFlow|illustration|grammarWorkbook|vocabWorkbook|orderBlankWorkbook|blankWorkbook)$/)
  );
  
  // 기타 콘텐츠
  const contentTypes = types.filter(type => 
    type.id.match(/^(synonymAntonym|trueOrFalse|weekendClinic|fourKings)$/)
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
    
    if (isSelected) {
      onRemove(type.id);
      console.log(`Removed type: ${type.id}`);
      toast({
        title: "문제 유형 삭제",
        description: `${type.name} 유형이 삭제되었습니다.`,
        duration: 2000,
      });
    } else {
      onSelect(type);
      console.log(`Added type: ${type.id}`);
      toast({
        title: "문제 유형 추가",
        description: `${type.name} 유형이 추가되었습니다.`,
        duration: 2000,
      });
    }
  };

  return (
    <div className="space-y-4">
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
        title="워크북 제작"
        types={workbookTypes}
        selectedTypes={selectedTypes}
        hasAccess={hasAccess}
        onTypeClick={handleTypeClick}
      />
      <TypeCategory
        title="기타 콘텐츠"
        types={contentTypes}
        selectedTypes={selectedTypes}
        hasAccess={hasAccess}
        onTypeClick={handleTypeClick}
      />
    </div>
  );
};
