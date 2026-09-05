import { cn } from "@/lib/utils";

interface Unit {
  number: number;
  title: string;
  problemCount: number;
}

interface TableOfContentsProps {
  units: Unit[];
  onUnitClick?: (unitNumber: number) => void;
  activeUnit?: number;
}

export function TableOfContents({ units, onUnitClick, activeUnit }: TableOfContentsProps) {
  return (
    <div className="bg-card rounded-xl shadow-card overflow-hidden border border-border">
      {/* Header */}
      <div className="px-6 py-5 bg-gradient-to-r from-primary to-navy-dark">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-serif font-bold text-primary-foreground">
            목차 · Contents
          </h3>
          <div className="px-3 py-1 bg-primary-foreground/10 rounded text-sm text-primary-foreground/80">
            8 Units
          </div>
        </div>
      </div>
      
      {/* Units List */}
      <div className="divide-y divide-border">
        {units.map((unit, index) => (
          <button
            key={unit.number}
            onClick={() => onUnitClick?.(unit.number)}
            className={cn(
              "w-full px-6 py-4 flex items-center gap-4 transition-all duration-200 hover:bg-secondary/50 text-left group",
              activeUnit === unit.number && "bg-secondary"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Unit Number */}
            <div className={cn(
              "flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-display font-bold text-lg transition-all duration-200",
              activeUnit === unit.number
                ? "bg-gold text-primary"
                : "bg-secondary text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground"
            )}>
              {String(unit.number).padStart(2, '0')}
            </div>
            
            {/* Unit Title */}
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Unit {unit.number}
              </div>
              <h4 className="font-serif font-medium text-foreground truncate">
                {unit.title}
              </h4>
            </div>
            
            {/* Problem Count */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {unit.problemCount}문제
              </span>
              <svg
                className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  activeUnit === unit.number ? "text-gold" : "text-muted-foreground group-hover:translate-x-1"
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
