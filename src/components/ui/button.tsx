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
    const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]";
    
    let variantStyles = "";
    switch (variant) {
      case "default": 
        variantStyles = "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-[0_4px_15px_-3px_rgba(37,99,235,0.4)] hover:shadow-[0_8px_25px_-5px_rgba(37,99,235,0.5)] hover:-translate-y-0.5 border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"; 
        break;
      case "glass":
        variantStyles = "bg-white/[0.03] backdrop-blur-md border border-white/10 text-white hover:bg-white/[0.08] hover:border-white/20 hover:-translate-y-0.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]";
        break;
      case "neon":
        variantStyles = "bg-blue-500/10 border border-blue-500/30 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:bg-blue-500/20 hover:shadow-[0_0_30px_rgba(59,130,246,0.25)] hover:border-blue-500/50";
        break;
      case "destructive": 
        variantStyles = "bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20"; 
        break;
      case "outline": 
        variantStyles = "border border-white/10 bg-transparent text-zinc-400 hover:bg-white/5 hover:text-white"; 
        break;
      case "secondary": 
        variantStyles = "bg-zinc-800 text-white hover:bg-zinc-700"; 
        break;
      case "ghost": 
        variantStyles = "text-zinc-400 hover:bg-white/5 hover:text-white"; 
        break;
      case "link": 
        variantStyles = "text-blue-400 underline-offset-4 hover:underline"; 
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
