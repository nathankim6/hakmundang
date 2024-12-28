import { Card, CardContent } from "@/components/ui/card";

interface SummaryBlankQuestionProps {
  questionNumber: number;
  questionPart: string;
  answerPart: string;
}

export const SummaryBlankQuestion = ({
  questionNumber,
  questionPart,
  answerPart
}: SummaryBlankQuestionProps) => {
  // Split the question part into the instruction and summary
  const parts = questionPart.split('[요약문]');
  const instruction = parts[0].trim();
  const summary = parts.length > 1 ? parts[1].trim() : '';

  // Format the answer part
  const formattedAnswer = answerPart
    .split('\n')
    .map(line => line.trim())
    .filter(line => line)
    .join('\n');

  return (
    <div className="mb-8">
      <div className="prose max-w-none">
        <h3 className="text-2xl font-bold mb-4">
          <span className="bg-gradient-to-r from-[#0EA5E9] to-[#403E43] bg-clip-text text-transparent">
            문제 {questionNumber}
          </span>
        </h3>
        
        <div className="space-y-4">
          {/* Question Section */}
          <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F1F0FB] p-4 rounded-lg border border-[#D3E4FD]/30">
            <div className="font-semibold text-[#403E43] mb-2">
              [문제]
            </div>
            <div className="whitespace-pre-wrap mb-4">
              {instruction}
            </div>
            <div className="font-semibold text-[#403E43] mb-2">
              [요약문]
            </div>
            <div className="whitespace-pre-wrap font-medium">
              {summary}
            </div>
          </div>
          
          {/* Answer Section */}
          <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F8F7FF] p-4 rounded-lg border border-[#0EA5E9]/20">
            <div className="font-semibold text-[#403E43] mb-2">
              [정답]
            </div>
            <div className="whitespace-pre-wrap">
              {formattedAnswer}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 h-px bg-gradient-to-r from-transparent via-[#0EA5E9]/30 to-transparent" />
    </div>
  );
};