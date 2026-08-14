import Link from "next/link"
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
  return (
    <section id="categorias" className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
      <div className="flex items-end justify-between mb-10 animate-fade-up">
        <div>
          <span className="text-xs font-semibold tracking-widest uppercase gradient-text-animated">Explorar</span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100 mt-1.5">
            Arrancá por rubro
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1.5 max-w-xl">
            Acceso directo a cada categoría. El hero queda para buscar, esta grilla para explorar.
          </p>
        </div>
        <Link
          href="/buscar"
          className="hidden sm:inline-flex text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
        >
          Ver todas &rarr;
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {CATEGORIAS.map((cat, i) => {
          const Icon = iconMap[cat.value] || Package
          const color = categoryColors[cat.value] || categoryColors.otros
          return (
            <Link
              key={cat.value}
              href={`/buscar?categoria=${cat.value}`}
              className={`group relative flex flex-col items-center gap-3 p-5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-stone-200/70 dark:border-zinc-700/50 hover:border-orange-200/80 hover:bg-orange-50/30 dark:hover:bg-zinc-700/50 transition-all duration-500 hover:shadow-[0_8px_32px_rgba(255,138,0,0.1)] active:scale-[0.97] animate-fade-up animate-fade-up-delay-${Math.min(i + 1, 6)}`}
            >
              <div
                className="h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg"
                style={{ backgroundColor: color.bg }}
              >
                <Icon className="h-5 w-5 transition-all duration-300 group-hover:text-orange-600" style={{ color: color.icon }} />
              </div>
              <span className="text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300 group-hover:text-orange-700 dark:group-hover:text-orange-400 text-center transition-colors duration-300">
                {cat.label}
              </span>
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-orange-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </Link>
          )
        })}
      </div>
      <div className="mt-6 text-center sm:hidden">
        <Link href="/buscar" className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors">
          Ver todas las categorías &rarr;
        </Link>
      </div>
    </section>
  )
}
