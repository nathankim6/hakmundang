import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Info } from 'lucide-react';
import { TextEntry } from './sentence-matcher/TextEntry';
import { MatchedTable } from './sentence-matcher/MatchedTable';
import { splitIntoSentences, matchSentences } from './sentence-matcher/TextProcessor';

interface TextPair {
  id: string;
  english: string;
  korean: string;
}

export const SentenceMatcher = () => {
  const [textPairs, setTextPairs] = useState<TextPair[]>([
    { id: '1', english: '', korean: '' }
  ]);
  const [matchedSentences, setMatchedSentences] = useState<Array<{english: string, korean: string}>>([]);
  const [info, setInfo] = useState('');

  const addNewPair = () => {
    setTextPairs(prev => [
      ...prev,
      { id: String(prev.length + 1), english: '', korean: '' }
    ]);
  };

  const updateText = (id: string, field: 'english' | 'korean', value: string) => {
    setTextPairs(prev =>
      prev.map(pair =>
        pair.id === id ? { ...pair, [field]: value } : pair
      )
    );
  };

  const handleMatch = () => {
    let allEnglishSentences: string[] = [];
    let allKoreanSentences: string[] = [];

    textPairs.forEach(pair => {
      if (pair.english.trim()) {
        allEnglishSentences = allEnglishSentences.concat(splitIntoSentences(pair.english));
      }
      if (pair.korean.trim()) {
        allKoreanSentences = allKoreanSentences.concat(splitIntoSentences(pair.korean));
      }
    });

    const matched = matchSentences(allEnglishSentences, allKoreanSentences);
    setMatchedSentences(matched);
    setInfo(`총 ${matched.length}개의 문장이 매칭되었습니다.`);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto p-4">
      <CardContent>
        <div className="space-y-4">
          {textPairs.map((pair, index) => (
            <div key={pair.id} className="grid grid-cols-2 gap-4">
              <TextEntry
                label={`영어 텍스트 ${index + 1}`}
                value={pair.english}
                onChange={(value) => updateText(pair.id, 'english', value)}
                onEnterPress={addNewPair}
                placeholder="영어 텍스트를 입력하세요..."
              />
              <TextEntry
                label={`한글 텍스트 ${index + 1}`}
                value={pair.korean}
                onChange={(value) => updateText(pair.id, 'korean', value)}
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

          {matchedSentences.length > 0 && (
            <MatchedTable sentences={matchedSentences} />
          )}
        </div>
      </CardContent>
    </Card>
  );
};