"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { ArrowLeft, FileText, Plus, X, Upload, File, Image, Loader2 } from "lucide-react"

interface ArchivoSubido {
  nombre: string
  url: string
  tipo: string
}

export default function SolicitarPresupuestoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const servicioId = searchParams.get("servicio")

  const [description, setDescription] = useState("")
  const [materiales, setMateriales] = useState<string[]>([""])
  const [archivos, setArchivos] = useState<ArchivoSubido[]>([])
  const [subiendo, setSubiendo] = useState(false)
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

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files?.length) return

    for (const file of Array.from(files)) {
      if (archivos.length >= 5) {
        setError("Máximo 5 archivos")
        break
      }
      setSubiendo(true)
      const formData = new FormData()
      formData.append("file", file)
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })
        if (!res.ok) {
          const err = await res.json()
          setError(err.error || "Error al subir archivo")
          continue
        }
        const data = await res.json()
        setArchivos((prev) => [...prev, { nombre: file.name, url: data.archivo, tipo: file.type }])
      } catch {
        setError("Error al subir archivo")
      } finally {
        setSubiendo(false)
      }
    }
    e.target.value = ""
  }

  function removeArchivo(i: number) {
    setArchivos(archivos.filter((_, idx) => idx !== i))
  }

  function isImage(tipo: string) {
    return tipo.startsWith("image/")
  }

  function fileName(nombre: string) {
    return nombre.length > 30 ? nombre.slice(0, 27) + "..." : nombre
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
        archivos: archivos.length > 0 ? JSON.stringify(archivos) : null,
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

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Archivos adjuntos
              </label>
              <p className="text-xs text-stone-400 mb-3">
                Opcional. Adjuntá imágenes, planos, presupuestos previos o documentos relevantes (máx. 5 archivos, 10MB c/u).
              </p>

              {archivos.length > 0 && (
                <div className="space-y-2 mb-3">
                  {archivos.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg bg-stone-50 border border-stone-200 p-2.5">
                      {isImage(a.tipo) ? (
                        <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 bg-stone-100">
                          <img src={a.url} alt={a.nombre} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                          <File className="h-5 w-5 text-blue-600" />
                        </div>
                      )}
                      <span className="text-sm text-stone-600 flex-1 truncate">{fileName(a.nombre)}</span>
                      <button type="button" onClick={() => removeArchivo(i)} className="p-1 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-stone-300 cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 transition-colors ${subiendo ? "opacity-50 pointer-events-none" : ""}`}>
                {subiendo ? (
                  <Loader2 className="h-5 w-5 text-stone-400 animate-spin" />
                ) : (
                  <Upload className="h-5 w-5 text-stone-400" />
                )}
                <span className="text-sm text-stone-500 font-medium">
                  {subiendo ? "Subiendo..." : "Hacé clic para adjuntar archivos"}
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={subiendo || archivos.length >= 5}
                />
              </label>
              {archivos.length >= 5 && (
                <p className="text-xs text-amber-600 mt-1">Máximo 5 archivos alcanzado</p>
              )}
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading || subiendo} className="w-full">
              {loading ? "Enviando..." : "Enviar solicitud de presupuesto"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
