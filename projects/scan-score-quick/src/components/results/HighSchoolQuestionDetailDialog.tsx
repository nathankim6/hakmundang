import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Check, X, Circle } from 'lucide-react';
import { allHighSchoolQuestions, HighSchoolLevelTestQuestion } from '@/data/highSchoolLevelTestQuestions';

interface HighSchoolQuestionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryName: string;
  section: string;
  studentAnswers: Record<string, any>;
}

const HighSchoolQuestionDetailDialog = ({
  open,
  onOpenChange,
  categoryName,
  section,
  studentAnswers
}: HighSchoolQuestionDetailDialogProps) => {
  // 해당 섹션과 카테고리의 문제들 필터링
  const filteredQuestions = allHighSchoolQuestions.filter(
    q => q.section === section && q.subCategory === categoryName
  );

  const getCorrectAnswer = (question: HighSchoolLevelTestQuestion): string => {
    if (question.correctAnswers) {
      return question.correctAnswers.join(' / ');
    }
    if (question.options && typeof question.correctAnswer === 'number') {
      return `${question.correctAnswer}. ${question.options[question.correctAnswer - 1]}`;
    }
    return String(question.correctAnswer || '-');
  };

  const getStudentAnswer = (question: HighSchoolLevelTestQuestion): string => {
    const answer = studentAnswers[question.id];
    if (answer === undefined || answer === null || answer === '') {
      return '미응답';
    }
    
    if (question.options && typeof answer === 'number') {
      return `${answer}. ${question.options[answer - 1] || ''}`;
    }
    
    return String(answer);
  };

  const isCorrect = (question: HighSchoolLevelTestQuestion): boolean => {
    const answer = studentAnswers[question.id];
    if (answer === undefined || answer === null || answer === '') {
      return false;
    }

    // 복수 정답 허용
    if (question.correctAnswers) {
      const studentStr = String(answer).toLowerCase().replace(/\s/g, '');
      return question.correctAnswers.some(
        correctAns => correctAns.toLowerCase().replace(/\s/g, '') === studentStr
      );
    }

    if (question.inputType === 'text') {
      const correctStr = String(question.correctAnswer).toLowerCase().replace(/\s/g, '');
      const studentStr = String(answer).toLowerCase().replace(/\s/g, '');
      return correctStr === studentStr;
    }

    return Number(answer) === Number(question.correctAnswer);
  };

  const getSectionColor = (section: string) => {
    switch (section) {
      case 'vocabulary':
        return 'bg-purple-500';
      case 'grammar':
        return 'bg-blue-500';
      case 'practical':
        return 'bg-teal-500';
      case 'reading':
        return 'bg-emerald-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${getSectionColor(section)}`} />
            {categoryName} 문제 상세
            <Badge variant="outline" className="ml-2">
              {filteredQuestions.length}문제
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {filteredQuestions.map((question) => {
            const correct = isCorrect(question);
            const studentAnswer = getStudentAnswer(question);
            const correctAnswer = getCorrectAnswer(question);

            return (
              <div 
                key={question.id} 
                className={`p-4 rounded-lg border ${
                  correct 
                    ? 'bg-emerald-50 border-emerald-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center text-sm font-bold">
                      {question.id}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {question.difficulty === 'basic' ? '하' : question.difficulty === 'intermediate' ? '중' : '상'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {question.points}점
                    </Badge>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    correct ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {correct ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                  </div>
                </div>

                {/* Question Text */}
                <p 
                  className="text-sm text-slate-700 mb-3 whitespace-pre-wrap [&_u]:underline"
                  dangerouslySetInnerHTML={{ __html: question.questionText }}
                />

                {/* Question Content if exists */}
                {question.questionContent && (
                  <div 
                    className="text-xs text-slate-600 mb-3 p-2 bg-white/50 rounded border border-slate-200 whitespace-pre-wrap [&_u]:underline"
                    dangerouslySetInnerHTML={{ __html: question.questionContent }}
                  />
                )}

                {/* Passage Text if exists (for reading questions) */}
                {question.passageText && (
                  <div 
                    className="text-xs text-slate-600 mb-3 p-3 bg-slate-50 rounded border border-slate-200 whitespace-pre-wrap leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: question.passageText }}
                  />
                )}

                {/* Options if exists */}
                {question.options && (
                  <div className="mb-3 space-y-1">
                    {question.options.map((opt, idx) => {
                      const optNum = idx + 1;
                      const isCorrectOption = optNum === question.correctAnswer;
                      const isStudentChoice = Number(studentAnswers[question.id]) === optNum;
                      
                      return (
                        <div 
                          key={idx}
                          className={`text-xs px-2 py-1 rounded flex items-center gap-2 [&_u]:underline ${
                            isCorrectOption 
                              ? 'bg-emerald-100 text-emerald-800 font-medium' 
                              : isStudentChoice 
                                ? 'bg-red-100 text-red-800' 
                                : 'text-slate-600'
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
                  <div className="p-2 rounded bg-white/80 border border-slate-200">
                    <span className="text-xs text-slate-500 block mb-1">학생 답안</span>
                    <span 
                      className={`font-medium [&_u]:underline ${correct ? 'text-emerald-600' : 'text-red-600'}`}
                      dangerouslySetInnerHTML={{ __html: studentAnswer }}
                    />
                  </div>
                  <div className="p-2 rounded bg-white/80 border border-slate-200">
                    <span className="text-xs text-slate-500 block mb-1">정답</span>
                    <span 
                      className="font-medium text-emerald-600 [&_u]:underline"
                      dangerouslySetInnerHTML={{ __html: correctAnswer }}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {filteredQuestions.length === 0 && (
            <div className="text-center text-slate-500 py-8">
              해당 카테고리의 문제가 없습니다.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HighSchoolQuestionDetailDialog;
