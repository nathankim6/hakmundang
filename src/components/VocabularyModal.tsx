import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { parseTableContent, type VocabularyEntry } from './vocabulary/VocabularyParser';
import { VocabularyApp } from './vocabulary/VocabularyApp';
import { LoadingProgress } from './LoadingProgress';

interface VocabularyModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  questionNumber?: number;
}

interface WordData {
  표제어: string;
  품사: string;
  난이도: number;
  표제어뜻: string;
  영영정의: string;
  동의어: string[];
  동의어뜻: string[];
  반의어: string[];
  반의어뜻: string[];
}

export const VocabularyModal = ({ isOpen, onClose, content, questionNumber }: VocabularyModalProps) => {
  const [vocabularyList, setVocabularyList] = useState<VocabularyEntry[]>(() => parseTableContent(content));
  const [processedData, setProcessedData] = useState<WordData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const abortControllerRef = useRef<AbortController | null>(null);
  const { toast } = useToast();

  const processVocabularyWithClaude = async (entries: VocabularyEntry[]) => {
    setIsLoading(true);
    const apiKey = localStorage.getItem("claude_api_key");
    
    if (!apiKey) {
      toast({
        title: "API 키 오류",
        description: "Claude API 키가 설정되지 않았습니다.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const total = entries.length;
    setProgress({ current: 0, total });
    const processedEntries: WordData[] = [];
    abortControllerRef.current = new AbortController();

    try {
      for (let i = 0; i < entries.length; i++) {
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error('Processing cancelled');
        }

        const entry = entries[i];
        const prompt = `
          다음 단어에 대한 정보를 분석하여 JSON 형식으로 반환해주세요:
          
          단어: ${entry.headword}
          의미: ${entry.meaning}
          동의어: ${entry.synonyms}
          동의어 뜻: ${entry.synonymMeanings}
          반의어: ${entry.antonyms}
          반의어 뜻: ${entry.antonymMeanings}

          다음 형식으로 반환해주세요:
          {
            "표제어": "단어",
            "품사": "명사/동사/형용사/부사 중 하나",
            "난이도": "1-3 사이의 숫자 (1: 쉬움, 2: 보통, 3: 어려움)",
            "표제어뜻": "한글 의미",
            "영영정의": "영어로 된 정의",
            "동의어": ["동의어1", "동의어2", "동의어3"],
            "동의어뜻": ["동의어1 뜻", "동의어2 뜻", "동의어3 뜻"],
            "반의어": ["반의어1", "반의어2"],
            "반의어뜻": ["반의어1 뜻", "반의어2 뜻"]
          }
        `;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-opus-20240229',
            max_tokens: 1000,
            messages: [{
              role: 'user',
              content: prompt
            }]
          }),
          signal: abortControllerRef.current.signal
        });

        if (!response.ok) {
          throw new Error('API 요청 실패');
        }

        const data = await response.json();
        const result = JSON.parse(data.content[0].text);
        processedEntries.push(result);
        setProgress({ current: i + 1, total });
        
        // Add a small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setProcessedData(processedEntries);
      toast({
        title: "성공",
        description: "단어장이 성공적으로 생성되었습니다.",
      });
    } catch (error) {
      if (error.message === 'Processing cancelled') {
        toast({
          title: "중단됨",
          description: "단어장 생성이 중단되었습니다.",
        });
        return;
      }
      console.error('Error processing vocabulary:', error);
      toast({
        title: "오류 발생",
        description: "단어장 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setProgress({ current: 0, total: 0 });
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  useEffect(() => {
    if (isOpen && vocabularyList.length > 0) {
      processVocabularyWithClaude(vocabularyList);
    }
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [isOpen, vocabularyList]);

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto font-nanum">
        <DialogTitle className="text-lg font-bold text-center mb-4">
          단어장 생성
        </DialogTitle>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8">
            <LoadingProgress 
              current={progress.current} 
              total={progress.total}
              onStop={handleStop}
            />
          </div>
        ) : (
          processedData.length > 0 && <VocabularyApp initialData={processedData} />
        )}
      </DialogContent>
    </Dialog>
  );
};