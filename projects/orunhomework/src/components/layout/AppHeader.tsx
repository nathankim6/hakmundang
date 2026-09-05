import { Menu, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useLocation } from "react-router-dom";
import adminAvatar from "@/assets/admin-avatar.jpg";

interface AppHeaderProps {
  onMenuClick: () => void;
  showMenuButton?: boolean;
}
export function AppHeader({
  onMenuClick,
  showMenuButton = false,
}: AppHeaderProps) {
  const {
    session,
    logout
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isSettingsPage = location.pathname === "/settings";
  return <header className="h-14 md:h-16 bg-white/70 backdrop-blur-2xl border-b border-border/60 flex items-center justify-between px-3 md:px-6 sticky top-0 z-30">
        <div className="flex items-center gap-2 md:gap-4">
          {showMenuButton && (
            <Button variant="ghost" size="icon" className="rounded-xl" onClick={onMenuClick}>
              <Menu className="w-5 h-5" />
            </Button>
          )}

          {/* 설정 페이지 표시 */}
          {isSettingsPage && (
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">설정</span>
            </div>
          )}

          {/* 검색 */}
          {!isSettingsPage && (
            <div className="relative hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="학생, 학교, 과제 검색..." className="w-80 h-10 pl-11 rounded-2xl bg-secondary/60 border-2 border-transparent focus-visible:bg-white focus-visible:border-primary/30 focus-visible:ring-0 transition-all" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* 프로필 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 rounded-2xl px-3 h-10 hover:bg-secondary/70">
                <span className="text-sm font-medium text-muted-foreground">My Page</span>
                <img src={adminAvatar} alt="관리자" className="w-8 h-8 rounded-xl object-cover ring-1 ring-border" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex items-center gap-2">
                  <span>{session?.name}</span>
                  {session?.isAdmin && <Badge variant="outline" className="text-xs">관리자</Badge>}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                프로필 설정
              </DropdownMenuItem>
              {session?.isAdmin && <DropdownMenuItem onClick={() => navigate("/access-codes")}>
                  접속코드 관리
                </DropdownMenuItem>}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={logout}>
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>;
}
