
import React from 'react';
import { ChartPie } from "lucide-react";
import { Card } from "@/components/ui/card";

const ProblemTypeEmptyState: React.FC = () => {
  return (
    <Card className="shadow-md bg-white/80 rounded-xl overflow-hidden border border-gray-100">
      <div className="flex items-center justify-center h-[200px] p-6">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center mb-4 shadow-inner border border-gray-100">
            <ChartPie className="h-8 w-8 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-2">문제 유형 데이터가 없습니다.</p>
          <p className="text-xs text-gray-400">시험 문제 유형 정보를 추가해주세요.</p>
        </div>
      </div>
    </Card>
  );
};

export default ProblemTypeEmptyState;
