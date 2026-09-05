import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Create from "./pages/Create";
import Repository from "./pages/Repository";
import Compare from "./pages/Compare";
import IntegratedAnalysis from "./pages/IntegratedAnalysis";
import ExamDbHigh from "./pages/ExamDbHigh";
import ExamDbMiddle from "./pages/ExamDbMiddle";
import InternalReport from "./pages/InternalReport";
import SchoolAnalytics from "./pages/SchoolAnalytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<Create />} />
          <Route path="/create-heukseok" element={<Create />} />
          <Route path="/create-songpa" element={<Create />} />
          <Route path="/repository" element={<Repository />} />
          <Route path="/repository-heukseok" element={<Repository />} />
          <Route path="/repository-songpa" element={<Repository />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/integrated-analysis" element={<IntegratedAnalysis />} />
          <Route path="/exam-db-high" element={<ExamDbHigh />} />
          <Route path="/exam-db-middle" element={<ExamDbMiddle />} />
          <Route path="/internal-report" element={<InternalReport />} />
          <Route path="/school-analytics" element={<SchoolAnalytics />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
