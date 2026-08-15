"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface PromotionActionsProps {
  id: string
  active: boolean
}

export function PromotionActions({ id, active }: PromotionActionsProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState("")

  function updatePromotion(nextActive: boolean) {
    setError("")
    startTransition(async () => {
      const res = await fetch(`/api/promotions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: nextActive }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error || "No se pudo actualizar la promoción")
        return
      }

      router.refresh()
    })
  }

  function removePromotion() {
    if (!window.confirm("¿Eliminar esta promoción?")) return
    setError("")
    startTransition(async () => {
      const res = await fetch(`/api/promotions/${id}`, { method: "DELETE" })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error || "No se pudo eliminar la promoción")
        return
      }

      router.refresh()
    })
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <Button type="button" variant="outline" className="rounded-xl" disabled={pending} onClick={() => updatePromotion(!active)}>
        {active ? "Pausar" : "Activar"}
      </Button>
      <Button type="button" variant="ghost" className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" disabled={pending} onClick={removePromotion}>
        Eliminar
      </Button>
      {error && <p className="basis-full text-sm text-red-600">{error}</p>}
    </div>
  )
}
