import { Card, CardContent } from "@/components/ui/card";

interface GeneratedQuestionProps {
  content: string;
}

export const GeneratedQuestion = ({ content }: GeneratedQuestionProps) => {
  return (
    <Card className="mt-8 border-2 border-primary/20 bg-card">
      <CardContent className="p-6">
        <div className="prose prose-invert max-w-none">
          <h3 className="text-xl font-semibold text-primary mb-4 animate-sparkle">생성된 문제</h3>
          <div className="whitespace-pre-wrap text-foreground/90">{content}</div>
        </div>
      </CardContent>
    </Card>
  );
};