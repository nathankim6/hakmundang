import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Users, BookOpen, ScanLine, ClipboardList, Sparkles, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoginDialog } from '@/components/LoginDialog';
import { useAuth } from '@/contexts/AuthContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from '@/components/ui/use-toast';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { cn } from '@/lib/utils';
const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isAuthenticated,
    userName
  } = useAuth();
  const {
    toast
  } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const accessCode = localStorage.getItem('accessCode');
    setIsAdmin(accessCode === '101100');
  }, [isAuthenticated]);
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/' && !location.search.includes('view=classes')) return true;
    if (path === '/classes' && (location.pathname === '/classes' || location.search.includes('view=classes'))) return true;
    return location.pathname === path;
  };
  const handleNavigation = (path: string) => {
    if (!isAuthenticated) {
      toast({
        title: "인증 필요",
        description: "이 기능을 사용하려면 먼저 로그인해야 합니다.",
        variant: "destructive"
      });
      return;
    }
    navigate(path);
  };
  const handleOmrClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "인증 필요",
        description: "이 기능을 사용하려면 먼저 로그인해야 합니다.",
        variant: "destructive"
      });
      return;
    }
    window.open('https://omr-quiz-scan.lovable.app/', '_blank', 'noopener,noreferrer');
  };
  return <nav className="w-full bg-gradient-to-r from-white/98 via-slate-50/80 to-white/98 backdrop-blur-2xl border-b border-slate-200/60 shadow-[0_4px_32px_-8px_rgba(0,0,0,0.08)] sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between py-3 md:py-4 px-4 md:px-8 gap-4">
        {/* Logo & Title Section */}
        <div className="flex items-center gap-3 md:gap-5 min-w-0 flex-shrink group">
          <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-slate-600 via-slate-500 to-slate-700 p-[2px] shadow-lg shadow-slate-400/25 hover:shadow-xl hover:shadow-slate-400/30 transition-all duration-500 hover:scale-105 flex-shrink-0">
            <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center overflow-hidden">
              <img src="/lovable-uploads/9bd29e07-f65d-4b77-93de-1fccfda8c552.png" alt="Orun Academy Logo" className="w-8 h-8 md:w-10 md:h-10 object-cover" />
            </div>
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="text-base md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-clip-text text-transparent truncate tracking-tight">
              옳은영어 학생관리 시스템
            </h1>
            <p className="text-[10px] md:text-xs text-slate-500 font-medium hidden lg:block truncate tracking-widest uppercase">
              ORUN STUDENTS MANAGEMENT
            </p>
          </div>
        </div>
        
        {/* Navigation Section */}
        <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
          {/* Calendar Button */}
          <Button variant={isActive('/') ? 'default' : 'ghost'} size="sm" className={cn("relative transition-all duration-300 whitespace-nowrap rounded-xl px-3 md:px-4 font-medium", isActive('/') ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg shadow-slate-400/30 hover:shadow-xl hover:shadow-slate-400/40' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100')} onClick={() => navigate('/')}>
            <CalendarIcon className="w-4 h-4" />
            <span className="text-xs md:text-sm hidden sm:inline ml-1.5">캘린더</span>
          </Button>
          
          {/* Progress Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={isActive('/progress') ? 'default' : 'ghost'} size="sm" className={cn("relative transition-all duration-300 whitespace-nowrap rounded-xl px-3 md:px-4 font-medium", isActive('/progress') ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg shadow-slate-400/30 hover:shadow-xl' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100')} onClick={() => handleNavigation('/progress')}>
                  <BookOpen className="w-4 h-4" />
                  <span className="text-xs md:text-sm hidden sm:inline ml-1.5">진도</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-900/95 text-white border-0 shadow-xl rounded-lg">
                {!isAuthenticated && "이 기능을 사용하려면 로그인이 필요합니다"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Attendance Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={isActive('/attendance') ? 'default' : 'ghost'} size="sm" className={cn("relative transition-all duration-300 whitespace-nowrap rounded-xl px-3 md:px-4 font-medium", isActive('/attendance') ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg shadow-slate-400/30 hover:shadow-xl' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100')} onClick={() => handleNavigation('/attendance')}>
                  <ClipboardList className="w-4 h-4" />
                  <span className="text-xs md:text-sm hidden sm:inline ml-1.5">출석</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-900/95 text-white border-0 shadow-xl rounded-lg">
                {!isAuthenticated && "이 기능을 사용하려면 로그인이 필요합니다"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Classes Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={isActive('/classes') ? 'default' : 'ghost'} size="sm" className={cn("relative transition-all duration-300 whitespace-nowrap rounded-xl px-3 md:px-4 font-medium", isActive('/classes') ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg shadow-slate-400/30 hover:shadow-xl' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100')} onClick={() => handleNavigation('/classes')}>
                  <Users className="w-4 h-4" />
                  <span className="text-xs md:text-sm hidden sm:inline ml-1.5">반</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-900/95 text-white border-0 shadow-xl rounded-lg">
                {!isAuthenticated && "이 기능을 사용하려면 로그인이 필요합니다"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* OMR Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="relative transition-all duration-300 whitespace-nowrap rounded-xl px-3 md:px-4 font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100" onClick={handleOmrClick}>
                  <ScanLine className="w-4 h-4" />
                  <span className="text-xs md:text-sm hidden md:inline ml-1.5">OMR</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-900/95 text-white border-0 shadow-xl rounded-lg">
                {!isAuthenticated && "이 기능을 사용하려면 로그인이 필요합니다"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Admin Settings Button */}
          {isAdmin && <Button variant={isActive('/access-codes') ? 'default' : 'ghost'} size="sm" className={cn("relative transition-all duration-300 whitespace-nowrap rounded-xl px-3 md:px-4 font-medium", isActive('/access-codes') ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg shadow-slate-400/30 hover:shadow-xl' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100')} onClick={() => navigate('/access-codes')}>
              <Settings className="w-4 h-4" />
              <span className="text-xs md:text-sm hidden lg:inline ml-1.5">설정</span>
            </Button>}

          {/* Divider */}
          <div className="hidden md:block w-px h-8 bg-gradient-to-b from-transparent via-slate-300 to-transparent mx-1" />
          
          {/* User Badge */}
          {isAuthenticated && <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-slate-100 to-slate-50 border border-slate-200 shadow-sm">
              <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse shadow-lg shadow-slate-400/50" />
              <span className="font-semibold text-xs md:text-sm text-slate-700 truncate max-w-[80px] md:max-w-none">
                {userName}
              </span>
            </div>}
          
          <LoginDialog />
        </div>
      </div>
    </nav>;
};
export default NavBar;