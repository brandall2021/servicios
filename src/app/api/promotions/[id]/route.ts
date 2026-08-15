import { PromotionType, ListingStatus, Prisma } from "@prisma/client"
import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isValidPercentage, normalizeCode } from "@/lib/marketplace/promotions"

interface Props {
  params: Promise<{ id: string }>
}

const patchSchema = z.object({
  listingId: z.string().optional().nullable(),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "PROMOTIONAL_PRICE", "BENEFIT"]).optional(),
  name: z.string().min(1).max(120).optional(),
  code: z.string().max(40).optional().nullable(),
  value: z.union([z.string(), z.number()]).optional().nullable(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  usageLimit: z.number().int().positive().optional().nullable(),
  perUserLimit: z.number().int().positive().optional().nullable(),
  terms: z.string().max(2000).optional().nullable(),
  active: z.boolean().optional(),
})

export async function PATCH(req: Request, { params }: Props) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { id } = await params

  const promotion = await prisma.promotion.findFirst({ where: { id, providerId: session.user.id } })
  if (!promotion) return NextResponse.json({ error: "Promoción no encontrada" }, { status: 404 })

  const parsed = patchSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const nextListingId = parsed.data.listingId === undefined ? undefined : parsed.data.listingId || null
  if (nextListingId) {
    const listing = await prisma.listing.findFirst({ where: { id: nextListingId, providerId: session.user.id, status: ListingStatus.PUBLISHED } })
    if (!listing) return NextResponse.json({ error: "La publicación no está disponible" }, { status: 404 })
  }

  const nextType = parsed.data.type || promotion.type
  const nextValueInput = parsed.data.value === undefined ? promotion.value?.toString() ?? null : parsed.data.value
  let nextValue: Prisma.Decimal | null | undefined = undefined
  if (parsed.data.value !== undefined) {
    nextValue = nextValueInput === null || nextValueInput === "" ? null : new Prisma.Decimal(String(nextValueInput))
  }

  const nextStartsAt = parsed.data.startsAt ? new Date(parsed.data.startsAt) : promotion.startsAt
  const nextEndsAt = parsed.data.endsAt ? new Date(parsed.data.endsAt) : promotion.endsAt
  if (nextStartsAt >= nextEndsAt) return NextResponse.json({ error: "Fechas inválidas" }, { status: 400 })

  if (nextType === PromotionType.PERCENTAGE) {
    const percentage = (nextValue ?? promotion.value)?.toNumber?.() ?? null
    if (!percentage || !isValidPercentage(percentage)) {
      return NextResponse.json({ error: "El porcentaje debe estar entre 1 y 90" }, { status: 400 })
    }
  }

  const updated = await prisma.promotion.update({
    where: { id },
    data: {
      listingId: nextListingId === undefined ? undefined : nextListingId,
      type: parsed.data.type,
      name: parsed.data.name,
      code: parsed.data.code === undefined ? undefined : normalizeCode(parsed.data.code),
      value: nextValue,
      startsAt: parsed.data.startsAt ? nextStartsAt : undefined,
      endsAt: parsed.data.endsAt ? nextEndsAt : undefined,
      usageLimit: parsed.data.usageLimit,
      perUserLimit: parsed.data.perUserLimit,
      terms: parsed.data.terms,
      active: parsed.data.active,
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: Props) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { id } = await params

  const promotion = await prisma.promotion.findFirst({ where: { id, providerId: session.user.id } })
  if (!promotion) return NextResponse.json({ error: "Promoción no encontrada" }, { status: 404 })

  await prisma.promotion.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
