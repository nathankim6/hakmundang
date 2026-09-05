
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, School, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SchoolTypeSelector: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-gradient-to-b from-blue-50 via-indigo-50/30 to-violet-50/20 min-h-screen py-10 px-4 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex justify-start mb-4">
          <Button variant="outline" onClick={() => navigate("/")} className="flex items-center gap-2 bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 rounded-full px-5 shadow-sm">
            <ArrowLeft size={16} className="text-blue-600" />
            <span className="text-blue-600">메인으로</span>
          </Button>
        </div>
        
        <Card className="w-full mx-auto overflow-hidden shadow-2xl border border-white/30 bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-xl animate-fade-in rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-blue-50/50 via-indigo-50/50 to-violet-50/50 border-b border-gray-100/80 p-8">
            <CardTitle className="text-2xl text-center text-gray-800">
              학교 유형 선택
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 중학교 카드 */}
              <div 
                onClick={() => navigate("/create-report/middle")}
                className="relative overflow-hidden group cursor-pointer bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-100 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-8"
              >
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-yellow-200/30 rounded-full"></div>
                <div className="relative z-10 flex flex-col items-center gap-6 text-center">
                  <div className="p-4 bg-yellow-100 rounded-full">
                    <School className="h-12 w-12 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-yellow-800">중학교</h3>
                  <p className="text-yellow-700/80">중학교 내신시험 분석 리포트 작성</p>
                  <Button className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-md hover:shadow-lg transition-all mt-2">
                    중등부 리포트 작성하기
                  </Button>
                </div>
              </div>
              
              {/* 고등학교 카드 */}
              <div 
                onClick={() => navigate("/create-report/high")}
                className="relative overflow-hidden group cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-8"
              >
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-200/30 rounded-full"></div>
                <div className="relative z-10 flex flex-col items-center gap-6 text-center">
                  <div className="p-4 bg-blue-100 rounded-full">
                    <GraduationCap className="h-12 w-12 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-blue-800">고등학교</h3>
                  <p className="text-blue-700/80">고등학교 내신시험 분석 리포트 작성</p>
                  <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md hover:shadow-lg transition-all mt-2">
                    고등부 리포트 작성하기
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SchoolTypeSelector;
