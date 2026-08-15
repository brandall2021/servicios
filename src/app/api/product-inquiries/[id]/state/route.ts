import { NextResponse } from "next/server"
import { InquiryStatus } from "@prisma/client"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface Props {
  params: Promise<{ id: string }>
}

const schema = z.object({
  action: z.enum(["ACCEPT", "REJECT", "CANCEL"]),
})

export async function POST(req: Request, { params }: Props) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const { id } = await params
  const inquiry = await prisma.productInquiry.findFirst({ where: { id, OR: [{ clientId: session.user.id }, { providerId: session.user.id }] } })
  if (!inquiry) return NextResponse.json({ error: "Consulta no encontrada" }, { status: 404 })

  const nextStatus = parsed.data.action === "ACCEPT" ? InquiryStatus.ACCEPTED : parsed.data.action === "REJECT" ? InquiryStatus.REJECTED : InquiryStatus.CANCELLED

  if (parsed.data.action === "ACCEPT" && inquiry.status !== InquiryStatus.RESPONDED) {
    return NextResponse.json({ error: "Solo podés aceptar una consulta respondida" }, { status: 409 })
  }

  const updated = await prisma.productInquiry.update({ where: { id }, data: { status: nextStatus } })
  return NextResponse.json(updated)
}
