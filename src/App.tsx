import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import { AccessCodeCheck } from "./components/AccessCodeCheck";

const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

const App = () => {
  const [queryClient] = useState(() => new QueryClient());
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    // Check session status on window focus
    const handleFocus = () => {
      const lastLoginTime = localStorage.getItem("lastLoginTime");
      const hasStoredAccess = localStorage.getItem("hasAccess");
      
      if (lastLoginTime && hasStoredAccess) {
        const timeDiff = Date.now() - parseInt(lastLoginTime);
        if (timeDiff >= SESSION_TIMEOUT) {
          // Session expired
          localStorage.removeItem("hasAccess");
          localStorage.removeItem("lastLoginTime");
          localStorage.removeItem("subscriptionExpiry");
          localStorage.removeItem("userName");
          localStorage.removeItem("isAdmin");
          setHasAccess(false);
        } else {
          setHasAccess(true);
        }
      }
    };

    // Check session status on component mount
    handleFocus();

    // Add event listeners
    window.addEventListener('focus', handleFocus);
    
    // Clean up
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={hasAccess ? <Index /> : <Navigate to="/login" />}
            />
            <Route
              path="/login"
              element={
                hasAccess ? (
                  <Navigate to="/" />
                ) : (
                  <AccessCodeCheck onAccessGranted={() => setHasAccess(true)} />
                )
              }
            />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;