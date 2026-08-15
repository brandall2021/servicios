import { type HTMLAttributes } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null
  alt?: string
  fallback?: string
  size?: "sm" | "md" | "lg" | "xl"
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-2xl",
}

export function Avatar({ src, alt, fallback, size = "md", className, ...props }: AvatarProps) {
  if (src) {
    return (
      <div
        className={cn("relative overflow-hidden rounded-full", sizeClasses[size], className)}
        {...props}
      >
        <Image
          src={src}
          alt={alt || "Avatar"}
          fill
          sizes="96px"
          className="object-cover"
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-orange-100 font-medium text-orange-700",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {fallback ? fallback.charAt(0).toUpperCase() : "?"}
    </div>
  )
}
