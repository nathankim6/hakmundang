import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, FileText, BookOpen, Database, GitCompare, ClipboardList, MapPin, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/logo.jpg";
export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  return <header className="relative border-b border-glass-edge sticky top-0 z-50 backdrop-blur-2xl bg-glass-panel shadow-[0_10px_30px_-24px_hsl(var(--glass-shadow))]">
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
            <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-glass-edge ring-1 ring-primary/10 group-hover:ring-primary/30 transition-all duration-300">
              <img src={logo} alt="Logo" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="flex flex-col hidden sm:block">
              <h1 className="font-orbitron text-sm font-black uppercase tracking-[0.18em] bg-gradient-to-r from-glass-ink via-primary to-glass-ink bg-clip-text text-transparent">
                ORUN ANALYSIS
              </h1>
              <p className="text-[11px] text-glass-muted font-medium tracking-wide">
                옳은영어 학교분석 아카이브
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            <Button onClick={() => navigate("/")} variant="ghost" size="sm" className={`gap-2 font-medium transition-all duration-200 ${isActive("/") ? "bg-primary/10 text-primary" : "text-glass-ink/70 hover:text-primary hover:bg-glass-tint/60"}`}>
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">홈</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className={`gap-2 font-medium transition-all duration-200 ${isActive("/create") || isActive("/create-heukseok") || isActive("/create-songpa") ? "bg-primary/10 text-primary" : "text-glass-ink/70 hover:text-primary hover:bg-glass-tint/60"}`}>
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">분석제작</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-36">
                <DropdownMenuItem onClick={() => navigate("/create")} className="gap-2 cursor-pointer">
                  <MapPin className="w-4 h-4" />
                  동작
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/create-heukseok")} className="gap-2 cursor-pointer">
                  <MapPin className="w-4 h-4" />
                  흑석
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/create-songpa")} className="gap-2 cursor-pointer">
                  <MapPin className="w-4 h-4" />
                  송파
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className={`gap-2 font-medium transition-all duration-200 ${isActive("/repository") || isActive("/repository-heukseok") || isActive("/repository-songpa") ? "bg-primary/10 text-primary" : "text-glass-ink/70 hover:text-primary hover:bg-glass-tint/60"}`}>
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">분석DB</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-36">
                <DropdownMenuItem onClick={() => navigate("/repository")} className="gap-2 cursor-pointer">
                  <MapPin className="w-4 h-4" />
                  동작
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/repository-heukseok")} className="gap-2 cursor-pointer">
                  <MapPin className="w-4 h-4" />
                  흑석
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/repository-songpa")} className="gap-2 cursor-pointer">
                  <MapPin className="w-4 h-4" />
                  송파
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button onClick={() => navigate("/integrated-analysis")} variant="ghost" size="sm" className={`gap-2 font-medium transition-all duration-200 ${isActive("/integrated-analysis") ? "bg-primary/10 text-primary" : "text-glass-ink/70 hover:text-primary hover:bg-glass-tint/60"}`}>
              <GitCompare className="w-4 h-4" />
              <span className="hidden sm:inline">통합분석</span>
            </Button>
            
            <Button onClick={() => navigate("/exam-db-high")} variant="ghost" size="sm" className={`gap-2 font-medium transition-all duration-200 ${isActive("/exam-db-high") ? "bg-primary/10 text-primary" : "text-glass-ink/70 hover:text-primary hover:bg-glass-tint/60"}`}>
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">기출(고등)</span>
            </Button>
            
            <Button onClick={() => navigate("/exam-db-middle")} variant="ghost" size="sm" className={`gap-2 font-medium transition-all duration-200 ${isActive("/exam-db-middle") ? "bg-primary/10 text-primary" : "text-glass-ink/70 hover:text-primary hover:bg-glass-tint/60"}`}>
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">기출(중등)</span>
            </Button>
            
            <Button onClick={() => navigate("/internal-report")} variant="ghost" size="sm" className={`gap-2 font-medium transition-all duration-200 ${isActive("/internal-report") ? "bg-primary/10 text-primary" : "text-glass-ink/70 hover:text-primary hover:bg-glass-tint/60"}`}>
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">내신리포트</span>
            </Button>
          </nav>
        </div>
      </div>
    </header>;
};