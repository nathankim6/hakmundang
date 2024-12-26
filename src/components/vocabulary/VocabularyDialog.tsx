import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Book, Printer } from "lucide-react";
import { VocabularyList } from './VocabularyList';
import { QuestionData } from './types';

interface VocabularyDialogProps {
  questions: QuestionData[];
}

export const VocabularyDialog = ({ questions }: VocabularyDialogProps) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full group">
          <Book className="w-5 h-5 mr-2 text-purple-500 group-hover:text-purple-600" />
          동반어 단어장 제작
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[210mm] min-h-[297mm] p-6 print:p-0">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent flex items-center gap-2 print:hidden">
            <Book className="w-6 h-6" />
            동반어 단어장
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8">
          <VocabularyList questions={questions} />
          
          <div className="flex justify-end print:hidden">
            <Button onClick={handlePrint} className="bg-purple-500 hover:bg-purple-600">
              <Printer className="w-4 h-4 mr-2" />
              PDF로 저장
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};