import type { PrepLevelTestQuestion } from '@/data/prepLevelTestQuestions';
import { getPrepSet, type PrepVersion } from '@/data/prepVersions';

export type SentenceAnswer = { subjects: string[]; verbs: string[] };
export type PrepAnswerValue = string | number | number[] | string[] | SentenceAnswer | undefined;

export type PrepSectionType =
  | 'reading'
  | 'grammarA'
  | 'grammarB'
  | 'grammarC'
  | 'vocabulary'
  | 'sentenceAnalysis';

export const getPrepSectionFromQuestion = (q: PrepLevelTestQuestion): PrepSectionType => {
  if (q.section === 'grammar') return `grammar${q.grammarLevel || 'A'}` as PrepSectionType;
  if (q.section === 'sentenceAnalysis') return 'sentenceAnalysis';
  return q.section as PrepSectionType;
};

/** 초/중등 레벨테스트(프렙 문항 세트) 단일 문항 채점 */
export const isPrepAnswerCorrect = (question: PrepLevelTestQuestion, answer: PrepAnswerValue): boolean => {
  if (answer === undefined || answer === null || answer === '') return false;

  // 문장 클릭 문제 (주어/동사 찾기)
  if (question.inputType === 'sentenceClick' && question.correctSubjects && question.correctVerbs) {
    const sentenceAnswer = answer as SentenceAnswer;
    if (!sentenceAnswer.subjects || !sentenceAnswer.verbs) return false;
    const selectedSubjects = sentenceAnswer.subjects.map(s => s.split('-')[1]);
    const selectedVerbs = sentenceAnswer.verbs.map(v => v.split('-')[1]);
    const correctSubjects = question.correctSubjects;
    const correctVerbs = question.correctVerbs;
    const optionalSubjects = question.optionalSubjects || [];
    const optionalVerbs = question.optionalVerbs || [];

    const requiredSubjectsMatch = correctSubjects.every(s => selectedSubjects.includes(s));
    const requiredVerbsMatch = correctVerbs.every(v => selectedVerbs.includes(v));
    const allSubjectsValid = selectedSubjects.every(s => correctSubjects.includes(s) || optionalSubjects.includes(s));
    const allVerbsValid = selectedVerbs.every(v => correctVerbs.includes(v) || optionalVerbs.includes(v));
    const hasAtLeastOneVerb =
      correctVerbs.length > 0 || (optionalVerbs.length > 0 && selectedVerbs.some(v => optionalVerbs.includes(v)));

    return requiredSubjectsMatch && requiredVerbsMatch && allSubjectsValid && allVerbsValid && hasAtLeastOneVerb;
  }

  // 단어 배열 문제
  if (question.inputType === 'wordArrangement') {
    if (Array.isArray(answer)) {
      const studentSentence = (answer as string[]).join(' ');
      if (question.correctAnswers && question.correctAnswers.length > 0) {
        return question.correctAnswers.some(c => c.toLowerCase().trim() === studentSentence.toLowerCase().trim());
      }
      return studentSentence.toLowerCase().trim() === String(question.correctAnswer).toLowerCase().trim();
    }
    return false;
  }

  // 객관식
  if (question.inputType === 'choice') {
    if (Array.isArray(answer) && answer.every(item => typeof item === 'number')) {
      const numAnswer = answer as number[];
      if (Array.isArray(question.correctAnswer)) {
        const correctSorted = [...(question.correctAnswer as number[])].sort((a, b) => a - b);
        const answerSorted = [...numAnswer].sort((a, b) => a - b);
        return correctSorted.length === answerSorted.length && correctSorted.every((v, i) => v === answerSorted[i]);
      }
      return numAnswer.length === 1 && numAnswer[0] === question.correctAnswer;
    }
    return answer === question.correctAnswer;
  }

  // 단답형 - 여러 정답 허용
  if (question.correctAnswers && question.correctAnswers.length > 0) {
    const studentAnswer = String(answer).toLowerCase().trim();
    if (question.requireAllAnswers) {
      const studentParts = studentAnswer.split(/[,，]/).map(a => a.trim()).filter(Boolean).sort();
      const correctParts = question.correctAnswers.map(a => a.toLowerCase().trim()).sort();
      return studentParts.length === correctParts.length && correctParts.every(c => studentParts.some(s => s === c));
    }
    return question.correctAnswers.some(correct => correct.toLowerCase().trim() === studentAnswer);
  }

  // 단일 정답
  if (question.correctAnswer) {
    const correctAnswers = String(question.correctAnswer).toLowerCase().split(',').map(a => a.trim());
    const studentAnswer = String(answer).toLowerCase().trim();
    const studentAnswers = studentAnswer.split(/[,，]/).map(a => a.trim()).filter(a => a.length > 0);
    if (studentAnswers.length > 1 && correctAnswers.length > 1) {
      const sortedCorrect = [...correctAnswers].sort();
      const sortedStudent = [...studentAnswers].sort();
      if (sortedCorrect.length === sortedStudent.length && sortedCorrect.every((c, i) => c === sortedStudent[i])) {
        return true;
      }
    }
    if (question.section === 'vocabulary') {
      return correctAnswers.some(correct => studentAnswer.includes(correct) || correct.includes(studentAnswer));
    }
    return correctAnswers.some(correct => correct === studentAnswer);
  }
  return false;
};

/** 버전별 전체 채점 (섹션/세부영역 점수 포함) */
export const calculatePrepScores = (version: PrepVersion, answers: Record<number, PrepAnswerValue>) => {
  const prepSet = getPrepSet(version);
  const questions = prepSet.questions;
  const totalPossible = prepSet.totalMaxScore;

  const sections = (['reading', 'grammarA', 'grammarB', 'grammarC', 'vocabulary', 'sentenceAnalysis'] as PrepSectionType[])
    .filter(sec => questions.some(q => getPrepSectionFromQuestion(q) === sec));

  let totalEarned = 0;
  const sectionScores: Array<{
    section: string; sectionName: string; totalQuestions: number; correctCount: number;
    totalPoints: number; earnedPoints: number; percentage: number;
  }> = [];
  const subCategoryScores: Record<string, Array<{ name: string; totalQuestions: number; correctCount: number; percentage: number }>> = {};

  sections.forEach(section => {
    const sectionQs = questions.filter(q => getPrepSectionFromQuestion(q) === section);
    let sectionEarned = 0;
    let sectionTotal = 0;
    let correctCount = 0;
    sectionQs.forEach(q => {
      const pts = prepSet.getPoints(q);
      sectionTotal += pts;
      if (isPrepAnswerCorrect(q, answers[q.id])) {
        sectionEarned += pts;
        correctCount++;
      }
    });
    totalEarned += sectionEarned;
    sectionScores.push({
      section,
      sectionName: prepSet.sectionNames[section] || section,
      totalQuestions: sectionQs.length,
      correctCount,
      totalPoints: sectionTotal,
      earnedPoints: sectionEarned,
      percentage: sectionTotal > 0 ? Math.round((sectionEarned / sectionTotal) * 100) : 0,
    });

    const categoryData = (prepSet.analysisCategories as any)[section];
    if (categoryData) {
      subCategoryScores[section] = categoryData.subCategories.map((sub: any) => {
        const subQuestions = questions.filter(q => sub.questions.includes(q.id));
        const subCorrect = subQuestions.filter(q => isPrepAnswerCorrect(q, answers[q.id])).length;
        return {
          name: sub.name,
          totalQuestions: subQuestions.length,
          correctCount: subCorrect,
          percentage: subQuestions.length > 0 ? Math.round((subCorrect / subQuestions.length) * 100) : 0,
        };
      });
    }
  });

  const overallPercentage = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;
  let level = 'Beginner';
  if (overallPercentage >= 90) level = 'Advanced';
  else if (overallPercentage >= 75) level = 'Upper-Intermediate';
  else if (overallPercentage >= 60) level = 'Intermediate';
  else if (overallPercentage >= 45) level = 'Pre-Intermediate';
  else if (overallPercentage >= 30) level = 'Elementary';

  return { sectionScores, subCategoryScores, totalScore: totalEarned, level };
};