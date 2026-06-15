"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, ShieldOff, Ban, CheckCircle, Trash2, XCircle } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: string
  verified: boolean
  baneado: boolean
  motivoBaneo: string | null
  createdAt: Date
  _count: { servicios: number; opiniones: number }
}

export function AdminUserList({ usuarios }: { usuarios: User[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function toggleVerified(userId: string, current: boolean) {
    setLoading(userId)
    await fetch(`/api/admin/usuarios/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verified: !current }),
    })
    setLoading(null)
    router.refresh()
  }

  async function toggleBan(userId: string, current: boolean) {
    setLoading(userId)
    const motivo = !current ? prompt("Motivo del bloqueo:") : null
    if (!current && !motivo) { setLoading(null); return }
    await fetch(`/api/admin/usuarios/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ baneado: !current, motivoBaneo: motivo }),
    })
    setLoading(null)
    router.refresh()
  }

  async function deleteUser(userId: string, name: string) {
    if (!confirm(`¿Eliminar a "${name}"? Esta acción no se puede deshacer.`)) return
    setLoading(userId)
    await fetch(`/api/admin/usuarios/${userId}`, { method: "DELETE" })
    setLoading(null)
    router.refresh()
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200">
            <th className="text-left py-3 px-4 font-medium text-zinc-500">Usuario</th>
            <th className="text-left py-3 px-4 font-medium text-zinc-500">Email</th>
            <th className="text-left py-3 px-4 font-medium text-zinc-500">Rol</th>
            <th className="text-center py-3 px-4 font-medium text-zinc-500">Servicios</th>
            <th className="text-center py-3 px-4 font-medium text-zinc-500">Estado</th>
            <th className="text-right py-3 px-4 font-medium text-zinc-500">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id} className={`border-b border-zinc-100 hover:bg-zinc-50 ${u.baneado ? "bg-red-50" : ""}`}>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <Avatar src={null} fallback={u.name} size="sm" />
                  <span className="font-medium text-zinc-900">{u.name}</span>
                </div>
              </td>
              <td className="py-3 px-4 text-zinc-500">{u.email}</td>
              <td className="py-3 px-4">
                <Badge variant={u.role === "ADMIN" ? "default" : u.role === "PROVIDER" ? "success" : "secondary"}>
                  {u.role === "ADMIN" ? "Admin" : u.role === "PROVIDER" ? "Proveedor" : "Cliente"}
                </Badge>
              </td>
              <td className="py-3 px-4 text-center text-zinc-500">{u._count.servicios}</td>
              <td className="py-3 px-4 text-center">
                <div className="flex items-center justify-center gap-1">
                  {u.verified && <CheckCircle className="h-4 w-4 text-green-600" title="Verificado" />}
                  {u.baneado && <Ban className="h-4 w-4 text-red-600" title="Bloqueado" />}
                  {!u.verified && !u.baneado && <span className="text-zinc-300">—</span>}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-1">
                  {u.role !== "ADMIN" && (
                    <>
                      <button
                        onClick={() => toggleVerified(u.id, u.verified)}
                        disabled={loading === u.id}
                        className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-green-600"
                        title={u.verified ? "Quitar verificación" : "Verificar"}
                      >
                        {u.verified ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => toggleBan(u.id, u.baneado)}
                        disabled={loading === u.id}
                        className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-red-600"
                        title={u.baneado ? "Desbloquear" : "Bloquear"}
                      >
                        {u.baneado ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => deleteUser(u.id, u.name)}
                        disabled={loading === u.id}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-500 hover:text-red-700"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
