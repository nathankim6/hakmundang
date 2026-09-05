import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Clock, Play, Pause, RotateCcw, Timer, X, Maximize, Minimize } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";

interface TimerComponentProps {
  initialMinutes?: number;
  onClose?: () => void;
  expandable?: boolean;
}

const TimerComponent = ({ 
  initialMinutes = 45,
  onClose,
  expandable = true
}: TimerComponentProps) => {
  const [seconds, setSeconds] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [expanded, setExpanded] = useState(!expandable);
  const [customTime, setCustomTime] = useState(initialMinutes.toString());
  const [showCustomTimeInput, setShowCustomTimeInput] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerCardRef = useRef<HTMLDivElement>(null);

  const totalMinutes = seconds / 60;
  const wholeMinutes = Math.floor(totalMinutes);
  const remainingSeconds = seconds % 60;
  
  const displayTime = `${wholeMinutes.toString().padStart(1, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  
  const totalSeconds = initialMinutes * 60;
  const progressPercentage = (seconds / totalSeconds) * 100;
  
  useEffect(() => {
    audioRef.current = new Audio('/alarm.mp3');
    audioRef.current.volume = 0.7;
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSeconds(prevSeconds => {
          if (prevSeconds <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsRunning(false);
            
            if (audioRef.current) {
              audioRef.current.play().catch(error => console.log('Audio play error:', error));
            }
            
            toast({
              title: "시간이 종료되었습니다!",
              description: "제한 시간이 모두 경과했습니다.",
              variant: "destructive",
            });
            
            return 0;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);

  const togglePopup = () => {
    setIsPopupOpen(prev => !prev);
    if (!isPopupOpen) {
      toast({
        title: "큰 화면 모드",
        description: "타이머가 큰 화면으로 표시됩니다.",
      });
    }
  };

  const toggleTimer = () => {
    setIsRunning(prev => !prev);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSeconds(initialMinutes * 60);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleCustomTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setCustomTime(value);
  };

  const applyCustomTime = () => {
    const newMinutes = parseInt(customTime, 10) || initialMinutes;
    setIsRunning(false);
    setSeconds(newMinutes * 60);
    setShowCustomTimeInput(false);
    setInitialMinutes(newMinutes);
  };

  const setInitialMinutes = (mins: number) => {
    setCustomTime(mins.toString());
  };

  return (
    <>
      <Card 
        ref={timerCardRef}
        className={`shadow-md overflow-hidden transition-all duration-300 bg-white ${expanded ? 'w-80' : 'w-auto'}`}
      >
        <div className="p-4 bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-white" />
            <h3 className="font-medium text-white">시험 타이머</h3>
          </div>
          <div className="flex gap-1.5">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-white hover:bg-white/20 relative group"
              onClick={togglePopup}
              title="큰 화면으로 보기"
            >
              <Maximize className="h-4 w-4" />
              
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/75 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                큰 화면으로 보기
              </span>
              
              <span className="absolute inset-0 rounded-full animate-ping bg-blue-400 opacity-30"></span>
            </Button>
            
            {expandable && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-white hover:bg-white/20"
                onClick={() => setExpanded(prev => !prev)}
              >
                {expanded ? <X className="h-4 w-4" /> : <Timer className="h-4 w-4" />}
              </Button>
            )}
            
            {onClose && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-white hover:bg-white/20"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {expanded && (
          <div className="p-4 space-y-4">
            <div className="text-center">
              <div className="font-bold text-indigo-700 font-mono tracking-wider text-4xl">
                {displayTime}
              </div>
              <div className="relative h-2 mt-2">
                <Progress 
                  value={progressPercentage} 
                  className="h-2"
                />
              </div>
            </div>
            
            <div className="flex gap-2 justify-center">
              <Button
                onClick={toggleTimer}
                variant="outline"
                className={`${isRunning ? 'border-amber-400 hover:bg-amber-50' : 'border-emerald-400 hover:bg-emerald-50'} flex-1`}
              >
                {isRunning ? (
                  <>
                    <Pause className="mr-1 text-amber-500 h-4 w-4" />
                    일시정지
                  </>
                ) : (
                  <>
                    <Play className="mr-1 text-emerald-500 h-4 w-4" />
                    {seconds === 0 ? '다시 시작' : '시작'}
                  </>
                )}
              </Button>
              
              <Button
                onClick={resetTimer}
                variant="outline"
                className="border-blue-400 hover:bg-blue-50"
              >
                <RotateCcw className="mr-1 text-blue-500 h-4 w-4" />
                리셋
              </Button>
            </div>
            
            {showCustomTimeInput ? (
              <div className="flex gap-2 items-center mt-2">
                <input
                  type="text"
                  value={customTime}
                  onChange={handleCustomTimeChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') applyCustomTime();
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md text-center"
                  placeholder="시간(분)"
                  autoFocus
                />
                <Button
                  onClick={applyCustomTime}
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap"
                >
                  설정
                </Button>
              </div>
            ) : (
              <div className="flex gap-2 justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsRunning(false);
                    setSeconds(50 * 60);
                    setInitialMinutes(50);
                  }}
                  className={`${50 * 60 === seconds ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600'}`}
                >
                  50분(듣기 제외)
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsRunning(false);
                    setSeconds(70 * 60);
                    setInitialMinutes(70);
                  }}
                  className={`${70 * 60 === seconds ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600'}`}
                >
                  70분(듣기 포함)
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCustomTimeInput(true)}
                  className="text-gray-600"
                >
                  직접 입력
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* 큰 화면 팝업 모달 */}
      <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
        <DialogContent className="max-w-6xl w-[95vw] h-[95vh] p-0 overflow-hidden border-0" aria-describedby="timer-fullscreen-description">
          {/* Premium Background with Patterns */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Geometric Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
            {/* Radial Gradient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-radial from-indigo-500/10 via-transparent to-transparent" />
            {/* Corner Decorations */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-amber-500/10 to-transparent" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-indigo-500/10 to-transparent" />
            {/* Subtle Grid Lines */}
            <div className="absolute inset-0 opacity-[0.02]" style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '100px 100px',
            }} />
          </div>
          
          <div className="sr-only">
            <h2>타이머 전체화면</h2>
            <p id="timer-fullscreen-description">시험 타이머를 큰 화면으로 표시합니다.</p>
          </div>
          
          <div className="relative h-full flex flex-col justify-center items-center text-white p-8">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-6 right-6 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              onClick={() => setIsPopupOpen(false)}
            >
              <X className="h-7 w-7" />
            </Button>
            
            {/* Header with Logo Effect */}
            <div className="mb-12 text-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-4">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 animate-pulse" />
                <span className="text-sm font-medium tracking-widest text-white/80 uppercase">Exam Timer</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">브래니악 영어학원</span>
                <span className="text-white/40 mx-3">|</span>
                <span className="text-white/70 font-light">시험관리 시스템</span>
              </h1>
            </div>
            
            {/* Timer Display */}
            <div className="text-center mb-16">
              <div className="relative inline-block">
                {/* Glow Effect */}
                <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-indigo-500/30 scale-150" />
                {/* Timer Numbers */}
                <div className="relative font-bold font-mono tracking-tight text-[20vh] md:text-[25vh] leading-none bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent drop-shadow-2xl">
                  {displayTime}
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full max-w-2xl mx-auto mt-8">
                <div className="relative h-3 rounded-full bg-white/10 overflow-hidden backdrop-blur-sm border border-white/5">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${progressPercentage}%` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                </div>
              </div>
            </div>
            
            {/* Control Buttons */}
            <div className="flex gap-4 justify-center mb-10">
              <Button
                onClick={toggleTimer}
                className={`${isRunning 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/25' 
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/25'
                } text-white text-xl md:text-2xl py-6 md:py-8 px-10 md:px-14 rounded-2xl shadow-2xl border-0 transition-all duration-300 hover:scale-105`}
              >
                {isRunning ? (
                  <>
                    <Pause className="mr-3 h-7 w-7 md:h-8 md:w-8" />
                    일시정지
                  </>
                ) : (
                  <>
                    <Play className="mr-3 h-7 w-7 md:h-8 md:w-8" />
                    {seconds === 0 ? '다시 시작' : '시작'}
                  </>
                )}
              </Button>
              
              <Button
                onClick={resetTimer}
                className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white text-xl md:text-2xl py-6 md:py-8 px-10 md:px-14 rounded-2xl shadow-2xl shadow-slate-500/10 border-0 transition-all duration-300 hover:scale-105"
              >
                <RotateCcw className="mr-3 h-7 w-7 md:h-8 md:w-8" />
                리셋
              </Button>
            </div>
            
            {/* Time Presets */}
            {showCustomTimeInput ? (
              <div className="flex gap-4 items-center w-full max-w-md">
                <input
                  type="text"
                  value={customTime}
                  onChange={handleCustomTimeChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') applyCustomTime();
                  }}
                  className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-center text-2xl text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 backdrop-blur-sm"
                  placeholder="시간(분)"
                  autoFocus
                />
                <Button
                  onClick={applyCustomTime}
                  className="whitespace-nowrap text-lg py-4 px-6 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl"
                >
                  설정
                </Button>
              </div>
            ) : (
              <div className="flex gap-3 justify-center flex-wrap">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsRunning(false);
                    setSeconds(50 * 60);
                    setInitialMinutes(50);
                  }}
                  className={`${50 * 60 === seconds 
                    ? 'bg-white/15 text-white border-white/30' 
                    : 'text-white/60 hover:text-white hover:bg-white/10 border-white/10'
                  } text-lg py-5 px-6 rounded-xl border backdrop-blur-sm transition-all`}
                >
                  50분<span className="text-sm opacity-60 ml-1">(듣기 제외)</span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsRunning(false);
                    setSeconds(70 * 60);
                    setInitialMinutes(70);
                  }}
                  className={`${70 * 60 === seconds 
                    ? 'bg-white/15 text-white border-white/30' 
                    : 'text-white/60 hover:text-white hover:bg-white/10 border-white/10'
                  } text-lg py-5 px-6 rounded-xl border backdrop-blur-sm transition-all`}
                >
                  70분<span className="text-sm opacity-60 ml-1">(듣기 포함)</span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowCustomTimeInput(true)}
                  className="text-white/60 hover:text-white hover:bg-white/10 text-lg py-5 px-6 rounded-xl border border-white/10 backdrop-blur-sm transition-all"
                >
                  직접 입력
                </Button>
              </div>
            )}
            
            {/* Footer Branding */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
              <p className="text-xs text-white/30 tracking-widest uppercase">© BRAINIAC ENGLISH</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TimerComponent;
