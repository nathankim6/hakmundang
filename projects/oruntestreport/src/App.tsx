
import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Report from './pages/Report';
import SavedReports from './pages/SavedReports';
import ReportForm from './components/ReportForm';
import SchoolTypeSelector from './components/SchoolTypeSelector';
import EditReportWrapper from './components/EditReportWrapper';
import Navigation from './components/Navigation';
import StudentSubmit from './pages/StudentSubmit';
import './App.css';
import { Toaster } from "sonner";

const AppShell: React.FC = () => {
  const location = useLocation();
  const isStudentSubmit = location.pathname.startsWith('/submit/');
  return (
    <>
      {!isStudentSubmit && <Navigation />}
      <div className={isStudentSubmit ? '' : 'pt-16'}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/report" element={<Report />} />
          <Route path="/report/:id" element={<Report />} />
          <Route path="/saved-reports" element={<SavedReports />} />
          <Route path="/create-report" element={<SchoolTypeSelector />} />
          <Route path="/create-report/middle" element={<ReportForm schoolType="middle" />} />
          <Route path="/create-report/high" element={<ReportForm schoolType="high" />} />
          <Route path="/edit-report/:id" element={<EditReportWrapper />} />
          <Route path="/submit/:reportId" element={<StudentSubmit />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppShell />
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;
