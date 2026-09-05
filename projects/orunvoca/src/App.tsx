import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

import { useEffect, useState } from "react";
import AccessLogin from "./pages/AccessLogin";
import Index from "./pages/Index";
import EditCardSet from "./pages/EditCardSet";
import Study from "./pages/Study";
import Practice from "./pages/Practice";
import CreateCardSet from "./pages/CreateCardSet";
import CreateTestPaper from "./pages/CreateTestPaper";

import StudentProfile from "./pages/StudentProfile";
import StudentRanking from "./pages/StudentRanking";
import NotFound from "./pages/NotFound";
import CreateExam from "./pages/CreateExam";
import ExamList from "./pages/ExamList";
import TakeExam from "./pages/TakeExam";
import ExamResults from "./pages/ExamResults";
import StudentExamReport from "./pages/StudentExamReport";
import StudentResultLookup from "./pages/StudentResultLookup";
import CumulativeStats from "./pages/CumulativeStats";
import ExamComplete from "./pages/ExamComplete";
import StudentAccessManager from "./pages/StudentAccessManager";
import HomeworkManager from "./pages/HomeworkManager";
import StudentHomework from "./pages/StudentHomework";
import BatchRegeneration from "./pages/BatchRegeneration";
import BatchContentStudio from "./pages/BatchContentStudio";
import Brainiac from "./pages/Brainiac";
import { useAudioUnlock } from "@/hooks/use-audio-unlock";

const queryClient = new QueryClient();

// Protected Route Component for Admin
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const isAdminLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
  return isAdminLoggedIn ? <>{children}</> : <Navigate to="/" replace />;
};

// Protected Route Component for All Authenticated Users
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAdminLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
  const studentData = sessionStorage.getItem('studentData');
  return (isAdminLoggedIn || studentData) ? <>{children}</> : <Navigate to="/" replace />;
};

// Auth Guard Component
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthStatus = () => {
      const adminLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
      const studentData = sessionStorage.getItem('studentData');
      
      if (adminLoggedIn || studentData) {
        setShouldRedirect('/dashboard');
      }
      
      setIsChecking(false);
    };

    checkAuthStatus();
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">로그인 상태 확인 중...</p>
        </div>
      </div>
    );
  }

  if (shouldRedirect) {
    return <Navigate to={shouldRedirect} replace />;
  }

  return <>{children}</>;
};

const App = () => {
  useAudioUnlock();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen w-full">
            <Routes>
              <Route path="/" element={
                <AuthGuard>
                  <AccessLogin />
                </AuthGuard>
              } />
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/edit/:id" element={
                  <ProtectedAdminRoute>
                    <EditCardSet />
                  </ProtectedAdminRoute>
                } />
                <Route path="/create" element={
                  <ProtectedAdminRoute>
                    <CreateCardSet />
                  </ProtectedAdminRoute>
                } />
                <Route path="/create-test-paper" element={
                  <ProtectedAdminRoute>
                    <CreateTestPaper />
                  </ProtectedAdminRoute>
                } />
                <Route path="/brainiac" element={
                  <ProtectedAdminRoute>
                    <Brainiac />
                  </ProtectedAdminRoute>
                } />
                <Route path="/create-exam" element={
                  <ProtectedAdminRoute>
                    <CreateExam />
                  </ProtectedAdminRoute>
                } />
                <Route path="/exam-list" element={
                  <ExamList />
                } />
                <Route path="/take-exam" element={
                  <TakeExam />
                } />
                <Route path="/exam-complete" element={
                  <ExamComplete />
                } />
                <Route path="/result" element={
                  <StudentResultLookup />
                } />
                <Route path="/exam-results" element={
                  <ProtectedAdminRoute>
                    <ExamResults />
                  </ProtectedAdminRoute>
                } />
                <Route path="/cumulative-stats" element={
                  <ProtectedAdminRoute>
                    <CumulativeStats />
                  </ProtectedAdminRoute>
                } />
                <Route path="/student-report/:submissionId" element={
                  <StudentExamReport />
                } />
                <Route path="/student-profile" element={
                  <ProtectedRoute>
                    <StudentProfile />
                  </ProtectedRoute>
                } />
                <Route path="/student-ranking" element={
                  <ProtectedRoute>
                    <StudentRanking />
                  </ProtectedRoute>
                } />
                <Route path="/student-access-manager" element={
                  <ProtectedAdminRoute>
                    <StudentAccessManager />
                  </ProtectedAdminRoute>
                } />
                <Route path="/homework-manager" element={
                  <ProtectedAdminRoute>
                    <HomeworkManager />
                  </ProtectedAdminRoute>
                } />
                <Route path="/student-homework" element={
                  <ProtectedRoute>
                    <StudentHomework />
                  </ProtectedRoute>
                } />
                <Route path="/batch-regeneration" element={
                  <ProtectedAdminRoute>
                    <BatchRegeneration />
                  </ProtectedAdminRoute>
                } />
                <Route path="/batch-content" element={
                  <ProtectedAdminRoute>
                    <BatchContentStudio />
                  </ProtectedAdminRoute>
                } />
                <Route path="/study/:id" element={<Study />} />
                <Route path="/practice/:id" element={<Practice />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;