import { useState, useRef, Suspense } from 'react';
import Calendar from '@/components/Calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import NavBar from '@/components/NavBar';
import { LogIn, Calendar as CalendarIcon, BookOpen } from 'lucide-react';
const Index = () => {
  const {
    isAuthenticated,
    login
  } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {
    toast
  } = useToast();
  const dailyStatsRef = useRef<HTMLDivElement>(null);
  const handleDateSelect = (date: Date | null) => {
    console.log('Date selected in Index:', date);
    setSelectedDate(date);
  };
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) {
      toast({
        variant: "destructive",
        title: "액세스 코드 입력",
        description: "액세스 코드를 입력해주세요."
      });
      return;
    }
    setIsLoading(true);
    await login(accessCode);
    setIsLoading(false);
    setAccessCode('');
  };
  const CalendarWrapper = () => {
    try {
      return <Calendar selectedDate={selectedDate} onDateSelect={handleDateSelect} showDailyStatsOnly={false} />;
    } catch (error) {
      console.error("Calendar 컴포넌트 로드 중 오류 발생:", error);
      return <div className="p-6 rounded-xl border border-red-200 bg-red-50 text-red-800">
          캘린더를 불러오는 중 오류가 발생했습니다. 페이지를 새로고침해주세요.
        </div>;
    }
  };
  const DailyStatsWrapper = () => {
    try {
      return <Calendar showDailyStatsOnly={true} selectedDate={selectedDate} onDateSelect={handleDateSelect} />;
    } catch (error) {
      console.error("DailyStats 컴포넌트 로드 중 오류 발생:", error);
      return <div className="p-6 rounded-xl border border-red-200 bg-red-50 text-red-800">
          일간 통계를 불러오는 중 오류가 발생했습니다. 페이지를 새로고침해주세요.
        </div>;
    }
  };

  // 인증되지 않은 경우 로그인 페이지 표시
  if (!isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {/* Premium background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.08),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(14,165,233,0.06),transparent_50%)]"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
        
        <div className="relative w-full max-w-md p-6 z-10">
          <div className="premium-card p-10 backdrop-blur-xl bg-white/95">
            <div className="text-center mb-10">
              <div className="mx-auto w-24 h-24 mb-8">
                <img src="/lovable-uploads/orun-academy-logo-new.jpg" alt="ORUN Academy" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent mb-4 tracking-tight">​ORUN CARE </h1>
              <p className="text-muted-foreground font-medium text-base">옳은영어 학생관리시스템</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="accessCode" className="text-sm font-semibold text-foreground/80">액세스 코드</Label>
                <Input id="accessCode" type="password" placeholder="액세스 코드를 입력하세요" value={accessCode} onChange={e => setAccessCode(e.target.value)} disabled={isLoading} className="h-14 border-2 border-border/50 focus:border-primary/40 rounded-xl bg-muted/30 text-base transition-all duration-300 focus:bg-white focus:shadow-lg focus:shadow-primary/5" />
              </div>
              
              <Button type="submit" className="w-full h-14 figma-button text-white font-semibold text-base rounded-xl" disabled={isLoading}>
                {isLoading ? <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    로그인 중...
                  </span> : '시스템 접속'}
              </Button>
            </form>
            
            
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen flex flex-col w-full relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50/80">
      {/* Premium background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.06),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(14,165,233,0.05),transparent_50%)]"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/3 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/3 rounded-full blur-3xl pointer-events-none"></div>
      
      <NavBar />
      
      <main className="flex-1 p-4 lg:p-8 relative z-10 w-full">
        <div className="w-full max-w-none">
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Calendar Section */}
            <div className="lg:col-span-2">
              <div className="premium-card p-7 h-full bg-white/98">
                <div className="flex items-center gap-4 mb-7">
                  <div className="w-12 h-12 premium-icon">
                    <CalendarIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground tracking-tight">학습 캘린더</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">일정과 진도를 한눈에 확인하세요</p>
                  </div>
                </div>
                <Suspense fallback={<div className="flex items-center justify-center h-64">
                    <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  </div>}>
                  <CalendarWrapper />
                </Suspense>
              </div>
            </div>
            
            {/* Stats Section */}
            <div className="lg:col-span-3">
              <div className="sticky top-24">
                <div ref={dailyStatsRef} className="premium-card p-7 bg-white/98">
                  <div className="flex items-center gap-4 mb-7">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white flex items-center justify-center">
                      <img src="/lovable-uploads/orun-academy-logo.jpg" alt="ORUN ACADEMY" className="w-10 h-10 object-contain" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground tracking-tight">일간 통계</h2>
                      <p className="text-sm text-muted-foreground mt-0.5">오늘의 학습 현황</p>
                    </div>
                  </div>
                  <Suspense fallback={<div className="flex items-center justify-center h-32">
                      <div className="w-8 h-8 border-3 border-accent/20 border-t-accent rounded-full animate-spin"></div>
                    </div>}>
                    <DailyStatsWrapper />
                  </Suspense>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="relative z-10 py-8 px-4 lg:px-8 text-center bg-white/60 backdrop-blur-sm border-t border-border/30">
        <div className="w-full max-w-none">
          <p className="text-sm text-muted-foreground font-medium tracking-tight">
            © {new Date().getFullYear()} 옳은영어 학습관리시스템
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1.5 tracking-wide">
            Powered by Advanced Learning Management Technology
          </p>
        </div>
      </footer>
    </div>;
};
export default Index;