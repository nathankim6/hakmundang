import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, Suspense } from "react";
import { AccessCodeCheck } from "./components/AccessCodeCheck";
import { Loader2 } from "lucide-react";

// Lazy load the main components
const Index = React.lazy(() => import("./pages/Index"));
const Admin = React.lazy(() => import("./pages/Admin"));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
  </div>
);

const App = () => {
  const [queryClient] = useState(() => new QueryClient());
  const hasAccess = localStorage.getItem("hasAccess") === "true";

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner />}>
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
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;