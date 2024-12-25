import { QuestionType } from "@/types/question";
import { TypeCategory } from "./type-selector/TypeCategory";
import { ScrollArea } from "./ui/scroll-area";

const CATEGORIES = [
  {
    title: "독해 유형",
    types: [
      { id: "blank", name: "빈칸 추론" },
      { id: "blankMultiple", name: "빈칸 2개" },
      { id: "insert", name: "문장 삽입" },
      { id: "order", name: "문단 순서" },
      { id: "irrelevant", name: "문장 삭제" },
      { id: "summary", name: "요약문" },
    ]
  },
  {
    title: "학교 유형",
    types: [
      { id: "mainPoint", name: "요지/주제" },
      { id: "purpose", name: "목적" },
      { id: "claim", name: "주장" },
      { id: "topic", name: "제목" },
      { id: "mood", name: "분위기/심경" },
      { id: "vocabulary", name: "어휘" },
    ]
  },
  {
    title: "서술형 유형",
    types: [
      { id: "implication", name: "시사점" },
      { id: "title", name: "제목" },
    ]
  }
];

interface TypeSelectorProps {
  selectedTypes: QuestionType[];
  onSelect: (type: QuestionType) => void;
  onRemove: (typeId: string) => void;
}

export const TypeSelector = ({ selectedTypes, onSelect, onRemove }: TypeSelectorProps) => {
  const handleTypeClick = (type: QuestionType, isSelected: boolean) => {
    if (isSelected) {
      onRemove(type.id);
    } else {
      onSelect(type);
    }
  };

  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="space-y-6 pr-4">
        {CATEGORIES.map((category) => (
          <TypeCategory
            key={category.title}
            title={category.title}
            types={category.types}
            selectedTypes={selectedTypes}
            hasAccess={true}
            onTypeClick={handleTypeClick}
          />
        ))}
      </div>
    </ScrollArea>
  );
};