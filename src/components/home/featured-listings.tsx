import Link from "next/link"
import { Button } from "../ui/button"
import { MarketplaceCard } from "../shared/marketplace-card"
import { EmptyServicesState } from "./empty-services-state"
import type { MarketplaceListingDTO } from "@/lib/marketplace/listings"
import { ArrowRight } from "lucide-react"

interface FeaturedListingsProps {
  servicios: MarketplaceListingDTO[]
  favoriteIds?: string[]
}

export function FeaturedListings({ servicios, favoriteIds = [] }: FeaturedListingsProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <div className="rounded-[32px] border border-stone-200/70 bg-white/90 p-5 sm:p-7 shadow-[0_12px_40px_rgba(3,15,37,0.05)] dark:border-zinc-800 dark:bg-zinc-900/55">
        <div className="flex items-end justify-between gap-6 mb-8">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold tracking-widest uppercase gradient-text-animated">
              Destacados
            </span>
            <h2 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Listados destacados
            </h2>
            <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">Servicios y productos cerca de vos, listos para comparar.</p>
          </div>
          <Link href="/buscar" className="hidden sm:inline-flex shrink-0 items-center gap-2 rounded-full border border-stone-200/70 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:border-orange-200 hover:text-orange-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-200 dark:hover:border-orange-800 dark:hover:text-orange-300">
            Explorar todo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
      </div>
    </section>
  )
}
