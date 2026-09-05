import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Check, X, Circle } from 'lucide-react';
import { PrepLevelTestQuestion } from '@/data/prepLevelTestQuestions';
import { getPrepSet, detectPrepVersion } from '@/data/prepVersions';

interface PrepQuestionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryName: string;
  section: string;
  studentAnswers: Record<string, any>;
}

// 유사도 계산 함수 (Levenshtein distance 기반) - 외부에 정의하여 재사용
const calculateSimilarity = (str1: string, str2: string): number => {
  const s1 = str1.toLowerCase().replace(/\s+/g, ' ').trim();
  const s2 = str2.toLowerCase().replace(/\s+/g, ' ').trim();
  
  if (s1 === s2) return 1;
  
  const len1 = s1.length;
  const len2 = s2.length;
  
  if (len1 === 0) return len2 === 0 ? 1 : 0;
  if (len2 === 0) return 0;
  
  const matrix: number[][] = [];
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  
  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);
  return 1 - distance / maxLen;
};

// 퍼지 매칭 함수 - 옵션 중 가장 유사한 것 찾기
const findBestMatchingOption = (answer: string, options: string[]): { index: number; similarity: number } => {
  const normalizedAnswer = String(answer).toLowerCase().replace(/\s+/g, ' ').trim();
  
  // 1단계: 정확한 매칭 시도
  for (let i = 0; i < options.length; i++) {
    const normalizedOption = options[i].toLowerCase().replace(/\s+/g, ' ').trim();
    if (normalizedAnswer === normalizedOption) {
      return { index: i, similarity: 1 };
    }
  }
  
  // 2단계: 유사도 기반 퍼지 매칭
  let bestMatchIndex = -1;
  let bestSimilarity = 0;
  
  for (let i = 0; i < options.length; i++) {
    const similarity = calculateSimilarity(normalizedAnswer, options[i]);
    if (similarity > bestSimilarity) {
      bestSimilarity = similarity;
      bestMatchIndex = i;
    }
  }
  
  return { index: bestMatchIndex, similarity: bestSimilarity };
};

const PrepQuestionDetailDialog = ({
  open,
  onOpenChange,
  categoryName,
  section,
  studentAnswers
}: PrepQuestionDetailDialogProps) => {
  // prepAnalysisCategories의 명시적 ID 목록을 사용해 해당 카테고리 문항 조회
  const prepSet = getPrepSet(detectPrepVersion(studentAnswers || {}));
  const allPrepQuestions = prepSet.questions;
  const getPrepQuestionPoints = prepSet.getPoints;
  const categoryGroup = (prepSet.analysisCategories as Record<string, { subCategories: { name: string; questions: number[] }[] }>)[section];
  const subCat = categoryGroup?.subCategories.find(s => s.name === categoryName);
  const idSet = new Set<number>(subCat?.questions ?? []);
  const filteredQuestions = allPrepQuestions
    .filter(q => idSet.has(q.id))
    .sort((a, b) => a.id - b.id);

  const getCorrectAnswer = (question: PrepLevelTestQuestion): string => {
    if (question.inputType === 'sentenceClick') {
      const subjects = question.correctSubjects?.join(', ') || '';
      // correctVerbs가 비어있으면 optionalVerbs를 표시
      const allVerbs = [...(question.correctVerbs || []), ...(question.optionalVerbs || [])];
      const verbs = allVerbs.join(', ') || '';
      return `주어: ${subjects} / 동사: ${verbs}`;
    }
    if (question.inputType === 'wordArrangement') {
      return String(question.correctAnswer || '-');
    }
    if (question.correctAnswers) {
      return question.correctAnswers.join(', ');
    }
    if (question.options && typeof question.correctAnswer === 'number') {
      return `${question.correctAnswer}. ${question.options[question.correctAnswer - 1]}`;
    }
    if (Array.isArray(question.correctAnswer)) {
      return question.correctAnswer.map(a => question.options?.[a - 1] || a).join(', ');
    }
    return String(question.correctAnswer || '-');
  };

  const getStudentAnswer = (question: PrepLevelTestQuestion): string => {
    const answer = studentAnswers[question.id];
    if (answer === undefined || answer === null || answer === '') {
      return '미응답';
    }
    
    if (question.inputType === 'sentenceClick') {
      if (typeof answer === 'object') {
        const subjects = answer.subjects?.join(', ') || '';
        const verbs = answer.verbs?.join(', ') || '';
        return `주어: ${subjects} / 동사: ${verbs}`;
      }
      return String(answer);
    }
    
    if (question.options && typeof answer === 'number') {
      return `${answer}. ${question.options[answer - 1] || ''}`;
    }
    
    // 주관식 다중 정답 문제 (correctAnswers)에서 쉼표 구분 답안은 원본 그대로 표시
    if (question.correctAnswers && typeof answer === 'string' && (answer.includes(',') || answer.includes('，'))) {
      return String(answer);
    }
    
    // 객관식 문제에서 문자열 답안 처리 (과거 주관식에서 마이그레이션되지 않은 데이터)
    if (question.options && typeof answer === 'string' && isNaN(Number(answer))) {
      const { index, similarity } = findBestMatchingOption(answer, question.options);
      
      // 85% 이상 유사하면 해당 옵션으로 표시
      if (similarity >= 0.85 && index >= 0) {
        return `${index + 1}. ${question.options[index]}`;
      }
      
      // 매칭되지 않으면 원본 문자열 표시
      return String(answer);
    }
    
    if (Array.isArray(answer)) {
      if (question.options) {
        return answer.map(a => `${a}. ${question.options?.[a - 1] || ''}`).join(', ');
      }
      return answer.join(', ');
    }
    
    return String(answer);
  };

  const isCorrect = (question: PrepLevelTestQuestion): boolean => {
    const answer = studentAnswers[question.id];
    if (answer === undefined || answer === null || answer === '') {
      return false;
    }

    if (question.inputType === 'sentenceClick') {
      if (typeof answer === 'object') {
        const correctSubjects = question.correctSubjects || [];
        const correctVerbs = question.correctVerbs || [];
        const optionalSubjects = question.optionalSubjects || [];
        const optionalVerbs = question.optionalVerbs || [];
        const studentSubjects: string[] = answer.subjects || [];
        const studentVerbs: string[] = answer.verbs || [];
        
        const extractWord = (item: string) => {
          const parts = item.split('-');
          return parts.length > 1 ? parts.slice(1).join('-') : item;
        };
        
        const normalizedStudentSubjects = studentSubjects.map(extractWord).map(s => s.toLowerCase().replace(/[,.]$/g, ''));
        const normalizedStudentVerbs = studentVerbs.map(extractWord).map(s => s.toLowerCase().replace(/[,.]$/g, ''));
        
        // 필수 정답이 포함되어 있는지 확인
        const requiredSubjectsMatch = correctSubjects.every((s: string) => 
          normalizedStudentSubjects.some(ss => ss.includes(s.toLowerCase()) || s.toLowerCase().includes(ss))
        );
        // 동사는 correctVerbs 중 하나 이상만 맞으면 정답 (모두 맞출 필요 없음)
        const requiredVerbsMatch = correctVerbs.length === 0 || correctVerbs.some((v: string) => 
          normalizedStudentVerbs.some(sv => sv.includes(v.toLowerCase()) || v.toLowerCase().includes(sv))
        );
        
        // 학생이 선택한 것이 모두 정답(필수+선택적)에 속하는지 확인
        const allSubjectsValid = normalizedStudentSubjects.every((s: string) => 
          correctSubjects.some(cs => cs.toLowerCase() === s || s.includes(cs.toLowerCase())) || 
          optionalSubjects.some(os => os.toLowerCase() === s || s.includes(os.toLowerCase()))
        );
        const allVerbsValid = normalizedStudentVerbs.every((v: string) => 
          correctVerbs.some(cv => cv.toLowerCase() === v || v.includes(cv.toLowerCase())) || 
          optionalVerbs.some(ov => ov.toLowerCase() === v || v.includes(ov.toLowerCase()))
        );
        
        // 필수 동사가 없고 선택적 동사만 있는 경우, 최소 하나의 선택적 동사를 선택해야 함
        const hasAtLeastOneVerb = correctVerbs.length > 0 || 
          (optionalVerbs.length > 0 && normalizedStudentVerbs.some(v => 
            optionalVerbs.some(ov => ov.toLowerCase() === v || v.includes(ov.toLowerCase()))
          ));
        
        return requiredSubjectsMatch && requiredVerbsMatch && allSubjectsValid && allVerbsValid && hasAtLeastOneVerb;
      }
      return false;
    }

    // 복수 선택 문제 (number[] correctAnswer)
    if (Array.isArray(question.correctAnswer) && typeof question.correctAnswer[0] === 'number') {
      if (!Array.isArray(answer)) return false;
      const correctSet = new Set(question.correctAnswer);
      const answerSet = new Set(answer);
      if (correctSet.size !== answerSet.size) return false;
      for (const item of correctSet) {
        if (!answerSet.has(item)) return false;
      }
      return true;
    }

    // 다중 텍스트 답안 (correctAnswers 배열) - 가능한 정답 중 하나만 맞으면 정답
    if (question.correctAnswers) {
      // requireAllAnswers가 true면 모든 정답을 입력해야 함
      if (question.requireAllAnswers) {
        const studentAnswerStr = String(answer).toLowerCase().replace(/\s/g, '');
        const studentParts = studentAnswerStr.split(/[,，]/).map(a => a.trim()).filter(a => a).sort();
        const correctParts = question.correctAnswers.map(a => a.toLowerCase().replace(/\s/g, '')).sort();
        return studentParts.length === correctParts.length && 
               correctParts.every(c => studentParts.some(s => s === c));
      }
      
      // wordArrangement 문제는 배열을 합쳐서 비교
      if (question.inputType === 'wordArrangement' && Array.isArray(answer)) {
        const joinedAnswer = answer.join(' ').toLowerCase().replace(/\s/g, '');
        for (const correctAns of question.correctAnswers) {
          const correctStr = correctAns.toLowerCase().replace(/\s/g, '');
          if (joinedAnswer === correctStr) {
            return true;
          }
        }
        // correctAnswer와도 비교
        const mainCorrect = String(question.correctAnswer).toLowerCase().replace(/\s/g, '');
        return joinedAnswer === mainCorrect;
      }
      
      // 배열인 경우 각 요소를 개별적으로 확인 (text 문제 등)
      if (Array.isArray(answer)) {
        // 학생이 제출한 각 답안이 correctAnswers 중 하나와 일치하는지 확인
        for (const studentAns of answer) {
          const studentStr = String(studentAns).toLowerCase().replace(/\s/g, '');
          for (const correctAns of question.correctAnswers) {
            const correctStr = correctAns.toLowerCase().replace(/\s/g, '');
            if (studentStr === correctStr) {
              return true;
            }
          }
        }
        return false;
      }
      
      const studentAnswerStr = String(answer).toLowerCase().replace(/\s/g, '');
      
      // 쉼표로 구분된 복수 답안인 경우 (예: "traveling, to travel")
      if (studentAnswerStr.includes(',') || studentAnswerStr.includes('，')) {
        const studentParts = studentAnswerStr.split(/[,，]/).map(a => a.trim()).filter(a => a).sort();
        
        // correctAnswers 중 쉼표가 포함된 정답이 있는지 확인
        for (const correctAns of question.correctAnswers) {
          const correctStr = correctAns.toLowerCase().replace(/\s/g, '');
          if (correctStr.includes(',') || correctStr.includes('，')) {
            const correctParts = correctStr.split(/[,，]/).map(a => a.trim()).filter(a => a).sort();
            if (studentParts.length === correctParts.length && 
                studentParts.every((s, i) => s === correctParts[i])) {
              return true;
            }
          }
        }
        return false;
      }
      
      // 단일 답안인 경우 - correctAnswers 중 하나와 일치하면 정답
      for (const correctAns of question.correctAnswers) {
        const correctStr = correctAns.toLowerCase().replace(/\s/g, '');
        if (studentAnswerStr === correctStr) {
          return true;
        }
      }
      return false;
    }

    if (question.inputType === 'text' || question.inputType === 'wordArrangement') {
      const correctStr = String(question.correctAnswer).toLowerCase().replace(/\s/g, '');
      
      // 배열로 저장된 답안 처리
      let studentAnswer = answer;
      if (Array.isArray(answer)) {
        studentAnswer = answer.join(' ');
      }
      
      let studentStr = String(studentAnswer).toLowerCase();
      
      // 쉼표로 구분된 단어 배열인 경우 (예: "You, should, tell, him")
      if (studentStr.includes(',')) {
        studentStr = studentStr.split(',').map(w => w.trim()).join('');
      } else {
        studentStr = studentStr.replace(/\s/g, '');
      }
      
      // correctAnswers 배열이 있으면 그 중 하나와 일치하는지 확인
      if (question.correctAnswers && question.correctAnswers.length > 0) {
        return question.correctAnswers.some(correctAns => {
          const normalizedCorrect = String(correctAns).toLowerCase().replace(/\s/g, '');
          return normalizedCorrect === studentStr;
        });
      }
      
      return correctStr === studentStr;
    }

    // 객관식 문제에서 문자열 답안 처리 (과거 주관식에서 마이그레이션된 데이터 호환)
    if (question.options && typeof answer === 'string' && isNaN(Number(answer))) {
      const { index, similarity } = findBestMatchingOption(answer, question.options);
      
      // 85% 이상 유사하면 해당 옵션으로 매칭
      if (similarity >= 0.85 && index >= 0) {
        return (index + 1) === Number(question.correctAnswer);
      }
      
      // 매칭되지 않으면 오답
      return false;
    }

    return Number(answer) === Number(question.correctAnswer);
  };

  const getSectionColor = (section: string) => {
    switch (section) {
      case 'reading':
        return 'bg-emerald-400';
      case 'grammarA':
        return 'bg-sky-400';
      case 'grammarB':
        return 'bg-indigo-400';
      case 'grammarC':
        return 'bg-violet-400';
      case 'vocabulary':
        return 'bg-amber-400';
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto border-white/10 bg-slate-950/80 backdrop-blur-2xl text-slate-100 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] [&>button]:text-slate-400 [&>button]:hover:text-amber-300">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/60 to-transparent" />
        <div className="pointer-events-none absolute -top-24 -left-16 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-56 w-56 rounded-full bg-sky-400/10 blur-3xl" />

        <DialogHeader className="relative">
          <DialogTitle className="flex items-center gap-3 text-slate-50">
            <span className={`w-2.5 h-2.5 rounded-full ring-4 ring-white/5 ${getSectionColor(section)}`} />
            <span className="tracking-[0.08em] font-semibold">{categoryName} 문제 상세</span>
            <Badge variant="outline" className="ml-auto border-amber-300/30 bg-amber-300/10 text-amber-200 font-normal tracking-wider">
              {filteredQuestions.length}문제
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="relative space-y-4 mt-4">
          {filteredQuestions.map((question) => {
            const correct = isCorrect(question);
            const studentAnswer = getStudentAnswer(question);
            const correctAnswer = getCorrectAnswer(question);

            return (
              <div 
                key={question.id} 
                className={`relative p-5 rounded-2xl border backdrop-blur-xl transition-colors ${
                  correct 
                    ? 'bg-emerald-400/[0.06] border-emerald-300/20' 
                    : 'bg-rose-400/[0.06] border-rose-300/20'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 text-slate-100 flex items-center justify-center text-sm font-semibold">
                      {question.id}
                    </span>
                    <Badge variant="secondary" className="text-xs bg-white/10 text-slate-200 border-0">
                      {question.difficulty === 'basic' ? '하' : question.difficulty === 'intermediate' ? '중' : '상'}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-white/15 text-slate-300">
                      {getPrepQuestionPoints(question)}점
                    </Badge>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                    correct
                      ? 'bg-emerald-400/15 border-emerald-300/30 text-emerald-300'
                      : 'bg-rose-400/15 border-rose-300/30 text-rose-300'
                  }`}>
                    {correct ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </div>
                </div>

                {/* Question Text */}
                <p 
                  className="text-sm text-slate-100 leading-relaxed mb-3 whitespace-pre-wrap [&_u]:underline"
                  dangerouslySetInnerHTML={{ __html: question.questionText }}
                />

                {/* Question Content if exists */}
                {question.questionContent && (
                  <div 
                    className="text-xs text-slate-300 mb-3 p-3 bg-white/[0.04] rounded-xl border border-white/10 whitespace-pre-wrap [&_u]:underline"
                    dangerouslySetInnerHTML={{ __html: question.questionContent }}
                  />
                )}

                {/* Passage Text if exists (for reading questions) */}
                {question.passageText && (
                  <div 
                    className="text-xs text-slate-300 mb-3 p-3 bg-white/[0.04] rounded-xl border border-white/10 whitespace-pre-wrap leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: question.passageText }}
                  />
                )}

                {/* Options if exists */}
                {question.options && (
                  <div className="mb-3 space-y-1">
                    {question.options.map((opt, idx) => {
                      const optNum = idx + 1;
                      const correctAnswerValue = question.correctAnswer;
                      const isCorrectOption = Array.isArray(correctAnswerValue) 
                        ? correctAnswerValue.includes(optNum)
                        : optNum === correctAnswerValue;
                      
                      const studentAnswerValue = studentAnswers[question.id];
                      const isStudentChoice = Array.isArray(studentAnswerValue)
                        ? studentAnswerValue.includes(optNum)
                        : Number(studentAnswerValue) === optNum;
                      
                      return (
                        <div 
                          key={idx}
                          className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 border [&_u]:underline ${
                            isCorrectOption 
                              ? 'bg-emerald-400/10 border-emerald-300/25 text-emerald-200 font-medium' 
                              : isStudentChoice 
                                ? 'bg-rose-400/10 border-rose-300/25 text-rose-200' 
                                : 'text-slate-400 border-transparent'
                          }`}
                        >
                          <Circle className={`w-3 h-3 flex-shrink-0 ${isStudentChoice ? 'fill-current' : ''}`} />
                          <span dangerouslySetInnerHTML={{ __html: `${optNum}. ${opt}` }} />
                          {isCorrectOption && <Check className="w-3 h-3 ml-auto flex-shrink-0" />}
                          {isStudentChoice && !isCorrectOption && <X className="w-3 h-3 ml-auto flex-shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                )}


                {/* Answer Summary */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
                    <span className="text-[11px] uppercase tracking-[0.16em] text-slate-400 block mb-1">학생 답안</span>
                    <span 
                      className={`font-medium [&_u]:underline ${correct ? 'text-emerald-300' : 'text-rose-300'}`}
                      dangerouslySetInnerHTML={{ __html: studentAnswer }}
                    />
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
                    <span className="text-[11px] uppercase tracking-[0.16em] text-slate-400 block mb-1">정답</span>
                    <span 
                      className="font-medium text-amber-200 [&_u]:underline"
                      dangerouslySetInnerHTML={{ __html: correctAnswer }}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {filteredQuestions.length === 0 && (
            <div className="text-center text-slate-400 py-10 border border-dashed border-white/10 rounded-2xl">
              해당 카테고리의 문제가 없습니다.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrepQuestionDetailDialog;
