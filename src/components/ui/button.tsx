import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default: "btn-glow shadow-sm",
        destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm hover:shadow-md",
        outline: "border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-stone-900 dark:text-stone-100 hover:bg-stone-50 dark:hover:bg-zinc-800 focus-visible:ring-stone-400 shadow-sm",
        secondary: "bg-stone-100 dark:bg-zinc-800 text-stone-900 dark:text-stone-100 hover:bg-stone-200 dark:hover:bg-zinc-700 focus-visible:ring-stone-400",
        ghost: "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-white focus-visible:ring-stone-400",
        link: "text-[#FF8A00] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 rounded-xl",
        sm: "h-9 rounded-xl px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
