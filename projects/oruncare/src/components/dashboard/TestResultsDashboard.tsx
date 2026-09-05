import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTestSchedules } from '@/hooks/test-schedules/useTestSchedules';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, CheckCircle2, XCircle, UserRound, BarChart2, Calendar, CircuitBoard, ClipboardCheck, Activity, Gauge, Zap, Clock, TrendingUp, Users, Target, Award } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { format, isSameDay, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, BarChart, Bar, LineChart, Line } from 'recharts';
import { TestSchedule } from '@/types/calendar';
import { Carousel, CarouselContent, CarouselDots, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TestResultsDashboardProps {
  selectedDate: Date;
  onClose?: () => void;
  selectedTeacher?: string;
  key?: string; // Add key prop for forcing re-renders
}

interface StudentInfo {
  id: string;
  name: string;
  className: string;
  data: string;
}

interface ResultPanelProps {
  title: string;
  color: string;
  icon: React.ReactNode;
  students: StudentInfo[];
}

const TestResultsDashboard: React.FC<TestResultsDashboardProps> = ({
  selectedDate,
  onClose,
  selectedTeacher = 'all'
}) => {
  const queryClient = useQueryClient();
  const {
    testSchedules
  } = useTestSchedules(selectedTeacher);
  const [dateStr, setDateStr] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeSystems, setActiveSystems] = useState(0);
  const [refreshCountdown, setRefreshCountdown] = useState(30);
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Auto-refresh functionality
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing dashboard data...');
      queryClient.invalidateQueries({
        queryKey: ['test_schedules']
      });
      setRefreshCountdown(30); // Reset countdown
    }, 30000); // 30 seconds

    const countdownInterval = setInterval(() => {
      setRefreshCountdown(prev => prev > 0 ? prev - 1 : 30);
    }, 1000); // Update countdown every second

    return () => {
      clearInterval(refreshInterval);
      clearInterval(countdownInterval);
    };
  }, [queryClient]);
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [selectedDate]);
  useEffect(() => {
    const systemsCount = Math.floor(Math.random() * 4) + 5; // Random number between 5-8
    setActiveSystems(systemsCount);
    const intervalId = setInterval(() => {
      setActiveSystems(Math.floor(Math.random() * 4) + 5);
    }, 10000);
    return () => clearInterval(intervalId);
  }, []);
  useEffect(() => {
    setDateStr(format(selectedDate, 'yyyy년 M월 d일 (eee)', {
      locale: ko
    }));
    const updateClock = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      setCurrentTime(timeString);
    };
    updateClock();
    const timerId = setInterval(updateClock, 1000);
    return () => clearInterval(timerId);
  }, [selectedDate]);
  useEffect(() => {
    if (!isLoading && dashboardRef.current) {
      const elements = dashboardRef.current.querySelectorAll('.cyber-animate-in');
      elements.forEach((el, index) => {
        const element = el as HTMLElement;
        element.style.animationDelay = `${index * 0.05}s`;
        element.classList.add('animate-fade-in');
      });
    }
  }, [isLoading]);
  useEffect(() => {
    console.log('TestResultsDashboard rendering with date:', format(selectedDate, 'yyyy-MM-dd'));
  }, [selectedDate]);
  const todayTests = testSchedules.filter(schedule => {
    if (!schedule.test_date) return false;
    const scheduleDate = parseISO(schedule.test_date);
    return isSameDay(scheduleDate, selectedDate);
  });
  const passedTests = todayTests.filter(test => test.result === 'pass');
  const failedTests = todayTests.filter(test => test.result === 'fail');
  const absentTests = todayTests.filter(test => test.result === 'absent');
  const notTakenTests = todayTests.filter(test => !test.result || test.result === 'not-taken');
  const total = todayTests.length;
  const passCount = passedTests.length;
  const failCount = failedTests.length;
  const absentCount = absentTests.length;
  const notTakenCount = notTakenTests.length;
  const passRate = total > 0 ? Math.round(passCount / total * 100) : 0;
  const pieData = [{
    name: '통과',
    value: passCount,
    color: '#00E5FF'
  }, {
    name: '미통과',
    value: failCount,
    color: '#FF3D71'
  }, {
    name: '미응시',
    value: absentCount,
    color: '#FFD76E'
  }, {
    name: '미응시',
    value: notTakenCount,
    color: '#6E7191'
  }];
  const performanceData = [{
    name: '1주',
    통과율: 65
  }, {
    name: '2주',
    통과율: 68
  }, {
    name: '3주',
    통과율: 62
  }, {
    name: '4주',
    통과율: 70
  }, {
    name: '5주',
    통과율: passRate
  }];
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    value
  }: any) => {
    if (value === 0) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return <text x={x} y={y} fill="#FFFFFF" textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight="normal" className="cyber-text">
        {`${(percent * 100).toFixed(0)}%`}
      </text>;
  };
  if (isLoading) {
    return <div className="h-full flex flex-col bg-cyber-black text-white">
        <div className="flex-1 flex flex-col items-center justify-center cyber-grid">
          <div className="cyber-scanline"></div>
          <div className="w-20 h-20 mb-6 relative">
            <CircuitBoard className="h-20 w-20 text-cyber-blue animate-pulse" />
            <div className="absolute inset-0 cyber-scanning-line"></div>
          </div>
          <h2 className="text-2xl font-normal font-blackhan text-cyber-blue mb-4 cyber-glitch-text">시스템 초기화 중...</h2>
          <div className="w-64 h-2 bg-cyber-dark rounded-full overflow-hidden">
            <div className="h-full bg-cyber-blue animate-shimmer" style={{
            backgroundSize: '200% 100%'
          }}></div>
          </div>
          <p className="mt-4 text-sm font-noto font-light opacity-70 typing-effect">모든 시스템 가동 준비중...</p>
        </div>
      </div>;
  }
  if (todayTests.length === 0) {
    return <div className="h-full flex flex-col bg-cyber-black text-white cyber-grid">
        <div className="cyber-scanline"></div>
        <header className="p-6 border-b border-cyber-blue/30 flex justify-between items-center">
          <div>
            <div className="text-xs text-cyber-gray mb-1 font-noto font-light">REPORT DATE</div>
            <h2 className="text-xl font-normal font-blackhan text-white cyber-glitch-text">{dateStr} <span className="text-cyber-blue">Review Time</span></h2>
          </div>
          
          <div className="flex-1 flex justify-center items-center">
            <ClockDisplay currentTime={currentTime} />
          </div>
          
          <div className="flex items-center gap-2">
            <StatusBadge status="online" label={`${activeSystems} 시스템 활성화`} />
            <div className="bg-cyber-dark p-2 rounded-md border border-cyber-blue/30 cyber-glow">
              <span className="text-xs font-noto text-cyber-gray font-light">자동 새로고침</span>
              <span className="text-sm font-normal font-blackhan text-cyber-blue cyber-pulse-text ml-2">{refreshCountdown}초</span>
            </div>
            {onClose && <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-cyber-dark">
                <X className="h-6 w-6" />
              </Button>}
          </div>
        </header>
        
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
          <div className="absolute inset-0 bg-gradient-cyber-glow"></div>
          <div className="cyber-scanning-line"></div>
          <div className="w-32 h-32 rounded-full border-4 border-cyber-blue/30 relative flex items-center justify-center mb-8 cyber-glow">
            <CircuitBoard className="h-16 w-16 text-cyber-blue/70" />
            <div className="absolute inset-0 rounded-full border-2 border-cyber-blue/20 animate-rotate-slow"></div>
          </div>
          <h3 className="text-2xl font-normal font-blackhan mb-2 text-cyber-blue cyber-glitch-text">검색 결과 없음</h3>
          <p className="font-noto font-light text-center max-w-md text-cyber-gray">
            선택한 날짜에 시험 일정이 없습니다. 다른 날짜를 선택하거나 시험 일정을 추가해주세요.
          </p>
          
          <div className="mt-10 grid grid-cols-3 gap-6 w-full max-w-2xl">
            <MetricCard icon={<ClipboardCheck className="h-6 w-6" />} title="총 검사" value="0건" trend={{
            direction: 'neutral',
            value: '0%'
          }} />
            <MetricCard icon={<Activity className="h-6 w-6" />} title="통과율" value="N/A" trend={{
            direction: 'neutral',
            value: ''
          }} />
            <MetricCard icon={<UserRound className="h-6 w-6" />} title="학생" value="0명" trend={{
            direction: 'neutral',
            value: '0명'
          }} />
          </div>
        </div>
      </div>;
  }
  return <div ref={dashboardRef} className="h-full flex flex-col bg-cyber-black text-white overflow-auto cyber-grid cyber-scrollbar">
      <div className="cyber-scanline"></div>
      
      <header className="px-6 py-5 border-b border-white/10 sticky top-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 z-10 flex justify-between items-center backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-8">
          {/* Logo Section */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-70 group-hover:opacity-100"></div>
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-white/10 shadow-lg shadow-black/30 bg-slate-900/50">
              <img src="/lovable-uploads/9bd29e07-f65d-4b77-93de-1fccfda8c552.png" alt="Orun Academy Logo" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent"></div>
            </div>
          </div>
          
          {/* Date & Title Section */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium tracking-widest uppercase">
              <Calendar className="h-3.5 w-3.5 text-cyan-400" /> 
              <span>Report Date</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                {dateStr}
              </span>
            </h2>
            
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                <Clock className="h-4 w-4 text-cyan-400 animate-pulse" />
                <span className="text-sm font-semibold text-cyan-300">Review Time</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Clock Display */}
        <div className="flex-1 flex justify-center items-center mx-8">
          <ClockDisplay currentTime={currentTime} />
        </div>
        
        {/* Right Stats Section */}
        <div className="flex items-center gap-4">
          {/* System Status */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity"></div>
            <div className="relative flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/80 border border-white/10 backdrop-blur-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50"></div>
              <span className="text-sm font-medium text-slate-300">{activeSystems} 시스템</span>
            </div>
          </div>
          
          {/* Pass Rate */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity"></div>
            <div className="relative px-5 py-3 rounded-xl bg-slate-800/80 border border-white/10 backdrop-blur-sm">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{passRate}%</span>
              </div>
              <span className="text-xs text-slate-400 font-medium">통과율</span>
            </div>
          </div>
          
          {/* Refresh Timer */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity"></div>
            <div className="relative px-4 py-3 rounded-xl bg-slate-800/80 border border-white/10 backdrop-blur-sm">
              <div className="text-xs text-slate-400 font-medium mb-0.5">자동 새로고침</div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-violet-400">{refreshCountdown}</span>
                <span className="text-xs text-slate-500">초</span>
              </div>
            </div>
          </div>
          
          {/* Close Button */}
          {onClose && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose} 
              className="ml-2 h-10 w-10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </header>
      
      <div className="p-4 h-[calc(100%-65px)] flex flex-col">
        <div className="grid grid-cols-12 gap-4 mb-3 h-auto cyber-animate-in">
          <div className="col-span-5 grid grid-cols-5 gap-2">
            <MetricCard icon={<ClipboardCheck className="h-6 w-6" />} title="총 시험" value={`${total}건`} trend={{
            direction: 'up',
            value: '+5%'
          }} className="col-span-1" />
            
            <MetricCard icon={<CheckCircle2 className="h-6 w-6" />} title="통과" value={`${passCount}명`} trend={{
            direction: 'up',
            value: '+3%'
          }} color="blue" className="col-span-1" />
            
            <MetricCard icon={<XCircle className="h-6 w-6" />} title="미통과" value={`${failCount}명`} trend={{
            direction: 'down',
            value: '-2%'
          }} color="red" className="col-span-1" />
            
            <MetricCard icon={<UserRound className="h-6 w-6" />} title="미응시" value={`${absentCount + notTakenCount}명`} trend={{
            direction: 'neutral',
            value: '0%'
          }} color="yellow" className="col-span-1" />
            
            <div className="col-span-1 cyber-panel h-full">
              <div className="h-full flex flex-col items-center justify-center p-2">
                <div className="cyber-text text-cyber-blue text-lg mb-1 font-light">통과율</div>
                <div className="text-2xl cyber-text text-cyber-blue flex items-center font-normal">
                  <span className="animate-pulse cyber-glow-text text-7xl">{passRate}%</span>
                </div>
                <div className="h-1 w-full bg-cyber-dark mt-2">
                  <div className="h-full bg-cyber-blue animate-cyber-progress" style={{
                  width: `${passRate}%`
                }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-7 grid grid-cols-2 gap-2">
            <div className="cyber-panel h-full cyber-animated-border">
              <div className="cyber-panel-header">
                <div className="cyber-panel-title font-normal">
                  <Activity className="mr-2 h-4 w-4" /> 주간 성과 분석
                </div>
                <div className="text-xs text-cyber-text text-cyber-gray font-light">실시간 데이터</div>
              </div>
              <div className="p-2 h-[calc(100%-40px)]">
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData} margin={{
                    top: 5,
                    right: 10,
                    left: 0,
                    bottom: 5
                  }}>
                      <defs>
                        <linearGradient id="colorPass" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
                      <XAxis dataKey="name" stroke="#A0AEC0" tick={{
                      fill: '#A0AEC0'
                    }} />
                      <YAxis stroke="#A0AEC0" tick={{
                      fill: '#A0AEC0'
                    }} />
                      <RechartsTooltip contentStyle={{
                      backgroundColor: '#1E293B',
                      borderColor: '#00E5FF',
                      color: '#fff'
                    }} labelStyle={{
                      color: '#00E5FF'
                    }} />
                      <Area type="monotone" dataKey="통과율" stroke="#00E5FF" strokeWidth={2} fillOpacity={1} fill="url(#colorPass)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="cyber-panel h-full cyber-animated-border">
              <div className="cyber-panel-header">
                <div className="cyber-panel-title font-normal">
                  <Gauge className="mr-2 h-4 w-4" /> 통과율 분석
                </div>
              </div>
              <div className="p-2 flex items-center justify-center h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData.filter(d => d.value > 0)} cx="50%" cy="50%" labelLine={false} label={renderCustomizedLabel} outerRadius="70%" innerRadius="50%" dataKey="value" strokeWidth={1} stroke="#111827" animationBegin={200} animationDuration={1500}>
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-3 mb-4 px-1">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
              <BarChart2 className="h-5 w-5 text-cyan-400" />
              <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                시험 결과 명단
              </h3>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-5 h-[calc(100%-60px)]">
            <ResultPanel title="통과" color="#10B981" icon={<CheckCircle2 className="w-5 h-5" />} students={passedTests.map(test => ({
            id: test.id,
            name: test.student?.name || '알 수 없는 학생',
            className: test.class?.name || '알 수 없는 반',
            data: ''
          }))} />
            
            <ResultPanel title="미통과" color="#F43F5E" icon={<XCircle className="w-5 h-5" />} students={failedTests.map(test => ({
            id: test.id,
            name: test.student?.name || '알 수 없는 핸생',
            className: test.class?.name || '알 수 없는 반',
            data: test.wrong_count ? `${test.wrong_count}개 틀림` : ''
          }))} />
            
            <ResultPanel title="미응시" color="#F59E0B" icon={<UserRound className="w-5 h-5" />} students={[...absentTests, ...notTakenTests].map(test => ({
            id: test.id,
            name: test.student?.name || '알 수 없는 학생',
            className: test.class?.name || '알 수 없는 반',
            data: '미응시'
          }))} />
          </div>
        </div>
      </div>
    </div>;
};
interface ClockDisplayProps {
  currentTime: string;
}
const ClockDisplay: React.FC<ClockDisplayProps> = ({
  currentTime
}) => {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
      <div className="relative px-10 py-5 rounded-2xl bg-slate-800/80 border border-white/10 backdrop-blur-sm shadow-xl shadow-black/30">
        <div className="absolute top-2 left-3 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
          <span className="text-[10px] text-cyan-400 font-semibold tracking-wider">LIVE</span>
        </div>
        <p className="text-6xl font-bold tracking-widest bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          {currentTime}
        </p>
      </div>
    </div>
  );
};
interface StatusBadgeProps {
  status: 'online' | 'offline' | 'warning';
  label: string;
}
const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label
}) => {
  return <div className={cn("py-1 px-3 rounded-md border flex items-center text-xs font-light", status === 'online' && "bg-cyber-blue/10 border-cyber-blue/30 text-cyber-blue", status === 'offline' && "bg-cyber-red/10 border-cyber-red/30 text-cyber-red", status === 'warning' && "bg-cyber-yellow/10 border-cyber-yellow/30 text-cyber-yellow")}>
      <div className={cn("w-2 h-2 rounded-full mr-2", status === 'online' && "bg-cyber-blue cyber-pulse", status === 'offline' && "bg-cyber-red", status === 'warning' && "bg-cyber-yellow cyber-pulse")}></div>
      <span className="font-noto">{label}</span>
    </div>;
};
interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  trend: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
  };
  color?: 'blue' | 'red' | 'yellow' | 'green';
  className?: string;
}
const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  title,
  value,
  trend,
  color = 'blue',
  className
}) => {
  return <div className={cn("cyber-panel p-3 cyber-animated-border", className)}>
      <div className="flex justify-between items-start">
        <div className={cn("p-2 rounded-md", color === 'blue' && "bg-cyber-blue/10 text-cyber-blue", color === 'red' && "bg-cyber-red/10 text-cyber-red", color === 'yellow' && "bg-cyber-yellow/10 text-cyber-yellow", color === 'green' && "bg-cyber-green/10 text-cyber-green")}>
          {icon}
        </div>
        <div className="text-xs font-noto font-light">
          {trend.direction === 'up' && <span className="text-cyber-green">▲ {trend.value}</span>}
          {trend.direction === 'down' && <span className="text-cyber-red">▼ {trend.value}</span>}
          {trend.direction === 'neutral' && <span className="text-cyber-gray">- {trend.value}</span>}
        </div>
      </div>
      <div className="mt-2">
        <div className="text-xs font-noto text-cyber-gray font-light">
          {title}
        </div>
        <div className="cyber-glow-text px-0 rounded-xl">
          {value}
        </div>
      </div>
    </div>;
};
interface ResultPanelProps {
  title: string;
  color: string;
  icon: React.ReactNode;
  students: StudentInfo[];
}
const ResultPanel: React.FC<ResultPanelProps> = ({
  title,
  color,
  icon,
  students
}) => {
  const getGradientClass = () => {
    if (title === "통과") return "from-emerald-500/10 to-teal-500/10 border-emerald-500/20";
    if (title === "미통과") return "from-rose-500/10 to-pink-500/10 border-rose-500/20";
    return "from-amber-500/10 to-orange-500/10 border-amber-500/20";
  };

  // Helper function to get school logo URL
  const getSchoolLogoUrl = (className: string): string | null => {
    const schoolLogos: Record<string, string> = {
      '수도여고': '/lovable-uploads/6ed011f2-1218-43fc-81f1-b570eac76530.png',
      '숭의여고': '/lovable-uploads/4201708f-ed03-4235-8a93-0bcd3c8ab973.png',
      '성남고': '/lovable-uploads/seongnam-logo.png',
      '영등포고': '/lovable-uploads/yeongdeungpo-logo-new.png',
      '당곡고': '/lovable-uploads/danggok-logo.png',
      '구암고': '/lovable-uploads/guam-logo.png',
    };

    for (const [school, url] of Object.entries(schoolLogos)) {
      if (className.includes(school)) {
        return url;
      }
    }
    return null;
  };

  return (
    <div className={`h-full flex flex-col rounded-2xl bg-gradient-to-br ${getGradientClass()} border backdrop-blur-sm shadow-lg shadow-black/20 overflow-hidden`}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5 bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ backgroundColor: `${color}20` }}>
              <div style={{ color }}>{icon}</div>
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">{title}</h4>
              <p className="text-xs text-slate-400">{students.length}명</p>
            </div>
          </div>
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}></div>
          </div>
        </div>
      </div>
      
      {/* Icon */}
      <div className="flex justify-center py-3 bg-slate-900/30">
        {title === "통과" && <img src="/lovable-uploads/a64b0954-06eb-4bff-85a6-f9c3cf125529.png" alt="Pass" className="w-16 h-16 object-contain opacity-90 hover:opacity-100 transition-opacity" />}
        {title === "미통과" && <img src="/lovable-uploads/0997815f-4f5a-4bd6-b053-29f59fb5a1b9.png" alt="Fail" className="w-16 h-16 object-contain opacity-90 hover:opacity-100 transition-opacity" />}
        {title === "미응시" && <img src="/lovable-uploads/b241d8f3-2529-4927-8100-235cde727da2.png" alt="Untaken" className="w-16 h-16 object-contain opacity-90 hover:opacity-100 transition-opacity" />}
      </div>
      
      {/* Students Grid */}
      <div className="p-3 flex-1 overflow-auto">
        {students.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {students.map((student, studentIndex) => {
              const logoUrl = getSchoolLogoUrl(student.className);
              return (
                <div 
                  key={student.id} 
                  className="group relative bg-slate-800/60 hover:bg-slate-700/60 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-black/30 flex items-center gap-3 animate-fade-in"
                  style={{
                    animationDelay: `${studentIndex * 0.02}s`,
                    minHeight: '70px'
                  }}
                >
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `radial-gradient(circle at center, ${color}10 0%, transparent 70%)` }}></div>
                  
                  {/* School Logo */}
                  <div className="relative shrink-0 w-12 h-12 rounded-full bg-slate-700/50 border border-white/10 flex items-center justify-center overflow-hidden">
                    {logoUrl ? (
                      <img 
                        src={logoUrl} 
                        alt="School logo" 
                        className="w-10 h-10 object-contain rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center">
                        <span className="text-xs text-slate-400 font-bold">
                          {student.className.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Student Info */}
                  <div className="relative flex-1 min-w-0">
                    <span className="text-lg font-bold text-white leading-tight line-clamp-1 block">
                      {student.name}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {student.className}
                    </span>
                    
                    {student.data && (
                      <span 
                        className="mt-1 px-2 py-0.5 rounded-md text-xs font-semibold inline-block"
                        style={{
                          backgroundColor: `${color}20`,
                          color,
                          border: `1px solid ${color}30`
                        }}
                      >
                        {student.data}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-slate-500 text-sm font-medium">해당 그룹에 학생이 없습니다</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default TestResultsDashboard;