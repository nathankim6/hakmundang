import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  BookOpen,
  Plus,
  Settings,
  Users,
  BarChart3,
  Brain,
  Sparkles,
  Home,
  ClipboardList,
  FileText
} from "lucide-react";

const menuItems = [
  {
    title: "대시보드",
    url: "/dashboard",
    icon: LayoutDashboard,
    description: "메인 대시보드"
  },
  {
    title: "단어장 생성",
    url: "/create",
    icon: Plus,
    description: "새 학습 카드 생성"
  },
  {
    title: "과제 관리",
    url: "/assignments",
    icon: ClipboardList,
    description: "과제 목록 관리"
  },
  {
    title: "학생 관리",
    url: "/student-access-manager",
    icon: Users,
    description: "학생 액세스 관리"
  },
  {
    title: "통계",
    url: "/analytics",
    icon: BarChart3,
    description: "학습 통계 분석"
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-64"} transition-all duration-300`}>
      <SidebarHeader className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <h2 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                옳은영어
              </h2>
              <span className="text-xs text-muted-foreground">VOCAB LAB</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground mb-2">
            {!collapsed && "메뉴"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.url)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive(item.url)
                        ? "bg-gradient-primary text-white shadow-md"
                        : "hover:bg-sidebar-accent text-sidebar-foreground"
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${
                      isActive(item.url) ? "text-white" : "text-muted-foreground"
                    }`} />
                    {!collapsed && (
                      <div className="flex flex-col items-start">
                        <span className={`text-sm font-medium ${
                          isActive(item.url) ? "text-white" : "text-sidebar-foreground"
                        }`}>
                          {item.title}
                        </span>
                        <span className={`text-xs ${
                          isActive(item.url) ? "text-white/80" : "text-muted-foreground"
                        }`}>
                          {item.description}
                        </span>
                      </div>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <div className="mt-auto p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-secondary rounded-full flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">관리자</span>
                <span className="text-xs text-muted-foreground">Admin</span>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}