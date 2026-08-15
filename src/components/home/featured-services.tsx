import Link from "next/link"
import { Button } from "../ui/button"
import { MarketplaceCard } from "../shared/marketplace-card"
import { EmptyServicesState } from "./empty-services-state"
import type { MarketplaceListingDTO } from "@/lib/marketplace/listings"
import { ArrowRight } from "lucide-react"

interface FeaturedServicesProps {
  servicios: MarketplaceListingDTO[]
  favoriteIds?: string[]
}

export function FeaturedServices({ servicios, favoriteIds = [] }: FeaturedServicesProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <div className="flex items-end justify-between mb-10">
        <div>
          <span className="text-xs font-semibold tracking-widest uppercase gradient-text-animated">
            Destacados
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100 mt-1.5">
            Listados destacados
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1.5">Servicios y productos cerca de vos</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {servicios.length > 0 ? (
          servicios.map((s, i) => <MarketplaceCard key={s.id} listing={s} index={i} favoriteSaved={favoriteIds.includes(s.id)} />)
        ) : (
          <EmptyServicesState />
        )}
      </div>
      {servicios.length > 0 && (
        <div className="mt-8 text-center sm:hidden">
          <Link href="/buscar">
            <Button variant="outline" className="rounded-xl gap-1.5">
              Ver todo el marketplace
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      )}
    </section>
  )
}
