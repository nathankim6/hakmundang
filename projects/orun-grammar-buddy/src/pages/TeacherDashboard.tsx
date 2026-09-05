import { useState } from "react";
import { BookOpen, Users, FileText, ClipboardList, Home, Settings, LogOut, Menu, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import QuestionManagement from "@/components/teacher/QuestionManagement";
import StudentManagement from "@/components/teacher/StudentManagement";
import ExamManagement from "@/components/teacher/ExamManagement";
import TeacherOverview from "@/components/teacher/TeacherOverview";

type TabType = "overview" | "questions" | "students" | "exams";

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const menuItems = [
    { id: "overview" as TabType, label: "대시보드", icon: Home },
    { id: "questions" as TabType, label: "문제 등록", icon: FileText },
    { id: "students" as TabType, label: "학생 관리", icon: Users },
    { id: "exams" as TabType, label: "시험 출제", icon: ClipboardList },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <TeacherOverview />;
      case "questions":
        return <QuestionManagement />;
      case "students":
        return <StudentManagement />;
      case "exams":
        return <ExamManagement />;
      default:
        return <TeacherOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-card border-r border-border z-40 transition-all duration-300",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">ORUN</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={cn(sidebarCollapsed && "mx-auto")}
          >
            {sidebarCollapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left",
                activeTab === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border space-y-1">
          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">설정</span>}
          </button>
          <a
            href="/"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">로그아웃</span>}
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 transition-all duration-300",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}
      >
        {/* Top Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              {menuItems.find((item) => item.id === activeTab)?.label}
            </h1>
            <p className="text-sm text-muted-foreground">선생님 관리 페이지</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">김선생님</p>
              <p className="text-xs text-muted-foreground">오룬학원</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-medium">
              김
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
