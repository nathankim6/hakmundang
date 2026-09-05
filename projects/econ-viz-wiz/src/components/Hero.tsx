import { BookOpen, TrendingUp } from "lucide-react";

const Hero = () => {
  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-primary-light text-primary-foreground">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
      
      <div className="container relative mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col items-center text-center animate-fade-in">
          <div className="mb-6 flex items-center gap-3 rounded-full bg-white/10 backdrop-blur-sm px-6 py-3 border border-white/20">
            <BookOpen className="w-5 h-5" />
            <span className="text-sm font-medium">경제학 핵심 개념</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            절대우위 · 비교우위<br />
            <span className="text-white/90">쉽게 푸는 초간단 팁</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl">
            사회문화 계산 문제, 이 공식만 알면 바로 끝!
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">10초 컷 문제풀이</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
              <span className="text-sm">✓ 공식 정리</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
              <span className="text-sm">✓ 예시 포함</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent"></div>
    </header>
  );
};

export default Hero;
