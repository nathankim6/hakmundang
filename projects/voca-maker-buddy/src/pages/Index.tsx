import React, { useState } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { WordCard } from '@/components/vocabulary/WordCard';
import { DaySelector } from '@/components/vocabulary/DaySelector';
import { TestPreview } from '@/components/vocabulary/TestPreview';
import { useVocabularyData } from '@/hooks/useVocabularyData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, FileSpreadsheet, Brain, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();
  
  const {
    words,
    uploadedFile,
    isLoading,
    error,
    parseExcelFile,
    removeFile,
    getDayGroups,
    getWordsByDays
  } = useVocabularyData();

  const handleDayToggle = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleShowPreview = () => {
    const selectedWords = getWordsByDays(selectedDays);
    if (selectedWords.length === 0) {
      toast({
        title: "오류",
        description: "선택된 단어가 없습니다.",
        variant: "destructive",
      });
      return;
    }
    
    setShowPreview(true);
  };

  const dayGroups = getDayGroups();

  // 시험지 미리보기 모드
  if (showPreview) {
    const selectedWords = getWordsByDays(selectedDays);
    return (
      <div className="min-h-screen bg-gradient-soft">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <TestPreview
            words={selectedWords}
            selectedDays={selectedDays}
            onClose={() => setShowPreview(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-primary">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              단어암기 관리
            </h1>
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            엑셀 파일로 단어장을 업로드하고, Day별로 선택하여 PDF 시험지를 생성하세요
          </p>
        </div>

        {/* 파일 업로드 섹션 */}
        <div className="mb-8">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                <span>엑셀 파일 업로드</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-destructive">{error}</p>
                </div>
              )}
              
              <FileUpload
                onFileUpload={parseExcelFile}
                uploadedFile={uploadedFile}
                onRemoveFile={removeFile}
              />
              
              {isLoading && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-muted-foreground">파일을 처리하는 중...</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 업로드된 단어 데이터가 있을 때 */}
        {words.length > 0 && (
          <>
            {/* Day 선택 섹션 */}
            <div className="mb-8">
              <DaySelector
                dayGroups={dayGroups}
                selectedDays={selectedDays}
                onDayToggle={handleDayToggle}
                onShowPreview={handleShowPreview}
                totalWords={words.length}
              />
            </div>

            {/* 단어 목록 */}
            <div className="mb-8">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <span>단어 목록</span>
                    </div>
                    <Badge variant="secondary" className="text-sm">
                      총 {words.length}개
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                    {words.slice(0, 50).map((word, index) => (
                      <WordCard
                        key={index}
                        word={word.word}
                        meaning={word.meaning}
                        day={word.day}
                      />
                    ))}
                  </div>
                  
                  {words.length > 50 && (
                    <div className="mt-4 text-center">
                      <Badge variant="outline">
                        처음 50개 단어만 표시됨 (전체: {words.length}개)
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* 빈 상태일 때 안내 */}
        {words.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <div className="p-6 rounded-xl bg-muted/50 inline-block mb-6">
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">엑셀 파일을 업로드하세요</h2>
            <p className="text-muted-foreground mb-6">
              단어, 의미, Day 순서로 작성된 엑셀 파일을 업로드해주세요
            </p>
            <div className="max-w-md mx-auto text-left bg-card p-4 rounded-lg border">
              <h3 className="font-medium mb-2">엑셀 파일 형식 예시:</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="grid grid-cols-3 gap-2 font-mono">
                  <span>단어</span>
                  <span>의미</span>
                  <span>Day</span>
                </div>
                <div className="grid grid-cols-3 gap-2 font-mono">
                  <span>apple</span>
                  <span>사과</span>
                  <span>1</span>
                </div>
                <div className="grid grid-cols-3 gap-2 font-mono">
                  <span>book</span>
                  <span>책</span>
                  <span>1</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;