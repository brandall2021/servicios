import { NextResponse } from "next/server"
import { InquiryStatus, ListingStatus, ListingType } from "@prisma/client"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logCommercialEvent } from "@/lib/commercial-events"

interface Props {
  params: Promise<{ id: string }>
}

export async function POST(_req: Request, { params }: Props) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const inquiry = await prisma.productInquiry.findFirst({
    where: { id, clientId: session.user.id, status: InquiryStatus.DRAFT },
    include: { items: { include: { listing: { include: { product: true } } } } },
  })

  if (!inquiry) return NextResponse.json({ error: "Consulta no encontrada" }, { status: 404 })
  if (inquiry.items.length === 0) return NextResponse.json({ error: "Agregá al menos un producto" }, { status: 400 })

  for (const item of inquiry.items) {
    if (item.listing.type !== ListingType.PRODUCT || item.listing.status !== ListingStatus.PUBLISHED || !item.listing.product) {
      return NextResponse.json({ error: `El producto ${item.titleSnapshot} ya no está disponible` }, { status: 409 })
    }
  }

  const updated = await prisma.productInquiry.update({ where: { id }, data: { status: InquiryStatus.SENT } })
  await logCommercialEvent({
    type: "QUOTE_REQUEST_CREATED",
    userId: session.user.id,
    sessionId: session.user.id,
    providerId: inquiry.providerId,
    requestId: inquiry.id,
    metadata: { action: "send" },
  })

  return NextResponse.json(updated)
}
