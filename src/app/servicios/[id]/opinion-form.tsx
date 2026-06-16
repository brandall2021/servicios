"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { StarRating } from "@/components/shared/star-rating"
import { Recaptcha } from "@/components/shared/recaptcha"

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
      body: JSON.stringify({ servicioId, puntuacion, comentario, recaptchaToken }),
    })

    if (res.ok) {
      setPuntuacion(0)
      setComentario("")
      setRecaptchaToken(null)
      setRecaptchaError(false)
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
