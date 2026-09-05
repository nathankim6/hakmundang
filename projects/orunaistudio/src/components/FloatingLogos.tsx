import { motion } from 'framer-motion';
import openaiLogo from '@/assets/logos/openai-logo.svg';
import geminiLogo from '@/assets/logos/gemini-logo.svg';
import claudeLogo from '@/assets/logos/claude-logo.png';
import perplexityLogo from '@/assets/logos/perplexity-logo.png';

const logos = [
  { src: openaiLogo, name: 'OpenAI' },
  { src: geminiLogo, name: 'Gemini' },
  { src: claudeLogo, name: 'Claude' },
  { src: perplexityLogo, name: 'Perplexity' },
  { src: openaiLogo, name: 'OpenAI' },
  { src: geminiLogo, name: 'Gemini' },
  { src: claudeLogo, name: 'Claude' },
  { src: perplexityLogo, name: 'Perplexity' },
  { src: openaiLogo, name: 'OpenAI' },
  { src: geminiLogo, name: 'Gemini' },
  { src: claudeLogo, name: 'Claude' },
  { src: perplexityLogo, name: 'Perplexity' },
  { src: openaiLogo, name: 'OpenAI' },
  { src: geminiLogo, name: 'Gemini' },
  { src: claudeLogo, name: 'Claude' },
  { src: perplexityLogo, name: 'Perplexity' },
];

const FloatingLogos = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {logos.map((logo, index) => {
        const randomX = Math.random() * 90 + 5;
        const randomY = Math.random() * 90 + 5;
        const randomRotation = Math.random() * 30 - 15;
        const randomScale = 0.4 + Math.random() * 0.6;
        const duration = 18 + Math.random() * 15;
        const delay = Math.random() * 8;
        const size = 40 + Math.random() * 30;

        return (
          <motion.img
            key={`${logo.name}-${index}`}
            src={logo.src}
            alt={logo.name}
            className="absolute select-none"
            style={{
              left: `${randomX}%`,
              top: `${randomY}%`,
              width: `${size}px`,
              height: `${size}px`,
              opacity: 0.08 + Math.random() * 0.08,
              transform: `rotate(${randomRotation}deg) scale(${randomScale})`,
              filter: 'grayscale(30%)',
            }}
            animate={{
              x: [0, 40, -30, 50, -40, 0],
              y: [0, -50, 30, -40, 50, 0],
              rotate: [randomRotation, randomRotation + 15, randomRotation - 15, randomRotation + 10, randomRotation],
              scale: [randomScale, randomScale * 1.15, randomScale * 0.85, randomScale * 1.1, randomScale],
            }}
            transition={{
              duration: duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: delay,
            }}
          />
        );
      })}
    </div>
  );
};

export default FloatingLogos;
