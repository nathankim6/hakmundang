import { useState } from 'react';
import { WordInput } from '@/components/vocabulary/WordInput';
import VocabularyApp from '@/components/VocabularyApp';
import { ParsedWordData } from '@/types/vocabulary';

const defaultData: ParsedWordData = {
  title: "옳은보카(영등포고 1학년 1학기 중간고사 대비)",
  words: []
};

const Index = () => {
  const [processedData, setProcessedData] = useState<ParsedWordData>(defaultData);
  const [showVocabulary, setShowVocabulary] = useState(false);

  const handleWordsProcessed = (data: ParsedWordData) => {
    setProcessedData(data);
    setShowVocabulary(true);
  };

  if (!showVocabulary) {
    return <WordInput onWordsProcessed={handleWordsProcessed} />;
  }

  return <VocabularyApp initialData={processedData} />;
};

export default Index;