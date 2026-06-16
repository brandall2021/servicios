import Link from "next/link"
import { CATEGORIAS } from "@/lib/constants"
import {
  Home,
  Monitor,
  BookOpen,
  Car,
  HeartPulse,
  Palette,
  Sprout,
  Sparkles,
  Wrench,
  Camera,
  PartyPopper,
  Package,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

const iconMap: Record<string, LucideIcon> = {
  hogar: Home,
  tecnologia: Monitor,
  educacion: BookOpen,
  transporte: Car,
  salud: HeartPulse,
  diseno: Palette,
  jardineria: Sprout,
  limpieza: Sparkles,
  mecanica: Wrench,
  fotografia: Camera,
  eventos: PartyPopper,
  otros: Package,
}

export function CategoryGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="text-xs font-semibold tracking-widest text-emerald-600 uppercase">Categorías</span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 mt-1">
            ¿Qué necesitás?
          </h2>
        </div>
        <Link
          href="/buscar"
          className="hidden sm:inline-flex text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          Ver todas &rarr;
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {CATEGORIAS.map((cat) => {
          const Icon = iconMap[cat.value] || Package
          return (
            <Link
              key={cat.value}
              href={`/buscar?categoria=${cat.value}`}
              className="group flex flex-col items-center gap-3 p-5 rounded-xl bg-white border border-stone-200/70 hover:border-emerald-200/80 hover:bg-emerald-50/40 transition-all duration-200 hover:shadow-[0_4px_16px_rgba(5,150,105,0.08)] active:scale-[0.98]"
            >
              <div className="h-10 w-10 rounded-xl bg-stone-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors duration-200">
                <Icon className="h-5 w-5 text-stone-500 group-hover:text-emerald-600 transition-colors duration-200" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-stone-700 group-hover:text-emerald-700 text-center transition-colors duration-200">
                {cat.label}
              </span>
            </Link>
          )
        })}
      </div>
      <div className="mt-6 text-center sm:hidden">
        <Link href="/buscar" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
          Ver todas las categorías &rarr;
        </Link>
      </div>
    </section>
  )
}
