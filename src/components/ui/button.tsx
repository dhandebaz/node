import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "glass" | "neon"
  size?: "default" | "sm" | "lg" | "icon" | "xl"
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    // Base styles: centered, interactive, smooth transitions
    const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]";
    
    let variantStyles = "";
    switch (variant) {
      case "default": 
        variantStyles = "bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:-translate-y-0.5 border border-blue-500/20"; 
        break;
      case "glass":
        variantStyles = "bg-zinc-100/50 backdrop-blur-md border border-zinc-200 text-zinc-900 hover:bg-zinc-100 hover:-translate-y-0.5 shadow-sm";
        break;
      case "neon":
        variantStyles = "bg-blue-50/50 border border-blue-200 text-blue-700 shadow-sm hover:bg-blue-100 hover:border-blue-300";
        break;
      case "destructive": 
        variantStyles = "bg-red-50 border border-red-200 text-red-600 hover:bg-red-100"; 
        break;
      case "outline": 
        variantStyles = "border border-zinc-200 bg-transparent text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"; 
        break;
      case "secondary": 
        variantStyles = "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"; 
        break;
      case "ghost": 
        variantStyles = "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"; 
        break;
      case "link": 
        variantStyles = "text-blue-600 underline-offset-4 hover:underline"; 
        break;
    }

    let sizeStyles = "";
    switch (size) {
      case "default": sizeStyles = "h-11 px-6"; break;
      case "sm": sizeStyles = "h-9 px-4 text-xs"; break;
      case "lg": sizeStyles = "h-14 px-10 text-base tracking-tight"; break;
      case "xl": sizeStyles = "h-16 px-12 text-lg font-black tracking-tight"; break;
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
