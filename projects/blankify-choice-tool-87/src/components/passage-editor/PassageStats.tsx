
import React from 'react';
import { Answer } from './types';

interface PassageStatsProps {
  answers: Answer[];
  choiceAnswers: Answer[];
  orderAnswers: Answer[];
}

const PassageStats: React.FC<PassageStatsProps> = ({ 
  answers, 
  choiceAnswers, 
  orderAnswers 
}) => {
  if (answers.length === 0 && choiceAnswers.length === 0 && orderAnswers.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-1 text-sm text-slate-500 flex flex-wrap gap-x-3 gap-y-1">
      {answers.length > 0 && (
        <span className="inline-flex items-center">
          <span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></span>
          {answers.length}개의 빈칸
        </span>
      )}
      {choiceAnswers.length > 0 && (
        <span className="inline-flex items-center">
          <span className="w-2 h-2 rounded-full bg-purple-500 mr-1.5"></span>
          {choiceAnswers.length}개의 선택문제
        </span>
      )}
      {orderAnswers.length > 0 && (
        <span className="inline-flex items-center">
          <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5"></span>
          {orderAnswers.length}개의 어순배열 문제
        </span>
      )}
    </div>
  );
};

export default PassageStats;
