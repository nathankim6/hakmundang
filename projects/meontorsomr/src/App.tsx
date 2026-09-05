
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminForm from "./components/AdminForm";
import OMRCard from "./components/OMRCard";
import ResultView from "./components/ResultView";
import Results from "./pages/Results";
import TestList from "./components/TestList";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<AdminForm />} />
          <Route path="/tests" element={<TestList />} />
          <Route path="/omr" element={<OMRCard />} />
          <Route path="/omr/:testId" element={<OMRCard />} />
          <Route path="/result" element={<ResultView />} />
          <Route path="/results" element={<Results />} />
          <Route path="/scan" element={<TestList />} />  {/* Added missing /scan route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
