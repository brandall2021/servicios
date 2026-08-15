"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { X } from "lucide-react"

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

export function CompareTray() {
  const [ids, setIds] = useState<string[]>([])

  useEffect(() => {
    const sync = () => setIds(readIds())
    sync()
    window.addEventListener("storage", sync)
    window.addEventListener("marketplace-compare-change", sync)
    return () => {
      window.removeEventListener("storage", sync)
      window.removeEventListener("marketplace-compare-change", sync)
    }
  }, [])

  if (ids.length === 0) return null

  return (
    <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-2xl border border-stone-200/80 bg-white/95 px-4 py-3 shadow-[0_14px_40px_rgba(0,0,0,0.14)] backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-stone-900 dark:text-stone-100">{ids.length} publicaciones para comparar</p>
          <p className="text-xs text-stone-500 dark:text-stone-400">Máximo 4 y sin mezclar tipos</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              writeIds([])
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 px-3 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 dark:border-zinc-700 dark:text-stone-300"
          >
            <X className="h-4 w-4" />
            Limpiar
          </button>
          <Link href={`/comparar?ids=${ids.join(",")}`} className="inline-flex items-center rounded-xl btn-glow px-4 py-2 text-sm font-semibold">
            Comparar
          </Link>
        </div>
      </div>
    </div>
  )
}
