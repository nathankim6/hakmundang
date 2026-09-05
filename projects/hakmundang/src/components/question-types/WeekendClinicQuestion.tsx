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
    if (i + 1 < sections.length) {
      formattedSections.push({
        title: sections[i],
        content: sections[i + 1]
      });
    }
  }

  return (
    <div className="mb-8 last:mb-0">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#1A1F2C] flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#0EA5E9] text-white font-bold text-sm">
            {questionNumber}
          </span>
          주말클리닉
        </h3>

        {/* Original Text Section - without the label */}
        {originalText && (
          <div className="mb-6">
            <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F8F7FF] p-4 rounded-lg border border-[#0EA5E9]/20">
              {originalText}
            </div>
          </div>
        )}

        {/* Questions Section - Now unified */}
        <div className="result-text whitespace-pre-wrap leading-relaxed relative bg-[#F1F0FB] p-4 rounded-lg border border-[#D3E4FD]/30">
          {formattedSections.map((section, index) => (
            <div key={index} className="mb-4 last:mb-0">
              <div className="font-semibold text-[#1A1F2C] mb-2">[{section.title}]</div>
              <div className="whitespace-pre-wrap">{section.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};