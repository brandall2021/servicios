"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Pencil, AlertTriangle, Star } from "lucide-react"

interface Opinion {
  id: string
  puntuacion: number
  comentario: string | null
  createdAt: Date
  cliente: { id: string; name: string }
  servicio: { id: string; titulo: string }
  _count: { reportes: number }
}

export function AdminOpinionesList({ opiniones }: { opiniones: Opinion[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [editModal, setEditModal] = useState(false)
  const [editingOpinion, setEditingOpinion] = useState<Opinion | null>(null)
  const [editComentario, setEditComentario] = useState("")
  const [editPuntuacion, setEditPuntuacion] = useState(0)
  const [saving, setSaving] = useState(false)

  function openEdit(o: Opinion) {
    setEditingOpinion(o)
    setEditComentario(o.comentario || "")
    setEditPuntuacion(o.puntuacion)
    setEditModal(true)
  }

  async function handleSave() {
    if (!editingOpinion) return
    setSaving(true)
    await fetch(`/api/admin/opiniones/${editingOpinion.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        comentario: editComentario,
        puntuacion: editPuntuacion,
      }),
    })
    setSaving(false)
    setEditModal(false)
    router.refresh()
  }

  async function deleteOpinion(opinionId: string) {
    if (!confirm("¿Eliminar esta opinión? Esta acción no se puede deshacer.")) return
    setLoading(opinionId)
    await fetch(`/api/admin/opiniones/${opinionId}`, { method: "DELETE" })
    setLoading(null)
    router.refresh()
  }

  return (
    <>
      <div className="space-y-3">
        {opiniones.length === 0 ? (
          <div className="text-center py-12 text-zinc-400">
            <Star className="h-12 w-12 mx-auto mb-3" />
            <p>No hay opiniones</p>
          </div>
        ) : (
          opiniones.map((o) => (
            <div
              key={o.id}
              className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100 text-sm">
                      {o.cliente.name}
                    </span>
                    <span className="text-xs text-zinc-400">
                      en {o.servicio.titulo}
                    </span>
                    {o._count.reportes > 0 && (
                      <Badge variant="destructive" className="text-[10px]">
                        <AlertTriangle className="h-3 w-3 mr-0.5" />
                        {o._count.reportes} reporte{o._count.reportes !== 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < o.puntuacion
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-zinc-300 dark:text-zinc-600"
                        }`}
                      />
                    ))}
                    <span className="text-xs text-zinc-400 ml-1">
                      {new Date(o.createdAt).toLocaleDateString("es-AR")}
                    </span>
                  </div>
                  {o.comentario && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                      &ldquo;{o.comentario}&rdquo;
                    </p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(o)}
                    disabled={loading === o.id}
                    className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-blue-600"
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteOpinion(o.id)}
                    disabled={loading === o.id}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-500 hover:text-red-700"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        open={editModal}
        onClose={() => setEditModal(false)}
        title="Editar Opinión"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Puntuación
            </label>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setEditPuntuacion(i + 1)}
                  className="p-1"
                >
                  <Star
                    className={`h-6 w-6 ${
                      i < editPuntuacion
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-zinc-300 dark:text-zinc-600"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <Textarea
            id="edit-comentario"
            label="Comentario"
            value={editComentario}
            onChange={(e) => setEditComentario(e.target.value)}
            rows={4}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setEditModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
