import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { WritingQuestion } from "@/types/test";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
interface WritingTestUploaderProps {
  testTitle: string;
  testId: string;
  onTitleChange: (title: string) => void;
  onIdChange: (id: string) => void;
  onQuestionsLoaded: (questions: WritingQuestion[]) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  questions: WritingQuestion[];
}
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
interface ParsedSentence {
  english: string;
  korean: string;
}

// Parse CSV properly handling commas inside quoted fields
const parseCSVBasic = (text: string): ParsedSentence[] => {
  const lines = text.trim().split('\n');
  const dataLines = lines.slice(1); // skip header
  const sentences: ParsedSentence[] = [];

  for (const line of dataLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let english = '';
    let korean = '';

    // Case 1: Both fields quoted — "english","korean"
    const bothQuoted = trimmed.match(/^"((?:[^"]|"")*?)"\s*,\s*"((?:[^"]|"")*?)"$/);
    if (bothQuoted) {
      english = bothQuoted[1].replace(/""/g, '"').trim();
      korean = bothQuoted[2].replace(/""/g, '"').trim();
    } else {
      // Case 2: First field quoted, second unquoted — "english",korean
      const firstQuoted = trimmed.match(/^"((?:[^"]|"")*?)"\s*,\s*(.+)$/);
      if (firstQuoted) {
        english = firstQuoted[1].replace(/""/g, '"').trim();
        korean = firstQuoted[2].replace(/^"|"$/g, '').trim();
      } else {
        // Case 3: No quotes — split on LAST comma (Korean is unlikely to have commas)
        const lastCommaIdx = trimmed.lastIndexOf(',');
        if (lastCommaIdx > 0) {
          english = trimmed.substring(0, lastCommaIdx).replace(/^"|"$/g, '').trim();
          korean = trimmed.substring(lastCommaIdx + 1).replace(/^"|"$/g, '').trim();
        }
      }
    }

    if (english && korean) {
      sentences.push({ english, korean });
    }
  }
  return sentences;
};

// Convert parsed sentences to questions (without AI chunking)
const convertToQuestions = (sentences: ParsedSentence[]): WritingQuestion[] => {
  return sentences.map(({
    english,
    korean
  }) => ({
    korean,
    english,
    arrangeWords: shuffleArray(
      english.split(/\s+/).map(w => w.replace(/[.,;!?]+$/g, '')).filter(Boolean)
    )
  }));
};

// Generate AI-powered chunks for sentences
const generateAIChunks = async (sentences: ParsedSentence[]): Promise<WritingQuestion[]> => {
  const englishSentences = sentences.map(s => s.english);
  const {
    data,
    error
  } = await supabase.functions.invoke('generate-writing-chunks', {
    body: {
      sentences: englishSentences,
      accessCode: sessionStorage.getItem('verifiedAccessCode') || ''
    }
  });
  if (error) {
    console.error('AI chunking error:', error);
    throw new Error('AI 청크 생성에 실패했습니다.');
  }
  const results = data.results as Array<{
    original: string;
    chunks: string[];
  }>;
  return sentences.map((sentence, idx) => {
    const aiResult = results[idx];
    return {
      korean: sentence.korean,
      english: sentence.english,
      arrangeWords: shuffleArray(aiResult?.chunks || sentence.english.split(/\s+/))
    };
  });
};
const WritingTestUploader = ({
  testTitle,
  testId,
  onTitleChange,
  onIdChange,
  onQuestionsLoaded,
  onSubmit,
  isSubmitting = false,
  questions
}: WritingTestUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useChunking, setUseChunking] = useState<boolean>(false);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isProcessingChunks, setIsProcessingChunks] = useState<boolean>(false);
  const [parsedSentences, setParsedSentences] = useState<ParsedSentence[]>([]);
  const processQuestions = async (sentences: ParsedSentence[], chunking: boolean) => {
    if (chunking) {
      setIsProcessingChunks(true);
      try {
        const aiQuestions = await generateAIChunks(sentences);
        onQuestionsLoaded(aiQuestions);
        toast({
          title: "AI 청크 생성 완료",
          description: `${aiQuestions.length}개의 문제가 AI로 의미단위로 분석되었습니다.`
        });
      } catch (err) {
        console.error('AI chunking failed:', err);
        toast({
          title: "AI 청크 생성 실패",
          description: "기본 모드로 전환합니다.",
          variant: "destructive"
        });
        // Fallback to basic parsing
        const basicQuestions = convertToQuestions(sentences);
        onQuestionsLoaded(basicQuestions);
      } finally {
        setIsProcessingChunks(false);
      }
    } else {
      const basicQuestions = convertToQuestions(sentences);
      onQuestionsLoaded(basicQuestions);
    }
  };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    if (!file.name.endsWith('.csv')) {
      setError('CSV 파일만 업로드 가능합니다.');
      toast({
        title: "파일 형식 오류",
        description: "CSV 파일만 업로드 가능합니다.",
        variant: "destructive"
      });
      return;
    }
    try {
      const buffer = await file.arrayBuffer();

      // Try UTF-8 first, then fallback to EUC-KR (CP949) for Korean files
      let text: string;
      const utf8Decoder = new TextDecoder('utf-8');
      const utf8Text = utf8Decoder.decode(buffer);

      // Check if UTF-8 decoding produced garbled text (replacement characters or mojibake patterns)
      const hasGarbledText = utf8Text.includes('�') || /[\x80-\x9F]/.test(utf8Text);
      if (hasGarbledText) {
        // Try EUC-KR (CP949) encoding - common for Korean Excel/CSV files
        try {
          const eucKrDecoder = new TextDecoder('euc-kr');
          text = eucKrDecoder.decode(buffer);
          console.log('[CSV Encoding] Detected EUC-KR encoding, converted to UTF-8');
        } catch {
          text = utf8Text; // Fallback to UTF-8 if EUC-KR fails
        }
      } else {
        text = utf8Text;
        console.log('[CSV Encoding] Using UTF-8 encoding');
      }
      setFileContent(text);
      const sentences = parseCSVBasic(text);
      if (sentences.length === 0) {
        setError('유효한 문제를 찾을 수 없습니다. CSV 형식을 확인해주세요.');
        toast({
          title: "파싱 오류",
          description: "유효한 문제를 찾을 수 없습니다.",
          variant: "destructive"
        });
        return;
      }
      setParsedSentences(sentences);
      setFileName(file.name);
      await processQuestions(sentences, useChunking);
      toast({
        title: "CSV 업로드 완료",
        description: `${sentences.length}개의 문제를 불러왔습니다.`
      });
    } catch (err) {
      console.error('Error parsing CSV:', err);
      setError('CSV 파일을 읽는 중 오류가 발생했습니다.');
      toast({
        title: "파일 읽기 오류",
        description: "CSV 파일을 읽는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };
  const handleChunkingChange = async (checked: boolean) => {
    setUseChunking(checked);
    if (parsedSentences.length > 0) {
      await processQuestions(parsedSentences, checked);
    }
  };
  const handleRemoveFile = () => {
    setFileName(null);
    setFileContent(null);
    onQuestionsLoaded([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  return <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="test-title">시험 제목</Label>
        <Input id="test-title" placeholder="시험 제목을 입력하세요" value={testTitle} onChange={e => onTitleChange(e.target.value)} />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="test-id">고유번호</Label>
        <Input id="test-id" placeholder="시험 고유번호를 입력하세요" value={testId} onChange={e => onIdChange(e.target.value)} />
      </div>

      {/* Chunking Option */}
      <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
        <div className="space-y-0.5">
          <Label htmlFor="chunking-mode" className="text-sm font-medium flex items-center gap-2">
            AI 의미단위 청크 모드
            {isProcessingChunks && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
          </Label>
          <p className="text-xs text-muted-foreground">
            AI를 활용해 관사, 전치사구 등을 적절히 1~3단위 Chunk로 묶습니다.   
          </p>
        </div>
        <Switch id="chunking-mode" checked={useChunking} onCheckedChange={handleChunkingChange} disabled={isProcessingChunks} />
      </div>

      <div className="space-y-2">
        <Label>CSV 파일 업로드</Label>
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
          {!fileName ? <>
              <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-foreground mb-2">
                CSV 파일을 업로드하세요
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                헤더: English, Korean (영어문장, 한글문장)
              </p>
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                <FileText className="h-4 w-4 mr-2" />
                파일 선택
              </Button>
            </> : <div className="flex items-center justify-center gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <span className="text-sm font-medium text-foreground">{fileName}</span>
              <Button type="button" variant="ghost" size="sm" onClick={handleRemoveFile} className="text-muted-foreground hover:text-destructive">
                <X className="h-4 w-4" />
              </Button>
            </div>}
        </div>
        {error && <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>}
      </div>

      {questions.length > 0 && <Card className="p-4 bg-primary/5 border-primary/20">
          <h4 className="font-semibold text-primary mb-3">
            미리보기 ({questions.length}문제) {useChunking && <span className="text-xs font-normal text-muted-foreground ml-2">청크 모드</span>}
          </h4>
          <div className="space-y-2">
            {questions.map((q, idx) => <div key={idx} className="text-sm p-2 bg-background rounded border border-border">
                <p className="text-muted-foreground text-xs">문제 {idx + 1}</p>
                <p className="text-foreground">{q.korean}</p>
                <p className="text-primary text-xs mt-1">정답: {q.english}</p>
                <p className="text-muted-foreground text-xs mt-1">
                  배열: [{q.arrangeWords.join(' | ')}]
                </p>
              </div>)}
          </div>
        </Card>}
      
      <Button className="w-full" onClick={onSubmit} disabled={isSubmitting || questions.length === 0}>
        {isSubmitting ? "생성 중..." : `영작테스트 생성하기 (${questions.length}문제)`}
      </Button>
    </div>;
};
export default WritingTestUploader;