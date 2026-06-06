"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-foreground text-background hover:bg-foreground/90 rounded-full",
        liquid: "hyper-liquid",
        glass: "glass-spotlight",
        glitch: "tactile-glitch rounded-none",
        outline: "border border-border bg-transparent hover:bg-foreground/5 rounded-full",
        secondary: "bg-foreground/5 text-foreground border border-transparent hover:border-border/30 hover:bg-transparent rounded-full",
        ghost: "hover:bg-foreground/5 text-foreground rounded-full",
        link: "text-foreground underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-full px-3",
        lg: "h-14 rounded-full px-8 text-lg",
        icon: "h-10 w-10 rounded-full",
        liquid: "px-8 py-4 text-lg",
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
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    const buttonRef = React.useRef<HTMLButtonElement>(null)

    // Merge refs so we can use our internal ref while forwarding the external one
    const combinedRef = React.useCallback(
      (node: HTMLButtonElement) => {
        buttonRef.current = node
        if (typeof ref === "function") {
          ref(node)
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node
        }
      },
      [ref]
    )

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (variant !== "glass" || !buttonRef.current) return
      const rect = buttonRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      buttonRef.current.style.setProperty("--x", `${x}px`)
      buttonRef.current.style.setProperty("--y", `${y}px`)
    }

    return (
      <button
        ref={combinedRef}
        onMouseMove={handleMouseMove}
        className={cn(
          buttonVariants({ variant, size, className }),
          variant === "glass" && "group relative"
        )}
        {...props}
      >
        {variant === "glass" && (
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: `radial-gradient(circle 60px at var(--x, 50%) var(--y, 50%), var(--accent), transparent 100%)`,
              opacity: 0.15,
            }}
          />
        )}
        {variant === "glass" ? (
          <span className="relative z-10 flex items-center justify-center gap-2">
            {props.children}
          </span>
        ) : (
          props.children
        )}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
