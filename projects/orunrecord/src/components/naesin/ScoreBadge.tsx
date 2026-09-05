import { cn } from "@/lib/utils";
import { scoreTier, tierStyles } from "@/lib/naesin";

interface ScoreBadgeProps {
  value?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ScoreBadge({ value, size = "md", className }: ScoreBadgeProps) {
  const tier = scoreTier(value);
  const s = tierStyles[tier];
  const display = !value || value === "-" ? "—" : value;
  const sizes = {
    sm: "text-xs px-2 py-0.5 min-w-[2.25rem]",
    md: "text-sm px-2.5 py-1 min-w-[2.75rem]",
    lg: "text-base px-3 py-1.5 min-w-[3.25rem]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-bold font-numeric ring-1",
        s.text,
        s.bg,
        s.ring,
        sizes[size],
        className,
      )}
    >
      {display}
    </span>
  );
}
