"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Trash2 } from "lucide-react"
import Link from "next/link"

interface Servicio {
  id: string
  titulo: string
  categoria: string
  activo: boolean
  createdAt: Date
  usuario: { id: string; name: string }
  _count: { opiniones: number }
}

export function AdminServiceList({ servicios }: { servicios: Servicio[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function toggleActivo(servicioId: string, current: boolean) {
    setLoading(servicioId)
    await fetch(`/api/admin/servicios/${servicioId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !current }),
    })
    setLoading(null)
    router.refresh()
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200">
            <th className="text-left py-3 px-4 font-medium text-zinc-500">Servicio</th>
            <th className="text-left py-3 px-4 font-medium text-zinc-500">Proveedor</th>
            <th className="text-left py-3 px-4 font-medium text-zinc-500">Categoría</th>
            <th className="text-center py-3 px-4 font-medium text-zinc-500">Opiniones</th>
            <th className="text-center py-3 px-4 font-medium text-zinc-500">Estado</th>
            <th className="text-right py-3 px-4 font-medium text-zinc-500">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {servicios.map((s) => (
            <tr key={s.id} className="border-b border-zinc-100 hover:bg-zinc-50">
              <td className="py-3 px-4">
                <Link href={`/servicios/${s.id}`} className="font-medium text-zinc-900 hover:text-blue-600">
                  {s.titulo}
                </Link>
              </td>
              <td className="py-3 px-4 text-zinc-500">{s.usuario.name}</td>
              <td className="py-3 px-4">
                <Badge variant="secondary">{s.categoria}</Badge>
              </td>
              <td className="py-3 px-4 text-center text-zinc-500">{s._count.opiniones}</td>
              <td className="py-3 px-4 text-center">
                {s.activo ? (
                  <Badge variant="success">Activo</Badge>
                ) : (
                  <Badge variant="destructive">Inactivo</Badge>
                )}
              </td>
              <td className="py-3 px-4 text-right">
                <button
                  onClick={() => toggleActivo(s.id, s.activo)}
                  disabled={loading === s.id}
                  className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-blue-600"
                  title={s.activo ? "Desactivar" : "Activar"}
                >
                  {s.activo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
