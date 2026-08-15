"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { PromotionTypeValue } from "@/lib/marketplace/promotions"

interface PromotionComposeFormProps {
  defaultListingId?: string
  promotionId?: string
  initialValues?: {
    listingId?: string | null
    type?: PromotionTypeValue
    name?: string
    code?: string | null
    value?: string | number | null
    startsAt?: string
    endsAt?: string
    terms?: string | null
  }
  submitLabel?: string
  onCancel?: () => void
}

export function PromotionComposeForm({ defaultListingId = "", promotionId, initialValues, submitLabel, onCancel }: PromotionComposeFormProps) {
  const router = useRouter()
  const [listingId, setListingId] = useState(initialValues?.listingId ?? defaultListingId)
  const [type, setType] = useState(initialValues?.type ?? "BENEFIT")
  const [name, setName] = useState(initialValues?.name ?? "")
  const [code, setCode] = useState(initialValues?.code ?? "")
  const [value, setValue] = useState(initialValues?.value?.toString() ?? "")
  const [startsAt, setStartsAt] = useState(initialValues?.startsAt ?? "")
  const [endsAt, setEndsAt] = useState(initialValues?.endsAt ?? "")
  const [terms, setTerms] = useState(initialValues?.terms ?? "")
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    startTransition(async () => {
      const res = await fetch(promotionId ? `/api/promotions/${promotionId}` : "/api/promotions", {
        method: promotionId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: listingId || null, type, name, code: code || null, value: value || null, startsAt, endsAt, terms }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setError(err.error || "No se pudo crear la promoción")
        return
      }

      router.refresh()
      onCancel?.()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Publicación opcional</label>
        <Input value={listingId} onChange={(e) => setListingId(e.target.value)} placeholder="ID de listing" />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Tipo</label>
        <select value={type} onChange={(e) => setType(e.target.value as PromotionTypeValue)} className="h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900">
          <option value="BENEFIT">Beneficio</option>
          <option value="PERCENTAGE">Porcentaje</option>
          <option value="FIXED_AMOUNT">Monto fijo</option>
          <option value="PROMOTIONAL_PRICE">Precio promocional</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Nombre</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Código</label>
        <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="OPCIONAL" />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Valor</label>
        <Input type="number" step="0.01" min="0" value={value} onChange={(e) => setValue(e.target.value)} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Inicio</label>
        <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Fin</label>
        <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} required />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Términos</label>
        <Textarea value={terms} onChange={(e) => setTerms(e.target.value)} rows={3} placeholder="Condiciones visibles" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending} className="flex-1 rounded-xl">
          {pending ? "Guardando..." : submitLabel || (promotionId ? "Guardar cambios" : "Crear promoción")}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" disabled={pending} className="rounded-xl" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}
