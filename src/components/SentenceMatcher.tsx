import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Plus, Info, AlertTriangle, Loader2, FileDown } from 'lucide-react';
import { TextEntry } from './sentence-matcher/TextEntry';
import { MatchedTable } from './sentence-matcher/MatchedTable';
import { splitIntoSentences, matchSentences } from './sentence-matcher/TextProcessor';
import { useToast } from "@/components/ui/use-toast";
import * as XLSX from 'xlsx';

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

  const handleExportExcel = () => {
    if (matchedSets.length === 0) {
      toast({
        title: "내보내기 실패",
        description: "저장할 문장이 없습니다.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Prepare data for Excel
      const workbook = XLSX.utils.book_new();
      
      matchedSets.forEach((set, setIndex) => {
        const worksheetData = set.sentences.map((sentence, index) => ({
          '번호': index + 1,
          'English': sentence.english,
          '한글': sentence.korean
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, `Set ${setIndex + 1}`);
      });

      // Generate Excel file
      XLSX.writeFile(workbook, 'matched_sentences.xlsx');

      toast({
        title: "내보내기 성공",
        description: "문장이 성공적으로 저장되었습니다.",
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast({
        title: "내보내기 실패",
        description: "Excel 파일 생성 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const handleMatch = async () => {
    const newMatchedSets: MatchedSet[] = [];
    let totalSentences = 0;
    setWarning('');
    setIsLoading(true);

    try {
      // Combine all English and Korean texts
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

      // Split sentences
      const englishSentences = splitIntoSentences(allEnglishText);
      const koreanSentences = splitIntoSentences(allKoreanText);

      if (englishSentences.length !== koreanSentences.length) {
        setWarning(`문장 수가 일치하지 않습니다. 영어: ${englishSentences.length}개, 한글: ${koreanSentences.length}개`);
      }

      // Match sentences using Claude AI
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
            
            <div className="flex gap-2">
              {matchedSets.length > 0 && (
                <Button
                  onClick={handleExportExcel}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <FileDown className="w-4 h-4" />
                  Excel로 저장
                </Button>
              )}
              
              <Button
                onClick={handleMatch}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    처리중...
                  </>
                ) : (
                  '문장 나누기'
                )}
              </Button>
            </div>
          </div>

          {warning && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{warning}</AlertDescription>
            </Alert>
          )}

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