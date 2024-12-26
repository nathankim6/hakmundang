import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Plus, Info } from 'lucide-react';
import { TextEntry } from './sentence-matcher/TextEntry';
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

  const handleMatch = () => {
    const newMatchedSets: MatchedSet[] = [];
    let totalSentences = 0;

    textPairs.forEach((pair, index) => {
      if (pair.english.trim() && pair.korean.trim()) {
        const englishSentences = splitIntoSentences(pair.english);
        const koreanSentences = splitIntoSentences(pair.korean);
        const matched = matchSentences(englishSentences, koreanSentences);
        
        if (matched.length > 0) {
          newMatchedSets.push({
            setNumber: index + 1,
            sentences: matched
          });
          totalSentences += matched.length;
        }
      }
    });

    setMatchedSets(newMatchedSets);
    setInfo(`총 ${newMatchedSets.length}개의 지문에서 ${totalSentences}개의 문장이 매칭되었습니다.`);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto p-4 font-[Gulim]">
      <CardContent>
        <div className="space-y-4">
          {textPairs.map((pair, index) => (
            <div key={pair.id} className="grid grid-cols-2 gap-4">
              <TextEntry
                label={`영어 텍스트 ${index + 1}`}
                value={pair.english}
                onChange={(value) => updateText(pair.id, 'english', value)}
                onEnterPress={addNewPair}
                onDelete={() => deletePair(pair.id)}
                placeholder="영어 텍스트를 입력하세요..."
              />
              <TextEntry
                label={`한글 텍스트 ${index + 1}`}
                value={pair.korean}
                onChange={(value) => updateText(pair.id, 'korean', value)}
                onDelete={() => deletePair(pair.id)}
                placeholder="한글 텍스트를 입력하세요..."
              />
            </div>
          ))}
          
          <div className="flex justify-between items-center">
            <Button
              onClick={addNewPair}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              지문 추가하기
            </Button>
            
            <Button
              onClick={handleMatch}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              문장 나누기
            </Button>
          </div>

          {info && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>{info}</AlertDescription>
            </Alert>
          )}

          {matchedSets.length > 0 && (
            <MatchedTable matchedSets={matchedSets} />
          )}
        </div>
      </CardContent>
    </Card>
  );
};