import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  School,
  ClipboardCheck,
  BookOpen,
  Bell,
  BarChart3,
  Settings,
  ChevronRight,
  Key,
  LogOut,
  Sparkles,
  PenLine,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import orunLogo from "@/assets/orun-academy-logo.jpg";
import adminAvatar from "@/assets/admin-avatar.jpg";

interface AppSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

const menuItems = [
  { path: "/", icon: Home, label: "대시보드" },
  { path: "/schools", icon: School, label: "학생관리" },
  { path: "/assignment-status", icon: ClipboardCheck, label: "과제현황" },
  { path: "/mock-exam", icon: GraduationCap, label: "모의고사" },
  { path: "/passages", icon: BookOpen, label: "녹음리뷰과제" },
  { path: "/homework", icon: PenLine, label: "서술형연습" },
  { path: "/notifications", icon: Bell, label: "알림센터" },
  { path: "/statistics", icon: BarChart3, label: "통계/리포트" },
  { path: "/settings", icon: Settings, label: "설정" },
];


export function AppSidebar({ isOpen, onToggle, isMobile }: AppSidebarProps) {
  const location = useLocation();
  const { session, logout } = useAuth();

  // On mobile, sidebar is always full-width overlay when open
  const showExpanded = isMobile ? isOpen : isOpen;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full transition-all duration-300 flex flex-col",
        "bg-white/70 backdrop-blur-3xl border-r border-border/70",
        isMobile
          ? cn("z-40", isOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full")
          : cn("z-40", isOpen ? "w-64" : "w-16")
      )}
    >
      {/* 앰비언트 배경 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-16 w-64 h-64 bg-primary/[0.06] blur-[80px] rounded-full" />
      </div>

      {/* 로고 */}
      <div className="relative h-16 flex items-center px-4 border-b border-border/60">
        <div className="relative">
          <img src={orunLogo} alt="Orun Academy" className="w-9 h-9 rounded-[12px] object-cover ring-1 ring-border" />
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
        </div>
        {(showExpanded) && (
          <span className="ml-3 text-[15px] font-bold tracking-tight text-foreground whitespace-nowrap animate-fade-in">
            옳은영어 숙제
          </span>
        )}
      </div>

      {/* 사용자 정보 */}
      {session && (
        <div className="relative px-3 py-3 border-b border-border/60 animate-fade-in">
          <div className={cn(
            "flex items-center rounded-2xl bg-secondary/60 p-2",
            showExpanded ? "gap-3" : "justify-center"
          )}>
            <div className="relative flex-shrink-0">
              <img 
                src={adminAvatar} 
                alt="관리자" 
                className="w-8 h-8 rounded-xl object-cover ring-1 ring-border"
              />
            </div>
            {showExpanded && (
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{session.name}</p>
                {session.isAdmin && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Sparkles className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Administrator</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 메뉴 */}
      <nav className="relative flex-1 py-4 overflow-y-auto scrollbar-thin">
        {showExpanded && (
          <div className="px-4 mb-3">
            <span className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest">Menu</span>
          </div>
        )}

        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => isMobile && onToggle()}
                  className={cn(
                    "group relative flex items-center px-3 py-2.5 rounded-2xl transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                  )}

                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200",
                    isActive ? "bg-primary/15" : "group-hover:bg-background/60"
                  )}>
                    <Icon className={cn(
                      "w-[18px] h-[18px] transition-all duration-200",
                      isActive ? "text-primary" : ""
                    )} />
                  </div>

                  {showExpanded && (
                    <span className={cn(
                      "ml-3 text-sm animate-fade-in transition-colors duration-200",
                      isActive ? "font-semibold" : "font-medium"
                    )}>
                      {item.label}
                    </span>
                  )}

                  {showExpanded && isActive && (
                    <ChevronRight className="w-4 h-4 ml-auto text-primary/50" />
                  )}
                </NavLink>
              </li>
            );
          })}

          {/* 관리자 전용 메뉴 */}
          {session?.isAdmin && (
            <>
              {showExpanded && (
                <div className="px-3 pt-4 pb-2">
                  <span className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest">Admin</span>
                </div>
              )}
              <li>
                <NavLink
                  to="/access-codes"
                  onClick={() => isMobile && onToggle()}
                  className={cn(
                    "group relative flex items-center px-3 py-2.5 rounded-2xl transition-all duration-200",
                    location.pathname === "/access-codes"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                  )}
                >
                  {location.pathname === "/access-codes" && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                  )}

                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200",
                    location.pathname === "/access-codes" ? "bg-primary/15" : "group-hover:bg-background/60"
                  )}>
                    <Key className={cn(
                      "w-[18px] h-[18px] transition-all duration-200",
                      location.pathname === "/access-codes" ? "text-primary" : ""
                    )} />
                  </div>

                  {showExpanded && (
                    <span className={cn(
                      "ml-3 text-sm animate-fade-in",
                      location.pathname === "/access-codes" ? "font-semibold" : "font-medium"
                    )}>
                      접속코드 관리
                    </span>
                  )}

                  {showExpanded && location.pathname === "/access-codes" && (
                    <ChevronRight className="w-4 h-4 ml-auto text-primary/50" />
                  )}
                </NavLink>
              </li>
            </>
          )}
        </ul>

      </nav>

      {/* 로그아웃 */}
      <div className="relative p-3 border-t border-border/60">
        <button
          onClick={logout}
          className={cn(
            "w-full group flex items-center px-3 py-2.5 rounded-2xl transition-all duration-200",
            "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          )}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-xl group-hover:bg-destructive/10 transition-all duration-200">
            <LogOut className="w-[18px] h-[18px]" />
          </div>
          {showExpanded && (
            <span className="ml-3 text-sm font-medium animate-fade-in">로그아웃</span>
          )}
        </button>
      </div>

      {/* 토글 버튼 - desktop only */}
      {!isMobile && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-[0_6px_12px_-3px_hsl(var(--primary)/0.4)] hover:scale-110 transition-transform duration-200"
        >
          {isOpen ? (
            <ChevronRight className="w-4 h-4 rotate-180" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      )}

    </aside>
  );
}
