import { A4Page } from "./A4Page";
import orunLogo from "@/assets/orun-academy-logo.jpg";

interface TitlePageProps {
  pageNumber: number;
  totalPages: number;
  mainTitle?: string;
  subtitle?: string;
}

export function TitlePage({ 
  pageNumber, 
  totalPages, 
  mainTitle = "서술형 마스터 클래스",
  subtitle = "조건영작 + 배열영작"
}: TitlePageProps) {
  return (
    <A4Page pageNumber={pageNumber} totalPages={totalPages} noPadding noHeader noFooter>
      {/* Clean white/cream background - 면지 */}
      <div 
        className="flex-1 flex flex-col relative overflow-hidden"
        style={{ 
          backgroundColor: '#faf8f5',
        }}
      >
        {/* Subtle texture */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Simple elegant border */}
        <div 
          className="absolute"
          style={{
            inset: '32px',
            border: '1px solid rgba(30,30,30,0.1)',
            pointerEvents: 'none',
          }}
        />

        {/* Content container */}
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-16">
          {/* Logo */}
          <div className="flex flex-col items-center mb-16">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden"
              style={{ 
                backgroundColor: '#ffffff',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.05)',
              }}
            >
              <img 
                src={orunLogo}
                alt="ORUN Academy Logo"
                className="w-14 h-14 object-contain rounded-full"
              />
            </div>
          </div>

          {/* Decorative line */}
          <div 
            className="mb-10"
            style={{ 
              width: '80px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.2), transparent)',
            }}
          />

          {/* Main Title */}
          <h1 
            className="font-cinzel"
            style={{ 
              fontSize: '40px',
              lineHeight: '1.2',
              fontWeight: '600',
              color: '#1a1a1a',
              letterSpacing: '0.1em',
              marginBottom: '16px',
              textAlign: 'center',
            }}
          >
            ORUN WRITING
          </h1>

          {/* Korean Title */}
          <h2 
            style={{ 
              fontSize: '24px',
              lineHeight: '1.3',
              fontWeight: '500',
              color: '#333',
              marginBottom: '12px',
              textAlign: 'center',
            }}
          >
            {mainTitle}
          </h2>
          
          {/* Subtitle */}
          <p 
            style={{ 
              fontSize: '12px',
              color: '#666',
              fontFamily: "'Cormorant Garamond', serif",
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            {subtitle}
          </p>

          {/* Bottom: Publisher */}
          <div 
            className="absolute bottom-16 flex flex-col items-center"
          >
            <div 
              className="mb-4"
              style={{ 
                width: '60px',
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.15), transparent)',
              }}
            />
            <p 
              style={{ 
                fontSize: '10px',
                color: '#999',
                fontFamily: "'Cormorant Garamond', serif",
                letterSpacing: '0.4em',
                textTransform: 'uppercase',
              }}
            >
              ORUN ACADEMY
            </p>
            <p 
              style={{ 
                fontSize: '9px',
                color: '#aaa',
                fontFamily: "'Cormorant Garamond', serif",
                letterSpacing: '0.1em',
                marginTop: '4px',
              }}
            >
              2026 Edition
            </p>
          </div>
        </div>
      </div>
    </A4Page>
  );
}
