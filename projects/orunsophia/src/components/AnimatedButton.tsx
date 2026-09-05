
import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  withArrow?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  // Add other HTML button props you need here
  [key: string]: any; // For any other props we might need
}

const AnimatedButton = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  fullWidth = false,
  withArrow = false,
  loading = false,
  icon,
  disabled,
  ...props
}: AnimatedButtonProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-toss-blue text-white hover:bg-toss-lightBlue shadow-sm';
      case 'secondary':
        return 'bg-toss-secondary text-toss-gray hover:bg-toss-focus';
      case 'outline':
        return 'bg-transparent border border-toss-border text-toss-gray hover:bg-toss-secondary';
      case 'ghost':
        return 'bg-transparent text-toss-gray hover:bg-toss-secondary';
      default:
        return 'bg-toss-blue text-white hover:bg-toss-lightBlue shadow-sm';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm py-2 px-3';
      case 'md':
        return 'text-base py-3 px-4';
      case 'lg':
        return 'text-lg py-4 px-6';
      default:
        return 'text-base py-3 px-4';
    }
  };

  // Motion animation props
  const motionProps: Partial<HTMLMotionProps<"button">> = {
    whileHover: !disabled && !loading ? { scale: 1.02 } : undefined,
    whileTap: !disabled && !loading ? { scale: 0.98 } : undefined,
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 }
  };

  return (
    <motion.button
      className={cn(
        'relative rounded-xl font-medium transition-colors',
        getVariantClasses(),
        getSizeClasses(),
        fullWidth ? 'w-full' : '',
        'flex items-center justify-center gap-2',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      {...motionProps}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>로딩중...</span>
        </div>
      ) : (
        <>
          {icon && <span className="text-current">{icon}</span>}
          <span>{children}</span>
          {withArrow && (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="ml-1 transition-transform group-hover:translate-x-1"
            >
              <path
                d="M7.53033 3.46967C7.23744 3.17678 6.76256 3.17678 6.46967 3.46967C6.17678 3.76256 6.17678 4.23744 6.46967 4.53033L7.53033 3.46967ZM11 8L11.5303 8.53033C11.8232 8.23744 11.8232 7.76256 11.5303 7.46967L11 8ZM6.46967 11.4697C6.17678 11.7626 6.17678 12.2374 6.46967 12.5303C6.76256 12.8232 7.23744 12.8232 7.53033 12.5303L6.46967 11.4697ZM6.46967 4.53033L10.4697 8.53033L11.5303 7.46967L7.53033 3.46967L6.46967 4.53033ZM10.4697 7.46967L6.46967 11.4697L7.53033 12.5303L11.5303 8.53033L10.4697 7.46967Z"
                fill="currentColor"
              />
            </svg>
          )}
        </>
      )}
    </motion.button>
  );
};

export default AnimatedButton;
