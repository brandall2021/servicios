import { type HTMLAttributes } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors duration-200",
  {
    variants: {
      variant: {
        default: "border-transparent bg-orange-600 text-white shadow-sm shadow-orange-600/20",
        secondary: "border-transparent bg-stone-100 dark:bg-zinc-800 text-stone-800 dark:text-stone-200",
        destructive: "border-transparent bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
        success: "border-transparent bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
        warning: "border-transparent bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
        outline: "text-stone-600 dark:text-stone-400 border-stone-200 dark:border-zinc-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
