
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import Admin from "@/pages/Admin";
import DailyReport from "@/pages/DailyReport";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Toaster } from "@/components/ui/toaster";
import { useAuthStore } from "@/lib/authStore";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./App.css";

function App() {
  // Remove the initializeAuth call since it doesn't exist
  // We'll check the authentication state in the ProtectedRoute component

  return (
    <ThemeProvider defaultTheme="light">
      <Router>
        <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
            <Route path="/daily-report" element={<ProtectedRoute><DailyReport /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
