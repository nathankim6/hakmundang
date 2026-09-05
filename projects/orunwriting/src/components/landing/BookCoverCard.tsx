import orunLogo from "@/assets/orun-academy-logo-new.png";

type CoverVariant = 'combined' | 'reading' | 'grammar' | 'school' | 'appendix';

interface BookCoverCardProps {
  variant: CoverVariant;
  onClick: () => void;
}

const getContent = (variant: CoverVariant) => {
  switch (variant) {
    case 'combined':
      return {
        partLabel: '합본',
        mainTitle: 'ORUN',
        subtitle: 'WRITING',
        bottomText: 'ENGLISH WRITING COLLECTION',
        koreanTitle: '영작워크북',
        accentColor: '#d4b86a',
      };
    case 'reading':
      return {
        partLabel: 'PART 1',
        mainTitle: 'PATTERN',
        subtitle: 'INTERNALIZATION',
        bottomText: 'WRITING COLLECTION',
        koreanTitle: '서술형 유형연습',
        accentColor: '#d4b86a',
      };
    case 'grammar':
      return {
        partLabel: 'PART 2',
        mainTitle: 'WRITING',
        subtitle: 'WORKBOOK',
        bottomText: 'ENGLISH WRITING COLLECTION',
        koreanTitle: '영작워크북',
        accentColor: '#d4b86a',
      };
    case 'school':
      return {
        partLabel: 'PART 3',
        mainTitle: 'SCHOOL',
        subtitle: 'EXAM',
        bottomText: 'SCHOOL EXAM QUESTIONS',
        koreanTitle: '학교별 기출문제',
        accentColor: '#d4b86a',
      };
    case 'appendix':
      return {
        partLabel: '부록',
        mainTitle: 'VERB',
        subtitle: 'PATTERNS',
        bottomText: 'ESSENTIAL VERB PATTERNS',
        koreanTitle: '주요동사 문형정리',
        accentColor: '#d4b86a',
      };
  }
};

export function BookCoverCard({
  variant,
  onClick,
}: BookCoverCardProps) {
  const content = getContent(variant);
  
  return (
    <div className="flex flex-col items-center gap-4 group">
      {/* Book with 3D effect */}
      <button
        onClick={onClick}
        className="relative flex-shrink-0 transition-all duration-500 hover:-translate-y-2"
        style={{
          perspective: '1200px',
        }}
      >
        {/* Book wrapper with 3D transform */}
        <div 
          className="relative transition-transform duration-500 group-hover:rotate-y-[-3deg]"
          style={{
            width: '150px',
            height: '200px',
            transformStyle: 'preserve-3d',
            transform: 'rotateY(-12deg) rotateX(3deg)',
          }}
        >
          {/* Book spine shadow */}
          <div 
            className="absolute -left-1 top-2 bottom-2 w-3 rounded-l-sm"
            style={{
              background: 'linear-gradient(to right, rgba(0,0,0,0.4), rgba(0,0,0,0.1))',
              filter: 'blur(2px)',
              transform: 'translateZ(-5px)',
            }}
          />
          
          {/* Book spine */}
          <div 
            className="absolute left-0 top-0 h-full rounded-l-sm"
            style={{
              width: '14px',
              background: `linear-gradient(to right, 
                #0d0f14 0%, 
                #181c24 30%,
                #1f242e 50%, 
                #252a36 70%,
                #2a303c 100%
              )`,
              transform: 'rotateY(90deg) translateZ(-7px) translateX(-7px)',
              transformOrigin: 'left center',
              boxShadow: 'inset -3px 0 6px rgba(0,0,0,0.6)',
            }}
          >
            {/* Spine gold line */}
            <div 
              className="absolute right-1 top-4 bottom-4 w-px"
              style={{ backgroundColor: 'rgba(212,184,106,0.3)' }}
            />
          </div>
          
          {/* Book cover front */}
          <div 
            className="absolute inset-0 rounded-r-sm overflow-hidden"
            style={{
              background: `linear-gradient(145deg, 
                #1e2229 0%, 
                #171a20 30%, 
                #13161b 60%, 
                #0f1115 100%
              )`,
              boxShadow: `
                12px 12px 30px rgba(0,0,0,0.5),
                6px 6px 15px rgba(0,0,0,0.4),
                2px 2px 5px rgba(0,0,0,0.3),
                inset 0 1px 0 rgba(255,255,255,0.05),
                inset 0 0 80px rgba(0,0,0,0.4)
              `,
              borderLeft: '1px solid rgba(60,65,75,0.5)',
              borderTop: '1px solid rgba(60,65,75,0.3)',
              borderRight: '1px solid rgba(30,35,45,0.8)',
              borderBottom: '1px solid rgba(30,35,45,0.8)',
            }}
          >
            {/* Leather texture effect */}
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              }}
            />
            
            {/* Outer gold border frame */}
            <div 
              className="absolute"
              style={{
                inset: '10px',
                border: '1.5px solid rgba(180,150,80,0.45)',
                boxShadow: '0 0 12px rgba(180,150,80,0.08), inset 0 0 12px rgba(180,150,80,0.05)',
              }}
            />
            
            {/* Inner gold border frame */}
            <div 
              className="absolute"
              style={{
                inset: '16px',
                border: '0.5px solid rgba(180,150,80,0.2)',
              }}
            />
            
            {/* Corner ornaments */}
            {[
              { top: '10px', left: '10px', rotate: '0deg' },
              { top: '10px', right: '10px', rotate: '90deg' },
              { bottom: '10px', left: '10px', rotate: '-90deg' },
              { bottom: '10px', right: '10px', rotate: '180deg' },
            ].map((pos, i) => (
              <svg 
                key={i}
                className="absolute w-5 h-5" 
                viewBox="0 0 20 20" 
                style={{ 
                  ...pos, 
                  transform: `rotate(${pos.rotate})`,
                  opacity: 0.4,
                }}
              >
                <path d="M0,10 Q0,0 10,0" stroke="rgba(212,184,106,0.8)" strokeWidth="0.5" fill="none" />
                <path d="M0,6 Q0,0 6,0" stroke="rgba(212,184,106,0.5)" strokeWidth="0.3" fill="none" />
                <circle cx="10" cy="0" r="1" fill="rgba(212,184,106,0.6)" />
                <circle cx="0" cy="10" r="1" fill="rgba(212,184,106,0.6)" />
              </svg>
            ))}
            
            {/* Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-between px-5 py-5">
              {/* Top section: Logo */}
              <div className="relative mt-1">
                {/* Outer glow ring */}
                <div 
                  className="absolute -inset-3 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(212,184,106,0.25) 0%, transparent 70%)',
                  }}
                />
                {/* Gold ring */}
                <div 
                  className="absolute -inset-1.5 rounded-full"
                  style={{
                    border: '2px solid',
                    borderColor: content.accentColor,
                    boxShadow: `0 0 12px rgba(212,184,106,0.35), inset 0 0 8px rgba(212,184,106,0.15)`,
                    opacity: 0.8,
                  }}
                />
                {/* Logo container */}
                <div 
                  className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden relative z-10"
                  style={{
                    backgroundColor: '#ffffff',
                    boxShadow: '0 3px 10px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.3)',
                  }}
                >
                  <img src={orunLogo} alt="ORUN" className="w-full h-full object-contain" />
                </div>
              </div>
              
              {/* Part label */}
              <div 
                className="text-[8px] tracking-[0.3em] uppercase"
                style={{ 
                  color: 'rgba(180,150,80,0.7)',
                  fontFamily: "'Cormorant Garamond', serif",
                  letterSpacing: '0.35em',
                }}
              >
                {content.partLabel}
              </div>
              
              {/* Main titles */}
              <div className="flex flex-col items-center -mt-2">
                <h3 
                  className="font-cinzel text-center leading-none"
                  style={{ 
                    fontSize: '20px',
                    fontWeight: '700',
                    letterSpacing: '0.06em',
                    color: content.accentColor,
                    textShadow: `
                      0 2px 0 #9a7830,
                      0 3px 0 #8a6820,
                      0 4px 15px rgba(0,0,0,0.6)
                    `,
                  }}
                >
                  {content.mainTitle}
                </h3>
                <h4 
                  className="font-cinzel text-center leading-none mt-0.5"
                  style={{ 
                    fontSize: '12px',
                    fontWeight: '600',
                    letterSpacing: '0.12em',
                    color: '#c0a050',
                    textShadow: '0 1px 0 #806020, 0 2px 10px rgba(0,0,0,0.5)',
                  }}
                >
                  {content.subtitle}
                </h4>
              </div>
              
              {/* Bottom section */}
              <div className="flex flex-col items-center mb-0">
                <p 
                  className="text-[5.5px] tracking-[0.18em] uppercase text-center"
                  style={{ 
                    color: 'rgba(180,150,80,0.45)',
                    fontFamily: "'Cormorant Garamond', serif",
                  }}
                >
                  {content.bottomText}
                </p>
                
                {/* Decorative divider */}
                <div className="flex items-center gap-2 my-2">
                  <div style={{ 
                    width: '24px', 
                    height: '1px', 
                    background: 'linear-gradient(to right, transparent, rgba(180,150,80,0.4))' 
                  }} />
                  <div style={{ 
                    width: '4px', 
                    height: '4px', 
                    backgroundColor: 'rgba(212,184,106,0.4)', 
                    transform: 'rotate(45deg)',
                  }} />
                  <div style={{ 
                    width: '24px', 
                    height: '1px', 
                    background: 'linear-gradient(to left, transparent, rgba(180,150,80,0.4))' 
                  }} />
                </div>
                
                {/* Korean title */}
                <p 
                  className="text-[9px] text-center font-medium"
                  style={{
                    fontFamily: "'Noto Sans KR', sans-serif",
                    color: '#9a9a9a',
                    letterSpacing: '0.05em',
                  }}
                >
                  {content.koreanTitle}
                </p>
              </div>
            </div>
            
            {/* Light reflection effect */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.1) 100%)',
              }}
            />
            
            {/* Hover glow */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 50% 30%, rgba(212,175,55,0.15) 0%, transparent 60%)',
              }}
            />
          </div>
          
          {/* Book pages (right edge) */}
          <div 
            className="absolute right-0 top-[5px] bottom-[5px]"
            style={{
              width: '8px',
              background: `linear-gradient(to right, 
                #f8f4ec 0%, 
                #f0ece4 30%,
                #e8e4dc 60%,
                #e0dcd4 100%
              )`,
              transform: 'translateX(3px)',
              borderRadius: '0 2px 2px 0',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1), inset 0 -1px 2px rgba(0,0,0,0.05)',
            }}
          >
            {/* Page lines texture */}
            <div 
              className="absolute inset-0"
              style={{
                background: `repeating-linear-gradient(
                  to bottom,
                  transparent 0px,
                  transparent 2px,
                  rgba(0,0,0,0.04) 2px,
                  rgba(0,0,0,0.04) 3px
                )`,
              }}
            />
          </div>
          
          {/* Bottom shadow */}
          <div 
            className="absolute -bottom-4 left-3 right-1"
            style={{
              height: '25px',
              background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.35) 0%, transparent 70%)',
              filter: 'blur(5px)',
              transform: 'scaleY(0.25)',
            }}
          />
        </div>
      </button>
    </div>
  );
}