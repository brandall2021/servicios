"use client"

import { useEffect, useState } from "react"
import { CheckSquare, Square } from "lucide-react"

const STORAGE_KEY = "marketplace.compare.ids"

function readIds() {
  if (typeof window === "undefined") return [] as string[]
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function writeIds(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, 4)))
  window.dispatchEvent(new Event("marketplace-compare-change"))
}

interface CompareToggleButtonProps {
  id: string
  type: "SERVICE" | "PRODUCT"
  providerId?: string
  className?: string
  compact?: boolean
}

export function CompareToggleButton({ id, type, providerId, className = "", compact = false }: CompareToggleButtonProps) {
  const [selected, setSelected] = useState(false)

  useEffect(() => {
    const sync = () => setSelected(readIds().includes(id))
    sync()
    window.addEventListener("storage", sync)
    window.addEventListener("marketplace-compare-change", sync)
    return () => {
      window.removeEventListener("storage", sync)
      window.removeEventListener("marketplace-compare-change", sync)
    }
  }, [id])

  function toggle() {
    const ids = readIds()
    const exists = ids.includes(id)
    const next = exists ? ids.filter((value) => value !== id) : ids.length < 4 ? [...ids, id] : ids
    writeIds(next)

    void fetch("/api/commercial-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: exists ? "COMPARE_REMOVED" : "COMPARE_ADDED",
        listingId: id,
        providerId,
        metadata: { listingType: type },
      }),
    }).catch(() => {})
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={selected}
      aria-label={selected ? "Quitar de comparación" : "Comparar"}
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all ${selected ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-300" : "border-stone-200 bg-white text-stone-700 hover:border-blue-300 hover:text-blue-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-300"} ${className}`}
    >
      {selected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
      {!compact && (selected ? "Comparando" : "Comparar")}
    </button>
  )
}
