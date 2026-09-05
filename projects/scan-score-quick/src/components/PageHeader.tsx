import React from 'react';
import { motion } from 'framer-motion';
import BackButton from './BackButton';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  logoSrc?: string;
  logoAlt?: string;
  backPath?: string;
  children?: React.ReactNode;
  showBackButton?: boolean;
}

const PageHeader = ({
  title,
  subtitle,
  logoSrc = "/lovable-uploads/5b56e2a6-a232-40de-90c5-6d82faab51f6.png",
  logoAlt = "Brainiac English Logo",
  backPath = "/",
  children,
  showBackButton = true
}: PageHeaderProps) => {
  return (
    <div className="sticky top-0 z-40 bg-[#fbfbfd]/95 border-b border-slate-900/[0.08]">
      <div className="relative max-w-7xl mx-auto py-4 px-6">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div className="flex items-center gap-4">
            {showBackButton && <BackButton fallbackPath={backPath} />}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-[10px] overflow-hidden bg-white border border-slate-900/[0.08]">
                <img
                  src={logoSrc}
                  alt={logoAlt}
                  className="w-7 h-7 object-contain"
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-[22px] md:text-[26px] leading-tight font-semibold text-slate-900 tracking-[-0.02em]">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-[13px] text-slate-500 font-normal tracking-tight">{subtitle}</p>
                )}
              </div>
            </div>
          </div>

          {children && (
            <div className="flex items-center gap-2 flex-wrap">
              {children}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default React.memo(PageHeader);
