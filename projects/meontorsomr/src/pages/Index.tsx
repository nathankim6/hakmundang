import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, PenLine, ChartBar, BarChart3 } from 'lucide-react';
const Index = () => {
  return <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50">
      <div className="container py-12 px-4">
        <div className="flex flex-col items-center mb-10 animate-fade-in">
          <div className="relative mb-6">
            <div className="absolute -inset-1 bg-gradient-to-r from-sky-200 to-indigo-200 rounded-full opacity-75 blur"></div>
            <img src="/lovable-uploads/0cab23e5-4bd6-4193-a4df-b6773902a389.png" alt="ORUN ACADEMY Logo" className="relative w-28 h-28 rounded-full border-4 border-white shadow-xl" />
          </div>
          <h1 className="md:text-5xl font-bold mb-3 text-center text-5xl metallic-gradient-text">Mentors Table</h1>
          <p className="text-slate-600 text-center max-w-md text-xs">전문가집단영어학원  표준 시험 솔루션</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Link to="/tests" className="group">
            <Card className="h-full p-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-lg border border-slate-100">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <PenLine className="h-7 w-7 text-sky-700" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">시험 참여하기</h3>
              <p className="text-slate-600 text-sm mb-4">시험에 참여하고 즉시 결과를 확인하세요</p>
              <Button className="w-full bg-sky-500 hover:bg-sky-600 text-white">
                시작하기
              </Button>
            </Card>
          </Link>
          
          <Link to="/admin" className="group">
            <Card className="h-full p-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-lg border border-slate-100">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="h-7 w-7 text-indigo-700" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">시험 만들기</h3>
              <p className="text-slate-600 text-sm mb-4">관리자 도구로 신규 시험을 생성하세요</p>
              <Button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white">
                관리자 도구
              </Button>
            </Card>
          </Link>

          <Link to="/results" className="group">
            <Card className="h-full p-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-lg border border-slate-100">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-7 w-7 text-purple-700" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">결과 확인하기</h3>
              <p className="text-slate-600 text-sm mb-4">학생들의 시험 결과와 통계를 확인하세요</p>
              <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white">
                결과 보기
              </Button>
            </Card>
          </Link>
        </div>
      </div>

      <footer className="w-full py-6 border-t border-slate-200 bg-white/50 backdrop-blur-sm">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-slate-600">© 2025 Mentors Table. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-slate-600 hover:text-sky-600 text-sm">이용약관</a>
              <a href="#" className="text-slate-600 hover:text-sky-600 text-sm">개인정보처리방침</a>
              <a href="#" className="text-slate-600 hover:text-sky-600 text-sm">문의하기</a>
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;
