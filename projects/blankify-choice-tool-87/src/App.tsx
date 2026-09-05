
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AccessCodeProvider } from '@/contexts/AccessCodeContext';
import { ApiKeyProvider } from '@/contexts/ApiKeyContext';

// Import all pages
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import AccessCodePage from '@/pages/AccessCodePage';
import AnalysisPage from '@/pages/AnalysisPage';
import UnderstandingPage from '@/pages/UnderstandingPage';
import WorksheetPage from '@/pages/WorksheetPage';
import SynonymsPage from '@/pages/SynonymsPage';
import IllustrationPage from '@/pages/IllustrationPage';
import AdminCodesPage from '@/pages/AdminCodesPage';
import PassageDatabasePage from '@/pages/PassageDatabasePage';
import MyWorksPage from '@/pages/MyWorksPage';

function App() {
  return (
    <React.StrictMode>
      <Router>
        <AccessCodeProvider>
          <ApiKeyProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/access" element={<AccessCodePage />} />
              <Route path="/analysis" element={<AnalysisPage />} />
              <Route path="/understanding" element={<UnderstandingPage />} />
              <Route path="/worksheet" element={<WorksheetPage />} />
              <Route path="/synonyms" element={<SynonymsPage />} />
              <Route path="/illustration" element={<IllustrationPage />} />
              <Route path="/my-works" element={<MyWorksPage />} />
              <Route path="/admin/codes" element={<AdminCodesPage />} />
              <Route path="/passages" element={<PassageDatabasePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </ApiKeyProvider>
        </AccessCodeProvider>
      </Router>
    </React.StrictMode>
  );
}

export default App;
