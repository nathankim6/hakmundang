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
  // Split the content into sections
  const parts = questionPart.split('[문제]');
  const originalText = parts[0].trim();
  const questionText = parts[1]?.trim() || '';

  // Extract summary text if present
  const summaryMatch = questionText.match(/\[요약문\]([\s\S]*?)(?=\[|$)/);
  const summaryText = summaryMatch ? summaryMatch[1].trim() : '';

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
          {/* Original Text Section */}
          <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F1F0FB] p-4 rounded-lg border border-[#D3E4FD]/30">
            {originalText}
          </div>

          {/* Question Section */}
          <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F1F0FB] p-4 rounded-lg border border-[#D3E4FD]/30">
            <div className="font-semibold text-[#403E43] mb-2">
              [문제]
            </div>
            <div className="mb-4">다음 글의 내용을 아래와 같이 요약하고자 한다. 빈칸 (A), (B), (C)에 들어갈 말로 가장 적절한 것을 본문에서 찾아서 그대로 쓰시오.</div>
            
            <div className="font-semibold text-[#403E43] mb-2">
              [요약문]
            </div>
            <div className="mb-4">{summaryText}</div>
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