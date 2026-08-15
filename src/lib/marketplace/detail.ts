import { ListingStatus } from "@prisma/client"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PUBLIC_PROVIDER_SELECT } from "@/lib/auth-guard"
import {
  legacyServiceToListing,
  listingRowToListing,
  slugifyListing,
  type LegacyServiceRow,
  type MarketplaceListingDTO,
  type MarketplaceListingRow,
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

export async function getMarketplaceListingDetail(
  idOrSlug: string,
  sessionUserId?: string,
  isAdmin = false,
  options?: { includeInactive?: boolean }
): Promise<MarketplaceListingDTO | null> {
  const includeInactive = options?.includeInactive === true
  const listing = await prisma.listing.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    include: {
      category: true,
      provider: { select: providerSelect },
      providerProfile: { select: providerProfileSelect },
      media: { orderBy: { sortOrder: "asc" } },
      service: true,
      product: true,
    },
  })

  if (listing) {
    const canSeeDraft = sessionUserId === listing.providerId || isAdmin
    if (!includeInactive && listing.status !== ListingStatus.PUBLISHED && !canSeeDraft) return null
    return listingRowToListing(listing as unknown as MarketplaceListingRow)
  }

  const serviceById = await prisma.servicio.findUnique({
    where: { id: idOrSlug },
    include: {
      usuario: { select: providerSelect },
      fotos: { take: 3 },
      opiniones: { select: { puntuacion: true }, take: 5 },
      _count: { select: { opiniones: true } },
    },
  })

  if (serviceById) {
    if (!includeInactive && !serviceById.activo && !(sessionUserId === serviceById.usuario.id || isAdmin)) return null
    return legacyServiceToListing(serviceById as unknown as LegacyServiceRow)
  }

  const legacyServices = await prisma.servicio.findMany({
    where: { activo: true },
    include: {
      usuario: { select: providerSelect },
      fotos: { take: 3 },
      opiniones: { select: { puntuacion: true }, take: 5 },
      _count: { select: { opiniones: true } },
    },
  })

  const legacyBySlug = legacyServices.find((service) => slugifyListing(service.titulo, service.id) === idOrSlug)
  if (legacyBySlug) return legacyServiceToListing(legacyBySlug as unknown as LegacyServiceRow)

  return null
}

export async function getMarketplaceListingsByIds(
  ids: string[],
  sessionUserId?: string,
  isAdmin = false,
  options?: { includeInactive?: boolean }
) {
  const uniqueIds = [...new Set(ids.filter(Boolean))].slice(0, 4)
  const listings = await Promise.all(uniqueIds.map((id) => getMarketplaceListingDetail(id, sessionUserId, isAdmin, options)))
  return listings.filter((item): item is MarketplaceListingDTO => item !== null)
}

export async function getCurrentSessionIdentity() {
  const session = await auth()
  return {
    session,
    userId: session?.user?.id,
    isAdmin: session?.user?.role === "ADMIN",
  }
}
