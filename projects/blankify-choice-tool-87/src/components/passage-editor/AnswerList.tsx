
import React from 'react';
import { Answer } from './types';

interface AnswerListProps {
  answers: Answer[];
  choiceAnswers: Answer[];
  orderAnswers: Answer[];
}

const AnswerList: React.FC<AnswerListProps> = ({ 
  answers, 
  choiceAnswers, 
  orderAnswers 
}) => {
  if (answers.length === 0 && choiceAnswers.length === 0 && orderAnswers.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 animate-fade-in text-slate-700">
      {answers.length > 0 && (
        <div className="mb-3">
          <h3 className="font-medium mb-2 text-slate-800 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            빈칸 정답:
          </h3>
          <div className="pl-5">
            {answers
              .sort((a, b) => a.number - b.number)
              .map((answer, idx) => (
                <span key={idx} className="inline-block mr-3">
                  <span className="font-medium">({answer.number})</span> {answer.text}
                </span>
              ))}
          </div>
        </div>
      )}
      
      {choiceAnswers.length > 0 && (
        <div className="mb-3">
          <h3 className="font-medium mb-2 text-slate-800 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-500"></span>
            어법 정답:
          </h3>
          <div className="pl-5">
            {choiceAnswers
              .sort((a, b) => a.number - b.number)
              .map((answer, idx) => (
                <span key={idx} className="inline-block mr-3">
                  <span className="font-medium">({answer.number})</span> {answer.correctOption}
                </span>
              ))}
          </div>
        </div>
      )}
      
      {orderAnswers.length > 0 && (
        <div>
          <h3 className="font-medium mb-2 text-slate-800 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            서술형 정답:
          </h3>
          <div className="pl-5">
            {orderAnswers
              .sort((a, b) => a.number - b.number)
              .map((answer, idx) => (
                <span key={idx} className="inline-block mr-3">
                  <span className="font-medium">({answer.number})</span> {answer.originalOrder?.join(' ')}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnswerList;
