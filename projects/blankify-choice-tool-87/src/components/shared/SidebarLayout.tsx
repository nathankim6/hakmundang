import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Settings, BookOpen, MessagesSquare, Image, Home, FileText, Database, ChevronRight, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccessCode } from '@/contexts/AccessCodeContext';
import Footer from '@/components/Footer';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarProvider, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from "@/components/ui/sidebar";

interface SidebarLayoutProps {
  children: React.ReactNode;
  apiKeyButton?: React.ReactNode;
  isAdmin?: boolean;
  pageIcon: React.ReactNode;
  pageTitle: string;
  pageDescription: string;
  pageImage?: string;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({
  children,
  apiKeyButton,
  isAdmin = false,
  pageIcon,
  pageTitle,
  pageDescription,
  pageImage
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    logout
  } = useAccessCode();
  
  const handleLogout = () => {
    logout();
    navigate('/access');
  };
  
  const isActive = (path: string) => location.pathname === path;
  
  return <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Sidebar className="border-r border-slate-200" style={{
        "--sidebar-width": "18rem"
      } as React.CSSProperties}>
          <SidebarHeader>
            <div className="flex items-center gap-3 py-4 px-[31px]">
              <div className="h-10 w-10 overflow-hidden relative group">
                <div className="absolute inset-0 bg-indigo-600/10 rounded-full group-hover:bg-indigo-600/20 transition-colors duration-300"></div>
                <img alt="Orun Academy Logo" className="h-full w-full object-contain relative z-10" src="/lovable-uploads/f0766864-b703-41e3-a7a8-b78bbbcdd496.jpg" />
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-700 bg-clip-text text-transparent flex items-center">
                  NEW VERITAS
                </span>
                <span className="text-slate-500 font-medium tracking-wide text-xs">옳은영어 워크북 제작플랫폼</span>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <div className="px-3 py-2 mb-2">
              <div className="bg-indigo-50/50 rounded-lg p-2">
                <h3 className="text-xs font-medium text-indigo-700 mb-2 px-2">메인</h3>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/")} tooltip="메인화면" className="hover:bg-indigo-100/70 data-[active=true]:bg-indigo-100 data-[active=true]:text-indigo-700 py-3 text-base">
                      <Link to="/">
                        <Home className="h-5 w-5" />
                        <span>메인화면</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </div>
            </div>
            
            <div className="px-3 py-2 mb-2">
              <div className="bg-blue-50/50 rounded-lg p-2">
                <h3 className="text-xs font-medium text-blue-700 mb-2 px-2">학습 단계</h3>
                <SidebarMenu className="space-y-2">
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/analysis")} tooltip="STEP1 분석지" className="hover:bg-blue-100/70 data-[active=true]:bg-blue-100 data-[active=true]:text-blue-700 py-3 text-base">
                      <Link to="/analysis">
                        <Settings className="h-5 w-5" />
                        <span>STEP1 분석지</span>
                        <ChevronRight className="h-3 w-3 ml-auto opacity-70" />
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/understanding")} tooltip="STEP2 내용이해" className="hover:bg-blue-100/70 data-[active=true]:bg-blue-100 data-[active=true]:text-blue-700 py-3 text-base">
                      <Link to="/understanding">
                        <BookOpen className="h-5 w-5" />
                        <span>STEP2 내용이해</span>
                        <ChevronRight className="h-3 w-3 ml-auto opacity-70" />
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/worksheet")} tooltip="STEP3 선택/배열/영작" className="hover:bg-blue-100/70 data-[active=true]:bg-blue-100 data-[active=true]:text-blue-700 py-3 text-base">
                      <Link to="/worksheet">
                        <FileText className="h-5 w-5" />
                        <span>STEP3 선택/배열/영작</span>
                        <ChevronRight className="h-3 w-3 ml-auto opacity-70" />
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/synonyms")} tooltip="STEP4 동의어/반의어" className="hover:bg-blue-100/70 data-[active=true]:bg-blue-100 data-[active=true]:text-blue-700 py-3 text-base">
                      <Link to="/synonyms">
                        <MessagesSquare className="h-5 w-5" />
                        <span>STEP4 동의어/반의어</span>
                        <ChevronRight className="h-3 w-3 ml-auto opacity-70" />
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/illustration")} tooltip="STEP5 삽화" className="hover:bg-blue-100/70 data-[active=true]:bg-blue-100 data-[active=true]:text-blue-700 py-3 text-base">
                      <Link to="/illustration">
                        <Image className="h-5 w-5" />
                        <span>STEP5 삽화</span>
                        <ChevronRight className="h-3 w-3 ml-auto opacity-70" />
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </div>
            </div>
            
            <div className="px-3 py-2">
              <div className="bg-purple-50/50 rounded-lg p-2">
                <h3 className="text-xs font-medium text-purple-700 mb-2 px-2">데이터</h3>
                <SidebarMenu className="space-y-2">
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/passages")} tooltip="지문 데이터베이스" className="hover:bg-purple-100/70 data-[active=true]:bg-purple-100 data-[active=true]:text-purple-700 py-3 text-base">
                      <Link to="/passages">
                        <Database className="h-5 w-5" />
                        <span>지문 데이터베이스</span>
                        <ChevronRight className="h-3 w-3 ml-auto opacity-70" />
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/my-works")} tooltip="내 작업" className="hover:bg-purple-100/70 data-[active=true]:bg-purple-100 data-[active=true]:text-purple-700 py-3 text-base">
                      <Link to="/my-works">
                        <FolderOpen className="h-5 w-5" />
                        <span>내 작업</span>
                        <ChevronRight className="h-3 w-3 ml-auto opacity-70" />
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </div>
            </div>
          </SidebarContent>
          
          <SidebarFooter>
            <div className="p-4 space-y-3">
              <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                {apiKeyButton && <div className="flex justify-center mb-2">
                    {apiKeyButton}
                  </div>}
                
                {isAdmin && <Button variant="outline" size="sm" onClick={() => navigate('/admin/codes')} className="w-full text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-100 transition-all duration-200 mt-2">
                    <Settings className="h-4 w-4 mr-2" />
                    엑세스 코드 관리
                  </Button>}
              </div>
              
              <Button variant="outline" size="sm" onClick={handleLogout} className="w-full bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-100 transition-all duration-200">
                <LogOut className="h-4 w-4 mr-2" />
                로그아웃
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        
        <SidebarInset>
          <div className="container mx-auto px-4 py-8 flex-grow">
            <div className="max-w-7xl mx-auto">
              <div className="w-full bg-white rounded-2xl p-8 shadow-xl border border-slate-100 animate-fade-in">
                <div className="mb-8 text-center">
                  <div className="inline-block p-4 bg-blue-50 rounded-2xl mb-4">
                    {pageIcon}
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-teal-600 to-green-600 bg-clip-text text-transparent mb-4">{pageTitle}</h1>
                  <p className="text-slate-600 max-w-2xl mx-auto text-center">
                    {pageDescription}
                  </p>
                  {pageImage && <div className="flex items-center justify-center mt-4">
                      <img src={pageImage} alt={pageTitle} className="mx-auto max-w-xl w-full h-auto rounded-lg shadow-md" />
                    </div>}
                </div>
                {children}
              </div>
            </div>
          </div>
          
          <div className="w-full mt-auto bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 text-white">
            <Footer />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>;
};

export default SidebarLayout;
