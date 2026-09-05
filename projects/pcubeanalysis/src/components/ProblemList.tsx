
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
  // Add debug logging
  console.log('ProblemList - Total problem types:', problemTypes?.length || 0);
  console.log('ProblemList - Problem types:', problemTypes);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-gray-700 flex items-center">
          <BookOpen size={16} className="mr-2" style={{ color: themeColors.primary }} />
          문항 목록 ({problemTypes?.length || 0}개)
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
      
      <div className="pr-2">
        {problemTypes && problemTypes.length > 0 ? (
          (() => {
            const objective = problemTypes.filter(p => p.questionType !== 'subjective');
            const subjective = problemTypes.filter(p => p.questionType === 'subjective');

            return (
              <div className="space-y-4">
                {objective.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-2 flex items-center">
                      <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: themeColors.primary }}></span>
                      객관식 ({objective.length}개)
                    </div>
                    <div className="grid grid-cols-1 xxs:grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                      {objective.map((problem, index) => (
                        <ProblemItem
                          key={problem.id}
                          problem={problem}
                          index={index}
                          themeColors={themeColors}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {subjective.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-2 flex items-center">
                      <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: themeColors.accent2 }}></span>
                      서답형 ({subjective.length}개)
                    </div>
                    <div className="grid grid-cols-1 xxs:grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                      {subjective.map((problem, index) => (
                        <ProblemItem
                          key={problem.id}
                          problem={problem}
                          index={index}
                          themeColors={themeColors}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()
        ) : (
          <div className="text-center text-gray-500 py-8">
            등록된 문항이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemList;
