import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    // Clean, crisp, high-contrast base styles without soft pills
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";
    
    let variantStyles = "";
    switch (variant) {
      case "default": variantStyles = "bg-primary text-primary-foreground shadow-sm hover:brightness-110"; break;
      case "destructive": variantStyles = "bg-destructive text-destructive-foreground shadow-sm hover:brightness-110"; break;
      case "outline": variantStyles = "border border-border bg-transparent hover:bg-muted hover:text-foreground"; break;
      case "secondary": variantStyles = "bg-muted/80 backdrop-blur-sm text-foreground hover:bg-muted"; break;
      case "ghost": variantStyles = "hover:bg-muted/50 hover:text-foreground"; break;
      case "link": variantStyles = "text-primary underline-offset-4 hover:underline"; break;
    }

    let sizeStyles = "";
    switch (size) {
      case "default": sizeStyles = "h-10 px-5 py-2.5"; break;
      case "sm": sizeStyles = "h-9 rounded-md px-4"; break;
      case "lg": sizeStyles = "h-[46px] rounded-xl px-8 text-base"; break;
      case "icon": sizeStyles = "h-10 w-10 shrink-0"; break;
    }

    return (
      <button
        className={cn(baseStyles, variantStyles, sizeStyles, className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
