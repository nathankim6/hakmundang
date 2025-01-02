import { Card, CardContent } from "@/components/ui/card";

interface OrderWritingQuestionProps {
  questionNumber: number;
  questionPart: string;
  answerPart: string;
}

export const OrderWritingQuestion = ({
  questionNumber,
  questionPart,
  answerPart
}: OrderWritingQuestionProps) => {
  // Format the answer part
  const formattedAnswer = answerPart
    .split('\n')
    .filter(line => line.trim())
    .join('\n');

  // Extract Korean text from questionPart
  const koreanText = questionPart.match(/\[우리말\]\s*(.*?)(?=\s*\[단어\]|\s*$)/s)?.[1]?.trim() || '';

  // Remove the original English text and Korean text section, keeping only the question framework
  const cleanedQuestionPart = questionPart
    .replace(/\[우리말\].*?(?=\[단어\]|\s*$)/s, '')
    .replace(/^(.*?)\n/, '$1\n\n' + koreanText + '\n');

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Question Number */}
          <div className="font-semibold text-lg text-[#403E43]">
            {questionNumber}번
          </div>

          {/* Question Section */}
          <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F1F0FB] p-4 rounded-lg border border-[#D3E4FD]/30">
            {cleanedQuestionPart}
          </div>
          
          {/* Answer Section */}
          <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F1F0FB] p-4 rounded-lg border border-[#D3E4FD]/30">
            <div className="font-semibold text-[#403E43] mb-2">
              [정답]
            </div>
            {formattedAnswer}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
