import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { TopNavbar } from "@/components/layout/TopNavbar";

export function AppLayout() {
  useEffect(() => {
    const setViewport = () => {
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute(
          'content',
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, viewport-fit=cover'
        );
      }
      if (window.screen && window.screen.width <= 768) {
        document.body.style.zoom = '1';
        document.documentElement.style.zoom = '1';
      }
    };
    setViewport();
    const onOrientation = () => setTimeout(setViewport, 100);
    const onResize = () => setViewport();
    window.addEventListener('orientationchange', onOrientation);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('orientationchange', onOrientation);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className="h-screen w-full apple-canvas text-foreground flex flex-col relative overflow-hidden overflow-x-hidden">
      <TopNavbar />
      <main className="flex-1 min-h-0 overflow-y-auto relative z-10">
        <div className="w-full h-full">
          <Outlet />
        </div>
      </main>
      <footer className="shrink-0 border-t border-[#c9b99a] bg-[#201a14] px-5 md:px-8 py-2.5 text-center">
        <p className="text-[10px] md:text-[11px] tracking-[0.1em] text-[#bfae94]">
          © {new Date().getFullYear()} ORUN ENGLISH. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
