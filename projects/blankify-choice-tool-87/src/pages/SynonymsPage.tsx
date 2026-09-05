
import React, { useState } from 'react';
import { useAccessCode } from '@/contexts/AccessCodeContext';
import { useApiKey } from '@/contexts/ApiKeyContext';
import ProtectedRoute from '@/components/ProtectedRoute';

// Import components
import PageLayout from '@/components/synonyms/PageLayout';
import ApiKeyDialog from '@/components/understanding/ApiKeyDialog'; // Reuse from understanding
import PassageInput from '@/components/synonyms/PassageInput';
import ResultsDisplay from '@/components/synonyms/ResultsDisplay';
import { useSynonymsService, SynonymPassage, SynonymResult } from '@/components/synonyms/SynonymsService';

const SynonymsPage = () => {
  const [passages, setPassages] = useState<SynonymPassage[]>([{
    id: 1,
    content: ''
  }]);
  const [results, setResults] = useState<SynonymResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const {
    isAdmin
  } = useAccessCode();
  
  const {
    openaiApiKey,
    setOpenaiApiKey,
    isApiConnected,
    setIsApiConnected
  } = useApiKey();
  
  const {
    generateSynonyms
  } = useSynonymsService();
  
  const handleGenerateSynonyms = () => {
    generateSynonyms({
      passages,
      apiKey: openaiApiKey,
      onSuccess: results => setResults(results),
      onStartLoading: () => {
        setIsLoading(true);
        setResults(null);
      },
      onStopLoading: () => setIsLoading(false),
      openApiKeyDialog: () => setDialogOpen(true)
    });
  };
  
  const apiKeyButton = <ApiKeyDialog openaiApiKey={openaiApiKey} setOpenaiApiKey={setOpenaiApiKey} isApiConnected={isApiConnected} setIsApiConnected={setIsApiConnected} dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} />;
  
  return <ProtectedRoute>
      <PageLayout apiKeyButton={apiKeyButton} isAdmin={isAdmin}>
        <div className="max-w-4xl mx-auto">
          <PassageInput passages={passages} setPassages={setPassages} onGenerateSynonyms={handleGenerateSynonyms} isLoading={isLoading} />
          
          <ResultsDisplay results={results} />
        </div>
      </PageLayout>
    </ProtectedRoute>;
};

export default SynonymsPage;
