import { InquiryStatus, ListingStatus, ListingType, Prisma } from "@prisma/client"
import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getOpenProductInquiry, parseInquiryQuantity } from "@/lib/marketplace/product-inquiries"
import { logCommercialEvent } from "@/lib/commercial-events"

const schema = z.object({
  listingId: z.string().min(1),
  quantity: z.union([z.string(), z.number()]).transform((value) => parseInquiryQuantity(value)),
  requestedUnit: z.string().max(40).optional(),
  notes: z.string().max(1000).optional(),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const listing = await prisma.listing.findUnique({
    where: { id: parsed.data.listingId },
    include: { provider: true, product: true },
  })
  if (!listing || listing.type !== ListingType.PRODUCT || listing.status !== ListingStatus.PUBLISHED || !listing.product) {
    return NextResponse.json({ error: "Producto no disponible" }, { status: 404 })
  }

  const minOrder = listing.product.minimumOrder ? new Prisma.Decimal(listing.product.minimumOrder) : null
  if (minOrder && parsed.data.quantity.lessThan(minOrder)) {
    return NextResponse.json({ error: `La cantidad mínima es ${minOrder.toString()}` }, { status: 400 })
  }

  if (parsed.data.requestedUnit && parsed.data.requestedUnit !== listing.product.unit) {
    return NextResponse.json({ error: `La unidad debe ser ${listing.product.unit}` }, { status: 400 })
  }

  const existingDraft = await getOpenProductInquiry(session.user.id, listing.providerId)
  if (existingDraft && existingDraft.providerId !== listing.providerId && existingDraft.items.length > 0) {
    return NextResponse.json({ error: "Ya tenés una consulta abierta con otro proveedor" }, { status: 409 })
  }

  const inquiry = existingDraft || await prisma.productInquiry.create({
    data: {
      clientId: session.user.id,
      providerId: listing.providerId,
      status: InquiryStatus.DRAFT,
    },
    include: { items: true, quotes: true },
  })

  const item = await prisma.productInquiryItem.upsert({
    where: { inquiryId_listingId: { inquiryId: inquiry.id, listingId: listing.id } },
    create: {
      inquiryId: inquiry.id,
      listingId: listing.id,
      quantity: parsed.data.quantity,
      requestedUnit: parsed.data.requestedUnit || listing.product.unit,
      priceSnapshot: listing.price ?? null,
      titleSnapshot: listing.title,
      notes: parsed.data.notes || null,
    },
    update: {
      quantity: parsed.data.quantity,
      requestedUnit: parsed.data.requestedUnit || listing.product.unit,
      priceSnapshot: listing.price ?? null,
      titleSnapshot: listing.title,
      notes: parsed.data.notes || null,
    },
  })

  await logCommercialEvent({
    type: "QUOTE_REQUEST_CREATED",
    userId: session.user.id,
    sessionId: session.user.id,
    providerId: listing.providerId,
    listingId: listing.id,
    requestId: inquiry.id,
    metadata: { quantity: item.quantity.toString(), unit: item.requestedUnit },
  })

  return NextResponse.json({ inquiryId: inquiry.id, item }, { status: 201 })
}
