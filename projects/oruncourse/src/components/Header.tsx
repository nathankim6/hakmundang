import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, LogOut, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
const Header: React.FC = () => {
  const {
    isAdmin,
    login,
    logout
  } = useAuth();
  const {
    toast
  } = useToast();
  const [adminCode, setAdminCode] = useState('');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const handleLogin = () => {
    if (login(adminCode)) {
      toast({
        title: "로그인 성공",
        description: "관리자 모드로 로그인되었습니다."
      });
      setIsLoginOpen(false);
      setAdminCode('');
    } else {
      toast({
        title: "로그인 실패",
        description: "관리자 코드가 올바르지 않습니다.",
        variant: "destructive"
      });
    }
  };
  const handleLogout = () => {
    logout();
    toast({
      title: "로그아웃",
      description: "관리자 모드에서 로그아웃되었습니다."
    });
  };
  return <header className="sticky top-0 z-50 border-b border-border/40 backdrop-blur-2xl bg-background/70 supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16 lg:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="relative flex-shrink-0 group">
              <img src="/lovable-uploads/b748fb27-f450-48fd-ae20-5a2763c2e719.png" alt="ORUN Academy" className="h-7 sm:h-9 lg:h-11 w-auto transition-transform duration-300 group-hover:scale-105" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm sm:text-base lg:text-xl font-bold text-foreground tracking-tight truncate">ORUN ENGLISH</h1>
              <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground/80 hidden sm:block truncate font-medium">
                수강신청 플랫폼
              </p>
            </div>
          </div>
          
          {/* Auth Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isAdmin ? <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
                  <Settings className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary">관리자</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} className="h-8 sm:h-9 text-xs sm:text-sm px-3 sm:px-4 rounded-full border-border/60 bg-background/50 backdrop-blur-sm hover:bg-muted/50 hover:border-border transition-all duration-300 shadow-sm hover:shadow-md font-semibold">
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">로그아웃</span>
                </Button>
              </div> : <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 sm:h-9 text-xs sm:text-sm px-3 sm:px-4 rounded-full border-border/60 bg-background/50 backdrop-blur-sm hover:bg-muted/50 hover:border-border transition-all duration-300 shadow-sm hover:shadow-md font-semibold">
                    <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                    <span className="hidden sm:inline">로그인</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md rounded-3xl border-border/50">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">관리자 로그인</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-5 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="adminCode" className="text-sm font-semibold">관리자 코드</Label>
                      <Input id="adminCode" type="password" value={adminCode} onChange={e => setAdminCode(e.target.value)} placeholder="관리자 코드를 입력하세요" onKeyPress={e => e.key === 'Enter' && handleLogin()} className="h-11 rounded-xl border-border/60 bg-background focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <Button onClick={handleLogin} className="w-full h-11 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all">
                      로그인
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>}
          </div>
        </div>
      </div>
    </header>;
};
export default Header;