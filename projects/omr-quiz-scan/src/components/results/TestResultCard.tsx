
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronUp, ChevronDown, Image, Clock, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { TestResult, Test } from '@/types/results';
import TestReport from '@/components/TestReport';
import DeleteTestDialog from '@/components/test/DeleteTestDialog';
import AnswersDisplay from './AnswersDisplay';
import { extractClassName, extractStudentName, formatDate, downloadAsJPG } from '@/utils/resultsUtils';
import { useResultsContext } from '@/contexts/ResultsContext';
import { calculateConsistentScore } from '@/utils/testUtils/scoreCalculation';
import { isSubjectiveAnswerCorrect } from '@/utils/testUtils/answerValidation';

interface TestResultCardProps {
  result: TestResult;
  test: Test;
  onDelete: (resultId: string) => Promise<void>;
}

const TestResultCard = ({ result, test, onDelete }: TestResultCardProps) => {
  const navigate = useNavigate();
  const { expandedRows, setExpandedRows, reportRefs, results } = useResultsContext();

  const toggleRow = (id: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (expandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleDelete = async () => {
    console.log(`삭제 시작: ID: ${result.id}, 학생: ${result.student_name}`);
    
    try {
      await onDelete(result.id);
      console.log(`성공: TestResultCard에서 삭제 완료. ID: ${result.id}`);
    } catch (error) {
      console.error(`실패: TestResultCard에서 삭제 실패. ID: ${result.id}`, error);
    }
  };

  // 결과 표시
  
  // 점수 및 정답 개수 계산
  const displayScore = calculateConsistentScore(result.student_answers, test.answers);
  
  // 맞은 문제 개수 계산
  const correctCount = Object.entries(result.student_answers).reduce((count, [questionNumStr, answerData]) => {
    const questionNum = parseInt(questionNumStr);
    const studentAnswer = answerData?.answer;
    const correctAnswer = test.answers[questionNum]?.answer;
    const questionType = test.answers[questionNum]?.type;
    
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
    
    return isCorrect ? count + 1 : count;
  }, 0);
  
  // 총 문제 수
  const totalCount = Object.keys(test.answers).length;

  // Check if this is the high school entrance level test
  const isHighSchoolEntranceTest = test.title && test.title.includes('고등부 신입생 레벨테스트');
  const shouldUseCustomReport = isHighSchoolEntranceTest && totalCount <= 22;
  // 문항 수와 무관하게 정답 키가 있으면 성적표를 보여준다 (기존: 45문항만)
  const canShowReport = shouldUseCustomReport || totalCount > 0;

  return (
    <div 
      key={result.id} 
      className="group relative overflow-hidden rounded-3xl transition-all duration-500 hover:scale-[1.02] bg-gradient-to-br from-white via-slate-50/30 to-blue-50/20 border border-slate-200/60 shadow-xl hover:shadow-2xl"
      data-student-name={result.student_name}
      data-result-id={result.id}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 right-10 w-20 h-20 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-16 h-16 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Student Info Section */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Class and Name */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="inline-flex items-center px-4 py-2 rounded-2xl font-bold text-sm whitespace-nowrap shadow-lg bg-gradient-to-r from-emerald-100 to-teal-200 text-emerald-800 border border-emerald-300">
                {extractClassName(result.student_name)}
              </div>
              <h3 className="font-bold text-xl lg:text-2xl truncate text-slate-800">
                {extractStudentName(result.student_name)}
              </h3>
            </div>
            
            {/* Score and Stats */}
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-card border border-border shadow-sm">
                  <div className="text-2xl lg:text-3xl font-black text-foreground">
                    {displayScore}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">점수</p>
                  <p className="text-lg font-bold text-emerald-600">
                    {correctCount}/{totalCount} 정답
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/60 backdrop-blur border border-slate-200 shadow-sm">
                <Clock className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-600 whitespace-nowrap">
                  {formatDate(result.created_at)}
                </span>
            </div>
            </div>
          </div>
          
          {/* Action Buttons Section */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-2xl bg-white/60 backdrop-blur border border-slate-200 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all duration-300 shadow-sm hover:shadow-md"
              onClick={() => toggleRow(result.id)}
            >
              {expandedRows.has(result.id) ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </Button>

            {expandedRows.has(result.id) && canShowReport && (
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-2xl bg-white/60 backdrop-blur border border-slate-200 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all duration-300 shadow-sm hover:shadow-md"
                onClick={() => {
                  const ref = reportRefs.current[result.id];
                  const className = extractClassName(result.student_name);
                  const name = extractStudentName(result.student_name);
                  const fileName = `${test.title}_${className}_${name}`;
                  downloadAsJPG(ref, fileName);
                }}
              >
                <Image className="h-5 w-5" />
              </Button>
            )}

            <DeleteTestDialog 
              onDelete={handleDelete} 
              title={`결과 삭제`}
              description={`이 결과를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
            />
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expandedRows.has(result.id) && (
        <div className="relative z-10 mx-6 mb-6">
          <div className="rounded-3xl bg-white/80 backdrop-blur border border-white/50 shadow-xl overflow-hidden">
            {canShowReport ? (
              <div className="p-8">
                <div
                  ref={el => (reportRefs.current[result.id] = el)}
                  className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl border border-slate-100 shadow-lg overflow-hidden"
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
                </div>
              </div>
            ) : (
              <div className="p-6">
                <AnswersDisplay 
                  studentAnswers={result.student_answers} 
                  correctAnswers={test.answers} 
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestResultCard;

