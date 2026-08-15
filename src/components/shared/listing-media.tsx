import Image from "next/image"
import { Package, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ListingType } from "@prisma/client"

interface ListingMediaProps {
  src?: string | null
  alt: string
  type: ListingType
  categoryLabel?: string | null
  featured?: boolean
  className?: string
}

export function ListingMedia({ src, alt, type, categoryLabel, featured, className }: ListingMediaProps) {
  const fallbackIcon = type === ListingType.PRODUCT ? <Package className="h-9 w-9" /> : <Sparkles className="h-9 w-9" />

  if (src) {
    return (
      <div className={cn("relative overflow-hidden bg-stone-100 dark:bg-zinc-800", className)}>
        <Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 z-10 flex gap-2">
          <Badge variant="secondary" className="backdrop-blur-sm bg-white/85 text-stone-700 border-white/60">
            {type === ListingType.PRODUCT ? "Producto" : "Servicio"}
          </Badge>
          {featured && <Badge className="backdrop-blur-sm bg-orange-600/90 text-white border-orange-500/50">Destacado</Badge>}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden bg-gradient-to-br from-stone-100 via-orange-50 to-stone-200 dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-950", className)}>
      <div className="absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_top,_rgba(255,138,0,0.15),_transparent_55%)]" />
      <div className="absolute top-3 left-3 z-10 flex gap-2">
        <Badge variant="secondary" className="backdrop-blur-sm bg-white/85 text-stone-700 border-white/60">
          {type === ListingType.PRODUCT ? "Producto" : "Servicio"}
        </Badge>
        {featured && <Badge className="backdrop-blur-sm bg-orange-600/90 text-white border-orange-500/50">Destacado</Badge>}
      </div>
      <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
        <div className="space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/90 dark:bg-zinc-900/80 border border-white/70 dark:border-zinc-700/60 text-stone-700 dark:text-stone-200 shadow-sm">
            {fallbackIcon}
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">{categoryLabel || alt}</p>
            <p className="text-xs text-stone-500 dark:text-stone-400">Sin imagen disponible</p>
          </div>
        </div>
      </div>
    </div>
  )
}
