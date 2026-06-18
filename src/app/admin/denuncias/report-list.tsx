"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, Clock, Eye, Link as LinkIcon } from "lucide-react"
import Link from "next/link"

interface Report {
  id: string
  motivo: string
  descripcion: string | null
  estado: string
  createdAt: Date
  denunciante: { id: string; name: string }
  servicio: { id: string; titulo: string; activo: boolean } | null
  opinion: { id: string; comentario: string | null; puntuacion: number } | null
  usuario: { id: string; name: string; email: string } | null
}

const estadoColors: Record<string, "warning" | "success" | "secondary"> = {
  PENDIENTE: "warning",
  REVISADO: "secondary",
  RESUELTO: "success",
}

const motivos: Record<string, string> = {
  SPAM: "Spam",
  FALSO: "Información falsa",
  INADECUADO: "Contenido inadecuado",
  OTRO: "Otro",
}

export function AdminReportList({ reports }: { reports: Report[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function cambiarEstado(reportId: string, estado: string) {
    setLoading(reportId)
    await fetch(`/api/admin/denuncias/${reportId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    })
    setLoading(null)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {reports.length === 0 ? (
        <div className="text-center py-12 text-zinc-400">
          <AlertTriangle className="h-12 w-12 mx-auto mb-3" />
          <p>No hay denuncias</p>
        </div>
      ) : (
        reports.map((r) => (
          <Card key={r.id} className={r.estado === "PENDIENTE" ? "border-yellow-300 dark:border-yellow-700 bg-yellow-50/50 dark:bg-yellow-900/20" : ""}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={estadoColors[r.estado] || "secondary"}>
                      {r.estado === "PENDIENTE" ? "Pendiente" : r.estado === "REVISADO" ? "Revisado" : "Resuelto"}
                    </Badge>
                    <Badge variant="outline">{motivos[r.motivo] || r.motivo}</Badge>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                      {new Date(r.createdAt).toLocaleDateString("es-AR")}
                    </span>
                  </div>

                  {r.descripcion && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{r.descripcion}</p>
                  )}

                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <span>Denunciante: {r.denunciante.name}</span>
                    {r.servicio && (
                      <Link href={`/servicios/${r.servicio.id}`} className="flex items-center gap-1 text-orange-600 hover:underline">
                        <LinkIcon className="h-3 w-3" /> {r.servicio.titulo}
                      </Link>
                    )}
                    {r.usuario && (
                      <span>Usuario reportado: {r.usuario.name} ({r.usuario.email})</span>
                    )}
                    {r.opinion && (
                      <span>Opinión: "{r.opinion.comentario}" ({r.opinion.puntuacion}★)</span>
                    )}
                  </div>
                </div>

                {r.estado === "PENDIENTE" && (
                  <div className="flex gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => cambiarEstado(r.id, "REVISADO")}
                      disabled={loading === r.id}
                    >
                      <Eye className="h-3 w-3 mr-1" /> Revisado
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => cambiarEstado(r.id, "RESUELTO")}
                      disabled={loading === r.id}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" /> Resolver
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
