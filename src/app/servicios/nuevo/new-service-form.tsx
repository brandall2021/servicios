"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { CATEGORIAS, PROVINCIAS_ARGENTINA } from "@/lib/constants"
import { MapPin, Navigation } from "lucide-react"

export function NewServiceForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [gettingLocation, setGettingLocation] = useState(false)
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: Record<string, any> = {}
    formData.forEach((value, key) => {
      data[key] = value
    })

    if (data.precio) data.precio = parseFloat(data.precio)

    const res = await fetch("/api/servicios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    const result = await res.json()

    if (!res.ok) {
      setError(result.error || "Error al crear el servicio")
      setLoading(false)
      return
    }

    router.push(`/servicios/${result.id}`)
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <input type="hidden" name="lat" value={locationCoords?.lat ?? ""} />
          <input type="hidden" name="lng" value={locationCoords?.lng ?? ""} />
          <Input
            id="titulo"
            name="titulo"
            label="Título del servicio"
            placeholder="Ej: Reparación de equipos Split"
            required
          />

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              Descripción
            </label>
            <Textarea
              id="descripcion"
              name="descripcion"
              placeholder="Describí en detalle el servicio que ofrecés..."
              required
              rows={5}
            />
          </div>

          <Select
            id="categoria"
            name="categoria"
            label="Categoría"
            options={CATEGORIAS.map((c) => ({ value: c.value, label: `${c.icon} ${c.label}` }))}
            placeholder="Seleccionar categoría"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="precio"
              name="precio"
              type="number"
              label="Precio ($)"
              placeholder="Ej: 15000"
              min="0"
              step="0.01"
            />
            <Input
              id="precioTexto"
              name="precioTexto"
              label="Texto de precio (opcional)"
              placeholder="Ej: Presupuesto personalizado"
            />
          </div>

          <div className="space-y-2">
            <Select
              id="ubicacion"
              name="ubicacion"
              label="Ubicación"
              options={PROVINCIAS_ARGENTINA.map((p) => ({ value: p, label: p }))}
              placeholder="Seleccionar provincia"
            />
            <button
              type="button"
              onClick={() => {
                setGettingLocation(true)
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    setLocationCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
                    setGettingLocation(false)
                  },
                    () => { setGettingLocation(false) },
                  { enableHighAccuracy: true }
                )
              }}
              disabled={gettingLocation}
              className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium disabled:opacity-50"
            >
              <Navigation className="h-4 w-4" />
              {gettingLocation ? "Obteniendo ubicación..." : locationCoords ? "Ubicación obtenida ✓" : "Usar ubicación actual"}
            </button>
          </div>

          <Input
            id="disponibilidad"
            name="disponibilidad"
            label="Disponibilidad"
            placeholder="Ej: Lunes a viernes 9-18hs"
          />

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Publicando..." : "Publicar servicio"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
