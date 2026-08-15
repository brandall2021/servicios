"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface BookingComposeFormProps {
  listingId: string
}

export function BookingComposeForm({ listingId }: BookingComposeFormProps) {
  const router = useRouter()
  const [startsAt, setStartsAt] = useState("")
  const [endsAt, setEndsAt] = useState("")
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    startTransition(async () => {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, startsAt, endsAt, timezone, notes }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setError(err.error || "No se pudo crear la reserva")
        return
      }

      router.push("/reservas")
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Inicio</label>
        <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Fin</label>
        <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} required />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Zona horaria</label>
        <Input value={timezone} onChange={(e) => setTimezone(e.target.value)} required />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Notas</label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Detalles de la visita o turno" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={pending} className="w-full rounded-xl">
        {pending ? "Reservando..." : "Solicitar reserva"}
      </Button>
    </form>
  )
}
