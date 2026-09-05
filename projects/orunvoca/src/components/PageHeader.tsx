import React from "react";

interface PageHeaderProps {
  icon?: string;
  iconAlt?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  icon,
  iconAlt,
  title,
  subtitle,
  children,
}) => {
  return (
    <div className="mb-4 overflow-hidden rounded-[10px] bg-[#201a14] shadow-[0_10px_30px_-18px_rgba(26,20,14,0.9)]">
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 sm:px-6 py-3.5 sm:py-4">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c9a227]/60 to-transparent" />
        <div className="flex items-center gap-3 min-w-0">
          {icon && (
            <div className="relative w-9 h-9 rounded-[8px] flex-shrink-0 flex items-center justify-center bg-white/10 ring-1 ring-white/15">
              <img
                src={icon}
                alt={iconAlt || title}
                className="relative w-5 h-5 object-contain"
              />
            </div>
          )}
          <div className="min-w-0">
            {subtitle && subtitle.trim() && (
              <p
                className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#bfae94] truncate"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                {subtitle}
              </p>
            )}
            <h1 className="mt-0.5 text-white text-[13px] sm:text-[15px] leading-tight font-bold tracking-[-0.02em] truncate">
              {title}
            </h1>
          </div>
        </div>
        {children && (
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};



export default PageHeader;
