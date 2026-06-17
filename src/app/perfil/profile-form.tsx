"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { PROVINCIAS_ARGENTINA } from "@/lib/constants"

interface ProfileFormProps {
  user: {
    id: string
    name: string
    email: string
    phone: string | null
    description: string | null
    experience: string | null
    certifications: string | null
    zone: string | null
    availability: string | null
    whatsapp: string | null
    role: string
  }
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const formData = new FormData(e.currentTarget)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: Record<string, any> = {}
    formData.forEach((value, key) => {
      data[key] = value
    })

    const res = await fetch("/api/usuarios/perfil", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      setMessage("Perfil actualizado")
      router.refresh()
    } else {
      setMessage("Error al actualizar")
    }
    setLoading(false)
  }

  const isProvider = user.role === "PROVIDER"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="name"
          name="name"
          label="Nombre"
          defaultValue={user.name}
          required
        />
        <Input
          id="phone"
          name="phone"
          label="Teléfono"
          defaultValue={user.phone || ""}
        />
      </div>

      {isProvider && (
        <>
          <Textarea
            id="description"
            name="description"
            label="Descripción profesional"
            defaultValue={user.description || ""}
            rows={3}
          />
          <Textarea
            id="experience"
            name="experience"
            label="Experiencia"
            defaultValue={user.experience || ""}
            rows={3}
          />
          <Textarea
            id="certifications"
            name="certifications"
            label="Certificaciones"
            defaultValue={user.certifications || ""}
            rows={3}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              id="zone"
              name="zone"
              label="Zona de trabajo"
              options={PROVINCIAS_ARGENTINA.map((p) => ({ value: p, label: p }))}
              placeholder="Seleccionar provincia"
              defaultValue={user.zone || ""}
            />
            <Input
              id="availability"
              name="availability"
              label="Disponibilidad"
              defaultValue={user.availability || ""}
              placeholder="Ej: Lunes a viernes 9-18hs"
            />
          </div>
          <Input
            id="whatsapp"
            name="whatsapp"
            label="WhatsApp"
            defaultValue={user.whatsapp || ""}
            placeholder="Ej: +54 11 2345-6789"
          />
        </>
      )}

      {message && (
        <div
          className={`rounded-lg p-3 text-sm ${
            message === "Perfil actualizado"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  )
}
