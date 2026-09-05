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
          {/* Editorial dark canvas */}
          <div className="absolute inset-0 bg-[#0b0f14]">
            <div className="absolute inset-0 opacity-[0.05]" style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)`,
              backgroundSize: '64px 64px',
              maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 75%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 75%)',
            }} />
            <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] rounded-full bg-[radial-gradient(circle,rgba(212,175,110,0.14),transparent_60%)] blur-3xl" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.12),transparent_60%)] blur-3xl" />
            <div className="absolute inset-6 rounded-[28px] border border-white/[0.06]" />
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
            
            {/* Header */}
            <div className="mb-10 text-center">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md mb-5">
                <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400/80'}`} />
                <span className="text-[11px] font-medium tracking-[0.35em] text-white/60 uppercase">Exam Timer</span>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-[0.15em] text-white uppercase">
                옳은영어
              </h1>
              <p className="mt-3 text-lg md:text-2xl font-light tracking-[0.2em] text-white/50 uppercase">
                시험관리 시스템
              </p>
            </div>
            
            {/* Timer Display */}
            <div className="text-center mb-14 w-full">
              <div className="relative inline-block">
                <div className="absolute inset-0 blur-[100px] bg-[radial-gradient(circle,rgba(255,255,255,0.16),transparent_65%)] scale-125" />
                <div className="relative font-mono font-light tabular-nums tracking-[-0.03em] text-[20vh] md:text-[26vh] leading-[0.85] bg-gradient-to-b from-white via-white to-white/45 bg-clip-text text-transparent">
                  {displayTime}
                </div>
              </div>

              {/* Progress */}
              <div className="w-full max-w-3xl mx-auto mt-10">
                <div className="flex items-center justify-between mb-3 text-[10px] tracking-[0.3em] uppercase text-white/35">
                  <span>Remaining</span>
                  <span className="tabular-nums">{Math.round(progressPercentage)}%</span>
                </div>
                <div className="relative h-[3px] rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100 shadow-[0_0_18px_rgba(251,191,36,0.5)] transition-all duration-1000 ease-linear"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
            
            {/* Control Buttons */}
            <div className="flex gap-3 justify-center mb-10">
              <Button
                onClick={toggleTimer}
                className="group bg-white text-[#0b0f14] hover:bg-white/90 text-base md:text-lg font-medium py-5 md:py-7 px-9 md:px-12 rounded-full border-0 shadow-[0_10px_40px_-12px_rgba(255,255,255,0.45)] transition-all duration-300 hover:-translate-y-0.5"
              >
                {isRunning ? (
                  <>
                    <Pause className="mr-2.5 h-5 w-5 md:h-6 md:w-6" />
                    일시정지
                  </>
                ) : (
                  <>
                    <Play className="mr-2.5 h-5 w-5 md:h-6 md:w-6" />
                    {seconds === 0 ? '다시 시작' : '시작'}
                  </>
                )}
              </Button>

              <Button
                onClick={resetTimer}
                className="bg-white/[0.04] hover:bg-white/[0.09] text-white/80 hover:text-white text-base md:text-lg font-medium py-5 md:py-7 px-9 md:px-12 rounded-full border border-white/15 backdrop-blur-md shadow-none transition-all duration-300 hover:-translate-y-0.5"
              >
                <RotateCcw className="mr-2.5 h-5 w-5 md:h-6 md:w-6" />
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
                  className="w-full p-4 bg-white/[0.05] border border-white/15 rounded-full text-center text-xl tabular-nums text-white placeholder:text-white/30 focus:outline-none focus:border-white/35 backdrop-blur-md"
                  placeholder="시간(분)"
                  autoFocus
                />
                <Button
                  onClick={applyCustomTime}
                  className="whitespace-nowrap text-base py-4 px-7 bg-white/[0.06] hover:bg-white/15 text-white border border-white/15 rounded-full"
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
                    ? 'bg-white/[0.12] text-white border-white/25'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.07] border-white/10'
                  } text-sm tracking-wide py-4 px-6 rounded-full border backdrop-blur-md transition-all`}
                >
                  50분<span className="text-xs opacity-50 ml-1.5">듣기 제외</span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsRunning(false);
                    setSeconds(70 * 60);
                    setInitialMinutes(70);
                  }}
                  className={`${70 * 60 === seconds
                    ? 'bg-white/[0.12] text-white border-white/25'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.07] border-white/10'
                  } text-sm tracking-wide py-4 px-6 rounded-full border backdrop-blur-md transition-all`}
                >
                  70분<span className="text-xs opacity-50 ml-1.5">듣기 포함</span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowCustomTimeInput(true)}
                  className="text-white/50 hover:text-white hover:bg-white/[0.07] text-sm tracking-wide py-4 px-6 rounded-full border border-white/10 backdrop-blur-md transition-all"
                >
                  직접 입력
                </Button>
              </div>
            )}
            
            {/* Footer Branding */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
              <p className="text-[10px] text-white/25 tracking-[0.4em] uppercase">© ORUN ENGLISH</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TimerComponent;
