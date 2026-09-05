import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AppLayout } from "./components/layout/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Schools from "./pages/Schools";

import Homework from "./pages/Homework";
import AssignmentStatus from "./pages/AssignmentStatus";
import MockExam from "./pages/MockExam";
import Passages from "./pages/Passages";
import CalendarPage from "./pages/CalendarPage";
import Notifications from "./pages/Notifications";
import Statistics from "./pages/Statistics";
import Settings from "./pages/Settings";
import AccessCodes from "./pages/AccessCodes";
import StudentDashboard from "./pages/StudentDashboard";
import NotFound from "./pages/NotFound";

// QueryClient를 컴포넌트 외부에서 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1분 동안 fresh 상태 유지
      gcTime: 10 * 60 * 1000, // 10분간 캐시 유지
      retry: 1,
      refetchOnWindowFocus: false, // 창 포커스 시 재요청 방지
    },
  },
});

// 보호된 라우트 컴포넌트
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // 학생 역할이면 학생 대시보드로 리다이렉트
  if (session.role === "student") {
    return <Navigate to="/student" replace />;
  }

  return <>{children}</>;
}

// 관리자 전용 라우트
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();

  if (!session?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// 학생 전용 라우트
function StudentRoute({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // 학생이 아니면 메인으로
  if (session.role !== "student") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// 로그인 페이지 라우트 (이미 로그인했으면 메인으로)
function LoginRoute() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (session) {
    // 역할에 따라 다른 페이지로
    if (session.role === "student") {
      return <Navigate to="/student" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <Login />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      
      {/* 학생 전용 라우트 */}
      <Route 
        path="/student" 
        element={
          <StudentRoute>
            <StudentDashboard />
          </StudentRoute>
        } 
      />

      {/* 교사/관리자 라우트 */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/schools" element={<Schools />} />
        <Route path="/assignment-status" element={<AssignmentStatus />} />
        <Route path="/mock-exam" element={<MockExam />} />
        
        <Route path="/homework" element={<Homework />} />
        <Route path="/passages" element={<Passages />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/access-codes" element={<AdminRoute><AccessCodes /></AdminRoute>} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
