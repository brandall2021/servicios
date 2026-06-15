import Link from "next/link"
import { StarRating } from "./star-rating"
import { Avatar } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { Card, CardContent } from "../ui/card"
import { MapPin } from "lucide-react"
import type { ServicioWithRelations } from "@/types"
import { CATEGORIAS } from "@/lib/constants"

interface ServiceCardProps {
  servicio: ServicioWithRelations
}

export function ServiceCard({ servicio }: ServiceCardProps) {
  const catInfo = CATEGORIAS.find((c) => c.value === servicio.categoria)
  const avgRating =
    servicio.opiniones.length > 0
      ? servicio.opiniones.reduce((a, o) => a + o.puntuacion, 0) / servicio.opiniones.length
      : 0

  return (
    <Link href={`/servicios/${servicio.id}`}>
      <Card className="group hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 overflow-hidden">
        {servicio.fotos[0] && (
          <div className="aspect-[16/9] overflow-hidden bg-zinc-100">
            <img
              src={servicio.fotos[0].archivo}
              alt={servicio.titulo}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary">{catInfo?.icon} {catInfo?.label || servicio.categoria}</Badge>
          </div>
          <h3 className="font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {servicio.titulo}
          </h3>
          <p className="text-sm text-zinc-500 line-clamp-2 mt-1 mb-3">
            {servicio.descripcion}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar src={servicio.usuario.image} fallback={servicio.usuario.name} size="sm" />
              <span className="text-sm text-zinc-600">{servicio.usuario.name}</span>
            </div>
            {avgRating > 0 && (
              <StarRating value={avgRating} size="sm" showValue count={servicio.opiniones.length} readonly />
            )}
          </div>
          {servicio.ubicacion && (
            <div className="flex items-center gap-1 mt-2 text-xs text-zinc-400">
              <MapPin className="h-3 w-3" />
              {servicio.ubicacion}
            </div>
          )}
          {servicio.precio && (
            <div className="mt-2 text-lg font-bold text-blue-600">
              ${servicio.precio.toLocaleString("es-AR")}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
