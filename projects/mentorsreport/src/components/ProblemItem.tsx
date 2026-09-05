
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";
import { getDifficultyBadgeStyle, getQuestionTypeBadgeStyle, getQuestionTypeLabel } from "@/utils/problemTypeUtils";

type ProblemItemProps = {
  problem: {
    id: string;
    name: string;
    category: string;
    questionType: 'objective' | 'subjective';
    difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
  };
  index: number;
  themeColors: {
    primary: string;
    secondary: string;
    tertiary: string;
    accent: string;
    light: string;
    vibrant: string;
    pastel: string;
    accent2: string;
    highlight: string;
  };
};

const ProblemItem: React.FC<ProblemItemProps> = ({ problem, index, themeColors }) => {
  return (
    <div className="rounded-lg overflow-hidden border transition-all duration-300 hover:shadow-md group bg-white">
      {/* Theme-colored stripe at top - changed from fixed colors to theme colors */}
      <div 
        className="h-1 w-full"
        style={{
          background: problem.difficulty === 'easy' ? themeColors.vibrant :
                     problem.difficulty === 'medium' ? themeColors.accent2 :
                     problem.difficulty === 'hard' ? themeColors.highlight : 
                     themeColors.primary
        }}
      ></div>
    
      <div className="p-2.5 relative">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className={`text-[10px] uppercase py-0.5 px-2 ${getQuestionTypeBadgeStyle(problem.questionType)}`}>
            {getQuestionTypeLabel(problem.questionType)}
          </Badge>
          
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-600 font-medium">#{index + 1}</span>
          </div>
        </div>
        
        <div className="mb-1.5">
          <div className="flex items-center">
            <Tag className="h-3.5 w-3.5 text-gray-500 mr-1.5" />
            <span 
              className="text-xs font-medium text-gray-800 group-hover:text-indigo-700 transition-colors duration-300" 
              style={{
                color: themeColors.primary
              }}
            >
              {problem.category}
            </span>
          </div>
          <div className="mt-1 text-xs text-gray-500 truncate">{problem.name}</div>
        </div>
        
        <div 
          className={`absolute -right-1 -bottom-1 transform rotate-45 w-8 h-8 opacity-60`}
          style={{
            backgroundColor: problem.difficulty === 'easy' ? `${themeColors.vibrant}30` :
                            problem.difficulty === 'medium' ? `${themeColors.accent2}30` :
                            problem.difficulty === 'hard' ? `${themeColors.highlight}30` : 
                            `${themeColors.primary}30`
          }}
        ></div>
        
        <div className="absolute bottom-2 right-2 z-10">
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${getDifficultyBadgeStyle(problem.difficulty)}`}>
            {problem.difficulty === 'easy' ? '쉬움' : 
             problem.difficulty === 'medium' ? '보통' : 
             problem.difficulty === 'hard' ? '어려움' : 
             '매우 어려움'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProblemItem;
