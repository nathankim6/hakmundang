import { A4Page } from "./A4Page";
import orunLogo from "@/assets/orun-academy-logo-new.png";
interface GrammarHardCoverProps {
  totalPages: number;
  variant?: 'default' | 'school' | 'appendix';
}
export function GrammarHardCover({
  totalPages,
  variant = 'default'
}: GrammarHardCoverProps) {
  // Get variant-specific content
  const getContent = () => {
    switch (variant) {
      case 'school':
        return {
          mainTitle: 'SCHOOL\nEXAM',
          subtitle: 'SCHOOL EXAM QUESTIONS',
          koreanTitle: '학교별 기출문제',
          koreanSubtitle: '실전 문제 연습'
        };
      case 'appendix':
        return {
          mainTitle: 'VERB\nPATTERNS',
          subtitle: 'ESSENTIAL VERB PATTERNS',
          koreanTitle: '주요동사 문형정리',
          koreanSubtitle: '필수 동사패턴 부록'
        };
      default:
        return {
          mainTitle: 'ORUN\nWRITING',
          subtitle: 'ENGLISH WRITING COLLECTION',
          koreanTitle: '서술형 마스터 클래스',
          koreanSubtitle: '고교내신 1등급 완성'
        };
    }
  };
  
  const content = getContent();
  return <A4Page pageNumber={1} totalPages={totalPages} noPadding noHeader noFooter>
      {/* Dark background matching the reference */}
      <div className="flex-1 flex flex-col relative overflow-hidden" style={{
      backgroundColor: '#0a0a0a'
    }}>
        {/* Decorative corner ornaments - Top Left */}
        <svg className="absolute top-5 left-5 w-24 h-24" viewBox="0 0 100 100" style={{
        opacity: 0.4
      }}>
          <path d="M0,50 Q0,0 50,0 L50,8 Q10,8 10,50 Z" fill="url(#goldGradient)" />
          <path d="M0,50 Q0,0 50,0" stroke="rgba(180,150,80,0.6)" strokeWidth="1" fill="none" />
          <circle cx="50" cy="8" r="3" fill="rgba(212,184,106,0.5)" />
          <circle cx="8" cy="50" r="3" fill="rgba(212,184,106,0.5)" />
          <path d="M15,15 Q25,25 35,15 Q45,25 35,35 Q25,45 15,35 Q5,25 15,15" stroke="rgba(180,150,80,0.4)" strokeWidth="0.5" fill="none" />
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(212,184,106,0.6)" />
              <stop offset="100%" stopColor="rgba(180,150,80,0.3)" />
            </linearGradient>
          </defs>
        </svg>

        {/* Decorative corner ornaments - Top Right */}
        <svg className="absolute top-5 right-5 w-24 h-24" viewBox="0 0 100 100" style={{
        opacity: 0.4,
        transform: 'scaleX(-1)'
      }}>
          <path d="M0,50 Q0,0 50,0 L50,8 Q10,8 10,50 Z" fill="url(#goldGradient2)" />
          <path d="M0,50 Q0,0 50,0" stroke="rgba(180,150,80,0.6)" strokeWidth="1" fill="none" />
          <circle cx="50" cy="8" r="3" fill="rgba(212,184,106,0.5)" />
          <circle cx="8" cy="50" r="3" fill="rgba(212,184,106,0.5)" />
          <path d="M15,15 Q25,25 35,15 Q45,25 35,35 Q25,45 15,35 Q5,25 15,15" stroke="rgba(180,150,80,0.4)" strokeWidth="0.5" fill="none" />
          <defs>
            <linearGradient id="goldGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(212,184,106,0.6)" />
              <stop offset="100%" stopColor="rgba(180,150,80,0.3)" />
            </linearGradient>
          </defs>
        </svg>

        {/* Decorative corner ornaments - Bottom Left */}
        <svg className="absolute bottom-5 left-5 w-24 h-24" viewBox="0 0 100 100" style={{
        opacity: 0.4,
        transform: 'scaleY(-1)'
      }}>
          <path d="M0,50 Q0,0 50,0 L50,8 Q10,8 10,50 Z" fill="url(#goldGradient3)" />
          <path d="M0,50 Q0,0 50,0" stroke="rgba(180,150,80,0.6)" strokeWidth="1" fill="none" />
          <circle cx="50" cy="8" r="3" fill="rgba(212,184,106,0.5)" />
          <circle cx="8" cy="50" r="3" fill="rgba(212,184,106,0.5)" />
          <path d="M15,15 Q25,25 35,15 Q45,25 35,35 Q25,45 15,35 Q5,25 15,15" stroke="rgba(180,150,80,0.4)" strokeWidth="0.5" fill="none" />
          <defs>
            <linearGradient id="goldGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(212,184,106,0.6)" />
              <stop offset="100%" stopColor="rgba(180,150,80,0.3)" />
            </linearGradient>
          </defs>
        </svg>

        {/* Decorative corner ornaments - Bottom Right */}
        <svg className="absolute bottom-5 right-5 w-24 h-24" viewBox="0 0 100 100" style={{
        opacity: 0.4,
        transform: 'scale(-1)'
      }}>
          <path d="M0,50 Q0,0 50,0 L50,8 Q10,8 10,50 Z" fill="url(#goldGradient4)" />
          <path d="M0,50 Q0,0 50,0" stroke="rgba(180,150,80,0.6)" strokeWidth="1" fill="none" />
          <circle cx="50" cy="8" r="3" fill="rgba(212,184,106,0.5)" />
          <circle cx="8" cy="50" r="3" fill="rgba(212,184,106,0.5)" />
          <path d="M15,15 Q25,25 35,15 Q45,25 35,35 Q25,45 15,35 Q5,25 15,15" stroke="rgba(180,150,80,0.4)" strokeWidth="0.5" fill="none" />
          <defs>
            <linearGradient id="goldGradient4" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(212,184,106,0.6)" />
              <stop offset="100%" stopColor="rgba(180,150,80,0.3)" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center decorative divider line with ornament */}
        <svg className="absolute left-1/2 top-1/2 w-48 h-8" viewBox="0 0 200 32" style={{
        opacity: 0.35,
        transform: 'translate(-50%, 80px)'
      }}>
          <line x1="0" y1="16" x2="70" y2="16" stroke="rgba(180,150,80,0.6)" strokeWidth="1" />
          <line x1="130" y1="16" x2="200" y2="16" stroke="rgba(180,150,80,0.6)" strokeWidth="1" />
          <circle cx="100" cy="16" r="6" stroke="rgba(180,150,80,0.6)" strokeWidth="1" fill="none" />
          <circle cx="100" cy="16" r="3" fill="rgba(212,184,106,0.5)" />
          <path d="M75,16 L85,10 L85,22 Z" fill="rgba(180,150,80,0.4)" />
          <path d="M125,16 L115,10 L115,22 Z" fill="rgba(180,150,80,0.4)" />
        </svg>

        {/* Outer gold border frame */}
        <div className="absolute" style={{
        inset: '20px',
        border: '1px solid rgba(180,150,80,0.5)',
        pointerEvents: 'none'
      }} />
        
        {/* Inner gold border frame */}
        <div className="absolute" style={{
        inset: '28px',
        border: '1px solid rgba(180,150,80,0.25)',
        pointerEvents: 'none'
      }} />

        {/* Content container - spread out like a real book cover */}
        <div className="flex-1 flex flex-col items-center relative z-10 px-12 py-16">

          {/* Middle section: Logo + Main title - positioned slightly above center */}
          <div className="flex-1 flex flex-col items-center justify-center" style={{ marginTop: '-40px' }}>
            {/* Logo directly above title */}
            <div className="flex flex-col items-center mb-10">
              <div className="relative">
                {/* Elegant outer ring */}
                <div className="absolute -inset-2.5 rounded-full" style={{
                  border: '1px solid rgba(212,184,106,0.4)',
                  boxShadow: '0 0 12px rgba(212,184,106,0.1)'
                }} />
                
                {/* Inner gold ring with gradient */}
                <div className="absolute -inset-1.5 rounded-full" style={{
                  background: 'linear-gradient(135deg, rgba(212,184,106,0.5), rgba(255,220,120,0.7), rgba(180,150,80,0.5))',
                  padding: '1px',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude'
                }} />
                
                {/* Logo container */}
                <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden relative z-10" style={{
                  backgroundColor: '#ffffff',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.4)',
                  border: '1px solid rgba(212,184,106,0.3)'
                }}>
                  <img src={orunLogo} alt="ORUN Academy Logo" className="w-full h-full object-contain p-0.5" />
                </div>
              </div>
            </div>

            {/* Main Title */}
            <h1 className="font-cinzel" style={{
              fontSize: variant === 'default' ? '72px' : '48px',
              lineHeight: '1.1',
              fontWeight: '700',
              letterSpacing: '0.1em',
              textAlign: 'center',
              color: '#d4b86a',
              textShadow: '0 0 8px rgba(255, 255, 255, 0.4), 0 0 16px rgba(212, 184, 106, 0.3), 0 0 24px rgba(192, 192, 192, 0.2), 0 3px 0 #a08030, 0 6px 20px rgba(0,0,0,0.5)',
              whiteSpace: 'pre-line'
            }}>
              {content.mainTitle}
            </h1>

            {/* Spacer */}
            <div className="mt-6 mb-4" />

            {/* Subtitle */}
            <p style={{
              fontSize: '10px',
              color: 'rgba(180,150,80,0.6)',
              fontFamily: "'Cormorant Garamond', serif",
              letterSpacing: '0.45em',
              textTransform: 'uppercase'
            }}>
              {content.subtitle}
            </p>
          </div>

          {/* Lower section: Korean title box */}
          <div className="flex flex-col items-center py-5 px-10 mb-16" style={{
            border: '1px solid rgba(180,150,80,0.5)',
            backgroundColor: 'rgba(180,150,80,0.08)',
            borderRadius: '4px'
          }}>
            <p style={{
              fontSize: '8px',
              color: 'rgba(120,100,60,0.7)',
              fontFamily: "'Cormorant Garamond', serif",
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}>
              김성진t 예비고1 겨울방학특강
            </p>
            
            {/* Korean Title */}
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              fontFamily: "'Noto Sans KR', sans-serif",
              letterSpacing: '0.1em',
              color: '#c0c0c0',
              textShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }}>
              {content.koreanTitle}
            </h2>
            
            {/* Part info */}
            <p style={{
              fontSize: '11px',
              color: 'rgba(140,120,70,0.9)',
              fontFamily: "'Noto Sans KR', sans-serif",
              fontWeight: '500',
              letterSpacing: '0.1em',
              marginTop: '10px'
            }}>
              {content.koreanSubtitle}
            </p>
          </div>

          {/* Bottom: Publisher - absolute positioned */}
          <div className="absolute bottom-10 flex flex-col items-center">
            <div className="flex items-center justify-center mb-2" style={{ width: '100px' }}>
              <div style={{
                flex: 1,
                height: '1px',
                background: 'linear-gradient(to right, transparent, rgba(180,150,80,0.35))'
              }} />
              <div className="mx-2" style={{
                width: '3px',
                height: '3px',
                backgroundColor: 'rgba(212,184,106,0.4)',
                borderRadius: '50%'
              }} />
              <div style={{
                flex: 1,
                height: '1px',
                background: 'linear-gradient(to left, transparent, rgba(180,150,80,0.35))'
              }} />
            </div>
            <p style={{
              fontSize: '10px',
              color: 'rgba(180,150,80,0.45)',
              fontFamily: "'Cormorant Garamond', serif",
              letterSpacing: '0.35em',
              textTransform: 'uppercase'
            }}>
              ORUN ACADEMY
            </p>
          </div>
        </div>
      </div>
    </A4Page>;
}