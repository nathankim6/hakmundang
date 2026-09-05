import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    navigate('/analysis');
  };
  
  return <div className="relative overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 text-center space-y-6 max-w-4xl mx-auto">
        {/* Removed the inline-block with bg-white/50 here */}
        
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent inline-block
          animate-glow">NEW VERITAS</span>
          <br />
          <span className="text-slate-800">워크북 메이커</span>
        </h1>
        
        <div className="max-w-3xl mx-auto">
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            인공지능과 수작업을 결합한 영어 교재 제작 플랫폼으로, 
            <br className="hidden md:block" />
            지문 분석부터 유반어, 삽화까지 단계별 작업을 통해 완성도 높은 워크북을 제작할 수 있습니다
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8 max-w-2xl mx-auto text-left">
            {["모의고사 지문 데이터베이스 관리", "AI 기반 자동 콘텐츠 생성 및 편집", "수작업을 통한 정교함 향상"].map((feature, i) => <div key={i} className="flex items-center space-x-2">
                <div className="bg-green-100 rounded-full p-1 flex-shrink-0">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm text-slate-700">{feature}</span>
              </div>)}
          </div>
          
          <div className="flex justify-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-md" onClick={handleGetStarted}>
              시작하기
            </Button>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-slate-200">
          <blockquote className="relative italic text-lg text-slate-700 bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="absolute top-0 left-0 -ml-2 -mt-2 text-5xl text-purple-300 opacity-50">"</div>
            <p className="relative z-10 font-medium">&quot;Where automation ends, craftsmanship begins.&quot;</p>
            <div className="absolute bottom-0 right-0 -mr-2 -mb-2 text-5xl text-purple-300 opacity-50 self-end">"</div>
          </blockquote>
        </div>
      </div>
    </div>;
};

export default Hero;
