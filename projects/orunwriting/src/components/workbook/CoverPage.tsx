import { A4Page } from "./A4Page";
import orunLogo from "@/assets/orun-academy-logo.jpg";
interface CoverPageProps {
  totalPages: number;
}
export function CoverPage({
  totalPages
}: CoverPageProps) {
  return <A4Page pageNumber={1} totalPages={totalPages} noHeader noFooter>
      <div className="flex flex-col items-center justify-between min-h-[280mm] h-full relative overflow-hidden -m-[8mm] p-[12mm]">
        {/* Deep navy background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d1424] via-[#111827] to-[#0a0f1a] pointer-events-none" />
        
        {/* Subtle leather texture overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
      }} />

        {/* Elegant gold corner ornaments */}
        <div className="absolute top-[6mm] left-[6mm] w-16 h-16 pointer-events-none">
          <svg viewBox="0 0 64 64" className="w-full h-full">
            <path d="M0 0 L64 0 L64 8 L8 8 L8 64 L0 64 Z" fill="none" stroke="#D4A84B" strokeWidth="1" opacity="0.6" />
            <path d="M4 4 L48 4 L48 6 L6 6 L6 48 L4 48 Z" fill="none" stroke="#D4A84B" strokeWidth="0.5" opacity="0.4" />
            <circle cx="12" cy="12" r="2" fill="#D4A84B" opacity="0.5" />
          </svg>
        </div>
        <div className="absolute top-[6mm] right-[6mm] w-16 h-16 pointer-events-none rotate-90">
          <svg viewBox="0 0 64 64" className="w-full h-full">
            <path d="M0 0 L64 0 L64 8 L8 8 L8 64 L0 64 Z" fill="none" stroke="#D4A84B" strokeWidth="1" opacity="0.6" />
            <path d="M4 4 L48 4 L48 6 L6 6 L6 48 L4 48 Z" fill="none" stroke="#D4A84B" strokeWidth="0.5" opacity="0.4" />
            <circle cx="12" cy="12" r="2" fill="#D4A84B" opacity="0.5" />
          </svg>
        </div>
        <div className="absolute bottom-[6mm] left-[6mm] w-16 h-16 pointer-events-none -rotate-90">
          <svg viewBox="0 0 64 64" className="w-full h-full">
            <path d="M0 0 L64 0 L64 8 L8 8 L8 64 L0 64 Z" fill="none" stroke="#D4A84B" strokeWidth="1" opacity="0.6" />
            <path d="M4 4 L48 4 L48 6 L6 6 L6 48 L4 48 Z" fill="none" stroke="#D4A84B" strokeWidth="0.5" opacity="0.4" />
            <circle cx="12" cy="12" r="2" fill="#D4A84B" opacity="0.5" />
          </svg>
        </div>
        <div className="absolute bottom-[6mm] right-[6mm] w-16 h-16 pointer-events-none rotate-180">
          <svg viewBox="0 0 64 64" className="w-full h-full">
            <path d="M0 0 L64 0 L64 8 L8 8 L8 64 L0 64 Z" fill="none" stroke="#D4A84B" strokeWidth="1" opacity="0.6" />
            <path d="M4 4 L48 4 L48 6 L6 6 L6 48 L4 48 Z" fill="none" stroke="#D4A84B" strokeWidth="0.5" opacity="0.4" />
            <circle cx="12" cy="12" r="2" fill="#D4A84B" opacity="0.5" />
          </svg>
        </div>
        
        {/* Decorative border frame with multiple layers */}
        <div className="absolute inset-[12mm] border border-[#D4A84B]/40 pointer-events-none" />
        <div className="absolute inset-[14mm] border border-[#D4A84B]/20 pointer-events-none" />
        <div className="absolute inset-[16mm] border-[0.5px] border-[#D4A84B]/10 pointer-events-none" />

        {/* Top decorative element */}
        <div className="relative z-10 flex flex-col items-center pt-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-[#D4A84B]/60 to-[#D4A84B]" />
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#D4A84B]" fill="currentColor">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
            </svg>
            <div className="w-20 h-[1px] bg-gradient-to-l from-transparent via-[#D4A84B]/60 to-[#D4A84B]" />
          </div>
          <span className="text-[9px] font-light tracking-[0.6em] text-[#D4A84B]/80 uppercase">
            2026 Winter Edition
          </span>
        </div>

        {/* Main Content - Center */}
        <div className="relative z-10 flex flex-col items-center flex-1 justify-center -mt-4">
          {/* Premium Logo with elegant frame */}
          <div className="relative mb-10">
            {/* Outer decorative ring */}
            <div className="absolute -inset-6 rounded-full border border-[#D4A84B]/20" />
            <div className="absolute -inset-5 rounded-full border border-[#D4A84B]/10" />
            {/* Gold glow */}
            <div className="absolute -inset-3 bg-[#D4A84B]/8 rounded-full blur-xl" />
            {/* Main gold ring with gradient */}
            <div className="absolute -inset-2 rounded-full bg-gradient-to-b from-[#E8C066] via-[#D4A84B] to-[#9A7632] p-[2px]">
              <div className="w-full h-full rounded-full bg-[#0d1424]" />
            </div>
            {/* Inner gold ring */}
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-b from-[#D4A84B] via-[#C49B42] to-[#8B6914] p-[1.5px]">
              <div className="w-full h-full rounded-full bg-[#111827]" />
            </div>
            {/* Logo container */}
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gradient-to-b from-[#1a2234] to-[#0d1424] flex items-center justify-center shadow-2xl">
              <img src={orunLogo} alt="ORUN Academy" className="w-28 h-28 object-contain rounded-full" />
            </div>
          </div>

          {/* Brand identifier */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              <span className="text-[#D4A84B]/60 text-[8px]">◆</span>
              <span className="text-[#D4A84B]/80 text-[6px]">◆</span>
            </div>
            <span className="text-[11px] font-medium tracking-[0.25em] text-[#D4A84B]/90">2026 WINTER SPECIAL</span>
            <div className="flex items-center gap-1">
              <span className="text-[#D4A84B]/80 text-[6px]">◆</span>
              <span className="text-[#D4A84B]/60 text-[8px]">◆</span>
            </div>
          </div>

          {/* Brand name with elegant styling */}
          <h2 className="text-lg font-semibold tracking-[0.35em] text-slate-300/90 mb-8 uppercase">
            Orun English
          </h2>

          {/* Decorative divider */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-16 h-[0.5px] bg-gradient-to-r from-transparent to-[#D4A84B]/50" />
            <div className="flex items-center gap-2">
              <span className="text-[#D4A84B]/50 text-[6px]">◆</span>
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#D4A84B]" fill="currentColor">
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
              </svg>
              <span className="text-[#D4A84B]/50 text-[6px]">◆</span>
            </div>
            <div className="w-16 h-[0.5px] bg-gradient-to-l from-transparent to-[#D4A84B]/50" />
          </div>

          {/* Main Title - Elegant typography */}
          <div className="relative mb-8">
            <h1 className="text-[52px] font-black text-transparent bg-clip-text bg-gradient-to-b from-[#E8C066] via-[#D4A84B] to-[#9A7632] text-center tracking-wide leading-tight" style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            textShadow: '0 2px 20px rgba(212, 168, 75, 0.3)'
          }}>
              The Art of Writing
            </h1>
            {/* Subtle underline decoration */}
            <div className="flex justify-center mt-4">
              <div className="w-40 h-[1px] bg-gradient-to-r from-transparent via-[#D4A84B]/40 to-transparent" />
            </div>
          </div>

          {/* Subtitle section */}
          <div className="text-center mb-6">
            <p className="text-[9px] text-slate-500 mb-2 tracking-widest uppercase">고등 내신 1등급 완성  </p>
            <p className="text-sm font-semibold text-slate-300 tracking-[0.15em]">서술형 마스터 클래스</p>
          </div>

          {/* Elegant vertical line */}
          <div className="w-[0.5px] h-14 bg-gradient-to-b from-[#D4A84B]/60 via-[#D4A84B]/30 to-transparent" />
        </div>

        {/* Bottom - Premium publisher badge */}
        <div className="relative z-10 pb-6">
          <div className="flex flex-col items-center">
            {/* Decorative line above badge */}
            <div className="flex items-center gap-4 mb-5">
              <div className="w-24 h-[0.5px] bg-gradient-to-r from-transparent via-[#D4A84B]/30 to-[#D4A84B]/50" />
              <span className="text-[#D4A84B]/40 text-[6px]">◆◆◆</span>
              <div className="w-24 h-[0.5px] bg-gradient-to-l from-transparent via-[#D4A84B]/30 to-[#D4A84B]/50" />
            </div>
            
            {/* Publisher badge */}
            <div className="relative">
              {/* Subtle glow */}
              <div className="absolute -inset-3 bg-[#D4A84B]/5 rounded-xl blur-lg" />
              {/* Badge container */}
              
            </div>
          </div>
        </div>
      </div>
    </A4Page>;
}