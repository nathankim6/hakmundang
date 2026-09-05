import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileDown, Eye, ArrowLeft } from 'lucide-react';
import { WordItem } from '@/hooks/useVocabularyData';
import { generateTestPDF } from '@/utils/pdfGenerator';
import { useToast } from '@/hooks/use-toast';

interface TestPreviewProps {
  words: WordItem[];
  selectedDays: number[];
  onClose: () => void;
}

// 보기 생성 함수
const generateChoices = (correctWord: WordItem, allWords: WordItem[]): string[] => {
  const choices = [correctWord.meaning];
  
  const otherWords = allWords.filter(w => w.word !== correctWord.word);
  const shuffled = otherWords.sort(() => 0.5 - Math.random());
  
  for (let i = 0; i < 3 && i < shuffled.length; i++) {
    choices.push(shuffled[i].meaning);
  }
  
  return choices.sort(() => 0.5 - Math.random()).slice(0, 4);
};

export const TestPreview: React.FC<TestPreviewProps> = ({
  words,
  selectedDays,
  onClose
}) => {
  const { toast } = useToast();

  const handleGeneratePDF = () => {
    generateTestPDF(words, selectedDays);
    toast({
      title: "PDF 생성 완료!",
      description: `${words.length}개 단어로 시험지가 생성되었습니다.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <Card className="shadow-soft">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-primary" />
              <span>시험지 미리보기</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                Day {selectedDays.join(', ')} | {words.length}문제
              </Badge>
              <Button variant="outline" size="sm" onClick={onClose}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                돌아가기
              </Button>
              <Button 
                onClick={handleGeneratePDF}
                className="bg-gradient-primary hover:shadow-glow transition-all duration-200"
              >
                <FileDown className="h-4 w-4 mr-2" />
                PDF 다운로드
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 시험지 본문 */}
      <Card className="shadow-soft">
        <CardContent className="p-8">
          {/* 시험지 제목 */}
          <div className="text-center mb-8 pb-6 border-b border-border">
            <h1 className="text-3xl font-bold mb-2">영단어 시험지</h1>
            <p className="text-lg text-muted-foreground">
              Day {selectedDays.join(', ')} | 총 {words.length}문제
            </p>
            <div className="mt-4 text-sm text-muted-foreground space-y-1">
              <p>• 각 문제의 정답을 선택하여 답안지에 기록하세요.</p>
              <p>• 시간: 20분</p>
            </div>
          </div>

          {/* 문제들 */}
          <div className="space-y-6">
            {words.map((word, index) => {
              const choices = generateChoices(word, words);
              
              return (
                <div key={index} className="p-4 rounded-lg bg-muted/30">
                  <div className="mb-3">
                    <span className="font-semibold text-lg">
                      {index + 1}. {word.word}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-6">
                    {choices.map((choice, choiceIndex) => {
                      const choiceLetter = String.fromCharCode(65 + choiceIndex);
                      return (
                        <div key={choiceIndex} className="flex items-center space-x-2">
                          <span className="font-medium w-6">{choiceLetter}.</span>
                          <span>{choice}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 답안지 */}
          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="text-2xl font-bold text-center mb-6">정답</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {words.map((word, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 rounded bg-muted/20">
                  <span className="font-medium w-8">{index + 1}.</span>
                  <span className="font-medium">{word.word}</span>
                  <span className="text-muted-foreground">-</span>
                  <span>{word.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};