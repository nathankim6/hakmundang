import { Card, CardContent } from "@/components/ui/card";

interface GeneratedQuestionProps {
  content: string;
  questionNumber: number;
}

export const GeneratedQuestion = ({ content, questionNumber }: GeneratedQuestionProps) => {
  return (
    <Card className="mt-8 relative overflow-hidden group transform hover:scale-[1.01] transition-all duration-300 gradient-border">
      <div className="absolute inset-0 bg-gradient-to-r from-[#E5DEFF] via-[#FFDEE2] to-[#FDE1D3] opacity-10" />
      <div className="absolute inset-0 bg-white/95 backdrop-blur-sm" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardContent className="relative p-6">
        <div className="prose prose-invert max-w-none">
          <h3 className="text-2xl font-bold animate-title mb-6 flex items-center gap-2">
            <span className="text-primary">문제 {questionNumber}</span>
            <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary animate-pulse">
              AI
            </span>
          </h3>
          
          <div className="result-text whitespace-pre-wrap text-foreground/90 leading-relaxed relative">
            {content}
          </div>
        </div>
      </CardContent>
      
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </Card>
  );
};