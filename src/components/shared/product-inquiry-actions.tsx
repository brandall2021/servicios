"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface ProductInquiryActionsProps {
  inquiryId: string
  status: string
  isClient: boolean
  isProvider: boolean
}

export function ProductInquiryActions({ inquiryId, status, isClient, isProvider }: ProductInquiryActionsProps) {
  const router = useRouter()
  const [loading, startTransition] = useTransition()
  const [amount, setAmount] = useState("")
  const [breakdown, setBreakdown] = useState("")
  const [conditions, setConditions] = useState("")
  const [validUntil, setValidUntil] = useState("")
  const [error, setError] = useState("")

  function sendInquiry() {
    startTransition(async () => {
      const res = await fetch(`/api/product-inquiries/${inquiryId}/send`, { method: "POST" })
      if (!res.ok) {
        setError((await res.json().catch(() => ({}))).error || "No se pudo enviar")
        return
      }
      router.refresh()
    })
  }

  function submitQuote(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await fetch(`/api/product-inquiries/${inquiryId}/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          breakdown,
          conditions,
          validUntil: validUntil ? new Date(validUntil).toISOString() : null,
        }),
      })

      if (!res.ok) {
        setError((await res.json().catch(() => ({}))).error || "No se pudo cotizar")
        return
      }
      router.refresh()
    })
  }

  function changeState(action: "ACCEPT" | "REJECT" | "CANCEL") {
    startTransition(async () => {
      const res = await fetch(`/api/product-inquiries/${inquiryId}/state`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) {
        setError((await res.json().catch(() => ({}))).error || "No se pudo actualizar")
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {isClient && status === "DRAFT" && (
        <Button onClick={sendInquiry} disabled={loading} className="w-full rounded-xl">
          Enviar consulta
        </Button>
      )}
      {isProvider && (
        <form onSubmit={submitQuote} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Total</label>
            <Input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Ej: 25000" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Desglose</label>
            <Textarea value={breakdown} onChange={(e) => setBreakdown(e.target.value)} rows={3} placeholder="Mano de obra, materiales, transporte..." />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Condiciones</label>
            <Textarea value={conditions} onChange={(e) => setConditions(e.target.value)} rows={2} placeholder="Validez, entrega, condiciones..." />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Válido hasta</label>
            <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
          </div>
          <Button type="submit" disabled={loading} className="w-full rounded-xl">
            Enviar cotización
          </Button>
        </form>
      )}
      {isClient && status === "RESPONDED" && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Button onClick={() => changeState("ACCEPT")} disabled={loading} className="rounded-xl">Aceptar</Button>
          <Button onClick={() => changeState("REJECT")} disabled={loading} variant="outline" className="rounded-xl">Rechazar</Button>
          <Button onClick={() => changeState("CANCEL")} disabled={loading} variant="secondary" className="rounded-xl">Cancelar</Button>
        </div>
      )}
    </div>
  )
}
