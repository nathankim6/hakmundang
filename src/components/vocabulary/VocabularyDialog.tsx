import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Book, Printer } from "lucide-react";
import { VocabularyList } from './VocabularyList';
import { QuestionData } from './types';
import { Input } from "@/components/ui/input";

interface VocabularyDialogProps {
  questions: QuestionData[];
}

export const VocabularyDialog = ({ questions }: VocabularyDialogProps) => {
  const [title, setTitle] = useState("동반어 단어장");
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full group">
          <Book className="w-5 h-5 mr-2 text-purple-500 group-hover:text-purple-600" />
          동반어 단어장 제작
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[100vw] sm:max-w-[80vw] overflow-y-auto print:w-full print:max-w-none">
        <SheetHeader className="print:hidden">
          <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent flex items-center gap-2">
            <Book className="w-6 h-6" />
            동반어 단어장 편집
          </SheetTitle>
        </SheetHeader>
        
        <div className="p-6 space-y-8">
          <div className="print:hidden">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              단어장 제목
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="max-w-md"
              placeholder="단어장 제목을 입력하세요"
            />
          </div>

          <div className="print:mt-0">
            <h1 className="text-3xl font-bold text-center mb-8 print:block hidden">
              {title}
            </h1>
            <VocabularyList questions={questions} />
          </div>
          
          <div className="flex justify-between items-center print:hidden">
            <img 
              src="/lovable-uploads/53a2cfe3-c9d0-4828-bd0c-4b0036235a7f.png" 
              alt="ORUN ACADEMY Logo" 
              className="w-32 h-auto"
            />
            <Button onClick={handlePrint} className="bg-purple-500 hover:bg-purple-600">
              <Printer className="w-4 h-4 mr-2" />
              PDF로 저장
            </Button>
          </div>

          <div className="hidden print:block text-center mt-8">
            <img 
              src="/lovable-uploads/53a2cfe3-c9d0-4828-bd0c-4b0036235a7f.png" 
              alt="ORUN ACADEMY Logo" 
              className="w-32 h-auto mx-auto"
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};