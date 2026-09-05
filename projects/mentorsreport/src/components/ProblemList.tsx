
import React from 'react';
import { BookOpen } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ProblemItem from './ProblemItem';

type ProblemType = {
  id: string;
  name: string;
  category: string;
  questionType: 'objective' | 'subjective';
  difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
};

type ProblemListProps = {
  problemTypes: ProblemType[];
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

const ProblemList: React.FC<ProblemListProps> = ({ problemTypes, themeColors }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-gray-700 flex items-center">
          <BookOpen size={16} className="mr-2" style={{ color: themeColors.primary }} />
          문항 목록
        </h4>
        <div className="flex space-x-2">
          {/* Legend for reference */}
          <div className="flex items-center text-xs text-gray-500">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></div>
            <span>쉬움</span>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
            <span>보통</span>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <div className="w-2 h-2 rounded-full bg-amber-500 mr-1"></div>
            <span>어려움</span>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <div className="w-2 h-2 rounded-full bg-rose-500 mr-1"></div>
            <span>매우 어려움</span>
          </div>
        </div>
      </div>
      
      <ScrollArea className="max-h-[420px] pr-2" type="always">
        <div className="grid grid-cols-1 xxs:grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {problemTypes.map((problem, index) => (
            <ProblemItem 
              key={problem.id} 
              problem={problem} 
              index={index} 
              themeColors={themeColors} 
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ProblemList;
