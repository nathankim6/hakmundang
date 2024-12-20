import { Card, CardContent } from "@/components/ui/card";

interface GeneratedQuestionProps {
  content: string;
}

export const GeneratedQuestion = ({ content }: GeneratedQuestionProps) => {
  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        <div className="prose max-w-none">
          <h3 className="text-lg font-medium mb-4">생성된 문제</h3>
          <div className="whitespace-pre-wrap">{content}</div>
        </div>
      </CardContent>
    </Card>
  );
};