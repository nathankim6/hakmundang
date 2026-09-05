
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Report from './pages/Report';
import SavedReports from './pages/SavedReports';
import ReportForm from './components/ReportForm';
import SchoolTypeSelector from './components/SchoolTypeSelector';
import Navigation from './components/Navigation';
import './App.css';
import { Toaster } from "sonner";

function App() {
  return (
    <>
      <Navigation />
      <div className="pt-16"> {/* Add padding-top to account for the fixed navigation */}
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/report" element={<Report />} />
          <Route path="/report/:id" element={<Report />} />
          <Route path="/saved-reports" element={<SavedReports />} />
          <Route path="/create-report" element={<SchoolTypeSelector />} />
          <Route path="/create-report/middle" element={<ReportForm schoolType="middle" />} />
          <Route path="/create-report/high" element={<ReportForm schoolType="high" />} />
          <Route path="/edit-report/:id" element={<ReportForm />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Toaster position="top-right" />
    </>
  );
}

export default App;
