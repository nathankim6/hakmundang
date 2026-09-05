import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold tracking-tight ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_1px_2px_hsl(var(--primary)/0.2),0_4px_12px_-2px_hsl(var(--primary)/0.25)] hover:shadow-[0_2px_4px_hsl(var(--primary)/0.25),0_8px_20px_-4px_hsl(var(--primary)/0.35)] hover:brightness-110",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md",
        outline:
          "border border-border bg-card/50 backdrop-blur-sm text-foreground hover:bg-accent/10 hover:border-accent/40 hover:text-accent shadow-sm",
        secondary:
          "bg-secondary text-secondary-foreground border border-border/60 hover:bg-secondary/80 shadow-sm",
        ghost: "hover:bg-muted hover:text-foreground",
        link: "text-accent underline-offset-4 hover:underline",
        premium:
          "text-white border border-white/10 shadow-[0_4px_16px_-4px_hsl(var(--accent)/0.5)] hover:shadow-[0_8px_24px_-4px_hsl(var(--accent)/0.6)] hover:brightness-110 [background:var(--gradient-accent)]",
        hero:
          "text-white border border-white/10 shadow-[0_8px_24px_-6px_hsl(var(--primary)/0.5)] hover:shadow-[0_12px_32px_-6px_hsl(var(--primary)/0.6)] hover:brightness-110 [background:var(--gradient-toss)]",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-7 text-sm",
        icon: "h-10 w-10",
        xl: "h-12 rounded-lg px-9 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
