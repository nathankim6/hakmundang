
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Report from './pages/Report';
import SavedReports from './pages/SavedReports';
import ReportForm from './components/ReportForm';
import SchoolTypeSelector from './components/SchoolTypeSelector';
import EditReportWrapper from './components/EditReportWrapper';
import Navigation from './components/Navigation';
import AccessCodeLogin from './pages/AccessCodeLogin';
import AccessGate from './components/AccessGate';
import './App.css';
import { Toaster } from "sonner";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AccessCodeLogin />} />
        <Route path="*" element={
          <AccessGate>
            <Navigation />
            <div className="pt-16">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/report" element={<Report />} />
                <Route path="/report/:id" element={<Report />} />
                <Route path="/saved-reports" element={<SavedReports />} />
                <Route path="/create-report" element={<SchoolTypeSelector />} />
                <Route path="/create-report/middle" element={<ReportForm schoolType="middle" />} />
                <Route path="/create-report/high" element={<ReportForm schoolType="high" />} />
                <Route path="/edit-report/:id" element={<EditReportWrapper />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </AccessGate>
        } />
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;
