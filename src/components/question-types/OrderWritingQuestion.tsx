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
  const sections = questionPart.split(/\[|\]/g).filter(Boolean);
  const formattedSections: { title: string; content: string }[] = [];
  
  for (let i = 0; i < sections.length; i += 2) {
    if (sections[i + 1]) {
      formattedSections.push({
        title: sections[i].trim(),
        content: sections[i + 1].trim()
      });
    }
  }

  const explanationSections = answerPart.split(/\d\.\s/).filter(Boolean);

  return (
    <div className="mb-8">
      <div className="prose max-w-none">
        <h3 className="text-2xl font-bold mb-4">
          <span className="bg-gradient-to-r from-[#0EA5E9] to-[#403E43] bg-clip-text text-transparent">
            문제 {questionNumber}
          </span>
        </h3>
        
        <div className="space-y-4">
          {/* Question Section */}
          <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F1F0FB] p-4 rounded-lg border border-[#D3E4FD]/30">
            {formattedSections.map((section, index) => (
              <div key={index} className="mb-4 last:mb-0">
                <div className="font-semibold text-[#403E43] mb-2">
                  [{section.title}]
                </div>
                <div className="whitespace-pre-wrap">
                  {section.content}
                </div>
              </div>
            ))}
          </div>
          
          {/* Answer Section */}
          <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F8F7FF] p-4 rounded-lg border border-[#0EA5E9]/20">
            <div className="font-semibold text-[#403E43] mb-2">
              [정답]
            </div>
            <div className="whitespace-pre-wrap mb-4">
              {explanationSections[0]}
            </div>
            
            {/* Explanation Section */}
            <div className="font-semibold text-[#403E43] mb-2">
              [해설]
            </div>
            {explanationSections.slice(1).map((section, index) => (
              <div key={index} className="mb-2">
                <div className="whitespace-pre-wrap">
                  {`${index + 1}. ${section.trim()}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-6 h-px bg-gradient-to-r from-transparent via-[#0EA5E9]/30 to-transparent" />
    </div>
  );
};