import React, { useState, useEffect } from 'react';
import { WordData } from '@/types/vocabulary';
import { VocabularyHeader } from './vocabulary/VocabularyHeader';
import { VocabularyCard } from './vocabulary/VocabularyCard';
import { CardSetTitle } from './vocabulary/CardSetTitle';
import { processWordMeanings } from '@/utils/wordUtils';
import { useToast } from "@/hooks/use-toast";

interface VocabularyAppProps {
  initialData?: {
    title: string;
    words: WordData[];
  };
}

const defaultData = {
  title: "",
  words: []
};

const VocabularyApp: React.FC<VocabularyAppProps> = ({ initialData = defaultData }) => {
  const [title, setTitle] = useState(initialData.title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [examMode, setExamMode] = useState(0);
  const [data, setData] = useState<WordData[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const processedWords = processWordMeanings(initialData.words);
    setData(processedWords);
  }, [initialData.words]);

  const maskWord = (word: string, mode = 'default') => {
    if (mode === '뜻쓰기') {
      return '________';
    }
    if (word.length <= 1) return word;
    return word[0] + '________';
  };

  const handlePrint = () => {
    window.print();
  };

  const Footer = ({ pageNumber }: { pageNumber: number }) => (
    <div className="text-sm text-gray-500 mt-2 print:mt-1 text-center">
      - {pageNumber} -
    </div>
  );

  const wordSets = data.reduce((acc: WordData[][], curr, i) => {
    const setIndex = Math.floor(i / 8);
    if (!acc[setIndex]) {
      acc[setIndex] = [];
    }
    acc[setIndex].push(curr);
    return acc;
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="print:hidden">
        <VocabularyHeader
          title={title}
          isEditingTitle={isEditingTitle}
          examMode={examMode}
          setTitle={setTitle}
          setIsEditingTitle={setIsEditingTitle}
          setExamMode={setExamMode}
          handlePrint={handlePrint}
        />
      </div>

      <style type="text/css">{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:break-after-page {
            break-after: page;
            page-break-after: always;
          }
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }

          .avoid-break-inside {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      <main id="vocabulary-content" className="max-w-[210mm] mx-auto px-4 py-2 print:p-0 print:max-w-none">
        {wordSets.map((wordSet, setIndex) => (
          <div key={setIndex} className="mb-8 print:mb-0 avoid-break-inside">
            <CardSetTitle pageNumber={setIndex + 1} initialTitle={`Set ${setIndex + 1}`} />
            <div className="grid grid-cols-2 gap-3 print:gap-2">
              {wordSet.map((word) => (
                <VocabularyCard
                  key={word.표제어}
                  word={word}
                  examMode={examMode}
                  maskWord={maskWord}
                />
              ))}
            </div>
            <Footer pageNumber={setIndex + 1} />
            {setIndex !== wordSets.length - 1 && (
              <div className="print:break-after-page" />
            )}
          </div>
        ))}
      </main>
    </div>
  );
};

export default VocabularyApp;