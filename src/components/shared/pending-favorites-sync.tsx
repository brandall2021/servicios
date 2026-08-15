"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"

const STORAGE_KEY = "marketplace.pendingFavorites"

interface PendingItem {
  type: "LISTING" | "PROVIDER"
  targetId: string
}

export function PendingFavoritesSync() {
  const { data: session } = useSession()
  const [items, setItems] = useState<PendingItem[]>(() => {
    if (typeof window === "undefined") return []
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as PendingItem[]) : []
    } catch {
      return []
    }
  })
  const [syncing, setSyncing] = useState(false)

  if (!session?.user || items.length === 0) return null

  async function syncNow() {
    setSyncing(true)
    const pending = [...items]
    const next: PendingItem[] = []

    for (const item of pending) {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      })
      if (!res.ok) next.push(item)
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setItems(next)
    setSyncing(false)
  }

  return (
    <div className="mb-6 rounded-2xl border border-orange-200/70 bg-orange-50 p-4 dark:border-orange-900/40 dark:bg-orange-900/15">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-orange-800 dark:text-orange-200">Tenés guardados pendientes</p>
          <p className="text-sm text-orange-700/80 dark:text-orange-300/80">Encontramos {items.length} favoritos guardados antes de iniciar sesión.</p>
        </div>
        <Button onClick={syncNow} disabled={syncing} className="rounded-xl">
          {syncing ? "Sincronizando..." : "Sincronizar ahora"}
        </Button>
      </div>
    </div>
  )
}
