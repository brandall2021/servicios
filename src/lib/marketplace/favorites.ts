import { FavoriteType } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { getMarketplaceListingDetail } from "@/lib/marketplace/detail"

export interface FavoriteProviderDTO {
  id: string
  name: string
  image: string | null
  description: string | null
  zone: string | null
  rubro: string | null
  verified: boolean
  avgRating: number
  whatsapp: string | null
  trabajosRealizados: number
  _count: { servicios: number; opiniones: number }
}

export interface FavoriteEntryDTO {
  id: string
  type: FavoriteType
  createdAt: string
  listing: Awaited<ReturnType<typeof getMarketplaceListingDetail>>
  provider: FavoriteProviderDTO | null
}

export async function getFavoriteCounts(userId: string) {
  const rows = await prisma.favorite.groupBy({
    by: ["type"],
    where: { userId },
    _count: { _all: true },
  })

  return rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.type] = row._count._all
    return acc
  }, {})
}

async function getFavoriteProvider(providerId: string): Promise<FavoriteProviderDTO | null> {
  const provider = await prisma.user.findUnique({
    where: { id: providerId },
    select: {
      id: true,
      name: true,
      image: true,
      description: true,
      zone: true,
      rubro: true,
      verified: true,
      whatsapp: true,
      trabajosRealizados: true,
      _count: { select: { servicios: true, opiniones: true } },
    },
  })

  if (!provider) return null

  const rating = await prisma.opinion.aggregate({
    where: { servicio: { usuarioId: providerId } },
    _avg: { puntuacion: true },
  })

  return {
    ...provider,
    avgRating: rating._avg.puntuacion || 0,
  }
}

export async function getFavoriteEntries(userId: string, type?: FavoriteType) {
  const rows = await prisma.favorite.findMany({
    where: { userId, ...(type ? { type } : {}) },
    orderBy: { createdAt: "desc" },
  })

  const listingRows = rows.filter((row) => row.listingId)
  const providerRows = rows.filter((row) => row.providerId)

  const [listings, providers] = await Promise.all([
    Promise.all(listingRows.map((row) => getMarketplaceListingDetail(row.listingId || "", userId, false, { includeInactive: true }))),
    Promise.all(providerRows.map((row) => getFavoriteProvider(row.providerId || ""))),
  ])

  const listingMap = new Map(listingRows.map((row, index) => [row.id, listings[index] || null]))
  const providerMap = new Map(providerRows.map((row, index) => [row.id, providers[index] || null]))

  return rows.map<FavoriteEntryDTO>((row) => ({
    id: row.id,
    type: row.type,
    createdAt: row.createdAt.toISOString(),
    listing: row.listingId ? listingMap.get(row.id) || null : null,
    provider: row.providerId ? providerMap.get(row.id) || null : null,
  }))
}

export async function resolveFavoriteTarget(type: FavoriteType, targetId: string) {
  if (type === FavoriteType.PROVIDER) {
    const provider = await getFavoriteProvider(targetId)
    return provider
  }

  return await getMarketplaceListingDetail(targetId, undefined, false, { includeInactive: true })
}
