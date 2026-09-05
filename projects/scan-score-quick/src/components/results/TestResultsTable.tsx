
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Image, ExternalLink, User, Pencil, Check, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TestResult, Test } from '@/types/results';
import { Badge } from "@/components/ui/badge";
import DeleteTestDialog from '@/components/test/DeleteTestDialog';
import MoveResultDialog from './MoveResultDialog';
import AnswersDisplay from './AnswersDisplay';
import TestReport from '@/components/TestReport';
import WritingTestReport, { calculateWritingScore } from '@/components/WritingTestReport';
import { extractClassName, extractStudentName, formatDate, formatScore, downloadAsJPG } from '@/utils/resultsUtils';
import { toast } from '@/hooks/use-toast';
import { useResultsContext } from '@/contexts/ResultsContext';
import { isSubjectiveAnswerCorrect } from '@/utils/testUtils/answerValidation';
import { calculateConsistentScore } from '@/utils/testUtils/scoreCalculation';
import { supabase } from '@/integrations/supabase/client';

interface TestResultsTableProps {
  testResults: TestResult[];
  test: Test;
  onDelete: (resultId: string) => Promise<void>;
  onNameUpdate?: (resultId: string, newName: string) => void;
  onMoveComplete?: () => void;
}

const TestResultsTable = ({ testResults, test, onDelete, onNameUpdate, onMoveComplete }: TestResultsTableProps) => {
  const navigate = useNavigate();
  const { expandedRows, setExpandedRows, reportRefs, results, setResults } = useResultsContext();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editClass, setEditClass] = useState('');
  const toggleRow = (id: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (expandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  const startEdit = (result: TestResult) => {
    setEditingId(result.id);
    setEditName(extractStudentName(result.student_name));
    setEditClass(extractClassName(result.student_name));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditClass('');
  };

  const saveEdit = async (resultId: string) => {
    const newFullName = `${editClass} ${editName}`.trim();
    
    try {
      const { error } = await supabase
        .from('test_results')
        .update({ student_name: newFullName })
        .eq('id', resultId);

      if (error) throw error;

      // Update local state immediately
      setResults(prevResults => 
        prevResults.map(result => 
          result.id === resultId 
            ? { ...result, student_name: newFullName }
            : result
        )
      );

      toast({
        title: "수정 완료",
        description: "학생 이름이 수정되었습니다.",
      });

      if (onNameUpdate) {
        onNameUpdate(resultId, newFullName);
      }
      
      cancelEdit();
    } catch (error) {
      console.error('Failed to update name:', error);
      toast({
        title: "수정 실패",
        description: "이름 수정에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  // 맞은 문제 개수를 계산하는 함수
  const calculateCorrectCount = (studentAnswers: Record<number, any>, correctAnswers: Record<number, any>): { correct: number; total: number } => {
    // Check if this is a writing test
    const studentAnswersAny = studentAnswers as any;
    if (studentAnswersAny?.testFormat === 'writing') {
      const results = studentAnswersAny?.results || [];
      const correctCount = results.filter((r: any) => r.isCorrect).length;
      return { correct: correctCount, total: results.length };
    }
    
    // Regular test calculation
    const total = Object.keys(correctAnswers).length;
    let count = 0;

    for (let q = 1; q <= total; q++) {
      const studentAnswer = studentAnswers[q]?.answer;
      const correctAnswer = correctAnswers[q]?.answer;
      const questionType = correctAnswers[q]?.type;

      let isCorrect = false;

      if (questionType === 'subjective') {
        isCorrect = isSubjectiveAnswerCorrect(String(studentAnswer), String(correctAnswer));
      } else {
        // For multiple choice, check if arrays are equal (all correct answers selected)
        const correctAnswerArray = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
        const studentAnswerArray = Array.isArray(studentAnswer) ? studentAnswer : [studentAnswer];

        // Sort both arrays for comparison
        const sortedCorrect = [...correctAnswerArray].sort((a, b) => a - b);
        const sortedStudent = [...studentAnswerArray].sort((a, b) => a - b);

        // Check if arrays are equal (same length and same elements)
        isCorrect = sortedCorrect.length === sortedStudent.length &&
                    sortedCorrect.every((value, index) => value === sortedStudent[index]);
      }

      if (isCorrect) count++;
    }

    return { correct: count, total };
  };

  return (
    <div className="w-full overflow-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-50 text-left">
            <th className="px-4 py-3 font-medium text-slate-600 text-sm">학생</th>
            <th className="px-4 py-3 font-medium text-slate-600 text-sm">날짜</th>
            <th className="px-4 py-3 font-medium text-slate-600 text-sm text-right">점수</th>
            <th className="px-4 py-3 font-medium text-slate-600 text-sm text-center">결과지</th>
            <th className="px-4 py-3 font-medium text-slate-600 text-sm text-center">다운로드</th>
            <th className="px-4 py-3 font-medium text-slate-600 text-sm text-center">삭제</th>
            <th className="px-4 py-3 font-medium text-slate-600 text-sm text-center">이동</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {testResults.map(result => {
            const hasAnswerKey = Object.keys(test.answers || {}).length > 0;
            // 맞은 문제 개수와 총 문제 수 계산
            const { correct: correctCount, total: totalCount } = hasAnswerKey
              ? calculateCorrectCount(result.student_answers, test.answers)
              : { correct: result.correct_count, total: result.total_count };
            
            // Check if this is a writing test
            const studentAnswersAny = result.student_answers as any;
            const isWritingTest = studentAnswersAny?.testFormat === 'writing';
            const displayScore = isWritingTest
              ? calculateWritingScore(studentAnswersAny?.results || [], totalCount).score
              : hasAnswerKey
                ? Math.round(calculateConsistentScore(result.student_answers, test.answers))
                : Math.round(result.score);
            
            return (
              <React.Fragment key={result.id}>
                <tr className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-4 py-3">
                    {editingId === result.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editClass}
                          onChange={(e) => setEditClass(e.target.value)}
                          className="w-16 h-8 text-sm"
                          placeholder="반"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') { e.preventDefault(); saveEdit(result.id); }
                            else if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); }
                          }}
                        />
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-20 h-8 text-sm"
                          placeholder="이름"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') { e.preventDefault(); saveEdit(result.id); }
                            else if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); }
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          onClick={() => saveEdit(result.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                          onClick={cancelEdit}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center group">
                        <span className="font-medium">{extractStudentName(result.student_name)}</span>
                        <Badge variant="outline" className="ml-2">
                          {extractClassName(result.student_name)}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-600"
                          onClick={() => startEdit(result)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {formatDate(result.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold text-emerald-600">
                      {displayScore}점
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
                      onClick={() => toggleRow(result.id)}
                    >
                      {expandedRows.has(result.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-500 hover:text-purple-600 hover:bg-purple-50"
                      onClick={async () => {
                        try {
                           // Ensure the row is expanded first
                           if (!expandedRows.has(result.id)) {
                             toggleRow(result.id);
                             // Wait longer for the component to render
                             await new Promise(resolve => setTimeout(resolve, 1500));
                           } else {
                             // Even if already expanded, wait to ensure it's fully rendered
                             await new Promise(resolve => setTimeout(resolve, 500));
                           }
                          const fileName = `${extractStudentName(result.student_name)}_${test.title}_${formatDate(result.created_at)}`;
                          await downloadAsJPG(reportRefs.current[result.id], fileName);
                         } catch (error) {
                           console.error('Download failed:', error);
                           // Error toast is already handled in downloadAsJPG function
                         }
                      }}
                      title="이미지로 다운로드"
                      disabled={false}
                    >
                      <Image className="h-4 w-4" />
                    </Button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <DeleteTestDialog 
                      onDelete={() => onDelete(result.id)} 
                      title="결과 삭제"
                      description="이 결과를 삭제하시겠습니까?"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <MoveResultDialog
                      resultId={result.id}
                      currentTestId={test.testId}
                      studentName={extractStudentName(result.student_name)}
                      onMoveComplete={onMoveComplete || (() => window.location.reload())}
                    />
                  </td>
                </tr>
                {expandedRows.has(result.id) && (
                  <tr>
                    <td colSpan={7} className="bg-slate-50 p-4">
                      {isWritingTest ? (
                        // Writing test report
                        <div 
                          ref={el => (reportRefs.current[result.id] = el)}
                          className="relative overflow-hidden bg-white border border-slate-200/60 rounded-2xl shadow-lg"
                        >
                        <WritingTestReport
                            studentName={extractStudentName(result.student_name)}
                            studentClass={extractClassName(result.student_name)}
                            testTitle={test.title}
                            score={displayScore}
                            correct={correctCount}
                            total={totalCount}
                            results={studentAnswersAny?.results || []}
                            testDate={result.created_at}
                            isAdmin={true}
                            onPartialScoreUpdate={async (questionNum, partialScore, reason) => {
                              try {
                                const currentResults = [...(studentAnswersAny?.results || [])];
                                const updatedResults = currentResults.map((r: any) =>
                                  r.questionNum === questionNum
                                    ? { ...r, partialScore: partialScore > 0 ? partialScore : undefined, partialScoreReason: reason || undefined }
                                    : r
                                );
                                const updatedAnswers = { ...studentAnswersAny, results: updatedResults };
                                
                                // Recalculate score
                                const { score: newScore } = calculateWritingScore(updatedResults, totalCount);
                                const newCorrectCount = updatedResults.filter((r: any) => r.isCorrect).length;

                                const { error } = await supabase
                                  .from('test_results')
                                  .update({
                                    student_answers: updatedAnswers,
                                    score: newScore,
                                    correct_count: newCorrectCount,
                                  })
                                  .eq('id', result.id);

                                if (error) throw error;

                                // Update local state
                                setResults(prev =>
                                  prev.map(r =>
                                    r.id === result.id
                                      ? { ...r, student_answers: updatedAnswers, score: newScore, correct_count: newCorrectCount }
                                      : r
                                  )
                                );

                                toast({
                                  title: partialScore > 0 ? "부분점수 저장 완료" : "부분점수 삭제 완료",
                                  description: partialScore > 0 
                                    ? `${questionNum}번 문항에 ${partialScore}점이 부여되었습니다.`
                                    : `${questionNum}번 문항의 부분점수가 삭제되었습니다.`,
                                });
                              } catch (error) {
                                console.error('Failed to save partial score:', error);
                                toast({
                                  title: "저장 실패",
                                  description: "부분점수 저장에 실패했습니다.",
                                  variant: "destructive",
                                });
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div 
                          ref={el => (reportRefs.current[result.id] = el)}
                          className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50/30 to-blue-50/20 
                                   border border-slate-200/60 rounded-3xl shadow-[0_20px_60px_-12px_rgba(0,0,0,0.08),0_8px_20px_-8px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.02)]
                                   backdrop-blur-sm p-8 md:p-10
                                   before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/40 before:via-transparent before:to-transparent before:pointer-events-none
                                   after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.03),transparent_50%)] after:pointer-events-none"
                        >
                          <TestReport
                            studentName={extractStudentName(result.student_name)}
                            studentClass={extractClassName(result.student_name)}
                            testTitle={test.title}
                            studentAnswers={result.student_answers}
                            correctAnswers={test.answers}
                            testDate={result.created_at}
                            allResults={results.filter(r => r.test_id === test.testId)}
                            testId={test.testId}
                            resultId={result.id}
                          />
                          <div className="mt-8 pt-6 border-t border-slate-200/60 text-center">
                            <p className="text-xs text-slate-500 font-medium">
                              © {new Date().getFullYear()} BRAINIAC ENGLISH. All rights reserved.
                            </p>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TestResultsTable;
