import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-bold ring-offset-background transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden tracking-tight",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-br from-primary via-primary to-primary-hover text-primary-foreground shadow-card hover:shadow-premium transform hover:scale-[1.03] hover:-translate-y-1 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700",
        destructive:
          "bg-gradient-to-br from-destructive to-destructive/90 text-destructive-foreground shadow-card hover:shadow-premium hover:scale-[1.03] hover:-translate-y-1",
        outline:
          "border-2 border-border/40 bg-background/60 backdrop-blur-md hover:bg-accent hover:text-accent-foreground hover:border-primary/40 hover:shadow-card hover:scale-[1.02]",
        secondary:
          "bg-gradient-to-br from-accent to-accent/80 text-accent-foreground shadow-elegant hover:shadow-card transform hover:scale-[1.02]",
        ghost: "hover:bg-accent/90 hover:text-accent-foreground hover:shadow-elegant hover:scale-[1.02]",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-hover",
        elementary: "bg-gradient-to-br from-education-elementary to-education-elementary/90 text-white shadow-card hover:shadow-premium transform hover:scale-[1.03] hover:-translate-y-1",
        middle: "bg-gradient-to-br from-education-middle to-education-middle/90 text-white shadow-card hover:shadow-premium transform hover:scale-[1.03] hover:-translate-y-1",
        high: "bg-gradient-to-br from-education-high to-education-high/90 text-white shadow-card hover:shadow-premium transform hover:scale-[1.03] hover:-translate-y-1",
        success: "bg-gradient-to-br from-success to-success/90 text-success-foreground shadow-card hover:shadow-premium transform hover:scale-[1.03] hover:-translate-y-1",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 rounded-xl px-5 text-xs",
        lg: "h-14 rounded-2xl px-10 text-base",
        xl: "h-16 rounded-2xl px-12 text-lg",
        icon: "h-11 w-11",
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
