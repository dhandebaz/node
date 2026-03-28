import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  let variantStyles = ""
  switch (variant) {
    case "default": 
      variantStyles = "border border-white/10 bg-white/5 text-white backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.05)]"; 
      break;
    case "secondary": 
      variantStyles = "border border-white/5 bg-white/5 text-zinc-400 backdrop-blur-sm"; 
      break;
    case "destructive": 
      variantStyles = "border border-red-500/20 bg-red-500/5 text-red-400 backdrop-blur-md"; 
      break;
    case "outline": 
      variantStyles = "border border-white/10 bg-transparent text-zinc-400"; 
      break;
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20",
        variantStyles,
        className
      )}
      {...props}
    />
  )
}

export { Badge }
