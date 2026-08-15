import { forwardRef, type InputHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
            {label}
          </label>
        )}
        <input
          type={type}
          id={id}
          suppressHydrationWarning
          className={cn(
            "flex h-10 w-full rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm transition-all duration-200",
            "placeholder:text-stone-400 dark:placeholder:text-zinc-500",
            "focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus:ring-red-500/30 focus:border-red-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
