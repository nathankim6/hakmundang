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
  Camera,
  Megaphone,
  Tag } from
"lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import orunLogo from "@/assets/pcube-logo.png";
import adminAvatar from "@/assets/admin-avatar.jpg";

interface AppSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

const menuItems = [
{ path: "/", icon: Home, label: "대시보드" },
{ path: "/announcements", icon: Megaphone, label: "공지사항" },
{ path: "/photo-assignments", icon: Camera, label: "과제현황" },
{ path: "/schools", icon: School, label: "학생관리" },
{ path: "/groups", icon: Tag, label: "그룹관리" },
{ path: "/passages", icon: BookOpen, label: "지문관리(녹음과제)" },
{ path: "/homework", icon: PenLine, label: "서술형연습" },
{ path: "/notifications", icon: Bell, label: "알림센터" },
{ path: "/statistics", icon: BarChart3, label: "통계/리포트" },
{ path: "/settings", icon: Settings, label: "설정" }];



export function AppSidebar({ isOpen, onToggle, isMobile }: AppSidebarProps) {
  const location = useLocation();
  const { session, logout } = useAuth();

  // On mobile, sidebar is always full-width overlay when open
  const showExpanded = isMobile ? isOpen : isOpen;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full transition-all duration-300 flex flex-col",
        "apple-glass-dark border-r border-white/10",
        isMobile ?
        cn("z-40", isOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full") :
        cn("z-40", isOpen ? "w-64" : "w-16")
      )}>

      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-16 w-64 h-64 rounded-full bg-[hsl(160_76%_45%/0.10)] blur-3xl" />
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black/25 to-transparent" />
      </div>

      {/* 로고 (클릭 시 대시보드) */}
      <NavLink
        to="/"
        onClick={() => isMobile && onToggle()}
        className="relative h-14 flex items-center px-4 border-b border-white/[0.07] transition-colors hover:bg-white/[0.04] active:bg-white/[0.07]">

        <div className="relative">
          <img src={orunLogo} alt="Pcube English" className="w-8 h-8 rounded-[10px] object-cover ring-1 ring-white/15" />
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[hsl(222_47%_10%)]" />
        </div>
        {showExpanded &&
        <span
          className="ml-3 text-sm font-medium animate-fade-in uppercase whitespace-nowrap"
          style={{
            fontFamily: "'Josefin Sans', sans-serif",
            fontWeight: 400,
            letterSpacing: '0.18em',
            color: '#f2f2f6'
          }}>

            Pcube ENGLISH
          </span>
        }
      </NavLink>


      {/* 사용자 정보 */}
      {session &&
      <div className="relative px-4 py-3 border-b border-white/[0.07] animate-fade-in">
          <div className={cn("flex items-center", showExpanded ? "gap-3" : "justify-center")}>
            <div className="relative flex-shrink-0">
              <img
              src={adminAvatar}
              alt="관리자"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-white/15" />

            </div>
            {showExpanded &&
          <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-white truncate">{session.name}</p>
                {session.isAdmin &&
            <div className="flex items-center gap-1 mt-0.5">
                    <Sparkles className="w-2.5 h-2.5 text-emerald-300/90" strokeWidth={1.75} />
                    <span className="text-[10px] font-medium text-emerald-300/80 uppercase tracking-[0.12em]">Administrator</span>
                  </div>
            }
              </div>
          }
          </div>
        </div>
      }

      {/* 메뉴 */}
      <nav className="relative flex-1 py-3 overflow-y-auto scrollbar-thin">
        {showExpanded &&
        <div className="px-4 mb-3">
            <span className="text-[10px] font-medium text-white/35 uppercase tracking-[0.18em]">Menu</span>
          </div>
        }
        <ul className="space-y-0.5 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => isMobile && onToggle()}
                  className={cn(
                    "group relative flex items-center px-2.5 py-2 rounded-[10px] transition-all duration-200",
                    isActive ?
                    "bg-white/[0.09] text-white ring-1 ring-inset ring-white/10" :
                    "text-white/55 hover:text-white hover:bg-white/[0.05]"
                  )}>

                  {/* Active indicator */}
                  {isActive &&
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-emerald-400 rounded-full" />
                  }
                  
                  <div className={cn(
                    "flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200",
                    isActive ?
                    "bg-emerald-400/10" :
                    "group-hover:bg-white/[0.04]"
                  )}>
                    <Icon strokeWidth={1.75} className={cn(
                      "w-[17px] h-[17px] transition-all duration-200",
                      isActive ? "text-emerald-300" : "group-hover:text-white"
                    )} />
                  </div>
                  
                  {showExpanded &&
                  <span className={cn(
                    "ml-2.5 text-[13px] font-medium animate-fade-in transition-colors duration-200 tracking-tight",
                    isActive ? "text-white" : ""
                  )}>
                      {item.label}
                    </span>
                  }
                  
                  {showExpanded && isActive &&
                  <ChevronRight className="w-3.5 h-3.5 ml-auto text-white/25" strokeWidth={2} />
                  }
                </NavLink>
              </li>);

          })}

          {/* 관리자 전용 메뉴 */}
          {session?.isAdmin &&
          <>
              {showExpanded &&
            <div className="px-3 pt-4 pb-2">
                  <span className="text-[10px] font-medium text-white/35 uppercase tracking-[0.18em]">Admin</span>
                </div>
            }
              <li>
                <NavLink
                to="/access-codes"
                onClick={() => isMobile && onToggle()}
                className={cn(
                  "group relative flex items-center px-2.5 py-2 rounded-[10px] transition-all duration-200",
                  location.pathname === "/access-codes" ?
                  "bg-white/[0.09] text-white ring-1 ring-inset ring-white/10" :
                  "text-white/55 hover:text-white hover:bg-white/[0.05]"
                )}>

                  {location.pathname === "/access-codes" &&
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-emerald-400 rounded-full" />
                }
                  
                  <div className={cn(
                  "flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200",
                  location.pathname === "/access-codes" ?
                  "bg-emerald-400/10" :
                  "group-hover:bg-white/[0.04]"
                )}>
                    <Key strokeWidth={1.75} className={cn(
                    "w-[17px] h-[17px] transition-all duration-200",
                    location.pathname === "/access-codes" ? "text-emerald-300" : "group-hover:text-white"
                  )} />
                  </div>
                  
                  {showExpanded &&
                <span className={cn(
                  "ml-2.5 text-[13px] font-medium animate-fade-in tracking-tight",
                  location.pathname === "/access-codes" ? "text-white" : ""
                )}>
                      접속코드 관리
                    </span>
                }
                  
                  {showExpanded && location.pathname === "/access-codes" &&
                <ChevronRight className="w-3.5 h-3.5 ml-auto text-white/25" strokeWidth={2} />
                }
                </NavLink>
              </li>
            </>
          }
        </ul>

      </nav>

      {/* 로그아웃 */}
      <div className="relative p-2.5 border-t border-white/[0.07]">
        <button
          onClick={logout}
          className={cn(
            "w-full group flex items-center px-2.5 py-2 rounded-[10px] transition-all duration-200",
            "text-white/45 hover:text-rose-300 hover:bg-rose-500/10"
          )}>

          <div className="flex items-center justify-center w-7 h-7 rounded-lg group-hover:bg-rose-500/10 transition-all duration-200">
            <LogOut className="w-[17px] h-[17px]" strokeWidth={1.75} />
          </div>
          {showExpanded &&
          <span className="ml-2.5 text-[13px] font-medium animate-fade-in tracking-tight">로그아웃</span>
          }
        </button>
      </div>

      {/* 토글 버튼 - desktop only */}
      {!isMobile &&
      <button
        onClick={onToggle}
        className="absolute -right-3 top-[70px] w-6 h-6 rounded-full flex items-center justify-center bg-[hsl(222_47%_14%)] text-white/70 ring-1 ring-white/15 shadow-lg hover:text-white hover:scale-105 transition-all duration-200">

          {isOpen ?
        <ChevronRight className="w-4 h-4 rotate-180" /> :

        <ChevronRight className="w-4 h-4" />
        }
        </button>
      }
    </aside>);

}