import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowRight, Download } from 'lucide-react';
import prepIcon from '@/assets/level-test-prep-icon.png';
import middleIcon from '@/assets/level-test-middle-icon.png';
import highIcon from '@/assets/level-test-high-icon.png';
import brainiacLogo from '@/assets/brainiac-logo.png.asset.json';
import orunLogo from '@/assets/orun-academy-logo.jpg';
import { generatePrepTestDocx } from '@/utils/generatePrepTestDocx';
import { generateMiddleTestDocx } from '@/utils/generateMiddleTestDocx';
import { generateHighTestDocx } from '@/utils/generateHighTestDocx';

// Custom premium icons
import iconExamTake from '@/assets/icons/icon-exam-take.png';
import iconLevelTest from '@/assets/icons/icon-level-test.png';
import iconResults from '@/assets/icons/icon-results.png';
import iconStats from '@/assets/icons/icon-stats.png';
import iconTimer from '@/assets/icons/icon-timer.png';
import iconCreate from '@/assets/icons/icon-create.png';
const Index = () => {
  const [showLevelTestDialog, setShowLevelTestDialog] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    // Trigger cinematic intro after mount
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);
  const levelTestOptions = [{
    id: 'prep',
    title: 'Prep',
    subtitle: '초등부',
    description: '초등 고학년 및 예비 중등 과정',
    iconSrc: prepIcon,
    available: true
  }, {
    id: 'middle',
    title: 'Middle',
    subtitle: '중등부',
    description: '중학교 1~3학년 과정',
    iconSrc: middleIcon,
    available: true
  }, {
    id: 'high',
    title: 'High',
    subtitle: '고등부',
    description: '고등학교 1~3학년 과정',
    iconSrc: highIcon,
    available: true
  }];
  const handleLevelTestSelect = (optionId: string, available: boolean) => {
    if (available) {
      if (optionId === 'high') {
        navigate('/level-test/high-school');
      } else if (optionId === 'prep') {
        navigate('/level-test/prep');
      } else {
        navigate('/level-test');
      }
    }
  };
  const menuItems = [{
    title: '시험 참여하기',
    description: '시험 참여 및 종료/재개',
    iconSrc: iconExamTake,
    link: '/tests',
    gradient: 'from-amber-400/80 to-amber-600/80'
  }, {
    title: '진단평가 (BEAT)',
    description: '문법·독해·어휘·구문 종합평가',
    iconSrc: iconLevelTest,
    onClick: () => setShowLevelTestDialog(true),
    gradient: 'from-amber-400/80 to-amber-600/80',
    featured: true
  }, {
    title: '결과 확인',
    description: '개별 시험 결과와 통계 확인',
    iconSrc: iconResults,
    link: '/results',
    gradient: 'from-amber-400/80 to-amber-600/80'
  }, {
    title: '누적 통계',
    description: '학생별 누적 성적 데이터 관리',
    iconSrc: iconStats,
    link: '/student-history',
    gradient: 'from-amber-400/80 to-amber-600/80'
  }, {
    title: '시험 타이머',
    description: '시험 시간 측정 및 관리',
    iconSrc: iconTimer,
    link: '/timer',
    gradient: 'from-amber-400/80 to-amber-600/80'
  }, {
    title: '시험 만들기',
    description: '관리자 도구로 신규 시험 생성',
    iconSrc: iconCreate,
    link: '/admin',
    gradient: 'from-amber-400/80 to-amber-600/80'
  }];
  return <div className="min-h-screen flex flex-col bg-[#02000a] relative overflow-hidden">
      {/* Radiant Cosmic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Deep space base with subtle blue-violet tint */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#0b1026_0%,_#050214_45%,_#02000a_100%)]" />
        
        {/* Brilliant aurora layers */}
        <div className="aurora-vibrant" />
        <div className="aurora-vibrant-2" />
        <div className="aurora-vibrant-3" />
        
        {/* Galactic core glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,_rgba(120,80,255,0.12)_0%,_rgba(60,30,120,0.08)_25%,_transparent_60%)] animate-core-pulse" />
        
        {/* Rich nebula clouds */}
        <div className="absolute top-[-15%] left-[-5%] w-[55%] h-[55%] rounded-full bg-gradient-to-br from-violet-600/25 via-fuchsia-500/15 to-transparent blur-[120px] animate-nebula-drift" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tl from-cyan-500/20 via-blue-600/15 to-transparent blur-[100px] animate-nebula-drift-reverse" />
        <div className="absolute top-[20%] right-[5%] w-[35%] h-[40%] rounded-full bg-gradient-to-bl from-amber-400/15 via-rose-500/10 to-transparent blur-[90px] animate-nebula-pulse" />
        
        {/* Star fields with enhanced brightness */}
        <div className="absolute inset-0 star-field-far opacity-80" />
        <div className="absolute inset-0 star-field-mid opacity-70" />
        <div className="absolute inset-0 star-field-near opacity-60" />
        <div className="absolute inset-0 star-field-bright opacity-50" />
        
        {/* Twinkling accent stars */}
        <div className="absolute top-[12%] left-[15%] w-1.5 h-1.5 rounded-full bg-white animate-star-twinkle" />
        <div className="absolute top-[45%] left-[8%] w-1 h-1 rounded-full bg-cyan-100/90 animate-star-twinkle" style={{ animationDelay: '-2s' }} />
        <div className="absolute bottom-[35%] right-[12%] w-1.5 h-1.5 rounded-full bg-violet-200/90 animate-star-twinkle" style={{ animationDelay: '-4s' }} />
        <div className="absolute top-[65%] left-[22%] w-1 h-1 rounded-full bg-amber-100/80 animate-star-twinkle" style={{ animationDelay: '-1.5s' }} />
        <div className="absolute top-[25%] right-[25%] w-1 h-1 rounded-full bg-fuchsia-200/80 animate-star-twinkle" style={{ animationDelay: '-3.5s' }} />
        
        {/* Shooting stars */}
        <div className="shooting-star absolute top-[12%] left-[75%]" style={{ animationDelay: '0s' }} />
        <div className="shooting-star absolute top-[28%] left-[55%]" style={{ animationDelay: '2.5s' }} />
        <div className="shooting-star absolute top-[18%] left-[88%]" style={{ animationDelay: '5s' }} />
        <div className="shooting-star absolute top-[42%] left-[62%]" style={{ animationDelay: '7.5s' }} />
        <div className="shooting-star absolute top-[55%] left-[40%]" style={{ animationDelay: '10s' }} />
        
        {/* Soft light rays */}
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,_transparent_0deg,_rgba(120,80,255,0.03)_60deg,_transparent_120deg,_transparent_180deg,_rgba(60,180,255,0.03)_240deg,_transparent_300deg)] animate-ray-rotate opacity-60" />
        
        {/* Cinematic vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_35%,rgba(0,0,0,0.7)_100%)]" />
        
        {/* Top/bottom bars */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/90 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/90 to-transparent" />
      </div>

      {/* Main Content */}
      <div className="container relative z-10 py-16 px-4 flex-1 flex flex-col items-center justify-center">
        {/* Hero Section with Cinematic Intro */}
        <div className={`flex flex-col items-center mb-16 transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Collaboration Logos */}
          <div className={`relative mb-10 transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`} style={{
          transitionDelay: '200ms'
        }}>
            {/* Glow ring */}
            <div className="absolute -inset-6 rounded-full bg-gradient-to-r from-amber-300/15 via-white/10 to-sky-300/15 blur-2xl animate-pulse" style={{
            animationDuration: '4s'
          }} />
            <div className="relative flex items-center gap-5">
              {/* ORUN Logo */}
              <div className="flex flex-col items-center gap-1.5">
                <img src={orunLogo} alt="옳은영어 Logo" className="w-24 h-24 rounded-full border-2 border-white/20 shadow-2xl shadow-amber-500/10 object-cover bg-white" />
              </div>

              {/* Brainiac Logo */}
              <div className="flex flex-col items-center gap-1.5">
                <img src={brainiacLogo.url} alt="Brainiac English Logo" className="w-24 h-24 rounded-full border-2 border-white/20 shadow-2xl shadow-sky-500/10 object-contain bg-white" />
              </div>
            </div>
          </div>
          
          {/* Title */}
          <div className={`relative mb-6 transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{
          transitionDelay: '400ms'
        }}>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-cinzel font-bold tracking-tight text-center">
              <span className="text-shimmer sm:text-5xl md:text-7xl lg:text-8xl text-7xl">
                NEW VERITAS
              </span>

            </h1>
            {/* Subtle underline accent */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          </div>
          
          {/* Tagline */}
          <p className={`text-white/40 text-center text-sm tracking-widest uppercase transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{
          transitionDelay: '600ms'
        }}>
            옳은영어 자체개발 표준시험 솔루션
          </p>
        </div>

        {/* Menu Grid with Staggered Animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto w-full">
          {menuItems.map((item, index) => {
          const CardWrapper = item.link ? Link : 'div';
          const wrapperProps = item.link ? {
            to: item.link
          } : {
            onClick: item.onClick
          };
          const delay = 800 + index * 100;
          return <CardWrapper key={item.title} {...wrapperProps as any} className={`group cursor-pointer transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{
            transitionDelay: `${delay}ms`
          }}>
                <Card className={`
                  relative h-full overflow-hidden
                  bg-white
                  border border-white/80
                  rounded-2xl
                  shadow-[0_8px_32px_rgba(0,0,0,0.15)]
                  transition-all duration-500 ease-out
                  hover:border-amber-500/30
                  hover:-translate-y-2
                  hover:shadow-[0_20px_50px_rgba(251,191,36,0.15),0_8px_32px_rgba(0,0,0,0.4)]
                  ${item.featured ? 'ring-1 ring-amber-400/30 shadow-[0_8px_32px_rgba(251,191,36,0.1)]' : ''}
                `}>
                  {/* Ambient glow */}
                  <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-amber-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  
                  {/* Inner highlight */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  
                  {/* Top accent line with glow */}
                  <div className={`
                    absolute top-0 left-0 right-0 h-[2px]
                    bg-gradient-to-r from-transparent via-amber-400 to-transparent
                    transform origin-center scale-x-0 group-hover:scale-x-100
                    transition-transform duration-500
                    shadow-[0_0_20px_rgba(251,191,36,0.5)]
                  `} />
                  
                  {/* Content */}
                  <div className="relative z-10 p-7 flex flex-col items-center text-center">
                    {/* Icon container with glow */}
                    <div className="relative mb-5">
                      <div className="absolute -inset-2 bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative w-18 h-18 rounded-xl overflow-hidden ring-1 ring-white/10 group-hover:ring-amber-500/30 transition-all duration-300 group-hover:scale-110">
                        <img src={item.iconSrc} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                    </div>
                    
                    {/* Text */}
                    <h3 className="text-lg font-bold mb-2 tracking-tight transition-colors duration-300" style={{
                  color: '#1e293b'
                }}>
                      {item.title}
                    </h3>
                    <p className="text-sm mb-5 leading-relaxed transition-colors duration-300" style={{
                  color: '#475569'
                }}>
                      {item.description}
                    </p>
                    
                    {/* Premium Button */}
                    <div className={`
                      relative flex items-center gap-2 px-5 py-2.5 rounded-full
                      bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500
                      text-sm font-bold
                      shadow-[0_4px_20px_rgba(251,191,36,0.4)]
                      group-hover:shadow-[0_6px_30px_rgba(251,191,36,0.5)]
                      group-hover:gap-3
                      transition-all duration-300
                      overflow-hidden
                    `}>
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="relative z-10" style={{
                    color: '#1a1a1a'
                  }}>시작하기</span>
                      
                    </div>
                  </div>
                </Card>
              </CardWrapper>;
        })}
        </div>
      </div>

      {/* Level Test Selection Dialog */}
      <Dialog open={showLevelTestDialog} onOpenChange={setShowLevelTestDialog}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-0 shadow-2xl bg-slate-900 border border-slate-800">
          {/* Premium Header */}
          <div className="relative px-6 pt-8 pb-6 bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
            <DialogHeader className="relative">
              <DialogTitle className="flex items-center justify-center gap-3 text-2xl font-bold tracking-tight text-white">
                <div className="relative">
                  <div className="absolute -inset-1 bg-amber-500/30 rounded-lg blur" />
                  <img src={brainiacLogo.url} alt="Brainiac English" className="relative w-10 h-10 object-contain rounded-lg" />
                </div>
                <span className="bg-gradient-to-r from-amber-200 to-yellow-300 bg-clip-text text-transparent">
                  브래니악 영어 진단평가(BEAT)
                </span>
              </DialogTitle>
            </DialogHeader>
          </div>
          
          {/* Options List */}
          <div className="px-5 py-6 space-y-3">
            {levelTestOptions.map(option => <div key={option.id} onClick={() => handleLevelTestSelect(option.id, option.available)} className={`
                  group relative overflow-hidden rounded-xl border p-4 
                  transition-all duration-300 
                  ${option.available ? 'cursor-pointer hover:shadow-lg hover:shadow-amber-500/10 hover:border-amber-500/30 border-slate-700 bg-slate-800/50' : 'cursor-not-allowed opacity-50 border-slate-800 bg-slate-900/50'}
                `}>
                <div className="relative flex items-center gap-4">
                  <div className="relative w-14 h-14 flex items-center justify-center bg-slate-800 rounded-xl border border-slate-700 group-hover:bg-slate-700 transition-colors">
                    <img src={option.iconSrc} alt={option.title} className="w-10 h-10 object-contain" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-lg text-white tracking-tight">
                        {option.title}
                      </h4>
                      <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-medium">
                        {option.subtitle}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mt-0.5">{option.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {option.available && <button onClick={e => {
                  e.stopPropagation();
                  if (option.id === 'prep') {
                    generatePrepTestDocx();
                  } else if (option.id === 'middle') {
                    generateMiddleTestDocx();
                  } else if (option.id === 'high') {
                    generateHighTestDocx();
                  }
                }} className="hidden md:flex flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-600 items-center justify-center hover:bg-emerald-500 transition-colors" title="시험지 다운로드 (Word)">
                        <Download className="w-4 h-4 text-white" />
                      </button>}
                    {option.available && <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <ArrowRight className="w-4 h-4 text-white" />
                      </div>}
                  </div>
                </div>
              </div>)}
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 bg-slate-800/50 border-t border-slate-700">
            <p className="text-center text-xs text-slate-500 font-medium">© BRAINIAC ENGLISH · 브래니악 영어 진단평가(BEAT)</p>
          </div>
        </DialogContent>
      </Dialog>


      {/* Minimal Footer */}
      <footer className="relative z-10 w-full py-6 border-t border-white/5">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-xs text-white/30 font-medium">© 2026 ORUN ACADEMY</p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-white/25 hover:text-white/50 text-xs transition-colors">이용약관</a>
              <a href="#" className="text-white/25 hover:text-white/50 text-xs transition-colors">개인정보처리방침</a>
              <a href="#" className="text-white/25 hover:text-white/50 text-xs transition-colors">문의하기</a>
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;