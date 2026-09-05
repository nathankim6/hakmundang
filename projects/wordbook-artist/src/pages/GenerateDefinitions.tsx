import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Loader2, Play, Pause, CheckCircle, AlertCircle, BookOpen, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface WorkbookWithWords {
  id: string;
  title: string;
  wordCount: number;
  processedCount: number;
  wordIds: string[];
  status: 'pending' | 'processing' | 'completed' | 'error';
  totalWordsInWorkbook: number; // 워크북 전체 단어 수
  alreadyGeneratedCount: number; // 이미 생성된 단어 수
}

export default function GenerateDefinitions() {
  const [activeTab, setActiveTab] = useState<'definitions' | 'synonyms'>('definitions');
  const [workbooks, setWorkbooks] = useState<WorkbookWithWords[]>([]);
  const [synWorkbooks, setSynWorkbooks] = useState<WorkbookWithWords[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [regenerateMode, setRegenerateMode] = useState(false); // 재생성 모드
  
  // Use refs to avoid closure issues in recursive async function
  const workbooksRef = useRef<WorkbookWithWords[]>([]);
  const currentWorkbookIndexRef = useRef(0);
  const currentWordIndexRef = useRef(0);
  const isPausedRef = useRef(false);
  const isProcessingRef = useRef(false);

  // Keep refs in sync with state
  useEffect(() => {
    workbooksRef.current = activeTab === 'definitions' ? workbooks : synWorkbooks;
  }, [workbooks, synWorkbooks, activeTab]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

  // Fetch workbooks and their words that need definitions
  const fetchWorkbooks = async (forRegenerate = false) => {
    setIsLoading(true);
    try {
      // First get all workbooks excluding Ultimate
      const { data: workbookData, error: wbError } = await supabase
        .from('workbooks')
        .select('id, title, cover_subtitle, difficulty_level')
        .order('created_at', { ascending: true });

      if (wbError) throw wbError;

      // Filter out Ultimate workbooks
      const filteredWorkbooks = (workbookData || []).filter(wb => 
        !wb.cover_subtitle || wb.cover_subtitle.toLowerCase() !== 'ultimate'
      );

      // For each workbook, get words that need definitions
      const workbooksWithWords: WorkbookWithWords[] = [];
      const synWorkbooksWithWords: WorkbookWithWords[] = [];

      for (const wb of filteredWorkbooks) {
        // Get total word count for this workbook
        const { count: totalCount } = await supabase
          .from('words')
          .select('id', { count: 'exact', head: true })
          .eq('day_groups.workbook_id', wb.id)
          .not('day_groups', 'is', null);

        // Get already generated count (words with both definition and etymology)
        const { count: generatedCount } = await supabase
          .from('words')
          .select('id', { count: 'exact', head: true })
          .eq('day_groups.workbook_id', wb.id)
          .not('day_groups', 'is', null)
          .not('english_definition', 'is', null)
          .not('etymology', 'is', null);

        // Definition mode query
        let defQuery = supabase
          .from('words')
          .select(`
            id,
            word,
            etymology,
            day_groups!inner (
              workbook_id
            )
          `)
          .eq('day_groups.workbook_id', wb.id);

        if (forRegenerate) {
          // 재생성 모드: 영어 어원 (💡 없는 것) 만 선택
          defQuery = defQuery.not('etymology', 'is', null).not('etymology', 'like', '%💡%');
        } else {
          // 일반 모드: 영영정의 또는 어원이 없는 것
          defQuery = defQuery.or('english_definition.is.null,etymology.is.null');
        }

        const { data: defWords, error: defWordsError } = await defQuery;

        if (!defWordsError && defWords && defWords.length > 0) {
          workbooksWithWords.push({
            id: wb.id,
            title: wb.title,
            wordCount: defWords.length,
            processedCount: 0,
            wordIds: defWords.map(w => w.id),
            status: 'pending',
            totalWordsInWorkbook: totalCount || defWords.length,
            alreadyGeneratedCount: generatedCount || 0
          });
        }

        // Synonyms mode query - get ALL words for regeneration
        const { data: synWords, error: synWordsError } = await supabase
          .from('words')
          .select(`
            id,
            word,
            day_groups!inner (
              workbook_id
            )
          `)
          .eq('day_groups.workbook_id', wb.id);

        // Get synonyms already generated count (synonyms array is not empty)
        const { data: synGeneratedData } = await supabase
          .from('words')
          .select(`
            id,
            synonyms,
            day_groups!inner (
              workbook_id
            )
          `)
          .eq('day_groups.workbook_id', wb.id);
        
        // Count words where synonyms array has at least one item
        const synGeneratedCount = (synGeneratedData || []).filter(
          w => w.synonyms && Array.isArray(w.synonyms) && w.synonyms.length > 0
        ).length;

        if (!synWordsError && synWords && synWords.length > 0) {
          synWorkbooksWithWords.push({
            id: wb.id,
            title: wb.title,
            wordCount: synWords.length,
            processedCount: 0,
            wordIds: synWords.map(w => w.id),
            status: 'pending',
            totalWordsInWorkbook: synWords.length,
            alreadyGeneratedCount: synGeneratedCount || 0
          });
        }
      }

      setWorkbooks(workbooksWithWords);
      setSynWorkbooks(synWorkbooksWithWords);
      workbooksRef.current = activeTab === 'definitions' ? workbooksWithWords : synWorkbooksWithWords;
    } catch (err) {
      console.error('Error fetching workbooks:', err);
      setError('워크북 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkbooks(regenerateMode);
  }, [regenerateMode]);

  const processNextBatch = useCallback(async () => {
    // Use refs to get current values
    if (isPausedRef.current) {
      setIsProcessing(false);
      isProcessingRef.current = false;
      return;
    }

    const currentWorkbooks = workbooksRef.current;
    const workbookIndex = currentWorkbookIndexRef.current;
    const wordIndex = currentWordIndexRef.current;

    // Check if all workbooks are done
    if (workbookIndex >= currentWorkbooks.length) {
      setIsProcessing(false);
      isProcessingRef.current = false;
      toast.success(activeTab === 'definitions' 
        ? '모든 워크북의 영영정의/어원 생성이 완료되었습니다!'
        : '모든 워크북의 동의어/반의어 재생성이 완료되었습니다!');
      return;
    }

    const currentWorkbook = currentWorkbooks[workbookIndex];
    
    // Check if current workbook is done
    if (wordIndex >= currentWorkbook.wordIds.length) {
      // Mark current workbook as completed and move to next
      const updatedWorkbooks = currentWorkbooks.map((wb, idx) => 
        idx === workbookIndex 
          ? { ...wb, status: 'completed' as const, processedCount: wb.wordCount }
          : wb
      );
      if (activeTab === 'definitions') {
        setWorkbooks(updatedWorkbooks);
      } else {
        setSynWorkbooks(updatedWorkbooks);
      }
      workbooksRef.current = updatedWorkbooks;
      
      toast.success(`"${currentWorkbook.title}" 워크북 완료!`);
      
      currentWorkbookIndexRef.current = workbookIndex + 1;
      currentWordIndexRef.current = 0;
      
      // Continue with next workbook
      setTimeout(() => processNextBatch(), 500);
      return;
    }

    // Update current workbook status to processing
    const processingWorkbooks = currentWorkbooks.map((wb, idx) => 
      idx === workbookIndex 
        ? { ...wb, status: 'processing' as const }
        : wb
    );
    if (activeTab === 'definitions') {
      setWorkbooks(processingWorkbooks);
    } else {
      setSynWorkbooks(processingWorkbooks);
    }
    workbooksRef.current = processingWorkbooks;

    // Reduced batch size to prevent edge function timeout
    const batchSize = 10;
    const batch = currentWorkbook.wordIds.slice(wordIndex, wordIndex + batchSize);
    
    console.log(`Processing batch: workbook ${workbookIndex}, words ${wordIndex}-${wordIndex + batch.length}, batch:`, batch.slice(0, 3));

    try {
      const functionName = activeTab === 'definitions' ? 'update-word-definitions' : 'regenerate-synonyms';
      const requestBody = activeTab === 'definitions' 
        ? { wordIds: batch }
        : { wordIds: batch, workbookTitle: currentWorkbook.title };
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: requestBody
      });

      if (error) {
        console.error('Batch error:', error);
        setError(`배치 처리 중 오류: ${error.message}`);
        const errorWorkbooks = workbooksRef.current.map((wb, idx) => 
          idx === workbookIndex 
            ? { ...wb, status: 'error' as const }
            : wb
        );
        if (activeTab === 'definitions') {
          setWorkbooks(errorWorkbooks);
        } else {
          setSynWorkbooks(errorWorkbooks);
        }
        workbooksRef.current = errorWorkbooks;
        setIsProcessing(false);
        isProcessingRef.current = false;
        return;
      }

      // Update indices using refs
      const newWordIndex = wordIndex + batch.length;
      currentWordIndexRef.current = newWordIndex;
      
      // Update processed count
      const updatedWorkbooks = workbooksRef.current.map((wb, idx) => 
        idx === workbookIndex 
          ? { ...wb, processedCount: newWordIndex }
          : wb
      );
      if (activeTab === 'definitions') {
        setWorkbooks(updatedWorkbooks);
      } else {
        setSynWorkbooks(updatedWorkbooks);
      }
      workbooksRef.current = updatedWorkbooks;
      
      console.log(`Batch complete. New word index: ${newWordIndex}`);
      
      // Small delay between batches
      setTimeout(() => {
        if (!isPausedRef.current && isProcessingRef.current) {
          processNextBatch();
        }
      }, 500);
    } catch (err) {
      console.error('Processing error:', err);
      setError('처리 중 오류가 발생했습니다.');
      setIsProcessing(false);
      isProcessingRef.current = false;
    }
  }, [activeTab]);

  // 개별 워크북 생성 시작
  const startSingleWorkbook = (workbookId: string) => {
    const wbList = activeTab === 'definitions' ? workbooks : synWorkbooks;
    const wbIndex = wbList.findIndex(wb => wb.id === workbookId);
    
    if (wbIndex === -1) return;
    
    // Set to process only this workbook
    currentWorkbookIndexRef.current = wbIndex;
    currentWordIndexRef.current = 0;
    
    workbooksRef.current = wbList;
    
    setIsProcessing(true);
    isProcessingRef.current = true;
    setIsPaused(false);
    isPausedRef.current = false;
    setError(null);
    processNextBatch();
  };

  const startProcessing = () => {
    // Reset indices
    currentWorkbookIndexRef.current = 0;
    currentWordIndexRef.current = 0;
    
    // Set the correct workbooks ref based on active tab
    workbooksRef.current = activeTab === 'definitions' ? workbooks : synWorkbooks;
    
    setIsProcessing(true);
    isProcessingRef.current = true;
    setIsPaused(false);
    isPausedRef.current = false;
    setError(null);
    processNextBatch();
  };

  const pauseProcessing = () => {
    setIsPaused(true);
    isPausedRef.current = true;
    setIsProcessing(false);
    isProcessingRef.current = false;
  };

  const resumeProcessing = () => {
    setIsPaused(false);
    isPausedRef.current = false;
    setIsProcessing(true);
    isProcessingRef.current = true;
    processNextBatch();
  };

  // 누락된 단어만 일괄 생성 (각 워크북에서 정의/어원이 없는 단어만)
  const startMissingWordsOnly = async () => {
    setIsProcessing(true);
    isProcessingRef.current = true;
    setIsPaused(false);
    isPausedRef.current = false;
    setError(null);

    try {
      // 먼저 모든 워크북 목록 가져오기 (Ultimate 제외)
      const { data: allWorkbooks, error: wbError } = await supabase
        .from('workbooks')
        .select('id, title, cover_subtitle')
        .order('created_at', { ascending: true });

      if (wbError) throw wbError;

      const filteredWorkbooks = (allWorkbooks || []).filter(wb => 
        !wb.cover_subtitle || wb.cover_subtitle.toLowerCase() !== 'ultimate'
      );

      if (filteredWorkbooks.length === 0) {
        toast.info('처리할 워크북이 없습니다.');
        setIsProcessing(false);
        isProcessingRef.current = false;
        return;
      }

      let totalProcessed = 0;
      let totalMissing = 0;

      // 각 워크북별로 순차 처리
      for (const wb of filteredWorkbooks) {
        if (isPausedRef.current) {
          toast.info('처리가 일시정지되었습니다.');
          break;
        }

        // 해당 워크북의 누락된 단어 찾기
        const { data: missingWords, error: fetchError } = await supabase
          .from('words')
          .select(`
            id,
            word,
            day_groups!inner (
              workbook_id
            )
          `)
          .eq('day_groups.workbook_id', wb.id)
          .or('english_definition.is.null,etymology.is.null')
          .order('sort_order');

        if (fetchError) {
          console.error(`Error fetching words for ${wb.title}:`, fetchError);
          continue;
        }

        if (!missingWords || missingWords.length === 0) {
          console.log(`${wb.title}: 누락된 단어 없음`);
          continue;
        }

        console.log(`${wb.title}: ${missingWords.length}개 누락된 단어 처리 중...`);
        toast.info(`📚 ${wb.title}: ${missingWords.length}개 단어 처리 중...`);
        totalMissing += missingWords.length;

        // 10개씩 배치 처리
        const batchSize = 10;
        for (let i = 0; i < missingWords.length; i += batchSize) {
          if (isPausedRef.current) {
            toast.info('처리가 일시정지되었습니다.');
            break;
          }

          const batch = missingWords.slice(i, i + batchSize).map(w => w.id);

          const { error } = await supabase.functions.invoke('update-word-definitions', {
            body: { wordIds: batch }
          });

          if (error) {
            console.error('Batch error:', error);
            setError(`${wb.title} 처리 중 오류: ${error.message}`);
            // 오류가 나도 다음 워크북으로 계속 진행
            break;
          }

          totalProcessed += batch.length;
          console.log(`${wb.title}: ${Math.min(i + batchSize, missingWords.length)}/${missingWords.length} 완료`);
          
          // 짧은 딜레이
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      if (totalMissing === 0) {
        toast.success('모든 단어에 이미 정의와 어원이 있습니다!');
      } else if (totalProcessed === totalMissing) {
        toast.success(`✅ 전체 ${totalProcessed}개 누락 단어 처리 완료!`);
      } else if (totalProcessed > 0) {
        toast.info(`${totalProcessed}/${totalMissing}개 처리됨. 나머지는 다시 실행해주세요.`);
      }

      // 워크북 목록 새로고침
      await fetchWorkbooks(regenerateMode);

    } catch (err) {
      console.error('Missing words processing error:', err);
      setError('누락된 단어 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
      isProcessingRef.current = false;
    }
  };

  const currentWorkbookList = activeTab === 'definitions' ? workbooks : synWorkbooks;
  const totalWords = currentWorkbookList.reduce((sum, wb) => sum + wb.wordCount, 0);
  const totalProcessed = currentWorkbookList.reduce((sum, wb) => sum + wb.processedCount, 0);
  const overallProgress = totalWords > 0 ? (totalProcessed / totalWords) * 100 : 0;
  const estimatedMinutes = Math.ceil((totalWords - totalProcessed) / 20 * 0.5);

  const completedWorkbooks = currentWorkbookList.filter(wb => wb.status === 'completed').length;
  const allCompleted = currentWorkbookList.length > 0 && completedWorkbooks === currentWorkbookList.length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f3ef] via-[#faf8f5] to-[#f0ebe3]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">워크북 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f3ef] via-[#faf8f5] to-[#f0ebe3] p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">단어 데이터 일괄 생성</h1>
            <Link to="/">
              <Button variant="outline" size="sm">돌아가기</Button>
            </Link>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => {
            if (!isProcessing) {
              setActiveTab(v as 'definitions' | 'synonyms');
              setError(null);
            }
          }}>
            <TabsList className="w-full mb-6">
              <TabsTrigger value="definitions" className="flex-1 gap-2" disabled={isProcessing}>
                <BookOpen className="w-4 h-4" />
                영영정의/어원
              </TabsTrigger>
              <TabsTrigger value="synonyms" className="flex-1 gap-2" disabled={isProcessing}>
                <RefreshCw className="w-4 h-4" />
                동의어/반의어 재생성
              </TabsTrigger>
            </TabsList>

            <TabsContent value="definitions">
              <div className="space-y-6">
                {/* 누락된 단어만 생성 버튼 */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        🎯 누락된 단어만 일괄 생성
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        전체 단어장에서 정의/어원이 없는 단어만 찾아서 생성합니다. 기존 데이터는 건너뜁니다.
                      </p>
                    </div>
                    <Button
                      onClick={startMissingWordsOnly}
                      disabled={isProcessing}
                      size="sm"
                      className="gap-2"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      누락 단어 생성
                    </Button>
                  </div>
                </div>

                {/* Regenerate mode toggle for definitions */}
                <div className="flex justify-end">
                  <Button 
                    variant={regenerateMode ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setRegenerateMode(!regenerateMode)}
                    disabled={isProcessing}
                  >
                    {regenerateMode ? "✓ 재생성 모드" : "🔄 재생성 모드"}
                  </Button>
                </div>
                {regenerateMode && (
                  <p className="text-sm text-amber-600">🔄 재생성 모드: 영어 어원 → 한글 어원으로 변환</p>
                )}
                
                {renderWorkbookList(workbooks, isProcessing, error, isPaused, allCompleted, completedWorkbooks, totalProcessed, totalWords, overallProgress, estimatedMinutes, startProcessing, pauseProcessing, resumeProcessing)}
              </div>
            </TabsContent>

            <TabsContent value="synonyms">
              <div className="space-y-6">
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <p className="text-sm text-amber-800">
                    <strong>동의어/반의어 재생성</strong>: 새 기준에 따라 모든 단어의 동의어와 반의어를 다시 생성합니다.
                  </p>
                  <ul className="text-xs text-amber-700 mt-2 list-disc list-inside space-y-1">
                    <li>표제어와 같은 수준의 어휘로 구성</li>
                    <li>실제로 존재하는 동의어/반의어만 표시</li>
                    <li>억지로 3개씩 채우지 않음</li>
                  </ul>
                </div>
                
                {renderWorkbookList(synWorkbooks, isProcessing, error, isPaused, allCompleted, completedWorkbooks, totalProcessed, totalWords, overallProgress, estimatedMinutes, startProcessing, pauseProcessing, resumeProcessing)}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );

  function renderWorkbookList(
    wbList: WorkbookWithWords[],
    processing: boolean,
    err: string | null,
    paused: boolean,
    completed: boolean,
    completedCount: number,
    processed: number,
    total: number,
    progress: number,
    estMinutes: number,
    onStart: () => void,
    onPause: () => void,
    onResume: () => void
  ) {
    return (
      <>
        {/* Overall Status */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            {completed ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : err ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-primary/20" />
            )}
            <span className="font-medium">
              {completed
                ? '모든 워크북 완료!'
                : `${completedCount} / ${wbList.length} 워크북 완료 (${processed.toLocaleString()} / ${total.toLocaleString()} 단어)`}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          {processing && (
            <p className="text-sm text-muted-foreground mt-2">
              예상 남은 시간: 약 {estMinutes}분
            </p>
          )}
        </div>

        {/* Workbook List */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {wbList.map((wb) => {
            const hasExistingData = wb.alreadyGeneratedCount > 0;
            const generatedPercent = wb.totalWordsInWorkbook > 0 
              ? Math.round((wb.alreadyGeneratedCount / wb.totalWordsInWorkbook) * 100) 
              : 0;
            const isFullyGenerated = generatedPercent >= 100;

            return (
              <div 
                key={wb.id}
                className={`rounded-lg p-4 border transition-colors ${
                  wb.status === 'processing' 
                    ? 'bg-blue-50 border-blue-200' 
                    : wb.status === 'completed'
                    ? 'bg-green-50 border-green-200'
                    : wb.status === 'error'
                    ? 'bg-red-50 border-red-200'
                    : isFullyGenerated
                    ? 'bg-emerald-50 border-emerald-300'
                    : hasExistingData
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className={`w-4 h-4 ${
                      wb.status === 'processing' ? 'text-blue-500' :
                      wb.status === 'completed' ? 'text-green-500' :
                      wb.status === 'error' ? 'text-red-500' :
                      isFullyGenerated ? 'text-emerald-600' :
                      hasExistingData ? 'text-amber-500' :
                      'text-gray-400'
                    }`} />
                    <span className="font-medium text-sm">{wb.title}</span>
                    {/* 기존 생성 상태 뱃지 */}
                    {wb.status === 'pending' && hasExistingData && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        isFullyGenerated 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {isFullyGenerated ? '생성완료' : `${generatedPercent}% 생성됨`}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {wb.status === 'processing' && (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    )}
                    {wb.status === 'completed' && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {wb.status === 'error' && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    {/* 개별 생성 버튼 */}
                    {wb.status === 'pending' && !isFullyGenerated && wb.wordCount > 0 && !processing && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          startSingleWorkbook(wb.id);
                        }}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        생성
                      </Button>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {wb.processedCount} / {wb.wordCount}
                    </span>
                  </div>
                </div>
                <Progress 
                  value={wb.wordCount > 0 ? (wb.processedCount / wb.wordCount) * 100 : 0} 
                  className="h-1.5"
                />
              </div>
            );
          })}
        </div>

        {/* Error */}
        {err && (
          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-sm text-red-600">{err}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {!processing && !paused && processed === 0 && (
            <Button 
              onClick={onStart} 
              className="flex-1 gap-2"
              disabled={wbList.length === 0}
            >
              <Play className="w-4 h-4" />
              생성 시작 ({wbList.length}개 워크북, {total.toLocaleString()}개 단어)
            </Button>
          )}
          
          {processing && (
            <Button 
              onClick={onPause} 
              variant="outline"
              className="flex-1 gap-2"
            >
              <Pause className="w-4 h-4" />
              일시정지
            </Button>
          )}
          
          {paused && !completed && (
            <Button 
              onClick={onResume} 
              className="flex-1 gap-2"
            >
              <Play className="w-4 h-4" />
              계속하기
            </Button>
          )}

          {err && !processing && processed > 0 && !completed && (
            <Button 
              onClick={onResume} 
              variant="outline"
              className="flex-1 gap-2"
            >
              재시도
            </Button>
          )}
        </div>

        {wbList.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <p>{activeTab === 'definitions' ? '모든 단어에 영영정의와 어원이 이미 있습니다!' : '처리할 워크북이 없습니다.'}</p>
          </div>
        )}
      </>
    );
  }
}
