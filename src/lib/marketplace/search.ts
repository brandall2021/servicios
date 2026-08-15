import { ListingStatus, ListingType, PriceType } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { PUBLIC_PROVIDER_SELECT } from "@/lib/auth-guard"
import {
  legacyServiceToListing,
  listingRowToListing,
  type LegacyServiceRow,
  type MarketplaceFilters,
  type MarketplaceListingDTO,
  type MarketplaceListingRow,
  type MarketplaceSort,
} from "@/lib/marketplace/listings"

const providerProfileSelect = {
  kind: true,
  tradeName: true,
  verificationStatus: true,
  responseTimeMinutes: true,
  province: true,
  city: true,
} as const

const providerSelect = {
  ...PUBLIC_PROVIDER_SELECT,
  providerProfile: { select: providerProfileSelect },
} as const

function parseType(value: string | null | undefined): ListingType | "ALL" {
  if (value === "SERVICE" || value === "PRODUCT") return value
  return "ALL"
}

function parsePriceType(value: string | null | undefined): PriceType | "ALL" {
  if (value === "FIXED" || value === "FROM" || value === "PER_UNIT" || value === "QUOTE") return value
  return "ALL"
}

function parseSort(value: string | null | undefined): MarketplaceSort {
  if (value === "newest" || value === "price_asc" || value === "price_desc" || value === "rating" || value === "relevance") {
    return value
  }
  return "relevance"
}

function parseBoolean(value: string | null | undefined) {
  if (value === null || value === undefined) return null
  if (value === "true") return true
  if (value === "false") return false
  return null
}

function includesText(source: string | null | undefined, query: string) {
  if (!query) return true
  return (source || "").toLowerCase().includes(query.toLowerCase())
}

function matchesCategory(listing: MarketplaceListingDTO, category: string) {
  if (!category) return true
  const normalized = category.toLowerCase()
  return [listing.category.id, listing.category.slug, listing.category.name]
    .filter(Boolean)
    .some((value) => (value || "").toLowerCase() === normalized || (value || "").toLowerCase().includes(normalized))
}

function matchesProvinceCity(listing: MarketplaceListingDTO, province: string, city: string) {
  if (province && !includesText(listing.province, province) && !includesText(listing.provider.zone, province)) return false
  if (city && !includesText(listing.city, city) && !includesText(listing.locationText, city)) return false
  return true
}

function matchesQuery(listing: MarketplaceListingDTO, q: string) {
  if (!q) return true
  return [
    listing.title,
    listing.description,
    listing.category.name,
    listing.provider.name,
    listing.provider.tradeName,
    listing.provider.zone,
    listing.locationText,
    listing.priceUnit,
    listing.product?.brand,
    listing.product?.sku,
    listing.service?.availabilityText,
    listing.service?.includesText,
    listing.service?.excludesText,
    listing.product?.deliveryText,
  ].some((value) => includesText(value, q))
}

function matchesPrice(listing: MarketplaceListingDTO, filters: MarketplaceFilters) {
  if (filters.minPrice !== null && (listing.price === null || listing.price < filters.minPrice)) return false
  if (filters.maxPrice !== null && (listing.price === null || listing.price > filters.maxPrice)) return false
  if (filters.priceType !== "ALL" && listing.priceType !== filters.priceType) return false
  return true
}

function matchesType(listing: MarketplaceListingDTO, type: MarketplaceFilters["type"]) {
  return type === "ALL" || listing.type === type
}

function matchesVerified(listing: MarketplaceListingDTO, verified: boolean | null) {
  if (verified === null) return true
  return listing.provider.verified === verified
}

function compareListings(a: MarketplaceListingDTO, b: MarketplaceListingDTO, sort: MarketplaceSort) {
  if (sort === "price_asc") return (a.price ?? Number.POSITIVE_INFINITY) - (b.price ?? Number.POSITIVE_INFINITY)
  if (sort === "price_desc") return (b.price ?? Number.NEGATIVE_INFINITY) - (a.price ?? Number.NEGATIVE_INFINITY)
  if (sort === "rating") return (b.ratingAverage - a.ratingAverage) || (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  if (sort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  return (
    Number(b.featured) - Number(a.featured)
    || (b.ratingAverage - a.ratingAverage)
    || (b.ratingCount - a.ratingCount)
    || (new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime())
  )
}

function applyCursor(items: MarketplaceListingDTO[], cursor: string | null | undefined) {
  if (!cursor) return items
  const index = items.findIndex((item) => item.id === cursor || item.slug === cursor)
  if (index < 0) return items
  return items.slice(index + 1)
}

function normalizeFilters(input: Omit<Partial<MarketplaceFilters>, "limit"> & { limit?: number | null }): MarketplaceFilters {
  return {
    type: input.type ?? "ALL",
    q: (input.q ?? "").trim(),
    category: (input.category ?? "").trim(),
    province: (input.province ?? "").trim(),
    city: (input.city ?? "").trim(),
    minPrice: input.minPrice ?? null,
    maxPrice: input.maxPrice ?? null,
    priceType: input.priceType ?? "ALL",
    verified: input.verified ?? null,
    sort: input.sort ?? "relevance",
    cursor: input.cursor ?? null,
    limit: input.limit === null ? Number.POSITIVE_INFINITY : input.limit ?? 24,
  }
}

export function parseMarketplaceFilters(searchParams: URLSearchParams): MarketplaceFilters {
  return normalizeFilters({
    type: parseType(searchParams.get("type")),
    q: searchParams.get("q") || "",
    category: searchParams.get("category") || "",
    province: searchParams.get("province") || "",
    city: searchParams.get("city") || "",
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : null,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null,
    priceType: parsePriceType(searchParams.get("priceType")),
    verified: parseBoolean(searchParams.get("verified")),
    sort: parseSort(searchParams.get("sort")),
    cursor: searchParams.get("cursor") || null,
    limit: Math.min(48, Math.max(1, Number(searchParams.get("limit") || "24"))),
  })
}

export async function searchMarketplaceListings(input: Omit<Partial<MarketplaceFilters>, "limit"> & { limit?: number | null } = {}) {
  const filters = normalizeFilters(input)

  const [legacyServices, productListings] = await Promise.all([
    filters.type === "PRODUCT"
      ? Promise.resolve([] as LegacyServiceRow[])
      : prisma.servicio.findMany({
          where: { activo: true },
          include: {
            usuario: {
              select: providerSelect,
            },
            fotos: { take: 3 },
            opiniones: { select: { puntuacion: true }, take: 5 },
            _count: { select: { opiniones: true } },
          },
          orderBy: { createdAt: "desc" },
        }) as unknown as Promise<LegacyServiceRow[]>,
    filters.type === "SERVICE"
      ? Promise.resolve([] as MarketplaceListingRow[])
      : prisma.listing.findMany({
          where: { type: ListingType.PRODUCT, status: ListingStatus.PUBLISHED },
          include: {
            category: true,
            provider: {
              select: providerSelect,
            },
            providerProfile: { select: providerProfileSelect },
            media: { orderBy: { sortOrder: "asc" }, take: 3 },
            service: true,
            product: true,
          },
          orderBy: { createdAt: "desc" },
        }) as unknown as Promise<MarketplaceListingRow[]>,
  ])

  const listings = [
    ...legacyServices.map((service) => legacyServiceToListing(service)),
    ...productListings.map((listing) => listingRowToListing(listing)),
  ]

  const filtered = listings.filter((listing) => {
    if (!matchesType(listing, filters.type)) return false
    if (!matchesQuery(listing, filters.q)) return false
    if (!matchesCategory(listing, filters.category)) return false
    if (!matchesProvinceCity(listing, filters.province, filters.city)) return false
    if (!matchesPrice(listing, filters)) return false
    if (!matchesVerified(listing, filters.verified)) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => compareListings(a, b, filters.sort))
  const withCursor = applyCursor(sorted, filters.cursor)
  const items = Number.isFinite(filters.limit) ? withCursor.slice(0, filters.limit) : withCursor
  const nextCursor = Number.isFinite(filters.limit) && withCursor.length > filters.limit ? items[items.length - 1]?.id || null : null

  return {
    items,
    nextCursor,
    total: filtered.length,
    filters,
  }
}
