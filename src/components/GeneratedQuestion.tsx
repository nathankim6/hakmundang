import { Card, CardContent } from "@/components/ui/card";

interface GeneratedQuestionProps {
  content: string;
}

export const GeneratedQuestion = ({ content }: GeneratedQuestionProps) => {
  return (
    <Card className="mt-8 bg-secondary/50 border border-primary/20 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="prose prose-invert max-w-none">
          <h3 className="text-2xl font-bold text-primary animate-title mb-6">Generated Question</h3>
          <div className="whitespace-pre-wrap text-foreground/90 leading-relaxed">{content}</div>
        </div>
      </CardContent>
    </Card>
  );
};