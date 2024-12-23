import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type QuestionType = "객관식" | "주관식" | "OX퀴즈";

interface TypeSelectorProps {
  selectedType: QuestionType;
  onTypeSelect: (type: QuestionType) => void;
}

export const TypeSelector = ({ selectedType, onTypeSelect }: TypeSelectorProps) => {
  const types: QuestionType[] = ["객관식", "주관식", "OX퀴즈"];

  return (
    <div className="flex gap-2">
      {types.map((type) => (
        <Button
          key={type}
          onClick={() => onTypeSelect(type)}
          variant={selectedType === type ? "default" : "outline"}
          className="flex-1"
        >
          {type}
        </Button>
      ))}
    </div>
  );
};