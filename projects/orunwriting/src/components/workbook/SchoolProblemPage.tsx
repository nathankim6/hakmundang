import { useState } from "react";
import { A4Page } from "./A4Page";
import { SchoolProblem } from "@/data/schoolProblemsData";
import { SchoolProblemPopup } from "./SchoolProblemPopup";

// School logo imports
import guamLogo from "@/assets/school-logos/guam-high.png";
import danggokLogo from "@/assets/school-logos/danggok-high.png";
import sungnamLogo from "@/assets/school-logos/sungnam-high.png";
import soongeuiLogo from "@/assets/school-logos/soongeui-high.png";
import youngdeungpoLogo from "@/assets/school-logos/youngdeungpo-high.png";

// School name to logo mapping
const schoolLogoMap: Record<string, string> = {
  "구암고등학교": guamLogo,
  "당곡고등학교": danggokLogo,
  "성남고등학교": sungnamLogo,
  "숭의여자고등학교": soongeuiLogo,
  "영등포고등학교": youngdeungpoLogo,
};

interface SchoolProblemPageProps {
  schoolName: string;
  grade: number;
  semester: string;
  exam: string;
  problems: SchoolProblem[];
  startNumber: number;
  pageNumber: number;
  totalPages: number;
  allProblems?: SchoolProblem[]; // All problems across all pages for navigation
}

export function SchoolProblemPage({
  schoolName,
  grade,
  semester,
  exam,
  problems,
  startNumber,
  pageNumber,
  totalPages,
  allProblems,
}: SchoolProblemPageProps) {
  const logoSrc = schoolLogoMap[schoolName];
  const [selectedProblem, setSelectedProblem] = useState<SchoolProblem | null>(null);
  
  // Use allProblems for navigation if provided, otherwise use current page problems
  const navigationProblems = allProblems || problems;
  
  // Get current problem index in the navigation list
  const getCurrentIndex = () => {
    if (!selectedProblem) return -1;
    return navigationProblems.findIndex(p => p.number === selectedProblem.number);
  };
  
  const handlePrevious = () => {
    const currentIndex = getCurrentIndex();
    if (currentIndex > 0) {
      setSelectedProblem(navigationProblems[currentIndex - 1]);
    }
  };
  
  const handleNext = () => {
    const currentIndex = getCurrentIndex();
    if (currentIndex < navigationProblems.length - 1) {
      setSelectedProblem(navigationProblems[currentIndex + 1]);
    }
  };
  
  const hasPrevious = getCurrentIndex() > 0;
  const hasNext = getCurrentIndex() < navigationProblems.length - 1;
  
  return (
    <A4Page pageNumber={pageNumber} totalPages={totalPages} noPadding noHeader noFooter>
      <div 
        className="flex-1 flex flex-col h-full p-4 relative overflow-hidden"
        style={{ backgroundColor: '#f8fdf9' }}
      >
        {/* Background pattern */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 20%, #166534 1px, transparent 1px),
              radial-gradient(circle at 80% 80%, #166534 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />
        
        {/* Decorative corner ornaments - smaller */}
        <div className="absolute top-2 left-2 w-8 h-8 pointer-events-none">
          <svg viewBox="0 0 48 48" className="w-full h-full opacity-15">
            <path d="M0 24 Q0 0 24 0" fill="none" stroke="#166534" strokeWidth="2"/>
            <circle cx="4" cy="4" r="2" fill="#22c55e"/>
          </svg>
        </div>
        <div className="absolute top-2 right-2 w-8 h-8 pointer-events-none">
          <svg viewBox="0 0 48 48" className="w-full h-full opacity-15">
            <path d="M48 24 Q48 0 24 0" fill="none" stroke="#166534" strokeWidth="2"/>
            <circle cx="44" cy="4" r="2" fill="#22c55e"/>
          </svg>
        </div>
        <div className="absolute bottom-2 left-2 w-8 h-8 pointer-events-none">
          <svg viewBox="0 0 48 48" className="w-full h-full opacity-15">
            <path d="M0 24 Q0 48 24 48" fill="none" stroke="#166534" strokeWidth="2"/>
            <circle cx="4" cy="44" r="2" fill="#22c55e"/>
          </svg>
        </div>
        <div className="absolute bottom-2 right-2 w-8 h-8 pointer-events-none">
          <svg viewBox="0 0 48 48" className="w-full h-full opacity-15">
            <path d="M48 24 Q48 48 24 48" fill="none" stroke="#166534" strokeWidth="2"/>
            <circle cx="44" cy="44" r="2" fill="#22c55e"/>
          </svg>
        </div>

        {/* Single border frame */}
        <div 
          className="absolute pointer-events-none"
          style={{
            inset: '6px',
            border: '1.5px solid #22c55e',
            borderRadius: '3px',
          }}
        />
        
        {/* Header - more compact */}
        <div className="relative z-10 flex items-center justify-between mb-2 pb-1.5 mx-1" style={{ borderBottom: '1.5px solid #22c55e' }}>
          <div className="flex items-center gap-2">
            {logoSrc && (
              <img 
                src={logoSrc} 
                alt={`${schoolName} 로고`}
                className="w-7 h-7 object-contain"
              />
            )}
            <span 
              className="px-2 py-0.5 text-[11px] font-bold rounded shadow-sm"
              style={{ 
                background: 'linear-gradient(135deg, #166534 0%, #14532d 100%)',
                color: '#86efac',
              }}
            >
              {schoolName}
            </span>
            <span className="text-[10px] font-medium" style={{ color: '#166534' }}>
              {grade}학년 {semester} {exam}
            </span>
          </div>
          <div 
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px]"
            style={{ backgroundColor: '#dcfce7' }}
          >
            <span className="font-bold" style={{ color: '#166534' }}>{pageNumber}</span>
            <span style={{ color: '#22c55e' }}>/</span>
            <span style={{ color: '#16a34a' }}>{totalPages}</span>
          </div>
        </div>

        {/* Problems - optimized layout */}
        <div className="relative z-10 flex-1 flex flex-col gap-2 overflow-hidden mx-1">
          {problems.map((problem, idx) => (
            <div 
              key={`${schoolName}-${problem.number}-${idx}`} 
              className="flex-1 flex flex-col p-2.5 rounded-md overflow-hidden relative cursor-pointer hover:shadow-lg transition-shadow"
              style={{ 
                background: 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)',
                border: '1px solid #bbf7d0',
                boxShadow: '0 1px 4px rgba(22, 101, 52, 0.06)',
              }}
              onClick={() => setSelectedProblem(problem)}
            >
              {/* Problem number and question */}
              <div className="flex gap-2 mb-2 relative z-10">
                <span 
                  className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-[13px] font-bold shadow-sm"
                  style={{ 
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: 'white',
                  }}
                >
                  {problem.number}
                </span>
                <p 
                  className="flex-1 text-[13px] leading-[1.8] font-medium"
                  style={{ color: '#1a1a1a' }}
                >
                  {problem.question}
                </p>
              </div>

              {/* Passage if exists */}
              {problem.passage && (
                <div 
                  className="mb-2 p-3 rounded text-[11px] leading-[1.7] relative"
                  style={{ 
                    backgroundColor: '#ffffff',
                    border: '1px solid #d1fae5',
                  }}
                >
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l"
                    style={{ backgroundColor: '#22c55e' }}
                  />
                  <p className="whitespace-pre-wrap text-justify pl-2" style={{ color: '#333333' }}
                     dangerouslySetInnerHTML={{ __html: problem.passage.replace(/<u>/g, '<u style="text-decoration: underline;">') }} />
                </div>
              )}

              {/* Options and Conditions - positioned in middle area */}
              {(problem.options || problem.conditions) && (
                <div className={`flex gap-2 ${!problem.options || !problem.conditions ? 'flex-col' : ''}`}>
                  {/* Options if exists */}
                  {problem.options && (
                    <div 
                      className={`p-2 rounded text-[12px] leading-[1.8] ${problem.conditions ? 'flex-1' : 'w-full'}`}
                      style={{ 
                        backgroundColor: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                      }}
                    >
                      <span 
                        className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold mr-1.5 mb-1"
                        style={{ backgroundColor: '#166534', color: '#86efac' }}
                      >
                        보기
                      </span>
                      <span className="whitespace-pre-wrap" style={{ color: '#333333' }}>{problem.options}</span>
                    </div>
                  )}

                  {/* Conditions if exists */}
                  {problem.conditions && (
                    <div 
                      className={`p-2 rounded ${problem.options ? 'flex-1' : 'w-full'} overflow-hidden`}
                      style={{ 
                        backgroundColor: '#fef9f3',
                        border: '1px solid #fde68a',
                        fontSize: problem.conditions.length > 200 ? '9px' : '12px',
                        lineHeight: problem.conditions.length > 200 ? '1.5' : '1.8',
                      }}
                    >
                      <span 
                        className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold mr-1.5 mb-1"
                        style={{ backgroundColor: '#92400e', color: '#fef3c7' }}
                      >
                        조건
                      </span>
                      <span className="whitespace-pre-wrap" style={{ color: '#333333' }}>{problem.conditions}</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Spacer to push answer area down */}
              <div className="flex-1 min-h-[8px]" />

              {/* Answer space - expanded height */}
              <div 
                className="min-h-[48px] rounded flex items-center justify-center flex-shrink-0 relative overflow-hidden"
                style={{ 
                  border: '1.5px dashed #86efac',
                  backgroundColor: '#fafffe',
                }}
              >
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 8px, #dcfce7 8px, #dcfce7 9px)',
                  }}
                />
                <span className="text-[10px] font-medium relative z-10" style={{ color: '#22c55e' }}>✎ 답안 작성란</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer decoration - more compact */}
        <div className="relative z-10 mt-1.5 flex justify-center items-center gap-2 mx-1">
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, #86efac, transparent)' }} />
          <span className="text-[7px] font-medium tracking-wider" style={{ color: '#22c55e' }}>ORUN ACADEMY</span>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, #86efac, transparent)' }} />
        </div>
      </div>

      {/* Popup */}
      <SchoolProblemPopup
        isOpen={selectedProblem !== null}
        onClose={() => setSelectedProblem(null)}
        problem={selectedProblem || problems[0]}
        schoolName={schoolName}
        grade={grade}
        semester={semester}
        exam={exam}
        onPrevious={handlePrevious}
        onNext={handleNext}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
      />
    </A4Page>
  );
}

// School Answer Page Component
interface SchoolAnswerPageProps {
  schools: {
    schoolName: string;
    grade: number;
    semester: string;
    exam: string;
    problems: SchoolProblem[];
  }[];
  startIndex: number;
  pageNumber: number;
  totalPages: number;
}

export function SchoolAnswerPage({
  schools,
  startIndex,
  pageNumber,
  totalPages,
}: SchoolAnswerPageProps) {
  // Get schools for this page (2 schools per page)
  const pageSchools = schools.slice(startIndex, startIndex + 2);
  
  return (
    <A4Page pageNumber={pageNumber} totalPages={totalPages} noPadding noHeader noFooter>
      <div 
        className="flex-1 flex flex-col h-full p-4 relative overflow-hidden"
        style={{ backgroundColor: '#f8fdf9' }}
      >
        {/* Background pattern */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 20%, #166534 1px, transparent 1px),
              radial-gradient(circle at 80% 80%, #166534 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />
        
        {/* Decorative corner ornaments */}
        <div className="absolute top-2 left-2 w-8 h-8 pointer-events-none">
          <svg viewBox="0 0 48 48" className="w-full h-full opacity-15">
            <path d="M0 24 Q0 0 24 0" fill="none" stroke="#166534" strokeWidth="2"/>
            <circle cx="4" cy="4" r="2" fill="#22c55e"/>
          </svg>
        </div>
        <div className="absolute top-2 right-2 w-8 h-8 pointer-events-none">
          <svg viewBox="0 0 48 48" className="w-full h-full opacity-15">
            <path d="M48 24 Q48 0 24 0" fill="none" stroke="#166534" strokeWidth="2"/>
            <circle cx="44" cy="4" r="2" fill="#22c55e"/>
          </svg>
        </div>
        <div className="absolute bottom-2 left-2 w-8 h-8 pointer-events-none">
          <svg viewBox="0 0 48 48" className="w-full h-full opacity-15">
            <path d="M0 24 Q0 48 24 48" fill="none" stroke="#166534" strokeWidth="2"/>
            <circle cx="4" cy="44" r="2" fill="#22c55e"/>
          </svg>
        </div>
        <div className="absolute bottom-2 right-2 w-8 h-8 pointer-events-none">
          <svg viewBox="0 0 48 48" className="w-full h-full opacity-15">
            <path d="M48 24 Q48 48 24 48" fill="none" stroke="#166534" strokeWidth="2"/>
            <circle cx="44" cy="44" r="2" fill="#22c55e"/>
          </svg>
        </div>

        {/* Single border frame */}
        <div 
          className="absolute pointer-events-none"
          style={{
            inset: '6px',
            border: '1.5px solid #22c55e',
            borderRadius: '3px',
          }}
        />
        
        {/* Header */}
        <div className="relative z-10 mb-3 text-center mx-1">
          <h2 
            className="text-base font-bold"
            style={{ color: '#166534' }}
          >
            정답 및 해설
          </h2>
          <div 
            className="w-12 h-0.5 mx-auto mt-1 rounded-full"
            style={{ background: 'linear-gradient(90deg, #86efac, #22c55e, #86efac)' }}
          />
          <p className="text-[9px] mt-0.5" style={{ color: '#16a34a' }}>
            학교별 기출문제
          </p>
        </div>
        
        {/* Answers by school */}
        <div className="relative z-10 flex-1 space-y-3 overflow-hidden mx-1">
          {pageSchools.map((school) => {
            const logoSrc = schoolLogoMap[school.schoolName];
            return (
              <div 
                key={school.schoolName} 
                className="p-2.5 rounded-md"
                style={{
                  background: 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)',
                  border: '1px solid #bbf7d0',
                  boxShadow: '0 1px 4px rgba(22, 101, 52, 0.06)',
                }}
              >
                <div 
                  className="flex items-center gap-2 pb-1.5 mb-2"
                  style={{ borderBottom: '1px solid #d1fae5' }}
                >
                  {logoSrc && (
                    <img 
                      src={logoSrc} 
                      alt={`${school.schoolName} 로고`}
                      className="w-6 h-6 object-contain"
                    />
                  )}
                  <span 
                    className="px-2 py-0.5 text-[10px] font-bold rounded shadow-sm"
                    style={{ 
                      background: 'linear-gradient(135deg, #166534 0%, #14532d 100%)',
                      color: '#86efac',
                    }}
                  >
                    {school.schoolName}
                  </span>
                  <span className="text-[9px] font-medium" style={{ color: '#166534' }}>
                    {school.grade}학년 {school.semester} {school.exam}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {school.problems.map((problem) => (
                    <div key={`${school.schoolName}-${problem.number}`} className="flex gap-2">
                      <span 
                        className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-[9px] font-bold"
                        style={{ 
                          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                          color: 'white',
                        }}
                      >
                        {problem.number}
                      </span>
                      <div className="flex-1">
                        <div 
                          className="text-[11px] font-medium mb-0.5 leading-[1.7] px-2 py-1 rounded"
                          style={{ backgroundColor: '#ecfdf5', color: '#166534' }}
                        >
                          {Array.isArray(problem.answer) ? problem.answer.join(' / ') : problem.answer}
                        </div>
                        {problem.explanation && (
                          <div className="text-[10px] leading-[1.8] mt-1 pl-1" style={{ color: '#555555' }}>
                            {problem.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Footer decoration */}
        <div className="relative z-10 mt-1.5 flex justify-center items-center gap-2 mx-1">
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, #86efac, transparent)' }} />
          <span className="text-[7px] font-medium tracking-wider" style={{ color: '#22c55e' }}>ORUN ACADEMY</span>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, #86efac, transparent)' }} />
        </div>
      </div>
    </A4Page>
  );
}
