import React, { useState } from 'react';
import { CheckCircle, XCircle, FileText, Crown, Users, GraduationCap, Calendar, Check, X, Award } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface WritingResult {
  questionNum: number;
  korean: string;
  english: string;
  studentAnswer: string;
  isCorrect: boolean;
  partialScore?: number;
  partialScoreReason?: string;
}

interface WritingTestReportProps {
  studentName: string;
  studentClass: string;
  testTitle: string;
  score: number;
  correct: number;
  total: number;
  results: WritingResult[];
  testDate: string;
  isAdmin?: boolean;
  onPartialScoreUpdate?: (questionNum: number, partialScore: number, reason: string) => void;
}

// 단어 단위로 diff 비교하여 맞은 부분/틀린 부분 구분
const diffWords = (studentAnswer: string, correctAnswer: string) => {
  const studentWords = studentAnswer.trim().split(/\s+/);
  const correctWords = correctAnswer.trim().split(/\s+/);

  const correctDiff: { word: string; match: boolean }[] = [];
  const studentDiff: { word: string; match: boolean }[] = [];

  const lcsMatrix: number[][] = Array(studentWords.length + 1)
    .fill(null)
    .map(() => Array(correctWords.length + 1).fill(0));

  for (let i = 1; i <= studentWords.length; i++) {
    for (let j = 1; j <= correctWords.length; j++) {
      if (studentWords[i - 1].toLowerCase().replace(/[.,!?;:'"]/g, '') === correctWords[j - 1].toLowerCase().replace(/[.,!?;:'"]/g, '')) {
        lcsMatrix[i][j] = lcsMatrix[i - 1][j - 1] + 1;
      } else {
        lcsMatrix[i][j] = Math.max(lcsMatrix[i - 1][j], lcsMatrix[i][j - 1]);
      }
    }
  }

  const studentMatched = new Set<number>();
  const correctMatched = new Set<number>();
  let i = studentWords.length, j = correctWords.length;
  while (i > 0 && j > 0) {
    if (studentWords[i - 1].toLowerCase().replace(/[.,!?;:'"]/g, '') === correctWords[j - 1].toLowerCase().replace(/[.,!?;:'"]/g, '')) {
      studentMatched.add(i - 1);
      correctMatched.add(j - 1);
      i--; j--;
    } else if (lcsMatrix[i - 1][j] > lcsMatrix[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  studentWords.forEach((word, idx) => {
    studentDiff.push({ word, match: studentMatched.has(idx) });
  });

  correctWords.forEach((word, idx) => {
    correctDiff.push({ word, match: correctMatched.has(idx) });
  });

  return { studentDiff, correctDiff };
};

// Calculate writing test score accounting for partial scores
export const calculateWritingScore = (results: WritingResult[], total: number) => {
  if (total === 0) return { score: 0, correct: 0 };
  const perQuestion = 100 / total;
  let totalPoints = 0;
  let correctCount = 0;

  results.forEach(r => {
    if (r.isCorrect) {
      totalPoints += perQuestion;
      correctCount++;
    } else if (r.partialScore && r.partialScore > 0) {
      totalPoints += r.partialScore;
    }
  });

  return { score: Math.round(totalPoints), correct: correctCount };
};

const WritingTestReport: React.FC<WritingTestReportProps> = ({
  studentName,
  studentClass,
  testTitle,
  score,
  correct,
  total,
  results,
  testDate,
  isAdmin = false,
  onPartialScoreUpdate
}) => {
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [tempScore, setTempScore] = useState('');
  const [tempReason, setTempReason] = useState('');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getGrade = (s: number) => {
    if (s >= 90) return { grade: 'S', color: 'text-amber-500', bg: 'bg-gradient-to-br from-amber-50 to-yellow-50', border: 'border-amber-200' };
    if (s >= 80) return { grade: 'A', color: 'text-emerald-600', bg: 'bg-gradient-to-br from-emerald-50 to-green-50', border: 'border-emerald-200' };
    if (s >= 70) return { grade: 'B', color: 'text-blue-600', bg: 'bg-gradient-to-br from-blue-50 to-indigo-50', border: 'border-blue-200' };
    if (s >= 60) return { grade: 'C', color: 'text-purple-600', bg: 'bg-gradient-to-br from-purple-50 to-violet-50', border: 'border-purple-200' };
    return { grade: 'D', color: 'text-slate-500', bg: 'bg-gradient-to-br from-slate-50 to-gray-50', border: 'border-slate-200' };
  };

  const perQuestionMax = total > 0 ? Math.round((100 / total) * 10) / 10 : 0;

  // Recalculate score with partial scores
  const { score: calculatedScore } = calculateWritingScore(results, total);
  const displayScore = calculatedScore;

  // Count effective correct (partial scores count as fractional)
  const partialScoreSum = results
    .filter(r => !r.isCorrect && r.partialScore && r.partialScore > 0)
    .reduce((sum, r) => sum + (r.partialScore || 0), 0);
  const effectiveCorrectCount = correct + (total > 0 ? partialScoreSum / (100 / total) : 0);

  const gradeInfo = getGrade(displayScore);
  const incorrectResults = results.filter(r => !r.isCorrect);

  const startEditing = (result: WritingResult) => {
    setEditingQuestion(result.questionNum);
    setTempScore(result.partialScore?.toString() || '');
    setTempReason(result.partialScoreReason || '');
  };

  const savePartialScore = (questionNum: number) => {
    const scoreVal = parseFloat(tempScore) || 0;
    const clampedScore = Math.min(Math.max(scoreVal, 0), perQuestionMax);
    onPartialScoreUpdate?.(questionNum, clampedScore, tempReason);
    setEditingQuestion(null);
    setTempScore('');
    setTempReason('');
  };

  const cancelEditing = () => {
    setEditingQuestion(null);
    setTempScore('');
    setTempReason('');
  };

  return (
    <div className="bg-white">
      <div className="max-w-6xl mx-auto p-2 sm:p-4 md:p-6 space-y-2 sm:space-y-4">
        {/* Premium Header */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-slate-800 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-700/30 via-transparent to-slate-900/40" />
          
          <div className="relative z-10 p-3 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1 sm:p-1.5 bg-white/10 rounded-lg sm:rounded-xl border border-white/20 shrink-0">
                  <img src="/lovable-uploads/5b56e2a6-a232-40de-90c5-6d82faab51f6.png" alt="Logo" className="h-8 w-8 sm:h-10 sm:w-10 rounded-md sm:rounded-lg object-cover" />
                </div>
                <div className="min-w-0">
                  <h1 className="font-bold text-sm sm:text-xl text-white tracking-tight leading-tight">브래니악 영어학원 영작 테스트 리포트</h1>
                  <p className="text-slate-300 text-[10px] sm:text-xs">Orun English Writing Test Report</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-emerald-400/20 to-teal-400/20 border border-emerald-300/40 self-start sm:self-auto shrink-0">
                <Crown className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-400" />
                <span className="text-[10px] sm:text-xs font-semibold text-emerald-100 whitespace-nowrap">Writing Test</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <div className="px-2 sm:px-3 pt-2 pb-3 sm:pt-3 sm:pb-4 rounded-lg sm:rounded-xl bg-white/10 border border-white/15">
                <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5 sm:mb-1">
                  <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-300" />
                  <span className="text-[9px] sm:text-[10px] text-slate-300 uppercase tracking-wide">학생 이름</span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-white leading-relaxed">{studentName || '-'}</p>
              </div>
              
              <div className="px-2 sm:px-3 pt-2 pb-3 sm:pt-3 sm:pb-4 rounded-lg sm:rounded-xl bg-white/10 border border-white/15">
                <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5 sm:mb-1">
                  <GraduationCap className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-300" />
                  <span className="text-[9px] sm:text-[10px] text-slate-300 uppercase tracking-wide">소속반</span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-white leading-relaxed">{studentClass || '-'}</p>
              </div>
              
              <div className="px-2 sm:px-3 pt-2 pb-3 sm:pt-3 sm:pb-4 rounded-lg sm:rounded-xl bg-white/10 border border-white/15">
                <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5 sm:mb-1">
                  <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-purple-300" />
                  <span className="text-[9px] sm:text-[10px] text-slate-300 uppercase tracking-wide">시험명</span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-white leading-relaxed break-words">{testTitle || '-'}</p>
              </div>
              
              <div className="px-2 sm:px-3 pt-2 pb-3 sm:pt-3 sm:pb-4 rounded-lg sm:rounded-xl bg-slate-700/80 border border-slate-600">
                <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5 sm:mb-1">
                  <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-300" />
                  <span className="text-[9px] sm:text-[10px] text-slate-300 uppercase tracking-wide">시행일자</span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-white leading-relaxed">{formatDate(testDate)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Score Overview Bar */}
        <div className="rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-lg overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-stretch">
            <div className="shrink-0 sm:w-40 md:w-48 bg-gradient-to-br from-emerald-600 to-teal-700 p-3 sm:p-5 flex flex-row sm:flex-col items-center sm:items-start justify-between sm:justify-center">
              <p className="text-emerald-100 text-[10px] sm:text-xs font-medium uppercase tracking-wide sm:mb-1">총점</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-5xl font-black text-white">{displayScore}</span>
                <span className="text-emerald-200 text-xs sm:text-sm">/ 100점</span>
              </div>
            </div>
            
            <div className="flex-1 grid grid-cols-2 divide-x divide-slate-100">
              <div className="p-2 sm:p-4 flex flex-col items-center justify-center">
                <p className="text-slate-500 text-[10px] sm:text-xs font-medium uppercase tracking-wide mb-0.5 sm:mb-1">정답</p>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl sm:text-3xl font-bold text-slate-800">{correct}</span>
                  <span className="text-slate-400 text-[10px] sm:text-sm">/{total}</span>
                </div>
              </div>
              
              <div className="p-2 sm:p-4 flex flex-col items-center justify-center">
                <p className="text-slate-500 text-[10px] sm:text-xs font-medium uppercase tracking-wide mb-0.5 sm:mb-1">정답률</p>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl sm:text-3xl font-bold text-slate-800">{displayScore}</span>
                  <span className="text-slate-400 text-[10px] sm:text-sm">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Answer Grid */}
        <div className="rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-lg overflow-hidden">
          <div className="px-3 sm:px-5 py-3 sm:py-4 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shrink-0">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm sm:text-lg font-bold text-slate-800">문항별 채점 결과</h2>
                <p className="text-slate-500 text-[10px] sm:text-xs">Question-by-Question Results</p>
              </div>
            </div>
          </div>
          <div className="p-3 sm:p-5">
            <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 gap-1.5">
              {results.map((result) => {
                const hasPartial = !result.isCorrect && result.partialScore && result.partialScore > 0;
                return (
                  <div
                    key={result.questionNum}
                    className={`flex flex-col items-center justify-center py-1.5 rounded-lg border ${
                      result.isCorrect
                        ? 'bg-emerald-50 border-emerald-200'
                        : hasPartial
                          ? 'bg-amber-50 border-amber-200'
                          : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">{result.questionNum}.</span>
                    {result.isCorrect ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : hasPartial ? (
                      <span className="text-[10px] font-bold text-amber-600">△</span>
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Incorrect Answers with Word-level Diff */}
        {incorrectResults.length > 0 && (
          <div className="rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-lg overflow-hidden">
            <div className="px-3 sm:px-5 py-3 sm:py-4 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shrink-0">
                    <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-lg font-bold text-slate-800">오답 분석</h2>
                    <p className="text-slate-500 text-[10px] sm:text-xs">Incorrect Answer Analysis</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full border border-red-100">
                  {incorrectResults.length}문항
                </span>
              </div>
            </div>
            
            <div className="p-3 sm:p-5 space-y-3">
              {incorrectResults.map((result) => {
                const { studentDiff, correctDiff } = diffWords(result.studentAnswer || '', result.english);
                const hasPartial = result.partialScore && result.partialScore > 0;
                const isEditing = editingQuestion === result.questionNum;

                return (
                  <div
                    key={result.questionNum}
                    className="rounded-xl border border-slate-200 overflow-hidden"
                  >
                    {/* Question header */}
                    <div className="px-3 sm:px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-start gap-2.5">
                      <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-lg flex items-center justify-center text-[11px] font-bold shadow-sm">
                        {result.questionNum}
                      </span>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium flex-1">{result.korean}</p>
                      {hasPartial && (
                        <span className="flex-shrink-0 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          +{result.partialScore}점
                        </span>
                      )}
                    </div>

                    {/* Student answer with word-level highlighting */}
                    <div className="px-3 sm:px-4 py-2.5 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="flex-shrink-0 text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded mt-0.5 border border-red-100">학생</span>
                        <div className="flex-1 bg-red-50/50 px-2.5 py-2 rounded-lg border border-red-100">
                          <p className="text-xs sm:text-sm leading-relaxed break-all">
                            {result.studentAnswer ? studentDiff.map((item, idx) => (
                              <span
                                key={idx}
                                className={item.match
                                  ? 'text-emerald-600 font-medium'
                                  : 'text-red-600 bg-red-100 rounded px-0.5 font-semibold underline decoration-red-300 decoration-wavy'
                                }
                              >
                                {idx > 0 ? ' ' : ''}{item.word}
                              </span>
                            )) : <span className="text-slate-400 italic">미작성</span>}
                          </p>
                        </div>
                      </div>

                      {/* Correct answer with word-level highlighting */}
                      <div className="flex items-start gap-2">
                        <span className="flex-shrink-0 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mt-0.5 border border-emerald-100">정답</span>
                        <div className="flex-1 bg-emerald-50/50 px-2.5 py-2 rounded-lg border border-emerald-100">
                          <p className="text-xs sm:text-sm leading-relaxed break-all">
                            {correctDiff.map((item, idx) => (
                              <span
                                key={idx}
                                className={item.match
                                  ? 'text-emerald-600 font-medium'
                                  : 'text-blue-600 bg-blue-100 rounded px-0.5 font-semibold'
                                }
                              >
                                {idx > 0 ? ' ' : ''}{item.word}
                              </span>
                            ))}
                          </p>
                        </div>
                      </div>

                      {/* Partial score display (for non-editing state) */}
                      {hasPartial && !isEditing && (
                        <div className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded mt-0.5 border border-amber-200">부분점수</span>
                          <div className="flex-1 bg-amber-50/50 px-2.5 py-2 rounded-lg border border-amber-100">
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-bold text-amber-700">+{result.partialScore}점</span>
                              {result.partialScoreReason && (
                                <span className="text-xs text-amber-600">| {result.partialScoreReason}</span>
                              )}
                            </div>
                          </div>
                          {isAdmin && onPartialScoreUpdate && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-[10px] text-slate-400 hover:text-amber-600 shrink-0"
                              onClick={() => startEditing(result)}
                            >
                              수정
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Partial score editing */}
                      {isAdmin && onPartialScoreUpdate && isEditing && (
                        <div className="flex items-start gap-2 mt-1">
                          <span className="flex-shrink-0 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded mt-0.5 border border-amber-200">부분점수</span>
                          <div className="flex-1 space-y-1.5">
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min={0}
                                max={perQuestionMax}
                                step={0.1}
                                value={tempScore}
                                onChange={(e) => setTempScore(e.target.value)}
                                className="w-20 h-7 text-xs"
                                placeholder="점수"
                              />
                              <span className="text-[10px] text-slate-400">/ {perQuestionMax}점</span>
                            </div>
                            <Textarea
                              value={tempReason}
                              onChange={(e) => setTempReason(e.target.value)}
                              className="text-xs min-h-[40px] resize-none"
                              placeholder="부분점수 사유를 입력하세요 (예: 쉼표만 빠짐)"
                              rows={2}
                            />
                            <div className="flex gap-1.5">
                              <Button
                                size="sm"
                                className="h-7 px-3 text-[10px] bg-amber-500 hover:bg-amber-600 text-white"
                                onClick={() => savePartialScore(result.questionNum)}
                              >
                                저장
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-3 text-[10px] text-slate-500"
                                onClick={cancelEditing}
                              >
                                취소
                              </Button>
                              {hasPartial && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-3 text-[10px] text-red-500 hover:text-red-700"
                                  onClick={() => {
                                    onPartialScoreUpdate(result.questionNum, 0, '');
                                    cancelEditing();
                                  }}
                                >
                                  삭제
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Add partial score button (when no partial score yet and not editing) */}
                      {isAdmin && onPartialScoreUpdate && !hasPartial && !isEditing && (
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2.5 text-[10px] text-slate-400 hover:text-amber-600 hover:bg-amber-50 gap-1"
                            onClick={() => startEditing(result)}
                          >
                            <Award className="h-3 w-3" />
                            부분점수 부여
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="px-3 sm:px-5 pb-4 flex flex-wrap items-center gap-3 text-[10px] sm:text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-2.5 bg-red-100 border border-red-300 rounded-sm"></span>
                <span>틀린 부분</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-2.5 bg-blue-100 border border-blue-300 rounded-sm"></span>
                <span>누락/변경된 부분</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-2.5 bg-emerald-100 border border-emerald-300 rounded-sm"></span>
                <span>일치하는 부분</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-2.5 bg-amber-100 border border-amber-300 rounded-sm"></span>
                <span>부분점수</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 pb-1 text-center">
          <p className="text-[10px] text-black">© {new Date().getFullYear()} BRAINIAC ENGLISH. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default WritingTestReport;
