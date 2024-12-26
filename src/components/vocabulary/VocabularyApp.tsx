import React, { useState } from 'react';
import { Star, Edit2, Printer } from 'lucide-react';

interface FooterProps {
  pageNumber: number;
}

const Footer = ({ pageNumber }: FooterProps) => (
  <div className="flex items-center justify-end py-4 px-4 print:py-2">
    <div className="text-sm text-gray-500">
      - {pageNumber} -
    </div>
  </div>
);

export interface VocabularyWord {
  표제어: string;
  품사: string;
  난이도: number;
  표제어뜻: string;
  영영정의: string;
  동의어: string[];
  동의어뜻: string[];
  반의어: string[];
  반의어뜻: string[];
}

export interface VocabularyAppProps {
  data: VocabularyWord[];
}

export const VocabularyApp: React.FC<VocabularyAppProps> = ({ data }) => {
  const [title, setTitle] = useState("옳은보카(영등포고 1학년 1학기 중간고사 대비)");
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const renderDifficulty = (level: number) => (
    <div className="flex">
      {[...Array(level)].map((_, i) => (
        <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
      ))}
    </div>
  );

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = title;
    window.print();
    document.title = originalTitle;
  };

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      <header className="bg-white shadow-sm print:shadow-none">
        <div className="max-w-6xl mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img 
              src="/api/placeholder/80/80" 
              alt="Orun Academy Logo" 
              className="h-8 w-auto print:hidden"
            />
            {isEditingTitle ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyPress={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                className="text-xl font-bold text-gray-800 border-b-2 border-blue-500 focus:outline-none"
                autoFocus
              />
            ) : (
              <h1 
                className="text-xl font-bold text-gray-800 font-sans hover:cursor-pointer flex items-center gap-2 print:text-2xl"
                onClick={() => setIsEditingTitle(true)}
              >
                {title}
                <Edit2 className="w-4 h-4 text-gray-400 print:hidden" />
              </h1>
            )}
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 print:hidden"
          >
            <Printer className="w-4 h-4 mr-2" />
            PDF 출력
          </button>
        </div>
      </header>

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
        @media print {
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
          {data.map((word, index) => (
            <React.Fragment key={word.표제어}>
              {index > 0 && index % 8 === 0 && (
                <>
                  <div className="col-span-2 print:break-after-page">
                    <Footer pageNumber={Math.floor(index / 8)} />
                  </div>
                </>
              )}
              <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3 print:border-gray-300 print:shadow-none">
                <div className="flex items-center mb-2">
                  <span className="px-2 py-0.5 bg-blue-100 rounded text-blue-800 text-xs font-medium print:bg-blue-50">
                    {word.품사}
                  </span>
                  <h2 className="ml-2 text-base font-bold text-blue-900 flex-shrink-0">
                    {word.표제어}
                    <span className="ml-2 font-normal text-gray-600">
                      {word.표제어뜻}
                    </span>
                  </h2>
                  <div className="ml-2 flex-shrink-0">
                    {renderDifficulty(word.난이도)}
                  </div>
                </div>

                <div className="mb-2 text-xs">
                  <span className="font-medium text-blue-600 mr-1">영영사전</span>
                  <span className="text-gray-600 italic">{word.영영정의}</span>
                </div>

                <div className="bg-gray-50 rounded-sm p-2 print:bg-gray-100">
                  <h3 className="font-medium text-gray-700 mb-1 flex items-center text-xs">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1"></span>
                    유의어 / 반의어
                  </h3>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                    <div className="space-y-1">
                      {word.동의어.map((syn, i) => (
                        <div key={`syn-${i}`} className="flex items-center overflow-hidden">
                          <span className="text-blue-600 font-medium w-20 flex-shrink-0">{syn}</span>
                          <span className="mx-1 text-gray-400">|</span>
                          <span className="text-gray-600 truncate">{word.동의어뜻[i]}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-1">
                      {word.반의어.map((ant, i) => (
                        <div key={`ant-${i}`} className="flex items-center overflow-hidden">
                          <span className="text-red-600 font-medium w-20 flex-shrink-0">{ant}</span>
                          <span className="mx-1 text-gray-400">|</span>
                          <span className="text-gray-600 truncate">{word.반의어뜻[i]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {index % 8 === 7 && (
                <div className="col-span-2 print:break-after-page">
                  <Footer pageNumber={Math.floor(index / 8) + 1} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        {data.length % 8 !== 0 && <Footer pageNumber={Math.ceil(data.length / 8)} />}
      </main>
    </div>
  );
};