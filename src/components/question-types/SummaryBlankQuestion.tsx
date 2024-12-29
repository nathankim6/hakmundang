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
  // Extract the original text (everything before [문제])
  const originalText = questionPart.split('[문제]')[0].trim();
  
  // Extract the question part (everything between [문제] and [정답])
  const questionMatch = questionPart.match(/\[문제\]([\s\S]*?)(?=\[정답\]|$)/);
  const questionText = questionMatch ? questionMatch[1].trim() : '';
  
  // Extract the answer part (everything after [정답])
  const answerMatch = answerPart.match(/\[정답\]([\s\S]*?)(?=\[해설\]|$)/);
  const answerText = answerMatch ? answerMatch[1].trim() : '';
  
  // Extract the explanation part (everything after [해설])
  const explanationMatch = answerPart.match(/\[해설\]([\s\S]*?)$/);
  const explanationText = explanationMatch ? explanationMatch[1].trim() : '';

  return (
    <div className="mb-8">
      <div className="prose max-w-none">
        <h3 className="text-2xl font-bold mb-4">
          <span className="bg-gradient-to-r from-[#0EA5E9] to-[#403E43] bg-clip-text text-transparent">
            문제 {questionNumber}
          </span>
        </h3>
        
        <div className="space-y-4">
          {/* Original Text Section */}
          <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F1F0FB] p-4 rounded-lg border border-[#D3E4FD]/30">
            {originalText}
          </div>

          {/* Question Section */}
          <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F1F0FB] p-4 rounded-lg border border-[#D3E4FD]/30">
            <div className="font-semibold text-[#403E43] mb-2">
              [문제]
            </div>
            <div className="whitespace-pre-wrap">
              {questionText}
            </div>
          </div>
          
          {/* Answer Section */}
          <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F8F7FF] p-4 rounded-lg border border-[#0EA5E9]/20">
            <div className="font-semibold text-[#403E43] mb-2">
              [정답]
            </div>
            <div className="whitespace-pre-wrap">
              {answerText}
            </div>
          </div>

          {/* Explanation Section */}
          <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F8F7FF] p-4 rounded-lg border border-[#0EA5E9]/20">
            <div className="font-semibold text-[#403E43] mb-2">
              [해설]
            </div>
            <div className="whitespace-pre-wrap">
              {explanationText}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 h-px bg-gradient-to-r from-transparent via-[#0EA5E9]/30 to-transparent" />
    </div>
  );
};