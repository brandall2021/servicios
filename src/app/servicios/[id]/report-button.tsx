"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle } from "lucide-react"

interface ReportButtonProps {
  servicioId: string
  proveedorId: string
}

export function ReportButton({ servicioId }: ReportButtonProps) {
  const [open, setOpen] = useState(false)
  const [motivo, setMotivo] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!motivo) return
    setLoading(true)
    const res = await fetch("/api/admin/denuncias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ motivo, descripcion, servicioId }),
    })
    if (res.ok) setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <p className="text-sm text-green-600">Denuncia enviada. Gracias por ayudarnos a mantener la calidad.</p>
    )
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-zinc-400 hover:text-red-500 transition-colors flex items-center gap-1"
      >
        <AlertTriangle className="h-3 w-3" /> Denunciar
      </button>
      {open && (
        <form onSubmit={handleSubmit} className="mt-2 space-y-2 p-3 rounded-lg bg-zinc-50 border border-zinc-200">
          <select
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="w-full h-9 rounded-lg border border-zinc-300 px-2 text-sm outline-none focus:border-red-500"
            required
          >
            <option value="">Seleccionar motivo</option>
            <option value="SPAM">Spam</option>
            <option value="FALSO">Información falsa</option>
            <option value="INADECUADO">Contenido inadecuado</option>
            <option value="OTRO">Otro</option>
          </select>
          <Textarea
            id="desc"
            placeholder="Describí el problema (opcional)"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={2}
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" variant="destructive" disabled={!motivo || loading}>
              {loading ? "Enviando..." : "Enviar denuncia"}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
