import React, { useState } from "react";
import { LogOut, LayoutDashboard, Plus, FileText, Calendar, BarChart3, TrendingUp, Users, FileSearch, ClipboardList, Menu } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const ORBITRON = '"Orbitron", sans-serif';

type MenuItem = {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  english?: boolean;
};

const adminMenuItems: MenuItem[] = [
  { title: "대시보드", url: "/dashboard", icon: LayoutDashboard },
  { title: "단어장 생성", url: "/create", icon: Plus },
  { title: "단어시험지", url: "/create-test-paper", icon: FileText },
  { title: "Vocathon", url: "/exam-list", icon: Calendar, english: true },
  { title: "시험결과", url: "/exam-results", icon: BarChart3 },
  { title: "누적통계", url: "/cumulative-stats", icon: TrendingUp },
  { title: "코드관리", url: "/student-access-manager", icon: Users },
];

const restrictedMenuItems: MenuItem[] = [
  { title: "대시보드", url: "/dashboard", icon: LayoutDashboard },
  { title: "Vocathon", url: "/exam-list", icon: Calendar, english: true },
  { title: "숙제", url: "/student-homework", icon: ClipboardList },
  { title: "결과조회", url: "/result", icon: FileSearch },
];

export function TopNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const adminLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
  const accessCode = sessionStorage.getItem('accessCode');
  const isAdmin = adminLoggedIn || accessCode === 'admin' || accessCode === '101100' || accessCode === 'orun0088';
  const isStudent = sessionStorage.getItem('studentData') !== null;
  const isRestrictedUser = !isAdmin && isStudent;

  const menuItems = isRestrictedUser ? restrictedMenuItems : adminMenuItems;
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    sessionStorage.removeItem('studentData');
    sessionStorage.removeItem('adminAccess');
    sessionStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('accessCode');
    sessionStorage.removeItem('user_session_id');
    navigate('/');
  };

  const go = (url: string) => {
    setMobileOpen(false);
    navigate(url);
  };

  const titleStyle = (item: MenuItem) =>
    item.english
      ? { fontFamily: ORBITRON, fontWeight: 700, letterSpacing: "0.08em" }
      : undefined;

  return (
    <header className="sticky top-0 z-50 flex items-center px-5 md:px-8 py-2 apple-nav">
      <div className="flex items-center justify-between w-full max-w-[1680px] mx-auto gap-3">

        {/* Mobile menu button */}
        {(isAdmin || isStudent) && (
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="메뉴"
                className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl text-[#f5efe6] hover:bg-white/10 active:scale-95 transition"
              >
                <Menu className="w-5 h-5" strokeWidth={1.75} />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[290px] p-0 bg-[#faf8f5] border-r border-[#c9b99a]">
              <SheetHeader className="px-6 py-5 border-b border-[#c9b99a]">
                <SheetTitle
                  className="text-left text-[17px] tracking-[0.16em] text-[#8b7355]"
                  style={{ fontFamily: ORBITRON, fontWeight: 800 }}
                >
                  ORUN VOCA
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col p-3 gap-1">
                {menuItems.map((item) => {
                  const active = isActive(item.url);
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.title}
                      onClick={() => go(item.url)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 text-[13px] font-medium whitespace-nowrap transition-colors border-l-2",
                        active
                          ? "border-[#8b7355] bg-[#f0ebe3] text-[#1a1a1a]"
                          : "border-transparent text-[#8b7355] hover:bg-[#f0ebe3]"
                      )}
                    >
                      <Icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-[#8b7355]" : "text-[#c9b99a]")} strokeWidth={1.75} />
                      <span style={titleStyle(item)}>{item.title}</span>
                    </button>
                  );
                })}
                <div className="mt-2 pt-2 border-t border-[#c9b99a]">
                  <button
                    onClick={() => { setMobileOpen(false); handleLogout(); }}
                    className="flex items-center gap-3 px-4 py-3 w-full text-[13px] font-medium text-[#8b7355] hover:bg-[#f0ebe3] transition active:scale-[0.98]"
                  >
                    <LogOut className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
                    <span>로그아웃</span>
                  </button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        )}

        {/* Logo */}
        <div
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-3 cursor-pointer flex-shrink-0 group min-w-0"
        >
          <div className="w-9 h-9 overflow-hidden flex-shrink-0 bg-white/10 rounded-[8px] ring-1 ring-[#e8c98a]/30 shadow-[0_4px_14px_-6px_rgba(232,201,138,0.6)] transition-transform duration-300 group-hover:scale-105">
            <img
              alt="ORUN"
              className="w-full h-full object-cover"
              src="/lovable-uploads/fc4849c2-9734-4795-a825-89c8b12bb716.jpg"
            />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#bfae94] leading-none">
              ORUN ENGLISH VOCAB FLATFORM
            </p>
            <span
              className="nav-wordmark block mt-1 text-[18px] md:text-[22px] leading-none tracking-[0.16em] truncate"
              style={{ fontFamily: ORBITRON, fontWeight: 800 }}
            >
              ORUN VOCA
            </span>
          </div>

        </div>


        {/* Desktop Nav */}
        {(isAdmin || isStudent) && (
          <nav className="hidden lg:flex items-center gap-1 ml-8">
            {menuItems.map((item) => {
              const active = isActive(item.url);
              return (
                <button
                  key={item.title}
                  onClick={() => navigate(item.url)}
                  data-active={active}
                  className={cn(
                    "nav-link relative px-3.5 py-2 text-[12px] font-bold uppercase tracking-[0.1em] whitespace-nowrap transition-all duration-300",
                    active
                      ? "text-white"
                      : "text-[#cfc3b2] hover:text-white hover:-translate-y-[1px]"
                  )}
                >
                  <span className="whitespace-nowrap" style={titleStyle(item)}>
                    {item.title}
                  </span>
                </button>

              );
            })}
          </nav>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {(isAdmin || isStudent) && (
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#cfc3b2] hover:text-white transition-all whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>로그아웃</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

