import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

const TABLET_BREAKPOINT = 1024;

export function AppLayout() {
  const [isCompact, setIsCompact] = useState(window.innerWidth < TABLET_BREAKPOINT);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= TABLET_BREAKPOINT);

  useEffect(() => {
    const handleResize = () => {
      const compact = window.innerWidth < TABLET_BREAKPOINT;
      setIsCompact(compact);
      if (compact) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-background flex ambient-canvas">
      {/* Overlay backdrop for compact mode */}
      {isCompact && sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-30 animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <AppSidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} isMobile={isCompact} />

      <div className={`relative z-10 flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        isCompact ? 'ml-0' : sidebarOpen ? 'ml-64' : 'ml-16'
      }`}>
        <AppHeader onMenuClick={handleSidebarToggle} showMenuButton={isCompact} />
        <main className={`flex-1 overflow-auto ${isCompact ? 'p-3' : 'p-6'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );

}
