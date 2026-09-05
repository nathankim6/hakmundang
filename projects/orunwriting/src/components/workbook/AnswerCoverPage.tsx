import { A4Page } from "./A4Page";
import orunLogo from "@/assets/orun-academy-logo-new.png";
interface AnswerCoverPageProps {
  pageNumber: number;
  totalPages: number;
  totalProblems: number;
}
export function AnswerCoverPage({
  pageNumber,
  totalPages,
  totalProblems
}: AnswerCoverPageProps) {
  return <A4Page pageNumber={pageNumber} totalPages={totalPages} noPadding noHeader noFooter>
      {/* Dark navy background matching hardcover */}
      <div className="flex-1 flex flex-col relative overflow-hidden" style={{
      backgroundColor: '#0f1419'
    }}>
        {/* Outer gold border frame */}
        <div className="absolute" style={{
        inset: '20px',
        border: '2px solid rgba(212,175,55,0.4)',
        pointerEvents: 'none'
      }} />
        
        {/* Inner gold border frame */}
        <div className="absolute" style={{
        inset: '28px',
        border: '1px solid rgba(212,175,55,0.2)',
        pointerEvents: 'none'
      }} />

        {/* Corner ornaments */}
        <div className="absolute top-6 left-6 w-6 h-6 border-t-2 border-l-2" style={{
        borderColor: 'rgba(212,175,55,0.5)'
      }} />
        <div className="absolute top-6 right-6 w-6 h-6 border-t-2 border-r-2" style={{
        borderColor: 'rgba(212,175,55,0.5)'
      }} />
        <div className="absolute bottom-6 left-6 w-6 h-6 border-b-2 border-l-2" style={{
        borderColor: 'rgba(212,175,55,0.5)'
      }} />
        <div className="absolute bottom-6 right-6 w-6 h-6 border-b-2 border-r-2" style={{
        borderColor: 'rgba(212,175,55,0.5)'
      }} />

        {/* Content container */}
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-12">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-20 h-20 flex items-center justify-center overflow-hidden">
              <img src={orunLogo} alt="ORUN Academy Logo" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Appendix indicator */}
          <p style={{
          fontSize: '10px',
          color: 'rgba(212,175,55,0.6)',
          fontFamily: "'Cormorant Garamond', serif",
          letterSpacing: '0.5em',
          textTransform: 'uppercase',
          marginBottom: '4px'
        }}>
            Appendix
          </p>

          {/* Section Label */}
          <p style={{
          fontSize: '14px',
          color: '#d4af37',
          fontFamily: "'Cormorant Garamond', serif",
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          marginBottom: '20px',
          fontWeight: '500'
        }}>
            Answer Key
          </p>

          {/* Decorative line */}
          <div className="mb-6" style={{
          width: '100px',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, #d4af37, transparent)'
        }} />

          {/* Main Title - Korean */}
          <h1 style={{
          fontSize: '42px',
          lineHeight: '1.1',
          fontWeight: '700',
          color: '#c9a227',
          letterSpacing: '0.08em',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          marginBottom: '8px',
          textAlign: 'center'
        }}>
            정답 및 해설
          </h1>

          {/* English subtitle */}
          <p style={{
          fontSize: '13px',
          color: 'rgba(212,175,55,0.7)',
          fontFamily: "'Cormorant Garamond', serif",
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          marginBottom: '24px'
        }}>
            Answer Key & Explanation
          </p>

          {/* Decorative diamond divider */}
          <div className="flex items-center gap-3 mb-8">
            <div style={{
            width: '50px',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.4))'
          }} />
            <div style={{
            width: '5px',
            height: '5px',
            background: '#d4af37',
            transform: 'rotate(45deg)'
          }} />
            <div style={{
            width: '50px',
            height: '1px',
            background: 'linear-gradient(90deg, rgba(212,175,55,0.4), transparent)'
          }} />
          </div>

          {/* Description */}
          <p className="max-w-sm text-center" style={{
          fontSize: '12px',
          color: 'rgba(212,175,55,0.5)',
          lineHeight: '1.8',
          marginBottom: '24px'
        }}>
            각 문제의 정답과 해설을 확인하여<br />
            학습 내용을 복습하고 실력을 점검하세요.
          </p>

          {/* Stats */}
          

          {/* Bottom: ORUN ACADEMY */}
          <div className="absolute bottom-10 flex flex-col items-center">
            <div className="mb-2" style={{
            width: '60px',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)'
          }} />
            <p style={{
            fontSize: '9px',
            color: 'rgba(212,175,55,0.4)',
            fontFamily: "'Cormorant Garamond', serif",
            letterSpacing: '0.5em',
            textTransform: 'uppercase'
          }}>
              ORUN ACADEMY
            </p>
          </div>
        </div>
      </div>
    </A4Page>;
}