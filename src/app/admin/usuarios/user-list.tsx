"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Modal } from "@/components/ui/modal"
import { Shield, ShieldOff, Ban, CheckCircle, Trash2, XCircle, Plus, Pencil } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  verified: boolean
  baneado: boolean
  motivoBaneo: string | null
  createdAt: Date
  _count: { servicios: number; opiniones: number }
}

interface UserFormData {
  name: string
  email: string
  password: string
  role: string
  phone: string
  verified: boolean
}

const emptyForm: UserFormData = {
  name: "",
  email: "",
  password: "",
  role: "CLIENT",
  phone: "",
  verified: false,
}

export function AdminUserList({ usuarios }: { usuarios: User[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form, setForm] = useState<UserFormData>(emptyForm)
  const [formError, setFormError] = useState("")
  const [saving, setSaving] = useState(false)

  function openCreate() {
    setEditingUser(null)
    setForm(emptyForm)
    setFormError("")
    setModalOpen(true)
  }

  function openEdit(user: User) {
    setEditingUser(user)
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      phone: user.phone || "",
      verified: user.verified,
    })
    setFormError("")
    setModalOpen(true)
  }

  async function handleSave() {
    setFormError("")
    if (!form.name.trim() || !form.email.trim()) {
      setFormError("Nombre y email son obligatorios")
      return
    }
    if (!editingUser && !form.password.trim()) {
      setFormError("Contraseña es obligatoria para nuevos usuarios")
      return
    }

    setSaving(true)
    try {
      if (editingUser) {
        const body: Record<string, any> = {
          name: form.name,
          email: form.email,
          role: form.role,
          phone: form.phone || null,
          verified: form.verified,
        }
        if (form.password.trim()) body.password = form.password

        const res = await fetch(`/api/admin/usuarios/${editingUser.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || "Error al actualizar")
        }
      } else {
        const res = await fetch("/api/admin/usuarios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || "Error al crear")
        }
      }
      setModalOpen(false)
      router.refresh()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Error de red")
    } finally {
      setSaving(false)
    }
  }

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
    <>
      <div className="flex items-center justify-end mb-4">
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4" />
          Crear Usuario
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-700">
              <th className="text-left py-3 px-4 font-medium text-zinc-500 dark:text-zinc-400">Usuario</th>
              <th className="text-left py-3 px-4 font-medium text-zinc-500 dark:text-zinc-400">Email</th>
              <th className="text-left py-3 px-4 font-medium text-zinc-500 dark:text-zinc-400">Rol</th>
              <th className="text-center py-3 px-4 font-medium text-zinc-500 dark:text-zinc-400">Servicios</th>
              <th className="text-center py-3 px-4 font-medium text-zinc-500 dark:text-zinc-400">Estado</th>
              <th className="text-right py-3 px-4 font-medium text-zinc-500 dark:text-zinc-400">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className={`border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${u.baneado ? "bg-red-50 dark:bg-red-900/20" : ""}`}>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Avatar src={null} fallback={u.name} size="sm" />
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{u.name}</span>
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
                    {u.verified && <span title="Verificado"><CheckCircle className="h-4 w-4 text-green-600" /></span>}
                    {u.baneado && <span title="Bloqueado"><Ban className="h-4 w-4 text-red-600" /></span>}
                    {!u.verified && !u.baneado && <span className="text-zinc-300">—</span>}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEdit(u)}
                      disabled={loading === u.id}
                      className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-blue-600"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingUser ? "Editar Usuario" : "Crear Usuario"}>
        <div className="space-y-4">
          <Input
            id="user-name"
            label="Nombre"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nombre completo"
          />
          <Input
            id="user-email"
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="correo@ejemplo.com"
          />
          <Input
            id="user-password"
            label={editingUser ? "Contraseña (dejar vacío para mantener actual)" : "Contraseña"}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder={editingUser ? "••••••••" : "Contraseña"}
          />
          <Select
            id="user-role"
            label="Rol"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            options={[
              { value: "CLIENT", label: "Cliente" },
              { value: "PROVIDER", label: "Proveedor" },
              { value: "ADMIN", label: "Administrador" },
            ]}
          />
          <Input
            id="user-phone"
            label="Teléfono"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+54 11 1234-5678"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.verified}
              onChange={(e) => setForm({ ...form, verified: e.target.checked })}
              className="rounded border-zinc-300 text-orange-600 focus:ring-orange-500"
            />
            Usuario verificado
          </label>

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Guardando..." : editingUser ? "Guardar Cambios" : "Crear Usuario"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
