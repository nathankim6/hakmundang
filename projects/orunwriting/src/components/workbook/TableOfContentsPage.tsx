import { A4Page } from "./A4Page";

interface Unit {
  number: number;
  title: string;
  problemCount: number;
  startPage: number;
  section: 'arrangement' | 'conditional' | 'reading';
}

interface ReadingInfo {
  startPage: number;
  problemCount: number;
}

interface SchoolInfo {
  schoolName: string;
  startPage: number;
  problemCount: number;
}

interface TableOfContentsPageProps {
  units: Unit[];
  pageNumber: number;
  totalPages: number;
  onUnitClick?: (unitNumber: number) => void;
  readingInfo?: ReadingInfo;
  schoolInfo?: {
    startPage: number;
    schools: SchoolInfo[];
  };
  appendixInfo?: {
    startPage: number;
  };
}

export function TableOfContentsPage({
  units,
  pageNumber,
  totalPages,
  onUnitClick,
  readingInfo,
  schoolInfo,
  appendixInfo,
}: TableOfContentsPageProps) {
  const arrangementUnits = units.filter(u => u.section === 'arrangement');
  const conditionalUnits = units.filter(u => u.section === 'conditional');
  
  return (
    <A4Page pageNumber={pageNumber} totalPages={totalPages} noPadding noHeader noFooter>
      {/* Ivory background */}
      <div className="flex-1 flex flex-col relative overflow-hidden h-full" style={{ backgroundColor: '#faf8f5' }}>
        {/* Outer border frame */}
        <div className="absolute" style={{
          inset: '8px',
          border: '2px solid rgba(30,30,30,0.15)',
          pointerEvents: 'none'
        }} />
        
        {/* Inner border frame */}
        <div className="absolute" style={{
          inset: '12px',
          border: '1px solid rgba(30,30,30,0.08)',
          pointerEvents: 'none'
        }} />

        {/* Corner ornaments */}
        <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: 'rgba(30,30,30,0.2)' }} />
        <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2" style={{ borderColor: 'rgba(30,30,30,0.2)' }} />
        <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2" style={{ borderColor: 'rgba(30,30,30,0.2)' }} />
        <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: 'rgba(30,30,30,0.2)' }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-5 py-3">
          {/* Title */}
          <div className="text-center mb-1.5">
            <div className="flex items-center justify-center gap-2 mb-0.5">
              <div style={{ width: '30px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(30,30,30,0.2))' }} />
              <div style={{ width: '3px', height: '3px', background: '#333', transform: 'rotate(45deg)' }} />
              <div style={{ width: '30px', height: '1px', background: 'linear-gradient(90deg, rgba(30,30,30,0.2), transparent)' }} />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a', marginBottom: '0px' }}>
              목 차
            </h2>
            <p style={{ fontSize: '7px', color: '#666', fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.3em', textTransform: 'uppercase' }}>
              Contents
            </p>
          </div>

          {/* Main content area */}
          <div className="flex-1 flex flex-col justify-between py-1">
            {/* PART 1: 서술형 유형연습 */}
            {readingInfo && (
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="px-2 py-0.5 font-bold text-[9px] rounded" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2744 100%)', color: '#fff' }}>
                    PART 1
                  </div>
                  <span style={{ fontSize: '11px', color: '#1e3a5f', fontWeight: '600' }}>서술형 유형연습</span>
                  <span style={{ fontSize: '8px', color: '#666', fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.1em' }}>
                    READING WRITING
                  </span>
                  <div className="flex-1" style={{ height: '1px', background: 'linear-gradient(90deg, rgba(30,58,95,0.3), transparent)' }} />
                </div>
                <div className="flex items-center gap-2 py-0.5 px-2">
                  <span className="text-[9px] font-medium" style={{ color: '#333' }}>
                    수능 영어 지문 기반 서술형 문제 ({readingInfo.problemCount}문제)
                  </span>
                  <span className="text-[8px]" style={{ color: '#888' }}>p.{readingInfo.startPage}</span>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3 py-0.5">
              <div className="flex-1" style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(30,30,30,0.12), transparent)' }} />
              <div style={{ width: '3px', height: '3px', background: '#888', transform: 'rotate(45deg)' }} />
              <div className="flex-1" style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(30,30,30,0.12), transparent)' }} />
            </div>

            {/* PART 2: 조건영작 */}
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <div className="px-2 py-0.5 font-bold text-[9px] rounded" style={{ background: 'linear-gradient(135deg, #1a365d 0%, #0f1f3d 100%)', color: '#fff' }}>
                  PART 2
                </div>
                <span style={{ fontSize: '11px', color: '#1a365d', fontWeight: '600' }}>조건영작</span>
                <span style={{ fontSize: '8px', color: '#666', fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.1em' }}>
                  CONDITIONAL WRITING
                </span>
                <div className="flex-1" style={{ height: '1px', background: 'linear-gradient(90deg, rgba(26,54,93,0.3), transparent)' }} />
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0">
                {conditionalUnits.map(unit => (
                  <button 
                    key={`cond-${unit.number}`} 
                    onClick={() => onUnitClick?.(unit.number)} 
                    className="group flex items-center gap-1.5 py-0.5 px-1.5 text-left rounded transition-all duration-200"
                    style={{ border: '1px solid transparent' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(26,54,93,0.08)'; e.currentTarget.style.borderColor = 'rgba(26,54,93,0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                  >
                    <span className="w-4 h-4 flex items-center justify-center text-[8px] font-bold rounded" style={{ border: '1px solid rgba(26,54,93,0.4)', color: '#1a365d' }}>
                      {String(unit.number).padStart(2, '0')}
                    </span>
                    <span className="flex-1 text-[9px] font-medium truncate" style={{ color: '#333' }}>{unit.title}</span>
                    <span className="text-[8px]" style={{ color: '#888' }}>p.{unit.startPage}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 py-0.5">
              <div className="flex-1" style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(30,30,30,0.12), transparent)' }} />
              <div style={{ width: '3px', height: '3px', background: '#888', transform: 'rotate(45deg)' }} />
              <div className="flex-1" style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(30,30,30,0.12), transparent)' }} />
            </div>

            {/* PART 3: 배열영작 */}
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <div className="px-2 py-0.5 font-bold text-[9px] rounded" style={{ background: 'linear-gradient(135deg, #722f37 0%, #4a1c22 100%)', color: '#fff' }}>
                  PART 3
                </div>
                <span style={{ fontSize: '11px', color: '#722f37', fontWeight: '600' }}>배열영작</span>
                <span style={{ fontSize: '8px', color: '#666', fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.1em' }}>
                  ARRANGEMENT WRITING
                </span>
                <div className="flex-1" style={{ height: '1px', background: 'linear-gradient(90deg, rgba(114,47,55,0.3), transparent)' }} />
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0">
                {arrangementUnits.map(unit => (
                  <button 
                    key={`arr-${unit.number}`} 
                    onClick={() => onUnitClick?.(unit.number)} 
                    className="group flex items-center gap-1.5 py-0.5 px-1.5 text-left rounded transition-all duration-200"
                    style={{ border: '1px solid transparent' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(114,47,55,0.08)'; e.currentTarget.style.borderColor = 'rgba(114,47,55,0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                  >
                    <span className="w-4 h-4 flex items-center justify-center text-[8px] font-bold rounded" style={{ border: '1px solid rgba(114,47,55,0.4)', color: '#722f37' }}>
                      {String(unit.number).padStart(2, '0')}
                    </span>
                    <span className="flex-1 text-[9px] font-medium truncate" style={{ color: '#333' }}>{unit.title}</span>
                    <span className="text-[8px]" style={{ color: '#888' }}>p.{unit.startPage}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 py-0.5">
              <div className="flex-1" style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(30,30,30,0.12), transparent)' }} />
              <div style={{ width: '3px', height: '3px', background: '#888', transform: 'rotate(45deg)' }} />
              <div className="flex-1" style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(30,30,30,0.12), transparent)' }} />
            </div>

            {/* PART 4: 학교별 기출문제 */}
            {schoolInfo && (
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="px-2 py-0.5 font-bold text-[9px] rounded" style={{ background: 'linear-gradient(135deg, #2d5a27 0%, #1a3518 100%)', color: '#fff' }}>
                    PART 4
                  </div>
                  <span style={{ fontSize: '11px', color: '#2d5a27', fontWeight: '600' }}>학교별 기출문제</span>
                  <span style={{ fontSize: '8px', color: '#666', fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.1em' }}>
                    SCHOOL EXAMS
                  </span>
                  <div className="flex-1" style={{ height: '1px', background: 'linear-gradient(90deg, rgba(45,90,39,0.3), transparent)' }} />
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-0">
                  {schoolInfo.schools.map((school, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-1.5 py-0.5 px-1.5"
                    >
                      <span className="w-4 h-4 flex items-center justify-center text-[8px] font-bold rounded" style={{ border: '1px solid rgba(45,90,39,0.4)', color: '#2d5a27' }}>
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="flex-1 text-[9px] font-medium truncate" style={{ color: '#333' }}>{school.schoolName}</span>
                      <span className="text-[8px]" style={{ color: '#888' }}>p.{school.startPage}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            {appendixInfo && (
              <div className="flex items-center gap-3 py-0.5">
                <div className="flex-1" style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(30,30,30,0.12), transparent)' }} />
                <div style={{ width: '3px', height: '3px', background: '#888', transform: 'rotate(45deg)' }} />
                <div className="flex-1" style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(30,30,30,0.12), transparent)' }} />
              </div>
            )}

            {/* 부록 */}
            {appendixInfo && (
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="px-2 py-0.5 font-bold text-[9px] rounded" style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2a22 100%)', color: '#fff' }}>
                    부록
                  </div>
                  <span style={{ fontSize: '11px', color: '#5c4033', fontWeight: '600' }}>동사 문형 정리</span>
                  <span style={{ fontSize: '8px', color: '#666', fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.1em' }}>
                    VERB PATTERNS
                  </span>
                  <div className="flex-1" style={{ height: '1px', background: 'linear-gradient(90deg, rgba(92,64,51,0.3), transparent)' }} />
                </div>
                <div className="flex items-center gap-2 py-0.5 px-2">
                  <span className="text-[9px] font-medium" style={{ color: '#333' }}>
                    동사별 문형 정리표
                  </span>
                  <span className="text-[8px]" style={{ color: '#888' }}>p.{appendixInfo.startPage}</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center pt-1">
            <p style={{ fontSize: '6px', color: '#999', fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.3em' }}>
              ORUN ACADEMY
            </p>
          </div>
        </div>
      </div>
    </A4Page>
  );
}