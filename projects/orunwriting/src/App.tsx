import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Index from "./pages/Index";
import Practice from "./pages/Practice";
import ReadingWorkbook from "./pages/ReadingWorkbook";
import CombinedWorkbook from "./pages/CombinedWorkbook";
import SchoolProblemsWorkbook from "./pages/SchoolProblemsWorkbook";
import AppendixWorkbook from "./pages/AppendixWorkbook";
import AppendixExamWorkbook from "./pages/AppendixExamWorkbook";
import ExamCreate from "./pages/ExamCreate";
import ExamList from "./pages/ExamList";
import ExamTake from "./pages/ExamTake";
import ExamResults from "./pages/ExamResults";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/workbook/grammar" element={<Index />} />
          <Route path="/workbook/reading/:workbookId" element={<ReadingWorkbook />} />
          <Route path="/workbook/combined" element={<CombinedWorkbook />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/workbook/school" element={<SchoolProblemsWorkbook />} />
          <Route path="/workbook/appendix" element={<AppendixWorkbook />} />
          <Route path="/workbook/appendix-exam" element={<AppendixExamWorkbook />} />
          <Route path="/exam/create" element={<ExamCreate />} />
          <Route path="/exam/list" element={<ExamList />} />
          <Route path="/exam/:examId/take" element={<ExamTake />} />
          <Route path="/exam/:examId/results" element={<ExamResults />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
