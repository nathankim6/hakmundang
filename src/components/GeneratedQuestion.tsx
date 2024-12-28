import { Card, CardContent } from "@/components/ui/card";

interface GeneratedQuestionProps {
  content: string;
  questionNumber: number;
  originalText?: string;
  showVocabButton?: boolean;
}

export const GeneratedQuestion = ({ 
  content, 
  questionNumber, 
  originalText,
  showVocabButton = true
}: GeneratedQuestionProps) => {
  // Special handling for weekend clinic format
  if (originalText) {
    const sections = content.split(/\[(.*?)\]/g).filter(Boolean);
    const formattedSections: { title: string; content: string }[] = [];
    
    for (let i = 0; i < sections.length; i += 2) {
      if (sections[i + 1]) {
        formattedSections.push({
          title: sections[i],
          content: sections[i + 1].trim()
        });
      }
    }

    return (
      <div className="mb-8">
        <div className="prose max-w-none">
          <h3 className="text-2xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#0EA5E9] to-[#403E43] bg-clip-text text-transparent">
              문제 {questionNumber}
            </span>
          </h3>

          {/* Original Text Section */}
          <div className="mb-6">
            <h4 className="font-semibold text-[#403E43] mb-2">원문</h4>
            <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F8F7FF] p-4 rounded-lg border border-[#0EA5E9]/20">
              {originalText}
            </div>
          </div>

          {/* Questions Section - Now unified */}
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
        </div>
        
        <div className="mt-6 h-px bg-gradient-to-r from-transparent via-[#0EA5E9]/30 to-transparent" />
      </div>
    );
  }

  // Default rendering for other question types
  const parts = content.split('[정답]');
  let questionPart = parts[0].trim();
  const answerPart = parts.length > 1 ? '[정답]' + parts.slice(1).join('').trim() : '';

  // Remove explanatory text for synonym/antonym questions
  if (content.includes('| 표제어 |') || content.includes('동의어') || content.includes('반의어')) {
    const tableStart = questionPart.indexOf('|');
    if (tableStart !== -1) {
      questionPart = questionPart.substring(tableStart);
    }
  }

  questionPart = questionPart.replace('[OUTPUT]', '').trim();
  const isTrueFalse = questionPart.includes('(T/F)');

  // For True/False questions, handle the format differently
  if (isTrueFalse) {
    const lines = questionPart.split('\n');
    const title = lines[0]; // First line (title)
    const questions = lines.slice(1).join('\n'); // Remaining lines (questions)

    return (
      <div className="mb-8">
        <div className="prose max-w-none">
          <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <span className="bg-gradient-to-r from-[#0EA5E9] to-[#403E43] bg-clip-text text-transparent">
              문제 {questionNumber}
            </span>
          </h3>
          
          <div className="space-y-4">
            {/* Questions Section */}
            <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F8F7FF] p-4 rounded-lg border border-[#0EA5E9]/20">
              <h4 className="font-semibold text-[#403E43] mb-2">다음 글의 내용으로 옳고 그름(T/F)을 고르시오</h4>
              {questions}
            </div>
            
            {/* Answers and Explanations Section */}
            {answerPart && (
              <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F8F7FF] p-4 rounded-lg border border-[#0EA5E9]/20">
                <h4 className="font-semibold text-[#403E43] mb-2">정답 및 해설</h4>
                {answerPart}
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 h-px bg-gradient-to-r from-transparent via-[#0EA5E9]/30 to-transparent" />
      </div>
    );
  }

  // For other question types, keep the existing format
  return (
    <div className="mb-8">
      <div className="prose max-w-none">
        <h3 className="text-2xl font-bold mb-2">
          <span className="bg-gradient-to-r from-[#0EA5E9] to-[#403E43] bg-clip-text text-transparent">
            문제 {questionNumber}
          </span>
        </h3>
        
        <div className="space-y-4">
          <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F1F0FB] p-4 rounded-lg border border-[#D3E4FD]/30">
            {questionPart}
          </div>
          
          {answerPart && (
            <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F8F7FF] p-4 rounded-lg border border-[#0EA5E9]/20">
              {answerPart}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 h-px bg-gradient-to-r from-transparent via-[#0EA5E9]/30 to-transparent" />
    </div>
  );
};
