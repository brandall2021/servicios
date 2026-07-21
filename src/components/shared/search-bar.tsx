"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, MapPin, ArrowRight } from "lucide-react"
import { CATEGORIAS } from "@/lib/constants"

export function SearchBar() {
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

  return (
    <form onSubmit={handleSearch} className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)] border border-stone-200/70 dark:border-zinc-700/50 p-2">
        <div className="flex-1 flex items-center gap-2.5 px-3">
          <Search className="h-4.5 w-4.5 text-stone-400 shrink-0" />
          <input
            type="text"
            placeholder="¿Qué servicio necesitas?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 h-10 bg-transparent outline-none text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
          />
        </div>
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="h-10 px-3 border border-stone-200/70 dark:border-zinc-700/50 rounded-xl text-sm bg-stone-50 dark:bg-zinc-800 text-stone-600 dark:text-stone-400 outline-none focus:border-orange-500 transition-colors"
        >
          <option value="">Todas las categorías</option>
          {CATEGORIAS.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.icon} {cat.label}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2 px-3 border border-stone-200/70 dark:border-zinc-700/50 rounded-xl bg-stone-50 dark:bg-zinc-800">
          <MapPin className="h-4 w-4 text-stone-400 shrink-0" />
          <input
            type="text"
            placeholder="Ubicación"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            className="h-10 bg-transparent outline-none text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 w-28"
          />
        </div>
        <button
          type="submit"
          className="h-10 px-6 btn-glow rounded-xl text-sm font-medium text-white flex items-center gap-2 group"
        >
          Buscar
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </button>
      </div>
    </form>
  )
}
