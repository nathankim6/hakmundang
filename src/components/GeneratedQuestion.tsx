import { Card, CardContent } from "@/components/ui/card";

interface GeneratedQuestionProps {
  content: string;
  questionNumber: number;
}

export const GeneratedQuestion = ({ content, questionNumber }: GeneratedQuestionProps) => {
  return (
    <div className="mb-8">
      <div className="prose prose-invert max-w-none">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="text-primary">문제 {questionNumber}</span>
        </h3>
        
        <div className="result-text whitespace-pre-wrap text-foreground/90 leading-relaxed relative">
          {content}
        </div>
      </div>
      
      <div className="mt-6 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </div>
  );
};