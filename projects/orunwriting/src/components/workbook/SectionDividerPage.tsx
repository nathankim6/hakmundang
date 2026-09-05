import { A4Page } from "./A4Page";
import orunLogo from "@/assets/orun-academy-logo-new.png";
interface SectionDividerPageProps {
  section: 'arrangement' | 'conditional' | 'reading' | 'school';
  pageNumber: number;
  totalPages: number;
}
export function SectionDividerPage({
  section,
  pageNumber,
  totalPages
}: SectionDividerPageProps) {
  const isArrangement = section === 'arrangement';
  const isReading = section === 'reading';
  const isSchool = section === 'school';

  // 밝은 파스텔톤 테마 - 각 파트의 고유색 반영
  const themeColors = isSchool ? {
    bgColor: '#f0fdf4',
    bgGradient: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)',
    patternColor: 'rgba(34,197,94,0.08)',
    accentPrimary: '#16a34a',
    accentSecondary: '#22c55e',
    accentMuted: 'rgba(22,163,74,0.5)',
    accentSubtle: 'rgba(22,163,74,0.25)',
    accentFaint: 'rgba(34,197,94,0.12)',
    textPrimary: '#14532d',
    textSecondary: '#166534',
    sectionLabel: 'Section IV',
    partLabel: 'PART 4',
    title: '학교별 기출문제',
    subtitle: 'School Exam Problems',
    unitRange: '5개 학교'
  } : isReading ? {
    bgColor: '#eff6ff',
    bgGradient: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%)',
    patternColor: 'rgba(59,130,246,0.08)',
    accentPrimary: '#2563eb',
    accentSecondary: '#3b82f6',
    accentMuted: 'rgba(37,99,235,0.5)',
    accentSubtle: 'rgba(37,99,235,0.25)',
    accentFaint: 'rgba(59,130,246,0.12)',
    textPrimary: '#1e3a8a',
    textSecondary: '#1d4ed8',
    sectionLabel: 'Section I',
    partLabel: 'PART 1',
    title: '서술형 유형연습',
    subtitle: 'Reading Writing Drill',
    unitRange: 'UNIT 01 ~ 05'
  } : isArrangement ? {
    bgColor: '#fdf2f8',
    bgGradient: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)',
    patternColor: 'rgba(236,72,153,0.08)',
    accentPrimary: '#db2777',
    accentSecondary: '#ec4899',
    accentMuted: 'rgba(219,39,119,0.5)',
    accentSubtle: 'rgba(219,39,119,0.25)',
    accentFaint: 'rgba(236,72,153,0.12)',
    textPrimary: '#831843',
    textSecondary: '#be185d',
    sectionLabel: 'Section III',
    partLabel: 'PART 3',
    title: '조건영작',
    subtitle: 'Conditional Writing',
    unitRange: 'UNIT 01 ~ 20'
  } : {
    bgColor: '#fefce8',
    bgGradient: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 50%, #fef08a 100%)',
    patternColor: 'rgba(202,138,4,0.08)',
    accentPrimary: '#b45309',
    accentSecondary: '#d97706',
    accentMuted: 'rgba(180,83,9,0.5)',
    accentSubtle: 'rgba(180,83,9,0.25)',
    accentFaint: 'rgba(202,138,4,0.12)',
    textPrimary: '#713f12',
    textSecondary: '#92400e',
    sectionLabel: 'Section II',
    partLabel: 'PART 2',
    title: '배열영작',
    subtitle: 'Arrangement Writing',
    unitRange: 'UNIT 01 ~ 30'
  };
  return <A4Page pageNumber={pageNumber} totalPages={totalPages} noPadding noHeader noFooter>
      {/* Light gradient background */}
      <div className="flex-1 flex flex-col relative overflow-hidden" style={{
      background: themeColors.bgGradient
    }}>
        
        {/* Decorative pattern overlay - elegant geometric pattern */}
        <svg className="absolute inset-0 w-full h-full" style={{
        opacity: 1
      }}>
          <defs>
            {/* Diamond pattern */}
            <pattern id={`diamond-${section}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M20 0 L40 20 L20 40 L0 20 Z" fill="none" stroke={themeColors.patternColor} strokeWidth="0.5" />
              <circle cx="20" cy="20" r="2" fill={themeColors.patternColor} />
            </pattern>
            
            {/* Floral corner ornament */}
            <pattern id={`floral-${section}`} x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="8" fill="none" stroke={themeColors.patternColor} strokeWidth="0.5" />
              <circle cx="30" cy="30" r="4" fill="none" stroke={themeColors.patternColor} strokeWidth="0.5" />
              <path d="M30 22 Q35 27 30 30 Q25 27 30 22" fill={themeColors.patternColor} />
              <path d="M38 30 Q33 35 30 30 Q33 25 38 30" fill={themeColors.patternColor} />
              <path d="M30 38 Q25 33 30 30 Q35 33 30 38" fill={themeColors.patternColor} />
              <path d="M22 30 Q27 25 30 30 Q27 35 22 30" fill={themeColors.patternColor} />
            </pattern>
          </defs>
          
          {/* Main diamond pattern */}
          <rect width="100%" height="100%" fill={`url(#diamond-${section})`} />
        </svg>

        {/* Large decorative corner flourishes */}
        <svg className="absolute top-4 left-4 w-32 h-32" viewBox="0 0 120 120" style={{
        opacity: 0.6
      }}>
          <path d="M10,60 Q10,10 60,10" stroke={themeColors.accentSubtle} strokeWidth="1.5" fill="none" />
          <path d="M15,55 Q15,15 55,15" stroke={themeColors.accentFaint} strokeWidth="1" fill="none" />
          <circle cx="60" cy="10" r="3" fill={themeColors.accentSubtle} />
          <circle cx="10" cy="60" r="3" fill={themeColors.accentSubtle} />
          {/* Decorative leaf */}
          <path d="M25,35 Q35,25 45,35 Q35,45 25,35" fill={themeColors.accentFaint} />
          <path d="M35,25 Q45,35 35,45 Q25,35 35,25" fill={themeColors.accentFaint} />
        </svg>

        <svg className="absolute top-4 right-4 w-32 h-32" viewBox="0 0 120 120" style={{
        opacity: 0.6,
        transform: 'scaleX(-1)'
      }}>
          <path d="M10,60 Q10,10 60,10" stroke={themeColors.accentSubtle} strokeWidth="1.5" fill="none" />
          <path d="M15,55 Q15,15 55,15" stroke={themeColors.accentFaint} strokeWidth="1" fill="none" />
          <circle cx="60" cy="10" r="3" fill={themeColors.accentSubtle} />
          <circle cx="10" cy="60" r="3" fill={themeColors.accentSubtle} />
          <path d="M25,35 Q35,25 45,35 Q35,45 25,35" fill={themeColors.accentFaint} />
          <path d="M35,25 Q45,35 35,45 Q25,35 35,25" fill={themeColors.accentFaint} />
        </svg>

        <svg className="absolute bottom-4 left-4 w-32 h-32" viewBox="0 0 120 120" style={{
        opacity: 0.6,
        transform: 'scaleY(-1)'
      }}>
          <path d="M10,60 Q10,10 60,10" stroke={themeColors.accentSubtle} strokeWidth="1.5" fill="none" />
          <path d="M15,55 Q15,15 55,15" stroke={themeColors.accentFaint} strokeWidth="1" fill="none" />
          <circle cx="60" cy="10" r="3" fill={themeColors.accentSubtle} />
          <circle cx="10" cy="60" r="3" fill={themeColors.accentSubtle} />
          <path d="M25,35 Q35,25 45,35 Q35,45 25,35" fill={themeColors.accentFaint} />
          <path d="M35,25 Q45,35 35,45 Q25,35 35,25" fill={themeColors.accentFaint} />
        </svg>

        <svg className="absolute bottom-4 right-4 w-32 h-32" viewBox="0 0 120 120" style={{
        opacity: 0.6,
        transform: 'scale(-1)'
      }}>
          <path d="M10,60 Q10,10 60,10" stroke={themeColors.accentSubtle} strokeWidth="1.5" fill="none" />
          <path d="M15,55 Q15,15 55,15" stroke={themeColors.accentFaint} strokeWidth="1" fill="none" />
          <circle cx="60" cy="10" r="3" fill={themeColors.accentSubtle} />
          <circle cx="10" cy="60" r="3" fill={themeColors.accentSubtle} />
          <path d="M25,35 Q35,25 45,35 Q35,45 25,35" fill={themeColors.accentFaint} />
          <path d="M35,25 Q45,35 35,45 Q25,35 35,25" fill={themeColors.accentFaint} />
        </svg>

        {/* Outer elegant border */}
        <div className="absolute" style={{
        inset: '24px',
        border: `2px solid ${themeColors.accentSubtle}`,
        borderRadius: '4px',
        pointerEvents: 'none'
      }} />
        
        {/* Inner decorative border */}
        <div className="absolute" style={{
        inset: '32px',
        border: `1px solid ${themeColors.accentFaint}`,
        borderRadius: '2px',
        pointerEvents: 'none'
      }} />

        {/* Decorative top/bottom center ornaments */}
        <svg className="absolute top-8 left-1/2 -translate-x-1/2 w-40 h-6" viewBox="0 0 160 24">
          <path d="M0,12 L60,12" stroke={themeColors.accentSubtle} strokeWidth="1" />
          <path d="M100,12 L160,12" stroke={themeColors.accentSubtle} strokeWidth="1" />
          <circle cx="80" cy="12" r="4" fill="none" stroke={themeColors.accentMuted} strokeWidth="1" />
          <circle cx="80" cy="12" r="2" fill={themeColors.accentSubtle} />
          <circle cx="65" cy="12" r="1.5" fill={themeColors.accentFaint} />
          <circle cx="95" cy="12" r="1.5" fill={themeColors.accentFaint} />
        </svg>

        <svg className="absolute bottom-8 left-1/2 -translate-x-1/2 w-40 h-6" viewBox="0 0 160 24">
          <path d="M0,12 L60,12" stroke={themeColors.accentSubtle} strokeWidth="1" />
          <path d="M100,12 L160,12" stroke={themeColors.accentSubtle} strokeWidth="1" />
          <circle cx="80" cy="12" r="4" fill="none" stroke={themeColors.accentMuted} strokeWidth="1" />
          <circle cx="80" cy="12" r="2" fill={themeColors.accentSubtle} />
          <circle cx="65" cy="12" r="1.5" fill={themeColors.accentFaint} />
          <circle cx="95" cy="12" r="1.5" fill={themeColors.accentFaint} />
        </svg>

        {/* Content container */}
        <div className="flex-1 flex flex-col items-center relative z-10 px-12 py-16">
          
          {/* Center section with logo + title */}
          <div className="flex-1 flex flex-col items-center justify-center" style={{
          marginTop: '-20px'
        }}>
            
            {/* Logo with elegant ring */}
            <div className="mb-10">
              <div className="relative">
                {/* Outer decorative ring */}
                <div className="absolute -inset-4 rounded-full" style={{
                border: `1px solid ${themeColors.accentFaint}`
              }} />
                
                {/* Middle ring */}
                <div className="absolute -inset-2 rounded-full" style={{
                border: `1px solid ${themeColors.accentSubtle}`,
                boxShadow: `0 0 20px ${themeColors.accentFaint}`
              }} />
                
                {/* Logo container */}
                <div className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden relative z-10" style={{
                backgroundColor: '#ffffff',
                boxShadow: `0 4px 20px rgba(0,0,0,0.1), 0 0 30px ${themeColors.accentFaint}`,
                border: `2px solid ${themeColors.accentSubtle}`
              }}>
                  <img src={orunLogo} alt="ORUN Academy Logo" className="w-full h-full object-contain p-1" />
                </div>
              </div>
            </div>

            {/* Section indicator */}
            <p style={{
            fontSize: '10px',
            color: themeColors.accentMuted,
            fontFamily: "'Cormorant Garamond', serif",
            letterSpacing: '0.5em',
            textTransform: 'uppercase',
            marginBottom: '6px'
          }}>
              {themeColors.sectionLabel}
            </p>

            {/* Part Number */}
            <p style={{
            fontSize: '14px',
            color: themeColors.textSecondary,
            fontFamily: "'Cormorant Garamond', serif",
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            marginBottom: '20px',
            fontWeight: '600'
          }}>
              {themeColors.partLabel}
            </p>

            {/* Main Title - Korean */}
            <h1 style={{
            fontSize: '52px',
            lineHeight: '1.1',
            fontWeight: '700',
            color: themeColors.textPrimary,
            letterSpacing: '0.08em',
            textShadow: `0 2px 4px rgba(0,0,0,0.08)`,
            marginBottom: '16px',
            textAlign: 'center'
          }}>
              {themeColors.title}
            </h1>

            {/* Decorative flourish with diamond */}
            <div className="flex items-center justify-center my-6" style={{
            width: '220px'
          }}>
              <svg viewBox="0 0 100 20" style={{
              width: '100%',
              height: '20px'
            }}>
                {/* Left curve */}
                <path d="M0,10 Q15,10 25,5 Q35,0 50,10" stroke={themeColors.accentSubtle} strokeWidth="1" fill="none" />
                {/* Right curve */}
                <path d="M50,10 Q65,20 75,15 Q85,10 100,10" stroke={themeColors.accentSubtle} strokeWidth="1" fill="none" />
                {/* Center diamond */}
                <path d="M46,10 L50,6 L54,10 L50,14 Z" fill={themeColors.accentPrimary} />
                {/* Small dots */}
                <circle cx="30" cy="7" r="1.5" fill={themeColors.accentFaint} />
                <circle cx="70" cy="13" r="1.5" fill={themeColors.accentFaint} />
              </svg>
            </div>

            {/* English subtitle */}
            <p style={{
            fontSize: '12px',
            color: themeColors.accentMuted,
            fontFamily: "'Cormorant Garamond', serif",
            letterSpacing: '0.4em',
            textTransform: 'uppercase'
          }}>
              {themeColors.subtitle}
            </p>
          </div>

          {/* Lower section: Unit range box */}
          

          {/* Bottom: ORUN ACADEMY */}
          <div className="absolute bottom-12 flex flex-col items-center">
            <div className="flex items-center justify-center mb-3" style={{
            width: '100px'
          }}>
              <div style={{
              flex: 1,
              height: '1px',
              background: `linear-gradient(to right, transparent, ${themeColors.accentSubtle})`
            }} />
              <div className="mx-2" style={{
              width: '4px',
              height: '4px',
              backgroundColor: themeColors.accentMuted,
              borderRadius: '50%'
            }} />
              <div style={{
              flex: 1,
              height: '1px',
              background: `linear-gradient(to left, transparent, ${themeColors.accentSubtle})`
            }} />
            </div>
            <p style={{
            fontSize: '10px',
            color: themeColors.textSecondary,
            fontFamily: "'Cormorant Garamond', serif",
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            opacity: 0.7
          }}>
              ORUN ACADEMY
            </p>
          </div>
        </div>
      </div>
    </A4Page>;
}