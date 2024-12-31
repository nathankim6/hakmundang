import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import { AccessCodeCheck } from "./components/AccessCodeCheck";

const App = () => {
  const [queryClient] = useState(() => new QueryClient());
  const hasAccess = localStorage.getItem("hasAccess") === "true";

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
              element={hasAccess ? <Navigate to="/" /> : <AccessCodeCheck />}
            />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;