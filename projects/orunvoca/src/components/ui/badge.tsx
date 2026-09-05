import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-sm hover:shadow-md hover:scale-105",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-br from-primary to-primary-dark text-primary-foreground hover:shadow-primary/30",
        secondary:
          "border-transparent bg-gradient-to-br from-secondary to-secondary-dark text-secondary-foreground hover:shadow-secondary/30",
        destructive:
          "border-transparent bg-gradient-to-br from-destructive to-destructive/90 text-destructive-foreground hover:shadow-destructive/30",
        outline: "border-2 border-border bg-background/80 text-foreground backdrop-blur-sm hover:border-accent hover:bg-accent/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
