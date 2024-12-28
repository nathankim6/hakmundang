import { Card, CardContent } from "@/components/ui/card";

interface WeekendClinicQuestionProps {
  questionNumber: number;
  content: string;
  originalText: string;
}

export const WeekendClinicQuestion = ({
  questionNumber,
  content,
  originalText
}: WeekendClinicQuestionProps) => {
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

        {/* Original Text Section - without the label */}
        <div className="mb-6">
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
};