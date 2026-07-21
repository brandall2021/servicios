import Link from "next/link"
import { StarRating } from "./star-rating"
import { MapPin, BadgeCheck, MessageSquare, ArrowUpRight } from "lucide-react"
import type { ServicioWithRelations } from "@/types"
import { CATEGORIAS } from "@/lib/constants"

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
  const avgRating =
    servicio.opiniones.length > 0
      ? servicio.opiniones.reduce((a, o) => a + o.puntuacion, 0) / servicio.opiniones.length
      : 0

  const badgeColor = catBadgeColors[servicio.categoria] || catBadgeColors.otros

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
            <div className="aspect-[4/3] bg-gradient-to-br from-stone-100 to-stone-200 dark:from-zinc-700 dark:to-zinc-800 flex items-center justify-center relative overflow-hidden">
              <span className="text-5xl transition-transform duration-500 group-hover:scale-110">{catInfo?.icon || "📦"}</span>
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
            </div>
          )}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2.5">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap transition-colors duration-200"
                style={{ backgroundColor: badgeColor.bg, color: badgeColor.text, border: `1px solid ${badgeColor.border}` }}
              >
                {catInfo?.icon} {catInfo?.label || servicio.categoria}
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
              <span className="truncate">{servicio.ubicacion || "Sin ubicación"}</span>
            </div>

            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm font-medium text-stone-500 dark:text-stone-400 truncate">
                  {servicio.usuario.name}
                </span>
                {servicio.usuario.verified && (
                  <BadgeCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                )}
              </div>
              {avgRating > 0 && (
                <StarRating value={avgRating} size="xs" showValue count={servicio.opiniones.length} readonly />
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-zinc-700/50">
              {servicio.precio ? (
                <span className="text-lg font-bold gradient-text-animated">
                  ${servicio.precio.toLocaleString("es-AR")}
                </span>
              ) : (
                <span className="text-sm font-medium text-zinc-400">Consultar precio</span>
              )}
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
