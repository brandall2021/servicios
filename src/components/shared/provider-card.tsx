import Link from "next/link"
import { StarRating } from "./star-rating"
import { Avatar } from "../ui/avatar"
import { Card, CardContent } from "../ui/card"
import { MapPin, ShieldCheck } from "lucide-react"

interface ProviderCardProps {
  provider: {
    id: string
    name: string
    image: string | null
    description: string | null
    zone: string | null
    verified: boolean
    avgRating: number
    _count: { servicios: number; opiniones: number }
  }
}

export function ProviderCard({ provider }: ProviderCardProps) {
  return (
    <Link href={`/proveedores/${provider.id}`}>
      <Card className="group hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <Avatar src={provider.image} fallback={provider.name} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-zinc-900 group-hover:text-emerald-600 transition-colors truncate">
                  {provider.name}
                </h3>
                {provider.verified && (
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                )}
              </div>
              {provider.avgRating > 0 && (
                <StarRating value={provider.avgRating} size="sm" showValue count={provider._count.opiniones} readonly />
              )}
              {provider.description && (
                <p className="text-sm text-zinc-500 line-clamp-2 mt-1">
                  {provider.description}
                </p>
              )}
              <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400">
                {provider.zone && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {provider.zone}
                  </span>
                )}
                <span>{provider._count.servicios} servicios</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
