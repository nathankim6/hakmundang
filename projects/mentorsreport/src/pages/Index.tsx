import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SaveAll, FileText, Plus, Sparkles, ChevronRight } from "lucide-react";
const Index: React.FC = () => {
  const navigate = useNavigate();

  // Add a console log to check if component is rendering
  console.info("Index component rendering");
  return <div className="relative bg-gradient-to-br from-slate-50 via-blue-50/10 to-indigo-50/10 min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-200/10 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-200/10 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-200/10 blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto">
        <div className="flex justify-end mb-8">
          <Button onClick={() => navigate("/saved-reports")} variant="outline" className="rounded-lg px-4 py-2 flex items-center gap-2 transition-all duration-200 hover:shadow-md">
            <SaveAll className="h-4 w-4" />
            <span className="font-medium">저장된 리포트</span>
          </Button>
        </div>
        
        {/* Main Hero Section */}
        <div className="flex flex-col lg:flex-row gap-8 items-center justify-between mb-12">
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900">
                내신시험 
                <span className="bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">분석 리포트</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-xl">전문가집단 내신시험 분석 웹 애플리케이션</p>
            </div>
            
            <Button onClick={() => navigate("/create-report")} className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-6 py-6 text-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="h-5 w-5" />
              <span>새 리포트 작성하기</span>
              <ChevronRight className="h-5 w-5 ml-1" />
            </Button>
          </div>
          
          <div className="flex-1 flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl opacity-70 blur-lg group-hover:opacity-100 transition duration-1000"></div>
              <div className="relative bg-white rounded-2xl p-6 shadow-2xl">
                <img alt="Orun Academy Logo" className="h-64 w-auto object-contain" src="/lovable-uploads/101e1306-0dd8-43db-a1b1-51081528f0ad.png" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="p-4 bg-blue-600 rounded-lg w-fit mb-6 shadow-md">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">상세한 분석</h3>
            <p className="text-gray-600"></p>
          </div>
          
          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="p-4 bg-indigo-600 rounded-lg w-fit mb-6 shadow-md">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">맞춤형 피드백</h3>
            <p className="text-gray-600"></p>
          </div>
          
          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="p-4 bg-violet-600 rounded-lg w-fit mb-6 shadow-md">
              <SaveAll className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">편리한 저장</h3>
            <p className="text-gray-600"></p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-16 text-center text-sm text-gray-500">
          <p>© 2025 전문가집단 영어학원 All Rights Reserved</p>
        </div>
      </div>
    </div>;
};
export default Index;