import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
import TextbookGenerator from "./pages/TextbookGenerator";
import NotFound from "./pages/NotFound";
import AppendWords from "./pages/AppendWords";
import GenerateDefinitions from "./pages/GenerateDefinitions";
import PartOfSpeechTagger from "./pages/PartOfSpeechTagger";
import OrganizeWords from "./pages/OrganizeWords";
import RandomTest from "./pages/RandomTest";
import LevelTest from "./pages/LevelTest";
import UltimateRandomTest from "./pages/UltimateRandomTest";
import MockExam from "./pages/MockExam";
import SungnamTypeMockExam from "./pages/SungnamTypeMockExam";
import SungnamReviewTests from "./pages/SungnamReviewTests";
import Auth from "./pages/Auth";
import SynonymAntonymList from "./pages/SynonymAntonymList";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, session }: { children: React.ReactNode; session: Session | null }) => {
  if (!session) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={session ? <Navigate to="/" replace /> : <Auth />} />
            <Route path="/" element={<ProtectedRoute session={session}><Dashboard /></ProtectedRoute>} />
            <Route path="/generator" element={<ProtectedRoute session={session}><Index /></ProtectedRoute>} />
            <Route path="/textbook/:schoolId" element={<ProtectedRoute session={session}><TextbookGenerator /></ProtectedRoute>} />
            <Route path="/append-words" element={<ProtectedRoute session={session}><AppendWords /></ProtectedRoute>} />
            <Route path="/generate-definitions" element={<ProtectedRoute session={session}><GenerateDefinitions /></ProtectedRoute>} />
            <Route path="/pos-tagger" element={<ProtectedRoute session={session}><PartOfSpeechTagger /></ProtectedRoute>} />
            <Route path="/organize-words" element={<ProtectedRoute session={session}><OrganizeWords /></ProtectedRoute>} />
            <Route path="/level-test" element={<ProtectedRoute session={session}><LevelTest /></ProtectedRoute>} />
            <Route path="/random-test" element={<ProtectedRoute session={session}><RandomTest /></ProtectedRoute>} />
            <Route path="/ultimate-random-test" element={<ProtectedRoute session={session}><UltimateRandomTest /></ProtectedRoute>} />
            <Route path="/mock-exam" element={<ProtectedRoute session={session}><MockExam /></ProtectedRoute>} />
            <Route path="/sungnam-type-exam" element={<ProtectedRoute session={session}><SungnamTypeMockExam /></ProtectedRoute>} />
            <Route path="/sungnam-review" element={<ProtectedRoute session={session}><SungnamReviewTests /></ProtectedRoute>} />
            <Route path="/synonym-antonym-list" element={<ProtectedRoute session={session}><SynonymAntonymList /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
