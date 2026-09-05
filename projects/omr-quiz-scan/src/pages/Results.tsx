import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, BookOpen, Search, UserCog, ChevronDown, ScanLine } from 'lucide-react';
import BackButton from '@/components/BackButton';
import PageHeader from '@/components/PageHeader';
import { loadTestResults, loadTests, deleteTestResults } from '@/utils/testStorage';
import { toast } from "@/hooks/use-toast";
import AccessCodeForm from '@/components/AccessCodeForm';
import { ResultsProvider, useResultsContext } from '@/contexts/ResultsContext';
import TestResultGroup from '@/components/results/TestResultGroup';
import LevelTestResultGroup from '@/components/results/LevelTestResultGroup';
import HighSchoolLevelTestResultGroup from '@/components/results/HighSchoolLevelTestResultGroup';
import PrepLevelTestResultGroup from '@/components/results/PrepLevelTestResultGroup';
import PrepPdfScanDialog from '@/components/results/PrepPdfScanDialog';
import { detectPrepVersion, PREP_VERSION_META } from '@/data/prepVersions';
import StudentSearchFilter from '@/components/results/StudentSearchFilter';
import BulkNameFixDialog from '@/components/results/BulkNameFixDialog';
import { downloadExcel } from '@/utils/resultsUtils';
import { setupRealtimeSubscriptions, getTestResultsCache, getTestsCache } from '@/utils/testStorage/cache';
import { supabase } from "@/integrations/supabase/client";
import { recalculateResult } from '@/utils/levelTestScoring';
import orunLogo from '@/assets/orun-dialog-logo.jpg';
interface LevelTestResult {
  id: string;
  student_name: string;
  student_school: string | null;
  student_grade: string | null;
  total_score: number;
  level: string;
  section_scores: any[];
  sub_category_scores: Record<string, any[]>;
  elapsed_time: number;
  created_at: string;
  answers: Record<string, any>;
  academy?: string | null;
  grade_overrides?: Record<string, 'A' | 'B' | 'C'> | null;
}
const ResultsContent = () => {
  const {
    results,
    setResults,
    tests,
    setTests,
    isDeleting,
    setIsDeleting,
    forceUpdate,
    setForceUpdate
  } = useResultsContext();
  const [isLoading, setIsLoading] = useState(true);
  const [levelTestResults, setLevelTestResults] = useState<LevelTestResult[]>([]);
  const [hsLevelTestResults, setHsLevelTestResults] = useState<LevelTestResult[]>([]);
  const [prepLevelTestResults, setPrepLevelTestResults] = useState<LevelTestResult[]>([]);
  const [showStudentSearch, setShowStudentSearch] = useState(false);
  const [showLevelTestGroup, setShowLevelTestGroup] = useState(false);
  const [showBulkNameFix, setShowBulkNameFix] = useState(false);
  const [showPdfScan, setShowPdfScan] = useState(false);
  const navigate = useNavigate();
  // Access scope: 'full' = all data (Orun admin), 'levelTestOnly' = only this academy's level test results (e.g. Brainiac)
  const accessScope = (typeof window !== 'undefined' ? localStorage.getItem('accessScope') : '') || 'full';
  const accessAcademy = (typeof window !== 'undefined' ? localStorage.getItem('accessAcademy') : '') || 'orun';
  const isLevelTestOnly = accessScope === 'levelTestOnly';

  useEffect(() => {
    if (isLevelTestOnly) {
      setShowLevelTestGroup(true);
    }
  }, [isLevelTestOnly]);

  const displayTests = useMemo(() => {
    const existingTestIds = new Set(tests.map(test => test.testId));
    const orphanTests = results
      .filter(result => !existingTestIds.has(result.test_id))
      .map(result => ({
        testId: result.test_id,
        title: result.test_id,
        answers: {}
      }));

    return [...tests, ...orphanTests];
  }, [tests, results]);

  const hasAnyResults =
    displayTests.length > 0 ||
    levelTestResults.length > 0 ||
    hsLevelTestResults.length > 0 ||
    prepLevelTestResults.length > 0;

  // 중등부(프렙 문항 세트) 결과를 시험지 버전별로 분리
  const prepV1Results = useMemo(
    () => prepLevelTestResults.filter(r => detectPrepVersion(r.answers) === 'v1'),
    [prepLevelTestResults]
  );
  const prepV2Results = useMemo(
    () => prepLevelTestResults.filter(r => detectPrepVersion(r.answers) !== 'v1'),
    [prepLevelTestResults]
  );

  const loadLevelTestResults = useCallback(async () => {
    try {
      let query = supabase.from('level_test_results').select('*').order('created_at', { ascending: false });
      // Scope results to the caller's academy when not 'full' admin
      if (isLevelTestOnly) {
        query = query.eq('academy', accessAcademy);
      } else {
        // Orun admin only sees Orun-tagged results (excludes partner academies like Brainiac)
        query = query.eq('academy', 'orun');
      }
      const { data, error } = await query;
      if (error) throw error;

      // 중등, 고등, 초등 결과 분리
      const middleSchoolResults: LevelTestResult[] = [];
      const highSchoolResults: LevelTestResult[] = [];
      const prepResults: LevelTestResult[] = [];
      (data || []).forEach(item => {
        const baseResult = {
          ...item,
          section_scores: item.section_scores as any[],
          sub_category_scores: item.sub_category_scores as Record<string, any[]>,
          answers: item.answers as Record<string, any>
        };

        // 고등부 결과인지 확인 (level이 '고등_'으로 시작하는 경우)
        const isHighSchool = baseResult.level?.startsWith('고등_');
        // 초등부 결과인지 확인 (level이 'prep-'으로 시작하는 경우)
        const isPrep = baseResult.level?.startsWith('prep-');
        if (isPrep) {
          prepResults.push(baseResult as LevelTestResult);
        } else if (isHighSchool) {
          highSchoolResults.push(baseResult as LevelTestResult);
        } else if (baseResult.answers && Object.keys(baseResult.answers).length > 0) {
          // 중등 결과만 점수 재계산 (고등부/초등부는 다른 문제 세트 사용)
          const recalculated = recalculateResult(baseResult);
          middleSchoolResults.push({
            ...baseResult,
            section_scores: recalculated.section_scores,
            sub_category_scores: recalculated.sub_category_scores,
            total_score: recalculated.total_score
          } as LevelTestResult);
        } else {
          middleSchoolResults.push(baseResult as LevelTestResult);
        }
      });
      setLevelTestResults(middleSchoolResults);
      setHsLevelTestResults(highSchoolResults);
      setPrepLevelTestResults(prepResults);
    } catch (error) {
      console.error('Error loading level test results:', error);
    }
  }, [isLevelTestOnly, accessAcademy]);
  const loadAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Partner academies (levelTestOnly scope) never load Orun's regular test results or test definitions
      if (isLevelTestOnly) {
        await loadLevelTestResults();
        setResults([]);
        setTests([]);
        return;
      }
      const [loadedResults, loadedTests] = await Promise.all([loadTestResults(), loadTests(), loadLevelTestResults()]);
      console.log('Loaded Results:', loadedResults.length);
      console.log('Loaded Tests:', loadedTests.length);

      // Use deep copies to ensure we don't have reference issues
      setResults(JSON.parse(JSON.stringify(loadedResults)));
      setTests(JSON.parse(JSON.stringify(loadedTests)));
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "데이터 로딩 실패",
        description: "시험 결과를 불러오는데 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [setResults, setTests, loadLevelTestResults, isLevelTestOnly]);
  useEffect(() => {
    // Set up real-time subscription to handle updates
    const handleUpdate = () => {
      console.log('Real-time update triggered');
      console.log('Current cache state:', {
        testResults: getTestResultsCache().length,
        tests: getTestsCache().length
      });

      // Create deep copies to avoid reference issues
      const resultsCopy = JSON.parse(JSON.stringify(getTestResultsCache()));
      const testsCopy = JSON.parse(JSON.stringify(getTestsCache()));
      setResults(resultsCopy);
      setTests(testsCopy);
      setForceUpdate(prev => prev + 1);
    };
    // Partner academies (levelTestOnly) must not subscribe to Orun's test caches
    const cleanup = isLevelTestOnly ? () => {} : setupRealtimeSubscriptions(handleUpdate);

    // Initial data load
    loadAllData();
    return () => {
      cleanup();
    };
  }, [loadAllData, setResults, setTests, setForceUpdate, isLevelTestOnly]);
  const handleDelete = async (resultId: string) => {
    if (isDeleting) {
      console.log('Delete operation already in progress, ignoring request');
      return;
    }
    setIsDeleting(true);
    try {
      console.log('Attempting to delete result with ID:', resultId);

      // Optimistically remove the result from UI
      setResults(prev => prev.filter(result => result.id !== resultId));

      // Always use permanent deletion
      const success = await deleteTestResults(resultId, false);
      if (!success) {
        // If deletion failed, reload the data
        console.error('Delete operation failed, reloading data');
        await loadAllData();
      } else {
        console.log('Delete operation successful');

        // Ensure the UI is in sync with the cache after deletion
        const updatedResults = JSON.parse(JSON.stringify(getTestResultsCache()));
        console.log('Setting results after successful deletion:', updatedResults.length);
        setResults(updatedResults);

        // Force refresh
        setForceUpdate(prev => prev + 1);

        // Verification and completion
        const stillExists = getTestResultsCache().some(result => result.id === resultId);
        if (stillExists) {
          console.error(`ERROR: Item with ID ${resultId} still exists in cache after deletion!`);
          await loadAllData();
        }
      }
    } catch (error) {
      console.error('Error in handleDelete:', error);
      toast({
        title: "삭제 실패",
        description: "결과를 삭제하는데 실패했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
      // Reload data on error to ensure UI is consistent
      await loadAllData();
    } finally {
      setIsDeleting(false);
    }
  };
  const handleDeleteByTestId = async (testId: string) => {
    if (isDeleting) {
      console.log('Delete operation already in progress, ignoring request');
      return;
    }
    setIsDeleting(true);
    try {
      console.log('Attempting to delete all results for test ID:', testId);

      // Optimistically remove from UI immediately
      setResults(prevResults => {
        console.log(`Optimistically removing test ID ${testId} results from UI`);
        console.log(`Before: ${prevResults.length} results`);
        const filtered = prevResults.filter(result => result.test_id !== testId);
        console.log(`After: ${filtered.length} results`);
        return filtered;
      });

      // Always use permanent deletion
      const success = await deleteTestResults(testId, true);
      if (!success) {
        // If deletion failed, reload the data
        console.error('Delete by test ID operation failed, reloading data');
        await loadAllData();
      } else {
        console.log('Delete by test ID operation successful');

        // Ensure the UI is in sync with the cache after deletion
        const updatedResults = JSON.parse(JSON.stringify(getTestResultsCache()));
        console.log('Setting results after successful group deletion:', updatedResults.length);
        setResults(updatedResults);

        // Force refresh
        setForceUpdate(prev => prev + 1);

        // Verification check
        console.log('Verifying deletion: checking if deleted items still exist in cache');
        const stillExists = getTestResultsCache().some(result => result.test_id === testId);
        if (stillExists) {
          console.error(`ERROR: Items with test_id ${testId} still exist in cache after deletion!`);
          // Force sync with server as last resort
          await loadAllData();
        }
      }
    } catch (error) {
      console.error('Error in handleDeleteByTestId:', error);
      toast({
        title: "삭제 실패",
        description: "시험을 삭제하는데 실패했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
      // Reload data on error to ensure UI is consistent
      await loadAllData();
    } finally {
      setIsDeleting(false);
    }
  };
  const handleDeleteLevelTestResult = async (resultId: string) => {
    try {
      const {
        error
      } = await supabase.from('level_test_results').delete().eq('id', resultId);
      if (error) throw error;

      // 중등/고등/초등 모두에서 삭제
      setLevelTestResults(prev => prev.filter(r => r.id !== resultId));
      setHsLevelTestResults(prev => prev.filter(r => r.id !== resultId));
      setPrepLevelTestResults(prev => prev.filter(r => r.id !== resultId));
      toast({
        title: "삭제 완료",
        description: "레벨테스트 결과가 삭제되었습니다."
      });
    } catch (error) {
      console.error('Error deleting level test result:', error);
      toast({
        title: "삭제 실패",
        description: "결과를 삭제하는데 실패했습니다.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateLevelTestResult = (resultId: string, updates: { student_name?: string; student_school?: string; student_grade?: string; grade_overrides?: Record<string, 'A' | 'B' | 'C'> }) => {
    // 중등/고등/초등 모두에서 업데이트
    setLevelTestResults(prev => prev.map(r => 
      r.id === resultId ? { ...r, ...updates } : r
    ));
    setHsLevelTestResults(prev => prev.map(r => 
      r.id === resultId ? { ...r, ...updates } : r
    ));
    setPrepLevelTestResults(prev => prev.map(r => 
      r.id === resultId ? { ...r, ...updates } : r
    ));
  };
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0b1020] relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[480px] h-[480px] rounded-full bg-fuchsia-500/15 blur-3xl" />
        <div className="flex flex-col items-center gap-6 relative z-10">
          <div className="relative">
            <div className="h-20 w-20 rounded-2xl bg-white/95 shadow-2xl shadow-indigo-500/40 flex items-center justify-center p-2 animate-pulse">
              <img
                src="/lovable-uploads/5b56e2a6-a232-40de-90c5-6d82faab51f6.png"
                alt="ORUN Academy Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="absolute inset-0 h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-600 animate-ping opacity-20"></div>
          </div>
          <p className="text-white/80 font-medium tracking-wide">결과를 불러오는 중...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-[#fbfbfd] relative">

      {/* Premium Header */}
      <PageHeader 
        title={isLevelTestOnly ? "레벨테스트 결과" : "시험 결과"}
        subtitle={isLevelTestOnly ? `${accessAcademy.toUpperCase()} 학원 레벨테스트 결과` : "학생들의 시험 결과를 확인하고 관리하세요"}
        backPath="/"
      >
        {!isLevelTestOnly && <Button 
          variant="ghost"
          size="sm"
          className="h-9 px-4 rounded-full text-[13px] font-medium text-slate-700 hover:bg-slate-900/[0.05] hover:text-slate-900 transition-colors"
          onClick={() => setShowStudentSearch(!showStudentSearch)}
        >
          <Search className="mr-1.5 h-3.5 w-3.5" />
          학생 검색
        </Button>}

        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-4 rounded-full text-[13px] font-medium text-violet-700 hover:bg-violet-900/[0.06] hover:text-violet-900 transition-colors"
          onClick={() => setShowPdfScan(true)}
        >
          <ScanLine className="mr-1.5 h-3.5 w-3.5" />
          레벨테스트 AI자동채점
        </Button>

        {!isLevelTestOnly && <Button
          variant="ghost"
          size="sm"
          className="h-9 px-4 rounded-full text-[13px] font-medium text-slate-700 hover:bg-slate-900/[0.05] hover:text-slate-900 transition-colors"
          onClick={() => setShowBulkNameFix(true)}
        >
          <UserCog className="mr-1.5 h-3.5 w-3.5" />
          이름 일괄 수정
        </Button>}
        
        {!isLevelTestOnly && <Button
          variant="ghost"
          size="sm"
          className="h-9 px-4 rounded-full text-[13px] font-medium text-slate-700 hover:bg-slate-900/[0.05] hover:text-slate-900 transition-colors"
          onClick={() => downloadExcel(results, tests)}
        >
          <Download className="mr-1.5 h-3.5 w-3.5" />
          전체 엑셀 다운로드
        </Button>}
        
        {!isLevelTestOnly && <Button
          size="sm"
          className="h-9 px-4 rounded-full text-[13px] font-medium bg-slate-900 text-white hover:bg-slate-800 shadow-none transition-colors"
          onClick={async () => {
        try {
          const {
            data,
            error
          } = await supabase.functions.invoke('deduplicate-test-results', {
            body: { accessCode: sessionStorage.getItem('verifiedAccessCode') || '' }
          });
          if (error) throw error;
          toast({
            title: '전체 중복 제거 완료',
            description: data?.message || '완료되었습니다.'
          });
          await loadAllData();
        } catch (e) {
          console.error(e);
          toast({
            title: '전체 중복 제거 실패',
            description: '작업 중 오류가 발생했습니다.',
            variant: 'destructive'
          });
        }
      }}>
          중복 데이터 제거
        </Button>}
      </PageHeader>

      <PrepPdfScanDialog
        open={showPdfScan}
        onOpenChange={setShowPdfScan}
        onCreated={loadLevelTestResults}
      />

      <BulkNameFixDialog
        open={showBulkNameFix}
        onOpenChange={setShowBulkNameFix}
        onDeduplicateAll={async () => {
          try {
            const { data, error } = await supabase.functions.invoke('deduplicate-test-results', {
              body: { accessCode: sessionStorage.getItem('verifiedAccessCode') || '' }
            });
            if (error) throw error;
            toast({ title: '전체 중복 제거 완료', description: data?.message || '완료되었습니다.' });
            await loadAllData();
          } catch (e) {
            console.error(e);
            toast({ title: '전체 중복 제거 실패', description: '작업 중 오류가 발생했습니다.', variant: 'destructive' });
          }
        }}
      />

      {/* Results Content */}
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-16 relative z-10">
        {/* Student Search Filter - Always visible (admin only) */}
        {!isLevelTestOnly && <StudentSearchFilter 
          results={results}
          tests={tests}
        />}

        {hasAnyResults ? <div className="space-y-3">
            {/* Level Test Results Group */}
            {(hsLevelTestResults.length > 0 || levelTestResults.length > 0 || prepLevelTestResults.length > 0) && (
              <div className="relative rounded-2xl bg-slate-900/[0.32] border border-white/[0.08] backdrop-blur-xl shadow-[0_20px_50px_-24px_rgba(0,0,0,0.35)] overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/25 to-transparent" />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/[0.04]" />
                <button
                  type="button"
                  onClick={() => setShowLevelTestGroup(v => !v)}
                  className={`group relative w-full text-left py-4 ${showLevelTestGroup ? 'mb-4' : ''}`}
                >
                  <div className="flex items-center gap-4 px-5">
                    <img
                      src={orunLogo}
                      alt="ORUN ACADEMY 로고"
                      className="h-9 w-9 rounded-full object-cover shadow-md ring-1 ring-white/15"
                    />
                    <div className="flex-1">
                      <h2 className="text-[15px] font-normal uppercase tracking-[0.18em] text-white/90">
                        {isLevelTestOnly ? `${accessAcademy.toUpperCase()} 레벨테스트 결과` : '레벨테스트 결과'}
                      </h2>
                    </div>
                    <span className="text-[11px] font-medium text-amber-100/80 bg-white/[0.05] px-3 py-1 rounded-full border border-white/[0.08]">
                      {levelTestResults.length + hsLevelTestResults.length + prepLevelTestResults.length}건
                    </span>
                  </div>
                  <ChevronDown className={`absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/35 transition-transform group-hover:text-white/60 ${showLevelTestGroup ? 'rotate-180' : ''}`} />
                </button>
                {showLevelTestGroup && <div className="space-y-3">
                  {hsLevelTestResults.length > 0 && <div className="animate-fade-in">
                      <HighSchoolLevelTestResultGroup 
                        results={hsLevelTestResults} 
                        onDelete={handleDeleteLevelTestResult} 
                        onUpdate={handleUpdateLevelTestResult}
                      />
                    </div>}

                  {levelTestResults.length > 0 && <div className="animate-fade-in">
                      <LevelTestResultGroup 
                        results={levelTestResults} 
                        onDelete={handleDeleteLevelTestResult} 
                        onUpdate={handleUpdateLevelTestResult}
                      />
                    </div>}

                  {prepV1Results.length > 0 && <div className="animate-fade-in">
                      <PrepLevelTestResultGroup 
                        results={prepV1Results} 
                        onDelete={handleDeleteLevelTestResult} 
                        onUpdate={handleUpdateLevelTestResult}
                        groupTitle={`중등부 레벨테스트 · ${PREP_VERSION_META.v1.label}(${PREP_VERSION_META.v1.subtitle})`}
                      />
                    </div>}

                  {prepV2Results.length > 0 && <div className="animate-fade-in">
                      <PrepLevelTestResultGroup 
                        results={prepV2Results} 
                        onDelete={handleDeleteLevelTestResult} 
                        onUpdate={handleUpdateLevelTestResult}
                        groupTitle={`중등부 레벨테스트 · ${PREP_VERSION_META.v2.label}(${PREP_VERSION_META.v2.subtitle})`}
                      />
                    </div>}
                </div>}
              </div>
            )}

            {/* Regular Test Results */}
            {!isLevelTestOnly && displayTests.map((test, index) => {
          const testResults = results.filter(r => r.test_id === test.testId);
          if (testResults.length === 0) return null;
          return <div key={test.testId} className="animate-fade-in" style={{
            animationDelay: `${(index + (levelTestResults.length > 0 ? 1 : 0)) * 0.05}s`
          }}>
                  <TestResultGroup test={test} testResults={testResults} onDeleteByTestId={handleDeleteByTestId} onDelete={handleDelete} onMoveComplete={loadAllData} />
                </div>;
        })}
          </div> : <div className="text-center py-24">
            <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-white to-slate-50 border border-slate-200/80 shadow-xl shadow-slate-200/50 mb-6">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-100/40 to-fuchsia-100/30 blur-xl" />
              <BookOpen className="h-11 w-11 text-slate-400 relative" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">
              {isLevelTestOnly ? `${accessAcademy.toUpperCase()} 결과가 없습니다` : '결과가 없습니다'}
            </h3>
            <p className="text-sm text-slate-400 mb-8">
              {isLevelTestOnly
                ? `${accessAcademy} 전용 URL로 제출된 레벨테스트 결과가 아직 없습니다.`
                : '아직 등록된 시험 결과가 없습니다'}
            </p>
            <BackButton fallbackPath="/" />
          </div>}
      </div>
    </div>;
};
const Results = () => {
  const [hasAccess, setHasAccess] = useState<boolean>(false);

  useEffect(() => {
    // Always clear cached access on mount so the user must re-enter the code
    localStorage.removeItem('resultsAccessGranted');
    localStorage.removeItem('accessScope');
    localStorage.removeItem('accessAcademy');
  }, []);

  if (!hasAccess) {
    return <AccessCodeForm onSuccess={() => setHasAccess(true)} />;
  }
  return <ResultsProvider>
      <ResultsContent />
    </ResultsProvider>;
};
export default Results;