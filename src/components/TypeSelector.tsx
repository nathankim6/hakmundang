import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuestionType } from "@/types/question";
import { getQuestionTypes } from "@/lib/claude";

interface TypeSelectorProps {
  selectedType: QuestionType | null;
  onSelect: (type: QuestionType) => void;
}

export const TypeSelector = ({ selectedType, onSelect }: TypeSelectorProps) => {
  const types = getQuestionTypes();

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        문제 유형
      </label>
      <Select
        value={selectedType?.id}
        onValueChange={(value) => {
          const type = types.find((t) => t.id === value);
          if (type) onSelect(type);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="문제 유형을 선택하세요" />
        </SelectTrigger>
        <SelectContent>
          {types.map((type) => (
            <SelectItem key={type.id} value={type.id}>
              {type.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};