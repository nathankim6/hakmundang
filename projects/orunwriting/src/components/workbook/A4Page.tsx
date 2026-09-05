import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface A4PageProps {
  children: ReactNode;
  pageNumber: number;
  totalPages: number;
  unitNumber?: number;
  unitTitle?: string;
  className?: string;
  noPadding?: boolean;
  noHeader?: boolean;
  noFooter?: boolean;
  section?: 'arrangement' | 'conditional' | 'reading';
}

export function A4Page({
  children,
  pageNumber,
  totalPages,
  unitNumber,
  unitTitle,
  className,
  noPadding,
  noHeader,
  noFooter,
  section = 'conditional'
}: A4PageProps) {
  const isArrangement = section === 'arrangement';
  const isReading = section === 'reading';
  
  // 서술형 유형연습: 블루 테마
  // 배열영작: 딥 와인/로즈골드 테마
  // 조건영작: 다크 네이비/골드 테마
  const themeColors = isReading ? {
    headerBg: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(37,99,235,0.12) 100%)',
    headerBorder: '#3b82f6',
    logoColor: '#1e40af',
    subtitleColor: '#3b82f6',
    badgeBg: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    badgeColor: '#dbeafe',
    footerLineFrom: 'rgba(59,130,246,0.4)',
    footerBorder: 'rgba(59,130,246,0.5)',
    footerColor: '#3b82f6',
  } : isArrangement ? {
    headerBg: 'linear-gradient(135deg, rgba(88,28,45,0.08) 0%, rgba(120,40,60,0.12) 100%)',
    headerBorder: '#c77d8e',
    logoColor: '#5c1c2e',
    subtitleColor: '#9e4a5e',
    badgeBg: 'linear-gradient(135deg, #5c1c2e 0%, #8b3a4e 100%)',
    badgeColor: '#f4c4d0',
    footerLineFrom: 'rgba(199,125,142,0.4)',
    footerBorder: 'rgba(199,125,142,0.5)',
    footerColor: '#9e4a5e',
  } : {
    headerBg: 'linear-gradient(135deg, rgba(15,20,25,0.04) 0%, rgba(26,32,40,0.06) 100%)',
    headerBorder: '#c9a227',
    logoColor: '#0f1419',
    subtitleColor: '#8b6914',
    badgeBg: 'linear-gradient(135deg, #0f1419 0%, #1a2028 100%)',
    badgeColor: '#c9a227',
    footerLineFrom: 'rgba(201,162,39,0.3)',
    footerBorder: 'rgba(201,162,39,0.4)',
    footerColor: '#8b6914',
  };

  return (
    <div className={cn("a4-page flex flex-col", noPadding && "!p-0", className)}>
      {/* Page Header - Theme-based Design */}
      {!noHeader && (
        <header 
          className="flex-shrink-0 flex items-center justify-between pb-1.5 mb-1 px-2 -mx-2 rounded"
          style={{ 
            background: themeColors.headerBg,
            borderBottom: `1.5px solid ${themeColors.headerBorder}`,
          }}
        >
          <div className="flex items-center gap-2">
            <span 
              className="font-bold tracking-tight"
              style={{ 
                fontSize: '11px',
                color: themeColors.logoColor,
              }}
            >
              옳은영어
            </span>
            <span 
              style={{ 
                fontSize: '10px',
                color: themeColors.subtitleColor,
                fontFamily: "'Cormorant Garamond', serif",
                letterSpacing: '0.1em',
              }}
            >
              ORUN WRITING
            </span>
          </div>
          {unitNumber && (
            <div className="flex items-center gap-1.5">
              <span 
                className="px-2 py-0.5 font-bold rounded"
                style={{ 
                  fontSize: '9px',
                  background: themeColors.badgeBg,
                  color: themeColors.badgeColor,
                }}
              >
                UNIT {String(unitNumber).padStart(2, '0')}
              </span>
              {unitTitle && (
                <span 
                  className="font-medium"
                  style={{ 
                    fontSize: '9px',
                    color: '#666666',
                  }}
                >
                  {unitTitle}
                </span>
              )}
            </div>
          )}
        </header>
      )}

      {/* Page Content - flex-1 fills all space between header and footer */}
      <main className="flex-1 flex flex-col overflow-hidden min-h-0">
        {children}
      </main>

      {/* Page Footer - Theme-based Design */}
      {!noFooter && (
        <footer className="flex-shrink-0 flex items-center justify-center gap-3 pt-1 mt-1">
          <div 
            className="flex-1"
            style={{ 
              height: '1px',
              background: `linear-gradient(90deg, transparent, ${themeColors.footerLineFrom})`,
            }}
          />
          <div 
            className="flex items-center justify-center"
            style={{ 
              width: '28px',
              height: '28px',
              border: `1px solid ${themeColors.footerBorder}`,
              borderRadius: '50%',
              fontSize: '10px',
              fontWeight: '600',
              color: themeColors.footerColor,
              fontFamily: "'Cormorant Garamond', serif",
            }}
          >
            {pageNumber}
          </div>
          <div 
            className="flex-1"
            style={{ 
              height: '1px',
              background: `linear-gradient(90deg, ${themeColors.footerLineFrom}, transparent)`,
            }}
          />
        </footer>
      )}
    </div>
  );
}
