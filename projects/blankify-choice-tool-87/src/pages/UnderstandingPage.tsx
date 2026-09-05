
import React, { useState } from 'react';
import { useAccessCode } from '@/contexts/AccessCodeContext';
import { useApiKey } from '@/contexts/ApiKeyContext';
import ProtectedRoute from '@/components/ProtectedRoute';

// Import refactored components
import PageLayout from '@/components/understanding/PageLayout';
import ApiKeyDialog from '@/components/understanding/ApiKeyDialog';
import PassageInput from '@/components/understanding/PassageInput';
import ResultsDisplay from '@/components/understanding/ResultsDisplay';
import { useUnderstandingService, PassageItem } from '@/components/understanding/UnderstandingService';

const UnderstandingPage = () => {
  const [passages, setPassages] = useState<PassageItem[]>([{ id: 1, content: '' }]);
  const [results, setResults] = useState<{ id: number; content: string; result: string }[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { isAdmin } = useAccessCode();
  const { openaiApiKey, setOpenaiApiKey, isApiConnected, setIsApiConnected } = useApiKey();
  const { generateUnderstanding } = useUnderstandingService();

  const handleGenerateUnderstanding = () => {
    generateUnderstanding({
      passages,
      apiKey: openaiApiKey,
      onSuccess: (results) => setResults(results),
      onStartLoading: () => {
        setIsLoading(true);
        setResults(null);
      },
      onStopLoading: () => setIsLoading(false),
      openApiKeyDialog: () => setDialogOpen(true)
    });
  };

  const apiKeyButton = (
    <ApiKeyDialog
      openaiApiKey={openaiApiKey}
      setOpenaiApiKey={setOpenaiApiKey}
      isApiConnected={isApiConnected}
      setIsApiConnected={setIsApiConnected}
      dialogOpen={dialogOpen}
      setDialogOpen={setDialogOpen}
    />
  );

  return (
    <ProtectedRoute>
      <PageLayout apiKeyButton={apiKeyButton} isAdmin={isAdmin}>
        <PassageInput
          passages={passages}
          setPassages={setPassages}
          onGenerateUnderstanding={handleGenerateUnderstanding}
          isLoading={isLoading}
        />
        
        <ResultsDisplay results={results} />
      </PageLayout>
    </ProtectedRoute>
  );
};

export default UnderstandingPage;
