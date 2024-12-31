import { Card, CardContent } from "@/components/ui/card";

interface TrueFalseQuestionProps {
  questionNumber: number;
  questionPart: string;
  answerPart: string;
}

export const TrueFalseQuestion = ({ 
  questionNumber, 
  questionPart, 
  answerPart 
}: TrueFalseQuestionProps) => {
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
          {/* Questions Section */}
          <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F8F7FF] p-4 rounded-lg border border-[#0EA5E9]/20">
            <h4 className="font-semibold text-[#403E43] mb-2">다음 글의 내용으로 옳고 그름(T/F)을 고르시오</h4>
            {questions}
          </div>
          
          {/* Answers and Explanations Section */}
          {answerPart && (
            <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F8F7FF] p-4 rounded-lg border border-[#0EA5E9]/20">
              <h4 className="font-semibold text-[#403E43] mb-2">[정답] 및 해설</h4>
              {answerPart}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 h-px bg-gradient-to-r from-transparent via-[#0EA5E9]/30 to-transparent" />
    </div>
  );
};