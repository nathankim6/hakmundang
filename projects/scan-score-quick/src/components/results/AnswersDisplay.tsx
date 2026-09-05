
import React from 'react';
import { isSubjectiveAnswerCorrect } from '@/utils/testUtils/answerValidation';

interface AnswersDisplayProps {
  studentAnswers: Record<number, any>;
  correctAnswers: Record<number, any>;
}

const AnswersDisplay = ({ studentAnswers, correctAnswers }: AnswersDisplayProps) => {
  return (
    <div className="mt-4 grid grid-cols-10 gap-1.5">
      {Object.keys(studentAnswers).map((questionNumber) => {
        const num = parseInt(questionNumber);
        const studentAnswer = studentAnswers[num]?.answer;
        const correctAnswer = correctAnswers[num]?.answer;
        const questionType = correctAnswers[num]?.type;
        const questionPoints = correctAnswers[num]?.points || 2;
        const grammarCategory = correctAnswers[num]?.grammarCategory;
        
        let isCorrect = false;
        
        if (questionType === 'subjective') {
          isCorrect = isSubjectiveAnswerCorrect(String(studentAnswer), String(correctAnswer));
        } else if (questionType === 'multiple') {
          // 배열로 만들어서 두 배열을 정렬, 길이와 값 모두 비교
          const toArray = (v: any) => (Array.isArray(v) ? v : v !== undefined ? [v] : []);
          const a1 = toArray(studentAnswer).sort();
          const a2 = toArray(correctAnswer).sort();
          isCorrect = (
            a1.length === a2.length &&
            a1.every((v, i) => v === a2[i])
          );
        } else {
          isCorrect = studentAnswer === correctAnswer;
        }
        
        return (
          <div 
            key={num} 
            className={`p-1.5 rounded-lg border relative overflow-hidden ${
              isCorrect ? 'bg-blue-50/80 border-blue-200' : 'bg-red-50/80 border-red-200'
            }`}
          >
            {grammarCategory && (
              <div className={`text-[7px] font-semibold tracking-wide uppercase truncate mb-1 px-1.5 py-0.5 rounded-full text-center ${
                isCorrect 
                  ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border border-purple-200/60' 
                  : 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200/60'
              }`} title={grammarCategory}>
                {grammarCategory}
              </div>
            )}
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">{num}.</span>
              <span className={`font-bold text-[10px] px-1.5 py-0.5 rounded-full ${
                isCorrect 
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200/60' 
                  : 'bg-orange-100 text-orange-700 border border-orange-200/60'
              }`}>
                {questionPoints}p
              </span>
            </div>
            <div className="text-center mt-0.5 space-y-0.5">
              <span className={`text-base font-bold ${isCorrect ? 'text-blue-600' : 'text-red-500'}`}>
                {isCorrect ? '○' : '×'}
              </span>
              <div className="text-[10px] space-x-0.5">
                <span className={`inline-block px-1 py-0.5 rounded ${isCorrect ? 'bg-blue-100' : 'bg-red-100'}`}>
                  선택: {Array.isArray(studentAnswer) ? studentAnswer.join(', ') : (studentAnswer ?? '-')}
                </span>
                <span className="inline-block px-1 py-0.5 rounded bg-slate-100">
                  정답: {Array.isArray(correctAnswer) ? correctAnswer.join(', ') : (correctAnswer ?? '-')}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AnswersDisplay;
