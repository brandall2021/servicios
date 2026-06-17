"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { ArrowLeft, FileText, Plus, X } from "lucide-react"

export default function SolicitarPresupuestoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const servicioId = searchParams.get("servicio")

  const [description, setDescription] = useState("")
  const [materiales, setMateriales] = useState<string[]>([""])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function addMaterial() {
    setMateriales([...materiales, ""])
  }

  function removeMaterial(i: number) {
    if (materiales.length > 1) setMateriales(materiales.filter((_, idx) => idx !== i))
  }

  function updateMaterial(i: number, value: string) {
    const copy = [...materiales]
    copy[i] = value
    setMateriales(copy)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!servicioId) return
    setLoading(true)
    setError("")

    const filtered = materiales.filter((m) => m.trim())
    const res = await fetch("/api/presupuestos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        servicioId,
        description,
        materiales: filtered.length > 0 ? JSON.stringify(filtered) : null,
      }),
    })

    if (res.ok) {
      const data = await res.json()
      router.push(`/presupuestos/${data.id}`)
    } else {
      const err = await res.json()
      setError(err.error || "Error al enviar solicitud")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <Link href={servicioId ? `/servicios/${servicioId}` : "/"} className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Volver
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <CardTitle>Solicitar presupuesto</CardTitle>
              <CardDescription>
                Contale al proveedor qué necesitás y recibí una cotización personalizada
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Textarea
              id="description"
              label="Descripción del trabajo"
              placeholder="Describí en detalle lo que necesitas, alcance del trabajo, plazos, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Lista de materiales / requerimientos
              </label>
              <p className="text-xs text-stone-400 mb-3">
                Opcional. Agregá los materiales, insumos o requerimientos que necesitás que el proveedor considere.
              </p>
              <div className="space-y-2">
                {materiales.map((m, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      id={`material-${i}`}
                      value={m}
                      onChange={(e) => updateMaterial(i, e.target.value)}
                      placeholder={`Ítem ${i + 1}`}
                      className="flex-1"
                    />
                    {materiales.length > 1 && (
                      <button type="button" onClick={() => removeMaterial(i)} className="p-2 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={addMaterial} className="mt-2 flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors">
                <Plus className="h-4 w-4" /> Agregar ítem
              </button>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Enviando..." : "Enviar solicitud de presupuesto"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
