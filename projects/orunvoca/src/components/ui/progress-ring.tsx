import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressRingProps extends React.HTMLAttributes<HTMLDivElement> {
  progress: number; // 0-100
  size?: "sm" | "md" | "lg";
  strokeWidth?: number;
  showText?: boolean;
}

const ProgressRing = React.forwardRef<HTMLDivElement, ProgressRingProps>(
  ({ className, progress, size = "md", strokeWidth, showText = true, ...props }, ref) => {
    const sizeClasses = {
      sm: "w-12 h-12",
      md: "w-16 h-16", 
      lg: "w-24 h-24"
    };

    const textSizes = {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base"
    };

    const radius = size === "sm" ? 16 : size === "md" ? 24 : 36;
    const stroke = strokeWidth || (size === "sm" ? 2 : size === "md" ? 3 : 4);
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div
        ref={ref}
        className={cn("relative inline-flex items-center justify-center", sizeClasses[size], className)}
        {...props}
      >
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            stroke="hsl(var(--muted))"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress circle */}
          <circle
            stroke="hsl(var(--study-progress))"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={strokeDasharray}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-300 ease-in-out"
          />
        </svg>
        {showText && (
          <span className={cn(
            "absolute font-medium text-study-progress",
            textSizes[size]
          )}>
            {Math.round(progress)}
          </span>
        )}
      </div>
    );
  }
);

ProgressRing.displayName = "ProgressRing";

export { ProgressRing };