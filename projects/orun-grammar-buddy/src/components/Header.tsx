import { Button } from "@/components/ui/button";
import { Menu, X, FileText, ClipboardList, BarChart3, TrendingUp, Settings } from "lucide-react";
import orunLogo from "@/assets/orun-logo.jpg";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { name: "문제관리", path: "/questions", icon: FileText },
  { name: "시험생성", path: "/exam-create", icon: ClipboardList },
  { name: "시험참여", path: "/exams", icon: ClipboardList },
  { name: "결과확인", path: "/results", icon: BarChart3 },
  { name: "누적통계", path: "/statistics", icon: TrendingUp },
  { name: "코드관리", path: "/codes", icon: Settings },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity"></div>
              <img src={orunLogo} alt="ORUN GRAMMAR" className="relative w-12 h-12 rounded-xl object-contain shadow-lg ring-2 ring-primary/20" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent drop-shadow-sm">
                ORUN GRAMMAR
              </span>
              <span className="text-[11px] text-muted-foreground font-medium -mt-0.5 tracking-widest uppercase">
                옳은영어 문법시험 플랫폼
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost">로그인</Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border mt-2">
                <Button variant="ghost" className="justify-start">로그인</Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
