"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { FileText, Clock } from "lucide-react"

interface BudgetRequestItem {
  id: string
  description: string | null
  materiales: string | null
  status: string
  createdAt: string
  servicio: { id: string; titulo: string; categoria: string }
  cliente?: { id: string; name: string; image: string | null }
  cotizaciones: { amount: number; version: number; proveedor: { id: string; name: string } }[]
}

const statusStyles: Record<string, { label: string; variant: "warning" | "default" | "success" | "destructive" | "secondary" }> = {
  PENDIENTE: { label: "Pendiente", variant: "warning" },
  COTIZADO: { label: "Cotizado", variant: "default" },
  ACEPTADO: { label: "Aceptado", variant: "success" },
  RECHAZADO: { label: "Rechazado", variant: "destructive" },
  REVISION: { label: "En revisión", variant: "secondary" },
}

export function BudgetList({ requests, rol }: { requests: BudgetRequestItem[]; rol: "cliente" | "proveedor" }) {
  return (
    <div className="space-y-3">
      {requests.map((r) => {
        const st = statusStyles[r.status] || { label: r.status, variant: "secondary" }
        const lastQuote = r.cotizaciones[0]

        return (
          <Link
            key={r.id}
            href={`/presupuestos/${r.id}`}
            className="block bg-white rounded-xl border border-stone-200/70 p-4 hover:border-orange-200/80 hover:shadow-[0_4px_16px_rgba(5,150,105,0.06)] transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-stone-400 shrink-0" />
                  <h3 className="font-medium text-stone-900 truncate">{r.servicio.titulo}</h3>
                  <Badge variant={st.variant}>{st.label}</Badge>
                </div>
                {r.description && (
                  <p className="text-sm text-stone-500 line-clamp-1 mt-0.5">{r.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-stone-400">
                  {rol === "proveedor" && r.cliente && (
                    <span className="flex items-center gap-1.5">
                      <Avatar src={r.cliente.image} fallback={r.cliente.name} size="sm" />
                      {r.cliente.name}
                    </span>
                  )}
                  {lastQuote && (
                    <span>${lastQuote.amount.toLocaleString("es-AR")}</span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(r.createdAt).toLocaleDateString("es-AR")}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
