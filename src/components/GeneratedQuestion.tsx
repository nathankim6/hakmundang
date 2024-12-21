import { Card, CardContent } from "@/components/ui/card";

interface GeneratedQuestionProps {
  content: string;
}

export const GeneratedQuestion = ({ content }: GeneratedQuestionProps) => {
  return (
    <Card className="mt-8 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 animate-pulse" />
      <div className="absolute inset-0 bg-secondary/50 backdrop-blur-sm" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50" />
      <CardContent className="relative p-6">
        <div className="prose prose-invert max-w-none">
          <h3 className="text-2xl font-bold animate-title mb-6 flex items-center gap-2">
            <span className="text-primary">Generated</span> Question
            <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary animate-pulse">
              AI
            </span>
          </h3>
          <div className="whitespace-pre-wrap text-foreground/90 leading-relaxed relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 animate-pulse" />
            {content}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};