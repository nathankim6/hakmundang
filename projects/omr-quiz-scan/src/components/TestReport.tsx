import React, { useMemo, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, Cell, LineChart, Line } from 'recharts';
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GraduationCap, Award, Star, BookOpenCheck, Sparkles, Medal, TrendingUp, BarChart2, Users, Calendar, FileText, Target, Crown, Zap, Trophy, ChartPie, ChartNoAxesCombined, AlertTriangle, Check, X, HelpCircle, Pencil, CheckCircle2, Loader2, Plus, Trash2, Triangle, Activity, ArrowUpRight, ShieldAlert } from "lucide-react";
import { IconStudent, IconClass, IconPaper, IconDate, IconScoreSeal, IconLaurel, IconSegments, IconCompare, IconFlag, IconGrid, IconPulse, IconTrend, IconWeak, IconGrowth } from "@/components/report/ReportIcons";
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

interface StudentHistoryRecord {
  id: string;
  testId: string;
  testTitle: string;
  createdAt: string;
  studentAnswers: Record<number, any>;
  correctAnswers: Record<number, any>;
  score: number;
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
      return 'bg-[#C5A059] text-white border border-[#C5A059]';
    case 'A':
      return 'bg-report-ink text-white border border-report-ink';
    case 'B':
      return 'bg-slate-100 text-slate-700 border border-slate-200';
    case 'C':
      return 'bg-white text-slate-500 border border-slate-200';
    default:
      return 'bg-muted text-muted-foreground border border-border';
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
  const [studentHistory, setStudentHistory] = useState<StudentHistoryRecord[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  React.useEffect(() => { setLocalCorrectAnswers(correctAnswers); }, [correctAnswers]);
  React.useEffect(() => { setLocalStudentAnswers(studentAnswers); }, [studentAnswers]);

  React.useEffect(() => {
    const identity = studentName.trim();
    if (!identity) {
      setStudentHistory([]);
      return;
    }

    let isActive = true;
    const loadStudentHistory = async () => {
      setIsHistoryLoading(true);
      try {
        const { data: historyRows, error: historyError } = await supabase
          .from('test_results')
          .select('id, test_id, student_name, student_answers, created_at')
          .ilike('student_name', `%${identity}`)
          .order('created_at', { ascending: false })
          .limit(10);
        if (historyError) throw historyError;

        const testIds = [...new Set((historyRows || []).map((row) => row.test_id))];
        if (testIds.length === 0) {
          if (isActive) setStudentHistory([]);
          return;
        }

        const { data: testRows, error: testsError } = await supabase
          .from('tests')
          .select('test_id, title, answers')
          .in('test_id', testIds);
        if (testsError) throw testsError;

        const testsById = new Map((testRows || []).map((test) => [test.test_id, test]));
        const normalized = (historyRows || []).flatMap((row) => {
          const historyTest = testsById.get(row.test_id);
          if (!historyTest?.answers || !row.student_answers) return [];
          const historyAnswers = historyTest.answers as Record<number, any>;
          const historyStudentAnswers = row.student_answers as Record<number, any>;
          return [{
            id: row.id,
            testId: row.test_id,
            testTitle: historyTest.title,
            createdAt: row.created_at,
            studentAnswers: historyStudentAnswers,
            correctAnswers: historyAnswers,
            score: Math.round(calculateConsistentScore(historyStudentAnswers, historyAnswers))
          }];
        });
        if (isActive) setStudentHistory(normalized);
      } catch (error) {
        console.error('[TestReport] Failed to load recent student history:', error);
        if (isActive) setStudentHistory([]);
      } finally {
        if (isActive) setIsHistoryLoading(false);
      }
    };

    void loadStudentHistory();
    return () => { isActive = false; };
  }, [studentName, resultId]);

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
  const defaultTitle = isGrammar ? '옳은영어 문법 테스트 리포트' : '옳은영어 영어 성취도 진단 리포트';
  const defaultSubtitle = isGrammar ? 'Orun English Grammar Exam Score Report' : 'Orun English Level\u00a0 Assessment\u00a0 Report';
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

  // Sync title/subtitle across every mounted report of the same test
  React.useEffect(() => {
    if (!testId) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { testId: string; title: string; subtitle: string };
      if (!detail || detail.testId !== testId) return;
      setLocalTitle(detail.title);
      setLocalSubtitle(detail.subtitle);
      setTitleInput(detail.title);
      setSubtitleInput(detail.subtitle);
    };
    window.addEventListener('report-title-updated', handler);
    return () => window.removeEventListener('report-title-updated', handler);
  }, [testId]);

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
      window.dispatchEvent(new CustomEvent('report-title-updated', {
        detail: { testId, title: newTitle, subtitle: newSubtitle }
      }));
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
    if (totalQuestionCount === 45) {
      return STANDARD_TEST_SECTIONS;
    }
    // 45문항 표준 유형이 아닌 시험(예: 보카 50/100문항)은 실제 문항 번호 전체를
    // 10문항 단위 구간으로 나누어 분석한다. (기존에는 1~45번만 분석되어 누락 발생)
    const questionNumbers = Object.keys(localCorrectAnswers)
      .map(Number)
      .filter(n => !Number.isNaN(n))
      .sort((a, b) => a - b);
    if (questionNumbers.length === 0) return STANDARD_TEST_SECTIONS;
    const CHUNK = 10;
    const sections: { name: string; range: number[] }[] = [];
    for (let i = 0; i < questionNumbers.length; i += CHUNK) {
      const chunk = questionNumbers.slice(i, i + CHUNK);
      sections.push({
        name: `${chunk[0]}~${chunk[chunk.length - 1]}번`,
        range: chunk,
      });
    }
    return sections;
  }, [isHighSchoolEntranceTest, totalQuestionCount, localCorrectAnswers]);
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
    const testQuestionsCount = isHighSchoolEntranceTest && totalQuestionCount <= 22
      ? 22
      : (totalQuestionCount > 0 ? totalQuestionCount : 45);
    // Count correct answers across every question in the test (not just section ranges)
    const totalCorrect = Object.keys(correctAnswers)
      .map(k => parseInt(k))
      .filter(n => !Number.isNaN(n))
      .filter(qNum => checkCorrect(qNum, studentAnswers[qNum]?.answer)).length;
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

  const cumulativeAnalysis = useMemo(() => {
    const chronological = [...studentHistory].sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const isCorrectAnswer = (studentAnswer: any, correctAnswer: any): boolean => {
      if (studentAnswer?.forcedIncorrect === true) return false;
      if (studentAnswer?.forcedCorrect === true) return true;
      if (typeof studentAnswer?.partialPoints === 'number') return studentAnswer.partialPoints > 0;
      const answerValue = studentAnswer?.answer;
      const correctValue = correctAnswer?.answer;
      if (correctAnswer?.type === 'subjective') {
        return isSubjectiveAnswerCorrect(String(answerValue), String(correctValue));
      }
      const expected = (Array.isArray(correctValue) ? correctValue : [correctValue]).map(String).sort();
      const submitted = (Array.isArray(answerValue) ? answerValue : [answerValue]).map(String).sort();
      return expected.length === submitted.length && expected.every((value, index) => value === submitted[index]);
    };

    const getSections = (record: StudentHistoryRecord) => {
      const questionNumbers = Object.keys(record.correctAnswers).map(Number).filter(Number.isFinite).sort((a, b) => a - b);
      if (questionNumbers.length === 45) return STANDARD_TEST_SECTIONS;
      if (questionNumbers.length <= 22 && record.testTitle.includes('고등부 신입생')) return HIGH_SCHOOL_ENTRANCE_TEST_SECTIONS;
      const sections: { name: string; range: number[] }[] = [];
      for (let index = 0; index < questionNumbers.length; index += 10) {
        const range = questionNumbers.slice(index, index + 10);
        if (range.length > 0) sections.push({ name: `${range[0]}~${range[range.length - 1]}번`, range });
      }
      return sections;
    };

    const perTest = chronological.map((record) => ({
      ...record,
      sections: getSections(record).map((section) => {
        const validQuestions = section.range.filter((question) => record.correctAnswers[question]?.answer !== undefined);
        const correct = validQuestions.filter((question) =>
          isCorrectAnswer(record.studentAnswers[question], record.correctAnswers[question])
        ).length;
        return {
          name: section.name,
          accuracy: validQuestions.length > 0 ? Math.round((correct / validQuestions.length) * 100) : 0,
          total: validQuestions.length
        };
      }).filter((section) => section.total > 0)
    }));

    const aggregate = new Map<string, { correctRateTotal: number; count: number }>();
    perTest.forEach((record) => record.sections.forEach((section) => {
      const current = aggregate.get(section.name) || { correctRateTotal: 0, count: 0 };
      current.correctRateTotal += section.accuracy;
      current.count += 1;
      aggregate.set(section.name, current);
    }));

    const weakTypes = [...aggregate.entries()]
      .map(([name, value]) => ({ name, accuracy: Math.round(value.correctRateTotal / value.count) }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3);

    const splitIndex = Math.max(1, Math.floor(perTest.length / 2));
    const older = perTest.slice(0, splitIndex);
    const recent = perTest.slice(splitIndex);
    const averageByType = (records: typeof perTest) => {
      const map = new Map<string, number[]>();
      records.forEach((record) => record.sections.forEach((section) => {
        map.set(section.name, [...(map.get(section.name) || []), section.accuracy]);
      }));
      return new Map([...map.entries()].map(([name, values]) => [name, values.reduce((sum, value) => sum + value, 0) / values.length]));
    };
    const olderAverage = averageByType(older);
    const recentAverage = averageByType(recent);
    const growthTypes = perTest.length < 2 ? [] : [...recentAverage.entries()]
      .filter(([name]) => olderAverage.has(name))
      .map(([name, accuracy]) => ({
        name,
        change: Math.round(accuracy - (olderAverage.get(name) || 0)),
        accuracy: Math.round(accuracy)
      }))
      .sort((a, b) => b.change - a.change)
      .slice(0, 3);

    const trend = perTest.map((record, index) => ({
      order: index + 1,
      label: new Date(record.createdAt).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }),
      title: record.testTitle,
      score: record.score
    }));

    return { weakTypes, growthTypes, trend };
  }, [studentHistory]);

  // Determine max questions count for grid
  const maxQuestionsCount = isHighSchoolEntranceTest && totalQuestionCount <= 22
    ? 22
    : (totalQuestionCount > 0 ? totalQuestionCount : 45);
  return <div className="assessment-report relative bg-report-sky-soft p-1 sm:p-3">
      <div className="max-w-6xl mx-auto overflow-hidden rounded-2xl border border-report-line bg-white/85 backdrop-blur-2xl p-2 sm:p-5 md:p-6 shadow-xl space-y-3 sm:space-y-5">
        {/* Academic Prestige Editorial Header */}
        <header className="relative overflow-hidden rounded-xl border border-report-line bg-gradient-to-br from-white/95 via-report-sky-soft to-report-peach-soft shadow-lg backdrop-blur-xl">
          <div className="h-1.5 bg-report-ink" />
          <div aria-hidden="true" className="report-editorial-pattern pointer-events-none absolute inset-x-0 bottom-0 top-1.5" />
          <div aria-hidden="true" className="pointer-events-none absolute right-4 top-5 hidden h-10 w-10 border border-report-peach/25 sm:block">
            <div className="absolute inset-1.5 border border-report-peach/15" />
            <div className="absolute left-1/2 top-0 h-full w-px bg-report-peach/10" />
            <div className="absolute left-0 top-1/2 h-px w-full bg-report-peach/10" />
          </div>
          <div className="report-editorial-frame relative z-10 px-3 py-3 sm:px-6 sm:py-4">
            <div className="mb-3 flex items-start justify-between gap-3 sm:mb-4">
              <div className="flex min-w-0 items-center gap-2">
                <div className="shrink-0 border border-report-line bg-white p-0.5 shadow-sm">
                  <img src="/lovable-uploads/5b56e2a6-a232-40de-90c5-6d82faab51f6.png" alt="ORUN English logo" className="h-7 w-7 object-cover sm:h-9 sm:w-9" />
                </div>
                <div className="min-w-0">
                   <p className="text-[8px] font-bold uppercase text-report-peach sm:text-[9px]">ENGLISH LEARNING BY CHRISTIAN VALUE</p>
                  <div className="mt-0.5 h-px w-8 bg-report-peach" />
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[8px] font-medium uppercase text-slate-400 sm:text-[9px]">ORUN English</p>
                <p className="text-[8px] text-slate-400 sm:text-[9px]">ISSUE {formatTestDate(testDate)}</p>
              </div>
            </div>

            <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0 flex-1">
                  {isEditingTitle && canEdit ? (
                    <div className="space-y-1 print:hidden">
                      <Input
                        value={titleInput}
                        onChange={(e) => setTitleInput(e.target.value)}
                        placeholder="제목"
                        className="h-6 sm:h-7 text-sm sm:text-base font-bold bg-white/95 text-slate-800"
                      />
                      <Input
                        value={subtitleInput}
                        onChange={(e) => setSubtitleInput(e.target.value)}
                        placeholder="부제"
                        className="h-5 sm:h-6 text-[10px] sm:text-xs bg-white/95 text-slate-700"
                      />
                      <div className="flex gap-1.5">
                        <Button size="sm" className="h-5 px-2 text-[10px]" onClick={handleSaveTitle} disabled={isSaving}>
                          {isSaving && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}저장
                        </Button>
                        <Button size="sm" variant="outline" className="h-5 px-2 text-[10px]" onClick={() => { setIsEditingTitle(false); setTitleInput(localTitle); setSubtitleInput(localSubtitle); }} disabled={isSaving}>
                          취소
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="group/title flex items-start gap-1.5">
                      <div className="min-w-0">
                        <h1 className="text-lg font-bold leading-tight text-report-ink sm:text-2xl">
                          {localTitle}
                        </h1>
                        {localSubtitle && (
                          <p className="mt-0.5 text-[10px] font-light text-slate-500 sm:text-xs">
                            {localSubtitle}
                          </p>
                        )}
                      </div>
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => setIsEditingTitle(true)}
                          title="제목/부제 수정"
                          className="print:hidden shrink-0 rounded-md border border-report-line bg-report-sky-soft p-1 text-slate-500 transition-colors hover:bg-report-peach-soft hover:text-report-ink"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  )}
              </div>
              <div className="flex shrink-0 items-center gap-1 self-start border-l-2 border-report-peach bg-report-peach-soft px-2 py-1 sm:self-auto">
                <IconLaurel className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-report-peach" />
                <span className="text-[9px] font-bold text-report-ink sm:text-[10px] whitespace-nowrap">
                  {isHighSchoolEntranceTest ? 'ORUN Entrance Test' : Object.values(correctAnswers).some((a: any) => a?.grammarCategory) ? 'ORUN Grammar Report' : 'ORUN KSAT Report'}
                </span>
              </div>
            </div>
            
            {/* Student profile metadata */}
            <div className="grid grid-cols-4 border-y border-report-line bg-white/55 backdrop-blur-sm divide-x divide-report-line">
              <div className="px-1.5 py-2 sm:px-3 sm:py-2.5">
                <div className="flex items-center gap-1 mb-0.5">
                  <IconStudent className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-report-peach" />
                  <span className="text-[8px] font-bold uppercase text-slate-400 sm:text-[9px]">학생</span>
                </div>
                <p className="text-[10px] font-bold leading-tight text-report-ink sm:text-xs truncate">{studentName || '-'}</p>
              </div>
              
              <div className="px-1.5 py-2 sm:px-3 sm:py-2.5">
                <div className="flex items-center gap-1 mb-0.5">
                  <IconClass className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-report-peach" />
                  <span className="text-[8px] font-bold uppercase text-slate-400 sm:text-[9px]">반</span>
                </div>
                <p className="text-[10px] font-bold leading-tight text-report-ink sm:text-xs truncate">{studentClass || '-'}</p>
              </div>
              
              <div className="px-1.5 py-2 sm:px-3 sm:py-2.5">
                <div className="flex items-center gap-1 mb-0.5">
                  <IconPaper className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-report-peach" />
                  <span className="text-[8px] font-bold uppercase text-slate-400 sm:text-[9px]">시험</span>
                </div>
                <p className="break-words text-[10px] font-bold leading-tight text-report-ink sm:text-xs line-clamp-2">{testTitle || '-'}</p>
              </div>
              
              <div className="px-1.5 py-2 sm:px-3 sm:py-2.5">
                <div className="flex items-center gap-1 mb-0.5">
                  <IconDate className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-report-peach" />
                  <span className="text-[8px] font-bold uppercase text-slate-400 sm:text-[9px]">일자</span>
                </div>
                <p className="text-[10px] font-bold leading-tight text-report-ink sm:text-xs">{formatTestDate(testDate)}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Compact Score Overview */}
        <div className="overflow-hidden rounded-xl border border-report-line bg-white/75 shadow-md backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-stretch">
            {/* Total Score - Accent Section */}
            <div className="shrink-0 sm:w-40 md:w-48 bg-report-ink p-3 sm:p-5 flex flex-row sm:flex-col items-center sm:items-start justify-between sm:justify-center border-t-2 border-report-peach">
              <p className="text-report-peach text-[10px] sm:text-xs font-medium uppercase sm:mb-1">총점</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-5xl font-black text-white">{results.total.score}</span>
                <span className="text-report-peach text-xs sm:text-sm whitespace-nowrap">/ {results.total.maxScore}점</span>
              </div>
            </div>
            
            {/* Other Stats - Clean Grid */}
            <div className="flex-1 grid grid-cols-3 divide-x divide-slate-100">
              <div className="p-2 sm:p-4 flex flex-col items-center justify-center bg-report-peach-soft">
                <p className="text-slate-500 text-[10px] sm:text-xs font-medium uppercase tracking-wide mb-0.5 sm:mb-1">등급</p>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl sm:text-3xl font-bold text-slate-800">{results.total.grade}</span>
                  <span className="text-slate-400 text-[10px] sm:text-sm">등급</span>
                </div>
              </div>
              
              <div className="p-2 sm:p-4 flex flex-col items-center justify-center bg-report-mint-soft">
                <p className="text-slate-500 text-[10px] sm:text-xs font-medium uppercase tracking-wide mb-0.5 sm:mb-1">평균</p>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl sm:text-3xl font-bold text-slate-800">{results.total.average}</span>
                  <span className="text-slate-400 text-[10px] sm:text-sm">점</span>
                </div>
              </div>
              
              <div className="p-2 sm:p-4 flex flex-col items-center justify-center bg-report-sun-soft">
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
        {is45QuestionTest && <div className="rounded-2xl bg-white/65 backdrop-blur-xl border border-white/70 shadow-[0_16px_40px_-28px_rgba(10,22,41,0.55)] overflow-hidden">
          {/* Header */}
          <div className="px-3 sm:px-5 py-3 sm:py-4 bg-white/50 border-b border-white/70">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-md bg-report-sky shadow-sm shrink-0">
                  <IconScoreSeal className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-lg font-bold text-slate-800">영역별 성취도</h2>
                  <p className="text-slate-500 text-[10px] sm:text-xs">Section-wise Achievement Analysis</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                <div className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-[#C5A059]/12 border border-[#C5A059]/40">
                  <IconLaurel className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#8A6A2F]" />
                  <span className="text-[9px] sm:text-xs font-bold text-[#8A6A2F]">S: 100%</span>
                </div>
                <div className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-slate-100 border border-slate-200">
                  <span className="text-[9px] sm:text-xs font-bold text-slate-700">A: 80~99%</span>
                </div>
                <div className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[9px] sm:text-xs font-bold text-slate-500">B: 60~79%</span>
                </div>
                <div className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[9px] sm:text-xs font-bold text-slate-400">C: ~59%</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Overall Feedback - Compact */}
           <div className="mx-3 sm:mx-5 mt-3 sm:mt-4 p-2 sm:p-3 bg-report-sky-soft rounded-md border-l-4 border-report-sky">
            <div className="flex items-start gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm">💬</span>
              <p className="text-[10px] sm:text-xs text-slate-500 leading-relaxed">
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
                <TableRow className="bg-slate-50 hover:bg-white/50 border-b border-white/70">
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
                return <TableRow key={index} className="hover:bg-report-sky-soft/60 transition-colors border-b border-slate-100">
                    <TableCell className="font-semibold text-[10px] sm:text-sm text-slate-800 py-2 sm:py-3 whitespace-nowrap">{section.name}</TableCell>
                    <TableCell className="text-center text-[10px] sm:text-sm font-medium text-slate-600 py-2 sm:py-3">{Math.round(section.maxScore)}점</TableCell>
                    <TableCell className="text-center text-[10px] sm:text-sm font-bold text-report-ink py-2 sm:py-3">{Math.round(section.score)}점</TableCell>
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
        {is45QuestionTest && <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Radar Chart Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-white/65 backdrop-blur-xl shadow-[0_16px_40px_-28px_rgba(10,22,41,0.55)] border border-white/70 transition-colors duration-200 lg:col-span-6">
            {/* Header */}
            <div className="relative px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-white/70 bg-white/40">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3.5 rounded-xl bg-[#C5A059] shadow-sm">
                  <IconSegments className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-xl font-bold text-slate-800">영역별 분석</h3>
                  <p className="text-slate-500 font-medium text-[10px] sm:text-xs tracking-wide">Performance Radar</p>
                </div>
              </div>
            </div>
            
            {/* Chart */}
            <div className="relative px-3 sm:px-4 py-4 sm:py-6">
              <div className="h-[180px] sm:h-[240px] bg-white/55 rounded-xl p-2 sm:p-3 border border-report-peach/40">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={chartData} margin={{
                  top: 15,
                  right: 25,
                  bottom: 15,
                  left: 25
                }}>
                    <PolarGrid stroke="hsl(var(--report-line))" strokeWidth={1} />
                    <PolarAngleAxis dataKey="subject" tick={{
                    fill: '#64748B',
                    fontSize: 9,
                    fontWeight: 600
                  }} />
                    <Radar name="점수" dataKey="score" stroke="#C5A059" fill="url(#radarGradient)" fillOpacity={0.6} strokeWidth={2.5} dot={{
                    fill: '#C5A059',
                    strokeWidth: 2,
                    r: 4,
                    stroke: '#fff'
                  }} />
                    <defs>
                      <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#C5A059" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#C5A059" stopOpacity={0.08} />
                      </linearGradient>
                    </defs>
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Analysis Footer */}
            <div className="relative px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="p-3 sm:p-4 bg-white/55 rounded-xl border border-report-peach/50">
                <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                  <div className="w-1 h-4 sm:h-5 rounded-full bg-[#C5A059]" />
                  <h4 className="text-xs sm:text-sm font-bold text-[#8A6A2F]">성취도 분석</h4>
                </div>
                <div className="text-[10px] sm:text-xs text-slate-700 leading-relaxed pl-3 space-y-1">
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
                      <p><span className="font-semibold text-[#8A6A2F]">강점 영역:</span> {bestSection.name} ({bestPercentage}%) - 이 영역에서 뛰어난 이해도를 보여주고 있습니다.</p>
                      <p><span className="font-semibold text-report-ink">보완 영역:</span> {worstSection.name} ({worstPercentage}%) - 해당 영역의 기본 개념 복습과 추가 연습이 필요합니다.</p>
                      {weakSections.length > 1 && <p className="text-slate-600">💡 {weakSections.map(s => s.name).join(', ')} 영역을 중점적으로 학습하세요.</p>}
                    </>;
                })()}
                </div>
              </div>
            </div>
          </div>

          {/* Bar Chart Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-white/65 backdrop-blur-xl shadow-[0_16px_40px_-28px_rgba(10,22,41,0.55)] border border-white/70 transition-colors duration-200 lg:col-span-6">
            {/* Header */}
            <div className="relative px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-white/70 bg-white/40">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3.5 rounded-xl bg-report-ink shadow-sm">
                  <IconCompare className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-xl font-bold text-slate-800">점수 비교</h3>
                  <p className="text-slate-500 font-medium text-[10px] sm:text-xs tracking-wide">Score Comparison</p>
                </div>
              </div>
              {/* Legend */}
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-report-ink" />
                  <span className="text-[10px] sm:text-xs text-slate-600 font-medium">내 점수</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span className="text-[10px] sm:text-xs text-slate-600 font-medium">응시자 평균</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#C5A059]" />
                  <span className="text-[10px] sm:text-xs text-slate-600 font-medium">상위 30%</span>
                </div>
              </div>
            </div>
            
            {/* Chart */}
            <div className="relative px-3 sm:px-4 py-4 sm:py-6">
              <div className="h-[180px] sm:h-[240px] bg-white/55 rounded-xl p-2 sm:p-3 border border-report-line">
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
                        <stop offset="0%" stopColor="#16233C" />
                        <stop offset="100%" stopColor="#0A1629" />
                      </linearGradient>
                      <linearGradient id="avgGradient2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#D8DDE5" />
                        <stop offset="100%" stopColor="#C2C9D4" />
                      </linearGradient>
                      <linearGradient id="top30Gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#D8B673" />
                        <stop offset="100%" stopColor="#C5A059" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Analysis Footer */}
            <div className="relative px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                  <div className="w-1 h-4 sm:h-5 rounded-full bg-report-ink" />
                  <h4 className="text-xs sm:text-sm font-bold text-report-ink">비교 분석</h4>
                </div>
                <div className="text-[10px] sm:text-xs text-slate-500/90 leading-relaxed pl-3 space-y-1">
                  {(() => {
                  const myScore = results.total.score;
                  const average = results.total.average;
                  const difference = myScore - average;
                  const percentile = difference > 20 ? "상위 10%" : difference > 10 ? "상위 30%" : difference > 0 ? "평균 이상" : difference >= -10 ? "평균 수준" : "평균 이하";
                  if (difference > 0) {
                    return <>
                        <p><span className="font-semibold text-report-ink">내 점수:</span> {myScore}점 (평균 대비 <span className="text-[#1B7A4B] font-bold">+{difference}점</span>)</p>
                        <p><span className="font-semibold text-report-ink">예상 위치:</span> {percentile} - 우수한 성적입니다! 현재 학습 방법을 유지하세요.</p>
                      </>;
                  } else if (difference === 0) {
                    return <>
                        <p><span className="font-semibold text-report-ink">내 점수:</span> {myScore}점 (응시자 평균과 동일)</p>
                        <p><span className="font-semibold text-report-ink">학습 제안:</span> 평균 수준입니다. 약점 영역을 보완하면 상위권 진입이 가능합니다.</p>
                      </>;
                  } else {
                    return <>
                        <p><span className="font-semibold text-report-ink">내 점수:</span> {myScore}점 (평균 대비 <span className="text-rose-600 font-bold">{difference}점</span>)</p>
                        <p><span className="font-semibold text-report-ink">학습 제안:</span> 기초 개념 복습과 꾸준한 문제 풀이로 점수 향상을 목표로 하세요.</p>
                      </>;
                  }
                })()}
                </div>
              </div>
            </div>
          </div>

          {/* Top Wrong Answers Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-white/65 backdrop-blur-xl shadow-[0_16px_40px_-28px_rgba(10,22,41,0.55)] border border-[#C5A059]/30 transition-colors duration-200 lg:col-span-12">
            {/* Header */}
            <div className="relative px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-white/70 bg-white/40">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3.5 rounded-xl bg-[#C5A059] shadow-sm">
                  <IconFlag className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-xl font-bold text-slate-800">오답률 TOP3</h3>
                  <p className="text-slate-500 font-medium text-[10px] sm:text-xs tracking-wide">Difficult Questions</p>
                </div>
              </div>
            </div>
            
            {/* Table */}
            <div className="relative px-3 sm:px-4 py-4 sm:py-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3">
                {results.total.wrongAnswerTop3.map((item, index) => <div key={index} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-report-peach-soft rounded-md border border-report-peach/40 hover:border-report-peach transition-colors duration-200">
                    {/* Rank */}
                    <div className="shrink-0">
                        <div className="flex items-center justify-center h-7 w-7 sm:h-9 sm:w-9 rounded-lg bg-report-ink border border-report-ink text-white font-semibold text-xs sm:text-sm">
                        {index + 1}
                      </div>
                    </div>
                    {/* Question Number & Section */}
                    <div className="min-w-0 flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <div className="inline-flex shrink-0 items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-slate-50 border border-slate-200 whitespace-nowrap">
                        <span className="text-slate-500 text-[10px] sm:text-xs font-medium">문항</span>
                        <span className="text-slate-800 text-sm sm:text-base font-bold">{item.questionNumber}</span>
                      </div>
                      {item.sectionName && <span className="min-w-0 max-w-full px-2 py-1 rounded-md bg-report-sky-soft border border-report-line text-report-ink text-[9px] sm:text-[10px] font-medium leading-tight break-keep">
                          {item.sectionName}
                        </span>}
                    </div>
                    {/* Result */}
                    <div className="shrink-0">
                      {item.isCorrect ? <div className="flex items-center justify-center h-9 w-9 sm:h-11 sm:w-11 rounded-xl bg-report-ink text-white">
                          <Check className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
                        </div> : <div className="flex items-center justify-center h-9 w-9 sm:h-11 sm:w-11 rounded-xl bg-[#B4232A] text-white">
                          <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
                        </div>}
                    </div>
                  </div>)}
              </div>
            </div>
            
          </div>
        </div>}

        {/* Question-by-Question Results - Compact Grid Layout */}
        <div className="relative overflow-hidden rounded-2xl bg-white/65 backdrop-blur-xl shadow-[0_16px_40px_-28px_rgba(10,22,41,0.55)] border border-white/70">
          <div className="p-3 sm:p-5">
            <div className="flex items-center gap-1.5 mb-1.5 sm:mb-2">
              <div className="p-1 rounded-md bg-report-ink shadow-sm shrink-0">
                <IconGrid className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-800">문항별 채점 결과</h3>
            </div>
            
            {/* Grid Layout like reference image */}
            <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-9 xl:grid-cols-12 gap-1.5 sm:gap-2 font-noto">
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
              return <div key={questionNumber} className={`group flex min-h-[92px] flex-col items-center justify-center rounded-lg border p-2 ${isPartial ? 'border-report-sun bg-report-sun-soft' : isCorrect ? 'border-report-line bg-report-sky-soft/30' : 'border-report-peach bg-report-peach-soft'}`}>
                    {localCorrectAnswers[questionNumber]?.grammarCategory && (
                      <span 
                        className={`text-[9px] font-semibold mb-1 w-full text-center px-1.5 py-0.5 rounded-md border break-keep ${
                          isPartial
                            ? 'bg-[#FBF3E3] text-[#8A6A2F] border-[#C5A059]/40'
                            : isCorrect 
                            ? 'bg-slate-50 text-slate-600 border-slate-200' 
                            : 'bg-[#FDF2F2] text-[#B4232A] border-[#B4232A]/25'
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
                      className={`text-base sm:text-xl font-bold ${isPartial ? 'text-[#C5A059]' : isCorrect ? 'text-report-ink' : 'text-[#B4232A]'} ${canEdit ? 'cursor-pointer hover:scale-110 transition-transform select-none print:cursor-default print:hover:scale-100' : ''}`}
                    >
                      {isPartial ? '△' : isCorrect ? 'O' : 'X'}
                    </span>
                    {forcedCorrect && (
                      <span className="text-[8px] sm:text-[9px] font-semibold text-[#1B7A4B] mt-0.5">정답처리</span>
                    )}
                    {isPartial && (
                      <span className="text-[8px] sm:text-[9px] font-semibold text-amber-600 mt-0.5">
                        부분 {partialPts}/{fullPts}점
                      </span>
                    )}
                    <div className="mt-0.5 text-[9px] sm:text-[10px] text-center">
                      <div>
                        <span className={isPartial ? 'text-[#8A6A2F]' : isCorrect ? 'text-slate-500' : 'text-[#B4232A]'}>선택: </span>
                        <span className={isPartial ? 'text-slate-400 font-medium' : isCorrect ? 'text-slate-600' : 'text-rose-600 font-medium'}>{formatAnswer(studentAnswer)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">정답: </span>
                        <span className="text-report-ink font-medium">{formatAnswer(correctAnswer)}</span>
                      </div>
                    </div>
                    {canEdit && questionType === 'subjective' && !isSaving && (
                      <div className="mt-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                        <button
                          type="button"
                          onClick={() => openStudentAnswerEditor(questionNumber)}
                          title="학생 답안 수정"
                          className="p-1 rounded-md bg-amber-50 hover:bg-slate-50 border border-slate-200 text-amber-600 transition-colors"
                        >
                          <Pencil className="h-2.5 w-2.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditor(questionNumber)}
                          title="추가 정답 등록"
                          className="p-1 rounded-md bg-blue-50 hover:bg-slate-50 border border-slate-200 text-report-ink transition-colors"
                        >
                          <Pencil className="h-2.5 w-2.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleForceCorrect(questionNumber)}
                          disabled={isSaving}
                          title={forcedCorrect ? '강제 정답 해제' : '이 학생만 강제 정답 처리'}
                          className={`p-1 rounded-md border transition-colors ${forcedCorrect ? 'bg-emerald-100 border-emerald-300 text-slate-700 hover:bg-emerald-200' : 'bg-emerald-50 border-emerald-200 text-[#1B7A4B] hover:bg-emerald-100'}`}
                        >
                          <CheckCircle2 className="h-2.5 w-2.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openPartialEditor(questionNumber)}
                          disabled={isSaving}
                          title={isPartial ? `부분점수 수정 (현재 ${partialPts}/${fullPts}점)` : `부분점수 부여 (배점 ${fullPts}점)`}
                          className={`p-1 rounded-md border transition-colors ${isPartial ? 'bg-amber-100 border-amber-300 text-slate-400 hover:bg-amber-200' : 'bg-yellow-50 border-yellow-200 text-yellow-600 hover:bg-yellow-100'}`}
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

        {/* Personal cumulative analysis based on the latest 10 results */}
        <section className="break-inside-avoid overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br from-white/75 via-white/60 to-slate-50/50 backdrop-blur-2xl shadow-[0_24px_60px_-28px_rgba(10,22,41,0.55)]">
          {/* Glassmorphism header */}
          <div className="relative flex flex-col gap-2 overflow-hidden border-b border-white/30 bg-report-ink/75 px-4 py-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="absolute inset-0 report-editorial-pattern opacity-70" />
            <div className="relative z-10 flex items-center gap-3">
              <div className="rounded-xl bg-[#C5A059]/20 p-2.5 ring-1 ring-[#C5A059]/30 backdrop-blur-sm">
                <IconPulse className="h-5 w-5 text-[#C5A059]" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white sm:text-base tracking-tight">개인 누적 성장 분석</h3>
                <p className="text-[10px] text-white/60 sm:text-xs">최근 {cumulativeAnalysis.trend.length}회 응시 결과 기준</p>
              </div>
            </div>
            <span className="relative z-10 self-start rounded-full border border-[#C5A059]/40 bg-[#C5A059]/10 px-3.5 py-1 text-[10px] font-bold text-[#C5A059] backdrop-blur-sm sm:self-auto">
              LAST 10 PERFORMANCE
            </span>
          </div>

          {isHistoryLoading ? (
            <div className="flex h-44 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> 누적 결과를 분석하고 있습니다
            </div>
          ) : cumulativeAnalysis.trend.length === 0 ? (
            <div className="flex h-36 items-center justify-center text-sm text-muted-foreground">누적 분석에 필요한 이전 시험 결과가 없습니다.</div>
          ) : (
            <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1.35fr_1fr]">
              {/* Trend chart card */}
              <div className="group relative min-w-0 overflow-hidden rounded-xl border border-white/70 bg-white/45 p-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] backdrop-blur-md sm:p-4">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C5A059]/40 to-transparent" />
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-extrabold text-report-ink sm:text-sm">최근 점수 추이</p>
                    <p className="text-[10px] text-muted-foreground">오래된 시험부터 최근 시험 순서</p>
                  </div>
                  <div className="rounded-lg bg-[#C5A059]/10 p-1.5 text-[#C5A059] ring-1 ring-[#C5A059]/20">
                    <IconTrend className="h-4 w-4" />
                  </div>
                </div>
                <div className="h-[210px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cumulativeAnalysis.trend} margin={{ top: 16, right: 16, left: -18, bottom: 4 }}>
                      <CartesianGrid stroke="hsl(var(--report-line) / 0.45)" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        cursor={{ stroke: 'hsl(var(--report-line))' }}
                        contentStyle={{ borderRadius: 10, border: '1px solid hsl(var(--report-line) / 0.6)', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', boxShadow: '0 12px 32px hsl(var(--report-ink) / 0.14)' }}
                        formatter={(value: number) => [`${value}점`, '점수']}
                        labelFormatter={(_, payload) => payload?.[0]?.payload?.title || ''}
                      />
                      <Line type="monotone" dataKey="score" stroke="#C5A059" strokeWidth={3} dot={{ r: 4, fill: '#fff', stroke: '#C5A059', strokeWidth: 3 }} activeDot={{ r: 6, fill: '#C5A059', stroke: '#fff', strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* TOP3 cards - side by side, matching chart height */}
              <div className="grid grid-cols-2 gap-3 h-full">
                {/* Weak types */}
                <div className="relative overflow-hidden rounded-xl border border-rose-200/60 bg-gradient-to-br from-white/50 to-rose-50/30 p-3.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] backdrop-blur-md flex flex-col">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-300/60 to-transparent" />
                  <div className="relative mb-3 flex items-center gap-2">
                    <div className="rounded-lg bg-rose-500/10 p-1.5 text-rose-500 ring-1 ring-rose-500/20">
                      <IconWeak className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-report-ink">개인 취약유형 TOP3</p>
                      <p className="text-[9px] text-muted-foreground">최근 10회 평균 정답률 기준</p>
                    </div>
                  </div>
                  <div className="relative flex-1 space-y-2">
                    {cumulativeAnalysis.weakTypes.map((type, index) => (
                      <div key={type.name} className="flex items-center gap-2.5 rounded-lg border border-white/80 bg-white/60 px-3 py-2 shadow-sm backdrop-blur-sm">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-50 to-rose-100 text-[10px] font-black text-rose-600 ring-1 ring-rose-200/60">{index + 1}</span>
                        <span className="min-w-0 flex-1 text-xs font-bold text-report-ink">{type.name}</span>
                        <span className="text-xs font-black text-rose-600">{type.accuracy}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Growth types */}
                <div className="relative overflow-hidden rounded-xl border border-emerald-200/60 bg-gradient-to-br from-white/50 to-emerald-50/30 p-3.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] backdrop-blur-md flex flex-col">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent" />
                  <div className="relative mb-3 flex items-center gap-2">
                    <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-600 ring-1 ring-emerald-500/20">
                      <IconGrowth className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-report-ink">개인 성장유형 TOP3</p>
                      <p className="text-[9px] text-muted-foreground">이전 구간 대비 최근 정답률 변화</p>
                    </div>
                  </div>
                  {cumulativeAnalysis.growthTypes.length > 0 ? (
                    <div className="relative flex-1 space-y-2">
                      {cumulativeAnalysis.growthTypes.map((type, index) => (
                        <div key={type.name} className="flex items-center gap-2.5 rounded-lg border border-white/80 bg-white/60 px-3 py-2 shadow-sm backdrop-blur-sm">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100 text-[10px] font-black text-emerald-700 ring-1 ring-emerald-200/60">{index + 1}</span>
                          <span className="min-w-0 flex-1 text-xs font-bold text-report-ink">{type.name}</span>
                          <span className="text-xs font-black text-emerald-700">{type.change >= 0 ? '+' : ''}{type.change}%p</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="relative flex-1 rounded-lg border border-white/80 bg-white/60 px-3 flex items-center justify-center text-center text-[10px] text-muted-foreground shadow-sm backdrop-blur-sm">2회 이상 응시하면 성장유형이 표시됩니다.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Copyright Notice */}
        <div className="mt-6 pt-4 border-t border-slate-200 text-center">
          <p className="text-xs text-report-ink font-medium">
            © {new Date().getFullYear()} ORUN ENGLISH. All rights reserved.
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
                정답: <span className="font-medium text-report-ink">{String(localCorrectAnswers[editingStudentQuestion]?.answer ?? '')}</span>
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