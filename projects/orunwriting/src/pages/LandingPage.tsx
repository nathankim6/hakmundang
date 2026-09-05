import { useNavigate } from "react-router-dom";
import { FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import orunLogo from "@/assets/orun-academy-logo.jpg";
import { BookCoverCard } from "@/components/landing/BookCoverCard";

export default function LandingPage() {
  const navigate = useNavigate();
  return <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Elegant background pattern */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(212,184,106,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(212,184,106,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        
        {/* Diamond pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(45deg, rgba(212,184,106,0.5) 25%, transparent 25%),
              linear-gradient(-45deg, rgba(212,184,106,0.5) 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, rgba(212,184,106,0.5) 75%),
              linear-gradient(-45deg, transparent 75%, rgba(212,184,106,0.5) 75%)
            `,
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0, 0 20px, 20px -20px, -20px 0px',
          }}
        />
        
        {/* Decorative corner flourishes - Top Left */}
        <svg className="absolute top-0 left-0 w-64 h-64 opacity-[0.06]" viewBox="0 0 200 200">
          <path d="M0,100 Q0,0 100,0" stroke="rgba(212,184,106,1)" strokeWidth="1" fill="none" />
          <path d="M0,80 Q0,0 80,0" stroke="rgba(212,184,106,0.8)" strokeWidth="0.5" fill="none" />
          <path d="M0,60 Q0,0 60,0" stroke="rgba(212,184,106,0.6)" strokeWidth="0.5" fill="none" />
          <circle cx="100" cy="0" r="3" fill="rgba(212,184,106,0.8)" />
          <circle cx="0" cy="100" r="3" fill="rgba(212,184,106,0.8)" />
          <path d="M20,20 Q35,35 50,20 Q65,35 50,50 Q35,65 20,50 Q5,35 20,20" stroke="rgba(212,184,106,0.6)" strokeWidth="0.5" fill="none" />
        </svg>
        
        {/* Decorative corner flourishes - Top Right */}
        <svg className="absolute top-0 right-0 w-64 h-64 opacity-[0.06]" viewBox="0 0 200 200" style={{ transform: 'scaleX(-1)' }}>
          <path d="M0,100 Q0,0 100,0" stroke="rgba(212,184,106,1)" strokeWidth="1" fill="none" />
          <path d="M0,80 Q0,0 80,0" stroke="rgba(212,184,106,0.8)" strokeWidth="0.5" fill="none" />
          <path d="M0,60 Q0,0 60,0" stroke="rgba(212,184,106,0.6)" strokeWidth="0.5" fill="none" />
          <circle cx="100" cy="0" r="3" fill="rgba(212,184,106,0.8)" />
          <circle cx="0" cy="100" r="3" fill="rgba(212,184,106,0.8)" />
          <path d="M20,20 Q35,35 50,20 Q65,35 50,50 Q35,65 20,50 Q5,35 20,20" stroke="rgba(212,184,106,0.6)" strokeWidth="0.5" fill="none" />
        </svg>
        
        {/* Decorative corner flourishes - Bottom Left */}
        <svg className="absolute bottom-0 left-0 w-64 h-64 opacity-[0.06]" viewBox="0 0 200 200" style={{ transform: 'scaleY(-1)' }}>
          <path d="M0,100 Q0,0 100,0" stroke="rgba(212,184,106,1)" strokeWidth="1" fill="none" />
          <path d="M0,80 Q0,0 80,0" stroke="rgba(212,184,106,0.8)" strokeWidth="0.5" fill="none" />
          <path d="M0,60 Q0,0 60,0" stroke="rgba(212,184,106,0.6)" strokeWidth="0.5" fill="none" />
          <circle cx="100" cy="0" r="3" fill="rgba(212,184,106,0.8)" />
          <circle cx="0" cy="100" r="3" fill="rgba(212,184,106,0.8)" />
          <path d="M20,20 Q35,35 50,20 Q65,35 50,50 Q35,65 20,50 Q5,35 20,20" stroke="rgba(212,184,106,0.6)" strokeWidth="0.5" fill="none" />
        </svg>
        
        {/* Decorative corner flourishes - Bottom Right */}
        <svg className="absolute bottom-0 right-0 w-64 h-64 opacity-[0.06]" viewBox="0 0 200 200" style={{ transform: 'scale(-1)' }}>
          <path d="M0,100 Q0,0 100,0" stroke="rgba(212,184,106,1)" strokeWidth="1" fill="none" />
          <path d="M0,80 Q0,0 80,0" stroke="rgba(212,184,106,0.8)" strokeWidth="0.5" fill="none" />
          <path d="M0,60 Q0,0 60,0" stroke="rgba(212,184,106,0.6)" strokeWidth="0.5" fill="none" />
          <circle cx="100" cy="0" r="3" fill="rgba(212,184,106,0.8)" />
          <circle cx="0" cy="100" r="3" fill="rgba(212,184,106,0.8)" />
          <path d="M20,20 Q35,35 50,20 Q65,35 50,50 Q35,65 20,50 Q5,35 20,20" stroke="rgba(212,184,106,0.6)" strokeWidth="0.5" fill="none" />
        </svg>
        
        {/* Center decorative line */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl opacity-[0.04]">
          <svg className="w-full h-16" viewBox="0 0 800 64" preserveAspectRatio="xMidYMid meet">
            <line x1="0" y1="32" x2="350" y2="32" stroke="rgba(212,184,106,1)" strokeWidth="1" />
            <line x1="450" y1="32" x2="800" y2="32" stroke="rgba(212,184,106,1)" strokeWidth="1" />
            <circle cx="400" cy="32" r="8" stroke="rgba(212,184,106,1)" strokeWidth="1" fill="none" />
            <circle cx="400" cy="32" r="4" fill="rgba(212,184,106,0.6)" />
            <path d="M360,32 L375,24 L375,40 Z" fill="rgba(212,184,106,0.5)" />
            <path d="M440,32 L425,24 L425,40 Z" fill="rgba(212,184,106,0.5)" />
          </svg>
        </div>
        
        {/* Radial gradient overlays */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-tl from-primary/5 via-transparent to-transparent" />
      </div>

      {/* Header */}
      <header className="relative overflow-hidden border-b border-border">
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
        
        <div className="relative z-10 container mx-auto px-6 py-12 md:py-20 text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden border-2 border-primary/30" style={{
            backgroundColor: '#ffffff'
          }}>
              <img src={orunLogo} alt="ORUN Academy Logo" className="w-12 h-12 object-contain rounded-full" />
            </div>
            <span className="text-lg font-serif tracking-[0.3em] text-muted-foreground uppercase">
              ORUN ACADEMY
            </span>
          </div>
          
          {/* Main Title */}
          <h1 className="font-cinzel text-4xl md:text-5xl mb-2 leading-tight tracking-[0.15em] uppercase animate-shimmer bg-[length:200%_100%]"
            style={{
              background: 'linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(45, 80%, 70%) 25%, hsl(var(--primary)) 50%, hsl(45, 80%, 70%) 75%, hsl(var(--primary)) 100%)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            ORUN WRITING
          </h1>
          
          {/* Subtitle */}
          <p className="text-sm font-serif tracking-[0.3em] text-muted-foreground uppercase mb-10">
            Writing Collection
          </p>
          
          {/* Book Cover Cards */}
          <div className="flex items-center justify-center gap-3 md:gap-5 overflow-x-auto pb-4">
            <BookCoverCard variant="combined" onClick={() => navigate('/workbook/combined')} />
            <BookCoverCard variant="reading" onClick={() => navigate('/workbook/reading/1')} />
            <BookCoverCard variant="grammar" onClick={() => navigate('/workbook/grammar')} />
            <BookCoverCard variant="school" onClick={() => navigate('/workbook/school')} />
            <BookCoverCard variant="appendix" onClick={() => navigate('/workbook/appendix')} />
          </div>

          {/* Exam Menu Section */}
          <div className="mt-12 pt-10 border-t border-border/30">
            <p className="text-xs font-serif tracking-[0.25em] text-muted-foreground uppercase mb-6">
              Online Assessment
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={() => navigate('/exam/create')}
                className="group relative overflow-hidden flex items-center gap-3 bg-gradient-to-r from-primary to-primary/90 hover:from-primary hover:to-primary text-primary-foreground px-8 py-4 h-auto rounded-2xl font-medium tracking-wide shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                <div className="relative flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="block text-base font-semibold">시험 생성</span>
                    <span className="block text-xs opacity-80">Create Exam</span>
                  </div>
                </div>
              </Button>
              <Button
                onClick={() => navigate('/exam/list')}
                variant="outline"
                className="group relative overflow-hidden flex items-center gap-3 border-2 border-primary/40 hover:border-primary bg-background/50 backdrop-blur-sm hover:bg-primary/5 px-8 py-4 h-auto rounded-2xl font-medium tracking-wide shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="relative flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <span className="block text-base font-semibold">시험 참여</span>
                    <span className="block text-xs text-muted-foreground">Take Exam</span>
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Workbooks Grid */}
      

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border border-primary/30" style={{
              backgroundColor: '#ffffff'
            }}>
                <img src={orunLogo} alt="ORUN Academy Logo" className="w-8 h-8 object-contain rounded-full" />
              </div>
              <span className="text-sm font-serif tracking-wider text-muted-foreground">
                ORUN ACADEMY
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-serif">
              © 2026 Orun Academy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>;
}