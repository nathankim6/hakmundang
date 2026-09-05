import React, { useState, useEffect } from 'react';
import { useTestSchedules } from '@/hooks/test-schedules/useTestSchedules';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, CheckCircle2, XCircle, UserRound, BarChart3, Calendar, TrendingUp, Activity, Award, Target, Clock, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isSameDay, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

interface ModernDashboardProps {
  selectedDate: Date;
  onClose?: () => void;
  selectedTeacher?: string;
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
  };
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, trend, color = 'blue', className }) => {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-600',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-600',
    red: 'from-red-500/20 to-red-600/20 border-red-500/30 text-red-600',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 text-yellow-600',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-600'
  };

  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-gray-500'
  };

  return (
    <Card className={cn(
      "holographic-card dashboard-card border-2 backdrop-blur-xl shadow-2xl",
      colorClasses[color],
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">{title}</p>
              <p className="text-2xl font-bold text-white animate-bounce-in">{value}</p>
            </div>
          </div>
          {trend && (
            <div className={cn("flex items-center gap-1 text-xs", trendColors[trend.direction])}>
              {trend.direction === 'up' && <TrendingUp className="h-3 w-3" />}
              {trend.direction === 'down' && <TrendingUp className="h-3 w-3 rotate-180" />}
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        
        {/* Animated progress bar */}
        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-white/40 to-white/60 rounded-full animate-shimmer"></div>
        </div>
      </CardContent>
    </Card>
  );
};

const ModernDashboard: React.FC<ModernDashboardProps> = ({
  selectedDate,
  onClose,
  selectedTeacher = 'all'
}) => {
  const { testSchedules } = useTestSchedules(selectedTeacher);
  const [currentTime, setCurrentTime] = useState('');
  const [refreshCountdown, setRefreshCountdown] = useState(30);

  // Update current time
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(format(new Date(), 'HH:mm:ss', { locale: ko }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-refresh countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshCountdown(prev => prev > 0 ? prev - 1 : 30);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter today's tests
  const todayTests = testSchedules.filter(schedule => 
    isSameDay(parseISO(schedule.test_date), selectedDate)
  );

  // Calculate statistics
  const total = todayTests.length;
  const passCount = todayTests.filter(test => test.result === 'pass').length;
  const failCount = todayTests.filter(test => test.result === 'fail').length;
  const absentCount = todayTests.filter(test => test.result === 'absent').length;
  const notTakenCount = todayTests.filter(test => test.result === 'not-taken' || !test.result).length;
  const passRate = total > 0 ? Math.round((passCount / total) * 100) : 0;

  // Chart data
  const chartData = [
    { name: '통과', value: passCount, color: '#22c55e' },
    { name: '미통과', value: failCount, color: '#ef4444' },
    { name: '결석', value: absentCount, color: '#f59e0b' },
    { name: '미응시', value: notTakenCount, color: '#6b7280' }
  ];

  if (total === 0) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[80vh] p-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-blue-500/30">
          <div className="glass-morphism h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/20 backdrop-blur-sm">
                  <BarChart3 className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">상황판</h2>
                  <p className="text-white/60">{format(selectedDate, 'yyyy년 MM월 dd일', { locale: ko })}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-white/60">현재 시간</p>
                  <p className="text-lg font-mono text-blue-400">{currentTime}</p>
                </div>
                {onClose && (
                  <Button variant="ghost" size="icon" onClick={onClose} className="text-white/60 hover:text-white hover:bg-white/10">
                    <X className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>

            {/* No data state */}
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="text-center space-y-6">
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center backdrop-blur-sm animate-float">
                  <Calendar className="h-16 w-16 text-blue-400/70" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">시험 일정이 없습니다</h3>
                  <p className="text-white/60 max-w-md">
                    선택한 날짜에 시험 일정이 없습니다. 다른 날짜를 선택하거나 시험 일정을 추가해주세요.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] p-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-blue-500/30">
        <div className="glass-morphism h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/20 backdrop-blur-sm animate-pulse-glow">
                <Activity className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">실시간 상황판</h2>
                <p className="text-white/60">{format(selectedDate, 'yyyy년 MM월 dd일', { locale: ko })}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-white/60">현재 시간</p>
                <p className="text-xl font-mono text-blue-400 animate-pulse">{currentTime}</p>
              </div>
              
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm">
                <Zap className="h-4 w-4 text-green-400" />
                <span className="text-sm text-white">자동 새로고침</span>
                <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                  {refreshCountdown}초
                </Badge>
              </div>
              
              {onClose && (
                <Button variant="ghost" size="icon" onClick={onClose} className="text-white/60 hover:text-white hover:bg-white/10">
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-auto">
            {/* Top Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="총 시험"
                value={`${total}건`}
                icon={<Target className="h-6 w-6" />}
                trend={{ direction: 'up', value: '+5%' }}
                color="blue"
              />
              <MetricCard
                title="통과"
                value={`${passCount}명`}
                icon={<CheckCircle2 className="h-6 w-6" />}
                trend={{ direction: 'up', value: '+3%' }}
                color="green"
              />
              <MetricCard
                title="미통과"
                value={`${failCount}명`}
                icon={<XCircle className="h-6 w-6" />}
                trend={{ direction: 'down', value: '-2%' }}
                color="red"
              />
              <MetricCard
                title="미응시"
                value={`${absentCount + notTakenCount}명`}
                icon={<UserRound className="h-6 w-6" />}
                trend={{ direction: 'neutral', value: '0%' }}
                color="yellow"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Pass Rate Chart */}
              <Card className="holographic-card border-2 border-blue-500/30 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Award className="h-5 w-5 text-blue-400" />
                    통과율 분석
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={40}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            borderRadius: '8px',
                            color: 'white'
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-center mt-4">
                    <p className="text-3xl font-bold text-white">{passRate}%</p>
                    <p className="text-white/60">전체 통과율</p>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Overview */}
              <Card className="holographic-card border-2 border-purple-500/30 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-400" />
                    성과 개요
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                        <XAxis dataKey="name" tick={{ fill: 'white' }} />
                        <YAxis tick={{ fill: 'white' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            borderRadius: '8px',
                            color: 'white'
                          }} 
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Student Results */}
            <Card className="holographic-card border-2 border-green-500/30 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <UserRound className="h-5 w-5 text-green-400" />
                  학생 결과 상세
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {todayTests.map((test, index) => (
                      <div 
                        key={test.id} 
                        className="p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 animate-slide-in-right"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-white">{test.student?.name || '학생'}</h4>
                          <Badge 
                            variant={test.result === 'pass' ? 'default' : 'destructive'}
                            className={cn(
                              "text-xs",
                              test.result === 'pass' && "bg-green-500/20 text-green-400 border-green-500/30",
                              test.result === 'fail' && "bg-red-500/20 text-red-400 border-red-500/30",
                              test.result === 'absent' && "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
                              (!test.result || test.result === 'not-taken') && "bg-gray-500/20 text-gray-400 border-gray-500/30"
                            )}
                          >
                            {test.result === 'pass' ? '통과' : 
                             test.result === 'fail' ? '미통과' : 
                             test.result === 'absent' ? '결석' : '미응시'}
                          </Badge>
                        </div>
                        <p className="text-sm text-white/60">{test.range_start} - {test.range_end}</p>
                        {test.wrong_count && (
                          <p className="text-sm text-red-400 mt-1">오답: {test.wrong_count}개</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModernDashboard;