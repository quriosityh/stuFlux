import * as React from "react"
import { cn } from "../../lib/utils"

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6
  glitch?: boolean
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = 2, glitch = false, ...props }, ref) => {
    const Tag = `h${level}` as React.ElementType
    
    // Base styles for headings
    const baseStyles = "font-display font-bold text-foreground"
    
    // Size variants based on level
    const sizeStyles = {
      1: "text-5xl md:text-7xl leading-tight",
      2: "text-4xl md:text-5xl leading-tight",
      3: "text-2xl md:text-3xl",
      4: "text-xl md:text-2xl",
      5: "text-lg md:text-xl",
      6: "text-base md:text-lg",
    }[level]

    return (
      <Tag
        ref={ref}
        className={cn(
          baseStyles,
          sizeStyles,
          glitch && "glitch-text",
          className
        )}
        {...props}
      />
    )
  }
)
Heading.displayName = "Heading"

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: "default" | "muted" | "lead"
}

const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variantStyles = {
      default: "text-foreground",
      muted: "text-foreground/70",
      lead: "text-xl text-foreground/70",
    }[variant]

    return (
      <p
        ref={ref}
        className={cn("text-base leading-relaxed", variantStyles, className)}
        {...props}
      />
    )
  }
)
Text.displayName = "Text"

export { Heading, Text }
