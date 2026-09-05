
import React, { useState, useEffect } from 'react';
import { useAccessCode } from '@/contexts/AccessCodeContext';
import { useApiKey } from '@/contexts/ApiKeyContext';
import ProtectedRoute from '@/components/ProtectedRoute';

// Import refactored components
import PageLayout from '@/components/analysis/PageLayout';
import ApiKeyDialog from '@/components/analysis/ApiKeyDialog';
import PassageInput, { Passage } from '@/components/analysis/PassageInput';
import ResultsDisplay from '@/components/analysis/ResultsDisplay';
import { useAnalysisService, AnalysisResult } from '@/components/analysis/AnalysisService';

const AnalysisPage = () => {
  const { isAdmin } = useAccessCode();
  const { openaiApiKey, setOpenaiApiKey, isApiConnected, setIsApiConnected } = useApiKey();
  const [passages, setPassages] = useState<Passage[]>([{
    id: 1,
    englishText: '',
    koreanText: ''
  }]);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { analyzePassages } = useAnalysisService();

  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setOpenaiApiKey(savedApiKey);
      setIsApiConnected(true);
    }
  }, [setOpenaiApiKey, setIsApiConnected]);

  const handleAnalyzePassages = () => {
    analyzePassages({
      passages,
      apiKey: openaiApiKey,
      onSuccess: (analysisResults) => setResults(analysisResults),
      onStartLoading: () => {
        setAnalyzing(true);
        setResults([]);
      },
      onStopLoading: () => setAnalyzing(false),
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
          analyzing={analyzing}
          onAnalyze={handleAnalyzePassages}
        />
        
        <ResultsDisplay results={results} />
      </PageLayout>
    </ProtectedRoute>
  );
};

export default AnalysisPage;
