import { Button } from "@/components/ui/button";
import { QuestionData } from "./types";

interface VocabularyListModalProps {
  questions: QuestionData[];
}

export const VocabularyListModal = ({ questions }: VocabularyListModalProps) => {
  return (
    <Button 
      variant="outline" 
      className="w-full bg-white hover:bg-gray-50"
      onClick={() => {
        // Handle click event
        console.log("Opening vocabulary list modal", questions);
      }}
    >
      단어장 보기
    </Button>
  );
};