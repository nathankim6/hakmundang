import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowRight, Download } from 'lucide-react';
import prepIcon from '@/assets/level-test-prep-icon.png';
import middleIcon from '@/assets/level-test-middle-icon.png';
import highIcon from '@/assets/level-test-high-icon.png';
import orunDialogLogo from '@/assets/orun-dialog-logo.jpg';
import { generatePrepTestDocx } from '@/utils/generatePrepTestDocx';
import { generateMiddleTestDocx } from '@/utils/generateMiddleTestDocx';
import { generateHighTestDocx } from '@/utils/generateHighTestDocx';
import { generatePrepVersionDocx } from '@/utils/generatePrepVersionDocx';

// Custom premium icons
import iconExamTake from '@/assets/icons/icon-exam-take.png';
import iconLevelTest from '@/assets/icons/icon-level-test.png';
import iconResults from '@/assets/icons/icon-results.png';
import iconStats from '@/assets/icons/icon-stats.png';
import iconTimer from '@/assets/icons/icon-timer.png';
import iconCreate from '@/assets/icons/icon-create.png';
const Index = () => {
  const [showLevelTestDialog, setShowLevelTestDialog] = useState(false);
  const [showPrepVersionDialog, setShowPrepVersionDialog] = useState(false);
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
    description: '초등부 · 뉴베리타스 186문항',
    iconSrc: prepIcon,
    available: true
  }, {
    id: 'middle',
    title: 'Middle',
    subtitle: '중등부',
    description: '중등부 · 흑석관 145문항 · 뉴베리타스 186문항',
    iconSrc: middleIcon,
    available: true
  }, {
    id: 'high',
    title: 'High',
    subtitle: '고등부',
    description: '고등부 · 고등학교 1~3학년 과정',
    iconSrc: highIcon,
    available: true
  }];
  const handleLevelTestSelect = (optionId: string, available: boolean) => {
    if (available) {
      if (optionId === 'high') {
        navigate('/level-test/high-school');
      } else if (optionId === 'prep') {
        navigate('/level-test/prep?version=v2');
      } else {
        setShowPrepVersionDialog(true);
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
    title: '레벨테스트',
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
  return <div className="min-h-screen flex flex-col bg-[#030014] relative overflow-hidden">
      {/* Cinematic Deep Space Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0015] via-[#050010] to-[#000008]" />
        
        {/* Aurora Effect */}
        <div className="aurora" />
        <div className="aurora-2" />
        
        {/* Milky Way */}
        <div className="milky-way" />
        
        {/* Nebula clouds */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[50%] rounded-full bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-transparent blur-[100px] animate-nebula-drift" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[50%] h-[40%] rounded-full bg-gradient-to-tl from-blue-950/30 via-cyan-950/15 to-transparent blur-[80px] animate-nebula-drift-reverse" />
        
        {/* Star fields */}
        <div className="absolute inset-0 star-field-far opacity-60" />
        <div className="absolute inset-0 star-field-mid opacity-50" />
        <div className="absolute inset-0 star-field-near opacity-40" />
        
        {/* Accent stars */}
        <div className="absolute top-[12%] left-[15%] w-1 h-1 rounded-full bg-white/80 animate-star-pulse" />
        <div className="absolute top-[45%] left-[8%] w-1 h-1 rounded-full bg-white/70 animate-star-pulse" style={{ animationDelay: '-3s' }} />
        <div className="absolute bottom-[35%] right-[12%] w-1 h-1 rounded-full bg-violet-200/60 animate-star-pulse" style={{ animationDelay: '-2s' }} />
        
        {/* Shooting stars */}
        <div className="shooting-star absolute top-[15%] left-[70%]" style={{ animationDelay: '0s' }} />
        <div className="shooting-star absolute top-[30%] left-[50%]" style={{ animationDelay: '3s' }} />
        <div className="shooting-star absolute top-[20%] left-[85%]" style={{ animationDelay: '6s' }} />
        <div className="shooting-star absolute top-[45%] left-[60%]" style={{ animationDelay: '9s' }} />
        
        {/* Cinematic vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_40%,rgba(0,0,0,0.6)_100%)]" />
        
        {/* Top/bottom bars */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent" />
      </div>

      {/* Main Content */}
      <div className="container relative z-10 py-4 md:py-16 px-4 flex-1 flex flex-col items-center justify-center">
        {/* Hero Section with Cinematic Intro */}
        <div className={`flex flex-col items-center mb-4 md:mb-16 transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Logo */}
          <div className={`relative mb-3 md:mb-10 transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`} style={{
          transitionDelay: '200ms'
        }}>
            {/* Glow ring */}
            <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-white/20 via-white/10 to-white/20 blur-xl animate-pulse" style={{
            animationDuration: '4s'
          }} />
            <img src="/lovable-uploads/dfeff1aa-43a0-40e0-8ab4-0adf870f1c74.png" alt="ORUN ACADEMY Logo" className="relative w-11 h-11 md:w-28 md:h-28 rounded-full border-2 border-white/20 shadow-2xl shadow-white/10" />
          </div>
          
          {/* Title */}
          <div className={`relative mb-2 md:mb-6 transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{
          transitionDelay: '400ms'
        }}>
            <h1 className="font-orbitron font-bold tracking-tight text-center w-full">
              <span className="text-shimmer block whitespace-nowrap text-[10.5vw] leading-none md:text-7xl lg:text-8xl">
                NEW VERITAS
              </span>
            </h1>
            {/* Subtle underline accent */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          </div>
          
          {/* Tagline */}
          <p className={`text-white/40 text-center text-[9px] md:text-sm tracking-widest uppercase transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{
          transitionDelay: '600ms'
        }}>
            옳은영어 개발 표준 시험 솔루션
          </p>
        </div>

        {/* Menu Grid with Staggered Animation */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3.5 md:gap-6 max-w-5xl mx-auto w-full">
          {menuItems.map((item, index) => {
          const CardWrapper = item.link ? Link : 'div';
          const wrapperProps = item.link ? {
            to: item.link
          } : {
            onClick: item.onClick
          };
          const delay = 800 + index * 100;
          const roman = ['I', 'II', 'III', 'IV', 'V', 'VI'][index] ?? '';
          return <CardWrapper key={item.title} {...wrapperProps as any} className={`group cursor-pointer transition-all duration-700 ease-out [perspective:1200px] ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{
            transitionDelay: `${delay}ms`
          }}>
                <Card className={`
                  relative h-full overflow-hidden
                  aspect-[4/5] md:aspect-[2/3]
                  bg-white
                  border border-amber-500/40
                  rounded-lg md:rounded-xl
                  shadow-[0_10px_40px_rgba(0,0,0,0.35)]
                  transition-all duration-500 ease-out
                  hover:border-amber-500/80
                  hover:-translate-y-3 hover:[transform:rotate(-1.2deg)_translateY(-12px)]
                  hover:shadow-[0_25px_60px_rgba(202,158,74,0.35),0_10px_40px_rgba(0,0,0,0.35)]
                  ${item.featured ? 'ring-1 ring-amber-500/50' : ''}
                `}>
                  {/* Burning white border glow on hover/focus */}
                  <div className="pointer-events-none absolute -inset-[1px] rounded-lg md:rounded-xl opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300 animate-burning-glow border-2 border-white/70" />

                  {/* Soft gold wash */}
                  <div className="absolute inset-0 pointer-events-none" />

                  {/* Inner gold frame */}
                  <div className="absolute inset-[5px] md:inset-[9px] rounded-md md:rounded-lg border border-amber-600/30 pointer-events-none" />
                  <div className="absolute inset-[9px] md:inset-[14px] rounded md:rounded-md border border-amber-600/15 pointer-events-none" />

                  {/* Corner flourishes */}
                  <div className="pointer-events-none absolute inset-[5px] md:inset-[9px]">
                    <span className="absolute -top-px -left-px w-3 h-3 md:w-4 md:h-4 border-t border-l border-amber-600/60 rounded-tl" />
                    <span className="absolute -top-px -right-px w-3 h-3 md:w-4 md:h-4 border-t border-r border-amber-600/60 rounded-tr" />
                    <span className="absolute -bottom-px -left-px w-3 h-3 md:w-4 md:h-4 border-b border-l border-amber-600/60 rounded-bl" />
                    <span className="absolute -bottom-px -right-px w-3 h-3 md:w-4 md:h-4 border-b border-r border-amber-600/60 rounded-br" />
                  </div>

                  {/* Shimmer sweep on hover */}
                  <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-amber-200/40 to-transparent" />

                  {/* Content */}
                  <div className="relative z-10 h-full px-3 py-4 md:px-5 md:py-6 flex flex-col items-center text-center">
                    {/* Roman numeral */}
                    <span className="font-cinzel text-[10px] md:text-xs tracking-[0.35em] text-amber-700/70">{roman}</span>
                    <div className="mt-1 md:mt-2 w-10 md:w-14 h-px bg-gradient-to-r from-transparent via-amber-600/50 to-transparent" />

                    {/* Arcana illustration */}
                    <div className="relative my-2 md:my-4 w-full flex-1 flex items-center justify-center">
                      <div className="absolute inset-0 bg-amber-400/20 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative w-full h-full max-h-[120px] md:max-h-none rounded-md md:rounded-lg overflow-hidden ring-1 ring-amber-600/30 group-hover:ring-amber-500/60 shadow-[0_6px_18px_rgba(0,0,0,0.12)] transition-all duration-500 group-hover:scale-[1.04]">
                        <img src={item.iconSrc} alt={item.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-amber-900/20 via-transparent to-white/10" />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-noto text-xs font-medium leading-tight md:text-2xl md:font-semibold tracking-tight text-black">
                      {item.title}
                    </h3>
                    <p className="hidden md:block mt-2 text-xs leading-relaxed text-black font-noto">
                      {item.description}
                    </p>

                    {/* Bottom seal */}
                    <div className="mt-2 md:mt-3 w-10 md:w-16 h-px bg-gradient-to-r from-transparent via-amber-600/50 to-transparent" />
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
                  <img src={orunDialogLogo} alt="ORUN Academy" className="relative w-10 h-10 object-contain rounded-lg" />
                </div>
                <span className="bg-gradient-to-r from-amber-200 to-yellow-300 bg-clip-text text-transparent">
                  옳은영어 레벨테스트
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
            <p className="text-center text-xs text-slate-500 font-medium">© ORUN ENGLISH · 옳은영어 레벨테스트</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Prep Version Selection Dialog */}
      <Dialog open={showPrepVersionDialog} onOpenChange={setShowPrepVersionDialog}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border border-slate-800 bg-slate-900">
          <div className="px-6 pt-7 pb-5 bg-gradient-to-br from-slate-800 to-slate-900">
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold text-white">
                중등부 시험지 선택
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="px-5 py-6 space-y-3">
            {[{ id: 'v1', title: '흑석관', desc: '145문항 · 기존 시험지' }, { id: 'v2', title: '뉴베리타스', desc: '186문항 · 문장구조 포함 신규 시험지' }].map(v => (
              <button
                key={v.id}
                onClick={() => {
                  setShowPrepVersionDialog(false);
                  setShowLevelTestDialog(false);
                  navigate(`/level-test/prep?version=${v.id}`);
                }}
                className="w-full text-left rounded-xl border border-slate-700 bg-slate-800/50 p-4 transition-all duration-300 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/10"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-lg font-bold text-white tracking-tight">{v.title}</h4>
                    <p className="text-sm text-slate-400 mt-0.5">{v.desc}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={e => {
                        e.stopPropagation();
                        generatePrepVersionDocx(v.id as 'v1' | 'v2');
                      }}
                      className="hidden md:flex flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-600 items-center justify-center hover:bg-emerald-500 transition-colors"
                      title="시험지 다운로드 (Word)"
                    >
                      <Download className="w-4 h-4 text-white" />
                    </span>
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
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