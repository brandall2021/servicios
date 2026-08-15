import { FavoriteType } from "@prisma/client"
import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getFavoriteCounts, getFavoriteEntries, resolveFavoriteTarget, type FavoriteProviderDTO } from "@/lib/marketplace/favorites"
import { logCommercialEvent } from "@/lib/commercial-events"
import type { MarketplaceListingDTO } from "@/lib/marketplace/listings"

const bodySchema = z.object({
  type: z.enum(["LISTING", "PROVIDER"]),
  targetId: z.string().min(1),
})

function favoriteWhere(type: FavoriteType, userId: string, targetId: string) {
  return type === FavoriteType.PROVIDER
    ? { userId_providerId: { userId, providerId: targetId } }
    : { userId_listingId: { userId, listingId: targetId } }
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const searchParams = new URL(req.url).searchParams
  const type = searchParams.get("type")
  const filterType = type === "LISTING" || type === "PROVIDER" ? type : undefined

  const [items, counts] = await Promise.all([
    getFavoriteEntries(session.user.id, filterType as FavoriteType | undefined),
    getFavoriteCounts(session.user.id),
  ])

  return NextResponse.json({ items, counts })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const parsed = bodySchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const type = parsed.data.type as FavoriteType
  const target = await resolveFavoriteTarget(type, parsed.data.targetId)
  if (!target) return NextResponse.json({ error: "Destino no encontrado" }, { status: 404 })

  if (type === FavoriteType.PROVIDER) {
    const providerTarget = target as FavoriteProviderDTO
    if (providerTarget.id === session.user.id) return NextResponse.json({ error: "No podés guardar tu propio perfil" }, { status: 400 })
  } else {
    const listingTarget = target as MarketplaceListingDTO
    if (listingTarget.provider.id === session.user.id) {
    return NextResponse.json({ error: "No podés guardar tu propia publicación" }, { status: 400 })
    }
  }

  const existing = await prisma.favorite.findFirst({
    where: type === FavoriteType.PROVIDER
      ? { userId: session.user.id, providerId: parsed.data.targetId }
      : { userId: session.user.id, listingId: parsed.data.targetId },
  })

  if (existing) return NextResponse.json({ favorite: existing, created: false })

  const favorite = await prisma.favorite.create({
    data: type === FavoriteType.PROVIDER
      ? { userId: session.user.id, type, providerId: parsed.data.targetId }
      : { userId: session.user.id, type, listingId: parsed.data.targetId },
  })

  await logCommercialEvent({
    type: "FAVORITE_ADDED",
    userId: session.user.id,
    sessionId: session.user.id,
    providerId: type === FavoriteType.PROVIDER ? parsed.data.targetId : (target as MarketplaceListingDTO).provider.id,
    listingId: type === FavoriteType.PROVIDER ? null : (target as MarketplaceListingDTO).id,
    metadata: { favoriteType: type },
  })

  return NextResponse.json({ favorite, created: true }, { status: 201 })
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const searchParams = new URL(req.url).searchParams
  const type = searchParams.get("type")
  const targetId = searchParams.get("targetId")
  if ((type !== "LISTING" && type !== "PROVIDER") || !targetId) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }

  const favoriteType = type as FavoriteType
  const favorite = await prisma.favorite.findFirst({
    where: favoriteType === FavoriteType.PROVIDER
      ? { userId: session.user.id, providerId: targetId }
      : { userId: session.user.id, listingId: targetId },
  })

  if (!favorite) return NextResponse.json({ success: true })

  await prisma.favorite.delete({ where: { id: favorite.id } })

  await logCommercialEvent({
    type: "FAVORITE_REMOVED",
    userId: session.user.id,
    sessionId: session.user.id,
    providerId: favorite.providerId,
    listingId: favorite.listingId,
    metadata: { favoriteType: favoriteType },
  })

  return NextResponse.json({ success: true })
}
