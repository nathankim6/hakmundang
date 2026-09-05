import { FileSpreadsheet, Wand2, BookOpen } from 'lucide-react';

export const Hero = () => {
  const steps = [
    { label: '엑셀 업로드', icon: FileSpreadsheet },
    { label: 'AI 자동 생성', icon: Wand2 },
    { label: '단어장 완성', icon: BookOpen },
  ];

  return (
    <div className="text-center mb-12 animate-fade-in relative">
      {/* Eyebrow */}
      <div className="flex items-center justify-center gap-3 mb-7">
        <div className="h-px w-14 bg-gradient-to-r from-transparent to-border" />
        <div className="w-1 h-1 rotate-45 bg-primary/70" />
        <span
          className="text-[10px] font-semibold tracking-[0.42em] uppercase text-muted-foreground"
          style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
        >
          Vocabulary&nbsp;·&nbsp;Workbook&nbsp;·&nbsp;Studio
        </span>
        <div className="w-1 h-1 rotate-45 bg-primary/70" />
        <div className="h-px w-14 bg-gradient-to-l from-transparent to-border" />
      </div>

      {/* Main Title */}
      <h1 className="mb-6 relative inline-block" style={{ fontFamily: '"Noto Sans KR", sans-serif' }}>
        {/* Ghost watermark behind title */}
        <span
          aria-hidden
          className="absolute inset-x-0 -top-4 text-[110px] md:text-[140px] font-bold leading-none select-none pointer-events-none"
          style={{
            fontFamily: '"Noto Sans KR", sans-serif',
            color: 'hsl(var(--foreground))',
            opacity: 0.035,
            letterSpacing: '0.06em',
          }}
        >
          ORUN
        </span>
        <span
          className="relative block text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-none"
          style={{
            background: 'linear-gradient(160deg, #1a1f2e 0%, #2a2f3e 50%, hsl(var(--foreground)) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 1px 0 rgba(255,255,255,0.5)',
          }}
        >
          ORUN
        </span>
        <span
          className="relative block text-3xl md:text-4xl lg:text-5xl font-normal tracking-[0.18em] mt-2"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(32 75% 45%))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          VOCA MAKER
        </span>
        {/* Underline ornament */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="h-px w-10 bg-gradient-to-r from-transparent to-primary/40" />
          <div className="w-1.5 h-1.5 rotate-45 border border-primary/60" />
          <div className="h-px w-10 bg-gradient-to-l from-transparent to-primary/40" />
        </div>
      </h1>

      {/* Subtitle */}
      <p
        className="text-[15px] md:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed mb-9"
        style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
      >
        엑셀을 업로드하면 AI가 발음기호·예문을 생성하고
        <br className="hidden md:block" />
        인쇄용 B5 단어장을 자동으로 제작합니다
      </p>

      {/* Process Steps — numbered editorial */}
      <div className="flex items-stretch justify-center gap-0">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={step.label} className="flex items-stretch">
              <div className="flex flex-col items-center gap-2 px-5 py-3 group">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-semibold tracking-[0.2em] text-primary/70"
                    style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="w-6 h-px bg-border" />
                  <Icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-[11px] font-medium text-foreground/80 tracking-wide">
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex items-center">
                  <div className="w-8 h-px bg-gradient-to-r from-border via-border to-transparent" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
