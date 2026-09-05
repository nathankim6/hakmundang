
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
};

const ProblemTypeBarChart: React.FC<ProblemTypeBarChartProps> = ({
  problemTypes,
  themeColors,
  showMainCategoriesOnly = false
}) => {
  // Calculate the chart data by main categories
  const chartData = useMemo(() => {
    return calculateChartData(problemTypes);
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
        {/* Enhanced Category Summary Cards with transition staggering */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-4">
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

        {/* Problem Grid with improved card design - Only show if not showMainCategoriesOnly */}
        {!showMainCategoriesOnly && (
          <div className="animate-fade-in" style={{ animation: 'fade-in-up 0.5s ease-out forwards 0.5s', opacity: 0 }}>
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
