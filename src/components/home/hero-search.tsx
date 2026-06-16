"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, MapPin, Sparkles, BadgeCheck, Star, Shield } from "lucide-react"
import { CATEGORIAS } from "@/lib/constants"

const quickExamples = [
  { label: "Reparación de aire acondicionado", categoria: "hogar" },
  { label: "Diseño de logo profesional", categoria: "diseno" },
  { label: "Clases de inglés online", categoria: "educacion" },
  { label: "Electricista matriculado", categoria: "hogar" },
]

export function HeroSearch() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [categoria, setCategoria] = useState("")
  const [ubicacion, setUbicacion] = useState("")

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set("q", query)
    if (categoria) params.set("categoria", categoria)
    if (ubicacion) params.set("ubicacion", ubicacion)
    router.push(`/buscar?${params.toString()}`)
  }

  function handleQuickSearch(term: string, cat: string) {
    const params = new URLSearchParams()
    params.set("q", term)
    if (cat) params.set("categoria", cat)
    router.push(`/buscar?${params.toString()}`)
  }

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/60 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-100/30 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-32">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-medium text-emerald-800 mb-6 ring-1 ring-emerald-200/50">
            <Sparkles className="h-3 w-3" />
            Conectamos clientes con profesionales verificados en Argentina
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter text-stone-900 leading-[1.08] mb-5">
            Encontrá el profesional
            <br />
            <span className="text-emerald-600">que necesitás</span>
          </h1>

          <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl mb-8">
            Buscá servicios cerca de tu ubicación, compará opiniones reales y contratá con confianza.
          </p>

          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex flex-col sm:flex-row gap-2 bg-white rounded-2xl shadow-[0_4px_24px_rgba(28,25,23,0.06)] border border-stone-200/70 p-2">
              <div className="flex-1 flex items-center gap-2.5 px-4">
                <Search className="h-5 w-5 text-stone-400 shrink-0" />
                <input
                  type="text"
                  placeholder="¿Qué servicio estás buscando?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 h-11 bg-transparent outline-none text-sm text-stone-900 placeholder:text-stone-400"
                />
              </div>
              <div className="flex items-center gap-2 px-3 border-t sm:border-t-0 sm:border-l border-stone-200">
                <MapPin className="h-5 w-5 text-stone-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Ubicación"
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  className="h-11 bg-transparent outline-none text-sm text-stone-900 placeholder:text-stone-400 w-28 sm:w-24"
                />
              </div>
              <button
                type="submit"
                className="h-11 px-6 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 active:scale-[0.98] transition-all duration-200 shadow-sm flex items-center justify-center gap-2"
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Buscar</span>
              </button>
            </div>
          </form>

          <div className="flex flex-wrap items-center gap-2 mb-8">
            <span className="text-xs text-stone-500 font-medium">Popular:</span>
            {quickExamples.map((ex) => (
              <button
                key={ex.label}
                onClick={() => handleQuickSearch(ex.label, ex.categoria)}
                className="text-xs text-stone-600 bg-stone-100/80 hover:bg-stone-200/80 hover:text-stone-900 rounded-full px-3 py-1.5 transition-all duration-200 ring-1 ring-stone-200/60"
              >
                {ex.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs text-stone-500">
            <span className="flex items-center gap-1.5">
              <BadgeCheck className="h-4 w-4 text-emerald-600" />
              Profesionales verificados
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-amber-500" />
              Opiniones reales
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-emerald-600" />
              Contratá seguro
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
