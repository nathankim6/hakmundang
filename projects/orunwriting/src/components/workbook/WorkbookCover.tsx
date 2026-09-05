interface WorkbookCoverProps {
  title: string;
  subtitle: string;
  edition?: string;
}

export function WorkbookCover({ title, subtitle, edition = "DRILL" }: WorkbookCoverProps) {
  return (
    <div className="relative min-h-[600px] bg-gradient-to-br from-primary via-navy-dark to-primary overflow-hidden rounded-2xl">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(30deg, transparent 40%, rgba(255,255,255,0.1) 40%, rgba(255,255,255,0.1) 60%, transparent 60%),
            linear-gradient(-30deg, transparent 40%, rgba(255,255,255,0.1) 40%, rgba(255,255,255,0.1) 60%, transparent 60%)
          `,
          backgroundSize: '60px 60px',
        }} />
      </div>
      
      {/* Decorative Circles */}
      <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-gold/10 blur-3xl" />
      <div className="absolute bottom-20 left-20 w-48 h-48 rounded-full bg-gold/5 blur-2xl" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[600px] px-8 py-16 text-center">
        {/* Publisher Logo */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary-foreground/10 backdrop-blur-sm rounded-full border border-primary-foreground/20">
            <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center">
              <span className="text-sm font-bold text-primary">O</span>
            </div>
            <span className="text-lg font-display font-bold text-primary-foreground tracking-[0.3em]">
              ORUN
            </span>
          </div>
        </div>
        
        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-primary-foreground mb-4 leading-tight">
          {title}
        </h1>
        
        {/* Subtitle */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold" />
          <h2 className="text-2xl md:text-3xl font-serif text-gold">
            {subtitle}
          </h2>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold" />
        </div>
        
        {/* Edition Badge */}
        <div className="inline-block">
          <div className="px-8 py-3 bg-gold text-primary font-bold text-xl tracking-[0.5em] uppercase rounded-sm shadow-lg">
            {edition}
          </div>
        </div>
        
        {/* Features */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl">
          {[
            { icon: "📝", label: "서술형 대비" },
            { icon: "🎯", label: "핵심 문법" },
            { icon: "📚", label: "8개 Unit" },
            { icon: "✨", label: "배열 영작" },
          ].map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-2 px-4 py-3 bg-primary-foreground/5 backdrop-blur-sm rounded-lg border border-primary-foreground/10"
            >
              <span className="text-2xl">{feature.icon}</span>
              <span className="text-sm font-medium text-primary-foreground/80">
                {feature.label}
              </span>
            </div>
          ))}
        </div>
        
        {/* Bottom Decoration */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-2 text-sm text-primary-foreground/50">
            <span className="w-8 h-px bg-primary-foreground/30" />
            <span className="font-display italic">English Grammar Workbook</span>
            <span className="w-8 h-px bg-primary-foreground/30" />
          </div>
        </div>
      </div>
    </div>
  );
}
