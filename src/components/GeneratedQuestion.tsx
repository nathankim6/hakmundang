import { Card, CardContent } from "@/components/ui/card";

interface GeneratedQuestionProps {
  content: string;
  questionNumber: number;
  originalText?: string;
}

export const GeneratedQuestion = ({ content, questionNumber, originalText }: GeneratedQuestionProps) => {
  const parts = content.split('[정답]');
  let questionPart = parts[0].trim();
  const answerPart = parts.length > 1 ? '[정답]' + parts.slice(1).join('[정답]').trim() : '';

  // Remove "[OUTPUT]" from the question part if it exists
  questionPart = questionPart.replace('[OUTPUT]', '').trim();

  // Check if this is a True/False question by looking for "(T/F)" in the content
  const isTrueFalse = questionPart.includes('(T/F)');

  // For True/False questions, we need to handle the format differently
  if (isTrueFalse) {
    const lines = questionPart.split('\n');
    const title = lines[0]; // "다음 글의 내용으로 옳고 그름(T/F)을 고르시오."
    const originalTextPart = lines[1]; // The original text
    const questions = lines.slice(2).join('\n'); // The questions

    return (
      <div className="mb-8">
        <div className="prose max-w-none">
          <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <span className="bg-gradient-to-r from-[#0EA5E9] to-[#403E43] bg-clip-text text-transparent">
              문제 {questionNumber}
            </span>
          </h3>
          
          <div className="space-y-4">
            <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F1F0FB] p-4 rounded-lg border border-[#D3E4FD]/30">
              {title}
            </div>

            <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F8F7FF] p-4 rounded-lg border border-[#0EA5E9]/20">
              {originalTextPart}
            </div>
            
            <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F8F7FF] p-4 rounded-lg border border-[#0EA5E9]/20">
              {questions}
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
  }

  // For other question types, keep the existing format
  return (
    <div className="mb-8">
      <div className="prose max-w-none">
        <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <span className="bg-gradient-to-r from-[#0EA5E9] to-[#403E43] bg-clip-text text-transparent">
            문제 {questionNumber}
          </span>
        </h3>
        
        <div className="space-y-4">
          {/* Only show originalText if it's not a weekend clinic question */}
          {originalText && (
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