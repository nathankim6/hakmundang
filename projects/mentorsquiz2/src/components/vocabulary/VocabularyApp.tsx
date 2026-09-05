import React, { useState } from 'react';
import { VocabularyHeader } from './components/VocabularyHeader';
import { WordCard } from './components/WordCard';
import { Footer } from './components/Footer';
import type { WordData } from './types';

interface VocabularyAppProps {
  initialData?: WordData[];
}

export const VocabularyApp: React.FC<VocabularyAppProps> = ({ initialData = [] }) => {
  const [title, setTitle] = useState("옳은보카(영등포고 1학년 1학기 중간고사 대비)");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [examMode, setExamMode] = useState(0);

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = title;
    window.print();
    document.title = originalTitle;
  };

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      <VocabularyHeader
        title={title}
        isEditingTitle={isEditingTitle}
        examMode={examMode}
        setTitle={setTitle}
        setIsEditingTitle={setIsEditingTitle}
        setExamMode={setExamMode}
        handlePrint={handlePrint}
      />

      <style type="text/css">{`
        @media screen {
          .print\\:hidden {
            display: initial;
          }
        }
        
        @media print {
          @page {
            size: A4;
            margin: 1cm;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:break-after-page {
            break-after: page;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
        }
      `}</style>

      <main className="max-w-6xl mx-auto px-4 py-4 print:px-0 print:py-2">
        <div className="grid grid-cols-2 gap-3 print:gap-4">
          {initialData.map((word, index) => (
            <React.Fragment key={word.표제어}>
              {index > 0 && index % 8 === 0 && (
                <>
                  <div className="col-span-2 print:break-after-page">
                    <Footer pageNumber={Math.floor(index / 8)} />
                  </div>
                </>
              )}
              <WordCard word={word} examMode={examMode} />
              {index % 8 === 7 && (
                <div className="col-span-2 print:break-after-page">
                  <Footer pageNumber={Math.floor((index + 1) / 8)} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        {initialData.length % 8 !== 0 && <Footer pageNumber={Math.ceil(initialData.length / 8)} />}
      </main>
    </div>
  );
};