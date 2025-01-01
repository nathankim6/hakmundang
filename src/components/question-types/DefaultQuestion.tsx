import { Card, CardContent } from "@/components/ui/card";

interface DefaultQuestionProps {
  questionNumber: number;
  questionPart: string;
  answerPart: string;
}

export const DefaultQuestion = ({
  questionNumber,
  questionPart,
  answerPart
}: DefaultQuestionProps) => {
  // Split answer part into answer number and explanation if both exist
  const [answer, explanation] = answerPart.split('[해설]').map(part => part.trim());

  return (
    <div className="mb-8">
      <div className="prose max-w-none">
        <h3 className="text-2xl font-bold mb-2">
          <span className="bg-gradient-to-r from-[#0EA5E9] to-[#403E43] bg-clip-text text-transparent">
            문제 {questionNumber}
          </span>
        </h3>
        
        <div className="space-y-4">
          <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F1F0FB] p-4 rounded-lg border border-[#D3E4FD]/30">
            {questionPart}
          </div>
          
          {answerPart && (
            <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F8F7FF] p-4 rounded-lg border border-[#0EA5E9]/20">
              {answer}
              {explanation && (
                <>
                  <br />
                  [해설] {explanation}
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 h-px bg-gradient-to-r from-transparent via-[#0EA5E9]/30 to-transparent" />
    </div>
  );
};