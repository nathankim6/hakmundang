import React, { useState, useMemo, useRef } from 'react';
import { Search, User, X, GraduationCap, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TestResult, Test } from '@/types/results';
import { extractClassName, extractStudentName, formatDate } from '@/utils/resultsUtils';
import { isSubjectiveAnswerCorrect } from '@/utils/testUtils/answerValidation';
import TestReport from '@/components/TestReport';
import WritingTestReport, { calculateWritingScore } from '@/components/WritingTestReport';
import AnswersDisplay from './AnswersDisplay';
import { calculateConsistentScore } from '@/utils/testUtils/scoreCalculation';

interface StudentSearchFilterProps {
  results: TestResult[];
  tests: Test[];
}

interface StudentTestRecord {
  result: TestResult;
  test: Test;
  correctCount: number;
  totalCount: number;
}

const StudentSearchFilter = ({ results, tests }: StudentSearchFilterProps) => {
  const [searchClass, setSearchClass] = useState('');
  const [searchName, setSearchName] = useState('');
  const [expandedResultId, setExpandedResultId] = useState<string | null>(null);
  const reportRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Calculate correct count for a result
  const calculateCorrectCount = (studentAnswers: Record<number, any>, correctAnswers: Record<number, any>): { correct: number; total: number } => {
    const studentAnswersAny = studentAnswers as any;
    if (studentAnswersAny?.testFormat === 'writing') {
      const resultsList = studentAnswersAny?.results || [];
      const correctCount = resultsList.filter((r: any) => r.isCorrect).length;
      return { correct: correctCount, total: resultsList.length };
    }
    
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
        const correctAnswerArray = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
        const studentAnswerArray = Array.isArray(studentAnswer) ? studentAnswer : [studentAnswer];
        const sortedCorrect = [...correctAnswerArray].sort((a, b) => a - b);
        const sortedStudent = [...studentAnswerArray].sort((a, b) => a - b);
        isCorrect = sortedCorrect.length === sortedStudent.length &&
                    sortedCorrect.every((value, index) => value === sortedStudent[index]);
      }

      if (isCorrect) count++;
    }

    return { correct: count, total };
  };

  // Filter and group results by student
  const filteredStudentRecords = useMemo(() => {
    const searchClassLower = searchClass.toLowerCase().trim();
    const searchNameLower = searchName.toLowerCase().trim();

    if (!searchClassLower && !searchNameLower) {
      return [];
    }

    const matchingRecords: StudentTestRecord[] = [];

    results.forEach(result => {
      const className = extractClassName(result.student_name).toLowerCase();
      const studentName = extractStudentName(result.student_name).toLowerCase();
      
      const classMatch = !searchClassLower || className.includes(searchClassLower);
      const nameMatch = !searchNameLower || studentName.includes(searchNameLower);

      if (classMatch && nameMatch) {
        const test = tests.find(t => t.testId === result.test_id);
        if (test) {
          const { correct, total } = calculateCorrectCount(result.student_answers, test.answers);
          matchingRecords.push({
            result,
            test,
            correctCount: correct,
            totalCount: total
          });
        }
      }
    });

    // Sort by date (newest first)
    return matchingRecords.sort((a, b) => 
      new Date(b.result.created_at).getTime() - new Date(a.result.created_at).getTime()
    );
  }, [results, tests, searchClass, searchName]);

  // Group by student name
  const groupedByStudent = useMemo(() => {
    const groups: Record<string, StudentTestRecord[]> = {};
    
    filteredStudentRecords.forEach(record => {
      const fullName = record.result.student_name;
      if (!groups[fullName]) {
        groups[fullName] = [];
      }
      groups[fullName].push(record);
    });

    return groups;
  }, [filteredStudentRecords]);

  const hasSearchInput = searchClass.trim() || searchName.trim();

  const toggleExpand = (resultId: string) => {
    setExpandedResultId(prev => prev === resultId ? null : resultId);
  };

  return (
    <div className="bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 rounded-xl border border-indigo-200 shadow-sm p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow">
          <Search className="h-3.5 w-3.5 text-white" />
        </div>
        <h3 className="text-sm font-semibold text-indigo-900">학생 검색</h3>
        <span className="text-xs text-indigo-500">반 또는 이름으로 검색</span>
      </div>

      {/* Search Inputs */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <GraduationCap className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-indigo-400" />
          <Input
            placeholder="반 검색 (예: 3ad, top)"
            value={searchClass}
            onChange={(e) => setSearchClass(e.target.value)}
            className="pl-8 h-8 text-sm border-indigo-200 focus:border-indigo-400 bg-white/80"
          />
        </div>
        <div className="relative flex-1">
          <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-indigo-400" />
          <Input
            placeholder="이름 검색 (예: 김, 민수)"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="pl-8 h-8 text-sm border-indigo-200 focus:border-indigo-400 bg-white/80"
          />
        </div>
        {hasSearchInput && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchClass('');
              setSearchName('');
              setExpandedResultId(null);
            }}
            className="shrink-0 h-8 text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-100"
          >
            초기화
          </Button>
        )}
      </div>

      {/* Search Results */}
      {hasSearchInput && (
        <div className="border-t border-indigo-200 pt-4">
          {Object.keys(groupedByStudent).length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-indigo-700 mb-2">
                총 <span className="font-semibold text-violet-600">{Object.keys(groupedByStudent).length}명</span>의 학생, 
                <span className="font-semibold text-violet-600"> {filteredStudentRecords.length}개</span>의 시험 결과
                <span className="text-xs text-indigo-500 ml-2">(클릭하면 리포트를 볼 수 있습니다)</span>
              </p>
              
              {Object.entries(groupedByStudent).map(([studentName, records]) => (
                <div 
                  key={studentName} 
                  className="bg-white rounded-xl border border-indigo-100 overflow-hidden shadow-sm"
                >
                  {/* Student Header */}
                  <div className="bg-gradient-to-r from-indigo-100 via-violet-50 to-purple-50 px-4 py-3 border-b border-indigo-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-violet-600" />
                      </div>
                      <span className="font-semibold text-indigo-900">
                        {extractStudentName(studentName)}
                      </span>
                      <Badge variant="outline" className="bg-white border-indigo-200 text-indigo-700">
                        {extractClassName(studentName)}
                      </Badge>
                      <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 ml-auto">
                        {records.length}개 시험
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Test Results List */}
                  <div className="divide-y divide-indigo-50">
                    {records.map((record) => {
                      const isExpanded = expandedResultId === record.result.id;
                      const studentAnswersAny = record.result.student_answers as any;
                      const isWritingTest = studentAnswersAny?.testFormat === 'writing';
                      const displayScore = isWritingTest
                        ? calculateWritingScore(studentAnswersAny?.results || [], record.totalCount).score
                        : Math.round(calculateConsistentScore(record.result.student_answers, record.test.answers));
                      
                      return (
                        <div key={record.result.id}>
                          <div 
                            className="px-4 py-3 hover:bg-indigo-50/50 transition-colors cursor-pointer"
                            onClick={() => toggleExpand(record.result.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-indigo-400 shrink-0" />
                                <div>
                                  <p className="font-medium text-indigo-900 truncate">
                                    {record.test.title}
                                  </p>
                                  <p className="text-xs text-indigo-500/70 mt-0.5">
                                    {formatDate(record.result.created_at)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 ml-4">
                                <span className="text-sm text-indigo-600">
                                  {record.correctCount}/{record.totalCount}
                                </span>
                                <span className={`font-bold text-lg ${
                                  displayScore >= 80 ? 'text-emerald-600' : 
                                  displayScore >= 60 ? 'text-amber-600' : 
                                  'text-red-500'
                                }`}>
                                  {displayScore}점
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-indigo-400 hover:text-violet-600 hover:bg-violet-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpand(record.result.id);
                                  }}
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Expanded Report View */}
                          {isExpanded && (
                            <div className="bg-slate-50 p-4 border-t border-indigo-100">
                              {isWritingTest ? (
                                <div 
                                  ref={el => (reportRefs.current[record.result.id] = el)}
                                  className="relative overflow-hidden bg-white border border-slate-200/60 rounded-2xl shadow-lg"
                                >
                                  <WritingTestReport
                                    studentName={extractStudentName(record.result.student_name)}
                                    studentClass={extractClassName(record.result.student_name)}
                                    testTitle={record.test.title}
                                    score={displayScore}
                                    correct={record.correctCount}
                                    total={record.totalCount}
                                    results={studentAnswersAny?.results || []}
                                    testDate={record.result.created_at}
                                  />
                                </div>
                              ) : record.result.total_count === 45 ? (
                                <div 
                                  ref={el => (reportRefs.current[record.result.id] = el)}
                                  className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50/30 to-blue-50/20 
                                           border border-slate-200/60 rounded-3xl shadow-lg p-6"
                                >
                                  <TestReport
                                    studentName={extractStudentName(record.result.student_name)}
                                    studentClass={extractClassName(record.result.student_name)}
                                    testTitle={record.test.title}
                                    studentAnswers={record.result.student_answers}
                                    correctAnswers={record.test.answers}
                                    testDate={record.result.created_at}
                                    allResults={results.filter(r => r.test_id === record.test.testId)}
                                    testId={record.test.testId}
                                    resultId={record.result.id}
                                  />
                                </div>
                              ) : (
                                <div className="bg-white rounded-xl p-4 border border-slate-200">
                                  <AnswersDisplay 
                                    studentAnswers={record.result.student_answers} 
                                    correctAnswers={record.test.answers} 
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 mb-3">
                <Search className="h-6 w-6 text-indigo-400" />
              </div>
              <p className="text-indigo-700">검색 결과가 없습니다</p>
              <p className="text-sm text-indigo-500 mt-1">다른 검색어를 입력해보세요</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default StudentSearchFilter;
