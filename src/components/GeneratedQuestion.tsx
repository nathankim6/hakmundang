import { Card, CardContent } from "@/components/ui/card";
import { VocabularyListModal } from "./VocabularyListModal";

interface GeneratedQuestionProps {
  content: string;
  questionNumber: number;
  originalText?: string;
}

export const GeneratedQuestion = ({ content, questionNumber, originalText }: GeneratedQuestionProps) => {
  const parts = content.split('[정답]');
  let questionPart = parts[0].trim();
  const answerPart = parts.length > 1 ? '[정답]' + parts.slice(1).join('').trim() : '';

  questionPart = questionPart.replace('[OUTPUT]', '').trim();

  const isTrueFalse = questionPart.includes('(T/F)');
  const isSynonymAntonym = content.includes('| 표제어 |') || content.includes('|표제어|');

  if (isTrueFalse) {
    const lines = questionPart.split('\n');
    const title = lines[0];
    const questions = lines.slice(1).join('\n');

    return (
      <div className="mb-8">
        <div className="prose max-w-none">
          <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <span className="bg-gradient-to-r from-[#0EA5E9] to-[#403E43] bg-clip-text text-transparent">
              문제 {questionNumber}
            </span>
          </h3>
          
          <div className="space-y-4">
            <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F8F7FF] p-4 rounded-lg border border-[#0EA5E9]/20">
              <h4 className="font-semibold text-[#403E43] mb-2">다음 글의 내용으로 옳고 그름(T/F)을 고르시오</h4>
              {questions}
            </div>
            
            {answerPart && (
              <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F8F7FF] p-4 rounded-lg border border-[#0EA5E9]/20">
                <h4 className="font-semibold text-[#403E43] mb-2">정답 및 해설</h4>
                {answerPart}
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 h-px bg-gradient-to-r from-transparent via-[#0EA5E9]/30 to-transparent" />
      </div>
    );
  }

  if (isSynonymAntonym) {
    return (
      <div className="mb-8">
        <div className="prose max-w-none">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold flex items-center gap-2 m-0">
              <span className="bg-gradient-to-r from-[#0EA5E9] to-[#403E43] bg-clip-text text-transparent">
                문제 {questionNumber}
              </span>
            </h3>
            <VocabularyListModal content={content} />
          </div>
          
          <div className="space-y-4">
            <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F1F0FB] p-4 rounded-lg border border-[#D3E4FD]/30">
              {content}
            </div>
          </div>
        </div>
        
        <div className="mt-6 h-px bg-gradient-to-r from-transparent via-[#0EA5E9]/30 to-transparent" />
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="prose max-w-none">
        <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <span className="bg-gradient-to-r from-[#0EA5E9] to-[#403E43] bg-clip-text text-transparent">
            문제 {questionNumber}
          </span>
        </h3>
        
        <div className="space-y-4">
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
