import { cn } from "@/lib/utils";

interface UnitHeaderProps {
  unitNumber: number;
  title: string;
  subtitle?: string;
  className?: string;
}

const unitColors: Record<number, string> = {
  1: "from-unit-1 to-navy-dark",
  2: "from-unit-2 to-unit-2/80",
  3: "from-unit-3 to-unit-3/80",
  4: "from-unit-4 to-unit-4/80",
  5: "from-unit-5 to-unit-5/80",
  6: "from-unit-6 to-unit-6/80",
  7: "from-unit-7 to-unit-7/80",
  8: "from-unit-8 to-unit-8/80",
};

export function UnitHeader({ unitNumber, title, subtitle, className }: UnitHeaderProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            currentColor 10px,
            currentColor 11px
          )`
        }} />
      </div>
      
      <div className={cn(
        "relative px-8 py-6 bg-gradient-to-r rounded-lg",
        unitColors[unitNumber] || unitColors[1]
      )}>
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full text-primary-foreground">
            <circle cx="80" cy="20" r="40" />
          </svg>
        </div>
        
        <div className="relative z-10 flex items-center gap-6">
          {/* Unit Number Badge */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-primary-foreground/20 flex items-center justify-center backdrop-blur-sm border-2 border-primary-foreground/30">
                <div className="text-center">
                  <div className="text-xs font-bold text-primary-foreground/80 uppercase tracking-widest">Unit</div>
                  <div className="text-3xl font-display font-bold text-primary-foreground">
                    {String(unitNumber).padStart(2, '0')}
                  </div>
                </div>
              </div>
              {/* Gold accent ring */}
              <div className="absolute -inset-1 rounded-full border-2 border-gold/50 animate-pulse" />
            </div>
          </div>
          
          {/* Title Content */}
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary-foreground leading-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-sm text-primary-foreground/80 font-medium">
                {subtitle}
              </p>
            )}
          </div>
          
          {/* Decorative Logo */}
          <div className="hidden md:flex flex-shrink-0 items-center">
            <div className="px-4 py-2 bg-primary-foreground/10 backdrop-blur-sm rounded border border-primary-foreground/20">
              <span className="text-lg font-display font-bold text-primary-foreground tracking-wider">
                ORUN
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
