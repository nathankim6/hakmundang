
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Index from './pages/Index';
import Admin from './pages/Admin';

import Tests from './pages/Tests';
import Results from './pages/Results';
import StudentHistory from './pages/StudentHistory';
import TestPage from './pages/TestPage';
import ResultView from './components/ResultView';
import Timer from './pages/Timer';
import NotFound from './pages/NotFound';
import OMRCard from './components/OMRCard';
import WritingTestOMR from './components/WritingTestOMR';
import LevelTest from './pages/LevelTest';
import HighSchoolLevelTest from './pages/HighSchoolLevelTest';
import PrepLevelTest from '@/pages/PrepLevelTest';
import LevelTestResult from './pages/LevelTestResult';
import LevelTestComplete from './pages/LevelTestComplete';

import TestResultReport from './pages/TestResultReport';
import WritingTestResult from './pages/WritingTestResult';
import { Toaster } from "@/components/ui/toaster";
import { supabase } from "@/integrations/supabase/client";
import GlobalDownloadProgress from './components/GlobalDownloadProgress';

// Protected route component with server-side verification
const ProtectedRoute = ({ children }) => {
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const location = useLocation();

  useEffect(() => {
    const verifyAccess = async () => {
      const code = sessionStorage.getItem('verifiedAccessCode');
      if (!code) {
        setAuthState('unauthenticated');
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('verify-access-code', {
          body: { code },
        });

        if (!error && data?.valid) {
          setAuthState('authenticated');
        } else {
          sessionStorage.removeItem('verifiedAccessCode');
          setAuthState('unauthenticated');
        }
      } catch {
        sessionStorage.removeItem('verifiedAccessCode');
        setAuthState('unauthenticated');
      }
    };

    verifyAccess();
  }, []);

  if (authState === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">확인 중...</div>;
  }

  if (authState === 'unauthenticated') {
    return <Navigate to="/admin" replace state={{ from: location.pathname + location.search }} />;
  }
  
  return children;
};

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/omr" element={<OMRCard />} />
          <Route path="/omr/:testId" element={<OMRCard />} />
          <Route path="/writing/:testId" element={<WritingTestOMR />} />
          <Route path="/writing-result" element={<WritingTestResult />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/results" element={<Results />} />
          <Route 
            path="/student-history" 
            element={
              <ProtectedRoute>
                <StudentHistory />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student-history/:studentName" 
            element={
              <ProtectedRoute>
                <StudentHistory />
              </ProtectedRoute>
            } 
          />
          <Route path="/test/:testId" element={<TestPage />} />
          <Route path="/result" element={<ResultView />} />
          <Route path="/timer" element={<Timer />} />
          <Route path="/level-test" element={<LevelTest />} />
          <Route path="/level-test/high-school" element={<HighSchoolLevelTest />} />
          <Route path="/level-test/prep" element={<PrepLevelTest />} />
          <Route path="/level-test/complete" element={<LevelTestComplete />} />
          <Route path="/level-test/result/:id" element={<LevelTestResult />} />
          
          <Route path="/test-result/:id" element={<TestResultReport />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
        <GlobalDownloadProgress />
      </div>
    </Router>
  );
}

export default App;
