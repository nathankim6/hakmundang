
import React from 'react';
import { useApiKey } from '@/contexts/ApiKeyContext';
import { useAccessCode } from '@/contexts/AccessCodeContext';
import PageLayout from '@/components/worksheet/PageLayout';
import ClozeTestGenerator from '@/components/ClozeTestGenerator';
import ApiKeyDialog from '@/components/understanding/ApiKeyDialog';
import ProtectedRoute from '@/components/ProtectedRoute';

const WorksheetPage = () => {
  const { openaiApiKey, setOpenaiApiKey, isApiConnected, setIsApiConnected } = useApiKey();
  const { isAdmin } = useAccessCode();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  
  const apiKeyButton = (
    <button 
      onClick={() => setDialogOpen(true)}
      className="bg-white border border-slate-300 hover:bg-slate-100 transition-colors duration-200 rounded-lg px-3 py-1 text-sm text-slate-700 flex items-center gap-1 shadow-sm"
    >
      <span className="hidden sm:inline">API</span> 키 설정
    </button>
  );

  return (
    <ProtectedRoute>
      <PageLayout 
        apiKeyButton={apiKeyButton}
        isAdmin={isAdmin}
      >
        <ClozeTestGenerator />
        
        <ApiKeyDialog 
          openaiApiKey={openaiApiKey}
          setOpenaiApiKey={setOpenaiApiKey}
          isApiConnected={isApiConnected}
          setIsApiConnected={setIsApiConnected}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
        />
      </PageLayout>
    </ProtectedRoute>
  );
};

export default WorksheetPage;
