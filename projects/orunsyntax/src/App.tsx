import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Workbook from "./pages/Workbook";
import WorkbookG12 from "./pages/WorkbookG12";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import DuplicateAnalysis from "./pages/DuplicateAnalysis";
import GrammarClassification from "./pages/GrammarClassification";
import SyntaxAnswerBook from "./pages/SyntaxAnswerBook";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            <Route path="/workbook/syntax-10000" element={<ProtectedRoute><Workbook /></ProtectedRoute>} />
            <Route path="/workbook/syntax-2320" element={<ProtectedRoute><WorkbookG12 /></ProtectedRoute>} />
            <Route path="/workbook/weekly-g10" element={<ProtectedRoute><WorkbookG12 grade="g10" /></ProtectedRoute>} />
            <Route path="/workbook/weekly-g11" element={<ProtectedRoute><WorkbookG12 grade="g11" /></ProtectedRoute>} />
            <Route path="/duplicate-analysis" element={<ProtectedRoute><DuplicateAnalysis /></ProtectedRoute>} />
            <Route path="/grammar-classification" element={<ProtectedRoute><GrammarClassification /></ProtectedRoute>} />
            <Route path="/workbook/syntax-2320/guide" element={<ProtectedRoute><SyntaxAnswerBook /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
