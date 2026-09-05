
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { FileText, Plus, SaveAll, Home } from "lucide-react";

const Navigation: React.FC = () => {
  const location = useLocation();
  
  return (
    <div className="w-full py-2 px-4 bg-white/80 backdrop-blur-sm shadow-sm fixed top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-center items-center px-4 sm:px-6">
        <div className="flex items-center justify-between w-full max-w-6xl">
          <Link to="/" className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            <span className="font-medium text-gray-800">내신시험 분석 리포트</span>
          </Link>
          
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link to="/">
                  <NavigationMenuLink 
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 text-sm rounded-md hover:bg-slate-100 transition-colors",
                      location.pathname === "/" && "bg-slate-100 font-medium"
                    )}
                  >
                    <Home className="h-4 w-4" />
                    홈
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuTrigger>리포트 작성</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-2 p-4 w-[220px]">
                    <Link 
                      to="/create-report/middle"
                      className="block px-4 py-2 rounded-md hover:bg-slate-100 transition-colors"
                    >
                      중학교 리포트 작성
                    </Link>
                    <Link 
                      to="/create-report/high"
                      className="block px-4 py-2 rounded-md hover:bg-slate-100 transition-colors"
                    >
                      고등학교 리포트 작성
                    </Link>
                    <Link 
                      to="/create-report"
                      className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-slate-100 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      학교 유형 선택
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/saved-reports">
                  <NavigationMenuLink 
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 text-sm rounded-md hover:bg-slate-100 transition-colors",
                      location.pathname === "/saved-reports" && "bg-slate-100 font-medium"
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
