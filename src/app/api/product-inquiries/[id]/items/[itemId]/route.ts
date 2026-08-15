import { NextResponse } from "next/server"
import { InquiryStatus, Prisma } from "@prisma/client"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface Props {
  params: Promise<{ id: string; itemId: string }>
}

const patchSchema = z.object({
  quantity: z.union([z.string(), z.number()]).optional(),
  requestedUnit: z.string().max(40).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
})

export async function PATCH(req: Request, { params }: Props) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id, itemId } = await params
  const inquiry = await prisma.productInquiry.findFirst({ where: { id, clientId: session.user.id, status: InquiryStatus.DRAFT } })
  if (!inquiry) return NextResponse.json({ error: "Consulta no encontrada" }, { status: 404 })

  const parsed = patchSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const item = await prisma.productInquiryItem.findFirst({ where: { id: itemId, inquiryId: id } })
  if (!item) return NextResponse.json({ error: "Ítem no encontrado" }, { status: 404 })

  const updated = await prisma.productInquiryItem.update({
    where: { id: itemId },
    data: {
      quantity: parsed.data.quantity !== undefined ? new Prisma.Decimal(String(parsed.data.quantity)) : undefined,
      requestedUnit: parsed.data.requestedUnit ?? undefined,
      notes: parsed.data.notes ?? undefined,
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: Props) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id, itemId } = await params
  const inquiry = await prisma.productInquiry.findFirst({ where: { id, clientId: session.user.id, status: InquiryStatus.DRAFT } })
  if (!inquiry) return NextResponse.json({ error: "Consulta no encontrada" }, { status: 404 })

  const item = await prisma.productInquiryItem.findFirst({ where: { id: itemId, inquiryId: id } })
  if (!item) return NextResponse.json({ error: "Ítem no encontrado" }, { status: 404 })

  await prisma.productInquiryItem.delete({ where: { id: itemId } })
  return NextResponse.json({ success: true })
}
