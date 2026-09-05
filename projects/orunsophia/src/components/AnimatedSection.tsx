
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  animation?: 'fade' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight';
}

const animations = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 }
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { type: "spring", damping: 25, stiffness: 300 }
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    transition: { type: "spring", damping: 25, stiffness: 300 }
  },
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    transition: { type: "spring", damping: 25, stiffness: 300 }
  },
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { type: "spring", damping: 25, stiffness: 300 }
  }
};

const AnimatedSection = ({ 
  children, 
  className, 
  delay = 0, 
  animation = 'slideUp' 
}: AnimatedSectionProps) => {
  const animationProps = animations[animation];
  
  return (
    <motion.section
      className={cn('', className)}
      initial={animationProps.initial}
      animate={animationProps.animate}
      transition={{
        ...animationProps.transition,
        delay: delay * 0.15
      }}
    >
      {children}
    </motion.section>
  );
};

export default AnimatedSection;
