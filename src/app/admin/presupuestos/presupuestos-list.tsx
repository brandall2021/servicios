"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Eye } from "lucide-react"
import Link from "next/link"

interface BudgetQuote {
  id: string
  amount: number
  breakdown: string | null
  notes: string | null
  version: number
  createdAt: Date
  proveedor: { id: string; name: string }
}

interface BudgetRequest {
  id: string
  description: string | null
  materiales: string | null
  status: string
  createdAt: Date
  cliente: { id: string; name: string; email: string }
  servicio: { id: string; titulo: string }
  cotizaciones: BudgetQuote[]
}

const statusColors: Record<string, "warning" | "success" | "destructive" | "secondary" | "default"> = {
  PENDIENTE: "warning",
  COTIZADO: "default",
  ACEPTADO: "success",
  RECHAZADO: "destructive",
  REVISION: "secondary",
}

const statusLabels: Record<string, string> = {
  PENDIENTE: "Pendiente",
  COTIZADO: "Cotizado",
  ACEPTADO: "Aceptado",
  RECHAZADO: "Rechazado",
  REVISION: "En revisión",
}

export function AdminPresupuestosList({ requests }: { requests: BudgetRequest[] }) {
  return (
    <div className="space-y-4">
      {requests.length === 0 ? (
        <div className="text-center py-12 text-zinc-400">
          <FileText className="h-12 w-12 mx-auto mb-3" />
          <p>No hay solicitudes de presupuesto</p>
        </div>
      ) : (
        requests.map((r) => (
          <Card key={r.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={statusColors[r.status] || "secondary"}>
                      {statusLabels[r.status] || r.status}
                    </Badge>
                    <span className="text-xs text-zinc-400">
                      {new Date(r.createdAt).toLocaleDateString("es-AR")}
                    </span>
                  </div>

                  <p className="font-medium text-zinc-900 dark:text-zinc-100 text-sm">
                    {r.cliente.name}
                    <span className="text-zinc-400 font-normal"> solicitó presupuesto para </span>
                    <Link href={`/servicios/${r.servicio.id}`} className="text-orange-600 hover:underline">
                      {r.servicio.titulo}
                    </Link>
                  </p>

                  {r.description && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                      {r.description}
                    </p>
                  )}

                  {r.materiales && (
                    <p className="text-xs text-zinc-500 mt-1">
                      <span className="font-medium">Materiales:</span> {r.materiales}
                    </p>
                  )}

                  {r.cotizaciones.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Cotizaciones ({r.cotizaciones.length})
                      </p>
                      {r.cotizaciones.map((c) => (
                        <div
                          key={c.id}
                          className="rounded-lg bg-zinc-50 dark:bg-zinc-800 p-3 text-sm"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-zinc-900 dark:text-zinc-100">
                              {c.proveedor.name}
                            </span>
                            <span className="font-bold text-orange-600">
                              ${c.amount.toLocaleString("es-AR")}
                            </span>
                          </div>
                          {c.notes && (
                            <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">{c.notes}</p>
                          )}
                          {c.breakdown && (
                            <p className="text-zinc-400 text-xs mt-0.5">{c.breakdown}</p>
                          )}
                          <p className="text-[10px] text-zinc-400 mt-1">
                            V{c.version} &middot; {new Date(c.createdAt).toLocaleDateString("es-AR")}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  href={`/servicios/${r.servicio.id}`}
                  className="shrink-0 p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-orange-600"
                >
                  <Eye className="h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
