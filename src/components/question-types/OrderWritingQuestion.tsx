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
  // Extract the passage text from questionPart
  const passageText = questionPart.split('다음 글을 읽고, 물음에 답하시오.\n\n')[1]?.split('\n\n[문제]')[0]?.trim();
  
  // Extract the question text
  const questionText = questionPart.match(/\[문제\](.*?)(?=\[우리말\])/s)?.[1]?.trim() || '';
  
  // Extract Korean text from questionPart
  const koreanText = questionPart.match(/\[우리말\](.*?)(?=\[단어\])/s)?.[1]?.trim() || '';
  
  // Extract word list
  const wordList = questionPart.match(/\[단어\](.*?)(?=\[정답\])/s)?.[1]?.trim() || '';

  // Format the answer part
  const formattedAnswer = answerPart
    .split('\n')
    .filter(line => line.trim())
    .join('\n');

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Question Number */}
          <div className="font-semibold text-lg text-[#403E43]">
            {questionNumber}번
          </div>

          {/* Passage Section */}
          {passageText && (
            <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-white p-4 rounded-lg border border-[#D3E4FD]/30">
              {passageText}
            </div>
          )}

          {/* Question Section */}
          <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F1F0FB] p-4 rounded-lg border border-[#D3E4FD]/30">
            {questionText}
          </div>

          {/* Korean Translation */}
          <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F1F0FB] p-4 rounded-lg border border-[#D3E4FD]/30">
            <div className="font-semibold text-[#403E43] mb-2">
              [우리말]
            </div>
            {koreanText}
          </div>

          {/* Word List */}
          <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F1F0FB] p-4 rounded-lg border border-[#D3E4FD]/30">
            <div className="font-semibold text-[#403E43] mb-2">
              [단어]
            </div>
            {wordList}
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