import React from 'react';
import { SynonymAntonymEditor } from '../SynonymAntonymEditor';
import { QuestionData } from '../vocabulary/types';

interface Question {
  id: string;
  content: string;
  questionNumber: number;
  originalText?: string;
}

interface GeneratedQuestionsProps {
  questions: Question[];
}

export const GeneratedQuestions: React.FC<GeneratedQuestionsProps> = ({ questions }) => {
  // Transform questions into QuestionData format
  const vocabularyQuestions: QuestionData[] = questions.map((question) => ({
    number: question.questionNumber,
    rows: question.content.split('\n')
      .filter(line => line.includes('|'))
      .map(line => {
        const cells = line.split('|').map(cell => cell.trim());
        if (cells.length >= 7 && !line.includes('-----') && cells[1] && cells[1] !== '표제어') {
          return {
            headword: cells[1],
            meaning: cells[2],
            difficulty: 1,
            partOfSpeech: '',
            example: '',
            synonyms: cells[3].split(/[,;\n]/).map(s => s.trim()).filter(s => s),
            synonymMeanings: cells[4].split(/[,;\n]/).map(s => s.trim()).filter(s => s),
            antonyms: cells[5].split(/[,;\n]/).map(s => s.trim()).filter(s => s),
            antonymMeanings: cells[6].split(/[,;\n]/).map(s => s.trim()).filter(s => s)
          };
        }
        return null;
      })
      .filter(row => row !== null)
  }));

  return (
    <div className="space-y-8">
      {questions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">생성된 문제</h2>
          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold mb-4">문제 {index + 1}</h3>
                  {question.originalText && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-md">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">원문</h4>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{question.originalText}</p>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{question.content}</div>
                </div>
              </div>
            ))}
          </div>
          
          {vocabularyQuestions.length > 0 && (
            <SynonymAntonymEditor questions={vocabularyQuestions} />
          )}
        </div>
      )}
    </div>
  );
};