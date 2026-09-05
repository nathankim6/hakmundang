import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/authStore";
import { UserCircle, LogOut, LayoutDashboard, FileText, Users, Menu, Moon, Sun } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "@/components/ThemeProvider";
import { ModernTitle } from "@/components/ui/modern-header";
export function Header() {
  const location = useLocation();
  const {
    isAuthenticated,
    isAdmin,
    currentUser,
    logout
  } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    theme,
    setTheme
  } = useTheme();
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  return <header className="border-b mb-4 bg-gradient-to-br from-slate-50/90 via-white/95 to-blue-50/80 dark:from-slate-900/98 dark:via-slate-800/98 dark:to-blue-900/95 border-slate-200/60 dark:border-slate-700/50 backdrop-blur-xl shadow-2xl rounded-2xl py-0 relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-15 dark:opacity-8">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-purple-100/20 to-pink-100/30 dark:from-blue-900/20 dark:via-purple-900/15 dark:to-pink-900/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[length:32px_32px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(147,51,234,0.1)_1px,transparent_1px)] bg-[length:40px_40px]"></div>
      </div>
      
      {/* Floating orbs */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-float-bounce" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-400/10 to-indigo-400/10 rounded-full blur-3xl animate-float-bounce" style={{
      animationDelay: '1s'
    }} />
      
      <div className="mobile-container flex items-center justify-between relative z-10 py-4 sm:py-6 lg:py-8">
        {/* Premium Glass Container */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/50 to-white/70 dark:from-slate-900/70 dark:via-slate-800/50 dark:to-slate-900/70 rounded-3xl backdrop-blur-xl shadow-2xl border border-white/30 dark:border-slate-700/30 -z-10" />
        
        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-gradient-circuit rounded-3xl -z-10" />
        
        {/* Premium Border Glow */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-title-accent/10 to-transparent opacity-60 blur-sm -z-10" />
        
        {/* Inner Content Shadow */}
        <div className="absolute inset-2 bg-gradient-to-br from-white/20 via-transparent to-white/10 dark:from-slate-800/20 dark:to-slate-700/10 rounded-2xl shadow-inner -z-10" />
        
        
        {/* Hover Enhancement */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/15 to-pink-500/10 dark:from-blue-600/20 dark:via-purple-600/25 dark:to-pink-600/20 rounded-3xl opacity-0 hover:opacity-100 transition-all duration-700 ease-out -z-10">
          {/* Multi-layered Geometric Pattern */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden">
            {/* Hexagon Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImhleGFnb25zIiB4PSIwIiB5PSIwIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwb2x5Z29uIHBvaW50cz0iMzAsMTUgNDUsMjIuNSA0NSwzNy41IDMwLDQ1IDE1LDM3LjUgMTUsMjIuNSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDU5LDEzMCwyNDYsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2hleGFnb25zKSIvPjwvc3ZnPg==')] opacity-30 dark:opacity-20"></div>
            {/* Dots Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(147,51,234,0.12)_2px,transparent_2px),radial-gradient(circle_at_70%_20%,rgba(59,130,246,0.1)_1.5px,transparent_1.5px),radial-gradient(circle_at_40%_80%,rgba(236,72,153,0.08)_2px,transparent_2px)] bg-[length:28px_28px,22px_22px,34px_34px]"></div>
            {/* Animated Gradient Lines */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-400/40 to-transparent animate-shimmer"></div>
            <div className="absolute bottom-0 right-0 w-full h-[2px] bg-gradient-to-l from-transparent via-purple-400/40 to-transparent animate-shimmer" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
        
        {/* Content Wrapper with Premium Styling */}
        <ModernTitle />
        
        {/* Navigation & Actions with Enhanced Glass Effect */}
        <div className="relative z-10">
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex flex-col items-end gap-3">
          {/* First row: Navigation */}
          {isAuthenticated && <nav className="flex items-center gap-4 mx-[5px]">
              <Link to="/" className={`text-sm hover:text-primary transition-colors flex items-center py-1 relative group ${location.pathname === "/" ? "text-primary font-medium" : "text-muted-foreground"}`}>
                <LayoutDashboard className="h-4 w-4 mr-1.5" />
                업무관리
                <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 ${location.pathname === "/" ? "w-full" : "group-hover:w-full"}`}></span>
              </Link>
              <Link to="/daily-report" className={`text-sm hover:text-primary transition-colors flex items-center py-1 relative group ${location.pathname === "/daily-report" ? "text-primary font-medium" : "text-muted-foreground"}`}>
                <FileText className="h-4 w-4 mr-1.5" />
                데일리리포트
                <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 ${location.pathname === "/daily-report" ? "w-full" : "group-hover:w-full"}`}></span>
              </Link>
              {isAdmin && <Link to="/admin" className={`text-sm hover:text-primary transition-colors flex items-center py-1 relative group ${location.pathname === "/admin" ? "text-primary font-medium" : "text-muted-foreground"}`}>
                  <Users className="h-4 w-4 mr-1.5" />
                  직원관리
                  <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 ${location.pathname === "/admin" ? "w-full" : "group-hover:w-full"}`}></span>
                </Link>}
            </nav>}
          
          {/* Second row: User info and buttons */}
          <div className="flex items-center gap-3 px-0">
            
            
            {isAuthenticated ? <>
                <div className="flex items-center py-1.5 bg-gradient-to-r from-blue-50 via-blue-50/70 to-slate-50/70 dark:from-blue-900/20 dark:via-blue-900/10 dark:to-slate-900/20 rounded-full border border-blue-100/50 dark:border-blue-800/30 shadow-sm px-[9px]">
                  <Avatar className="h-7 w-7 mr-2 border-2 border-primary/20 shadow-sm">
                    <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <UserCircle className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {isAdmin ? "관리자" : currentUser?.name}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 mx-[11px] text-xs whitespace-nowrap">
                      {isAdmin ? "관리자 권한" : currentUser?.position}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={logout} className="mobile-button rounded-full hover:bg-destructive/10 hover:text-destructive border-destructive/20 shadow-sm">
                  <LogOut className="h-4 w-4 mr-1" />
                  로그아웃
                </Button>
              </> : <Button variant="default" size="sm" asChild className="mobile-button rounded-full shadow-sm hover:shadow bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all">
                <Link to="/login">
                  <UserCircle className="h-4 w-4 mr-1" />
                  로그인
                </Link>
              </Button>}
          </div>
        </div>
        
        {/* Mobile Menu Button */}
        <div className="flex items-center lg:hidden">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="mobile-touch-target mr-2 rounded-full flex items-center justify-center">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="mobile-touch-target mobile-button px-3">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 sm:w-96">
              <div className="py-6 flex flex-col h-full">
                <div className="flex-1 space-y-2">
                  {isAuthenticated && <>
                      <Link to="/" className={`mobile-nav-item ${location.pathname === "/" ? "bg-primary/10 text-primary" : "hover:bg-secondary"}`} onClick={() => setMobileMenuOpen(false)}>
                        <LayoutDashboard className="h-5 w-5 mr-3" />
                        업무관리
                      </Link>
                      <Link to="/daily-report" className={`mobile-nav-item ${location.pathname === "/daily-report" ? "bg-primary/10 text-primary" : "hover:bg-secondary"}`} onClick={() => setMobileMenuOpen(false)}>
                        <FileText className="h-5 w-5 mr-3" />
                        데일리리포트
                      </Link>
                      {isAdmin && <Link to="/admin" className={`mobile-nav-item ${location.pathname === "/admin" ? "bg-primary/10 text-primary" : "hover:bg-secondary"}`} onClick={() => setMobileMenuOpen(false)}>
                          <Users className="h-5 w-5 mr-3" />
                          직원관리
                        </Link>}
                    </>}
                </div>
                
                <div className="pt-6 border-t">
                  {isAuthenticated ? <div className="space-y-4">
                      <div className="flex items-center p-3 bg-gradient-to-r from-blue-50/80 to-slate-50/80 dark:from-blue-900/20 dark:to-slate-900/20 rounded-lg">
                        <Avatar className="h-10 w-10 mr-3 border-2 border-primary/20">
                          <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            <UserCircle className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-base">{isAdmin ? "관리자" : currentUser?.name}</p>
                          <p className="text-sm text-muted-foreground">{isAdmin ? "관리자 권한" : currentUser?.position}</p>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full mobile-button justify-start" onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}>
                        <LogOut className="h-4 w-4 mr-2" />
                        로그아웃
                      </Button>
                    </div> : <Button className="w-full mobile-button" asChild onClick={() => setMobileMenuOpen(false)}>
                      <Link to="/login">
                        <UserCircle className="h-4 w-4 mr-2" />
                        로그인
                      </Link>
                    </Button>}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        </div>
      </div>
    </header>;
}