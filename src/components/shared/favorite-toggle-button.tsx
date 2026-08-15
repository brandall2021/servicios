"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Heart, Loader2 } from "lucide-react"

interface FavoriteToggleButtonProps {
  type: "LISTING" | "PROVIDER"
  targetId: string
  initialSaved?: boolean
  returnTo: string
  className?: string
  label?: string
  compact?: boolean
}

export function FavoriteToggleButton({ type, targetId, initialSaved = false, returnTo, className = "", label, compact = false }: FavoriteToggleButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [saved, setSaved] = useState(initialSaved)
  const [pending, startTransition] = useTransition()

  async function persist(nextSaved: boolean) {
    const res = await fetch(nextSaved ? "/api/favorites" : `/api/favorites?type=${type}&targetId=${encodeURIComponent(targetId)}`, {
      method: nextSaved ? "POST" : "DELETE",
      headers: nextSaved ? { "Content-Type": "application/json" } : undefined,
      body: nextSaved ? JSON.stringify({ type, targetId }) : undefined,
    })

    if (!res.ok) throw new Error("No se pudo actualizar")
  }

  function savePendingIntent() {
    const raw = localStorage.getItem("marketplace.pendingFavorites")
    const current = raw ? (JSON.parse(raw) as Array<{ type: string; targetId: string }>) : []
    const next = current.some((item) => item.type === type && item.targetId === targetId)
      ? current
      : [...current, { type, targetId }]
    localStorage.setItem("marketplace.pendingFavorites", JSON.stringify(next))
  }

  function handleClick() {
    if (!session?.user) {
      savePendingIntent()
      router.push(`/login?returnTo=${encodeURIComponent(returnTo)}`)
      return
    }

    startTransition(async () => {
      const nextSaved = !saved
      setSaved(nextSaved)
      try {
        await persist(nextSaved)
      } catch {
        setSaved(!nextSaved)
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-pressed={saved}
      aria-label={saved ? "Quitar de favoritos" : "Agregar a favoritos"}
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all ${saved ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-900/20 dark:text-rose-300" : "border-stone-200 bg-white text-stone-700 hover:border-rose-300 hover:text-rose-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-300"} ${className}`}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />}
      {!compact && (label || (saved ? "Guardado" : "Guardar"))}
    </button>
  )
}
