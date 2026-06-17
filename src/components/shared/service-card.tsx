import Link from "next/link"
import { StarRating } from "./star-rating"
import { Avatar } from "../ui/avatar"
import { MapPin } from "lucide-react"
import type { ServicioWithRelations } from "@/types"
import { CATEGORIAS } from "@/lib/constants"

const catBadgeColors: Record<string, { bg: string; text: string; border: string }> = {
  hogar: { bg: "#d1fae5", text: "#065f46", border: "#a7f3d0" },
  tecnologia: { bg: "#dbeafe", text: "#1e40af", border: "#bfdbfe" },
  educacion: { bg: "#f3e8ff", text: "#6b21a8", border: "#e9d5ff" },
  transporte: { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  salud: { bg: "#fee2e2", text: "#991b1b", border: "#fecaca" },
  diseno: { bg: "#cffafe", text: "#155e75", border: "#a5f3fc" },
  jardineria: { bg: "#d1fae5", text: "#065f46", border: "#a7f3d0" },
  limpieza: { bg: "#cffafe", text: "#155e75", border: "#a5f3fc" },
  mecanica: { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  fotografia: { bg: "#f3e8ff", text: "#6b21a8", border: "#e9d5ff" },
  eventos: { bg: "#fee2e2", text: "#991b1b", border: "#fecaca" },
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
        {servicio.fotos[0] && (
          <div className="aspect-[16/9] overflow-hidden bg-stone-100 rounded-t-[18px]">
            <img
              src={servicio.fotos[0].archivo}
              alt={servicio.titulo}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{ backgroundColor: badgeColor.bg, color: badgeColor.text, border: `1px solid ${badgeColor.border}` }}
            >
              {catInfo?.icon} {catInfo?.label || servicio.categoria}
            </span>
          </div>
          <h3 className="font-semibold text-stone-900 transition-colors line-clamp-1">
            {servicio.titulo}
          </h3>
          <p className="text-sm text-stone-500 line-clamp-2 mt-1 mb-3">
            {servicio.descripcion}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar src={servicio.usuario.image} fallback={servicio.usuario.name} size="sm" />
              <span className="text-sm text-stone-600">{servicio.usuario.name}</span>
            </div>
            {avgRating > 0 && (
              <StarRating value={avgRating} size="sm" showValue count={servicio.opiniones.length} readonly />
            )}
          </div>
          <div className="flex items-center gap-1 mt-2 text-xs text-stone-400">
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
