
import React, { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  onClick?: () => void;
  hoverScale?: boolean;
  pressable?: boolean;
}

const AnimatedCard = ({ 
  children, 
  className, 
  delay = 0,
  onClick,
  hoverScale = true,
  pressable = false
}: AnimatedCardProps) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <motion.div
      className={cn(
        'toss-card',
        pressable && 'active:scale-[0.98] cursor-pointer',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring", 
        damping: 20, 
        stiffness: 300,
        delay: delay * 0.1
      }}
      onClick={onClick}
      whileHover={hoverScale ? { scale: 1.02, y: -4 } : {}}
      whileTap={pressable ? { scale: 0.98 } : {}}
      onTapStart={() => setIsPressed(true)}
      onTapCancel={() => setIsPressed(false)}
      onTap={() => {
        setIsPressed(true);
        setTimeout(() => setIsPressed(false), 200);
      }}
    >
      {children}
      <AnimatePresence>
        {isPressed && pressable && (
          <motion.div
            className="absolute inset-0 bg-toss-blue/10 rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AnimatedCard;
