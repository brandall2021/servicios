"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { CATEGORIAS } from "@/lib/constants"

export function HeroSearch() {
  const router = useRouter()
  const [query, setQuery] = useState("")

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (q) {
      router.push(`/buscar?q=${encodeURIComponent(q)}`)
    } else {
      router.push("/buscar")
    }
  }

  return (
    <section className="relative overflow-hidden py-20 sm:py-28 lg:py-36 noise-overlay">
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #0B2A55 0%, #163B70 50%, #0F2F5A 100%)",
        }}
      />
      {/* Animated orbs */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-orange-400 blur-[100px] opacity-20 animate-float" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-blue-400 blur-[120px] opacity-15 animate-float" style={{ animationDelay: "-2s" }} />
      <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-orange-300 blur-[80px] opacity-10 animate-float" style={{ animationDelay: "-1s" }} />
      {/* Dot grid */}
      <div className="absolute inset-0 dot-pattern opacity-30" />
      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <div className="animate-fade-up">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-white/10 text-orange-300 border border-white/10 mb-6">
            Marketplace de servicios
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter text-white leading-[1.1] mb-4 animate-fade-up animate-fade-up-delay-1">
          Compará precios y encontrá
          <br />
          <span className="bg-gradient-to-r from-orange-400 via-orange-300 to-yellow-200 bg-clip-text text-transparent">
            los mejores servicios
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-8 animate-fade-up animate-fade-up-delay-2">
          Corralones &bull; Ferreterías &bull; Materiales &bull; Sanitarios &bull; Iluminación
        </p>
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto flex gap-2 animate-fade-up animate-fade-up-delay-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscá materiales, corralones, ferreterías..."
              className="w-full h-12 pl-11 pr-4 rounded-xl border-0 bg-white/95 backdrop-blur-sm text-stone-900 placeholder:text-zinc-400 text-base shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-shadow"
            />
          </div>
          <button
            type="submit"
            className="btn-orange h-12 px-6 text-base font-semibold shadow-lg"
          >
            Buscar
          </button>
        </form>
        <div className="flex flex-wrap justify-center gap-2 mt-6 animate-fade-up animate-fade-up-delay-4">
          {CATEGORIAS.slice(0, 6).map((cat) => (
            <button
              key={cat.value}
              onClick={() => router.push(`/buscar?categoria=${cat.value}`)}
              className="px-3 py-1.5 text-sm rounded-lg bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95"
            >
              {cat.icon} {cat.label}
            </button>
          ))}
          <button
            onClick={() => router.push("/buscar")}
            className="px-3 py-1.5 text-sm rounded-lg bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all duration-200"
          >
            + Ver todas
          </button>
        </div>
      </div>
    </section>
  )
}
