import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SaveAll, Plus, ChevronRight, FileText, Sparkles, BarChart3 } from "lucide-react";

const Index: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative bg-gradient-to-br from-white via-rose-50/30 to-pink-50/30 min-h-screen flex flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-rose-200/30 to-pink-200/30 blur-3xl animate-pulse-glow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-pink-200/30 to-rose-300/20 blur-3xl animate-pulse-glow animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-rose-100/30 to-pink-100/30 blur-3xl animate-pulse-glow animation-delay-4000"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#6B1D3A08_1px,transparent_1px),linear-gradient(to_bottom,#6B1D3A08_1px,transparent_1px)] bg-[size:48px_48px]"></div>
        
        {/* Floating elements */}
        <div className="absolute top-20 right-20 w-32 h-32 border border-rose-300/20 rounded-lg rotate-12 animate-pulse"></div>
        <div className="absolute bottom-32 left-32 w-24 h-24 border border-pink-300/20 rounded-lg -rotate-12 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row gap-16 items-center justify-between mb-16">
          <div className="flex-1 space-y-10">
            <div className="space-y-6">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none">
                <span className="block text-foreground mb-3 drop-shadow-lg">Pcube</span>
                <span className="block bg-gradient-to-r from-primary via-rose-700 to-pink-700 bg-clip-text text-transparent animate-gradient-text drop-shadow-lg">
                  분석리포트
                </span>
              </h1>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                onClick={() => navigate("/create-report")}
                className="group relative rounded-2xl bg-gradient-to-r from-primary via-rose-700 to-pink-700 hover:from-rose-800 hover:via-rose-600 hover:to-pink-600 text-primary-foreground px-10 py-8 text-lg font-bold flex items-center justify-center gap-3 shadow-[0_8px_30px_hsl(340_56%_27%/0.35)] hover:shadow-[0_12px_40px_hsl(340_56%_27%/0.5)] transition-all duration-300 hover:scale-105 overflow-hidden border-2 border-rose-400/20"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <Plus className="h-6 w-6 relative z-10" />
                <span className="relative z-10">새 리포트 작성</span>
                <ChevronRight className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform relative z-10" />
              </Button>
              
              <Button
                onClick={() => navigate("/saved-reports")}
                variant="outline"
                className="group rounded-2xl border-2 border-rose-300 bg-white/80 backdrop-blur-xl hover:bg-white hover:border-primary text-foreground px-10 py-8 text-lg font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-[0_8px_30px_hsl(340_56%_27%/0.15)] transition-all duration-300 hover:scale-105"
              >
                <SaveAll className="h-6 w-6 text-primary" />
                <span>저장된 리포트</span>
                <ChevronRight className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
          
          <div className="flex-1 flex justify-center lg:justify-end">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary via-rose-600 to-pink-600 rounded-[2rem] opacity-40 blur-3xl group-hover:opacity-60 transition-all duration-700 animate-pulse-glow"></div>
              <div className="relative bg-white rounded-3xl p-10 shadow-2xl border-2 border-rose-200 backdrop-blur-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-pink-50/50 rounded-3xl"></div>
                <img src="/lovable-uploads/pcube-logo.png" alt="Pcube Academy Logo" className="relative h-80 w-auto object-contain drop-shadow-[0_10px_40px_hsl(340_56%_27%/0.25)] group-hover:scale-105 transition-transform duration-500" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          <div className="group relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border-2 border-rose-200 hover:border-primary transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_hsl(340_56%_27%/0.15)] shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 via-pink-50/30 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="inline-flex p-5 bg-gradient-to-br from-primary to-rose-700 rounded-2xl mb-6 shadow-[0_10px_30px_hsl(340_56%_27%/0.35)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <BarChart3 className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-black text-foreground mb-4 tracking-tight">정밀한 분석</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">모든 문제 유형을 체계적으로 분석하여 맞춤형 학습 전략을 제시합니다</p>
            </div>
          </div>
          
          <div className="group relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border-2 border-rose-200 hover:border-rose-500 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_hsl(340_56%_27%/0.15)] md:mt-6 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 via-rose-50/30 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="inline-flex p-5 bg-gradient-to-br from-rose-700 to-pink-700 rounded-2xl mb-6 shadow-[0_10px_30px_hsl(340_56%_27%/0.35)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Sparkles className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-black text-foreground mb-4 tracking-tight">간편한 작성</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">직관적인 인터페이스로 몇 번의 클릭만으로 전문가 수준의 리포트를 생성합니다</p>
            </div>
          </div>
          
          <div className="group relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border-2 border-rose-200 hover:border-pink-500 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_hsl(340_56%_27%/0.15)] shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 via-pink-50/30 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="inline-flex p-5 bg-gradient-to-br from-pink-700 to-primary rounded-2xl mb-6 shadow-[0_10px_30px_hsl(340_56%_27%/0.35)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <SaveAll className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-black text-foreground mb-4 tracking-tight">즉시 확인</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">클라우드 기반 저장소로 언제 어디서나 리포트를 확인하고 공유할 수 있습니다</p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-32 pt-10 border-t border-border">
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground font-medium tracking-wide">
              Copyright © {new Date().getFullYear()} <span className="font-bold text-primary">Pcube Academy</span>. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
