"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface ProductInquiryComposeFormProps {
  listingId: string
  productUnit: string
  minimumOrder?: string | null
  defaultQuantity?: string
}

export function ProductInquiryComposeForm({ listingId, productUnit, minimumOrder, defaultQuantity = "1" }: ProductInquiryComposeFormProps) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(defaultQuantity)
  const [requestedUnit, setRequestedUnit] = useState(productUnit)
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    startTransition(async () => {
      const res = await fetch("/api/product-inquiries/draft/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, quantity, requestedUnit, notes }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setError(err.error || "No se pudo agregar")
        return
      }

      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Cantidad</label>
        <Input type="number" step="0.001" min={minimumOrder || "0.001"} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Unidad</label>
        <Input value={requestedUnit} onChange={(e) => setRequestedUnit(e.target.value)} placeholder={productUnit} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Nota</label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Condiciones, entrega, horarios, etc." />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={pending} className="w-full rounded-xl">
        {pending ? "Agregando..." : "Agregar a consulta"}
      </Button>
    </form>
  )
}
