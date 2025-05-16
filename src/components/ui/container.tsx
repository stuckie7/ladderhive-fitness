// src/components/ui/container.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  noPadding?: boolean;  // Add this prop to control padding
}

export function Container({ className, children, noPadding = false, ...props }: ContainerProps) {
  return (
    <div 
      className={cn(
        "container mx-auto",
        noPadding ? "px-0 md:px-4" : "px-4", // Conditional padding
        className
      )} 
      {...props}
    >
      {children}
    </div>
  )
}
