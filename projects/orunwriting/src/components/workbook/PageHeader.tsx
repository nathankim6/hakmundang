interface PageHeaderProps {
  currentPage: number;
  totalPages: number;
  unitNumber?: number;
  unitTitle?: string;
}

export function PageHeader({ currentPage, totalPages, unitNumber, unitTitle }: PageHeaderProps) {
  return (
    <header className="flex items-center justify-between py-4 px-6 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      {/* Left - Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-navy-dark flex items-center justify-center">
          <span className="text-xs font-bold text-primary-foreground">O</span>
        </div>
        <span className="font-display font-bold text-primary tracking-wider">
          ORUN DRILL
        </span>
      </div>
      
      {/* Center - Current Unit */}
      {unitNumber && (
        <div className="hidden md:flex items-center gap-2 text-sm">
          <span className="px-2 py-0.5 bg-primary/10 text-primary rounded font-bold">
            Unit {String(unitNumber).padStart(2, '0')}
          </span>
          {unitTitle && (
            <span className="text-muted-foreground font-serif">
              {unitTitle}
            </span>
          )}
        </div>
      )}
      
      {/* Right - Page Number */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Page
        </span>
        <div className="page-number">
          {currentPage}
        </div>
        <span className="text-sm text-muted-foreground">
          / {totalPages}
        </span>
      </div>
    </header>
  );
}
