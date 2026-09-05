import React, { useMemo, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, Cell } from 'recharts';
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GraduationCap, Award, Star, BookOpenCheck, Sparkles, Medal, TrendingUp, BarChart2, Users, Calendar, FileText, Target, Crown, Zap, Trophy, ChartPie, ChartNoAxesCombined, AlertTriangle, Check, X, Pencil, CheckCircle2, Loader2, Plus, Trash2, Triangle } from "lucide-react";
import { STANDARD_TEST_SECTIONS, HIGH_SCHOOL_ENTRANCE_TEST_SECTIONS } from "@/utils/testUtils/testDataProcessing";
import { calculateConsistentScore } from "@/utils/testUtils/scoreCalculation";
import { isSubjectiveAnswerCorrect } from "@/utils/testUtils/answerValidation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
interface TestReportProps {
  studentName: string;
  studentAnswers: Record<number, any>;
  correctAnswers: Record<number, any>;
  testDate: string;
  studentClass?: string;
  allResults?: Array<{
    score: number;
    student_answers: Record<number, any>;
  }>;
  testTitle?: string;
  testId?: string;
  resultId?: string;
  onDataUpdated?: () => void;
  reportTitle?: string | null;
  reportSubtitle?: string | null;
}
const THREE_POINT_QUESTIONS = [6, 13, 15, 21, 23, 29, 33, 34, 37, 39];
const calculateGrade = (score: number) => {
  if (score >= 90) return "1";
  if (score >= 80) return "2";
  if (score >= 70) return "3";
  if (score >= 60) return "4";
  if (score >= 50) return "5";
  if (score >= 40) return "6";
  if (score >= 30) return "7";
  if (score >= 20) return "8";
  return "9";
};
const getAchievementGrade = (percentage: number): string => {
  if (percentage === 100) return 'S';
  if (percentage >= 80) return 'A';
  if (percentage >= 60) return 'B';
  return 'C';
};
const getGradeColor = (grade: string): string => {
  switch (grade) {
    case 'S':
      return 'bg-purple-100 text-purple-800';
    case 'A':
      return 'bg-emerald-100 text-emerald-800';
    case 'B':
      return 'bg-blue-100 text-blue-800';
    case 'C':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
const calculateTop30Average = (scores: number[]): number => {
  if (scores.length === 0) return 0;
  if (scores.length === 1) return scores[0];
  const sortedScores = [...scores].sort((a, b) => b - a);
  const top30Count = Math.max(2, Math.ceil(sortedScores.length * 0.3));
  const finalCount = Math.min(top30Count, sortedScores.length);
  const top30Scores = sortedScores.slice(0, finalCount);
  const average = top30Scores.reduce((a, b) => a + b, 0) / finalCount;
  return Math.round(average);
};
const calculateTop30CutoffScore = (scores: number[]): number => {
  if (scores.length === 0) return 0;
  if (scores.length === 1) return scores[0];
  const sortedScores = [...scores].sort((a, b) => b - a);
  const top30Count = Math.ceil(sortedScores.length * 0.3);
  const cutoffIndex = Math.min(top30Count - 1, sortedScores.length - 1);
  return Math.round(sortedScores[cutoffIndex]);
};
const TestReport: React.FC<TestReportProps> = ({
  studentName,
  studentAnswers,
  correctAnswers,
  testDate,
  studentClass,
  allResults = [],
  testTitle,
  testId,
  resultId,
  onDataUpdated,
  reportTitle,
  reportSubtitle
}) => {
  // Local state mirrors so edits reflect instantly without parent refetch
  const [localCorrectAnswers, setLocalCorrectAnswers] = useState(correctAnswers);
  const [localStudentAnswers, setLocalStudentAnswers] = useState(studentAnswers);
  React.useEffect(() => { setLocalCorrectAnswers(correctAnswers); }, [correctAnswers]);
  React.useEffect(() => { setLocalStudentAnswers(studentAnswers); }, [studentAnswers]);

  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [editAnswerInputs, setEditAnswerInputs] = useState<string[]>(['']);
  const [isSaving, setIsSaving] = useState(false);

  // Edit student's own answer
  const [editingStudentQuestion, setEditingStudentQuestion] = useState<number | null>(null);
  const [editStudentAnswerInput, setEditStudentAnswerInput] = useState('');

  // Partial credit editing
  const [editingPartialQ, setEditingPartialQ] = useState<number | null>(null);
  const [partialPointsInput, setPartialPointsInput] = useState<string>('');

  // Compute full (max) points for a question with current correctAnswers context
  const getQuestionFullPoints = (qNum: number): number => {
    const hasCustom = Object.values(localCorrectAnswers).some((a: any) => a?.points !== undefined);
    if (hasCustom) return localCorrectAnswers[qNum]?.points ?? 2;
    const total = Object.keys(localCorrectAnswers).length;
    if (total === 45) return THREE_POINT_QUESTIONS.includes(qNum) ? 3 : 2;
    return total > 0 ? 100 / total : 0;
  };

  // Title / subtitle editing
  const isGrammar = Object.values(localCorrectAnswers).some((a: any) => a?.grammarCategory);
  const defaultTitle = isGrammar ? '브래니악 영어학원 문법 테스트 리포트' : '브래니악 영어학원 모의고사 성적 리포트';
  const defaultSubtitle = isGrammar ? 'Orun English Grammar Exam Score Report' : 'Orun English Mock Exam Score Report';
  const [localTitle, setLocalTitle] = useState<string>(reportTitle || defaultTitle);
  const [localSubtitle, setLocalSubtitle] = useState<string>(reportSubtitle || defaultSubtitle);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(localTitle);
  const [subtitleInput, setSubtitleInput] = useState(localSubtitle);
  React.useEffect(() => {
    const t = reportTitle || defaultTitle;
    const s = reportSubtitle || defaultSubtitle;
    setLocalTitle(t);
    setLocalSubtitle(s);
    setTitleInput(t);
    setSubtitleInput(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportTitle, reportSubtitle, isGrammar]);

  const handleSaveTitle = async () => {
    if (!testId) return;
    setIsSaving(true);
    try {
      const newTitle = titleInput.trim() || defaultTitle;
      const newSubtitle = subtitleInput.trim();
      const { error } = await supabase
        .from('tests')
        .update({ title: newTitle, subtitle: newSubtitle } as any)
        .eq('test_id', testId);
      if (error) throw error;
      setLocalTitle(newTitle);
      setLocalSubtitle(newSubtitle);
      setIsEditingTitle(false);
      toast({ title: '제목이 수정되었습니다', description: '같은 시험에 속한 모든 학생 리포트에 반영됩니다.' });
      onDataUpdated?.();
    } catch (e: any) {
      toast({ title: '저장 실패', description: e.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const canEdit = Boolean(testId && resultId);

  const openEditor = (qNum: number) => {
    const cur = localCorrectAnswers[qNum]?.answer;
    const raw = typeof cur === 'string' ? cur : String(cur ?? '');
    // Split by newline (primary) or comma fallback when no sentence-ending punctuation
    let arr: string[];
    if (raw.includes('\n')) {
      arr = raw.split(/\r?\n/);
    } else if (raw.includes(',') && !/[.!?]/.test(raw)) {
      arr = raw.split(',');
    } else {
      arr = [raw];
    }
    arr = arr.map((s) => s.trim()).filter((s, i, a) => s !== '' || a.length === 1);
    setEditAnswerInputs(arr.length > 0 ? arr : ['']);
    setEditingQuestion(qNum);
  };

  const openStudentAnswerEditor = (qNum: number) => {
    const cur = localStudentAnswers[qNum]?.answer;
    const val = Array.isArray(cur) ? cur.join(',') : (cur ?? '');
    setEditStudentAnswerInput(typeof val === 'string' ? val : String(val));
    setEditingStudentQuestion(qNum);
  };

  const handleSaveStudentAnswer = async () => {
    if (!resultId || editingStudentQuestion === null) return;
    setIsSaving(true);
    try {
      const current = localStudentAnswers[editingStudentQuestion] || {};
      const newStudentAnswers = {
        ...localStudentAnswers,
        [editingStudentQuestion]: { ...current, answer: editStudentAnswerInput }
      };
      const { error } = await supabase
        .from('test_results')
        .update({ student_answers: newStudentAnswers as any })
        .eq('id', resultId);
      if (error) throw error;
      setLocalStudentAnswers(newStudentAnswers);
      toast({ title: '학생 답안이 수정되었습니다', description: '재채점 결과가 즉시 반영됩니다.' });
      setEditingStudentQuestion(null);
      onDataUpdated?.();
    } catch (e: any) {
      toast({ title: '저장 실패', description: e.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  // Save: update tests.answers (adds extra accepted answers globally)
  const handleSaveCorrectAnswer = async () => {
    if (!testId || editingQuestion === null) return;
    setIsSaving(true);
    try {
      const joined = editAnswerInputs
        .map((s) => s.trim())
        .filter((s) => s !== '')
        .join('\n');
      const newCorrect = {
        ...localCorrectAnswers,
        [editingQuestion]: { ...localCorrectAnswers[editingQuestion], answer: joined }
      };
      const { error } = await supabase
        .from('tests')
        .update({ answers: newCorrect as any })
        .eq('test_id', testId);
      if (error) throw error;
      setLocalCorrectAnswers(newCorrect);
      toast({ title: '정답이 수정되었습니다', description: '모든 학생의 답안에 자동 재채점이 적용됩니다.' });
      setEditingQuestion(null);
      onDataUpdated?.();
    } catch (e: any) {
      toast({ title: '저장 실패', description: e.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  // Force-correct only this student's answer for this question
  const handleForceCorrect = async (qNum: number) => {
    if (!resultId) return;
    setIsSaving(true);
    try {
      const current = localStudentAnswers[qNum] || {};
      const isAlreadyForced = current.forcedCorrect === true;
      const newStudentAnswers = {
        ...localStudentAnswers,
        [qNum]: { ...current, forcedCorrect: !isAlreadyForced }
      };
      const { error } = await supabase
        .from('test_results')
        .update({ student_answers: newStudentAnswers as any })
        .eq('id', resultId);
      if (error) throw error;
      setLocalStudentAnswers(newStudentAnswers);
      toast({ title: isAlreadyForced ? '강제 정답이 해제되었습니다' : '강제 정답 처리되었습니다' });
      onDataUpdated?.();
    } catch (e: any) {
      toast({ title: '저장 실패', description: e.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle O/X by clicking the result mark. Optimistically updates UI then persists.
  const handleToggleCorrectness = async (qNum: number, currentlyCorrect: boolean) => {
    if (!resultId || isSaving) return;
    const current = localStudentAnswers[qNum] || {};
    const next = { ...current } as any;
    // Toggling O/X clears any partial credit
    delete next.partialPoints;
    if (currentlyCorrect) {
      // Mark as incorrect
      next.forcedIncorrect = true;
      delete next.forcedCorrect;
    } else {
      // Mark as correct
      next.forcedCorrect = true;
      delete next.forcedIncorrect;
    }
    const newStudentAnswers = { ...localStudentAnswers, [qNum]: next };
    // Optimistic update for instant feedback
    setLocalStudentAnswers(newStudentAnswers);
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('test_results')
        .update({ student_answers: newStudentAnswers as any })
        .eq('id', resultId);
      if (error) throw error;
      onDataUpdated?.();
    } catch (e: any) {
      // Revert on failure
      setLocalStudentAnswers(localStudentAnswers);
      toast({ title: '저장 실패', description: e.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const openPartialEditor = (qNum: number) => {
    const cur = localStudentAnswers[qNum]?.partialPoints;
    setPartialPointsInput(cur !== undefined ? String(cur) : '');
    setEditingPartialQ(qNum);
  };

  const handleSavePartial = async () => {
    if (!resultId || editingPartialQ === null) return;
    const value = parseFloat(partialPointsInput);
    if (isNaN(value) || value < 0) {
      toast({ title: '유효한 점수를 입력하세요', variant: 'destructive' });
      return;
    }
    const fullPts = getQuestionFullPoints(editingPartialQ);
    if (value > fullPts) {
      toast({ title: `최대 ${fullPts}점까지 입력 가능합니다`, variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    try {
      const current = { ...(localStudentAnswers[editingPartialQ] || {}) } as any;
      current.partialPoints = value;
      delete current.forcedCorrect;
      delete current.forcedIncorrect;
      const newStudentAnswers = { ...localStudentAnswers, [editingPartialQ]: current };
      const { error } = await supabase
        .from('test_results')
        .update({ student_answers: newStudentAnswers as any })
        .eq('id', resultId);
      if (error) throw error;
      setLocalStudentAnswers(newStudentAnswers);
      toast({ title: '부분점수가 저장되었습니다', description: `${value}점 부여` });
      setEditingPartialQ(null);
      onDataUpdated?.();
    } catch (e: any) {
      toast({ title: '저장 실패', description: e.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearPartial = async () => {
    if (!resultId || editingPartialQ === null) return;
    setIsSaving(true);
    try {
      const current = { ...(localStudentAnswers[editingPartialQ] || {}) } as any;
      delete current.partialPoints;
      const newStudentAnswers = { ...localStudentAnswers, [editingPartialQ]: current };
      const { error } = await supabase
        .from('test_results')
        .update({ student_answers: newStudentAnswers as any })
        .eq('id', resultId);
      if (error) throw error;
      setLocalStudentAnswers(newStudentAnswers);
      toast({ title: '부분점수가 해제되었습니다' });
      setEditingPartialQ(null);
      onDataUpdated?.();
    } catch (e: any) {
      toast({ title: '저장 실패', description: e.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const formatTestDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Determine if this is the high school entrance level test
  const isHighSchoolEntranceTest = testTitle && testTitle.includes('고등부 신입생 레벨테스트');
  const totalQuestionCount = Object.keys(localCorrectAnswers).length;
  const is45QuestionTest = totalQuestionCount === 45;

  // Choose the appropriate sections based on test type
  const SECTIONS = useMemo(() => {
    if (isHighSchoolEntranceTest && totalQuestionCount <= 22) {
      return HIGH_SCHOOL_ENTRANCE_TEST_SECTIONS;
    }
    return STANDARD_TEST_SECTIONS;
  }, [isHighSchoolEntranceTest, totalQuestionCount]);
  const results = useMemo(() => {
    // Use local (possibly edited) state
    const studentAnswers = localStudentAnswers;
    const correctAnswers = localCorrectAnswers;

    // Helper that respects forcedCorrect flag stored on student answer
    const checkCorrect = (qNum: number, sAns: any): boolean => {
      if (typeof studentAnswers[qNum]?.partialPoints === 'number') return false;
      if (studentAnswers[qNum]?.forcedIncorrect === true) return false;
      if (studentAnswers[qNum]?.forcedCorrect === true) return true;
      const correctAnswer = correctAnswers[qNum]?.answer;
      const questionType = correctAnswers[qNum]?.type;
      if (questionType === 'subjective') {
        return isSubjectiveAnswerCorrect(String(sAns), String(correctAnswer));
      }
      const correctAnswerArray = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
      const studentAnswerArray = Array.isArray(sAns) ? sAns : [sAns];
      const sortedCorrect = [...correctAnswerArray].sort((a, b) => a - b);
      const sortedStudent = [...studentAnswerArray].sort((a, b) => a - b);
      return sortedCorrect.length === sortedStudent.length && sortedCorrect.every((value, index) => value === sortedStudent[index]);
    };

    // Calculate current student's score using consistent calculation
    const currentStudentScore = calculateConsistentScore(studentAnswers, correctAnswers);

    // Calculate all scores using consistent calculation
    const allScores = allResults.map(result => calculateConsistentScore(result.student_answers, correctAnswers));
    const sectionResults = SECTIONS.map(section => {
      let sectionScore = 0;
      let correctCount = 0;
      const totalQuestions = section.range.length;
      let sectionMaxScore = 0;
      section.range.forEach(questionNumber => {
        const studentAnswer = studentAnswers[questionNumber]?.answer;
        const isCorrect = checkCorrect(questionNumber, studentAnswer);
        const totalQuestionCount = Object.keys(correctAnswers).length;
        const is45QuestionTest = totalQuestionCount === 45;
        const hasCustomPoints = Object.values(correctAnswers).some((answer: any) => answer.points !== undefined);
        const partial = studentAnswers[questionNumber]?.partialPoints;
        const hasPartial = typeof partial === 'number';
        if (hasCustomPoints) {
          // Use custom points
          const points = correctAnswers[questionNumber]?.points || 2;
          sectionMaxScore += points;
          if (hasPartial) {
            sectionScore += partial;
          } else if (isCorrect) {
            correctCount++;
            sectionScore += points;
          }
        } else if (is45QuestionTest) {
          // For 45-question tests without custom points, use the special point system
          const points = THREE_POINT_QUESTIONS.includes(questionNumber) ? 3 : 2;
          sectionMaxScore += points;
          if (hasPartial) {
            sectionScore += partial;
          } else if (isCorrect) {
            correctCount++;
            sectionScore += points;
          }
        } else {
          // For other tests, use the equal distribution method
          const pointsPerQuestion = 100 / totalQuestionCount;
          sectionMaxScore += pointsPerQuestion;
          if (hasPartial) {
            sectionScore += partial;
          } else if (isCorrect) {
            correctCount++;
            sectionScore += pointsPerQuestion;
          }
        }
      });

      // Calculate section scores for all results using consistent calculation
      const allSectionScores = allResults.map(result => {
        let score = 0;
        section.range.forEach(questionNumber => {
          const studentAnswer = result.student_answers[questionNumber]?.answer;
          const correctAnswer = correctAnswers[questionNumber]?.answer;
          const questionType = correctAnswers[questionNumber]?.type;
          let isCorrect = false;
          if (questionType === 'subjective') {
            isCorrect = isSubjectiveAnswerCorrect(String(studentAnswer), String(correctAnswer));
          } else {
            // For multiple choice, check if arrays are equal
            const correctAnswerArray = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
            const studentAnswerArray = Array.isArray(studentAnswer) ? studentAnswer : [studentAnswer];
            const sortedCorrect = [...correctAnswerArray].sort((a, b) => a - b);
            const sortedStudent = [...studentAnswerArray].sort((a, b) => a - b);
            isCorrect = sortedCorrect.length === sortedStudent.length && sortedCorrect.every((value, index) => value === sortedStudent[index]);
          }
          const totalQuestionCount = Object.keys(correctAnswers).length;
          const is45QuestionTest = totalQuestionCount === 45;
          const hasCustomPoints = Object.values(correctAnswers).some((answer: any) => answer.points !== undefined);
          if (hasCustomPoints) {
            if (isCorrect) {
              score += correctAnswers[questionNumber]?.points || 2;
            }
          } else if (is45QuestionTest) {
            if (isCorrect) {
              score += THREE_POINT_QUESTIONS.includes(questionNumber) ? 3 : 2;
            }
          } else {
            if (isCorrect) {
              score += 100 / totalQuestionCount;
            }
          }
        });
        return Math.round(score);
      });
      const sectionAvg = allSectionScores.length > 0 ? Math.round(allSectionScores.reduce((a, b) => a + b, 0) / allSectionScores.length) : 0;
      const sectionTop30Cutoff = calculateTop30CutoffScore(allSectionScores);
      return {
        name: section.name,
        score: sectionScore,
        maxScore: sectionMaxScore,
        correctCount,
        totalQuestions,
        percentage: sectionScore / sectionMaxScore * 100,
        average: sectionAvg,
        top30: sectionTop30Cutoff
      };
    });
    const totalScore = Math.round(currentStudentScore);
    const totalCorrect = sectionResults.reduce((acc, section) => acc + section.correctCount, 0);
    const testQuestionsCount = isHighSchoolEntranceTest && totalQuestionCount <= 22 ? 22 : 45;
    const average = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;
    const top30Score = calculateTop30CutoffScore(allScores);
    const highestScore = allScores.length > 0 ? Math.max(...allScores) : totalScore;
    const wrongAnswerRates = Array.from({
      length: testQuestionsCount
    }, (_, idx) => {
      const questionNumber = idx + 1;
      const correctAnswer = correctAnswers[questionNumber]?.answer;
      const questionType = correctAnswers[questionNumber]?.type;
      if (!correctAnswer) {
        return {
          questionNumber,
          rate: 0,
          isCorrect: false
        };
      }
      const wrongCount = allResults.filter(result => {
        const studentAnswer = result.student_answers[questionNumber]?.answer;
        if (questionType === 'subjective') {
          return !isSubjectiveAnswerCorrect(String(studentAnswer), String(correctAnswer));
        } else {
          // For multiple choice, check if arrays are equal
          const correctAnswerArray = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
          const studentAnswerArray = Array.isArray(studentAnswer) ? studentAnswer : [studentAnswer];
          const sortedCorrect = [...correctAnswerArray].sort((a, b) => a - b);
          const sortedStudent = [...studentAnswerArray].sort((a, b) => a - b);
          return !(sortedCorrect.length === sortedStudent.length && sortedCorrect.every((value, index) => value === sortedStudent[index]));
        }
      }).length;
      const rate = allResults.length > 0 ? wrongCount / allResults.length * 100 : 0;
      const isCorrect = checkCorrect(questionNumber, studentAnswers[questionNumber]?.answer);
      // Find section name for this question
      const sectionName = SECTIONS.find(section => section.range.includes(questionNumber))?.name || '';
      return {
        questionNumber,
        rate,
        isCorrect,
        sectionName
      };
    }).filter(item => correctAnswers[item.questionNumber]?.answer);
    const top3WrongAnswers = wrongAnswerRates.sort((a, b) => b.rate - a.rate).slice(0, 3);

    // Calculate rank
    const sortedScores = [...allScores].sort((a, b) => b - a);
    const rank = sortedScores.findIndex(score => score <= totalScore) + 1;
    const totalParticipants = allScores.length;

    // Round all scores to integers when returning the final results
    return {
      sections: sectionResults.map(section => ({
        ...section,
        score: Math.round(section.score),
        average: Math.round(section.average),
        top30: Math.round(section.top30)
      })),
      total: {
        score: Math.round(totalScore),
        maxScore: 100,
        correctCount: totalCorrect,
        totalQuestions: testQuestionsCount,
        percentage: Math.round(totalScore),
        average: Math.round(average),
        top30Score: Math.round(top30Score),
        highestScore: Math.round(highestScore),
        grade: calculateGrade(Math.round(totalScore)),
        wrongAnswerTop3: top3WrongAnswers,
        rank,
        totalParticipants
      }
    };
  }, [localStudentAnswers, localCorrectAnswers, allResults, SECTIONS, isHighSchoolEntranceTest, totalQuestionCount]);
  const chartData = results.sections.map(section => ({
    subject: section.name,
    score: Math.round(section.percentage)
  }));
  const scoreComparisonData = [{
    name: "내 점수",
    value: results.total.score,
    fill: "url(#scoreGradient2)"
  }, {
    name: "응시자 평균",
    value: results.total.average,
    fill: "url(#avgGradient2)"
  }, {
    name: "상위 30%",
    value: results.total.top30Score,
    fill: "url(#top30Gradient)"
  }];

  // Determine max questions count for grid
  const maxQuestionsCount = isHighSchoolEntranceTest && totalQuestionCount <= 22 ? 22 : 45;
  return <div className="bg-white">
      <div className="max-w-6xl mx-auto p-2 sm:p-4 md:p-6 space-y-2 sm:space-y-4">
        {/* Compact Premium Header */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-slate-800 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-700/30 via-transparent to-slate-900/40" />
          
          <div className="relative z-10 p-3 sm:p-5">
            {/* Top Row: Logo, Title, Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1 sm:p-1.5 bg-white/10 rounded-lg sm:rounded-xl border border-white/20 shrink-0">
                  <img src="/lovable-uploads/5b56e2a6-a232-40de-90c5-6d82faab51f6.png" alt="Logo" className="h-8 w-8 sm:h-10 sm:w-10 rounded-md sm:rounded-lg object-cover" />
                </div>
                <div className="min-w-0">
                  {isEditingTitle && canEdit ? (
                    <div className="space-y-1.5 print:hidden">
                      <Input
                        value={titleInput}
                        onChange={(e) => setTitleInput(e.target.value)}
                        placeholder="제목"
                        className="h-7 sm:h-8 text-sm sm:text-base font-bold bg-white/95 text-slate-800"
                      />
                      <Input
                        value={subtitleInput}
                        onChange={(e) => setSubtitleInput(e.target.value)}
                        placeholder="부제"
                        className="h-6 sm:h-7 text-[10px] sm:text-xs bg-white/95 text-slate-700"
                      />
                      <div className="flex gap-1.5">
                        <Button size="sm" className="h-6 px-2 text-[10px]" onClick={handleSaveTitle} disabled={isSaving}>
                          {isSaving && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}저장
                        </Button>
                        <Button size="sm" variant="outline" className="h-6 px-2 text-[10px]" onClick={() => { setIsEditingTitle(false); setTitleInput(localTitle); setSubtitleInput(localSubtitle); }} disabled={isSaving}>
                          취소
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="group/title flex items-start gap-1.5">
                      <div className="min-w-0">
                        <h1 className="font-bold text-sm sm:text-xl text-white tracking-tight leading-tight">
                          {localTitle}
                        </h1>
                        {localSubtitle && (
                          <p className="text-slate-300 text-[10px] sm:text-xs">
                            {localSubtitle}
                          </p>
                        )}
                      </div>
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => setIsEditingTitle(true)}
                          title="제목/부제 수정"
                          className="print:hidden p-1 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white transition-colors shrink-0"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-amber-400/20 to-yellow-400/20 border border-amber-300/40 self-start sm:self-auto shrink-0">
                <Crown className="h-3 w-3 sm:h-4 sm:w-4 text-amber-400" />
                <span className="text-[10px] sm:text-xs font-semibold text-amber-100 whitespace-nowrap">
                  {isHighSchoolEntranceTest ? 'ORUN Entrance Test' : Object.values(correctAnswers).some((a: any) => a?.grammarCategory) ? 'ORUN Grammar Report' : 'ORUN KSAT Report'}
                </span>
              </div>
            </div>
            
            {/* Student Info: Responsive Grid */}
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
                <p className="text-xs sm:text-sm font-bold text-white leading-relaxed">{formatTestDate(testDate)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Score Overview */}
        <div className="rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-lg overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-stretch">
            {/* Total Score - Accent Section */}
            <div className="shrink-0 sm:w-40 md:w-48 bg-gradient-to-br from-blue-600 to-indigo-700 p-3 sm:p-5 flex flex-row sm:flex-col items-center sm:items-start justify-between sm:justify-center">
              <p className="text-blue-100 text-[10px] sm:text-xs font-medium uppercase tracking-wide sm:mb-1">총점</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-5xl font-black text-white">{results.total.score}</span>
                <span className="text-blue-200 text-xs sm:text-sm">/ {results.total.maxScore}점</span>
              </div>
            </div>
            
            {/* Other Stats - Clean Grid */}
            <div className="flex-1 grid grid-cols-3 divide-x divide-slate-100">
              <div className="p-2 sm:p-4 flex flex-col items-center justify-center">
                <p className="text-slate-500 text-[10px] sm:text-xs font-medium uppercase tracking-wide mb-0.5 sm:mb-1">등급</p>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl sm:text-3xl font-bold text-slate-800">{results.total.grade}</span>
                  <span className="text-slate-400 text-[10px] sm:text-sm">등급</span>
                </div>
              </div>
              
              <div className="p-2 sm:p-4 flex flex-col items-center justify-center">
                <p className="text-slate-500 text-[10px] sm:text-xs font-medium uppercase tracking-wide mb-0.5 sm:mb-1">평균</p>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl sm:text-3xl font-bold text-slate-800">{results.total.average}</span>
                  <span className="text-slate-400 text-[10px] sm:text-sm">점</span>
                </div>
              </div>
              
              <div className="p-2 sm:p-4 flex flex-col items-center justify-center">
                <p className="text-slate-500 text-[10px] sm:text-xs font-medium uppercase tracking-wide mb-0.5 sm:mb-1">상위 30%</p>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl sm:text-3xl font-bold text-slate-800">{results.total.top30Score}</span>
                  <span className="text-slate-400 text-[10px] sm:text-sm">점</span>
                </div>
      </div>
            </div>
          </div>
        </div>

        {/* Section Performance - Compact Design (45문제 시험만 표시) */}
        {is45QuestionTest && <div className="rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-3 sm:px-5 py-3 sm:py-4 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shrink-0">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-lg font-bold text-slate-800">영역별 성취도</h2>
                  <p className="text-slate-500 text-[10px] sm:text-xs">Section-wise Achievement Analysis</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                <div className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-purple-100 border border-purple-200">
                  <Trophy className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-600" />
                  <span className="text-[9px] sm:text-xs font-bold text-purple-700">S: 100%</span>
                </div>
                <div className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-emerald-100 border border-emerald-200">
                  <span className="text-[9px] sm:text-xs font-bold text-emerald-700">A: 80~99%</span>
                </div>
                <div className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-blue-100 border border-blue-200">
                  <span className="text-[9px] sm:text-xs font-bold text-blue-700">B: 60~79%</span>
                </div>
                <div className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-amber-100 border border-amber-200">
                  <span className="text-[9px] sm:text-xs font-bold text-amber-700">C: ~59%</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Overall Feedback - Compact */}
          <div className="mx-3 sm:mx-5 mt-3 sm:mt-4 p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl border border-blue-100">
            <div className="flex items-start gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm">💬</span>
              <p className="text-[10px] sm:text-xs text-blue-700 leading-relaxed">
                {(() => {
                const score = results.total.score;
                const percentage = score / results.total.maxScore * 100;
                if (percentage >= 90) {
                  return "매우 우수한 성과입니다! 꾸준한 학습으로 현재 실력을 유지하며 더욱 발전시켜 나가시기 바랍니다.";
                } else if (percentage >= 80) {
                  return "우수한 성적입니다. 조금 더 노력하면 최상위권 진입이 가능합니다.";
                } else if (percentage >= 70) {
                  return "양호한 수준의 성적입니다. 약한 영역을 보완하여 더 높은 성과를 기대할 수 있습니다.";
                } else if (percentage >= 60) {
                  return "기본기는 갖추어져 있습니다. 체계적인 복습과 추가 학습이 필요합니다.";
                } else {
                  return "기초 실력 향상을 위한 집중적인 학습이 필요합니다. 차근차근 기본기부터 다져나가시기 바랍니다.";
                }
              })()}
              </p>
            </div>
          </div>
          
          {/* Table - Compact */}
          <div className="p-2 sm:p-5 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-100 border-b border-slate-200">
                  <TableHead className="font-bold text-[10px] sm:text-sm text-slate-700 py-2 sm:py-2.5 whitespace-nowrap">영역</TableHead>
                  <TableHead className="text-center font-bold text-[10px] sm:text-sm text-slate-700 py-2 sm:py-2.5 whitespace-nowrap">배점</TableHead>
                  <TableHead className="text-center font-bold text-[10px] sm:text-sm text-slate-700 py-2 sm:py-2.5 whitespace-nowrap">득점</TableHead>
                  <TableHead className="text-center font-bold text-[10px] sm:text-sm text-slate-700 py-2 sm:py-2.5 whitespace-nowrap">성취도</TableHead>
                  <TableHead className="text-center font-bold text-[10px] sm:text-sm text-slate-700 py-2 sm:py-2.5 whitespace-nowrap hidden sm:table-cell">평균</TableHead>
                  <TableHead className="text-center font-bold text-[10px] sm:text-sm text-slate-700 py-2 sm:py-2.5 whitespace-nowrap hidden sm:table-cell">상위30%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.sections.map((section, index) => {
                const achievementGrade = getAchievementGrade(section.percentage);
                const gradeColor = getGradeColor(achievementGrade);
                return <TableRow key={index} className="hover:bg-blue-50/50 transition-colors border-b border-slate-100">
                    <TableCell className="font-semibold text-[10px] sm:text-sm text-slate-800 py-2 sm:py-3 whitespace-nowrap">{section.name}</TableCell>
                    <TableCell className="text-center text-[10px] sm:text-sm font-medium text-slate-600 py-2 sm:py-3">{Math.round(section.maxScore)}점</TableCell>
                    <TableCell className="text-center text-[10px] sm:text-sm font-bold text-blue-600 py-2 sm:py-3">{Math.round(section.score)}점</TableCell>
                    <TableCell className="text-center py-2 sm:py-3">
                      <div className={`inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg text-[10px] sm:text-sm font-bold ${gradeColor}`}>
                        {achievementGrade}
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-[10px] sm:text-sm font-medium text-slate-600 py-2 sm:py-3 hidden sm:table-cell">{section.average}점</TableCell>
                    <TableCell className="text-center text-[10px] sm:text-sm font-medium text-slate-600 py-2 sm:py-3 hidden sm:table-cell">{section.top30}점</TableCell>
                  </TableRow>;
              })}
              </TableBody>
            </Table>
          </div>
        </div>}

        {/* Analysis Cards Grid - Premium Design (45문제 시험만 표시) */}
        {is45QuestionTest && <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Radar Chart Card */}
          <div className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-xl border border-slate-200/60 hover:shadow-2xl transition-all duration-500">
            {/* Header */}
            <div className="relative px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 shadow-lg">
                  <ChartPie className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-xl font-bold text-slate-800">영역별 분석</h3>
                  <p className="text-slate-500 font-medium text-[10px] sm:text-xs tracking-wide">Performance Radar</p>
                </div>
              </div>
            </div>
            
            {/* Chart */}
            <div className="relative px-3 sm:px-4 py-4 sm:py-6">
              <div className="h-[180px] sm:h-[240px] bg-gradient-to-b from-slate-50/50 to-white rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-slate-100/80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={chartData} margin={{
                  top: 15,
                  right: 25,
                  bottom: 15,
                  left: 25
                }}>
                    <PolarGrid stroke="#E2E8F0" strokeWidth={1} />
                    <PolarAngleAxis dataKey="subject" tick={{
                    fill: '#64748B',
                    fontSize: 9,
                    fontWeight: 600
                  }} />
                    <Radar name="점수" dataKey="score" stroke="#8B5CF6" fill="url(#radarGradient)" fillOpacity={0.6} strokeWidth={2.5} dot={{
                    fill: '#8B5CF6',
                    strokeWidth: 2,
                    r: 4,
                    stroke: '#fff'
                  }} />
                    <defs>
                      <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#A78BFA" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#6366F1" stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Analysis Footer */}
            <div className="relative px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-50 via-violet-50 to-indigo-50 rounded-xl border border-purple-100/80">
                <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                  <div className="w-1 h-4 sm:h-5 rounded-full bg-gradient-to-b from-purple-500 to-indigo-500" />
                  <h4 className="text-xs sm:text-sm font-bold text-purple-800">성취도 분석</h4>
                </div>
                <div className="text-[10px] sm:text-xs text-purple-700/90 leading-relaxed pl-3 space-y-1">
                  {results.sections.length > 0 && (() => {
                  if (results.total.score === 100) {
                    return <p>🎉 완벽한 점수입니다! 모든 영역에서 균형 잡힌 실력을 보여주셨습니다. 현재 수준을 유지하면서 심화 학습에 도전해 보세요.</p>;
                  }
                  const bestSection = results.sections.reduce((prev, current) => current.correctCount / current.totalQuestions > prev.correctCount / prev.totalQuestions ? current : prev);
                  const worstSection = results.sections.reduce((prev, current) => current.correctCount / current.totalQuestions < prev.correctCount / prev.totalQuestions ? current : prev);
                  const bestPercentage = Math.round(bestSection.correctCount / bestSection.totalQuestions * 100);
                  const worstPercentage = Math.round(worstSection.correctCount / worstSection.totalQuestions * 100);
                  const strongSections = results.sections.filter(s => Math.round(s.correctCount / s.totalQuestions * 100) >= 80);
                  const weakSections = results.sections.filter(s => Math.round(s.correctCount / s.totalQuestions * 100) < 60);
                  return <>
                      <p><span className="font-semibold text-purple-800">강점 영역:</span> {bestSection.name} ({bestPercentage}%) - 이 영역에서 뛰어난 이해도를 보여주고 있습니다.</p>
                      <p><span className="font-semibold text-purple-800">보완 영역:</span> {worstSection.name} ({worstPercentage}%) - 해당 영역의 기본 개념 복습과 추가 연습이 필요합니다.</p>
                      {weakSections.length > 1 && <p className="text-purple-600/80">💡 {weakSections.map(s => s.name).join(', ')} 영역을 중점적으로 학습하세요.</p>}
                    </>;
                })()}
                </div>
              </div>
            </div>
          </div>

          {/* Bar Chart Card */}
          <div className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-xl border border-slate-200/60 hover:shadow-2xl transition-all duration-500">
            {/* Header */}
            <div className="relative px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-700 shadow-lg">
                  <ChartNoAxesCombined className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-xl font-bold text-slate-800">점수 비교</h3>
                  <p className="text-slate-500 font-medium text-[10px] sm:text-xs tracking-wide">Score Comparison</p>
                </div>
              </div>
              {/* Legend */}
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600" />
                  <span className="text-[10px] sm:text-xs text-slate-600 font-medium">내 점수</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-slate-400 to-slate-500" />
                  <span className="text-[10px] sm:text-xs text-slate-600 font-medium">응시자 평균</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600" />
                  <span className="text-[10px] sm:text-xs text-slate-600 font-medium">상위 30%</span>
                </div>
              </div>
            </div>
            
            {/* Chart */}
            <div className="relative px-3 sm:px-4 py-4 sm:py-6">
              <div className="h-[180px] sm:h-[240px] bg-gradient-to-b from-slate-50/50 to-white rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-slate-100/80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreComparisonData} margin={{
                  top: 25,
                  right: 10,
                  left: -5,
                  bottom: 5
                }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" strokeWidth={1} vertical={false} />
                    <XAxis dataKey="name" tick={{
                    fill: '#64748B',
                    fontSize: 10,
                    fontWeight: 600
                  }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{
                    fill: '#94A3B8',
                    fontSize: 9,
                    fontWeight: 500
                  }} axisLine={false} tickLine={false} width={25} />
                    <Tooltip contentStyle={{
                    fontSize: '12px',
                    fontWeight: 600,
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                    border: 'none',
                    background: 'rgba(255, 255, 255, 0.98)'
                  }} formatter={(value: number) => [`${value}점`, '']} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {scoreComparisonData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                      <LabelList dataKey="value" position="top" fill="#1E293B" fontSize={12} fontWeight={700} />
                    </Bar>
                    <defs>
                      <linearGradient id="scoreGradient2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#1E40AF" />
                      </linearGradient>
                      <linearGradient id="avgGradient2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#94A3B8" />
                        <stop offset="100%" stopColor="#64748B" />
                      </linearGradient>
                      <linearGradient id="top30Gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#34D399" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Analysis Footer */}
            <div className="relative px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 via-sky-50 to-cyan-50 rounded-xl border border-blue-100/80">
                <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                  <div className="w-1 h-4 sm:h-5 rounded-full bg-gradient-to-b from-blue-500 to-cyan-500" />
                  <h4 className="text-xs sm:text-sm font-bold text-blue-800">비교 분석</h4>
                </div>
                <div className="text-[10px] sm:text-xs text-blue-700/90 leading-relaxed pl-3 space-y-1">
                  {(() => {
                  const myScore = results.total.score;
                  const average = results.total.average;
                  const difference = myScore - average;
                  const percentile = difference > 20 ? "상위 10%" : difference > 10 ? "상위 30%" : difference > 0 ? "평균 이상" : difference >= -10 ? "평균 수준" : "평균 이하";
                  if (difference > 0) {
                    return <>
                        <p><span className="font-semibold text-blue-800">내 점수:</span> {myScore}점 (평균 대비 <span className="text-emerald-600 font-bold">+{difference}점</span>)</p>
                        <p><span className="font-semibold text-blue-800">예상 위치:</span> {percentile} - 우수한 성적입니다! 현재 학습 방법을 유지하세요.</p>
                      </>;
                  } else if (difference === 0) {
                    return <>
                        <p><span className="font-semibold text-blue-800">내 점수:</span> {myScore}점 (응시자 평균과 동일)</p>
                        <p><span className="font-semibold text-blue-800">학습 제안:</span> 평균 수준입니다. 약점 영역을 보완하면 상위권 진입이 가능합니다.</p>
                      </>;
                  } else {
                    return <>
                        <p><span className="font-semibold text-blue-800">내 점수:</span> {myScore}점 (평균 대비 <span className="text-rose-600 font-bold">{difference}점</span>)</p>
                        <p><span className="font-semibold text-blue-800">학습 제안:</span> 기초 개념 복습과 꾸준한 문제 풀이로 점수 향상을 목표로 하세요.</p>
                      </>;
                  }
                })()}
                </div>
              </div>
            </div>
          </div>

          {/* Top Wrong Answers Card */}
          <div className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-xl border border-slate-200/60 hover:shadow-2xl transition-all duration-500">
            {/* Header */}
            <div className="relative px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-orange-600 shadow-lg">
                  <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-xl font-bold text-slate-800">오답률 TOP3</h3>
                  <p className="text-slate-500 font-medium text-[10px] sm:text-xs tracking-wide">Difficult Questions</p>
                </div>
              </div>
            </div>
            
            {/* Table */}
            <div className="relative px-3 sm:px-4 py-4 sm:py-6">
              <div className="space-y-2 sm:space-y-3">
                {results.total.wrongAnswerTop3.map((item, index) => <div key={index} className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all duration-300">
                    {/* Rank */}
                    <div className="shrink-0">
                      <div className="flex items-center justify-center h-7 w-7 sm:h-9 sm:w-9 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 font-semibold text-xs sm:text-sm">
                        {index + 1}
                      </div>
                    </div>
                    {/* Question Number & Section */}
                    <div className="flex-1 flex items-center gap-2 sm:gap-3">
                      <div className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-slate-100 to-slate-50 border border-slate-200 whitespace-nowrap">
                        <span className="text-slate-500 text-[10px] sm:text-xs font-medium">문항</span>
                        <span className="text-slate-800 text-sm sm:text-base font-bold">{item.questionNumber}</span>
                      </div>
                      {item.sectionName && <span className="px-2 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-600 text-[9px] sm:text-[10px] font-medium whitespace-nowrap">
                          {item.sectionName}
                        </span>}
                    </div>
                    {/* Result */}
                    <div className="shrink-0">
                      {item.isCorrect ? <div className="flex items-center justify-center h-9 w-9 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-200">
                          <Check className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
                        </div> : <div className="flex items-center justify-center h-9 w-9 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-lg shadow-rose-200">
                          <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
                        </div>}
                    </div>
                  </div>)}
              </div>
            </div>
            
            {/* Analysis Footer */}
            <div className="relative px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="p-3 sm:p-4 bg-gradient-to-r from-rose-50 via-pink-50 to-orange-50 rounded-xl border border-rose-100/80">
                <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                  <div className="w-1 h-4 sm:h-5 rounded-full bg-gradient-to-b from-rose-500 to-orange-500" />
                  <h4 className="text-xs sm:text-sm font-bold text-rose-800">오답 분석</h4>
                </div>
                <div className="text-[10px] sm:text-xs text-rose-700/90 leading-relaxed pl-3 space-y-1">
                  {(() => {
                  const correctCount = results.total.wrongAnswerTop3.filter(item => item.isCorrect).length;
                  const totalDifficult = results.total.wrongAnswerTop3.length;
                  const wrongItems = results.total.wrongAnswerTop3.filter(item => !item.isCorrect);
                  const wrongSections = [...new Set(wrongItems.map(item => item.sectionName).filter(Boolean))];
                  if (correctCount === totalDifficult) {
                    return <>
                        <p>🎯 <span className="font-semibold text-rose-800">뛰어난 실력!</span> 다른 학생들이 많이 틀린 고난도 문제를 모두 맞혔습니다.</p>
                        <p className="text-rose-600/80">심화 문제와 실전 모의고사로 실력을 더욱 다져보세요.</p>
                      </>;
                  } else if (correctCount === 0) {
                    return <>
                        <p><span className="font-semibold text-rose-800">집중 학습 필요:</span> 고난도 문항을 모두 틀렸습니다.</p>
                        {wrongSections.length > 0 && <p><span className="font-semibold text-rose-800">취약 영역:</span> {wrongSections.join(', ')} - 해당 영역의 개념 정리와 유형별 연습이 필요합니다.</p>}
                        <p className="text-rose-600/80">💡 틀린 문제의 해설을 꼼꼼히 확인하고 오답노트를 작성하세요.</p>
                      </>;
                  } else {
                    return <>
                        <p><span className="font-semibold text-rose-800">정답률:</span> {correctCount}/{totalDifficult}개 - 일부 고난도 문항을 맞혔습니다.</p>
                        {wrongSections.length > 0 && <p><span className="font-semibold text-rose-800">복습 영역:</span> {wrongSections.join(', ')} 영역의 추가 학습이 필요합니다.</p>}
                        <p className="text-rose-600/80">💡 틀린 문항의 유형을 분석하고 유사 문제를 반복 연습하세요.</p>
                      </>;
                  }
                })()}
                </div>
              </div>
            </div>
          </div>
        </div>}

        {/* Question-by-Question Results - Compact Grid Layout */}
        <div className="relative overflow-hidden rounded-lg sm:rounded-xl bg-gradient-to-br from-white to-slate-50/50 shadow-md border border-slate-200/50">
          <div className="p-2 sm:p-3">
            <div className="flex items-center gap-1.5 mb-1.5 sm:mb-2">
              <div className="p-1 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm shrink-0">
                <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-800">문항별 채점 결과</h3>
            </div>
            
            {/* Grid Layout like reference image */}
            <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-12 gap-1 sm:gap-2">
              {Array.from({
              length: maxQuestionsCount
            }, (_, i) => i + 1).map(questionNumber => {
              const studentAnswer = localStudentAnswers[questionNumber]?.answer;
              const correctAnswer = localCorrectAnswers[questionNumber]?.answer;
              const questionType = localCorrectAnswers[questionNumber]?.type;
              const forcedCorrect = localStudentAnswers[questionNumber]?.forcedCorrect === true;
              const forcedIncorrect = localStudentAnswers[questionNumber]?.forcedIncorrect === true;
              const partialPts = localStudentAnswers[questionNumber]?.partialPoints;
              const isPartial = typeof partialPts === 'number';
              if (!correctAnswer) {
                return null;
              }
              let isCorrect = false;
              if (isPartial) {
                isCorrect = false;
              } else if (forcedIncorrect) {
                isCorrect = false;
              } else if (forcedCorrect) {
                isCorrect = true;
              } else if (questionType === 'subjective') {
                isCorrect = isSubjectiveAnswerCorrect(String(studentAnswer), String(correctAnswer));
              } else {
                const correctAnswerArray = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
                const studentAnswerArray = Array.isArray(studentAnswer) ? studentAnswer : [studentAnswer];
                const sortedCorrect = [...correctAnswerArray].sort((a, b) => a - b);
                const sortedStudent = [...studentAnswerArray].sort((a, b) => a - b);
                isCorrect = sortedCorrect.length === sortedStudent.length && sortedCorrect.every((value, index) => value === sortedStudent[index]);
              }
              const formatAnswer = (answer: any) => {
                if (answer === undefined || answer === null || answer === '') return '-';
                if (Array.isArray(answer)) {
                  return answer.join(',');
                }
                return String(answer);
              };
              const fullPts = getQuestionFullPoints(questionNumber);
              return <div key={questionNumber} className={`group flex flex-col items-center p-1.5 sm:p-2 rounded-md ${isPartial ? 'bg-amber-50' : isCorrect ? 'bg-white' : 'bg-rose-50'}`}>
                    {localCorrectAnswers[questionNumber]?.grammarCategory && (
                      <span 
                        className={`text-[7px] sm:text-[8px] font-semibold mb-1 truncate w-full text-center px-1.5 py-0.5 rounded-full border ${
                          isPartial
                            ? 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border-amber-200/60'
                            : isCorrect 
                            ? 'bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-600 border-indigo-200/60' 
                            : 'bg-gradient-to-r from-rose-50 to-pink-50 text-rose-600 border-rose-200/60'
                        }`} 
                        title={localCorrectAnswers[questionNumber].grammarCategory}
                      >
                        {localCorrectAnswers[questionNumber].grammarCategory}
                      </span>
                    )}
                    <span className="text-[10px] sm:text-xs text-slate-400 mb-0.5">{questionNumber}</span>
                    <span
                      role={canEdit ? 'button' : undefined}
                      title={canEdit ? '클릭하여 O/X 변경' : undefined}
                      onClick={canEdit ? () => handleToggleCorrectness(questionNumber, isCorrect) : undefined}
                      className={`text-base sm:text-xl font-bold ${isPartial ? 'text-amber-500' : isCorrect ? 'text-blue-500' : 'text-rose-500'} ${canEdit ? 'cursor-pointer hover:scale-110 transition-transform select-none print:cursor-default print:hover:scale-100' : ''}`}
                    >
                      {isPartial ? '△' : isCorrect ? 'O' : 'X'}
                    </span>
                    {forcedCorrect && (
                      <span className="text-[8px] sm:text-[9px] font-semibold text-emerald-600 mt-0.5">정답처리</span>
                    )}
                    {isPartial && (
                      <span className="text-[8px] sm:text-[9px] font-semibold text-amber-600 mt-0.5">
                        부분 {partialPts}/{fullPts}점
                      </span>
                    )}
                    <div className="mt-0.5 text-[9px] sm:text-[10px] text-center">
                      <div>
                        <span className={isPartial ? 'text-amber-600' : isCorrect ? 'text-slate-500' : 'text-rose-500'}>선택: </span>
                        <span className={isPartial ? 'text-amber-700 font-medium' : isCorrect ? 'text-slate-600' : 'text-rose-600 font-medium'}>{formatAnswer(studentAnswer)}</span>
                      </div>
                      <div>
                        <span className="text-blue-400">정답: </span>
                        <span className="text-blue-500 font-medium">{formatAnswer(correctAnswer)}</span>
                      </div>
                    </div>
                    {canEdit && questionType === 'subjective' && !isSaving && (
                      <div className="mt-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                        <button
                          type="button"
                          onClick={() => openStudentAnswerEditor(questionNumber)}
                          title="학생 답안 수정"
                          className="p-1 rounded-md bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-600 transition-colors"
                        >
                          <Pencil className="h-2.5 w-2.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditor(questionNumber)}
                          title="추가 정답 등록"
                          className="p-1 rounded-md bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 transition-colors"
                        >
                          <Pencil className="h-2.5 w-2.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleForceCorrect(questionNumber)}
                          disabled={isSaving}
                          title={forcedCorrect ? '강제 정답 해제' : '이 학생만 강제 정답 처리'}
                          className={`p-1 rounded-md border transition-colors ${forcedCorrect ? 'bg-emerald-100 border-emerald-300 text-emerald-700 hover:bg-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'}`}
                        >
                          <CheckCircle2 className="h-2.5 w-2.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openPartialEditor(questionNumber)}
                          disabled={isSaving}
                          title={isPartial ? `부분점수 수정 (현재 ${partialPts}/${fullPts}점)` : `부분점수 부여 (배점 ${fullPts}점)`}
                          className={`p-1 rounded-md border transition-colors ${isPartial ? 'bg-amber-100 border-amber-300 text-amber-700 hover:bg-amber-200' : 'bg-yellow-50 border-yellow-200 text-yellow-600 hover:bg-yellow-100'}`}
                        >
                          <Triangle className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    )}
                  </div>;
            })}
            </div>
          </div>
        </div>

        {/* Copyright Notice */}
        <div className="mt-6 pt-4 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-500 font-medium">
            © {new Date().getFullYear()} BRAINIAC ENGLISH. All rights reserved.
          </p>
        </div>
      </div>

      {/* Edit Correct Answer Dialog */}
      <Dialog open={editingQuestion !== null} onOpenChange={(o) => !o && setEditingQuestion(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>주관식 정답 수정 (문항 {editingQuestion})</DialogTitle>
            <DialogDescription>
              여러 정답을 인정하려면 아래 <strong>+ 정답 추가</strong> 버튼으로 칸을 추가하세요. 각 칸이 하나의 인정 정답입니다.
              <br />이 변경은 <strong>모든 학생</strong>의 답안에 자동 재채점됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2 max-h-[50vh] overflow-y-auto">
            {editAnswerInputs.map((val, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <div className="flex flex-col items-center pt-2 shrink-0">
                  <span className="text-[10px] font-semibold text-slate-500">#{idx + 1}</span>
                </div>
                <textarea
                  value={val}
                  onChange={(e) => {
                    const next = [...editAnswerInputs];
                    next[idx] = e.target.value;
                    setEditAnswerInputs(next);
                  }}
                  placeholder={`정답 ${idx + 1}`}
                  rows={2}
                  autoFocus={idx === 0}
                  className="flex-1 min-h-[44px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                  onClick={() => {
                    const next = editAnswerInputs.filter((_, i) => i !== idx);
                    setEditAnswerInputs(next.length > 0 ? next : ['']);
                  }}
                  disabled={editAnswerInputs.length <= 1}
                  title="이 정답 삭제"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditAnswerInputs([...editAnswerInputs, ''])}
              className="w-full border-dashed"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />정답 추가
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingQuestion(null)} disabled={isSaving}>취소</Button>
            <Button onClick={handleSaveCorrectAnswer} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Student Answer Dialog */}
      <Dialog open={editingStudentQuestion !== null} onOpenChange={(o) => !o && setEditingStudentQuestion(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>학생 답안 수정 (문항 {editingStudentQuestion})</DialogTitle>
            <DialogDescription>
              학생이 작성한 답안을 직접 수정합니다. 정답과 일치하면 자동으로 정답 처리됩니다.
              <br />이 변경은 <strong>이 학생의 답안</strong>에만 적용됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Input
              value={editStudentAnswerInput}
              onChange={(e) => setEditStudentAnswerInput(e.target.value)}
              placeholder="학생 답안 입력"
              autoFocus
            />
            {editingStudentQuestion !== null && (
              <p className="text-xs text-slate-500">
                정답: <span className="font-medium text-blue-600">{String(localCorrectAnswers[editingStudentQuestion]?.answer ?? '')}</span>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingStudentQuestion(null)} disabled={isSaving}>취소</Button>
            <Button onClick={handleSaveStudentAnswer} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Partial Credit Dialog */}
      <Dialog open={editingPartialQ !== null} onOpenChange={(o) => !o && setEditingPartialQ(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>부분점수 부여 (문항 {editingPartialQ})</DialogTitle>
            <DialogDescription>
              원래 배점은 <strong>{editingPartialQ !== null ? getQuestionFullPoints(editingPartialQ) : 0}점</strong>입니다. 부여할 부분점수를 입력하세요.
              <br />부분점수가 적용되면 결과 표시가 △로 바뀝니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Input
              type="number"
              min={0}
              max={editingPartialQ !== null ? getQuestionFullPoints(editingPartialQ) : undefined}
              step="0.5"
              value={partialPointsInput}
              onChange={(e) => setPartialPointsInput(e.target.value)}
              placeholder={`예: 3 (최대 ${editingPartialQ !== null ? getQuestionFullPoints(editingPartialQ) : 0}점)`}
              autoFocus
            />
          </div>
          <DialogFooter className="flex sm:justify-between gap-2">
            <Button
              variant="outline"
              onClick={handleClearPartial}
              disabled={isSaving || editingPartialQ === null || typeof localStudentAnswers[editingPartialQ!]?.partialPoints !== 'number'}
              className="text-rose-600 border-rose-200 hover:bg-rose-50"
            >
              부분점수 해제
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditingPartialQ(null)} disabled={isSaving}>취소</Button>
              <Button onClick={handleSavePartial} disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}저장
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
};
export default TestReport;