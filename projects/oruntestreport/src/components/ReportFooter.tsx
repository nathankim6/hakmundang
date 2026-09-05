import React from 'react';

interface ReportFooterProps {
  themeColors: any;
}

const ReportFooter: React.FC<ReportFooterProps> = () => {
  return (
    <footer className="mt-20 pt-10 relative z-10">
      {/* 더블 골드 라인 */}
      <div className="space-y-1.5 mb-6">
        <div className="h-px w-full bg-[hsl(var(--gold))]" />
        <div className="h-[2px] w-full bg-[hsl(var(--ink)/0.85)]" />
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            {/* 외곽 골드 링 */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  'conic-gradient(from 220deg, hsl(38 70% 38%), hsl(41 65% 52%), hsl(41 55% 70%), hsl(38 70% 38%))',
                padding: '1.5px',
              }}
            >
              <div className="w-full h-full rounded-full bg-[hsl(var(--paper))]" />
            </div>
            <div className="relative w-12 h-12 rounded-full bg-[hsl(var(--paper))] border border-[hsl(var(--gold)/0.4)] flex items-center justify-center overflow-hidden m-[1.5px] shadow-[0_4px_12px_-4px_hsl(var(--ink)/0.25)]">
              <img
                src="/lovable-uploads/e5fb85df-a5db-42ec-86c2-dbf7a0e67ff7.png"
                alt="ORUN ENGLISH"
                className="w-9 h-9 object-contain"
              />
            </div>
          </div>
          <div>
            <p className="text-[hsl(var(--ink))] text-xl font-bold tracking-[0.08em] leading-tight" style={{ fontFamily: "'Orbitron', sans-serif" }}>ORUN ENGLISH</p>
          </div>
        </div>
        <div className="flex flex-col items-start md:items-end gap-1">
          
          <p className="text-[11px] text-[hsl(var(--ink-soft))] tracking-wider">© {new Date().getFullYear()} ORUN ENGLISH. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default ReportFooter;
