import React from "react";
import { Link, useLocation } from "react-router-dom";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { FileText, Plus, SaveAll, Home } from "lucide-react";
import orunLogoAsset from "@/assets/orun-logo.png.asset.json";

const Navigation: React.FC = () => {
  const location = useLocation();

  return (
    <div className="w-full py-2 px-4 fixed top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-900/10">
      <div className="max-w-7xl mx-auto flex justify-center items-center px-4 sm:px-6">
        <div className="flex items-center justify-between w-full max-w-6xl">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.35)] overflow-hidden">
              <img src={orunLogoAsset.url} alt="ORUN ENGLISH 로고" className="w-6 h-6 object-contain" />
            </span>
            <span className="font-semibold text-slate-800 tracking-[-0.01em]">내신시험 분석 리포트</span>
          </Link>

          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link to="/">
                  <NavigationMenuLink
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 text-sm rounded-full text-slate-600 hover:bg-slate-900/5 hover:text-slate-900 transition-colors",
                      location.pathname === "/" && "bg-slate-900/5 text-slate-900 font-medium"
                    )}
                  >
                    <Home className="h-4 w-4" />
                    홈
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
              <NavigationMenuTrigger className="rounded-full text-slate-900 hover:bg-slate-900/5 hover:text-slate-900 data-[state=open]:bg-slate-900/5 data-[state=open]:text-slate-900">
                  리포트 작성
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-1 p-3 w-[220px]">
                    <Link
                      to="/create-report/middle"
                      className="block px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-900/5 hover:text-slate-900 transition-colors"
                    >
                      중학교 리포트 작성
                    </Link>
                    <Link
                      to="/create-report/high"
                      className="block px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-900/5 hover:text-slate-900 transition-colors"
                    >
                      고등학교 리포트 작성
                    </Link>
                    <Link
                      to="/create-report"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-900/5 hover:text-slate-900 transition-colors"
                    >
                      <Plus className="h-4 w-4 text-[#F5C64F]" />
                      학교 유형 선택
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/saved-reports">
                  <NavigationMenuLink
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 text-sm rounded-full text-slate-600 hover:bg-slate-900/5 hover:text-slate-900 transition-colors",
                      location.pathname === "/saved-reports" && "bg-slate-900/5 text-slate-900 font-medium"
                    )}
                  >
                    <SaveAll className="h-4 w-4" />
                    저장된 리포트
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
