import { Card, CardContent } from "@/components/ui/card";

interface GeneratedQuestionProps {
  content: string;
  questionNumber: number;
}

export const GeneratedQuestion = ({ content, questionNumber }: GeneratedQuestionProps) => {
  // Split content into question and answer parts
  const parts = content.split('[정답]');
  const questionPart = parts[0].trim();
  const answerPart = parts.length > 1 ? parts.slice(1).join('[정답]').trim() : '';

  return (
    <div className="mb-8">
      <div className="prose prose-invert max-w-none">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="text-primary">문제 {questionNumber}</span>
        </h3>
        
        <div className="space-y-6">
          {/* Question Section */}
          <div className="result-text whitespace-pre-wrap text-foreground/90 leading-relaxed relative p-6 rounded-lg bg-slate-50/5">
            {questionPart}
          </div>

          {/* Answer Section (only shown if exists) */}
          {answerPart && (
            <div className="result-text whitespace-pre-wrap text-foreground/90 leading-relaxed relative p-6 rounded-lg bg-primary/5">
              <span className="text-primary font-semibold">[정답]</span>
              {answerPart}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </div>
  );
};