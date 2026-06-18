import Link from "next/link"
import { StarRating } from "./star-rating"
import { Avatar } from "../ui/avatar"
import { MapPin } from "lucide-react"
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
}

export function ServiceCard({ servicio }: ServiceCardProps) {
  const catInfo = CATEGORIAS.find((c) => c.value === servicio.categoria)
  const avgRating =
    servicio.opiniones.length > 0
      ? servicio.opiniones.reduce((a, o) => a + o.puntuacion, 0) / servicio.opiniones.length
      : 0

  const badgeColor = catBadgeColors[servicio.categoria] || catBadgeColors.otros

  return (
    <Link href={`/servicios/${servicio.id}`}>
      <div className="card-service overflow-hidden">
        {servicio.fotos[0] ? (
          <div className="aspect-[4/3] overflow-hidden bg-stone-100">
            <img
              src={servicio.fotos[0].archivo}
              alt={servicio.titulo}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        ) : (
          <div className="aspect-[4/3] bg-gradient-to-br from-stone-100 to-stone-200 dark:from-zinc-700 dark:to-zinc-800 flex items-center justify-center">
            <span className="text-4xl">{catInfo?.icon || "📦"}</span>
          </div>
        )}
        <div className="p-4">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium mb-2"
            style={{ backgroundColor: badgeColor.bg, color: badgeColor.text, border: `1px solid ${badgeColor.border}` }}
          >
            {catInfo?.icon} {catInfo?.label || servicio.categoria}
          </span>
          <h3 className="font-semibold text-stone-900 dark:text-stone-100 line-clamp-1">
            {servicio.titulo}
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-2 mt-1 mb-3">
            {servicio.descripcion}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar src={servicio.usuario.image} fallback={servicio.usuario.name} size="sm" />
              <span className="text-sm text-stone-600 dark:text-stone-400">{servicio.usuario.name}</span>
            </div>
            {avgRating > 0 && (
              <StarRating value={avgRating} size="sm" showValue count={servicio.opiniones.length} readonly />
            )}
          </div>
          <div className="flex items-center gap-1 mt-2 text-xs text-stone-400 dark:text-stone-500">
            <MapPin className="h-3 w-3" />
            {servicio.ubicacion || "Ubicación no especificada"}
            {servicio.distance !== null && servicio.distance !== undefined && (
              <span className="ml-auto font-medium" style={{ color: "#FF8A00" }}>
                {servicio.distance < 1
                  ? `${Math.round(servicio.distance * 1000)}m`
                  : `${servicio.distance.toFixed(1)}km`}
              </span>
            )}
          </div>
          {servicio.precio && (
            <div className="mt-2 text-lg font-bold" style={{ color: "#FF8A00" }}>
              ${servicio.precio.toLocaleString("es-AR")}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
