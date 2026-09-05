import { Textarea } from "@/components/ui/textarea";

interface GrammarQuestionProps {
  questionNumber: number;
  questionPart: string;
  answerPart: string;
  isWorkbook?: boolean;
}

export const GrammarQuestion = ({
  questionNumber,
  questionPart,
  answerPart,
  isWorkbook = false,
}: GrammarQuestionProps) => {
  return (
    <div className="py-6 first:pt-0 last:pb-0 border-b last:border-b-0 border-[#D6BCFA]/30">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-semibold text-[#1A1F2C]">
            {questionNumber}번
          </h3>
        </div>

        <div className="space-y-4 text-[#4A5568]">
          <div className="whitespace-pre-wrap font-mono text-sm">
            {questionPart}
          </div>

          <div className="pt-4 border-t border-[#D6BCFA]/30">
            <p className="font-semibold text-[#1A1F2C] mb-2">정답</p>
            <div className="whitespace-pre-wrap font-mono text-sm">
              {answerPart}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};