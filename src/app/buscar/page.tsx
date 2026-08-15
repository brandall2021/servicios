import { MarketplaceCard } from "@/components/shared/marketplace-card"
import { SearchBar } from "@/components/shared/search-bar"
import { Pagination } from "@/components/shared/pagination"
import { CATEGORIAS } from "@/lib/constants"
import { SortSelect } from "./sort-select"
import { CategoryChips } from "./category-chips"
import { FilterSidebar, RadioSelect } from "./filter-sidebar"
import { searchMarketplaceListings } from "@/lib/marketplace/search"
import type { MarketplaceListingDTO } from "@/lib/marketplace/listings"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CompareTray } from "@/components/shared/compare-tray"
import { logCommercialEvent } from "@/lib/commercial-events"

interface Props {
  searchParams: Promise<{ q?: string; categoria?: string; ubicacion?: string; lat?: string; lng?: string; radio?: string; sort?: string; verificado?: string; punt_min?: string; precio_min?: string; precio_max?: string; proveedor?: string; page?: string; type?: string }>
}

function toRadians(value: number) {
  return (value * Math.PI) / 180
}

function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const r = 6371
  const dLat = toRadians(bLat - aLat)
  const dLng = toRadians(bLng - aLng)
  const lat1 = toRadians(aLat)
  const lat2 = toRadians(bLat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return 2 * r * Math.asin(Math.min(1, Math.sqrt(h)))
}

type ListingWithDistance = MarketplaceListingDTO & { distance: number | null }

function applyLocalFilters(listings: MarketplaceListingDTO[], params: Awaited<Props["searchParams"]>): ListingWithDistance[] {
  const lat = params.lat ? parseFloat(params.lat) : null
  const lng = params.lng ? parseFloat(params.lng) : null
  const radio = params.radio ? parseFloat(params.radio) : null
  const puntMin = params.punt_min ? parseFloat(params.punt_min) : null
  const precioMin = params.precio_min ? parseFloat(params.precio_min) : null
  const precioMax = params.precio_max ? parseFloat(params.precio_max) : null
  const hasCoords = lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng) && radio !== null && !isNaN(radio)

  let result: ListingWithDistance[] = listings.map((listing) => ({ ...listing, distance: null }))

  if (puntMin !== null) {
    result = result.filter((listing) => listing.ratingAverage >= puntMin)
  }

  if (precioMin !== null || precioMax !== null) {
    result = result.filter((listing) => {
      if (precioMin !== null && (listing.price === null || listing.price < precioMin)) return false
      if (precioMax !== null && (listing.price === null || listing.price > precioMax)) return false
      return true
    })
  }

  if (params.proveedor) {
    const needle = params.proveedor.toLowerCase()
    result = result.filter((listing) =>
      [listing.provider.name, listing.provider.tradeName].some((value) => (value || "").toLowerCase().includes(needle))
    )
  }

  if (hasCoords && lat !== null && lng !== null && radio !== null) {
    result = result
      .map((listing) => {
        const itemLat = listing.latitude
        const itemLng = listing.longitude
        if (itemLat === null || itemLng === null) return { ...listing, distance: null }
        return { ...listing, distance: distanceKm(lat, lng, itemLat, itemLng) }
      })
      .filter((listing) => listing.distance === null || listing.distance <= radio)
      .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
  }

  if (params.sort === "rating") {
    result = [...result].sort((a, b) => b.ratingAverage - a.ratingAverage)
  }

  return result
}

export default async function BuscarPage({ searchParams }: Props) {
  const params = await searchParams
  const session = await auth()
  const type = params.type === "SERVICE" || params.type === "PRODUCT" ? params.type : "ALL"
  const favoriteIds = session?.user
    ? await prisma.favorite.findMany({
        where: { userId: session.user.id, listingId: { not: null } },
        select: { listingId: true },
      }).then((rows) => rows.map((row) => row.listingId).filter((id): id is string => Boolean(id)))
    : []
  const { items } = await searchMarketplaceListings({
    type,
    q: params.q || "",
    category: params.categoria || "",
    province: params.ubicacion || "",
    city: params.ubicacion || "",
    minPrice: params.precio_min ? Number(params.precio_min) : null,
    maxPrice: params.precio_max ? Number(params.precio_max) : null,
    priceType: "ALL",
    verified: params.verificado === "true" ? true : params.verificado === "false" ? false : null,
    sort: (params.sort === "precio_asc" ? "price_asc" : params.sort === "precio_desc" ? "price_desc" : params.sort === "rating" ? "rating" : params.sort === "newest" ? "newest" : "relevance"),
    cursor: null,
    limit: null,
  })
  const servicios = applyLocalFilters(items, params)

  if (session?.user && (params.q || params.categoria || params.ubicacion)) {
    await logCommercialEvent({
      type: "SEARCH_PERFORMED",
      userId: session.user.id,
      sessionId: session.user.id,
      metadata: {
        q: params.q || "",
        categoria: params.categoria || "",
        ubicacion: params.ubicacion || "",
        type,
      },
    })
  }
  const page = Math.max(1, parseInt(params.page || "1"))
  const pageSize = 12
  const total = servicios.length
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(page, pages)
  const pagedServicios = servicios.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const selectedCategoria = params.categoria || ""
  const resultLabel = type === "SERVICE" ? "servicio" : type === "PRODUCT" ? "producto" : "listado"

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-stone-50 mb-4">
          {params.q ? `Resultados para "${params.q}"` : "Buscar servicios y productos"}
        </h1>
        <SearchBar />
      </div>

      <CategoryChips
        categorias={CATEGORIAS}
        selected={selectedCategoria}
      />

      <div className="flex gap-6 mt-6">
        <FilterSidebar
          verificado={params.verificado || ""}
          puntMin={params.punt_min || ""}
          precioMin={params.precio_min || ""}
          precioMax={params.precio_max || ""}
          proveedor={params.proveedor || ""}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {servicios.length} {servicios.length === 1 ? `${resultLabel} encontrado` : `${resultLabel}s encontrados`}
              {params.lat && params.lng && " (ordenados por cercanía)"}
            </p>
            <div className="flex items-center gap-2">
              {params.lat && params.lng && (
                <RadioSelect radio={params.radio || "50"} />
              )}
              <SortSelect />
            </div>
          </div>
          {pagedServicios.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {pagedServicios.map((s, i) => (
                <MarketplaceCard key={s.id} listing={s} index={i} favoriteSaved={favoriteIds.includes(s.id)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 animate-fade-in">
              <div className="h-16 w-16 rounded-2xl bg-stone-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔍</span>
              </div>
              <p className="text-stone-700 dark:text-stone-300 font-semibold text-lg mb-1">No encontramos {resultLabel}s</p>
              <p className="text-stone-500 dark:text-stone-400 text-sm">Probá con otros términos de búsqueda, tipo o categoría</p>
            </div>
          )}

          {total > pageSize && (
            <Pagination page={currentPage} pages={pages} total={total} label={`${resultLabel}s`} />
          )}
        </div>
      </div>
      <CompareTray />
    </div>
  )
}
