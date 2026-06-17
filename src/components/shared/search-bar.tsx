"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, MapPin } from "lucide-react"
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
      <div className="flex flex-col sm:flex-row gap-2 bg-white rounded-xl shadow-lg border border-zinc-200 p-2">
        <div className="flex-1 flex items-center gap-2 px-3">
          <Search className="h-5 w-5 text-zinc-400 shrink-0" />
          <input
            type="text"
            placeholder="¿Qué servicio necesitas?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 h-10 bg-transparent outline-none text-sm text-zinc-900 placeholder:text-zinc-400"
          />
        </div>
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="h-10 px-3 border border-zinc-200 rounded-lg text-sm bg-white text-zinc-600 outline-none focus:border-emerald-500"
        >
          <option value="">Todas las categorías</option>
          {CATEGORIAS.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.icon} {cat.label}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2 px-3 border border-zinc-200 rounded-lg">
          <MapPin className="h-5 w-5 text-zinc-400 shrink-0" />
          <input
            type="text"
            placeholder="Ubicación"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            className="h-10 bg-transparent outline-none text-sm text-zinc-900 placeholder:text-zinc-400 w-28"
          />
        </div>
        <button
          type="submit"
          className="h-10 px-6 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          Buscar
        </button>
      </div>
    </form>
  )
}
