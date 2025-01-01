import { QuestionType } from "@/types/question";
import { getQuestionTypes } from "@/lib/claude";
import { useToast } from "./ui/use-toast";
import { TypeCategory } from "./type-selector/TypeCategory";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    type.id.match(/^(orderWritingBasic|orderWritingAdvanced|summaryBlank|topicWriting)$/)
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

  const renderTypeButton = (type: QuestionType, isSelected: boolean) => {
    const button = (
      <button
        key={type.id}
        onClick={() => handleTypeClick(type, isSelected)}
        className={`type-button group relative w-full text-left transition-all duration-300 hover:scale-[1.02] ${
          !hasAccess 
            ? "opacity-50 cursor-not-allowed hover:scale-100"
            : isSelected 
              ? "selected bg-[#0EA5E9]/20 text-[#1A1F2C] font-semibold shadow-md" 
              : "hover:bg-[#D3E4FD] hover:text-[#0EA5E9]"
        }`}
      >
        {type.name}
      </button>
    );

    if (type.id === "topicWriting") {
      return (
        <Tooltip key={type.id}>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent side="right" className="w-[800px] p-0">
            <img 
              src="/lovable-uploads/3498b1d4-41af-4eef-9b32-d68fbcc513b7.png" 
              alt="주제문 영작 예시" 
              className="rounded-lg"
            />
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
  };

  return (
    <div className="space-y-8">
      <TypeCategory
        title="수능형"
        types={readingTypes}
        selectedTypes={selectedTypes}
        hasAccess={hasAccess}
        onTypeClick={handleTypeClick}
        renderTypeButton={renderTypeButton}
      />
      <TypeCategory
        title="내신형"
        types={schoolTypes}
        selectedTypes={selectedTypes}
        hasAccess={hasAccess}
        onTypeClick={handleTypeClick}
        renderTypeButton={renderTypeButton}
      />
      <TypeCategory
        title="서답형"
        types={writingTypes}
        selectedTypes={selectedTypes}
        hasAccess={hasAccess}
        onTypeClick={handleTypeClick}
        renderTypeButton={renderTypeButton}
      />
      <TypeCategory
        title="옳은영어 콘텐츠"
        types={contentTypes}
        selectedTypes={selectedTypes}
        hasAccess={hasAccess}
        onTypeClick={handleTypeClick}
        renderTypeButton={renderTypeButton}
      />
    </div>
  );
};