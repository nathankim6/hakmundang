import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Upload, Loader2, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ParsedDay {
  dayName: string;
  dayNumber: number;
  words: Array<{ word: string; meaning: string }>;
}

const BATCH_SIZE = 1; // Process 1 day at a time to avoid timeout

const AppendWords = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [startDay, setStartDay] = useState<number>(171);
  const [endDay, setEndDay] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [processedDays, setProcessedDays] = useState<string[]>([]);
  const [totalDays, setTotalDays] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);
  const parsedDataRef = useRef<ParsedDay[]>([]);
  const nextSortOrderRef = useRef<number>(170);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setProcessedDays([]);
    }
  };

  const parseCSV = (text: string): ParsedDay[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const dayMap = new Map<number, ParsedDay>();
    
    console.log('Parsing CSV, total lines:', lines.length);
    console.log('First 3 lines:', lines.slice(0, 3));

    // Start from line 0 (no header skip for this format)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      let dayNum: number | null = null;
      let word: string = '';
      let meaning: string = '';
      
      // Format: "DAY 171[tab]word[tab]meaning" (tab-separated)
      const tabParts = line.split('\t');
      if (tabParts.length >= 3) {
        const dayMatch = tabParts[0].match(/DAY\s*(\d+)/i);
        if (dayMatch) {
          dayNum = parseInt(dayMatch[1], 10);
          word = tabParts[1].trim();
          meaning = tabParts.slice(2).join(' ').trim();
        }
      }
      
      // Fallback: comma-separated format (day,word,meaning)
      if (!dayNum) {
        const commaParts = line.split(',');
        if (commaParts.length >= 3) {
          const firstPart = commaParts[0].replace(/"/g, '').trim();
          const numMatch = firstPart.match(/(\d+)/);
          if (numMatch) {
            dayNum = parseInt(numMatch[1], 10);
            word = commaParts[1].replace(/"/g, '').trim();
            meaning = commaParts.slice(2).join(',').replace(/"/g, '').trim();
          }
        }
      }
      
      if (dayNum && !isNaN(dayNum) && word && meaning) {
        const inRange = dayNum >= startDay && (endDay == null || dayNum <= endDay);
        if (inRange) {
          if (!dayMap.has(dayNum)) {
            dayMap.set(dayNum, {
              dayName: `DAY ${dayNum}`,
              dayNumber: dayNum,
              words: []
            });
          }
          dayMap.get(dayNum)!.words.push({ word, meaning });
        }
      }
    }
    
    console.log('Parsed days:', Array.from(dayMap.keys()));
    console.log('Total days found:', dayMap.size);

    return Array.from(dayMap.values()).sort((a, b) => a.dayNumber - b.dayNumber);
  };

  const processCSV = async () => {
    if (!file) {
      toast.error('CSV 파일을 선택해주세요');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setProcessedDays([]);
    abortRef.current = false;

    try {
      setStatus('CSV 파일 분석 중...');
      const text = await file.text();
      const parsedDays = parseCSV(text);
      
      if (parsedDays.length === 0) {
        const rangeMsg = endDay != null ? `DAY ${startDay}~${endDay}` : `DAY ${startDay} 이후`;
        throw new Error(`${rangeMsg} 범위의 데이터가 없습니다`);
      }

      parsedDataRef.current = parsedDays;
      setTotalDays(parsedDays.length);

      // Get current max sort_order
      const { data: maxOrderData } = await supabase
        .from('day_groups')
        .select('sort_order')
        .eq('workbook_id', '8a838ba7-5a60-49fb-9b33-270a189b1a3c')
        .order('sort_order', { ascending: false })
        .limit(1);

      nextSortOrderRef.current = (maxOrderData?.[0]?.sort_order || 169) + 1;

      const totalWords = parsedDays.reduce((sum, d) => sum + d.words.length, 0);
      setStatus(`${parsedDays.length}일, ${totalWords}개 단어 발견. 처리 시작...`);

      await processBatches(parsedDays, 0);

    } catch (err) {
      console.error('Error processing CSV:', err);
      setError((err as Error).message);
      toast.error('처리 중 오류가 발생했습니다');
    } finally {
      setIsProcessing(false);
    }
  };

  const processBatches = async (days: ParsedDay[], startIndex: number) => {
    let currentIndex = startIndex;
    
    while (currentIndex < days.length && !abortRef.current) {
      const batch = days.slice(currentIndex, currentIndex + BATCH_SIZE);
      
      setStatus(`DAY ${batch[0].dayNumber}~${batch[batch.length - 1].dayNumber} 처리 중...`);

      try {
        const { data, error } = await supabase.functions.invoke('append-words', {
          body: {
            workbookId: '8a838ba7-5a60-49fb-9b33-270a189b1a3c',
            entries: batch.map(d => ({
              dayName: d.dayName,
              words: d.words
            })),
            startSortOrder: nextSortOrderRef.current,
            difficultyLevel: 'middle',
            includeExamples: false
          }
        });

        if (error) throw error;
        if (!data?.success) throw new Error(data?.error || '처리 실패');

        nextSortOrderRef.current = data.nextSortOrder;
        setProcessedDays(prev => [...prev, ...data.daysAdded]);
        
        currentIndex += BATCH_SIZE;
        const progressPercent = Math.round((currentIndex / days.length) * 100);
        setProgress(Math.min(progressPercent, 100));

      } catch (err) {
        console.error('Batch processing error:', err);
        setError(`${batch[0].dayName} 처리 중 오류: ${(err as Error).message}`);
        toast.error('처리 중 오류가 발생했습니다. 재시도해주세요.');
        return;
      }
    }

    if (!abortRef.current && currentIndex >= days.length) {
      setProgress(100);
      setStatus('완료!');
      toast.success(`${days.length}일, 총 ${days.reduce((sum, d) => sum + d.words.length, 0)}개 단어가 추가되었습니다`);
    }
  };

  const handleRetry = async () => {
    if (parsedDataRef.current.length === 0) return;
    
    setIsProcessing(true);
    setError(null);
    
    const remainingDays = parsedDataRef.current.filter(
      d => !processedDays.includes(d.dayName)
    );
    
    if (remainingDays.length > 0) {
      await processBatches(remainingDays, 0);
    }
    
    setIsProcessing(false);
  };

  const handleStop = () => {
    abortRef.current = true;
    setStatus('중지됨');
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          돌아가기
        </Button>

        <div className="bg-card rounded-lg p-8 shadow-lg">
          <h1 className="text-2xl font-bold mb-6">단어 이어붙이기</h1>
          <p className="text-muted-foreground mb-8">
            기존 워크북에 추가 단어를 이어붙입니다. CSV 파일을 업로드하고 시작할 DAY를 지정하세요.
          </p>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDay">시작 DAY</Label>
                <Input
                  id="startDay"
                  type="number"
                  value={startDay}
                  onChange={(e) => setStartDay(parseInt(e.target.value) || 1)}
                  className="mt-2"
                  min={1}
                  disabled={isProcessing}
                />
              </div>
              <div>
                <Label htmlFor="endDay">종료 DAY (선택)</Label>
                <Input
                  id="endDay"
                  type="number"
                  value={endDay ?? ''}
                  placeholder="끝까지"
                  onChange={(e) => {
                    const v = e.target.value.trim();
                    setEndDay(v === '' ? null : parseInt(v) || null);
                  }}
                  className="mt-2"
                  min={1}
                  disabled={isProcessing}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground -mt-4">
              {endDay != null
                ? `DAY ${startDay}부터 DAY ${endDay}까지의 단어가 추가됩니다`
                : `DAY ${startDay}부터 끝까지의 단어가 추가됩니다`}
            </p>

            <div>
              <Label htmlFor="file">CSV 파일</Label>
              <Input
                id="file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="mt-2"
                disabled={isProcessing}
              />
              {file && (
                <p className="text-sm text-green-600 mt-1">
                  선택됨: {file.name}
                </p>
              )}
            </div>

            {(isProcessing || processedDays.length > 0) && (
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                    {!isProcessing && !error && processedDays.length > 0 && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {error && <AlertCircle className="w-4 h-4 text-red-500" />}
                    {status}
                  </span>
                  <span>{processedDays.length}/{totalDays} 일 완료</span>
                </div>
                <Progress value={progress} />
                
                {processedDays.length > 0 && (
                  <div className="text-xs text-muted-foreground max-h-20 overflow-y-auto">
                    완료: {processedDays.join(', ')}
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              {!isProcessing ? (
                <>
                  <Button
                    onClick={processCSV}
                    disabled={!file}
                    className="flex-1"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    단어 추가하기
                  </Button>
                  
                  {error && processedDays.length > 0 && (
                    <Button
                      onClick={handleRetry}
                      variant="outline"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      재시도
                    </Button>
                  )}
                </>
              ) : (
                <Button
                  onClick={handleStop}
                  variant="destructive"
                  className="flex-1"
                >
                  중지
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppendWords;
