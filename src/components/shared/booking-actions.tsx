"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { Textarea } from "@/components/ui/textarea"

interface BookingActionsProps {
  id: string
  status: string
  isClient: boolean
  isProvider: boolean
}

export function BookingActions({ id, status, isClient, isProvider }: BookingActionsProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancellationReason, setCancellationReason] = useState("")

  function runAction(action: "CONFIRM" | "REJECT" | "CANCEL" | "COMPLETE" | "NO_SHOW", payload?: { cancellationReason?: string }) {
    setError("")
    startTransition(async () => {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error || "No se pudo actualizar la reserva")
        return
      }

      if (action === "CANCEL") {
        setCancelOpen(false)
        setCancellationReason("")
      }

      router.refresh()
    })
  }

  const canRespond = isProvider && status === "PENDING"
  const canClose = isProvider && status === "CONFIRMED"
  const canCancel = isClient && (status === "PENDING" || status === "CONFIRMED")

  if (!canRespond && !canClose && !canCancel) return null

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {canRespond && (
        <>
          <Button type="button" variant="outline" className="rounded-xl" disabled={pending} onClick={() => runAction("CONFIRM")}>
            Confirmar
          </Button>
          <Button type="button" variant="ghost" className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" disabled={pending} onClick={() => runAction("REJECT")}>
            Rechazar
          </Button>
        </>
      )}
      {canClose && (
        <>
          <Button type="button" variant="outline" className="rounded-xl" disabled={pending} onClick={() => runAction("COMPLETE")}>
            Completar
          </Button>
          <Button type="button" variant="outline" className="rounded-xl" disabled={pending} onClick={() => runAction("NO_SHOW")}>
            No show
          </Button>
        </>
      )}
      {canCancel && (
        <Button type="button" variant="ghost" className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" disabled={pending} onClick={() => setCancelOpen(true)}>
          Cancelar
        </Button>
      )}
      {error && <p className="basis-full text-sm text-red-600">{error}</p>}

      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancelar reserva">
        <div className="space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Podés dejar un motivo para que el proveedor entienda el contexto de la cancelación.</p>
          <Textarea
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            rows={4}
            placeholder="Motivo opcional"
          />
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" className="rounded-xl" disabled={pending} onClick={() => setCancelOpen(false)}>
              Volver
            </Button>
            <Button
              type="button"
              className="rounded-xl"
              disabled={pending}
              onClick={() => runAction("CANCEL", { cancellationReason: cancellationReason.trim() || undefined })}
            >
              Confirmar cancelación
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
