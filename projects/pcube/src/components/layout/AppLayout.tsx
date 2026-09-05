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
    <div className="app-ambient relative min-h-screen w-full max-w-full overflow-x-hidden bg-background flex">
      {/* Overlay backdrop for compact mode */}
      {isCompact && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <AppSidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} isMobile={isCompact} />

      <div className={`relative z-10 min-w-0 max-w-full flex-1 flex flex-col transition-all duration-300 ${
        isCompact ? 'ml-0' : sidebarOpen ? 'ml-64' : 'ml-16'
      }`}>
        <AppHeader onMenuClick={handleSidebarToggle} showMenuButton={isCompact} />
        <main className={`min-w-0 max-w-full flex-1 overflow-x-hidden overflow-y-auto ${isCompact ? 'p-3' : 'p-6'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
