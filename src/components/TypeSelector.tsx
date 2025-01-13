import { QuestionType } from "@/types/question";
import { getQuestionTypes } from "@/lib/claude";
import { useToast } from "./ui/use-toast";
import { TypeCategory } from "./type-selector/TypeCategory";
import { Button } from "./ui/button";
import { ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

interface TypeSelectorProps {
  selectedTypes: QuestionType[];
  onSelect: (type: QuestionType) => void;
  onRemove: (typeId: string) => void;
}

export const TypeSelector = ({ selectedTypes, onSelect, onRemove }: TypeSelectorProps) => {
  const types = getQuestionTypes();
  const [isVocabModalOpen, setIsVocabModalOpen] = useState(false);
  
  // 수능형 (index 0-13)
  const readingTypes = types.filter(type => 
    type.id.match(/^(purpose|mood|claim|implication|mainPoint|topic|title|vocabulary|blank|blankMultiple|irrelevant|order|insert|summary)$/)
  );
  
  // 서답형
  const writingTypes = types.filter(type => 
    type.id.match(/^(summaryBlank|topicWriting)$/)
  );
  
  // 기타 유형
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

  const handleVocabBookClick = () => {
    setIsVocabModalOpen(true);
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
        title="서답형"
        types={writingTypes}
        selectedTypes={selectedTypes}
        hasAccess={hasAccess}
        onTypeClick={handleTypeClick}
      />
      <TypeCategory
        title="기타 유형"
        types={contentTypes}
        selectedTypes={selectedTypes}
        hasAccess={hasAccess}
        onTypeClick={handleTypeClick}
      />
      <div className="pt-4">
        <Button
          onClick={handleVocabBookClick}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
        >
          단어장생성
          <ExternalLink className="w-4 h-4" />
        </Button>
      </div>

      <Dialog open={isVocabModalOpen} onOpenChange={setIsVocabModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>단어장 생성</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6">
            <p className="text-center mb-4">
              아래 링크를 클릭하여 단어장 생성 페이지로 이동하세요.
            </p>
            <Button
              onClick={() => window.open("https://vocabbook-60.lovable.app", "_blank")}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
            >
              단어장 생성 페이지로 이동
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};