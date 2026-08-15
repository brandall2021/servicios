import Link from "next/link"
import { Clock3, MapPin, MessageSquare } from "lucide-react"
import { StarRating } from "./star-rating"
import { CATEGORIAS } from "@/lib/constants"
import type { MarketplaceListingDTO } from "@/lib/marketplace/listings"
import { FavoriteToggleButton } from "./favorite-toggle-button"
import { CompareToggleButton } from "./compare-toggle-button"
import { ListingMedia } from "./listing-media"
import { MarketplacePrice } from "./marketplace-price"

interface MarketplaceCardProps {
  listing: MarketplaceListingDTO
  index?: number
  favoriteSaved?: boolean
}

export function MarketplaceCard({ listing, index = 0, favoriteSaved = false }: MarketplaceCardProps) {
  const catInfo = CATEGORIAS.find((cat) => cat.value === listing.category.id) || CATEGORIAS.find((cat) => cat.value === listing.category.slug)
  const href = listing.type === "SERVICE" ? `/servicios/${listing.id}` : `/listings/${listing.slug}`
  return (
    <div className={`animate-fade-up animate-fade-up-delay-${Math.min(index + 1, 6)}`}>
      <div className="card-premium relative">
        <div className="absolute top-3 right-3 z-20 flex gap-2">
          <FavoriteToggleButton
            type="LISTING"
            targetId={listing.id}
            initialSaved={favoriteSaved}
            returnTo={href}
            compact
            className="h-8 w-8 justify-center rounded-full border-white/70 bg-white/90 px-0 text-stone-700 shadow-sm backdrop-blur-sm"
          />
          <CompareToggleButton
            id={listing.id}
            type={listing.type}
            providerId={listing.provider.id}
            compact
            className="h-8 w-8 justify-center rounded-full border-white/70 bg-white/90 px-0 text-stone-700 shadow-sm backdrop-blur-sm"
          />
        </div>

        <Link href={href} className="group block">
          <ListingMedia
            src={listing.media[0]?.archivo}
            alt={listing.title}
            type={listing.type}
            categoryLabel={catInfo?.label || listing.category.name}
            featured={listing.featured}
            className="aspect-[4/3]"
          />

          <div className="p-4">
            <h3 className="font-semibold text-stone-900 dark:text-stone-100 line-clamp-1 text-base mb-1.5 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-200">
              {listing.title}
            </h3>

            <div className="flex items-center gap-1.5 mb-2.5 text-xs text-stone-500 dark:text-stone-400">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{listing.locationText || listing.city || listing.provider.zone || "Sin ubicación"}</span>
            </div>

            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm font-medium text-stone-600 dark:text-stone-300 truncate">
                    {listing.provider.tradeName || listing.provider.name}
                  </span>
                  {listing.provider.verified ? <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">Verificado</span> : <span className="inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-500 dark:bg-zinc-800 dark:text-stone-400">Sin verificar</span>}
                  {listing.featured ? <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-semibold text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">Destacado</span> : <span className="inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-500 dark:bg-zinc-800 dark:text-stone-400">Estándar</span>}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400">
                  {listing.provider.trabajosRealizados > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 dark:bg-zinc-800 px-2 py-0.5">
                      {listing.provider.trabajosRealizados} trabajos
                    </span>
                  )}
                  {listing.provider.responseTimeMinutes && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 dark:bg-zinc-800 px-2 py-0.5">
                      <Clock3 className="h-3 w-3" /> {listing.provider.responseTimeMinutes} min
                    </span>
                  )}
                </div>
              </div>
              {listing.ratingCount > 0 && (
                <StarRating value={listing.ratingAverage} size="xs" showValue count={listing.ratingCount} readonly />
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-zinc-700/50">
              <div>
                <MarketplacePrice priceType={listing.priceType} price={listing.price} currency={listing.currency} priceUnit={listing.priceUnit} className="text-lg" />
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 dark:text-orange-400 group-hover:gap-2 transition-all duration-300">
                <MessageSquare className="h-3.5 w-3.5" />
                {listing.type === "SERVICE" ? "Ver" : "Proveedor"}
              </span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
