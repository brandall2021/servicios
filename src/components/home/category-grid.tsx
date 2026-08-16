"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { CATEGORIAS } from "@/lib/constants"
import {
  BrickWall,
  Lightbulb,
  ShowerHead,
  Palette,
  Wrench,
  Square,
  Home,
  GripVertical,
  Zap,
  Sprout,
  Nut,
  Package,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useState } from "react"

const iconMap: Record<string, LucideIcon> = {
  materiales: BrickWall,
  iluminacion: Lightbulb,
  sanitarios: ShowerHead,
  pintura: Palette,
  herramientas: Wrench,
  pisos: Square,
  techos: Home,
  hierro: GripVertical,
  electricidad: Zap,
  jardineria: Sprout,
  ferreteria: Nut,
  otros: Package,
}

const categoryColors: Record<string, { bg: string; icon: string }> = {
  materiales: { bg: "#d1fae5", icon: "#059669" },
  iluminacion: { bg: "#fef3c7", icon: "#d97706" },
  sanitarios: { bg: "#dbeafe", icon: "#2563eb" },
  pintura: { bg: "#f3e8ff", icon: "#9333ea" },
  herramientas: { bg: "#fee2e2", icon: "#dc2626" },
  pisos: { bg: "#cffafe", icon: "#0891b2" },
  techos: { bg: "#d1fae5", icon: "#059669" },
  hierro: { bg: "#f5f5f4", icon: "#78716c" },
  electricidad: { bg: "#fef3c7", icon: "#d97706" },
  jardineria: { bg: "#d1fae5", icon: "#059669" },
  ferreteria: { bg: "#fee2e2", icon: "#dc2626" },
  otros: { bg: "#f5f5f4", icon: "#78716c" },
}

export function CategoryGrid() {
  const [type, setType] = useState<"SERVICE" | "PRODUCT">("SERVICE")
  const typeParam = (t: "SERVICE" | "PRODUCT") => `?type=${t}`

  return (
    <section id="categorias" className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
      <div className="rounded-[32px] border border-stone-200/70 bg-stone-50/85 p-5 sm:p-7 dark:border-zinc-800 dark:bg-zinc-900/55">
        <div className="flex items-end justify-between gap-6 mb-8 animate-fade-up">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold tracking-widest uppercase gradient-text-animated">Explorar</span>
            <h2 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Arrancá por rubro
            </h2>
            <p className="mt-1.5 text-sm text-stone-600 dark:text-stone-400 max-w-xl">
              Entrá por categoría y filtrá rápido lo que necesitás sin perder contexto.
            </p>
          </div>
          <div className="hidden sm:flex shrink-0 items-center gap-2">
            <div className="inline-flex h-10 items-center gap-0.5 rounded-full border border-stone-200/70 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-950">
              {(["SERVICE", "PRODUCT"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  aria-pressed={type === t}
                  className={`h-8 rounded-full px-4 text-sm font-semibold transition-all duration-200 ${
                    type === t
                      ? "bg-[#0B2A55] text-white shadow-sm"
                      : "text-stone-600 hover:text-stone-900 hover:bg-stone-100 dark:text-stone-300 dark:hover:text-white dark:hover:bg-zinc-800"
                  }`}
                >
                  {t === "SERVICE" ? "Servicios" : "Productos"}
                </button>
              ))}
            </div>
            <Link href={`/buscar${typeParam(type)}`} className="inline-flex shrink-0 items-center gap-2 rounded-full border border-stone-200/70 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:border-orange-200 hover:text-orange-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-200 dark:hover:border-orange-800 dark:hover:text-orange-300">
              Ver todo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {CATEGORIAS.map((cat, i) => {
          const Icon = iconMap[cat.value] || Package
          const color = categoryColors[cat.value] || categoryColors.otros
          return (
            <Link
              key={cat.value}
              href={`/buscar${typeParam(type)}&categoria=${cat.value}`}
              className={`group card-premium relative flex flex-col items-center gap-3 p-5 bg-white dark:bg-zinc-900/90 hover:border-orange-200/80 hover:bg-orange-50/30 dark:hover:bg-zinc-800/70 transition-all duration-500 active:scale-[0.98] animate-fade-up animate-fade-up-delay-${Math.min(i + 1, 6)}`}
            >
              <div
                className="h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg"
                style={{ backgroundColor: color.bg }}
              >
                <Icon className="h-5 w-5 transition-all duration-300 group-hover:text-orange-600" style={{ color: color.icon }} />
              </div>
              <span className="text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200 group-hover:text-orange-700 dark:group-hover:text-orange-300 text-center transition-colors duration-300">
                {cat.label}
              </span>
              <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                Explorar
              </span>
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-orange-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </Link>
          )
        })}
        </div>

        <div className="mt-6 flex flex-col items-center gap-3 sm:hidden">
          <div className="inline-flex h-10 items-center gap-0.5 rounded-full border border-stone-200/70 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-950">
            {(["SERVICE", "PRODUCT"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                aria-pressed={type === t}
                className={`h-8 rounded-full px-4 text-sm font-semibold transition-all duration-200 ${
                  type === t
                    ? "bg-[#0B2A55] text-white shadow-sm"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100 dark:text-stone-300 dark:hover:text-white dark:hover:bg-zinc-800"
                }`}
              >
                {t === "SERVICE" ? "Servicios" : "Productos"}
              </button>
            ))}
          </div>
          <Link href={`/buscar${typeParam(type)}`} className="inline-flex items-center gap-2 rounded-full border border-stone-200/70 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:border-orange-200 hover:text-orange-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-200 dark:hover:border-orange-800 dark:hover:text-orange-300">
            Ver todo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
