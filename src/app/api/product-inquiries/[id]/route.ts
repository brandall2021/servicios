import { NextResponse } from "next/server"
import { InquiryStatus } from "@prisma/client"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface Props {
  params: Promise<{ id: string }>
}

const patchSchema = z.object({
  notes: z.string().max(2000).optional().nullable(),
  deliveryMethod: z.enum(["PICKUP", "DELIVERY", "BOTH"]).optional().nullable(),
  deliveryAddress: z.string().max(500).optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
})

export async function GET(_req: Request, { params }: Props) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const inquiry = await prisma.productInquiry.findFirst({
    where: { id, OR: [{ clientId: session.user.id }, { providerId: session.user.id }] },
    include: {
      client: { select: { id: true, name: true, image: true } },
      provider: { select: { id: true, name: true, image: true, whatsapp: true, website: true, verified: true } },
      items: { include: { listing: { include: { provider: true, category: true, product: true, media: { take: 1 } } } } },
      quotes: { orderBy: { version: "desc" }, include: { provider: { select: { id: true, name: true, image: true } } } },
    },
  })

  if (!inquiry) return NextResponse.json({ error: "Consulta no encontrada" }, { status: 404 })
  return NextResponse.json(inquiry)
}

export async function PATCH(req: Request, { params }: Props) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const inquiry = await prisma.productInquiry.findFirst({ where: { id, clientId: session.user.id } })
  if (!inquiry) return NextResponse.json({ error: "Consulta no encontrada" }, { status: 404 })
  if (inquiry.status !== InquiryStatus.DRAFT) return NextResponse.json({ error: "La consulta no puede editarse" }, { status: 409 })

  const parsed = patchSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const updated = await prisma.productInquiry.update({
    where: { id },
    data: {
      notes: parsed.data.notes ?? undefined,
      deliveryMethod: parsed.data.deliveryMethod ?? undefined,
      deliveryAddress: parsed.data.deliveryAddress ?? undefined,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
    },
  })

  return NextResponse.json(updated)
}
