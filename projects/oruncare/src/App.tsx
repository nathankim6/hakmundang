
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Progress from "./pages/Progress";
import Attendance from "./pages/Attendance";
import Classes from "./pages/Classes";
import NotFound from "./pages/NotFound";
import AccessCodeManagement from "./pages/AccessCodeManagement";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useEffect } from "react";
import "./cyberpunk-styles.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  // Add cyberpunk theme styles to tailwind
  useEffect(() => {
    document.documentElement.classList.add('cyber-theme');
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/classes" element={<Classes />} />
                <Route path="/access-codes" element={<AccessCodeManagement />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
