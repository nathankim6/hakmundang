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

  // Add a note about the sentence being from the main text
  const questionWithNote = cleanedQuestionPart.replace(
    '주어진 단어들을 순서대로 배열하여 우리말과 같은 의미가 되도록 영작하시오.',
    '다음 본문의 핵심 내용을 담고 있는 문장을 주어진 단어들을 순서대로 배열하여 우리말과 같은 의미가 되도록 영작하시오.'
  );

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
            {questionWithNote}
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