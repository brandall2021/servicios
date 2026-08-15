"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PromotionComposeForm } from "@/components/shared/promotion-compose-form"
import { PromotionActions } from "@/components/shared/promotion-actions"
import type { PromotionTypeValue } from "@/lib/marketplace/promotions"

interface PromotionRowProps {
  promotion: {
    id: string
    listingTitle: string | null
    active: boolean
    type: string
    name: string
    code: string | null
    value: string | null
    startsAt: string
    endsAt: string
    terms: string | null
    listingId: string | null
  }
}

export function PromotionRow({ promotion }: PromotionRowProps) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <div className="rounded-2xl border border-stone-200 p-4 dark:border-zinc-700">
          <PromotionComposeForm
          promotionId={promotion.id}
          submitLabel="Guardar cambios"
          initialValues={{
            listingId: promotion.listingId,
            type: promotion.type as PromotionTypeValue,
            name: promotion.name,
            code: promotion.code,
            value: promotion.value,
            startsAt: promotion.startsAt,
            endsAt: promotion.endsAt,
            terms: promotion.terms,
          }}
          onCancel={() => setEditing(false)}
        />
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-stone-200 p-4 dark:border-zinc-700">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-stone-900 dark:text-stone-100">{promotion.name}</p>
          <p className="text-sm text-stone-500 dark:text-stone-400">{promotion.listingTitle || "Toda la cuenta"}</p>
        </div>
        <Badge variant={promotion.active ? "secondary" : "outline"}>{promotion.active ? "Activa" : "Pausada"}</Badge>
      </div>
      <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
        {promotion.type} · {new Date(promotion.startsAt).toLocaleDateString("es-AR")} - {new Date(promotion.endsAt).toLocaleDateString("es-AR")}
      </p>
      {(promotion.code || promotion.value) && (
        <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
          {promotion.code ? `Código ${promotion.code}` : "Sin código"}{promotion.value ? ` · Valor ${promotion.value}` : ""}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" variant="outline" className="rounded-xl" onClick={() => setEditing(true)}>
          Editar
        </Button>
      </div>
      <PromotionActions id={promotion.id} active={promotion.active} />
    </div>
  )
}
