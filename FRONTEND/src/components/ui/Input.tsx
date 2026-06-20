import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.memo(React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-text-secondary px-1">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-xl border bg-bg-elevated px-4 py-2 text-sm text-text placeholder:text-text-muted",
            "border-border focus-visible:border-border-focus focus-visible:ring-2 focus-visible:ring-primary/20",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-all duration-200",
            error && "border-error text-error focus-visible:border-error focus-visible:ring-error/20",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-xs font-medium text-error px-1 animate-slide-up">
            {error}
          </p>
        )}
      </div>
    )
  }
))
Input.displayName = "Input"

export { Input }
