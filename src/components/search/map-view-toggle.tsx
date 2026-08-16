"use client"

import { Suspense } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { LayoutGrid, Map as MapIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type MapViewMode = "grid" | "map"

function MapViewToggleInner({ mode }: { mode: MapViewMode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function setMode(next: MapViewMode) {
    const params = new URLSearchParams(searchParams.toString())
    if (next === "map") params.set("vista", "mapa")
    else params.delete("vista")
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const options: { value: MapViewMode; label: string; icon: typeof LayoutGrid }[] = [
    { value: "grid", label: "Grilla", icon: LayoutGrid },
    { value: "map", label: "Mapa", icon: MapIcon },
  ]

  return (
    <div className="inline-flex items-center gap-0.5 rounded-full border border-stone-200/70 bg-stone-50 p-1 dark:border-zinc-700/50 dark:bg-zinc-800/80">
      {options.map((opt) => {
        const Icon = opt.icon
        const isActive = mode === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setMode(opt.value)}
            aria-pressed={isActive}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-all duration-200",
              isActive
                ? "bg-white text-stone-900 shadow-sm dark:bg-zinc-950 dark:text-stone-100"
                : "text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export function MapViewToggle({ mode }: { mode: MapViewMode }) {
  return (
    <Suspense fallback={null}>
      <MapViewToggleInner mode={mode} />
    </Suspense>
  )
}
