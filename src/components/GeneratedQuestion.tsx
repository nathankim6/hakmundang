import { Card, CardContent } from "@/components/ui/card";

interface GeneratedQuestionProps {
  content: string;
  questionNumber: number;
}

export const GeneratedQuestion = ({ content, questionNumber }: GeneratedQuestionProps) => {
  // Split content into question and answer parts
  const parts = content.split('[정답]');
  const questionPart = parts[0].trim();
  const answerPart = parts.length > 1 ? '[정답]' + parts.slice(1).join('[정답]').trim() : '';

  return (
    <div className="mb-8">
      <div className="prose max-w-none">
        <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <span className="bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] bg-clip-text text-transparent">
            문제 {questionNumber}
          </span>
        </h3>
        
        <div className="space-y-4">
          {/* Question section with soft purple background */}
          <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#E5DEFF] p-4 rounded-lg border border-[#9b87f5]/20">
            {questionPart}
          </div>
          
          {/* Answer section with soft gray background */}
          {answerPart && (
            <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F1F0FB] p-4 rounded-lg border border-[#9b87f5]/20">
              {answerPart}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 h-px bg-gradient-to-r from-transparent via-[#9b87f5]/30 to-transparent" />
    </div>
  );
};