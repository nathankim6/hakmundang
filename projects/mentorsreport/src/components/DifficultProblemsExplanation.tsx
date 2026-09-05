
import React from 'react';
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface DifficultProblemsExplanationProps {
  explanation?: string;
  hasDifficultProblems: boolean;
  themeColors: any;
}

const DifficultProblemsExplanation: React.FC<DifficultProblemsExplanationProps> = ({ 
  explanation, 
  hasDifficultProblems,
  themeColors 
}) => {
  if (!hasDifficultProblems || !explanation) return null;

  return (
    <Card className="p-6 my-4 shadow-lg bg-gradient-to-br border-0 relative overflow-hidden transform transition-all duration-300 hover:translate-y-[-3px]" style={{
      backgroundImage: `linear-gradient(135deg, white, ${themeColors.pastel})`,
      boxShadow: `0 10px 30px -5px ${themeColors.light}40`
    }}>
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r" style={{
        backgroundImage: `linear-gradient(to right, ${themeColors.vibrant}, ${themeColors.accent2})`
      }}></div>
          
      <div className="absolute top-6 right-4 w-40 h-40 rounded-full opacity-10" style={{
        background: `radial-gradient(circle at center, ${themeColors.accent2}, transparent)`
      }}></div>
          
      <div className="flex items-center mb-4 relative z-10">
        <div className="p-3 rounded-xl mr-3 shadow-md transform transition-transform duration-300 group-hover:scale-110" style={{
          background: `linear-gradient(135deg, ${themeColors.vibrant}, ${themeColors.accent2})`,
          boxShadow: `0 4px 15px ${themeColors.light}70`
        }}>
          <FileText className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-lg font-bold tracking-tight bg-gradient-to-r bg-clip-text text-transparent" style={{
          backgroundImage: `linear-gradient(90deg, ${themeColors.primary}, ${themeColors.vibrant}, ${themeColors.accent2})`
        }}>시험특징 &amp;킬러문항</h3>
      </div>
          
      <div className="flex gap-3 items-start">
        <div className="bg-white rounded-xl border shadow-lg p-5 flex-grow w-full relative z-10 overflow-hidden" style={{
          borderColor: themeColors.light
        }}>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r opacity-5" style={{
            backgroundImage: `linear-gradient(120deg, ${themeColors.vibrant}30, transparent)`
          }}></div>
              
          <div className="absolute -left-2 top-6 w-8 h-full opacity-30" style={{
            borderLeft: `4px solid ${themeColors.vibrant}`
          }}></div>
              
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed italic relative w-full text-base pl-6 text-justify">
            <span className="text-4xl absolute -left-2 -top-4 opacity-30" style={{
              color: themeColors.accent2
            }}>"</span>
            {explanation}
            <span className="text-4xl absolute right-0 bottom-0 opacity-30" style={{
              color: themeColors.accent2
            }}>"</span>
          </p>
        </div>
      </div>
    </Card>
  );
};

export default DifficultProblemsExplanation;
