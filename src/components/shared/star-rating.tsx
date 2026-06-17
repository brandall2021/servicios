"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  size?: "sm" | "md" | "lg"
  showValue?: boolean
  count?: number
  readonly?: boolean
}

const sizeMap = { sm: "text-sm", md: "text-lg", lg: "text-2xl" }

export function StarRating({
  value,
  onChange,
  size = "md",
  showValue,
  count,
  readonly = false,
}: StarRatingProps) {
  const [hover, setHover] = useState(0)

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            className={cn(
              "transition-colors",
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110",
              sizeMap[size]
            )}
            onMouseEnter={() => !readonly && setHover(star)}
            onMouseLeave={() => !readonly && setHover(0)}
            onClick={() => onChange?.(star)}
          >
            <span
              className={
                star <= (hover || value) ? "text-[#FF8A00]" : "text-zinc-300"
              }
            >
              &#9733;
            </span>
          </button>
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-zinc-700 ml-1">
          {value.toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className="text-sm text-zinc-500">
          ({count} {count === 1 ? "opinión" : "opiniones"})
        </span>
      )}
    </div>
  )
}
