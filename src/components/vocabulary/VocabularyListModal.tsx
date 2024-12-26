import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Book } from "lucide-react";
import { VocabularyTable } from './VocabularyTable';
import { QuestionData } from './types';

interface VocabularyListModalProps {
  questions: QuestionData[];
}

export const VocabularyListModal = ({ questions }: VocabularyListModalProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full group">
          <Book className="w-5 h-5 mr-2 text-purple-500 group-hover:text-purple-600" />
          동반어 단어장 제작
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent flex items-center gap-2">
            <Book className="w-6 h-6" />
            동반어 단어장
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8 p-4">
          {questions.map((question, index) => (
            <VocabularyTable 
              key={index} 
              question={question} 
              questionIndex={index}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};