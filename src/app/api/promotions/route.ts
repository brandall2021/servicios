import { PromotionType, ListingStatus, ListingType, Prisma } from "@prisma/client"
import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isValidPercentage, normalizeCode } from "@/lib/marketplace/promotions"

const schema = z.object({
  listingId: z.string().optional().nullable(),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "PROMOTIONAL_PRICE", "BENEFIT"]),
  name: z.string().min(1).max(120),
  code: z.string().max(40).optional().nullable(),
  value: z.union([z.string(), z.number()]).optional().nullable(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  usageLimit: z.number().int().positive().optional().nullable(),
  perUserLimit: z.number().int().positive().optional().nullable(),
  terms: z.string().max(2000).optional().nullable(),
})

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const searchParams = new URL(req.url).searchParams
  const providerId = searchParams.get("providerId") || session.user.id

  const promotions = await prisma.promotion.findMany({
    where: { providerId },
    include: { listing: { select: { id: true, title: true, slug: true, status: true } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(promotions)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const startsAt = new Date(parsed.data.startsAt)
  const endsAt = new Date(parsed.data.endsAt)
  if (startsAt >= endsAt) return NextResponse.json({ error: "Fechas inválidas" }, { status: 400 })

  const listingId = parsed.data.listingId || null
  if (listingId) {
    const listing = await prisma.listing.findFirst({ where: { id: listingId, providerId: session.user.id, status: ListingStatus.PUBLISHED } })
    if (!listing) return NextResponse.json({ error: "La publicación no está disponible" }, { status: 404 })
  }

  let value: Prisma.Decimal | null = null
  if (parsed.data.value !== undefined && parsed.data.value !== null) {
    value = new Prisma.Decimal(String(parsed.data.value))
  }

  if (parsed.data.type === PromotionType.PERCENTAGE && (!value || !isValidPercentage(value.toNumber()))) {
    return NextResponse.json({ error: "El porcentaje debe estar entre 1 y 90" }, { status: 400 })
  }

  const promotion = await prisma.promotion.create({
    data: {
      providerId: session.user.id,
      listingId,
      type: parsed.data.type,
      name: parsed.data.name,
      code: normalizeCode(parsed.data.code),
      value,
      startsAt,
      endsAt,
      usageLimit: parsed.data.usageLimit ?? null,
      perUserLimit: parsed.data.perUserLimit ?? null,
      terms: parsed.data.terms ?? null,
    },
  })

  return NextResponse.json(promotion, { status: 201 })
}
