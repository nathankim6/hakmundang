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
  // For Logic Flow questions, split content into sections and filter out empty ones
  const isLogicFlow = questionPart.includes('[지문 요약]') || questionPart.includes('[서론]');
  
  if (isLogicFlow) {
    const sections = questionPart.split(/\[(.*?)\]/g).filter(Boolean);
    const formattedSections: { title: string; content: string }[] = [];
    
    for (let i = 0; i < sections.length; i += 2) {
      if (sections[i + 1] && sections[i + 1].trim()) {  // Only add sections with non-empty content
        formattedSections.push({
          title: sections[i],
          content: sections[i + 1].trim()
        });
      }
    }

    return (
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="text-lg font-semibold mb-4">문제 {questionNumber}</div>
          {formattedSections.map((section, index) => (
            <div key={index} className="mb-4">
              <div className="font-medium text-gray-700">[{section.title}]</div>
              <div className="mt-1 whitespace-pre-wrap">{section.content}</div>
            </div>
          ))}
          {answerPart && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              {answerPart}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // For non-Logic Flow questions, keep the original rendering
  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="text-lg font-semibold mb-4">문제 {questionNumber}</div>
        <div className="whitespace-pre-wrap">{questionPart}</div>
        {answerPart && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            {answerPart}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
