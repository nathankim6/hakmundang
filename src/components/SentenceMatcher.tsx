import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from "@/components/ui/use-toast";
import { TextPairList } from './sentence-matcher/TextPairList';
import { ActionButtons } from './sentence-matcher/ActionButtons';
import { AlertMessages } from './sentence-matcher/AlertMessages';
import { MatchedTable } from './sentence-matcher/MatchedTable';
import { splitIntoSentences, matchSentences } from './sentence-matcher/TextProcessor';

interface TextPair {
  id: string;
  english: string;
  korean: string;
}

interface MatchedSet {
  setNumber: number;
  sentences: Array<{ english: string; korean: string }>;
}

export const SentenceMatcher = () => {
  const [textPairs, setTextPairs] = useState<TextPair[]>([
    { id: '1', english: '', korean: '' }
  ]);
  const [matchedSets, setMatchedSets] = useState<MatchedSet[]>([]);
  const [info, setInfo] = useState('');
  const [warning, setWarning] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addNewPair = () => {
    setTextPairs(prev => [
      ...prev,
      { id: String(prev.length + 1), english: '', korean: '' }
    ]);
  };

  const deletePair = (id: string) => {
    if (textPairs.length > 1) {
      setTextPairs(prev => prev.filter(pair => pair.id !== id));
    }
  };

  const updateText = (id: string, field: 'english' | 'korean', value: string) => {
    setTextPairs(prev =>
      prev.map(pair =>
        pair.id === id ? { ...pair, [field]: value } : pair
      )
    );
  };

  const handleMatch = async () => {
    const newMatchedSets: MatchedSet[] = [];
    let totalSentences = 0;
    setWarning('');
    setIsLoading(true);

    try {
      const allEnglishText = textPairs.map(pair => pair.english).join(' ');
      const allKoreanText = textPairs.map(pair => pair.korean).join(' ');

      if (!allEnglishText.trim() || !allKoreanText.trim()) {
        toast({
          title: "입력 오류",
          description: "영어와 한글 텍스트를 모두 입력해주세요.",
          variant: "destructive"
        });
        return;
      }

      const englishSentences = splitIntoSentences(allEnglishText);
      const koreanSentences = splitIntoSentences(allKoreanText);

      if (englishSentences.length !== koreanSentences.length) {
        setWarning(`문장 수가 일치하지 않습니다. 영어: ${englishSentences.length}개, 한글: ${koreanSentences.length}개`);
      }

      const matched = await matchSentences(englishSentences, koreanSentences);

      if (matched.length > 0) {
        newMatchedSets.push({
          setNumber: 1,
          sentences: matched
        });
        totalSentences = matched.length;
      }

      setMatchedSets(newMatchedSets);
      setInfo(`총 ${newMatchedSets.length}개의 지문에서 ${totalSentences}개의 문장이 매칭되었습니다.`);
    } catch (error) {
      console.error('Error matching sentences:', error);
      toast({
        title: "매칭 오류",
        description: "문장 매칭 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto p-4 font-[Gulim]">
      <CardContent>
        <div className="space-y-4">
          <TextPairList
            textPairs={textPairs}
            onUpdateText={updateText}
            onAddNewPair={addNewPair}
            onDeletePair={deletePair}
          />
          
          <ActionButtons
            matchedSets={matchedSets}
            isLoading={isLoading}
            onAddPair={addNewPair}
            onMatch={handleMatch}
          />

          <AlertMessages
            warning={warning}
            info={info}
          />

          {matchedSets.length > 0 && (
            <MatchedTable matchedSets={matchedSets} />
          )}
        </div>
      </CardContent>
    </Card>
  );
};