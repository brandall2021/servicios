"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { CATEGORIAS, PROVINCIAS_ARGENTINA } from "@/lib/constants"
import { Navigation, Upload, X } from "lucide-react"

export function NewServiceForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [gettingLocation, setGettingLocation] = useState(false)
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [photos, setPhotos] = useState<string[]>([])
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingPhoto(true)
    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (res.ok) {
      const data = await res.json()
      setPhotos((prev) => [...prev, data.archivo])
    }
    setUploadingPhoto(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

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
    if (photos.length > 0) data.fotos = photos

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
              className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium disabled:opacity-50"
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

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              Fotos del servicio
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {photos.map((photo, i) => (
                <div key={i} className="relative h-20 w-20 rounded-lg overflow-hidden border border-zinc-200">
                  <img src={photo} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              {uploadingPhoto ? "Subiendo..." : "Agregar foto"}
            </button>
          </div>

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
