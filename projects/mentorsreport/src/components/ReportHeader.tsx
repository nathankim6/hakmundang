
import React from 'react';
interface ReportHeaderProps {
  date: string;
  themeColors: any;
}
const ReportHeader: React.FC<ReportHeaderProps> = ({
  date,
  themeColors
}) => {
  return <div className="relative text-center mb-8 pb-6 after:content-[''] after:absolute after:left-1/4 after:right-1/4 after:bottom-0 after:h-0.5 after:bg-gradient-to-r after:from-transparent after:via-gray-200 after:to-transparent" style={{
    "--after-via-color": `${themeColors.primary}30`
  } as React.CSSProperties}>
      <div className="relative z-10 flex items-center justify-center pt-4">
        <div className="flex flex-col md:flex-row items-center gap-5">
          <div className="relative">
            {/* Removed background overlay and other effects on logo */}
            <div className="w-20 h-20 rounded-full border-2 p-2 bg-white shadow-xl overflow-hidden" style={{
              borderColor: `${themeColors.light}`
            }}>
              <img alt="ORUN ACADEMY" className="w-full h-full object-contain rounded-full" src="/lovable-uploads/4f5678f1-764d-4675-be41-fa8417107333.png" />
            </div>
          </div>
          <div className="text-center md:text-left">
            <h1 className="font-russo leading-tight tracking-tight px-3 py-2 select-none text-4xl md:text-5xl" style={{
            color: themeColors.primary,
            textShadow: `0 1px 2px rgba(255,255,255,0.8), 
                          0 0 5px ${themeColors.light}80, 
                          0 0 10px ${themeColors.light}40`,
            filter: 'saturate(1.3) contrast(1.2)'
          }}>Exam Analysis Report</h1>
            <div className="flex items-center justify-center mt-3">
              <span className="font-noto tracking-wider py-2 px-12 rounded-full border border-gray-300 bg-white/90 backdrop-blur-sm shadow-md text-sm font-medium transform transition-all duration-300 hover:shadow-lg hover:bg-white hover:scale-[1.02]">전문가집단 영어학원 내신 분석리포트</span>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default ReportHeader;
