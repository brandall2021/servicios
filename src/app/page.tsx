import { HeroSearch } from "@/components/home/hero-search"
import { CategoryGrid } from "@/components/home/category-grid"
import { FeaturedServices } from "@/components/home/featured-services"
import { TrustMetrics } from "@/components/home/trust-metrics"
import { CompareTray } from "@/components/shared/compare-tray"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { searchMarketplaceListings } from "@/lib/marketplace/search"
import type { MarketplaceListingDTO } from "@/lib/marketplace/listings"

async function getDestacados(): Promise<MarketplaceListingDTO[]> {
  const { items } = await searchMarketplaceListings({
    type: "ALL",
    q: "",
    category: "",
    province: "",
    city: "",
    minPrice: null,
    maxPrice: null,
    priceType: "ALL",
    verified: null,
    sort: "relevance",
    cursor: null,
    limit: 6,
  })
  return items
}

export default async function HomePage() {
  const session = await auth()
  const [servicios] = await Promise.all([
    getDestacados(),
  ]) as [MarketplaceListingDTO[]]

  const favoriteIds = session?.user
    ? await prisma.favorite.findMany({
        where: { userId: session.user.id, listingId: { not: null } },
        select: { listingId: true },
      }).then((rows) => rows.map((row) => row.listingId).filter((id): id is string => Boolean(id)))
    : []

  return (
    <div>
      <HeroSearch featuredListings={servicios.slice(0, 3)} />
      <CategoryGrid />
      <FeaturedServices servicios={servicios} favoriteIds={favoriteIds} />
      <TrustMetrics />
      <CompareTray />
    </div>
  )
}
