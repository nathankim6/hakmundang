import { A4Page } from "./A4Page";
import orunLogo from "@/assets/orun-academy-logo-new.png";
interface GrammarBackCoverProps {
  totalPages: number;
}
export function GrammarBackCover({
  totalPages
}: GrammarBackCoverProps) {
  return <A4Page pageNumber={totalPages} totalPages={totalPages} noPadding noHeader noFooter>
      {/* Dark background matching the front cover */}
      <div className="flex-1 flex flex-col relative overflow-hidden" style={{
      backgroundColor: '#0a0a0a'
    }}>
        {/* Clean white background - no overlay */}

        {/* Outer gold border frame */}
        <div className="absolute" style={{
        inset: '20px',
        border: '1px solid rgba(180,150,80,0.4)',
        pointerEvents: 'none'
      }} />
        
        {/* Inner gold border frame */}
        <div className="absolute" style={{
        inset: '28px',
        border: '1px solid rgba(180,150,80,0.2)',
        pointerEvents: 'none'
      }} />

        {/* Corner ornaments - minimal style */}
        <div className="absolute top-8 left-8 w-12 h-12" style={{
        borderTop: '2px solid rgba(180,150,80,0.4)',
        borderLeft: '2px solid rgba(180,150,80,0.4)'
      }} />
        <div className="absolute top-8 right-8 w-12 h-12" style={{
        borderTop: '2px solid rgba(180,150,80,0.4)',
        borderRight: '2px solid rgba(180,150,80,0.4)'
      }} />
        <div className="absolute bottom-8 left-8 w-12 h-12" style={{
        borderBottom: '2px solid rgba(180,150,80,0.4)',
        borderLeft: '2px solid rgba(180,150,80,0.4)'
      }} />
        <div className="absolute bottom-8 right-8 w-12 h-12" style={{
        borderBottom: '2px solid rgba(180,150,80,0.4)',
        borderRight: '2px solid rgba(180,150,80,0.4)'
      }} />

        {/* Content container - centered and minimal */}
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-16">
          
          {/* Logo */}
          <div className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden mb-10" style={{
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          border: '1px solid rgba(180,150,80,0.3)'
        }}>
            <img src={orunLogo} alt="ORUN Academy Logo" className="w-full h-full object-contain p-1" />
          </div>

          {/* Decorative line */}
          <div className="flex items-center justify-center mb-8" style={{
          width: '160px'
        }}>
            <div style={{
            flex: 1,
            height: '1px',
            background: 'linear-gradient(to right, transparent, rgba(180,150,80,0.4))'
          }} />
            <div className="mx-3" style={{
            width: '6px',
            height: '6px',
            backgroundColor: 'rgba(212,184,106,0.5)',
            transform: 'rotate(45deg)'
          }} />
            <div style={{
            flex: 1,
            height: '1px',
            background: 'linear-gradient(to left, transparent, rgba(180,150,80,0.4))'
          }} />
          </div>

          {/* Academy name */}
          <p style={{
          fontSize: '14px',
          color: 'rgba(180,150,80,0.7)',
          fontFamily: "'Cormorant Garamond', serif",
          letterSpacing: '0.5em',
          textTransform: 'uppercase',
          marginBottom: '8px'
        }}>
            ORUN ACADEMY
          </p>

          {/* Korean name */}
          
        </div>

        {/* Bottom info section */}
        <div className="absolute bottom-16 left-0 right-0 flex flex-col items-center">
          {/* Decorative line */}
          <div className="flex items-center justify-center mb-6" style={{
          width: '200px'
        }}>
            <div style={{
            flex: 1,
            height: '1px',
            background: 'linear-gradient(to right, transparent, rgba(180,150,80,0.3))'
          }} />
            <div className="mx-2" style={{
            width: '4px',
            height: '4px',
            backgroundColor: 'rgba(212,184,106,0.4)',
            borderRadius: '50%'
          }} />
            <div style={{
            flex: 1,
            height: '1px',
            background: 'linear-gradient(to left, transparent, rgba(180,150,80,0.3))'
          }} />
          </div>

          {/* Contact info */}
          <p style={{
          fontSize: '10px',
          color: 'rgba(180,150,80,0.4)',
          fontFamily: "'Cormorant Garamond', serif",
          letterSpacing: '0.2em',
          textAlign: 'center',
          lineHeight: '1.8'
        }}>
            www.orunacademy.com
          </p>
        </div>
      </div>
    </A4Page>;
}