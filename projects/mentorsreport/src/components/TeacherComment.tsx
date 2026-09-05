
import React from 'react';
import { Card } from "@/components/ui/card";
import { Award, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import AutoResizeText from "@/components/AutoResizeText";

interface CategoryEvaluation {
  category: string;
  evaluation: string;
}

interface TeacherCommentProps {
  teacherPhoto?: string;
  teacher: string;
  overallEvaluation?: string;
  themeColors: any;
  isHighSchool?: boolean;
}

const TeacherComment: React.FC<TeacherCommentProps> = ({
  teacherPhoto,
  teacher,
  overallEvaluation,
  themeColors,
  isHighSchool = false
}) => {
  // Parse evaluation categories if they exist
  let evaluationCategories: CategoryEvaluation[] = [];
  try {
    if (overallEvaluation) {
      evaluationCategories = JSON.parse(overallEvaluation);
      // Filter out empty evaluations
      evaluationCategories = evaluationCategories.filter(item => item.evaluation?.trim() !== '');
      
      // For high school, we only want the '종합 평가' category
      if (isHighSchool) {
        const overallEval = evaluationCategories.find(item => item.category === '종합 평가');
        evaluationCategories = overallEval ? [overallEval] : [];
      }
    }
  } catch (e) {
    console.error('Error parsing teacher comment:', e);
    // Fallback to treating as plain text if parsing fails
    if (overallEvaluation && overallEvaluation.trim() !== '') {
      evaluationCategories = [{
        category: '종합 평가',
        evaluation: overallEvaluation
      }];
    }
  }

  // If no evaluations after filtering or if overallEvaluation is undefined/null
  if (evaluationCategories.length === 0) {
    evaluationCategories = [{
      category: '종합 평가',
      evaluation: '문제 난이도는 평이했으며, 기본 개념을 잘 이해하고 있다면 충분히 해결할 수 있는 문제들로 구성되어 있습니다.'
    }];
    
    // Only add these additional categories for middle school reports
    if (!isHighSchool) {
      evaluationCategories.push({
        category: '학습 난이도',
        evaluation: '중간 수준의 난이도로, 기본 개념을 충실히 학습한 학생이라면 쉽게 해결할 수 있습니다.'
      });
      evaluationCategories.push({
        category: '시험 유형',
        evaluation: '다양한 유형의 문제가 골고루 출제되었으며, 기본적인 영어 능력을 평가하기에 적합합니다.'
      });
    }
  }
  
  return <Card className="p-6 my-4 shadow-lg bg-gradient-to-br border-0 relative overflow-hidden transform transition-all duration-300 hover:translate-y-[-3px]" style={{
    backgroundImage: `linear-gradient(135deg, white, ${themeColors.pastel})`,
    boxShadow: `0 10px 30px -5px ${themeColors.light}40`
  }}>
    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r rounded-t-2xl" style={{
      backgroundImage: `linear-gradient(to right, ${themeColors.highlight}, ${themeColors.primary})`
    }}></div>
          
    <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-10" style={{
      background: `radial-gradient(circle at center, ${themeColors.vibrant}, transparent)`
    }}></div>
          
    <div className="flex items-center mb-4 relative z-10">
      <div className="p-3 rounded-xl mr-3 shadow-md transform transition-transform duration-300 group-hover:scale-110" style={{
        background: `linear-gradient(135deg, ${themeColors.accent2}, ${themeColors.highlight})`,
        boxShadow: `0 4px 15px ${themeColors.light}70`
      }}>
        <Award className="h-5 w-5 text-white" />
      </div>
      <h3 className="text-lg font-bold tracking-tight bg-gradient-to-r bg-clip-text text-transparent animate-gradient-text" style={{
        backgroundImage: `linear-gradient(90deg, ${themeColors.accent2}, ${themeColors.primary}, ${themeColors.vibrant})`
      }}>
        Teacher's Comment
      </h3>
    </div>
      
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start">
      {/* Removed filters and color overlays on teacher photo */}
      {teacherPhoto ? (
        <div className="relative w-full md:w-48 h-48 flex-shrink-0 overflow-hidden rounded-xl shadow-lg border-0">
          <img 
            src={teacherPhoto} 
            alt="Teacher" 
            className="w-full h-full object-cover rounded-xl" 
          />
        </div>
      ) : (
        <div className="relative w-full md:w-48 h-48 flex-shrink-0 overflow-hidden rounded-xl shadow-lg border-0 bg-gray-100 flex justify-center items-center">
          <User className="h-16 w-16 text-gray-400" />
        </div>
      )}
            
      <div className="flex-1 min-w-0 relative z-10">
        <div className="bg-white rounded-xl border shadow-lg p-5 w-full break-words relative" style={{
          borderColor: themeColors.light,
          minHeight: '120px',
          overflow: 'visible'
        }}>
          <ScrollArea className="max-h-full pr-2">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r opacity-5" style={{
              backgroundImage: `linear-gradient(120deg, ${themeColors.accent2}30, transparent)`
            }}></div>
                  
            <div className="absolute -left-2 top-6 w-8 h-full opacity-30" style={{
              borderLeft: `4px solid ${themeColors.highlight}`
            }}></div>
              
            <div className="space-y-4 pl-4 relative text-justify pr-2">
              {evaluationCategories.map((category, index) => <div key={index} className="mb-3">
                  {evaluationCategories.length > 1 && !isHighSchool && <h4 className="text-sm mb-1 font-extrabold"
                    style={{
                      color: themeColors.primary
                    }}>
                    {category.category}
                  </h4>}
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed italic">
                  {index === 0 && <span className="text-5xl absolute -left-2 -top-6 opacity-30" style={{
                    color: themeColors.vibrant
                  }}>"</span>}
                  {category.evaluation}
                  {index === evaluationCategories.length - 1 && <span className="text-5xl absolute right-0 bottom-0 opacity-30" style={{
                    color: themeColors.vibrant
                  }}>"</span>}
                </p>
              </div>)}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  </Card>;
};

export default TeacherComment;
