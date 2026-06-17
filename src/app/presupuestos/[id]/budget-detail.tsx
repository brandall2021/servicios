"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, FileText, CheckCircle, XCircle, RefreshCw, DollarSign, Package, Calendar } from "lucide-react"

interface BudgetRequestDetail {
  id: string
  description: string | null
  materiales: string | null
  status: string
  createdAt: string
  servicio: {
    id: string
    titulo: string
    categoria: string
    usuario: { id: string; name: string; image: string | null; phone: string | null }
  }
  cliente: { id: string; name: string; image: string | null }
  cotizaciones: {
    id: string
    amount: number
    breakdown: string | null
    notes: string | null
    validUntil: string | null
    version: number
    createdAt: string
    proveedor: { id: string; name: string; image: string | null }
  }[]
}

const statusStyles: Record<string, { label: string; variant: "warning" | "default" | "success" | "destructive" | "secondary" }> = {
  PENDIENTE: { label: "Pendiente", variant: "warning" },
  COTIZADO: { label: "Cotizado", variant: "default" },
  ACEPTADO: { label: "Aceptado", variant: "success" },
  RECHAZADO: { label: "Rechazado", variant: "destructive" },
  REVISION: { label: "En revisión", variant: "secondary" },
}

export function BudgetDetail({ request, currentUserId: _currentUserId, isProvider }: { request: BudgetRequestDetail; currentUserId: string; isProvider: boolean }) {
  const router = useRouter()
  const st = statusStyles[request.status] || { label: request.status, variant: "secondary" }
  const materiales = request.materiales ? (JSON.parse(request.materiales) as string[]) : []
  const bestQuote = request.cotizaciones[0]

  const [showQuoteForm, setShowQuoteForm] = useState(false)
  const [amount, setAmount] = useState("")
  const [breakdown, setBreakdown] = useState("")
  const [notes, setNotes] = useState("")
  const [validUntil, setValidUntil] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleCotizar(e: React.FormEvent) {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) return
    setLoading(true)
    setError("")

    const res = await fetch(`/api/presupuestos/${request.id}/cotizar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: parseFloat(amount),
        breakdown,
        notes,
        validUntil: validUntil || null,
      }),
    })

    if (res.ok) {
      router.refresh()
      setShowQuoteForm(false)
    } else {
      const err = await res.json()
      setError(err.error || "Error al cotizar")
    }
    setLoading(false)
  }

  async function cambiarEstado(status: string) {
    setLoading(true)
    await fetch(`/api/presupuestos/${request.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    setLoading(false)
    router.refresh()
  }

  const canQuote = isProvider && (request.status === "PENDIENTE" || request.status === "REVISION")
  const canAccept = !isProvider && request.status === "COTIZADO"

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/presupuestos" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Volver a presupuestos
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-stone-900">Presupuesto</h1>
            <Badge variant={st.variant}>{st.label}</Badge>
          </div>
          <Link href={`/servicios/${request.servicio.id}`} className="text-sm text-orange-600 hover:underline">
            {request.servicio.titulo}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardContent className="p-5">
              <h2 className="font-semibold text-stone-900 mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-orange-600" /> Detalle de la solicitud
              </h2>
              <p className="text-sm text-stone-600 whitespace-pre-wrap">{request.description || "Sin descripción"}</p>

              {materiales.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-stone-800 mb-2 flex items-center gap-1.5">
                    <Package className="h-4 w-4 text-stone-500" /> Materiales / Requerimientos
                  </h3>
                  <ul className="space-y-1">
                    {materiales.map((m, i) => (
                      <li key={i} className="text-sm text-stone-600 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0" />
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {request.cotizaciones.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h2 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-orange-600" /> Cotizaciones
                </h2>
                <div className="space-y-3">
                  {request.cotizaciones.map((q) => (
                    <div key={q.id} className={`p-4 rounded-xl border ${q.id === bestQuote?.id ? "border-orange-200 bg-orange-50/40" : "border-stone-200/70 bg-white"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">
                          Versión {q.version}
                          {q.id === bestQuote?.id && request.cotizaciones.length > 1 && (
                            <span className="ml-2 text-orange-600 font-semibold">(última)</span>
                          )}
                        </span>
                        <span className="text-xs text-stone-400">{new Date(q.createdAt).toLocaleDateString("es-AR")}</span>
                      </div>
                      <p className="text-2xl font-bold text-stone-900">${q.amount.toLocaleString("es-AR")}</p>
                      {q.breakdown && <p className="text-sm text-stone-500 mt-1 whitespace-pre-wrap">{q.breakdown}</p>}
                      {q.notes && <p className="text-sm text-stone-500 mt-1 italic">{q.notes}</p>}
                      {q.validUntil && (
                        <p className="text-xs text-stone-400 mt-2 flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Válido hasta {new Date(q.validUntil).toLocaleDateString("es-AR")}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs text-stone-500">
                        <Avatar src={q.proveedor.image} fallback={q.proveedor.name} size="sm" />
                        {q.proveedor.name}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {canQuote && !showQuoteForm && (
            <Button onClick={() => setShowQuoteForm(true)} className="w-full rounded-xl">
              <DollarSign className="h-4 w-4" /> Cotizar este presupuesto
            </Button>
          )}

          {canQuote && showQuoteForm && (
            <form onSubmit={handleCotizar} className="space-y-4 p-5 bg-white rounded-xl border border-stone-200/70">
              <h3 className="font-semibold text-stone-900">Nueva cotización</h3>
              <Input id="amount" type="number" label="Monto total ($)" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Ej: 25000" required min="0" step="0.01" />
              <Textarea id="breakdown" label="Desglose de costos" value={breakdown} onChange={(e) => setBreakdown(e.target.value)} placeholder="Ej: Mano de obra: $15.000, Materiales: $8.000, Transporte: $2.000" rows={3} />
              <Textarea id="notes" label="Notas adicionales" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Plazos, condiciones, etc." rows={2} />
              <Input id="validUntil" type="date" label="Válido hasta" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
              {error && <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>{loading ? "Enviando..." : "Enviar cotización"}</Button>
                <Button type="button" variant="outline" onClick={() => setShowQuoteForm(false)}>Cancelar</Button>
              </div>
            </form>
          )}

          {canAccept && (
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => cambiarEstado("ACEPTADO")} disabled={loading} className="rounded-xl">
                <CheckCircle className="h-4 w-4" /> Aceptar presupuesto
              </Button>
              <Button onClick={() => cambiarEstado("RECHAZADO")} disabled={loading} variant="outline" className="rounded-xl">
                <XCircle className="h-4 w-4" /> Rechazar
              </Button>
              <Button onClick={() => cambiarEstado("REVISION")} disabled={loading} variant="secondary" className="rounded-xl">
                <RefreshCw className="h-4 w-4" /> Solicitar revisión
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Información</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-stone-400">Cliente</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Avatar src={request.cliente.image} fallback={request.cliente.name} size="sm" />
                    <span className="text-sm font-medium text-stone-900">{request.cliente.name}</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-stone-400">Proveedor</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Avatar src={request.servicio.usuario.image} fallback={request.servicio.usuario.name} size="sm" />
                    <span className="text-sm font-medium text-stone-900">{request.servicio.usuario.name}</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-stone-400">Fecha de solicitud</span>
                  <p className="text-sm text-stone-900 mt-0.5">{new Date(request.createdAt).toLocaleDateString("es-AR")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {!isProvider && request.status === "COTIZADO" && bestQuote && (
            <Card className="border-orange-200 bg-orange-50/40">
              <CardContent className="p-5">
                <span className="text-xs font-semibold text-orange-700 uppercase tracking-wider">Cotización actual</span>
                <p className="text-2xl font-bold text-stone-900 mt-1">${bestQuote.amount.toLocaleString("es-AR")}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
