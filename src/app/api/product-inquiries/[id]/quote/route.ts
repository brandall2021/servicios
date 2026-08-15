import { NextResponse } from "next/server"
import { InquiryStatus, Prisma } from "@prisma/client"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logCommercialEvent } from "@/lib/commercial-events"

interface Props {
  params: Promise<{ id: string }>
}

const schema = z.object({
  amount: z.number().positive(),
  breakdown: z.string().max(5000).optional(),
  conditions: z.string().max(5000).optional(),
  validUntil: z.string().datetime().optional().nullable(),
  estimatedReadyAt: z.string().datetime().optional().nullable(),
})

export async function POST(req: Request, { params }: Props) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const inquiry = await prisma.productInquiry.findFirst({ where: { id, providerId: session.user.id } })
  if (!inquiry) return NextResponse.json({ error: "Consulta no encontrada" }, { status: 404 })
  if (inquiry.status === InquiryStatus.CANCELLED || inquiry.status === InquiryStatus.REJECTED || inquiry.status === InquiryStatus.ACCEPTED) {
    return NextResponse.json({ error: "La consulta ya está cerrada" }, { status: 409 })
  }

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: "Monto inválido" }, { status: 400 })

  const last = await prisma.productInquiryQuote.findFirst({
    where: { inquiryId: id },
    orderBy: { version: "desc" },
    select: { version: true },
  })

  const quote = await prisma.productInquiryQuote.create({
    data: {
      inquiryId: id,
      providerId: session.user.id,
      version: (last?.version ?? 0) + 1,
      amount: new Prisma.Decimal(parsed.data.amount),
      breakdown: parsed.data.breakdown,
      conditions: parsed.data.conditions,
      validUntil: parsed.data.validUntil ? new Date(parsed.data.validUntil) : null,
      estimatedReadyAt: parsed.data.estimatedReadyAt ? new Date(parsed.data.estimatedReadyAt) : null,
    },
  })

  await prisma.productInquiry.update({ where: { id }, data: { status: InquiryStatus.RESPONDED } })
  await logCommercialEvent({
    type: "QUOTE_SENT",
    userId: session.user.id,
    sessionId: session.user.id,
    providerId: session.user.id,
    requestId: id,
    metadata: { amount: parsed.data.amount },
  })

  return NextResponse.json(quote, { status: 201 })
}
