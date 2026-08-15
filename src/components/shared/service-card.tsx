/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { StarRating } from "./star-rating"
import {
  MapPin,
  BadgeCheck,
  MessageSquare,
  ArrowUpRight,
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
  Clock3,
} from "lucide-react"
import type { ServicioWithRelations } from "@/types"
import { CATEGORIAS } from "@/lib/constants"
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

const catBadgeColors: Record<string, { bg: string; text: string; border: string }> = {
  materiales: { bg: "#d1fae5", text: "#065f46", border: "#a7f3d0" },
  iluminacion: { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  sanitarios: { bg: "#dbeafe", text: "#1e40af", border: "#bfdbfe" },
  pintura: { bg: "#f3e8ff", text: "#6b21a8", border: "#e9d5ff" },
  herramientas: { bg: "#fee2e2", text: "#991b1b", border: "#fecaca" },
  pisos: { bg: "#cffafe", text: "#155e75", border: "#a5f3fc" },
  techos: { bg: "#d1fae5", text: "#065f46", border: "#a7f3d0" },
  hierro: { bg: "#f5f5f4", text: "#44403c", border: "#e7e5e4" },
  electricidad: { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  jardineria: { bg: "#d1fae5", text: "#065f46", border: "#a7f3d0" },
  ferreteria: { bg: "#fee2e2", text: "#991b1b", border: "#fecaca" },
  otros: { bg: "#f5f5f4", text: "#44403c", border: "#e7e5e4" },
}

interface ServiceCardProps {
  servicio: ServicioWithRelations
  index?: number
}

export function ServiceCard({ servicio, index = 0 }: ServiceCardProps) {
  const catInfo = CATEGORIAS.find((c) => c.value === servicio.categoria)
  const CatIcon = iconMap[servicio.categoria] || Package
  const avgRating =
    servicio.opiniones.length > 0
      ? servicio.opiniones.reduce((a, o) => a + o.puntuacion, 0) / servicio.opiniones.length
      : 0

  const badgeColor = catBadgeColors[servicio.categoria] || catBadgeColors.otros
  const priceText = (servicio.precioTexto || "").trim()
  const priceTextLower = priceText.toLowerCase()
  const priceMode =
    priceTextLower.includes("cotiz")
      ? "A cotizar"
      : priceTextLower.includes("desde")
        ? "Desde"
        : priceTextLower.includes("unidad") || priceTextLower.includes("/u")
          ? "Por unidad"
          : servicio.precio
            ? "Precio fijo"
            : "Consultar"

  const priceValue = servicio.precio
    ? `$${servicio.precio.toLocaleString("es-AR")}`
    : priceText || "Consultá"

  return (
    <div className={`animate-fade-up animate-fade-up-delay-${Math.min(index + 1, 6)}`}>
      <Link href={`/servicios/${servicio.id}`} className="block group">
        <div className="card-premium">
          {servicio.fotos[0] ? (
            <div className="aspect-[4/3] overflow-hidden bg-stone-100 dark:bg-zinc-800 relative">
              <img
                src={servicio.fotos[0].archivo}
                alt={servicio.titulo}
                className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                <div className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <ArrowUpRight className="h-4 w-4 text-stone-700" />
                </div>
              </div>
            </div>
          ) : (
            <div className="aspect-[4/3] bg-gradient-to-br from-stone-100 via-orange-50 to-stone-200 dark:from-zinc-700 dark:via-zinc-800 dark:to-zinc-900 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_top,_rgba(255,138,0,0.15),_transparent_55%)]" />
              <div className="relative flex flex-col items-center gap-3 text-center px-6">
                <div className="h-14 w-14 rounded-2xl bg-white/90 dark:bg-zinc-900/80 border border-white/70 dark:border-zinc-700/60 shadow-sm flex items-center justify-center">
                  <CatIcon className="h-7 w-7 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">{catInfo?.label || servicio.categoria}</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">Sin foto de portada</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
            </div>
          )}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2.5">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap transition-colors duration-200"
                style={{ backgroundColor: badgeColor.bg, color: badgeColor.text, border: `1px solid ${badgeColor.border}` }}
              >
                <CatIcon className="h-3.5 w-3.5" /> {catInfo?.label || servicio.categoria}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                {servicio.distance !== null && servicio.distance !== undefined && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-100 dark:border-orange-800/30">
                    {servicio.distance < 1
                      ? `${Math.round(servicio.distance * 1000)}m`
                      : `${servicio.distance.toFixed(1)}km`}
                  </span>
                )}
              </div>
            </div>

            <h3 className="font-semibold text-stone-900 dark:text-stone-100 line-clamp-1 text-base mb-1.5 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-200">
              {servicio.titulo}
            </h3>

            <div className="flex items-center gap-1.5 mb-2.5 text-xs text-stone-500 dark:text-stone-400">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{servicio.ubicacion || servicio.usuario.zone || "Sin ubicación"}</span>
            </div>

            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm font-medium text-stone-600 dark:text-stone-300 truncate">
                    {servicio.usuario.name}
                  </span>
                  {servicio.usuario.verified && (
                    <BadgeCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400">
                  {servicio.usuario.trabajosRealizados > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 dark:bg-zinc-800 px-2 py-0.5">
                      {servicio.usuario.trabajosRealizados} trabajos
                    </span>
                  )}
                  {servicio.usuario.availability && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 dark:bg-zinc-800 px-2 py-0.5">
                      <Clock3 className="h-3 w-3" /> {servicio.usuario.availability}
                    </span>
                  )}
                </div>
              </div>
              {avgRating > 0 && (
                <StarRating value={avgRating} size="xs" showValue count={servicio.opiniones.length} readonly />
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-zinc-700/50">
              <div>
                <span className="block text-[11px] uppercase tracking-wider text-stone-500 dark:text-stone-400 font-semibold">
                  {priceMode}
                </span>
                <span className={`block text-lg font-bold ${servicio.precio ? "gradient-text-animated" : "text-stone-900 dark:text-stone-100"}`}>
                  {priceValue}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 dark:text-orange-400 group-hover:gap-2 transition-all duration-300">
                <MessageSquare className="h-3.5 w-3.5" />
                Contactar
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
