import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = React.memo(React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-text-secondary px-1">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            className={cn(
              "flex h-11 w-full rounded-xl border bg-bg-elevated px-4 py-2 text-sm text-text appearance-none cursor-pointer",
              "border-border focus-visible:border-border-focus focus-visible:ring-2 focus-visible:ring-primary/20",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "transition-all duration-200",
              error && "border-error text-error focus-visible:border-error focus-visible:ring-error/20",
              className
            )}
            ref={ref}
            {...props}
          >
            {placeholder && <option value="" className="text-text-muted">{placeholder}</option>}
            {Array.isArray(options) && options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        </div>
        {error && (
          <p className="text-xs font-medium text-error px-1 animate-slide-up">
            {error}
          </p>
        )}
      </div>
    )
  }
))
Select.displayName = "Select"

export { Select }
