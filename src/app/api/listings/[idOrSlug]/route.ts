import { NextResponse } from "next/server"
import { ListingStatus } from "@prisma/client"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PUBLIC_PROVIDER_SELECT } from "@/lib/auth-guard"
import {
  legacyServiceToListing,
  listingRowToListing,
  slugifyListing,
  type LegacyServiceRow,
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

interface Props {
  params: Promise<{ idOrSlug: string }>
}

export async function GET(_req: Request, { params }: Props) {
  const { idOrSlug } = await params
  const session = await auth()
  const isAdmin = session?.user?.role === "ADMIN"

  const listing = await prisma.listing.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    include: {
      category: true,
      provider: {
        select: providerSelect,
      },
      providerProfile: { select: providerProfileSelect },
      media: { orderBy: { sortOrder: "asc" } },
      service: true,
      product: true,
    },
  })

  if (listing) {
    const canSeeDraft = session?.user?.id === listing.providerId || isAdmin
    if (listing.status !== ListingStatus.PUBLISHED && !canSeeDraft) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 })
    }
    return NextResponse.json(listingRowToListing(listing as unknown as MarketplaceListingRow))
  }

  const serviceById = await prisma.servicio.findUnique({
    where: { id: idOrSlug },
    include: {
      usuario: {
        select: providerSelect,
      },
      fotos: { take: 3 },
      opiniones: { select: { puntuacion: true }, take: 5 },
      _count: { select: { opiniones: true } },
    },
  })

  if (serviceById) {
    if (!serviceById.activo && !(session?.user?.id === serviceById.usuario.id || isAdmin)) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 })
    }
    return NextResponse.json(legacyServiceToListing(serviceById as unknown as LegacyServiceRow))
  }

  const legacyServices = await prisma.servicio.findMany({
    where: { activo: true },
    include: {
      usuario: {
        select: providerSelect,
      },
      fotos: { take: 3 },
      opiniones: { select: { puntuacion: true }, take: 5 },
      _count: { select: { opiniones: true } },
    },
  })

  const legacyBySlug = legacyServices.find((service) => slugifyListing(service.titulo, service.id) === idOrSlug)
  if (legacyBySlug) {
    return NextResponse.json(legacyServiceToListing(legacyBySlug as unknown as LegacyServiceRow))
  }

  return NextResponse.json({ error: "No encontrado" }, { status: 404 })
}
