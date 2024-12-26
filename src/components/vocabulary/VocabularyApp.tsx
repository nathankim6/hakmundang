import React, { useState } from 'react';
import { Star, Edit2, Printer } from 'lucide-react';

const VocabularyApp = () => {
  const [title, setTitle] = useState("옳은보카(영등포고 1학년 1학기 중간고사 대비)");
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const data = [
    {
      표제어: 'envy',
      품사: '동사',
      난이도: 2,
      표제어뜻: '부러워하다',
      영영정의: 'to feel unhappy because you want something that someone else has',
      동의어: ['covet', 'desire', 'long for'],
      동의어뜻: ['탐내다', '바라다', '갈망하다'],
      반의어: ['admire', 'appreciate'],
      반의어뜻: ['감탄하다', '감사하다']
    },
    {
      표제어: 'deceive',
      품사: '동사',
      난이도: 3,
      표제어뜻: '속이다',
      영영정의: 'to make someone believe something that is not true',
      동의어: ['mislead', 'delude', 'trick'],
      동의어뜻: ['오도하다', '현혹하다', '속이다'],
      반의어: ['enlighten', 'inform'],
      반의어뜻: ['깨우치다', '알리다']
    },
    {
      표제어: 'ownership',
      품사: '명사',
      난이도: 2,
      표제어뜻: '소유권',
      영영정의: 'the fact of owning something',
      동의어: ['possession', 'proprietorship'],
      동의어뜻: ['소유', '소유권'],
      반의어: ['dispossession'],
      반의어뜻: ['박탈']
    },
    {
      표제어: 'passion',
      품사: '명사',
      난이도: 2,
      표제어뜻: '열정',
      영영정의: 'a very strong feeling of love, hatred, anger, enthusiasm',
      동의어: ['enthusiasm', 'fervor', 'zeal'],
      동의어뜻: ['열의', '열광', '열성'],
      반의어: ['apathy', 'indifference'],
      반의어뜻: ['무관심', '무관심']
    },
    {
      표제어: 'treat',
      품사: '동사',
      난이도: 2,
      표제어뜻: '대하다',
      영영정의: 'to behave toward someone or deal with something in a particular way',
      동의어: ['handle', 'deal with', 'behave toward'],
      동의어뜻: ['다루다', '처리하다', '대우하다'],
      반의어: [],
      반의어뜻: []
    },
    {
      표제어: 'kindly',
      품사: '부사',
      난이도: 1,
      표제어뜻: '친절하게',
      영영정의: 'in a kind and friendly way',
      동의어: ['benevolently', 'gently', 'considerately'],
      동의어뜻: ['자비롭게', '부드럽게', '배려하여'],
      반의어: ['harshly', 'cruelly'],
      반의어뜻: ['잔인하게', '잔혹하게']
    },
    {
      표제어: 'limitation',
      품사: '명사',
      난이도: 3,
      표제어뜻: '제한',
      영영정의: 'a rule or condition that limits something',
      동의어: ['constraint', 'restriction', 'boundary'],
      동의어뜻: ['제약', '제한', '경계'],
      반의어: ['freedom', 'liberty'],
      반의어뜻: ['자유', '자유']
    },
    {
      표제어: 'cognitive',
      품사: '형용사',
      난이도: 3,
      표제어뜻: '인지의',
      영영정의: 'related to the mental process of understanding',
      동의어: ['mental', 'intellectual', 'cerebral'],
      동의어뜻: ['정신적인', '지적인', '두뇌의'],
      반의어: [],
      반의어뜻: []
    }
  ];

  const renderDifficulty = (level) => (
    <div className="flex">
      {[...Array(level)].map((_, i) => (
        <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
      ))}
    </div>
  );

  const handlePrint = () => {
    // PDF 출력을 위한 스타일 적용
    const originalTitle = document.title;
    document.title = title; // 현재 단어장 제목으로 변경
    window.print();
    document.title = originalTitle; // 원래 제목으로 복구
  };

  const Footer = ({ pageNumber }) => (
    <div className="flex items-center justify-end py-4 px-4 print:py-2">
      <div className="text-sm text-gray-500">
        - {pageNumber} -
      </div>
    </div>
  );

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
                  <Footer />
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

export default VocabularyApp;
