import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  let variantStyles = ""
  switch (variant) {
    case "default": 
      variantStyles = "border border-blue-100 bg-blue-50 text-blue-700 shadow-sm"; 
      break;
    case "secondary": 
      variantStyles = "border border-zinc-200 bg-zinc-100 text-zinc-600"; 
      break;
    case "destructive": 
      variantStyles = "border border-red-100 bg-red-50 text-red-600 shadow-sm"; 
      break;
    case "outline": 
      variantStyles = "border border-zinc-200 bg-transparent text-zinc-500"; 
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
