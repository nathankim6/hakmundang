
import React, { useMemo } from 'react';
import { ChartPie } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateChartData } from "@/utils/chartDataUtils";
import ProblemTypeEmptyState from "./ProblemTypeEmptyState";
import ProblemTypeCard from "./ProblemTypeCard";
import ProblemList from "./ProblemList";

type ProblemType = {
  id: string;
  name: string;
  category: string;
  questionType: 'objective' | 'subjective';
  difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
};

type ProblemTypeBarChartProps = {
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
  showMainCategoriesOnly?: boolean;
  isHighSchool?: boolean;
  analysisType?: 'simple' | 'detailed';
};

const ProblemTypeBarChart: React.FC<ProblemTypeBarChartProps> = ({
  problemTypes,
  themeColors,
  showMainCategoriesOnly = false,
  isHighSchool = false,
  analysisType = 'detailed'
}) => {
  // Calculate the chart data by main categories - different logic for middle vs high school
  const chartData = useMemo(() => {
    return calculateChartData(problemTypes, isHighSchool);
  }, [problemTypes, isHighSchool]);

  // Calculate subcategory data for detailed analysis
  const subcategoryData = useMemo(() => {
    const subcategoryCounts: { [key: string]: number } = {};
    problemTypes.forEach(problem => {
      subcategoryCounts[problem.name] = (subcategoryCounts[problem.name] || 0) + 1;
    });
    
    return Object.entries(subcategoryCounts).map(([name, count]) => ({
      name,
      value: count,
      percentage: ((count / problemTypes.length) * 100).toFixed(1)
    })).sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));
  }, [problemTypes]);

  // Get the total count of problems
  const totalProblems = problemTypes.length;
  
  if (problemTypes.length === 0) {
    return <ProblemTypeEmptyState />;
  }
  
  return (
    <Card className="shadow-md bg-white rounded-xl overflow-hidden border-0">
      <CardHeader className="border-b pb-4" style={{
        background: `linear-gradient(to right, ${themeColors.pastel}, ${themeColors.light}30)`,
        borderBottom: `1px solid ${themeColors.light}50`
      }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg shadow-lg" style={{
              background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.vibrant})` 
            }}>
              <ChartPie size={18} className="text-white" />
            </div>
            <CardTitle className="text-base font-semibold text-slate-700">문제 유형 분포</CardTitle>
          </div>
          <Badge variant="outline" className="bg-white px-3 py-1 rounded-full font-medium text-xs shadow-sm">
            전체 {totalProblems}문항
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Main Category Summary Cards with section header */}
        <div className="mb-4">
          <div className="flex items-center mb-3">
            <h4 className="text-sm font-medium text-gray-700 mr-2">대분류별 통계</h4>
            <div className="flex-1 h-px bg-gradient-to-r" style={{
              backgroundImage: `linear-gradient(to right, ${themeColors.light}, transparent)`
            }}></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {chartData.map((item, index) => (
              <div 
                key={index}
                className="animate-fade-in" 
                style={{ 
                  animation: `fade-in-up 0.5s ease-out forwards ${0.1 + index * 0.1}s`,
                  opacity: 0 
                }}
              >
                <ProblemTypeCard
                  item={item}
                  index={index}
                  themeColors={themeColors}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Subcategory Statistics - Only show in detailed analysis */}
        {analysisType === 'detailed' && (
          <div className="mb-4">
            <div className="flex items-center mb-3">
              <h4 className="text-sm font-medium text-gray-700 mr-2">소분류별 통계</h4>
              <div className="flex-1 h-px bg-gradient-to-r" style={{
                backgroundImage: `linear-gradient(to right, ${themeColors.light}, transparent)`
              }}></div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">{subcategoryData.map((item, index) => {
                const rank = index + 1;
                const isTopRank = rank <= 3;
                const getRankIcon = (rank: number) => {
                  switch(rank) {
                    case 1: return '👑';
                    case 2: return '🥈';
                    case 3: return '🥉';
                    default: return '';
                  }
                };
                
                return (
                  <div 
                    key={index}
                    className="group animate-fade-in" 
                    style={{ 
                      animation: `fade-in-up 0.5s ease-out forwards ${0.1 + index * 0.1}s`,
                      opacity: 0 
                    }}
                  >
                    <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all duration-300 hover:shadow-md bg-white border" style={{
                      background: isTopRank 
                        ? `linear-gradient(90deg, ${themeColors.primary}10 0%, ${themeColors.vibrant}05 100%)`
                        : `linear-gradient(90deg, white 0%, ${themeColors.pastel}06 100%)`,
                      border: isTopRank 
                        ? `1px solid ${themeColors.primary}40`
                        : `1px solid ${themeColors.light}25`,
                      boxShadow: isTopRank ? `0 2px 8px ${themeColors.primary}20` : 'none'
                    }}>
                      {/* Left: Name and ranking */}
                      <div className="flex-shrink-0 w-full">
                        <h4 className="text-gray-800 font-medium text-[10px] break-words" title={item.name}>
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-0.5 mt-0.5">
                          <span className="text-[10px] font-medium px-1 py-0.5 rounded text-white flex items-center gap-0.5" style={{
                            background: isTopRank 
                              ? `linear-gradient(90deg, ${themeColors.primary}, ${themeColors.highlight})`
                              : `linear-gradient(90deg, ${themeColors.secondary}, ${themeColors.vibrant})`
                          }}>
                            {getRankIcon(rank)}
                            {rank}위
                          </span>
                          <span className="text-[10px] font-bold" style={{ color: themeColors.primary }}>
                            {item.percentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Problem List - Only show in detailed analysis */}
        {analysisType === 'detailed' && (
          <div>
            <ProblemList 
              problemTypes={problemTypes}
              themeColors={themeColors}
            />
          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default ProblemTypeBarChart;
