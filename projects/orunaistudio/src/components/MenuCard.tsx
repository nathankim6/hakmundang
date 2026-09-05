import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface MenuCardProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  iconImage?: string;
  gradient: string;
  glowColor: string;
  accentColor: string;
  delay?: number;
  onClick?: () => void;
  href?: string;
}

export default function MenuCard({
  title,
  description,
  icon: Icon,
  iconImage,
  accentColor,
  glowColor,
  onClick,
  href,
}: MenuCardProps) {
  const handleClick = () => {
    if (href) {
      window.open(href, '_blank', 'noopener,noreferrer');
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <motion.div
      onClick={handleClick}
      className="group relative cursor-pointer h-full"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
    >
      <div
        className="relative h-full rounded-3xl bg-white p-10 flex flex-col items-center text-center transition-all duration-300"
        style={{
          border: '1px solid rgba(0,0,0,0.05)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px -8px rgba(0,0,0,0.06)',
        }}
      >
        {/* Icon tile */}
        <div
          className="mb-7 flex items-center justify-center w-24 h-24 rounded-2xl transition-transform duration-300 group-hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${glowColor}, ${accentColor}15)`,
          }}
        >
          {iconImage ? (
            <img src={iconImage} alt={title} className="w-14 h-14 object-contain" />
          ) : Icon ? (
            <Icon className="w-12 h-12" style={{ color: accentColor }} strokeWidth={1.5} />
          ) : null}
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-3">
          {title}
        </h2>

        {/* Description */}
        {description && (
          <p className="text-sm leading-relaxed text-gray-500 mb-8 max-w-xs">
            {description}
          </p>
        )}

        {/* CTA */}
        <div className="mt-auto pt-4 flex items-center gap-1.5 text-sm font-semibold text-blue-600 group-hover:gap-2.5 transition-all duration-300">
          <span>바로가기</span>
          <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
        </div>
      </div>
    </motion.div>
  );
}
