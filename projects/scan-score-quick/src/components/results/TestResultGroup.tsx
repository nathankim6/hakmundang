
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Award, ChevronUp, ChevronDown, Eye, EyeOff, Download, Image, ArrowUpDown, Calendar } from 'lucide-react';
import examIcon from "@/assets/exam-icon.png";
import DeleteTestDialog from '@/components/test/DeleteTestDialog';
import TestResultsTable from './TestResultsTable';
import { TestResult, Test } from '@/types/results';
import { useResultsContext } from '@/contexts/ResultsContext';
import { downloadExcel, downloadAllReportsAsJPG, getSortedResults } from '@/utils/resultsUtils';
import { calculateConsistentScore } from '@/utils/testUtils/scoreCalculation';
import { calculateWritingScore } from '@/components/WritingTestReport';
import { format } from 'date-fns';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

interface TestResultGroupProps {
  test: Test;
  testResults: TestResult[];
  onDeleteByTestId: (testId: string) => Promise<void>;
  onDelete: (resultId: string) => Promise<void>;
  onMoveComplete?: () => void;
}

const TestResultGroup = ({ test, testResults, onDeleteByTestId, onDelete, onMoveComplete }: TestResultGroupProps) => {
  const [branchDialogOpen, setBranchDialogOpen] = React.useState(false);

  const branchCounts = React.useMemo(() => {
    const counts: Record<string, number> = { 전체: testResults.length, 초등관: 0, 뉴베리타스관: 0, 흑석관: 0, 미지정: 0 };
    testResults.forEach(r => {
      const b = (r.student_answers as any)?.__branch;
      if (b && counts[b] !== undefined) counts[b] += 1;
      else counts['미지정'] += 1;
    });
    return counts;
  }, [testResults]);

  const { 
    results,
    tests,
    expandedTests, 
    setExpandedTests,
    expandedRows,
    setExpandedRows,
    sortOrder,
    setSortOrder,
    reportRefs
  } = useResultsContext();

  const toggleTestResults = (testId: string) => {
    const newExpandedTests = new Set(expandedTests);
    if (expandedTests.has(testId)) {
      newExpandedTests.delete(testId);
    } else {
      newExpandedTests.add(testId);
    }
    setExpandedTests(newExpandedTests);
  };

  const toggleAllRowsForTest = (testId: string) => {
    const allTestResults = testResults.filter(r => r.test_id === testId);
    const allResultIds = allTestResults.map(r => r.id);
    const isAllExpanded = allResultIds.every(id => expandedRows.has(id));
    
    const newExpandedRows = new Set(expandedRows);
    
    if (isAllExpanded) {
      allResultIds.forEach(id => newExpandedRows.delete(id));
    } else {
      allResultIds.forEach(id => newExpandedRows.add(id));
    }
    
    setExpandedRows(newExpandedRows);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'none' ? 'desc' : 'none');
  };

  // Calculate accurate scores for each test result
  const testResultsWithScores = testResults.map(result => {
    const studentAnswersAny = result.student_answers as any;
    const isWritingTest = studentAnswersAny?.testFormat === 'writing';
    const hasAnswerKey = Object.keys(test.answers || {}).length > 0;
    
    let calculatedScore: number;
    if (isWritingTest) {
      const writingResults = studentAnswersAny?.results || [];
      const totalCount = writingResults.length;
      const { score } = calculateWritingScore(writingResults, totalCount);
      calculatedScore = score;
    } else if (!hasAnswerKey) {
      calculatedScore = result.score;
    } else {
      calculatedScore = calculateConsistentScore(result.student_answers, test.answers);
    }
    
    return {
      ...result,
      score: calculatedScore
    };
  });

  const averageScore = testResultsWithScores.length > 0 
    ? Math.round(testResultsWithScores.reduce((acc, r) => acc + r.score, 0) / testResultsWithScores.length)
    : 0;

  const isTestExpanded = expandedTests.has(test.testId);
  const allResultIds = testResults.map(r => r.id);
  const isAllResultsExpanded = allResultIds.every(id => expandedRows.has(id));
  const sortedTestResults = getSortedResults(testResultsWithScores, sortOrder);

  const testDate = testResults.length > 0 
    ? format(new Date(Math.min(...testResults.map(r => new Date(r.created_at).getTime()))), 'yyyy.MM.dd')
    : null;

  return (
    <Card key={test.testId} className="bg-white border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden rounded-2xl">
      {/* Header */}
      <div 
        className="cursor-pointer select-none"
        onClick={() => toggleTestResults(test.testId)}
      >
        <div className="px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Left: Title & Meta */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 shrink-0 ${
              isTestExpanded 
                ? 'bg-slate-800 text-white' 
                : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
            }`}>
              {isTestExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
            
            <div className="min-w-0 flex-1">
              <h2 className="text-[15px] font-bold text-slate-800 truncate leading-tight">
                {test.title || test.testId}
              </h2>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {testDate && (
                  <span className="text-xs text-slate-400 font-medium tabular-nums">
                    {testDate}
                  </span>
                )}
                <div className="flex items-center gap-0.5">
                  <span className="text-xs font-bold text-slate-600">{testResults.length}</span>
                  <span className="text-xs text-slate-400">명</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <span className="text-xs text-slate-400">평균</span>
                  <span className="text-xs font-bold text-slate-600">{averageScore}</span>
                  <span className="text-xs text-slate-400">점</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              aria-label="엑셀 다운로드"
              className="h-8 px-2 sm:px-2.5 text-xs text-slate-500 hover:text-emerald-700 hover:bg-emerald-50"
              onClick={() => downloadExcel(results, tests, test.testId)}
            >
              <Download className="h-3.5 w-3.5 sm:mr-1" />
              <span className="hidden sm:inline">엑셀 다운로드</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label="전체 이미지 다운로드"
              className="h-8 px-2 sm:px-2.5 text-xs text-slate-500 hover:text-violet-700 hover:bg-violet-50"
              onClick={() => setBranchDialogOpen(true)}
            >
              <Image className="h-3.5 w-3.5 sm:mr-1" />
              <span className="hidden sm:inline">전체 이미지 다운로드</span>
            </Button>
            <DeleteTestDialog 
              testId={test.testId}
              onDelete={() => onDeleteByTestId(test.testId)} 
              title="시험 결과 삭제"
              description="이 시험의 모든 결과가 삭제됩니다. 계속하시겠습니까?"
            />
          </div>
        </div>
      </div>


      <Dialog open={branchDialogOpen} onOpenChange={setBranchDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>소속 선택</DialogTitle>
            <DialogDescription>
              어떤 소속의 리포트를 일괄 다운로드하시겠어요?
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-2 py-2">
            {(['전체', '초등관', '뉴베리타스관', '흑석관', '송파관', '미지정'] as const).map((branch) => {
              const count = branchCounts[branch] ?? 0;
              const disabled = count === 0;
              return (
                <button
                  key={branch}
                  disabled={disabled}
                  onClick={() => {
                    setBranchDialogOpen(false);
                    downloadAllReportsAsJPG(
                      test.testId, results, tests, expandedRows, setExpandedRows, reportRefs,
                      branch === '미지정' ? '__UNASSIGNED__' : branch,
                      setExpandedTests
                    );
                  }}
                  className={`group relative flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all ${
                    disabled
                      ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                      : 'border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-8 rounded-full ${
                      branch === '전체' ? 'bg-gradient-to-b from-slate-700 to-slate-900' :
                      branch === '초등관' ? 'bg-gradient-to-b from-amber-400 to-orange-500' :
                      branch === '뉴베리타스관' ? 'bg-gradient-to-b from-indigo-500 to-violet-600' :
                      branch === '흑석관' ? 'bg-gradient-to-b from-emerald-500 to-teal-600' :
                      branch === '송파관' ? 'bg-gradient-to-b from-sky-500 to-blue-600' :
                      'bg-slate-300'
                    }`} />
                    <span className="text-sm font-semibold">{branch}</span>
                  </div>
                  <span className="text-xs font-bold tabular-nums text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {count}명
                  </span>
                </button>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setBranchDialogOpen(false)}>취소</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isTestExpanded && (
        <div className="border-t border-slate-100">
          <div className="px-5 py-3 flex items-center gap-2 bg-slate-50/60">
            {isTestExpanded && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-white"
                onClick={() => toggleAllRowsForTest(test.testId)}
              >
                {isAllResultsExpanded ? (
                  <>
                    <EyeOff className="mr-1.5 h-3.5 w-3.5" />
                    모두 접기
                  </>
                ) : (
                  <>
                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                    모두 펼치기
                  </>
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-white"
              onClick={toggleSortOrder}
            >
              <ArrowUpDown className="mr-1.5 h-3.5 w-3.5" />
              {sortOrder === 'desc' ? '기본 순서' : '점수순'}
            </Button>
          </div>
          <div className="p-5 pt-3">
            <TestResultsTable 
              testResults={sortedTestResults} 
              test={test} 
              onDelete={onDelete}
              onMoveComplete={onMoveComplete}
            />
          </div>
        </div>
      )}
    </Card>
  );
};

export default TestResultGroup;
