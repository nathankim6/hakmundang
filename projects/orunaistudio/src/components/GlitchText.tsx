import { motion } from 'framer-motion';

interface GlitchTextProps {
  text: string;
  className?: string;
}

export default function GlitchText({ text, className = '' }: GlitchTextProps) {
  return (
    <motion.span 
      className={`relative inline-block ${className}`}
      whileHover="hover"
    >
      {/* Main text */}
      <span className="relative z-10">{text}</span>
      
      {/* Glitch layers - visible on hover */}
      <motion.span
        className="absolute inset-0 text-cyan-400/80"
        style={{ clipPath: 'inset(0 0 50% 0)' }}
        variants={{
          hover: {
            x: [-2, 2, -2],
            transition: { duration: 0.2, repeat: Infinity }
          }
        }}
      >
        {text}
      </motion.span>
      <motion.span
        className="absolute inset-0 text-pink-500/80"
        style={{ clipPath: 'inset(50% 0 0 0)' }}
        variants={{
          hover: {
            x: [2, -2, 2],
            transition: { duration: 0.2, repeat: Infinity }
          }
        }}
      >
        {text}
      </motion.span>
    </motion.span>
  );
}
