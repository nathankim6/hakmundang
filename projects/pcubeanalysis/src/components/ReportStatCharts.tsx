import React from 'react';
import { Card } from "@/components/ui/card";
import { FileText, ListChecks, BarChart3 } from "lucide-react";
import QuestionTypePieChart from "@/components/QuestionTypePieChart";
import ProblemTypeBarChart from "@/components/ProblemTypeBarChart";
import DifficultyBarChart from "@/components/DifficultyBarChart";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import AutoResizeText from "@/components/AutoResizeText";

interface ReportStatChartsProps {
  stats: {
    objectivePercentage: number;
    subjectivePercentage: number;
    problemTypes: Array<{
      id: string;
      name: string;
      category: string;
      questionType: 'objective' | 'subjective';
      difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
    }>;
    difficulty: {
      easy: number;
      medium: number;
      hard: number;
      very_hard: number;
    };
  };
  themeColors: any;
  analysisType?: 'simple' | 'detailed';
}

const ReportStatCharts: React.FC<ReportStatChartsProps> = ({ stats, themeColors, analysisType = 'detailed' }) => {
  // Determine if this is a high school report based on problem types
  const isHighSchool = stats.problemTypes.some(p => 
    p.category === "부교재(모의고사)" || p.category === "단어장" || p.category === "교과서" || 
    p.category === "핸드아웃" || p.category === "부교재" || p.category === "모의고사" || p.category === "워크북");

  console.log('ReportStatCharts - isHighSchool:', isHighSchool);
  console.log('ReportStatCharts - problemTypes categories:', stats.problemTypes.map(p => p.category));

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
        <Card className="p-5 shadow-md bg-gradient-to-br from-white to-blue-50/30 border border-white/60 rounded-xl h-auto min-h-[320px] transition-all duration-300 hover:shadow-lg transform hover:scale-[1.01]" style={{
          borderLeft: `3px solid ${themeColors.vibrant}`
        }}>
          <div className="flex items-center mb-3">
            <div className="p-2.5 rounded-full mr-3 shadow-md" style={{
              background: `linear-gradient(135deg, ${themeColors.accent}, ${themeColors.vibrant})`
            }}>
              <FileText className="h-5 w-5 text-white drop-shadow-sm" />
            </div>
            <h3 className="text-base font-semibold tracking-tight text-gray-800" style={{
              textShadow: `0 1px 2px ${themeColors.light}40`
            }}>객관식/서답형 비율</h3>
          </div>
          
          {/* Modified layout for the chart */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-full md:w-2/3 h-[220px] print:h-[140px]">
              <QuestionTypePieChart 
                objectivePercentage={stats.objectivePercentage} 
                subjectivePercentage={stats.subjectivePercentage} 
                themeColors={themeColors} 
              />
            </div>
            
            <div className="w-full md:w-1/3 space-y-3 md:pl-2">
              <div className="p-3 rounded-xl border shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md" style={{
                background: `linear-gradient(90deg, ${themeColors.pastel}70, ${themeColors.light}40)`,
                borderColor: themeColors.accent
              }}>
                <div className="flex justify-between items-center mb-1">
                  <AutoResizeText 
                    text="객관식" 
                    maxFontSize={15}
                    minFontSize={12}
                    containerClassName="w-auto"
                    textClassName="font-medium"
                    style={{ color: themeColors.primary }}
                  />
                  <span className="text-sm font-bold whitespace-nowrap" style={{
                    color: themeColors.primary
                  }}>{Math.round(stats.objectivePercentage)}%</span>
                </div>
                <Progress value={stats.objectivePercentage} className="h-2 rounded-full overflow-hidden" style={{
                  backgroundColor: `${themeColors.light}70`
                }} indicatorClassName="bg-gradient-to-r rounded-full" indicatorStyle={{
                  backgroundImage: `linear-gradient(90deg, ${themeColors.primary}, ${themeColors.vibrant})`,
                  boxShadow: `0 0 10px ${themeColors.primary}60`
                }} />
              </div>
              <div className="p-3 rounded-xl border shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md" style={{
                background: `linear-gradient(90deg, ${themeColors.accent2}30, ${themeColors.pastel}60)`,
                borderColor: themeColors.accent2
              }}>
                <div className="flex justify-between items-center mb-1">
                  <AutoResizeText 
                    text="서답형" 
                    maxFontSize={15}
                    minFontSize={12}
                    containerClassName="w-auto"
                    textClassName="font-medium"
                    style={{ color: themeColors.primary }}
                  />
                  <span className="text-sm font-bold whitespace-nowrap" style={{
                    color: themeColors.primary
                  }}>{Math.round(stats.subjectivePercentage)}%</span>
                </div>
                <Progress value={stats.subjectivePercentage} className="h-2 rounded-full overflow-hidden" style={{
                  backgroundColor: `${themeColors.light}70`
                }} indicatorClassName="bg-gradient-to-r rounded-full" indicatorStyle={{
                  backgroundImage: `linear-gradient(90deg, ${themeColors.accent2}, ${themeColors.highlight})`,
                  boxShadow: `0 0 10px ${themeColors.accent2}60`
                }} />
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-5 shadow-md bg-gradient-to-br from-white to-violet-50/30 border border-white/60 rounded-xl h-auto min-h-[320px] transition-all duration-300 hover:shadow-lg transform hover:scale-[1.01]" style={{
          borderRight: `3px solid ${themeColors.highlight}`
        }}>
          <div className="flex items-center mb-3">
            <div className="p-2.5 rounded-full mr-3 shadow-md" style={{
              background: `linear-gradient(135deg, ${themeColors.vibrant}, ${themeColors.accent2})`
            }}>
              <ListChecks className="h-5 w-5 text-white drop-shadow-sm" />
            </div>
            <h3 className="text-base font-semibold tracking-tight text-gray-800" style={{
              textShadow: `0 1px 2px ${themeColors.light}40`
            }}>시험 난이도 분석</h3>
          </div>
          
          <div className="h-[240px]">
            <DifficultyBarChart difficulty={stats.difficulty} themeColors={themeColors} />
          </div>
        </Card>
      </div>

      <Card className="p-5 my-4 shadow-md bg-gradient-to-br from-white to-indigo-50/30 border border-white/60 rounded-xl h-auto transition-all duration-300 hover:shadow-lg transform hover:scale-[1.005]" style={{
        borderTop: `3px solid ${themeColors.accent2}`
      }}>
        <div className="flex items-center mb-3">
          <div className="p-2.5 rounded-full mr-3 shadow-md" style={{
            background: `linear-gradient(135deg, ${themeColors.highlight}, ${themeColors.accent2})`
          }}>
            <BarChart3 className="h-5 w-5 text-white drop-shadow-sm" />
          </div>
          <h3 className="text-base font-semibold tracking-tight text-gray-800" style={{
            textShadow: `0 1px 2px ${themeColors.light}40`
          }}>출제 유형 분석</h3>
        </div>
        
        <div className="bg-gradient-to-br from-white to-slate-50 p-3 rounded-lg border border-slate-100 shadow-inner">
          <ProblemTypeBarChart 
            problemTypes={stats.problemTypes} 
            themeColors={themeColors} 
            showMainCategoriesOnly={false}
            isHighSchool={isHighSchool}
            analysisType={analysisType}
          />
        </div>
      </Card>
    </>
  );
};

export default ReportStatCharts;
