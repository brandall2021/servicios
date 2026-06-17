"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { StarRating } from "@/components/shared/star-rating"
import { Recaptcha } from "@/components/shared/recaptcha"
import { Upload, X } from "lucide-react"

interface OpinionFormProps {
  servicioId: string
}

export function OpinionForm({ servicioId }: OpinionFormProps) {
  const router = useRouter()
  const [puntuacion, setPuntuacion] = useState(0)
  const [comentario, setComentario] = useState("")
  const [loading, setLoading] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const [recaptchaError, setRecaptchaError] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingPhoto(true)
    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch("/api/upload", { method: "POST", body: formData })
    if (res.ok) {
      const data = await res.json()
      setPhotos((prev) => [...prev, data.archivo])
    }
    setUploadingPhoto(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (puntuacion === 0) return

    if (!recaptchaToken) {
      setRecaptchaError(true)
      return
    }

    setLoading(true)

    const res = await fetch("/api/opiniones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ servicioId, puntuacion, comentario, recaptchaToken, fotos: photos.length > 0 ? photos : undefined }),
    })

    if (res.ok) {
      setPuntuacion(0)
      setComentario("")
      setRecaptchaToken(null)
      setRecaptchaError(false)
      setPhotos([])
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm text-zinc-600 mb-2">Tu calificación</p>
        <StarRating value={puntuacion} onChange={setPuntuacion} size="lg" />
      </div>
      <Textarea
        id="comentario"
        placeholder="Contá tu experiencia..."
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        rows={3}
      />
      <div className="flex flex-wrap gap-2">
        {photos.map((photo, i) => (
          <div key={i} className="relative h-16 w-16 rounded-lg overflow-hidden border border-zinc-200">
            <img src={photo} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
              className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
            >
              <X className="h-2.5 w-2.5" />
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
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingPhoto}
          className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          {uploadingPhoto ? "Subiendo..." : "Agregar foto"}
        </button>
      </div>
      <Recaptcha onChange={(token) => { setRecaptchaToken(token); setRecaptchaError(false) }} />
      {recaptchaError && (
        <p className="text-sm text-red-600">Completá el captcha para continuar</p>
      )}
      <Button type="submit" disabled={loading || puntuacion === 0}>
        {loading ? "Enviando..." : "Publicar opinión"}
      </Button>
    </form>
  )
}
