import { Card, CardContent } from "@/components/ui/card";

interface GeneratedQuestionProps {
  content: string;
  questionNumber: number;
  originalText?: string;  // Add optional originalText prop
}

export const GeneratedQuestion = ({ content, questionNumber, originalText }: GeneratedQuestionProps) => {
  const parts = content.split('[정답]');
  let questionPart = parts[0].trim();
  const answerPart = parts.length > 1 ? '[정답]' + parts.slice(1).join('[정답]').trim() : '';

  // Remove "[OUTPUT]" from the question part if it exists
  questionPart = questionPart.replace('[OUTPUT]', '').trim();

  // Check if this is a weekend clinic question by looking for the specific sections
  const isWeekendClinic = questionPart.includes('[주제]') && 
                         questionPart.includes('[제목]') && 
                         questionPart.includes('[요약문]') && 
                         questionPart.includes('[동사 워크북]');

  return (
    <div className="mb-8">
      <div className="prose max-w-none">
        <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <span className="bg-gradient-to-r from-[#0EA5E9] to-[#403E43] bg-clip-text text-transparent">
            문제 {questionNumber}
          </span>
        </h3>
        
        <div className="space-y-4">
          {isWeekendClinic && originalText && (
            <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F8F7FF] p-4 rounded-lg border border-[#0EA5E9]/20 mb-4">
              {originalText}
            </div>
          )}
          
          <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F1F0FB] p-4 rounded-lg border border-[#D3E4FD]/30">
            {questionPart}
          </div>
          
          {answerPart && (
            <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F8F7FF] p-4 rounded-lg border border-[#0EA5E9]/20">
              {answerPart}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 h-px bg-gradient-to-r from-transparent via-[#0EA5E9]/30 to-transparent" />
    </div>
  );
};