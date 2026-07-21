"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Search, ArrowRight } from "lucide-react"
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
    <section className="relative overflow-hidden py-24 sm:py-32 lg:py-44 noise-overlay">
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #0B2A55 0%, #163B70 40%, #0F2F5A 100%)",
        }}
      />
      {/* Animated orbs */}
      <div className="absolute top-20 left-[10%] w-[500px] h-[500px] rounded-full bg-orange-400/20 blur-[120px] animate-float" />
      <div className="absolute bottom-10 right-[5%] w-[600px] h-[600px] rounded-full bg-blue-400/15 blur-[140px] animate-float" style={{ animationDelay: "-2s" }} />
      <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-orange-300/10 blur-[100px] animate-float" style={{ animationDelay: "-1s" }} />
      {/* Dot grid */}
      <div className="absolute inset-0 dot-pattern opacity-30" />
      {/* Content - left aligned asymmetric */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-white/10 text-orange-300 border border-white/10 backdrop-blur-sm mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
              Marketplace de servicios
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter text-white leading-[1.08] mb-5 animate-fade-up animate-fade-up-delay-1">
            Compará precios y encontrá
            <br />
            <span className="gradient-text-animated">
              los mejores servicios
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-white/60 max-w-xl mb-10 animate-fade-up animate-fade-up-delay-2 leading-relaxed">
            Corralones, ferreterías, materiales y más. Conectá con proveedores verificados cerca tuyo.
          </p>
          <form onSubmit={handleSubmit} className="max-w-xl flex gap-3 animate-fade-up animate-fade-up-delay-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscá materiales, corralones, ferreterías..."
                className="w-full h-13 pl-12 pr-4 rounded-2xl border-0 bg-white/95 backdrop-blur-sm text-stone-900 placeholder:text-zinc-400 text-base shadow-[0_8px_32px_rgba(0,0,0,0.12)] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:shadow-[0_8px_32px_rgba(255,138,0,0.15)] transition-all duration-300"
              />
            </div>
            <button
              type="submit"
              className="btn-glow h-13 px-7 text-base font-semibold shadow-[0_8px_24px_rgba(255,138,0,0.3)] active:scale-[0.97] inline-flex items-center gap-2"
            >
              <span className="relative z-10 flex items-center gap-2">
                Buscar
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>
          </form>
          <div className="flex flex-wrap gap-2 mt-7 animate-fade-up animate-fade-up-delay-4">
            {CATEGORIAS.slice(0, 6).map((cat) => (
              <button
                key={cat.value}
                onClick={() => router.push(`/buscar?categoria=${cat.value}`)}
                className="px-3.5 py-1.5 text-sm rounded-xl bg-white/8 text-white/70 hover:bg-white/15 hover:text-white border border-white/5 hover:border-white/15 transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-sm"
              >
                {cat.icon} {cat.label}
              </button>
            ))}
            <button
              onClick={() => router.push("/buscar")}
              className="px-3.5 py-1.5 text-sm rounded-xl bg-white/8 text-white/70 hover:bg-white/15 hover:text-white border border-white/5 hover:border-white/15 transition-all duration-300 backdrop-blur-sm"
            >
              + Ver todas
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
